"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectionValidator = void 0;
var AmazonS3URI = require("amazon-s3-uri");
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var S3UtilsV4_1 = require("../utils/S3UtilsV4");
var constant_1 = require("../../config/constant");
var AppError_1 = require("../../model/AppError");
var log = LoggerUtil_1.default.getLogger('CollectionValidator');
var CollectionValidator = /** @class */ (function () {
    function CollectionValidator() {
    }
    CollectionValidator.prototype.validateCollection = function (productData, action) {
        return __awaiter(this, void 0, void 0, function () {
            var categories, collectionUpdateType, rulesList, isProductLevelAvailabilityExists, validTo, plannedPublicationDate, partsAdded, partsUpdated;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (productData.isPartOf) {
                            throw new AppError_1.AppError("Invalid property(s): isPartOf", 400);
                        }
                        if (productData['availability']) {
                            throw new AppError_1.AppError("Invalid property(s): availability", 400);
                        }
                        categories = productData.categories;
                        if (!categories) {
                            throw new AppError_1.AppError("Missing or Invalid required field: categories", 400);
                        }
                        this._validateCategories(categories);
                        collectionUpdateType = this.getCollectionUpdateType(categories);
                        rulesList = productData.rulesList;
                        if (collectionUpdateType === 'dynamic' &&
                            (!rulesList || !Array.isArray(rulesList) || rulesList.length === 0)) {
                            throw new AppError_1.AppError('Invalid or missing search rules for dynamic collection', 400);
                        }
                        isProductLevelAvailabilityExists = rulesList &&
                            rulesList.some(function (res) {
                                return !!res['availability'];
                            });
                        if (isProductLevelAvailabilityExists) {
                            throw new AppError_1.AppError('Invalid availability filter, product ' +
                                'level availability filter is not allowed', 400);
                        }
                        if (action === 'update' &&
                            productData.collection &&
                            !productData.collection.ruleUpdateStartDate &&
                            !productData.collection.ruleUpdateEndDate) {
                            throw new AppError_1.AppError("Missing ruleUpdateStartDate/ruleUpdateEndDate in the request payload.", 400);
                        }
                        validTo = productData.collection.validTo;
                        plannedPublicationDate = productData.collection.plannedPublicationDate;
                        /* this method will validate the validTo & plannedPublicationDates and their relation*/
                        this._validateDatesRelation(validTo && validTo.toString(), plannedPublicationDate && plannedPublicationDate.toString());
                        partsAdded = productData.partsAdded;
                        partsUpdated = productData.partsUpdated;
                        if (collectionUpdateType === 'static') {
                            this.validateParts(partsAdded);
                            this.validateParts(partsUpdated);
                        }
                        // any of parts id should not match with product id
                        this._validatePartIds(productData);
                        // validate associated media
                        return [4 /*yield*/, this.validateAssociatedMedia(productData.associatedMedia)];
                    case 1:
                        // validate associated media
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    CollectionValidator.prototype.validateCollectionId = function (request) {
        var identifierName = request.identifierName, identifierValue = request.identifierValue, apiVersion = request.apiVersion, responseGroup = request.responseGroup, type = request.type, rest = __rest(request, ["identifierName", "identifierValue", "apiVersion", "responseGroup", "type"]);
        log.debug('validateCollectionId:: ', {
            identifierName: identifierName,
            identifierValue: identifierValue,
            type: type
        });
        if (rest && Object.keys(rest).length > 0) {
            var params = Object.keys(rest).toString();
            throw new AppError_1.AppError("Invalid parameter ".concat(params), 400);
        }
        if (!identifierName) {
            throw new AppError_1.AppError("Missing parameter identifierName", 400);
        }
        if (!constant_1.AppConstants.WhitelistedProductIdentifiersV4.includes(identifierName) &&
            !constant_1.AppConstants.WhitelistedProductIdentifiersNotInAssetsV4.includes(identifierName)) {
            throw new AppError_1.AppError("Incorrect identifierName ".concat(identifierName), 400);
        }
        if (constant_1.AppConstants.WhitelistedProductIdentifiersV4.includes(identifierName) &&
            type) {
            throw new AppError_1.AppError("Additional parameter type not required", 400);
        }
        if (constant_1.AppConstants.WhitelistedProductIdentifiersNotInAssetsV4.includes(identifierName) &&
            !type) {
            throw new AppError_1.AppError("Missing parameter type", 400);
        }
        if (type && !constant_1.AppConstants.ProductTypesV4WithTitle.includes(type)) {
            throw new AppError_1.AppError("Incorrect product type", 400);
        }
        if (!identifierValue) {
            throw new AppError_1.AppError("Missing parameter identifierValue", 400);
        }
        return true;
    };
    CollectionValidator.prototype._validateDatesRelation = function (validTo, plannedPublicationDate) {
        if (validTo && plannedPublicationDate) {
            if (!(this.isIsoDate(validTo) && this.isIsoDate(plannedPublicationDate))) {
                throw new AppError_1.AppError('validTo and plannedPublicationDate should ' + 'have ISO date format', 400);
            }
            var d1 = new Date(validTo);
            var d2 = new Date(plannedPublicationDate);
            if (d1 < d2) {
                throw new AppError_1.AppError('validTo date should be greater than ' + 'plannedPublicationDate.', 400);
            }
        }
    };
    CollectionValidator.prototype.getCollectionUpdateType = function (categories) {
        var isDynamicCollectionUpdateType = categories.some(function (item) {
            return (item['name'] === 'collection-update-type' && item['type'] === 'dynamic');
        });
        return isDynamicCollectionUpdateType ? 'dynamic' : 'static';
    };
    CollectionValidator.prototype._validatePartIds = function (productData) {
        // any of parts id should not match with product id
        var parts = __spreadArray(__spreadArray(__spreadArray([], (productData.partsUpdated ? productData.partsUpdated : []), true), (productData.partsRemoved ? productData.partsRemoved : []), true), (productData.partsAdded ? productData.partsAdded : []), true);
        var partIds = parts.map(function (part) { return part.identifier; });
        if (partIds.includes(productData._id)) {
            throw new AppError_1.AppError(productData._id +
                ' ' +
                'should not match with any of parts update/delete/added' +
                ' ' +
                'id in the request payload', 400);
        }
    };
    CollectionValidator.prototype._validateCategories = function (categories) {
        var categoriesNames = [];
        var isCategoryNameExist = false;
        var isValidCategory = false;
        /* istanbul ignore else */
        if (Array.isArray(categories)) {
            categoriesNames = categories.map(function (item) { return item.name; });
            isCategoryNameExist =
                categoriesNames.includes('collection-type') &&
                    categoriesNames.includes('collection-update-type');
            /* istanbul ignore else */
            if (!isCategoryNameExist) {
                throw new AppError_1.AppError('Category must contain collection-type and collection-update-type', 400);
            }
            isValidCategory = categories.some(function (item) {
                return (item['name'] === 'collection-update-type' &&
                    (item['type'] === 'static' || item['type'] === 'dynamic'));
            });
            /* istanbul ignore else */
            if (!isValidCategory) {
                throw new AppError_1.AppError('Category type must be of type static or dynamic', 400);
            }
        }
    };
    CollectionValidator.prototype.isIsoDate = function (str) {
        if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) {
            return false;
        }
        var d = new Date(str);
        return d.toISOString() === str;
    };
    CollectionValidator.prototype.validateParts = function (parts) {
        if (parts && Array.isArray(parts) && parts.length > 0) {
            var partsPositions = parts.map(function (item) {
                if (!item.position) {
                    throw new AppError_1.AppError('Position field is required for static collection', 400);
                }
                return item.position;
            });
            var hasDuplicates = new Set(partsPositions).size !== partsPositions.length;
            if (hasDuplicates) {
                throw new AppError_1.AppError('Parts should contain unique position', 400);
            }
        }
    };
    CollectionValidator.prototype.validateAssociatedMedia = function (associatedMedia) {
        var _a, associatedMedia_1, associatedMedia_1_1;
        var _b, e_1, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var validateAssociatedMediaTypes, content, _e, bucket, key, hasContent, error_1, e_1_1;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        validateAssociatedMediaTypes = ['coverimage', 'bannerimage'];
                        if (!associatedMedia) return [3 /*break*/, 18];
                        if (!Array.isArray(associatedMedia)) {
                            throw new AppError_1.AppError('Invalid associated media', 400);
                        }
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 12, 13, 18]);
                        _a = true, associatedMedia_1 = __asyncValues(associatedMedia);
                        _f.label = 2;
                    case 2: return [4 /*yield*/, associatedMedia_1.next()];
                    case 3:
                        if (!(associatedMedia_1_1 = _f.sent(), _b = associatedMedia_1_1.done, !_b)) return [3 /*break*/, 11];
                        _d = associatedMedia_1_1.value;
                        _a = false;
                        _f.label = 4;
                    case 4:
                        _f.trys.push([4, , 9, 10]);
                        content = _d;
                        if (!validateAssociatedMediaTypes.includes(content.type)) {
                            throw new AppError_1.AppError("Invalid associatedMedia type: ".concat(content.type), 400);
                        }
                        _f.label = 5;
                    case 5:
                        _f.trys.push([5, 7, , 8]);
                        _e = AmazonS3URI(content.location), bucket = _e.bucket, key = _e.key;
                        return [4 /*yield*/, S3UtilsV4_1.S3UtilsV4.headObjects(bucket, key)];
                    case 6:
                        hasContent = _f.sent();
                        if (!hasContent) {
                            throw new AppError_1.AppError("No content found at ".concat(content.location, " for ").concat(content.type), 400);
                        }
                        return [3 /*break*/, 8];
                    case 7:
                        error_1 = _f.sent();
                        throw new AppError_1.AppError("Invalid S3 URI: ".concat(content.location, " for ").concat(content.type), 400);
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        _a = true;
                        return [7 /*endfinally*/];
                    case 10: return [3 /*break*/, 2];
                    case 11: return [3 /*break*/, 18];
                    case 12:
                        e_1_1 = _f.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 18];
                    case 13:
                        _f.trys.push([13, , 16, 17]);
                        if (!(!_a && !_b && (_c = associatedMedia_1.return))) return [3 /*break*/, 15];
                        return [4 /*yield*/, _c.call(associatedMedia_1)];
                    case 14:
                        _f.sent();
                        _f.label = 15;
                    case 15: return [3 /*break*/, 17];
                    case 16:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 17: return [7 /*endfinally*/];
                    case 18: return [2 /*return*/];
                }
            });
        });
    };
    return CollectionValidator;
}());
exports.collectionValidator = new CollectionValidator();
