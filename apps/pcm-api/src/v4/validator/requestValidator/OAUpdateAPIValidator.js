"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oaUpdateAPIValidator = void 0;
var LoggerUtil_1 = require("../../../utils/LoggerUtil");
var OAUpdateWrapper_1 = require("../../model/interfaces/OAUpdateWrapper");
var log = LoggerUtil_1.default.getLogger('OAUpdateAPIValidator');
var OAUpdateAPIValidator = /** @class */ (function () {
    function OAUpdateAPIValidator() {
    }
    OAUpdateAPIValidator.prototype.validateOAUpdateRequest = function (request) {
        var appName = request.appName, requestId = request.requestId, callBackurl = request.callBackurl;
        var validationErrors = [];
        if (!appName || appName !== 'OMS') {
            validationErrors.push(new OAUpdateWrapper_1.OaValidationError('invalid app name'));
        }
        if (!requestId) {
            validationErrors.push(new OAUpdateWrapper_1.OaValidationError('invalid requestId'));
        }
        try {
            var validUrl = new URL(callBackurl);
            log.info("".concat(validUrl, " is valid"));
        }
        catch (error) {
            log.warn("".concat(error.input, " is not a valid url"));
            validationErrors.push(new OAUpdateWrapper_1.OaValidationError('invalid callBackurl'));
        }
        return validationErrors;
    };
    return OAUpdateAPIValidator;
}());
exports.oaUpdateAPIValidator = new OAUpdateAPIValidator();
