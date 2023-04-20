"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
var fs = require("fs");
var mongoose = require("mongoose");
var swaggerUi = require("swagger-ui-express");
var config_1 = require("../config/config");
var openApiV401 = require("../public/swagger/4.0.x.json");
var BaseRouter_1 = require("./BaseRouter");
var swaggerOptions = {
    defaultModelsExpandDepth: -1
};
var HealthRouter = /** @class */ (function (_super) {
    __extends(HealthRouter, _super);
    function HealthRouter() {
        return _super.call(this) || this;
    }
    HealthRouter.prototype.initRoutes = function () {
        var _this = this;
        this.router.get('/health', function (req, res) {
            if (mongoose.connection.readyState === 1) {
                res.send({
                    APPLICATION_STATUS: 'I am healthy.'
                });
            }
            else {
                res.status(503).send({
                    APPLICATION_STATUS: 'Unhealthy, not connected to Mongo DB.'
                });
            }
        });
        this.router.get('/products/health', function (req, res) {
            try {
                var rawAppManifestData = JSON.parse(fs.readFileSync('ApplicationManifest.json', 'utf8'));
                var appManifestData = {
                    APPLICATION_ENV: config_1.Config.getPropertyValue('envName'),
                    APPLICATION_NAME: rawAppManifestData.APPLICATION_NAME,
                    APPLICATION_STATUS: 'Healthy.',
                    APPLICATION_VERSION: rawAppManifestData.APPLICATION_VERSION,
                    BUILD_DATE_TIME: rawAppManifestData.BUILD_DATE_TIME,
                    MONGO_DB_STATUS: _this.getMongoDbStatus()
                };
                res.send(__assign({}, appManifestData));
            }
            catch (e) {
                res.send({
                    APPLICATION_STATUS: 'Healthy, but failed to get AppManifestData'
                });
            }
        });
        this.router.get('/products/swagger/4.0.1/json', function (req, res) {
            res.json(openApiV401);
        });
        this.router.use('/products/swagger/4.0.1', swaggerUi.serve, swaggerUi.setup(openApiV401, { swaggerOptions: swaggerOptions }));
    };
    HealthRouter.prototype.getMongoDbStatus = function () {
        var readyStateCode = mongoose.connection.readyState;
        var codeToTextMapper = {
            0: 'Disconnected',
            1: 'Connected',
            2: 'Connecting',
            3: 'Disconnecting'
        };
        var dbStatus = codeToTextMapper[readyStateCode];
        return dbStatus
            ? dbStatus
            : "Invalid status code from mongoose.connection.readyState: ".concat(readyStateCode);
    };
    return HealthRouter;
}(BaseRouter_1.BaseRouter));
exports.healthRouter = new HealthRouter();
