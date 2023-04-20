"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appLogger = void 0;
var rTracer = require("cls-rtracer");
var jwt_decode_1 = require("jwt-decode");
var _ = require("lodash");
var log4js = require("log4js");
var requestIp = require("request-ip");
var TokenDecoder_1 = require("../v4/utils/TokenDecoder");
var config_1 = require("../config/config");
var logger = log4js.getLogger('App');
/**
 * Configure the log4js.
 * 1
 */
var AppLogger = /** @class */ (function () {
    function AppLogger(appEnv) {
        this.configure(appEnv);
    }
    AppLogger.prototype.getLogger = function (loggerName) {
        return log4js.getLogger(loggerName);
    };
    /**
     * This will return a express middleware
     * Middleware Logs token details and the request details.
     *
     */
    AppLogger.prototype.getRequestInfoLogger = function () {
        var _this = this;
        return function (req, res, next) {
            var thiz = _this;
            // Express won't trigger the finish event if we don't use res.send method,
            // so using setTimeout method. if "finish" event is not fired we will log it after 30 sec.
            var timer = setTimeout(function () {
                thiz.logRequestInfo(req, res);
            }, 30 * 1000);
            res.on('finish', function () {
                clearTimeout(timer);
                thiz.logRequestInfo(req, res);
            });
            next();
        };
    };
    AppLogger.prototype.logRequestInfo = function (req, res) {
        var _a, _b, _c, _d;
        var decodedJwt = {};
        var authHeaderToken;
        try {
            authHeaderToken = _.get(req, 'headers.authorization', '').replace('idtoken ', '');
            decodedJwt = (0, jwt_decode_1.default)(authHeaderToken);
        }
        catch (e) {
            logger.debug('logRequestInfo Unable to decode auth header.');
        }
        var completePath = req.originalUrl.split('?')[0];
        // results first element as empty.
        var completePathSplitted = completePath.split('/');
        // remove the empty string
        completePathSplitted.shift();
        // Get the BasePath prepend with /.
        var basePath = '/' + completePathSplitted.shift();
        // Get the Path by join and prepend with /.
        var path = '/' + completePathSplitted.join('/');
        /**
         * Do not add any JSON properties to respLogData
         * stringify them before,
         * Else they will create too many index fields in ELK stack.
         */
        var headers = _.clone(req.headers);
        delete headers['authorization'];
        var requestData = {
            action: req.body.action || 'NA',
            apiVersion: req.query.apiVersion || req.body.apiVersion || '4.0.0',
            authToken: decodedJwt,
            basePath: basePath,
            body: JSON.stringify(req.body),
            headers: headers,
            ip: requestIp.getClientIp(req),
            method: req.method,
            // For service account organizationName is null so using partyId
            organizationName: new TokenDecoder_1.default(authHeaderToken).getTokenIdentity(),
            path: path,
            query: req.query,
            redirectingTo: res.getHeader('Location'),
            referrer: req.headers.referer || req.headers.referrer,
            remoteAddress: req.connection.remoteAddress || req.socket.remoteAddress,
            statusCode: res.statusCode,
            token: authHeaderToken,
            took: Number.parseFloat((_b = (_a = res.getHeader('X-Response-Time')) === null || _a === void 0 ? void 0 : _a.toString()) === null || _b === void 0 ? void 0 : _b.replace('ms', '')),
            userAgent: req.headers['user-agent'],
            username: ((_c = decodedJwt === null || decodedJwt === void 0 ? void 0 : decodedJwt.user) === null || _c === void 0 ? void 0 : _c.username) || ((_d = decodedJwt === null || decodedJwt === void 0 ? void 0 : decodedJwt.client) === null || _d === void 0 ? void 0 : _d.username)
        };
        logger.info("logRequestInfo request:".concat(JSON.stringify(requestData)));
    };
    AppLogger.prototype.configure = function (appEnv) {
        var logLayout = {
            pattern: '%d %p %c %x{reqId} %m%n',
            tokens: {
                reqId: function () {
                    // Return 00000000-0000-0000-0000-000000000000 as transaction id.
                    // Just a random UUID using this
                    return rTracer.id() || '00000000-0000-0000-0000-000000000000';
                }
            },
            type: 'pattern'
        };
        var LOG4JS_CONFIG = {
            appenders: {
                consoleAppender: {
                    layout: logLayout,
                    type: 'console'
                },
                fileAppender: {
                    // 100 MB
                    backups: 1,
                    compress: true,
                    filename: "".concat(config_1.Config.getPropertyValue('logPath'), "/app.log"),
                    layout: logLayout,
                    maxLogSize: 100 * 1024 * 1024,
                    type: 'file'
                }
            },
            categories: {
                default: {
                    appenders: ['fileAppender'],
                    level: 'info'
                }
            }
        };
        // For better performance, disable console logs in PROD.
        if (['local', 'test'].includes(appEnv)) {
            LOG4JS_CONFIG.categories.default.level = 'info';
            LOG4JS_CONFIG.categories.default.appenders = ['consoleAppender'];
        }
        log4js.configure(LOG4JS_CONFIG);
    };
    return AppLogger;
}());
exports.appLogger = new AppLogger(process.env.NODE_ENV);
