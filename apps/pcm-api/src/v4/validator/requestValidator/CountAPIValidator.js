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
exports.countAPIValidator = void 0;
var LoggerUtil_1 = require("../../../utils/LoggerUtil");
var config_1 = require("../../../config/config");
var AppError_1 = require("../../../model/AppError");
var CommonValidator_1 = require("./CommonValidator");
var log = LoggerUtil_1.default.getLogger('CommonValidator');
var featureToggles = config_1.Config.getPropertyValue('featureToggles');
var CountAPIValidator = /** @class */ (function () {
    function CountAPIValidator() {
    }
    /**
     * This method will returns true if everything is valid,
     * else throws APP Error error.
     * @param req Request
     */
    CountAPIValidator.prototype.validateCountApi = function (req) {
        log.debug('validateCountApi', { reqBody: req.body });
        var validationErrors = [];
        var _a = req.body, apiVersion = _a.apiVersion, action = _a.action, availability = _a.availability, rulesList = _a.rulesList, hasCounts = _a.hasCounts, hasTotalPrices = _a.hasTotalPrices, restOfBody = __rest(_a, ["apiVersion", "action", "availability", "rulesList", "hasCounts", "hasTotalPrices"]);
        var invalidBodyParams = Object.keys(restOfBody);
        var invalidAvblParams;
        if (Array.isArray(availability)) {
            validationErrors.push.apply(validationErrors, CommonValidator_1.commonValidator.validateAvailability(availability));
        }
        else {
            var _b = availability || {}, name_1 = _b.name, status_1 = _b.status, restOfAvailability = __rest(_b, ["name", "status"]);
            invalidAvblParams = Object.keys(restOfAvailability);
            if (invalidAvblParams.length > 0) {
                validationErrors.push("Invalid parameters: availability ".concat(invalidAvblParams.join()));
            }
        }
        if (invalidBodyParams.length > 0) {
            validationErrors.push("Invalid parameters: ".concat(invalidBodyParams.join()));
        }
        if (hasCounts && typeof hasCounts !== 'boolean') {
            validationErrors.push("Invalid hasCounts value: ".concat(hasCounts));
        }
        if (hasTotalPrices && typeof hasTotalPrices !== 'boolean') {
            validationErrors.push("Invalid hasTotalPrices value: ".concat(hasTotalPrices));
        }
        validationErrors.push.apply(validationErrors, CommonValidator_1.commonValidator.validateSearchQuery(rulesList));
        if (validationErrors.length > 0) {
            throw new AppError_1.AppError(validationErrors.join(' and '), 400);
        }
        return true;
    };
    return CountAPIValidator;
}());
exports.countAPIValidator = new CountAPIValidator();
