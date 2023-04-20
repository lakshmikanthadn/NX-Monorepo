"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationInterceptor = void 0;
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var InputValidator_1 = require("./InputValidator");
var APIResponse_1 = require("../../utils/APIResponse");
var log = LoggerUtil_1.default.getLogger('ValidatonInterceptor');
var ValidationInterceptor = /** @class */ (function () {
    function ValidationInterceptor() {
    }
    ValidationInterceptor.prototype.apiVersionAndResponseGroupValidator = function (request, response, next) {
        var apiVersion = request.body.apiVersion || request.query.apiVersion;
        var responseGroup = request.body.responseGroup || request.query.responseGroup;
        try {
            InputValidator_1.inputValidator.validateAPIVersionResponseGroup(apiVersion, responseGroup);
            next();
        }
        catch (error) {
            APIResponse_1.APIResponse.failure(response, error);
        }
    };
    return ValidationInterceptor;
}());
exports.validationInterceptor = new ValidationInterceptor();
