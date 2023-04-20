"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonValidator = void 0;
var _ = require("lodash");
var validator_1 = require("validator");
var LoggerUtil_1 = require("../../../utils/LoggerUtil");
var config_1 = require("../../../config/config");
var constant_1 = require("../../../config/constant");
var log = LoggerUtil_1.default.getLogger('CommonValidator');
var CommonValidator = /** @class */ (function () {
    function CommonValidator() {
        this.maxBatchSize = config_1.Config.getPropertyValue('maxBatchSizeV4');
        this.searchAPIMaxBatchSizeV4 = config_1.Config.getPropertyValue('searchAPIMaxBatchSizeV4');
        this.partsAPIMaxBatchSizeV4 = config_1.Config.getPropertyValue('partsAPIMaxBatchSizeV4');
    }
    /**
     * This Method returns List of Error messages if any,
     * else returns empty Array.
     * @param productType
     */
    CommonValidator.prototype.validateProductType = function (productType) {
        log.debug('validateProductType:: ', { productType: productType });
        var validationErrors = [];
        // productType validation
        if (!(constant_1.AppConstants.ProductTypesV4.includes(productType) ||
            constant_1.AppConstants.PreProductTypesV4.includes(productType))) {
            validationErrors.push("Invalid product type : ".concat(productType));
        }
        return validationErrors;
    };
    /**
     * This Method returns List of Error messages if any,
     * else returns empty Array.
     * @param offsetCursor
     */
    CommonValidator.prototype.validateOffsetCursor = function (offsetCursor, forParts) {
        log.debug('validateOffsetCursor:: ', { offsetCursor: offsetCursor });
        var validationErrors = [];
        if (offsetCursor === 'last-page-cursor') {
            return validationErrors;
        }
        if (typeof offsetCursor !== 'string') {
            validationErrors.push("Invalid offsetCursor : ".concat(offsetCursor));
        }
        else {
            var isOffsetCursorValidForSplitting = false;
            if (offsetCursor.split(':').length === 3)
                isOffsetCursorValidForSplitting = true;
            if (isOffsetCursorValidForSplitting) {
                var uuids = forParts
                    ? this.getUUIDFromOffsetCursorForParts(offsetCursor)
                    : this.getUUIDFromOffsetCursor(offsetCursor);
                uuids.forEach(function (uuid) {
                    if (!(0, validator_1.isUUID)(uuid)) {
                        validationErrors.push("Invalid offsetCursor : ".concat(offsetCursor));
                    }
                });
            }
            else {
                validationErrors.push("Invalid offsetCursor : ".concat(offsetCursor));
            }
        }
        return validationErrors;
    };
    CommonValidator.prototype.getUUIDFromOffsetCursor = function (offsetCursor) {
        var uuids = offsetCursor.split(':').map(function (uuid) {
            if (uuid.includes('_asc'))
                return uuid.replace('_asc', '');
            else if (uuid.includes('_desc'))
                return uuid.replace('_desc', '');
            else
                return uuid;
        });
        return uuids;
    };
    CommonValidator.prototype.getUUIDFromOffsetCursorForParts = function (offsetCursor) {
        var uuids = offsetCursor.split(':').map(function (uuid) {
            if (uuid.includes('_'))
                return uuid.split('_')[1];
            else
                return uuid;
        });
        return uuids;
    };
    /**
     * This Method returns List of Error messages if any,
     * else returns empty Array.
     * @param offset
     * @param limit
     * @param isSearchLimit
     */
    CommonValidator.prototype.validateOffsetLimit = function (offset, limit, isSearchLimit, isPartsLimit) {
        if (isSearchLimit === void 0) { isSearchLimit = false; }
        if (isPartsLimit === void 0) { isPartsLimit = false; }
        log.debug('validateOffsetLimit:: ', { limit: limit, offset: offset });
        var parsedLimit = parseInt(limit, 10);
        var parsedOffset = parseInt(offset, 10);
        var validationErrors = [];
        var maxBatchSize;
        if (isSearchLimit) {
            maxBatchSize = this.searchAPIMaxBatchSizeV4;
        }
        else {
            maxBatchSize = isPartsLimit
                ? this.partsAPIMaxBatchSizeV4
                : this.maxBatchSize;
        }
        // limit validation
        if (limit && isNaN(parsedLimit)) {
            validationErrors.push('Invalid query parameter: limit');
        }
        else if (!isNaN(parsedLimit) &&
            (parsedLimit > maxBatchSize || parsedLimit <= 0)) {
            validationErrors.push("limit should be between 1 - ".concat(maxBatchSize));
        }
        // offset validation
        if ((offset && isNaN(parsedOffset)) || parsedOffset < 0) {
            validationErrors.push('Invalid query parameter: offset');
        }
        return validationErrors;
    };
    /**
     * This Method returns List of Error messages if any,
     * else returns empty Array.
     * @param searchQuery
     * @param requestedProductsType
     */
    CommonValidator.prototype.validateSearchQuery = function (searchQuery, requestedProductsType, availability) {
        var _this = this;
        if (requestedProductsType === void 0) { requestedProductsType = null; }
        var validationErrors = [];
        log.debug('validateSearchQuery:: ', { requestedProductsType: requestedProductsType, searchQuery: searchQuery });
        // Validate if the searchQuery is array
        if (!searchQuery ||
            !Array.isArray(searchQuery) ||
            searchQuery.length === 0) {
            validationErrors.push('Invalid or missing search rules.');
            return validationErrors;
        }
        var isGroupedSearchQuery = searchQuery.some(function (sq) {
            return (sq.rules &&
                sq.rules.some(function (rule) {
                    return rule.type === 'group';
                }));
        });
        if (availability && isGroupedSearchQuery) {
            validationErrors.push('Invalid availability filter, Grouped-SearchQuery ' +
                'will not support root level availability filter');
        }
        // Validate rules against the requested productType
        // If requestedProductsType is not provided(null) ignore this validation.
        if (requestedProductsType !== null &&
            !searchQuery.some(function (sQ) { return sQ.type === requestedProductsType; })) {
            validationErrors.push('Requested Product type is not available in search query.');
        }
        var uniqueProductTypes = new Set();
        searchQuery.forEach(function (sQuery) {
            // validate attributes (projections)
            if (sQuery.attributes && !Array.isArray(sQuery.attributes)) {
                validationErrors.push("Invalid attribute parameters in the rules.");
            }
            // Validate the Product type.
            validationErrors.push.apply(validationErrors, _this.validateProductType(sQuery.type));
            uniqueProductTypes.add(sQuery.type);
        });
        // Validate rules for duplicate type
        if (uniqueProductTypes.size !== searchQuery.length) {
            validationErrors.push('Invalid search query: duplicate rules for same type.');
        }
        return validationErrors;
    };
    CommonValidator.prototype.validateAvailability = function (availability) {
        log.debug('validateAvailability:: ', { availability: availability });
        var validationErrors = [];
        if (availability.length === 0) {
            validationErrors.push('At least one filter is required for each of the availability ' +
                'channel mentioned in the query');
        }
        else {
            availability.forEach(function (item) {
                var name = item.name, status = item.status;
                if (name && !status) {
                    validationErrors.push("Missing availability.status in the request parameters.");
                }
                var inputFilterOperator = Object.keys(_.get(item, 'status', {}));
                if (status && inputFilterOperator.length > 1) {
                    validationErrors.push("Invalid availability filter, only one operator is allowed for status");
                }
                if (status && !['ALL', 'IN'].includes(inputFilterOperator[0])) {
                    validationErrors.push('Invalid operator ' +
                        inputFilterOperator[0] +
                        ' in the availability filter.');
                }
            });
        }
        return validationErrors;
    };
    CommonValidator.prototype.validateEmail = function (email) {
        var validationErrors = [];
        log.debug('validateEmail:: ', { email: email });
        var emailRegex = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (emailRegex.test(email) === false) {
            validationErrors.push("Invalid email ".concat(email));
        }
        return validationErrors;
    };
    return CommonValidator;
}());
exports.commonValidator = new CommonValidator();
