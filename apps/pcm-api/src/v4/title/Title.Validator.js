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
exports.titleValidator = void 0;
var AppError_1 = require("../../model/AppError");
var TitleValidator = /** @class */ (function () {
    function TitleValidator() {
        this.fetchVariantWhiteListedIds = ['isbn', 'isbn10'];
    }
    /**
     * All the validators either return true or throw APP Error.
     * Make sure to put them inside a try catch and handle the error.
     */
    TitleValidator.prototype.fetchVariantRequestValidator = function (request) {
        var _this = this;
        var _a = request.body, action = _a.action, apiVersion = _a.apiVersion, formats = _a.formats, identifiers = _a.identifiers, _b = _a.includeEditions, includeEditions = _b === void 0 ? false : _b, restOfBody = __rest(_a, ["action", "apiVersion", "formats", "identifiers", "includeEditions"]);
        var validationErrors = [];
        var invalidBodyParams = Object.keys(restOfBody);
        if (invalidBodyParams.length > 0) {
            validationErrors.push("unexpected parameters: ".concat(invalidBodyParams.join()));
        }
        if (this.isInvalidIdentifier(identifiers)) {
            validationErrors.push("invalid/missing identifiers");
        }
        else {
            identifiers.forEach(function (idObject) {
                var isValidIdName = idObject.name &&
                    _this.fetchVariantWhiteListedIds.includes(idObject.name);
                var isValidIdValues = idObject.values && Array.isArray(idObject.values);
                if (!isValidIdName) {
                    validationErrors.push("invalid/missing identifier name");
                }
                if (!isValidIdValues) {
                    validationErrors.push("invalid/missing identifier values");
                }
                else if (idObject.values.length === 0 ||
                    idObject.values.length > 100) {
                    validationErrors.push("request should have min 1 and max 100 identifiers");
                }
            });
        }
        if (identifiers && identifiers.length > 1) {
            validationErrors.push("currently we support one identifier(object) in identifiers");
        }
        if (this.isInvalidFormats(formats)) {
            validationErrors.push("invalid \"formats\" filter");
        }
        if (![true, false].includes(includeEditions)) {
            validationErrors.push("invalid \"includeEditions\" filter");
        }
        if (validationErrors.length > 0) {
            throw new AppError_1.AppError(validationErrors.join(' and '), 400);
        }
        return true;
    };
    TitleValidator.prototype.isInvalidFormats = function (formats) {
        return formats && (!Array.isArray(formats) || formats.length === 0);
    };
    TitleValidator.prototype.isInvalidIdentifier = function (identifiers) {
        return (!identifiers || !Array.isArray(identifiers) || identifiers.length === 0);
    };
    return TitleValidator;
}());
exports.titleValidator = new TitleValidator();
