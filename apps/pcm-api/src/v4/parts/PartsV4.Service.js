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
Object.defineProperty(exports, "__esModule", { value: true });
exports.partsV4Service = void 0;
var _ = require("lodash");
var rTracer = require("cls-rtracer");
var constant_1 = require("../../config/constant");
var config_1 = require("../../config/config");
var AppError_1 = require("../../model/AppError");
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var Parts_Util_1 = require("../../utils/parts/Parts.Util");
var AssetV4_Service_1 = require("../assets/AssetV4.Service");
var CollectionRevisionV4_Service_1 = require("../collection/CollectionRevisionV4.Service");
var PartsRevisionV4_Service_1 = require("./PartsRevisionV4.Service");
var config_2 = require("../config");
var ProductV4_DAO_1 = require("../products/ProductV4.DAO");
var PartsV4_DAO_1 = require("./PartsV4.DAO");
var Parts_V410_DAO_1 = require("../../v410/parts/Parts.V410.DAO");
var log = LoggerUtil_1.default.getLogger('PartsV4Service');
var docTypeToESIndexMapperV4 = config_1.Config.getPropertyValue('docTypeToESIndexMapperV4');
var PartsV4Service = /** @class */ (function () {
    function PartsV4Service() {
    }
    PartsV4Service.prototype.getHasPartsCount = function (identifier, partType, format) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                log.debug("getHasPartsCount:: ", { format: format, identifier: identifier, partType: partType });
                return [2 /*return*/, PartsV4_DAO_1.partsV4DAO.getHasPartsCount(identifier, partType, format)];
            });
        });
    };
    PartsV4Service.prototype.getHasParts = function (productId, offset, limit, partType, format, responseGroup) {
        if (responseGroup === void 0) { responseGroup = 'small'; }
        return __awaiter(this, void 0, void 0, function () {
            var projectionFields;
            return __generator(this, function (_a) {
                log.debug("getHasParts:: ", {
                    format: format,
                    limit: limit,
                    offset: offset,
                    partType: partType,
                    productId: productId,
                    responseGroup: responseGroup
                });
                projectionFields = config_2.apiResponseGroupConfig.getProjectionFields('part', responseGroup);
                return [2 /*return*/, PartsV4_DAO_1.partsV4DAO.getHasParts(productId, offset, limit, projectionFields, partType, format)];
            });
        });
    };
    PartsV4Service.prototype.getHasPart = function (productId, partId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                log.debug("getHasPart:: ", { partId: partId, productId: productId });
                return [2 /*return*/, PartsV4_DAO_1.partsV4DAO.getHasPart(productId, partId)];
            });
        });
    };
    PartsV4Service.prototype.isAccessibleForFree = function (parentId, productId) {
        return __awaiter(this, void 0, void 0, function () {
            var isFree;
            return __generator(this, function (_a) {
                log.debug("isAccessibleForFree:: ", { parentId: parentId, productId: productId });
                isFree = true;
                return [2 /*return*/, PartsV4_DAO_1.partsV4DAO.getHasPart(parentId, productId, isFree).then(function (part) {
                        return part ? part.isFree : false;
                    })];
            });
        });
    };
    PartsV4Service.prototype.getProductHasParts = function (identifierValue, identifierName, offset, limit, includeCounts, partType, format, responseGroup, productVersion, isNewVersion, depth) {
        if (responseGroup === void 0) { responseGroup = 'small'; }
        return __awaiter(this, void 0, void 0, function () {
            var assetId, productsByType, productsResultByType, partsData, partsCount, productHasParts, productDataPromiser, productTypePartsData, partsLength, allCount_1, individualPartsCount, isCountMissing, totalCount_1, hasParts, _i, productHasParts_1, prod;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.debug('getProductHasParts:: ', {
                            format: format,
                            identifierName: identifierName,
                            identifierValue: identifierValue,
                            includeCounts: includeCounts,
                            limit: limit,
                            offset: offset,
                            partType: partType,
                            productVersion: productVersion,
                            responseGroup: responseGroup
                        });
                        return [4 /*yield*/, AssetV4_Service_1.assetV4Service.getValidAssetByIdentifierNameValue(identifierName, identifierValue)];
                    case 1:
                        assetId = (_a.sent())._id;
                        if (!assetId) {
                            throw new AppError_1.AppError('Product (asset) not found.', 404);
                        }
                        productsByType = {};
                        productsResultByType = {};
                        return [4 /*yield*/, this.getPartsMeta(assetId, offset, limit, partType, format, responseGroup)];
                    case 2:
                        partsData = _a.sent();
                        partsCount = partsData.partsCount;
                        productHasParts = partsData.productHasParts;
                        if (!partsCount && (!productHasParts || productHasParts.length === 0)) {
                            throw new AppError_1.AppError('Product parts not found.', 404);
                        }
                        else if (offset > partsCount - 1) {
                            throw new AppError_1.AppError("Offset value is more than the total parts. totalCount: ".concat(partsCount), 400);
                        }
                        if (!(responseGroup === 'medium')) return [3 /*break*/, 4];
                        // here we are creating product type and its corresponding list of parts id mapper
                        productHasParts.forEach(function (prod) {
                            if (constant_1.AppConstants.ProductTypesV4.includes(prod.type)) {
                                productsByType[prod.type] = Object.prototype.hasOwnProperty.call(productsByType, prod.type)
                                    ? productsByType[prod.type]
                                    : [];
                                productsByType[prod.type].push(prod._id);
                            }
                        });
                        productDataPromiser = Object.keys(productsByType).map(function (productType) {
                            return _this.getPartsMediumMeta(productsByType[productType], productType, productVersion);
                        });
                        return [4 /*yield*/, Promise.all(productDataPromiser)];
                    case 3:
                        productTypePartsData = _a.sent();
                        // here we are creating product type and its corresponding list of products response mapper
                        productTypePartsData.forEach(function (prod) {
                            productsResultByType[Object.keys(prod)[0]] = prod[Object.keys(prod)[0]];
                        });
                        // stiching product details on corresponding parts.
                        productHasParts.forEach(function (part) {
                            // finding index of product from respective product type mapper
                            if (constant_1.AppConstants.ProductTypesV4.includes(part.type)) {
                                var finalProductIndex = productsResultByType[part.type].findIndex(function (prod) { return prod._id === part._id; });
                                /* istanbul ignore else */
                                if (finalProductIndex !== -1) {
                                    // whether we have to fetch title from product or parts?
                                    var productForCurrentPart = productsResultByType[part.type][finalProductIndex];
                                    part.identifiers = productForCurrentPart.identifiers;
                                    part.contributors = productForCurrentPart.contributors;
                                    part.prices = productForCurrentPart.prices;
                                    part.permissions = productForCurrentPart.permissions;
                                    part[part.type] = _.get(productForCurrentPart, part.type, undefined);
                                    part.title = productForCurrentPart.title;
                                    delete part['format'];
                                    // deleting once product is stiched with corresponding part to increase performance
                                    productsResultByType[part.type].splice(finalProductIndex, 1);
                                }
                            }
                        });
                        _a.label = 4;
                    case 4:
                        partsLength = productHasParts && productHasParts.length;
                        if (!(includeCounts && partsLength > 0)) return [3 /*break*/, 10];
                        allCount_1 = [];
                        return [4 /*yield*/, PartsV4_DAO_1.partsV4DAO.getAllPartsCount(assetId)];
                    case 5:
                        individualPartsCount = _a.sent();
                        isCountMissing = !(individualPartsCount && individualPartsCount.length > 0);
                        if (!isCountMissing) {
                            totalCount_1 = 0;
                            individualPartsCount.forEach(function (partCount) {
                                totalCount_1 += partCount.count;
                                allCount_1.push({ count: partCount.count, type: partCount._id });
                            });
                            allCount_1.push({
                                count: totalCount_1,
                                type: 'total'
                            });
                        }
                        hasParts = void 0;
                        if (!(isNewVersion && depth && depth == 2)) return [3 /*break*/, 9];
                        _i = 0, productHasParts_1 = productHasParts;
                        _a.label = 6;
                    case 6:
                        if (!(_i < productHasParts_1.length)) return [3 /*break*/, 9];
                        prod = productHasParts_1[_i];
                        return [4 /*yield*/, this.getHasParts(prod['_id'], 0, null, null, null, responseGroup)];
                    case 7:
                        hasParts = _a.sent();
                        prod['hasParts'] = hasParts;
                        _a.label = 8;
                    case 8:
                        _i++;
                        return [3 /*break*/, 6];
                    case 9:
                        if (isCountMissing) {
                            return [2 /*return*/, Promise.resolve({
                                    data: productHasParts,
                                    metadata: {}
                                })];
                        }
                        else {
                            return [2 /*return*/, Promise.resolve({
                                    data: productHasParts,
                                    metadata: {
                                        counts: allCount_1
                                    }
                                })];
                        }
                        _a.label = 10;
                    case 10: return [2 /*return*/, Promise.resolve(productHasParts)];
                }
            });
        });
    };
    PartsV4Service.prototype.getProductHasPart = function (id, partId, responseGroup) {
        if (responseGroup === void 0) { responseGroup = 'small'; }
        return __awaiter(this, void 0, void 0, function () {
            var asset, productHasPart, partMedium, productType;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.debug('getProductHasPart:: ', {
                            id: id,
                            partId: partId,
                            responseGroup: responseGroup
                        });
                        return [4 /*yield*/, AssetV4_Service_1.assetV4Service.getAssetById(id, [
                                'type'
                            ])];
                    case 1:
                        asset = _a.sent();
                        if (!asset) {
                            throw new AppError_1.AppError('Product (asset) not found.', 404);
                        }
                        return [4 /*yield*/, this.getPartMeta(id, responseGroup, partId)];
                    case 2:
                        productHasPart = _a.sent();
                        if (Object.keys(productHasPart).length === 0 &&
                            productHasPart.constructor === Object) {
                            throw new AppError_1.AppError('Product parts not found.', 404);
                        }
                        productType = productHasPart.type;
                        if (!(responseGroup === 'medium')) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.getPartsMediumMeta([partId], productType)];
                    case 3:
                        partMedium = _a.sent();
                        partMedium[productType].forEach(function (item) {
                            productHasPart['contributors'] = item.contributors;
                            productHasPart['title'] = item.title;
                            productHasPart['identifiers'] = item.identifiers;
                            productHasPart['prices'] = item.prices;
                            productHasPart['permissions'] = item.permissions;
                            productHasPart[productType] = item[productType];
                        });
                        _a.label = 4;
                    case 4: return [2 /*return*/, Promise.resolve(productHasPart)];
                }
            });
        });
    };
    PartsV4Service.prototype.getProductPartsDelta = function (id, v1, v2, region, responseGroup) {
        if (responseGroup === void 0) { responseGroup = 'small'; }
        return __awaiter(this, void 0, void 0, function () {
            var asset, collectionRevisionData, collectionRevisionIds, collectionV1Id, collectionV2Id, partsRevisionData, partsDataV2, partsDataV1, partsAdded, partsRemoved, finalPartsAdded, finalPartsRemoved, _a, addedPartsDataFromSearchResult, removedPartsDataFromSearchResult;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        log.debug('getProductPartsDelta:: ', JSON.stringify({
                            id: id,
                            region: region,
                            responseGroup: responseGroup,
                            v1: v1,
                            v2: v2
                        }));
                        return [4 /*yield*/, AssetV4_Service_1.assetV4Service.getAssetById(id, [
                                'type'
                            ])];
                    case 1:
                        asset = _b.sent();
                        if (!asset || asset.type !== 'collection') {
                            throw new AppError_1.AppError('No such collection (product) found', 404);
                        }
                        return [4 /*yield*/, CollectionRevisionV4_Service_1.collectionRevisionV4Service.getCollectionRevisionData(id, [v1, v2], ['_id', 'version'])];
                    case 2:
                        collectionRevisionData = _b.sent();
                        if (!collectionRevisionData || collectionRevisionData.length !== 2) {
                            throw new AppError_1.AppError('Data for one or both versions of this product not found.', 404);
                        }
                        collectionRevisionIds = collectionRevisionData.map(function (data) { return data._id; });
                        collectionV1Id = (collectionRevisionData.find(function (collectionRev) {
                            return collectionRev.version === v1;
                        }) || {})._id;
                        collectionV2Id = (collectionRevisionData.find(function (collectionRev) {
                            return collectionRev.version === v2;
                        }) || {})._id;
                        return [4 /*yield*/, PartsRevisionV4_Service_1.partsRevisionV4Service.getPartsRevisionDataByIds(collectionRevisionIds, responseGroup)];
                    case 3:
                        partsRevisionData = _b.sent();
                        if (!partsRevisionData || partsRevisionData.length !== 2) {
                            throw new AppError_1.AppError('Parts data not found for one or both versions of this product.', 404);
                        }
                        partsDataV2 = partsRevisionData.find(function (partRevisionData) { return partRevisionData._id === collectionV2Id; }).parts;
                        partsDataV1 = partsRevisionData.find(function (partRevisionData) { return partRevisionData._id === collectionV1Id; }).parts;
                        partsAdded = Parts_Util_1.partsUtil.getPartsDiff(partsDataV1, partsDataV2);
                        partsRemoved = Parts_Util_1.partsUtil.getPartsDiff(partsDataV2, partsDataV1);
                        finalPartsAdded = [];
                        finalPartsRemoved = [];
                        if (!region) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.handleRegionFilterOfPartsData(partsAdded, partsRemoved, region, responseGroup)];
                    case 4:
                        _a = _b.sent(), addedPartsDataFromSearchResult = _a.addedPartsDataFromSearchResult, removedPartsDataFromSearchResult = _a.removedPartsDataFromSearchResult;
                        finalPartsAdded = Parts_Util_1.partsUtil.mergePartsAndProductPartsData(partsAdded, addedPartsDataFromSearchResult);
                        finalPartsRemoved = Parts_Util_1.partsUtil.mergePartsAndProductPartsData(partsRemoved, removedPartsDataFromSearchResult);
                        return [3 /*break*/, 6];
                    case 5:
                        finalPartsAdded = partsAdded;
                        finalPartsRemoved = partsRemoved;
                        _b.label = 6;
                    case 6: return [2 /*return*/, {
                            data: {
                                partsAdded: finalPartsAdded,
                                partsRemoved: finalPartsRemoved
                            },
                            metadata: {
                                transactionId: rTracer.id()
                            }
                        }];
                }
            });
        });
    };
    PartsV4Service.prototype.handleRegionFilterOfPartsData = function (partsAdded, partsRemoved, region, responseGroup) {
        if (responseGroup === void 0) { responseGroup = 'small'; }
        return __awaiter(this, void 0, void 0, function () {
            var searchDataForAddedParts, _a, searchDataForRemovedParts, _b, addedPartsDataFromSearchResult, removedPartsDataFromSearchResult;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(partsAdded.length > 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getSearchResults(partsAdded, { region: region, responseGroup: responseGroup })];
                    case 1:
                        _a = _c.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = [];
                        _c.label = 3;
                    case 3:
                        searchDataForAddedParts = _a;
                        if (!(partsRemoved.length > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.getSearchResults(partsRemoved, { region: region, responseGroup: responseGroup })];
                    case 4:
                        _b = _c.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        _b = [];
                        _c.label = 6;
                    case 6:
                        searchDataForRemovedParts = _b;
                        addedPartsDataFromSearchResult = searchDataForAddedParts.length > 0
                            ? Parts_Util_1.partsUtil.getPartsDataFromSearchResult(searchDataForAddedParts)
                            : [];
                        removedPartsDataFromSearchResult = searchDataForRemovedParts.length > 0
                            ? Parts_Util_1.partsUtil.getPartsDataFromSearchResult(searchDataForRemovedParts)
                            : [];
                        return [2 /*return*/, { addedPartsDataFromSearchResult: addedPartsDataFromSearchResult, removedPartsDataFromSearchResult: removedPartsDataFromSearchResult }];
                }
            });
        });
    };
    PartsV4Service.prototype.getSearchResults = function (partsData, options) {
        return __awaiter(this, void 0, void 0, function () {
            var region, responseGroup, partsTypeToIndex, idsToIndex, projections, limit, searchData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        region = options === null || options === void 0 ? void 0 : options.region;
                        responseGroup = (options === null || options === void 0 ? void 0 : options.responseGroup) || 'small';
                        partsTypeToIndex = Parts_Util_1.partsUtil.getUniquePartTypesToIndex(partsData);
                        idsToIndex = Parts_Util_1.partsUtil.getIdsFromParts(partsData);
                        projections = Parts_Util_1.partsUtil.getProjectionsBasedOnResponseGroup(responseGroup);
                        limit = partsData.length;
                        return [4 /*yield*/, Parts_V410_DAO_1.partsV410DAO.getPartsDataByRegion({
                                ids: idsToIndex,
                                limit: limit,
                                partTypeToIndex: partsTypeToIndex.toString(),
                                projections: projections,
                                region: region
                            })];
                    case 1:
                        searchData = (_a.sent()).searchData;
                        return [2 /*return*/, searchData];
                }
            });
        });
    };
    PartsV4Service.prototype.getPartsMeta = function (id, offset, limit, partType, format, responseGroup) {
        return __awaiter(this, void 0, void 0, function () {
            var partsCount, productHasParts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getHasPartsCount(id, partType, format)];
                    case 1:
                        partsCount = _a.sent();
                        return [4 /*yield*/, this.getHasParts(id, offset, limit, partType, format, responseGroup)];
                    case 2:
                        productHasParts = _a.sent();
                        return [2 /*return*/, { partsCount: partsCount, productHasParts: productHasParts }];
                }
            });
        });
    };
    PartsV4Service.prototype.getPartMeta = function (id, responseGroup, partId) {
        return __awaiter(this, void 0, void 0, function () {
            var projectionFields, filterPartfields, productHasPart;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        projectionFields = config_2.apiResponseGroupConfig.getProjectionFields('part', responseGroup);
                        filterPartfields = projectionFields.map(function (item) { return item.split('.')[1]; });
                        return [4 /*yield*/, this.getHasPart(id, partId)];
                    case 1:
                        productHasPart = _a.sent();
                        return [2 /*return*/, _.pick(productHasPart, filterPartfields)];
                }
            });
        });
    };
    PartsV4Service.prototype.getPartsMediumMeta = function (productsIds, productType, productVersion) {
        return __awaiter(this, void 0, void 0, function () {
            var projectionFields, productMediumData, productMediumResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        projectionFields = config_2.apiResponseGroupConfig.getProjectionFields(productType, 'partMedium');
                        return [4 /*yield*/, ProductV4_DAO_1.productV4DAO.getProductsByIds(productType, productsIds, { projectionFields: projectionFields })];
                    case 1:
                        productMediumData = _a.sent();
                        productMediumResponse = {};
                        productMediumResponse[productType] = productMediumData;
                        return [2 /*return*/, productMediumResponse];
                }
            });
        });
    };
    return PartsV4Service;
}());
exports.partsV4Service = new PartsV4Service();
