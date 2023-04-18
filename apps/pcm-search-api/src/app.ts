const appEnv: string = process.env.NODE_ENV || 'dev';

process.env.NEW_RELIC_APP_NAME = `pcm-search-api-${appEnv}`;
// newrelic integration
if (['prod'].includes(appEnv)) {
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
import express from 'express';
import * as responseTime from 'response-time';

import { Config } from './config/config';
import { healthRouter } from './router/HealthRouter';
import { searchRouter } from './router/SearchRouter';
import { appLogger } from './utils/AppLoggerUtil';

const logger = appLogger.getLogger('App');

export default class App {
  public app: express.Application;
  private productsBasePath = '/products';
  constructor() {
    this.app = express();
    this.configAppMiddleWares();
    this.setHealthRoutes();
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
    this.app.use(appLogger.getRequestInfoLogger());
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
    const searchRoutes = searchRouter.getRoutes();
    // All the routes which needs authentication should go below this Interceptor.
    // Enable authentication here.
    const authURL = Config.getPropertyValue('authUrl');
    this.app.use(new Interceptor(authURL).intercept);
    this.app.use(this.productsBasePath, searchRoutes);
  }
}
