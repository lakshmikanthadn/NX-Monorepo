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
exports.queryAPIValidator = void 0;
var LoggerUtil_1 = require("../../../utils/LoggerUtil");
var config_1 = require("../../../config/config");
var AppError_1 = require("../../../model/AppError");
var CommonValidator_1 = require("./CommonValidator");
var log = LoggerUtil_1.default.getLogger('QueryValidator');
var featureToggles = config_1.Config.getPropertyValue('featureToggles');
var QueryAPIValidator = /** @class */ (function () {
    function QueryAPIValidator() {
    }
    QueryAPIValidator.prototype.validateSearch = function (req) {
        log.debug('validateSearch::', req.body);
        var validationErrors = [];
        var searchPayload = req.body;
        if (!searchPayload) {
            throw new AppError_1.AppError("Invalid parameters in search query", 400);
        }
        var action = searchPayload.action, apiVersion = searchPayload.apiVersion, offset = searchPayload.offset, limit = searchPayload.limit, rulesList = searchPayload.rulesList, hasTotalPrices = searchPayload.hasTotalPrices, hasCounts = searchPayload.hasCounts, availability = searchPayload.availability, offsetCursor = searchPayload.offsetCursor, restOfBody = __rest(searchPayload, ["action", "apiVersion", "offset", "limit", "rulesList", "hasTotalPrices", "hasCounts", "availability", "offsetCursor"]);
        if (this.isOffsetAndCursorExists(offset, offsetCursor)) {
            validationErrors.push('Offset parameter is not supported when using the offsetCursor parameter.');
        }
        var invalidBodyParams = Object.keys(restOfBody);
        var invalidAvblParams;
        if (Array.isArray(availability)) {
            validationErrors.push.apply(validationErrors, CommonValidator_1.commonValidator.validateAvailability(availability));
        }
        else {
            var _a = availability || {}, name_1 = _a.name, status_1 = _a.status, restOfAvailability = __rest(_a, ["name", "status"]);
            if (!name_1 && status_1) {
                validationErrors.push('Missing availability.name in the request parameters.');
            }
            invalidAvblParams = Object.keys(restOfAvailability);
            if (invalidAvblParams.length > 0) {
                validationErrors.push("Invalid parameters: availability " + "".concat(invalidAvblParams.join()));
            }
        }
        if (invalidBodyParams.length > 0) {
            validationErrors.push("Invalid parameters: ".concat(invalidBodyParams.join()));
        }
        // Validate hasTotalPrices value`
        if (this.isInvalidHasTotalPricesValue(hasTotalPrices)) {
            validationErrors.push("Invalid hasTotalPrices value: ".concat(hasTotalPrices));
        }
        if (this.isInvalidHasTotalCount(hasCounts)) {
            validationErrors.push("Invalid hasCounts value: ".concat(hasCounts));
        }
        if (this.isInvalidHasRulesList(rulesList)) {
            validationErrors.push('Invalid rulesList: only one rule is allowed.');
        }
        else {
            validationErrors.push.apply(validationErrors, CommonValidator_1.commonValidator.validateSearchQuery(rulesList, null, availability));
        }
        validationErrors.push.apply(validationErrors, CommonValidator_1.commonValidator.validateOffsetLimit(offset, limit, true));
        if (offsetCursor) {
            validationErrors.push.apply(validationErrors, CommonValidator_1.commonValidator.validateOffsetCursor(offsetCursor));
        }
        if (validationErrors.length > 0) {
            throw new AppError_1.AppError(validationErrors.join(' and '), 400);
        }
        return true;
    };
    QueryAPIValidator.prototype.isOffsetAndCursorExists = function (offset, offsetCursor) {
        return offsetCursor && offset && offset !== 0;
    };
    QueryAPIValidator.prototype.isInvalidHasTotalPricesValue = function (hasTotalPrices) {
        return hasTotalPrices && ![true, false].includes(hasTotalPrices);
    };
    QueryAPIValidator.prototype.isInvalidHasTotalCount = function (hasCounts) {
        return hasCounts && ![true, false].includes(hasCounts);
    };
    QueryAPIValidator.prototype.isInvalidHasRulesList = function (rulesList) {
        return rulesList && rulesList.length > 1;
    };
    return QueryAPIValidator;
}());
exports.queryAPIValidator = new QueryAPIValidator();
