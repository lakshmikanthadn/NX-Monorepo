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
exports.validateAPIValidator = void 0;
var constant_1 = require("../../../config/constant");
var AppError_1 = require("../../../model/AppError");
var ValidateAPIValidator = /** @class */ (function () {
    function ValidateAPIValidator() {
        this.whitelistedIdentifiers = [
            '_id',
            'identifiers.isbn',
            'identifiers.doi'
        ];
        this.whiteListedOperatorForIds = ['IN', 'EQ'];
        this.maximumIdsAllowed = 100;
    }
    ValidateAPIValidator.prototype.validateValidationApi = function (req) {
        var validationErrors = [];
        var _a = req.body, apiVersion = _a.apiVersion, action = _a.action, availability = _a.availability, rulesList = _a.rulesList, hasCounts = _a.hasCounts, restOfBody = __rest(_a, ["apiVersion", "action", "availability", "rulesList", "hasCounts"]);
        if (!availability || !availability.name) {
            validationErrors.push("Availability name is mandatory");
        }
        var _b = availability || {}, name = _b.name, restOfAvailability = __rest(_b, ["name"]);
        var invalidBodyParams = Object.keys(restOfBody);
        var invalidAvblParams = Object.keys(restOfAvailability);
        if (invalidBodyParams.length > 0) {
            validationErrors.push("Invalid parameters: ".concat(invalidBodyParams.join()));
        }
        if (invalidAvblParams.length > 0) {
            validationErrors.push("Invalid parameters: availability ".concat(invalidAvblParams.join()));
        }
        if (hasCounts && typeof hasCounts !== 'boolean') {
            validationErrors.push("Invalid hasCounts value: ".concat(hasCounts));
        }
        validationErrors = [].concat(validationErrors, this.validateAndGetRulesListErrors(rulesList));
        if (validationErrors.length > 0) {
            throw new AppError_1.AppError(validationErrors.join(' and '), 400);
        }
        return true;
    };
    // This method returns error messages as a strings.
    ValidateAPIValidator.prototype.validateAndGetRulesListErrors = function (rulesList) {
        var _this = this;
        // Validate if the rulesList is array
        if (this.isRulesListNotExists(rulesList)) {
            return ['Invalid or missing rulesList.'];
        }
        if (rulesList.length > 1) {
            return ['We support only one rule inside the rulesList'];
        }
        var validationErrors = [];
        var totalIdentifiers = 0;
        // Commenting this as we support only one rule in the request.
        // const uniqueProductTypes = new Set();
        // Validate rules for valid productTypes
        rulesList.forEach(function (sQuery) {
            var currQueryHasIdentifer = false;
            // Get unique product types for validation.
            if (sQuery.type && !constant_1.AppConstants.ProductTypesV4.includes(sQuery.type)) {
                validationErrors.push("Invalid product type : ".concat(sQuery.type));
            }
            // Commenting this as we support only one rule in the request.
            // uniqueProductTypes.add(sQuery.type);
            // validate if the attributes is a valid array.
            if (!Array.isArray(sQuery.attributes)) {
                validationErrors.push("Invalid/Missing attributes in the rulesList of ".concat(sQuery.type));
            }
            if (sQuery.rules) {
                sQuery.rules.forEach(function (sQRule) {
                    // Validate each rule
                    var isLogical = sQRule.type === 'logical';
                    var isCriteria = sQRule.type === 'criteria';
                    var rule = sQRule.rule ? sQRule.rule : {};
                    var currCriteriaHasIdentifier = _this.whitelistedIdentifiers.includes(rule.attribute);
                    var currCriteriaHasValidOperator = _this.whiteListedOperatorForIds.includes(rule.relationship);
                    if (isLogical && rule.value !== 'AND') {
                        validationErrors.push("Invalid logical operator for ".concat(sQuery.type, " ") +
                            "at position ".concat(sQRule.position, ", only AND is allowed"));
                    }
                    if (_this.isCriteriaExists(isCriteria, currCriteriaHasIdentifier)) {
                        currQueryHasIdentifer = true;
                        totalIdentifiers += rule.values ? rule.values.length : 1;
                    }
                    if (_this.isCriteriaValid(isCriteria, currCriteriaHasIdentifier, currCriteriaHasValidOperator)) {
                        validationErrors.push('Restricted Operator in criteria for ' +
                            "".concat(rule.attribute, " at position ").concat(sQRule.position, ", ") +
                            "only ".concat(_this.whiteListedOperatorForIds.join(), " are allowed"));
                    }
                });
            }
            if (!currQueryHasIdentifer) {
                validationErrors.push("Missing identifier in Query for ".concat(sQuery.type, ", ") +
                    "atleast one of ".concat(_this.whitelistedIdentifiers.join(), " is required."));
            }
        });
        // Validate rules for duplicate type
        if (totalIdentifiers > this.maximumIdsAllowed) {
            validationErrors.push("Only ".concat(this.maximumIdsAllowed, " identifiers are allowed."));
        }
        // Commenting this as we support only one rule in the request.
        // if (uniqueProductTypes.size !== rulesList.length) {
        //   validationErrors.push('Multiple rules for same product type');
        // }
        return validationErrors;
    };
    ValidateAPIValidator.prototype.isCriteriaValid = function (isCriteria, currCriteriaHasIdentifier, currCriteriaHasValidOperator) {
        return (isCriteria && currCriteriaHasIdentifier && !currCriteriaHasValidOperator);
    };
    ValidateAPIValidator.prototype.isCriteriaExists = function (isCriteria, currCriteriaHasIdentifier) {
        return isCriteria && currCriteriaHasIdentifier;
    };
    ValidateAPIValidator.prototype.isRulesListNotExists = function (rulesList) {
        return !rulesList || !Array.isArray(rulesList) || rulesList.length <= 0;
    };
    return ValidateAPIValidator;
}());
exports.validateAPIValidator = new ValidateAPIValidator();
