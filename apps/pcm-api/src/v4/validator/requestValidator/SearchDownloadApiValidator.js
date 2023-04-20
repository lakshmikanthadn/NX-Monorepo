"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchDownloadValidator = void 0;
var LoggerUtil_1 = require("../../../utils/LoggerUtil");
var AppError_1 = require("../../../model/AppError");
var CommonValidator_1 = require("./CommonValidator");
var log = LoggerUtil_1.default.getLogger('CommonValidator');
var SearchDownloadValidator = /** @class */ (function () {
    function SearchDownloadValidator() {
    }
    SearchDownloadValidator.prototype.validateSearchDownloadRequest = function (request) {
        log.debug('searchResultRequest:: ', { action: request['action'] });
        var validationErrors = [];
        // validate params
        var _id = request._id, action = request.action, apiVersion = request.apiVersion, rulesList = request.rulesList, recipients = request.recipients, fileName = request.fileName, availability = request.availability, restOfBody = __rest(request, ["_id", "action", "apiVersion", "rulesList", "recipients", "fileName", "availability"]);
        var invalidBodyParams = Object.keys(restOfBody);
        if (invalidBodyParams.length > 0) {
            validationErrors.push("Invalid parameters: ".concat(invalidBodyParams.join()));
        }
        // validate availability
        var invalidAvblParams;
        if (availability) {
            var name_1 = availability.name, status_1 = availability.status, restOfAvailability = __rest(availability, ["name", "status"]);
            if (this.isNameDoesntExists(name_1, status_1)) {
                validationErrors.push('Missing availability.name in the request parameters.');
            }
            invalidAvblParams = Object.keys(restOfAvailability);
            if (invalidAvblParams.length > 0) {
                validationErrors.push("Invalid parameters: availability " + "".concat(invalidAvblParams.join()));
            }
        }
        if (!recipients) {
            validationErrors.push('Missing field recipients in request payload');
        }
        else {
            var recipientsEmailTo = recipients.to;
            var recipientsEmailCC = recipients.cc;
            if (!recipientsEmailTo) {
                validationErrors.push('Invalid recipients');
            }
            else if (this.hasNoRecipientEmailTo(recipientsEmailTo)) {
                validationErrors.push('At least one email is required for recipients');
            }
            else {
                recipientsEmailTo.forEach(function (email) {
                    validationErrors.push.apply(validationErrors, CommonValidator_1.commonValidator.validateEmail(email));
                });
                if (this.isEmailCCAnArrayAndExists(recipientsEmailCC)) {
                    recipientsEmailCC.forEach(function (email) {
                        validationErrors.push.apply(validationErrors, CommonValidator_1.commonValidator.validateEmail(email));
                    });
                }
            }
        }
        if (!fileName) {
            validationErrors.push('Missing field fileName in request payload');
        }
        if (!rulesList) {
            validationErrors.push('Invalid rulesList');
        }
        else {
            validationErrors.push.apply(validationErrors, CommonValidator_1.commonValidator.validateSearchQuery(rulesList));
        }
        if (validationErrors.length > 0) {
            throw new AppError_1.AppError('Validation error', 400, validationErrors.map(function (msg) {
                return {
                    code: 400,
                    dataPath: '',
                    description: msg
                };
            }));
        }
        return true;
    };
    SearchDownloadValidator.prototype.isNameDoesntExists = function (name, status) {
        return !name && status;
    };
    SearchDownloadValidator.prototype.hasNoRecipientEmailTo = function (recipientsEmailTo) {
        return Array.isArray(recipientsEmailTo) && recipientsEmailTo.length === 0;
    };
    SearchDownloadValidator.prototype.isEmailCCAnArrayAndExists = function (recipientsEmailCC) {
        return (recipientsEmailCC &&
            Array.isArray(recipientsEmailCC) &&
            recipientsEmailCC.length > 0);
    };
    return SearchDownloadValidator;
}());
exports.searchDownloadValidator = new SearchDownloadValidator();
