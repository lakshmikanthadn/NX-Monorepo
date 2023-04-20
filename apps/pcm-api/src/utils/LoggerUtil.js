"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log4js = require("log4js");
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.getLogger = function (className) {
        if (!this.loggers[className]) {
            var logger = log4js.getLogger(className);
            this.loggers[className] = logger;
        }
        return this.loggers[className];
    };
    Logger.handleErrorLog = function (log, methodName, error) {
        if (error.name === 'AppError') {
            log.warn(methodName, error);
        }
        else {
            log.error(methodName, error);
        }
    };
    Logger.loggers = {};
    return Logger;
}());
exports.default = Logger;
