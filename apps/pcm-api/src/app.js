"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var appEnv = process.env.NODE_ENV || 'dev';
process.env.NEW_RELIC_APP_NAME = "product-store-api-".concat(appEnv);
// newrelic integration
if (['prod', 'uat'].includes(appEnv)) {
    process.env.NEW_RELIC_ENABLED = true;
}
else {
    process.env.NEW_RELIC_ENABLED = false;
}
// Import newrelic only after setting NEW_RELIC_ENABLED & NEW_RELIC_APP_NAME env variables
var newrelic = require("newrelic");
// import * as toobusy from 'toobusy-js';
var Interceptor = require("@tandfgroup/authorization-interceptor");
var bodyParser = require("body-parser");
var rTracer = require("cls-rtracer");
var cors = require("cors");
var express_1 = require("express");
var path = require("path");
var responseTime = require("response-time");
var config_1 = require("./config/config");
var ContentProxyV2Router_1 = require("./router/ContentProxyV2Router");
var ContentRouter_1 = require("./router/ContentRouter");
var HealthRouter_1 = require("./router/HealthRouter");
var InternalRouter_1 = require("./router/InternalRouter");
var ProductRouter_1 = require("./router/ProductRouter");
var TaxonomyRouter_1 = require("./router/TaxonomyRouter");
var AppLoggerUtil_1 = require("./utils/AppLoggerUtil");
var ValidationInterceptor_1 = require("./v4/validator/ValidationInterceptor");
var pcm_content_proxy_api_handler_1 = require("@tandfgroup/pcm-content-proxy-api-handler");
var ContentProxyRouter_1 = require("./router/ContentProxyRouter");
var Express_Util_1 = require("./utils/Express.Util");
var logger = AppLoggerUtil_1.appLogger.getLogger('App');
var App = /** @class */ (function () {
    function App(secretData) {
        this.productsBasePath = '/products';
        this.contentBasePath = '/content';
        this.taxonomyBasePath = '/taxonomy';
        this.secretData = secretData;
        this.app = (0, express_1.default)();
        this.configAppMiddleWares();
        this.setHealthRoutes();
        this.setContentProxyRoutes();
        this.setApplicationRoutes();
        // log uncaught exception for debugging
        process
            .on('unhandledRejection', function (err) {
            logger.error('There was an unhandled error', err);
        })
            .on('uncaughtException', function (err) {
            logger.error('There was an uncaught error', err);
        });
    }
    /**
     * All the Application middle-wares required before initializing
     * the application routes should be configured here.
     */
    App.prototype.configAppMiddleWares = function () {
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
        this.app.use(bodyParser.json({
            limit: config_1.Config.getPropertyValue('requestBodySizeLimit')
        }));
        // support application/x-www-form-urlencoded post data
        this.app.use(bodyParser.urlencoded({
            extended: false,
            limit: config_1.Config.getPropertyValue('requestBodySizeLimit')
        }));
        // To add the request transaction id.
        this.app.use('/', rTracer.expressMiddleware({
            headerName: 'x-request-id',
            useHeader: true
        }));
        /**
         * Exclude content proxy API req logging in the common middleware.
         * Bcz we will not have any token associated in the request
         * token will be generated in the router.
         */
        this.app.use((0, Express_Util_1.unless)(AppLoggerUtil_1.appLogger.getRequestInfoLogger(), this.contentBasePath + '/:productType/:categoryType/download'));
        // Add the apiVersion number to newrelic traces.
        this.app.use(function (req, res, next) {
            var xTransactionId = rTracer.id();
            if (xTransactionId) {
                res.set('x-transaction-id', xTransactionId.toString());
            }
            newrelic.addCustomAttribute('x-transaction-id', xTransactionId);
            next();
        });
    };
    App.prototype.setHealthRoutes = function () {
        var healthRoutes = HealthRouter_1.healthRouter.getRoutes();
        this.app.use(healthRoutes);
    };
    App.prototype.setApplicationRoutes = function () {
        var productRoutes = ProductRouter_1.productRouter.getRoutes();
        var contentRoutes = ContentRouter_1.contentRouter.getRoutes();
        var internalRouters = InternalRouter_1.internalRouter.getRoutes();
        var taxonomyRouters = TaxonomyRouter_1.taxonomyRouter.getRoutes();
        // All the routes which needs authentication should go below this Interceptor.
        // Enable authentication here.
        var authURL = config_1.Config.getPropertyValue('authUrl');
        this.app.use(this.productsBasePath + '/static', express_1.default.static(path.join(__dirname, 'public')));
        this.app.use(new Interceptor(authURL).intercept);
        this.app.use(ValidationInterceptor_1.validationInterceptor.apiVersionAndResponseGroupValidator);
        this.app.use(this.productsBasePath, productRoutes);
        this.app.use(this.contentBasePath, contentRoutes);
        this.app.use(this.taxonomyBasePath, taxonomyRouters);
        this.app.use('/internal' + this.productsBasePath, internalRouters);
    };
    App.prototype.setContentProxyRoutes = function () {
        var contentProxyV2Routes = ContentProxyV2Router_1.contentProxyV2Router.getRoutes();
        this.app.use(this.contentBasePath + '/proxyv2', contentProxyV2Routes);
        var contentProxyHandler = new pcm_content_proxy_api_handler_1.ContentProxyHandler({
            authTokenAPIUrl: config_1.Config.getPropertyValue('authUrl') + '/user/auth/token',
            botOrgName: config_1.Config.getPropertyValue('googleBotOrganizationName'),
            clientID: this.secretData.clientId,
            clientSecret: this.secretData.clientSecret,
            propertiesAPIUrl: config_1.Config.getPropertyValue('propertiesAPIUrl')
        });
        var contentProxyRouter = new ContentProxyRouter_1.default(contentProxyHandler);
        this.app.use(this.contentBasePath, contentProxyRouter.getRoutes());
    };
    return App;
}());
exports.default = App;
