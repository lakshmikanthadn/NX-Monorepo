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
exports.inputValidator = void 0;
var lodash_1 = require("lodash");
var mime = require("mime-types");
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var validator_1 = require("validator");
var constant_1 = require("../../config/constant");
var AppError_1 = require("../../model/AppError");
var CommonValidator_1 = require("./requestValidator/CommonValidator");
var log = LoggerUtil_1.default.getLogger('InputValidator');
var InputValidator = /** @class */ (function () {
    function InputValidator() {
        this.apiVersionsUnSupportResponseGroup = ['4.0.0'];
        this.validResponseGroups = ['small', 'medium', 'large'];
        this.idAndRespGroupBasedLimit =
            constant_1.AppConstants.IdentifierAndResponseGroupBasedLimitV4;
    }
    InputValidator.prototype.validateAPIVersionResponseGroup = function (apiVersion, responseGroup) {
        log.debug('validateAPIVersionResponseGroup:: ', {
            apiVersion: apiVersion,
            responseGroup: responseGroup
        });
        // validate apiVersion
        var validationErrors = [];
        if (responseGroup && !this.validResponseGroups.includes(responseGroup)) {
            validationErrors.push('Invalid Response group');
        }
        if ((!apiVersion ||
            this.apiVersionsUnSupportResponseGroup.includes(apiVersion)) &&
            responseGroup) {
            // validationErrors.push('This API Version does not support response group.');
            // As per architect suggestion changing the error code to 404.
            throw new AppError_1.AppError('This API Version does not support response group.', 404);
        }
        if (validationErrors.length > 0) {
            throw new AppError_1.AppError(validationErrors.join('. '), 400);
        }
        return true;
    };
    InputValidator.prototype.validateOffsetLimit = function (offset, limit, isSearchLimit, isPartsLimit) {
        if (isSearchLimit === void 0) { isSearchLimit = false; }
        if (isPartsLimit === void 0) { isPartsLimit = false; }
        log.debug('validateOffsetLimit:: ', { limit: limit, offset: offset });
        var validationErrors = CommonValidator_1.commonValidator.validateOffsetLimit(offset, limit, isSearchLimit, isPartsLimit);
        if (validationErrors.length > 0) {
            throw new AppError_1.AppError(validationErrors.join(', '), 400);
        }
        return true;
    };
    InputValidator.prototype.validateIdNameAndIdValues = function (identifierName, identifierValues, responseGroup, productType) {
        log.debug('validateIdNameAndIdValues:: ', {
            identifierName: identifierName,
            identifierValues: identifierValues
        });
        var validationErrors = [];
        var defaultMaxBatchSize = (0, lodash_1.get)(this.idAndRespGroupBasedLimit, "default.".concat(responseGroup), 30);
        var maxBatchSize = (0, lodash_1.get)(this.idAndRespGroupBasedLimit, "".concat(identifierName, ".").concat(responseGroup), defaultMaxBatchSize);
        var whitelistedIdentifiers = constant_1.AppConstants.WhitelistedProductIdentifiersWithNonAssetIdentifiersV4;
        // identifierName validation
        if (identifierValues && !identifierName) {
            validationErrors.push('Missing query parameter: identifierName');
        }
        // identifierValues validation
        if (whitelistedIdentifiers.includes(identifierName) && !identifierValues) {
            validationErrors.push('Missing query parameter: identifierValues');
        }
        // If the identifier name is not whitelisted return 400
        if (identifierName && !whitelistedIdentifiers.includes(identifierName)) {
            validationErrors.push("Invalid identifier-name: ".concat(identifierName));
        }
        // type is needed if identifierName is non-asset (e.g., title)
        if (constant_1.AppConstants.WhitelistedProductIdentifiersNotInAssetsV4.includes(identifierName) &&
            !productType) {
            validationErrors.push("Missing query parameter: type when identifierName is ".concat(identifierName));
        }
        if (whitelistedIdentifiers.includes(identifierName) && identifierValues) {
            var allIdentifierValues = identifierValues.split(',');
            if (Array.isArray(allIdentifierValues) &&
                allIdentifierValues.length > maxBatchSize) {
                validationErrors.push("identifierValues should contain min 1 and max ".concat(maxBatchSize, " values for ").concat(identifierName));
            }
        }
        if (validationErrors.length > 0) {
            throw new AppError_1.AppError(validationErrors.join(', '), 400);
        }
        return true;
    };
    InputValidator.prototype.validatePreArticleIdNameAndIdValues = function (identifierName, identifierValues, responseGroup) {
        log.debug('validatePreArticleIdNameAndIdValues:: ', {
            identifierName: identifierName,
            identifierValues: identifierValues
        });
        var validationErrors = [];
        var defaultMaxBatchSize = (0, lodash_1.get)(this.idAndRespGroupBasedLimit, "default.".concat(responseGroup), 30);
        var maxBatchSize = (0, lodash_1.get)(this.idAndRespGroupBasedLimit, "".concat(identifierName, ".").concat(responseGroup), defaultMaxBatchSize);
        var whitelistedIdentifiers = constant_1.AppConstants.WhitelistedPreArticleIdentifiers;
        // identifierName validation
        if (identifierValues && !identifierName) {
            validationErrors.push('Missing query parameter: identifierName');
        }
        // identifierValues validation
        if (whitelistedIdentifiers.includes(identifierName) && !identifierValues) {
            validationErrors.push('Missing query parameter: identifierValues');
        }
        // If the identifier name is not whitelisted return 400
        if (identifierName && !whitelistedIdentifiers.includes(identifierName)) {
            validationErrors.push("Invalid identifier-name: ".concat(identifierName));
        }
        if (whitelistedIdentifiers.includes(identifierName) && identifierValues) {
            var allIdentifierValues = identifierValues.split(',');
            if (Array.isArray(allIdentifierValues) &&
                allIdentifierValues.length > maxBatchSize) {
                validationErrors.push("identifierValues should contain min 1 and max ".concat(maxBatchSize, " values for ").concat(identifierName));
            }
        }
        if (validationErrors.length > 0) {
            throw new AppError_1.AppError(validationErrors.join(', '), 400);
        }
        return true;
    };
    InputValidator.prototype.validateProductType = function (productType) {
        log.debug('validateProductType:: ', { productType: productType });
        var validationErrors = [];
        // productType validation
        if (productType && !constant_1.AppConstants.ProductTypesV4.includes(productType)) {
            validationErrors.push("Invalid product type : ".concat(productType));
        }
        if (validationErrors.length > 0) {
            throw new AppError_1.AppError(validationErrors.join('. '), 400);
        }
        return true;
    };
    InputValidator.prototype.validateAvailabilityNameAndStatus = function (availabilityName, availabilityStatus) {
        log.debug('validateAvailabilityNameAndStatus:: ', {
            availabilityName: availabilityName,
            availabilityStatus: availabilityStatus
        });
        var validationErrors = [];
        // productType validation
        if (availabilityStatus && !availabilityName) {
            validationErrors.push("To use availabilityStatus, availabilityName is mandatory");
        }
        if (validationErrors.length > 0) {
            throw new AppError_1.AppError(validationErrors.join('. '), 400);
        }
        return true;
    };
    InputValidator.prototype.multipleProductsValidator = function (request) {
        var _a = request.query, offset = _a.offset, limit = _a.limit, identifierName = _a.identifierName, identifierValues = _a.identifierValues, type = _a.type, availabilityName = _a.availabilityName, availabilityStatus = _a.availabilityStatus, responseGroup = _a.responseGroup;
        this.validateProductType(type);
        this.validateOffsetLimit(offset, limit);
        this.validateIdNameAndIdValues(identifierName, identifierValues, responseGroup, type);
        this.validateAvailabilityNameAndStatus(availabilityName, availabilityStatus);
        return true;
    };
    InputValidator.prototype.preArticleValidator = function (request, response) {
        var _a = request.query, offset = _a.offset, limit = _a.limit, identifierName = _a.identifierName, identifierValues = _a.identifierValues, responseGroup = _a.responseGroup;
        this.validateOffsetLimit(offset, limit);
        this.validatePreArticleIdNameAndIdValues(identifierName, identifierValues, responseGroup);
        return true;
    };
    InputValidator.prototype.validateFormatType = function (format) {
        log.debug('validateFormatType:: ', { format: format });
        var validationErrors = [];
        // productType validation
        if (format && !constant_1.AppConstants.FormatTypeList.includes(format)) {
            validationErrors.push("Invalid format: ".concat(format));
        }
        if (validationErrors.length > 0) {
            throw new AppError_1.AppError(validationErrors.join('. '), 400);
        }
        return true;
    };
    InputValidator.prototype.productHasPartsValidator = function (request) {
        var _a = request.query, offset = _a.offset, limit = _a.limit, expanded = _a.expanded, format = _a.format, type = _a.type, responseGroup = _a.responseGroup, productVersion = _a.productVersion, apiVersion = _a.apiVersion, identifierType = _a.identifierType, includeCounts = _a.includeCounts;
        var depth = request.query.depth;
        if (expanded) {
            throw new AppError_1.AppError('Invalid query parameter: expanded', 400);
        }
        if (responseGroup === 'large') {
            throw new AppError_1.AppError("Invalid Response group: ".concat(responseGroup), 400);
        }
        if (productVersion) {
            throw new AppError_1.AppError('currently we are not supporting productVersion', 400);
        }
        if (this.isformatAndTypeNotValid(format, type)) {
            throw new AppError_1.AppError('format is only supported with type creativeWork', 400);
        }
        if (apiVersion === '4.0.2' && !depth && depth !== 0) {
            depth = 1;
        }
        if (typeof depth === 'string' && !parseInt(depth, 10)) {
            throw new AppError_1.AppError("Invalid query parameter: depth with value ".concat(depth), 400);
        }
        if (apiVersion !== '4.0.2' && depth) {
            throw new AppError_1.AppError("depth is not supported for apiVersion ".concat(apiVersion), 400);
        }
        if (apiVersion === '4.0.2' && responseGroup !== 'small') {
            throw new AppError_1.AppError("apiVersion ".concat(apiVersion, " does not support responseGroup ").concat(responseGroup), 400);
        }
        if (this.isDepthInvalid(apiVersion, responseGroup, depth)) {
            throw new AppError_1.AppError("Invalid depth: ".concat(depth), 400);
        }
        // now we don't need to validate the part-type as it may be anything ex: part, module, section
        // this.validateProductType(partType);
        this.validateOffsetLimit(offset, limit, false, true);
        this.validateFormatType(format);
        this.validateIdentifierType(identifierType);
        this.validateIncludeCounts(includeCounts);
        // might be needed in future who knows
        // this.validateAvailabilityNameAndStatus(availabilityName, availabilityStatus);
        return true;
    };
    InputValidator.prototype.validateIdentifierType = function (identifierType) {
        if (identifierType &&
            !constant_1.AppConstants.WhitelistedPartsIdentiferTypes.includes(identifierType)) {
            throw new AppError_1.AppError("Invalid identifier type: ".concat(identifierType), 400);
        }
        return true;
    };
    InputValidator.prototype.validateIncludeCounts = function (includeCounts) {
        if (includeCounts && !['true', 'false'].includes(includeCounts)) {
            throw new AppError_1.AppError("Invalid includeCounts value: ".concat(includeCounts), 400);
        }
        return true;
    };
    InputValidator.prototype.isformatAndTypeNotValid = function (format, type) {
        return (format && !type) || (format && type && type !== 'creativeWork');
    };
    InputValidator.prototype.isDepthInvalid = function (apiVersion, responseGroup, depth) {
        return (apiVersion === '4.0.2' &&
            responseGroup === 'small' &&
            (depth === 0 || ![1, 2].includes(parseInt(depth, 10) || 1)));
    };
    InputValidator.prototype.productv410HasPartsValidator = function (request) {
        var _a = request.query, apiVersion = _a.apiVersion, offsetCursor = _a.offsetCursor, limit = _a.limit, region = _a.region, responseGroup = _a.responseGroup, version = _a.version, q = _a.q, appName = _a.appName, restOfBody = __rest(_a, ["apiVersion", "offsetCursor", "limit", "region", "responseGroup", "version", "q", "appName"]);
        log.debug('productv410HasPartsValidator:: ', {
            apiVersion: apiVersion,
            appName: appName,
            limit: limit,
            offsetCursor: offsetCursor,
            q: q,
            region: region,
            responseGroup: responseGroup,
            version: version
        });
        var parsedLimit = parseInt(limit, 10);
        var validationErrors = [];
        if (restOfBody && Object.keys(restOfBody).length > 0) {
            var params = Object.keys(restOfBody).toString();
            throw new AppError_1.AppError("Invalid parameter: ".concat(params), 400);
        }
        if (responseGroup === 'large') {
            validationErrors.push("Invalid Response group: ".concat(responseGroup, ". Currently we are only supporting small and medium."));
        }
        if (appName && appName !== 'SF') {
            validationErrors.push("Invalid app name ".concat(appName));
        }
        if (q && !appName) {
            validationErrors.push('Missing parameter appName if q is present');
        }
        // limit validation
        if (limit && isNaN(parsedLimit)) {
            validationErrors.push('Invalid query parameter: limit');
        }
        else if (!isNaN(parsedLimit) && parsedLimit <= 0) {
            validationErrors.push('limit should not be less than 0');
        }
        if (offsetCursor) {
            validationErrors.push.apply(validationErrors, CommonValidator_1.commonValidator.validateOffsetCursor(offsetCursor, true));
        }
        if (validationErrors.length > 0) {
            throw new AppError_1.AppError(validationErrors.join(' and '), 400);
        }
        return true;
    };
    InputValidator.prototype.productPartsDeltaValidator = function (request) {
        var _a = request.query, apiVersion = _a.apiVersion, region = _a.region, responseGroup = _a.responseGroup, v1 = _a.v1, v2 = _a.v2, include = _a.include, restOfBody = __rest(_a, ["apiVersion", "region", "responseGroup", "v1", "v2", "include"]);
        log.debug('productPartsDeltaValidator:: ', {
            apiVersion: apiVersion,
            include: include,
            region: region,
            responseGroup: responseGroup,
            v1: v1,
            v2: v2
        });
        var validationErrors = [];
        if (restOfBody && Object.keys(restOfBody).length > 0) {
            var params = Object.keys(restOfBody).toString();
            throw new AppError_1.AppError("Invalid parameter: ".concat(params), 400);
        }
        if (responseGroup === 'medium' || responseGroup === 'large') {
            validationErrors.push("Invalid Response group: ".concat(responseGroup, ". Currently we are only supporting small."));
        }
        if (!v1) {
            validationErrors.push('Missing collection version parameter v1');
        }
        if (!v2) {
            validationErrors.push('Missing collection version parameter v2');
        }
        if (v1 === v2) {
            validationErrors.push('Delta cannot be found between same product version');
        }
        if (validationErrors.length > 0) {
            throw new AppError_1.AppError(validationErrors.join(' and '), 400);
        }
        return true;
    };
    InputValidator.prototype.validateContentAttributes = function (contentJson) {
        log.debug('validateContentAttributes:: ', { contentJson: contentJson });
        var validationErrors = [];
        var contentKeys = Object.keys(contentJson);
        var result = false;
        var validateKey = constant_1.AppConstants.ValidateAsstMediaFieldsV4;
        result = validateKey.every(function (element) {
            if (contentKeys.includes(element)) {
                return true;
            }
        });
        // contentAttributes validation
        if (!result) {
            validationErrors.push("Invalid input content : ".concat(JSON.stringify(contentJson)));
        }
        if (validationErrors.length > 0) {
            throw new AppError_1.AppError(validationErrors.join('. '), 400);
        }
        return true;
    };
    InputValidator.prototype.validateAssociatedMedia = function (request) {
        var contentJson = request.body;
        var formatType = contentJson.type;
        var fileName = contentJson.fileName;
        var contentType = mime.lookup(fileName);
        this.validateContentAttributes(contentJson);
        this.validateFormatType(formatType);
        if (formatType === 'hyperlink') {
            throw new AppError_1.AppError('hyperlink is no more supported using this api', 400);
        }
        if (!contentType &&
            formatType !== 'hyperlink' &&
            formatType !== 'database') {
            throw new AppError_1.AppError('Invalid content-type', 400);
        }
        return true;
    };
    /**
     *
     * @param req
     * Note: All the Request query params comes as string values.
     * And isNumeric and isBoolean accepts only string values.
     */
    InputValidator.prototype.validateTaxonomyQueryFilters = function (req) {
        var validationErrors = [];
        if (req.query.level && !(0, validator_1.isNumeric)(req.query.level)) {
            validationErrors.push('Query-param `level` value is not Numeric');
        }
        if (req.query.isCodePrefix && !(0, validator_1.isBoolean)(req.query.isCodePrefix)) {
            validationErrors.push('Query-param `isCodePrefix` value is not Boolean');
        }
        if (req.query.extendLevel && !(0, validator_1.isBoolean)(req.query.extendLevel)) {
            validationErrors.push('Query-param `extendLevel` value is not Boolean');
        }
        if (req.query.extendLevel && !req.query.level) {
            validationErrors.push('Query-param `level` is mandatory when `extendLevel` is passed');
        }
        if (req.query.isCodePrefix && !req.query.code) {
            validationErrors.push('Query-param `code` is mandatory when `isCodePrefix` is passed');
        }
        if (validationErrors.length > 0) {
            throw new AppError_1.AppError(validationErrors.join(' and '), 400);
        }
        return true;
    };
    /**
     *
     * @param req
     * Note: All the Request query params comes as string values.
     * And isNumeric and isBoolean accepts only string values.
     */
    InputValidator.prototype.validateTaxonomyClassificationFilters = function (req) {
        var validationErrors = [];
        if (!req.query.classificationFamily) {
            validationErrors.push('Query-param `classificationFamily` is mandatory');
        }
        else if (!['rom', 'hobs', 'ubx'].includes(req.query.classificationFamily)) {
            validationErrors.push('Query-param `classificationFamily` value is invalid');
        }
        if (req.query.level && !(0, validator_1.isNumeric)(req.query.level)) {
            validationErrors.push('Query-param `level` value is not Numeric');
        }
        if (req.query.includeChildren && !(0, validator_1.isBoolean)(req.query.includeChildren)) {
            validationErrors.push('Query-param `includeChildren` value is not Boolean');
        }
        if (validationErrors.length > 0) {
            throw new AppError_1.AppError(validationErrors.join(' and '), 400);
        }
        return true;
    };
    return InputValidator;
}());
exports.inputValidator = new InputValidator();
