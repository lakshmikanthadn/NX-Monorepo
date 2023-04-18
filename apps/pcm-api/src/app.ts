const appEnv: string = process.env.NODE_ENV || 'dev';

process.env.NEW_RELIC_APP_NAME = `product-store-api-${appEnv}`;
// newrelic integration
if (['prod', 'uat'].includes(appEnv)) {
  process.env.NEW_RELIC_ENABLED = true as any;
} else {
  process.env.NEW_RELIC_ENABLED = false as any;
}
// Import newrelic only after setting NEW_RELIC_ENABLED & NEW_RELIC_APP_NAME env variables
import * as newrelic from 'newrelic';
// import * as toobusy from 'toobusy-js';

import * as Interceptor from '@tandfgroup/authorization-interceptor';
import * as bodyParser from 'body-parser';
import * as rTracer from 'cls-rtracer';
import * as cors from 'cors';
import * as express from 'express';
import * as path from 'path';
import * as responseTime from 'response-time';

import { Config } from './config/config';
import { contentProxyV2Router } from './router/ContentProxyV2Router';
import { contentRouter } from './router/ContentRouter';
import { healthRouter } from './router/HealthRouter';
import { internalRouter } from './router/InternalRouter';
import { productRouter } from './router/ProductRouter';
import { taxonomyRouter } from './router/TaxonomyRouter';
import { appLogger } from './utils/AppLoggerUtil';
import { ISecretData } from './v4/model/interfaces/SecretData';
import { validationInterceptor } from './v4/validator/ValidationInterceptor';

import { ContentProxyHandler } from '@tandfgroup/pcm-content-proxy-api-handler';
import ContentProxyRouter from './router/ContentProxyRouter';
import { unless } from './utils/Express.Util';

const logger = appLogger.getLogger('App');

export default class App {
  public app: express.Application;
  private secretData: ISecretData;
  private productsBasePath = '/products';
  private contentBasePath = '/content';
  private taxonomyBasePath = '/taxonomy';
  constructor(secretData: ISecretData) {
    this.secretData = secretData;
    this.app = express();
    this.configAppMiddleWares();
    this.setHealthRoutes();
    this.setContentProxyRoutes();
    this.setApplicationRoutes();

    // log uncaught exception for debugging
    process
      .on('unhandledRejection', (err) => {
        logger.error('There was an unhandled error', err);
      })
      .on('uncaughtException', (err) => {
        logger.error('There was an uncaught error', err);
      });
  }
  /**
   * All the Application middle-wares required before initializing
   * the application routes should be configured here.
   */
  private configAppMiddleWares(): void {
    /**
     * Check if the Server is busy before anything.
     * Reply with retry message, if busy.
     */
    // this.app.use((req, res, next) => {
    //     if (toobusy()) {
    //         res.status(503);
    //         res.send('Server is too busy right now. Please retry after sometime.');
    //     } else {
    //       next();
    //     }
    //   });
    this.app.use(responseTime());
    // TODO: remove this, once we start handling CORs in the API gateway.
    this.app.use(cors());
    // support application/json type post data
    this.app.use(
      bodyParser.json({
        limit: Config.getPropertyValue('requestBodySizeLimit')
      })
    );
    // support application/x-www-form-urlencoded post data
    this.app.use(
      bodyParser.urlencoded({
        extended: false,
        limit: Config.getPropertyValue('requestBodySizeLimit')
      })
    );
    // To add the request transaction id.
    this.app.use(
      '/',
      rTracer.expressMiddleware({
        headerName: 'x-request-id',
        useHeader: true
      })
    );

    /**
     * Exclude content proxy API req logging in the common middleware.
     * Bcz we will not have any token associated in the request
     * token will be generated in the router.
     */
    this.app.use(
      unless(
        appLogger.getRequestInfoLogger(),
        this.contentBasePath + '/:productType/:categoryType/download'
      )
    );
    // Add the apiVersion number to newrelic traces.
    this.app.use((req, res, next) => {
      const xTransactionId = rTracer.id();
      if (xTransactionId) {
        res.set('x-transaction-id', xTransactionId.toString());
      }
      newrelic.addCustomAttribute('x-transaction-id', xTransactionId);
      next();
    });
  }

  private setHealthRoutes(): void {
    const healthRoutes = healthRouter.getRoutes();
    this.app.use(healthRoutes);
  }

  private setApplicationRoutes(): void {
    const productRoutes = productRouter.getRoutes();
    const contentRoutes = contentRouter.getRoutes();
    const internalRouters = internalRouter.getRoutes();
    const taxonomyRouters = taxonomyRouter.getRoutes();
    // All the routes which needs authentication should go below this Interceptor.
    // Enable authentication here.
    const authURL = Config.getPropertyValue('authUrl');
    this.app.use(
      this.productsBasePath + '/static',
      express.static(path.join(__dirname, 'public'))
    );
    this.app.use(new Interceptor(authURL).intercept);
    this.app.use(validationInterceptor.apiVersionAndResponseGroupValidator);
    this.app.use(this.productsBasePath, productRoutes);
    this.app.use(this.contentBasePath, contentRoutes);
    this.app.use(this.taxonomyBasePath, taxonomyRouters);
    this.app.use('/internal' + this.productsBasePath, internalRouters);
  }

  private setContentProxyRoutes(): void {
    const contentProxyV2Routes = contentProxyV2Router.getRoutes();
    this.app.use(this.contentBasePath + '/proxyv2', contentProxyV2Routes);
    const contentProxyHandler = new ContentProxyHandler({
      authTokenAPIUrl: Config.getPropertyValue('authUrl') + '/user/auth/token',
      botOrgName: Config.getPropertyValue('googleBotOrganizationName'),
      clientID: this.secretData.clientId,
      clientSecret: this.secretData.clientSecret,
      propertiesAPIUrl: Config.getPropertyValue('propertiesAPIUrl')
    });
    const contentProxyRouter = new ContentProxyRouter(contentProxyHandler);
    this.app.use(this.contentBasePath, contentProxyRouter.getRoutes());
  }
}
