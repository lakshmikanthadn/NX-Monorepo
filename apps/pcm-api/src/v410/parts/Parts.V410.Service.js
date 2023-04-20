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
exports.partsV410Service = void 0;
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var rTracer = require("cls-rtracer");
var lodash_1 = require("lodash");
var config_1 = require("../../config/config");
var AppError_1 = require("../../model/AppError");
var CollectionRevisionV4_Service_1 = require("../../v4/collection/CollectionRevisionV4.Service");
var PartsRevisionV4_Service_1 = require("../../v4/parts/PartsRevisionV4.Service");
var AssetV4_Service_1 = require("../../v4/assets/AssetV4.Service");
var Parts_Util_1 = require("../../utils/parts/Parts.Util");
var Parts_V410_DAO_1 = require("./Parts.V410.DAO");
var log = LoggerUtil_1.default.getLogger('PartsV410Service');
var docTypeToESIndexMapperV4 = config_1.Config.getPropertyValue('docTypeToESIndexMapperV4');
var PartsV410Service = /** @class */ (function () {
    function PartsV410Service() {
    }
    PartsV410Service.prototype.getProductHasParts = function (id, limit, offsetCursor, region, version, searchTerm, responseGroup) {
        if (responseGroup === void 0) { responseGroup = 'small'; }
        return __awaiter(this, void 0, void 0, function () {
            var asset, collectionVersion, collectionRevisionData, collectionRevisionId, partsRevisionData, partsData, _a, searchData, searchTotalCount, firstOrLastPageData, offsetCursorLast, searchedPartsData, mergedPartsData, counts, paginationData, respMetadata;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        log.debug('getProductHasParts:: ', JSON.stringify({
                            id: id,
                            limit: limit,
                            offsetCursor: offsetCursor,
                            region: region,
                            responseGroup: responseGroup,
                            searchTerm: searchTerm,
                            version: version
                        }));
                        return [4 /*yield*/, AssetV4_Service_1.assetV4Service.getAssetById(id, [
                                'type'
                            ])];
                    case 1:
                        asset = _b.sent();
                        if (!asset || asset.type !== 'collection') {
                            throw new AppError_1.AppError('No such collection (product) found', 404);
                        }
                        collectionVersion = [];
                        if (version) {
                            collectionVersion.push(version);
                        }
                        return [4 /*yield*/, CollectionRevisionV4_Service_1.collectionRevisionV4Service.getCollectionRevisionData(id, collectionVersion, ['_id'])];
                    case 2:
                        collectionRevisionData = _b.sent();
                        if (!collectionRevisionData || !collectionRevisionData.length) {
                            throw new AppError_1.AppError('No revision data found for this collection.', 404);
                        }
                        collectionRevisionId = collectionRevisionData[0]._id;
                        return [4 /*yield*/, PartsRevisionV4_Service_1.partsRevisionV4Service.getPartsRevisionDataByIds(collectionRevisionId, responseGroup)];
                    case 3:
                        partsRevisionData = _b.sent();
                        if (!(partsRevisionData && partsRevisionData.length)) {
                            throw new AppError_1.AppError('No parts data found for this product.', 404);
                        }
                        partsData = partsRevisionData[0].parts;
                        return [4 /*yield*/, this.getSearchResults(partsData, responseGroup, offsetCursor, limit, region, searchTerm)];
                    case 4:
                        _a = _b.sent(), searchData = _a.searchData, searchTotalCount = _a.searchTotalCount;
                        if (!!offsetCursor) return [3 /*break*/, 6];
                        offsetCursorLast = 'last-page-cursor';
                        return [4 /*yield*/, this.getSearchResults(partsData, 'small', offsetCursorLast, 1, region, searchTerm)];
                    case 5:
                        firstOrLastPageData = (_b.sent()).searchData;
                        _b.label = 6;
                    case 6:
                        if (!(offsetCursor === 'last-page-cursor')) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.getSearchResults(partsData, 'small', null, 1, region, searchTerm)];
                    case 7:
                        firstOrLastPageData = (_b.sent()).searchData;
                        _b.label = 8;
                    case 8:
                        searchedPartsData = Parts_Util_1.partsUtil.getPartsDataFromSearchResult(searchData);
                        mergedPartsData = Parts_Util_1.partsUtil.mergePartsAndProductPartsData(partsData, searchedPartsData);
                        counts = [];
                        counts.push({
                            count: searchTotalCount,
                            formatsCount: [],
                            type: 'total'
                        });
                        paginationData = this.preparePaginationData(offsetCursor, searchData, firstOrLastPageData);
                        respMetadata = {
                            counts: counts,
                            isFirstPageReached: paginationData.isFirstPageReached,
                            isLastPageReached: paginationData.isLastPageReached,
                            lastPageCursor: paginationData.lastPageCursor,
                            limit: limit,
                            nextPageCursor: paginationData.nextPageCursor,
                            prevPageCursor: paginationData.prevPageCursor,
                            source: 'Elasticsearch',
                            transactionId: rTracer.id()
                        };
                        return [2 /*return*/, {
                                data: mergedPartsData,
                                metadata: respMetadata
                            }];
                }
            });
        });
    };
    PartsV410Service.prototype.prepareSortOrder = function (offsetCursor) {
        var sortOrder = 'desc';
        // change default sort order 'asc' if custom offsetCursor present
        // if offsetCursor is 'last-page-cursor' change sort order
        // to desc as it is the last page
        if (offsetCursor) {
            if (offsetCursor !== 'last-page-cursor') {
                var offsetCursorArrForColon = offsetCursor.split(':');
                var offsetCursorArr = offsetCursorArrForColon[offsetCursorArrForColon.length - 1].split('_');
                sortOrder = offsetCursorArr[2];
                offsetCursor = offsetCursorArr[0].concat('_', offsetCursorArr[1]);
            }
            else {
                sortOrder = 'asc';
            }
        }
        return { newOffsetCursor: offsetCursor, sortOrder: sortOrder };
    };
    PartsV410Service.prototype.preparePaginationData = function (offsetCursor, searchData, firstOrLastPageData) {
        var lastPageId = null;
        var firstPageId = null;
        // prepare first time and later use it in forthcoming request
        if (!offsetCursor || offsetCursor === 'last-page-cursor') {
            if (!offsetCursor) {
                lastPageId = firstOrLastPageData[0]._source.tieBreakerId;
                firstPageId = searchData[0]._id;
            }
            else {
                firstPageId = firstOrLastPageData[0]._source.tieBreakerId;
                lastPageId = searchData.slice(-1)[0]._id;
            }
        }
        else {
            firstPageId = offsetCursor.split(':')[0];
            lastPageId = offsetCursor.split(':')[1];
        }
        var nextPageCursor = this._getNextPageCursor(searchData, firstPageId, lastPageId);
        var prevPageCursor = this._getPrevPageCursor(searchData, firstPageId, lastPageId);
        // delete searchAfterParams once next/prev cursor is prepared
        return {
            isFirstPageReached: prevPageCursor === null ? true : false,
            isLastPageReached: nextPageCursor === null ? true : false,
            lastPageCursor: offsetCursor === 'last-page-cursor' ? null : 'last-page-cursor',
            nextPageCursor: offsetCursor === 'last-page-cursor' ? null : nextPageCursor,
            prevPageCursor: !offsetCursor ? null : prevPageCursor
        };
    };
    PartsV410Service.prototype._getNextPageCursor = function (data, firstPageId, lastPageId) {
        if (data && data.length > 0) {
            var textToAppend = 'desc';
            var searchAfterParams = (0, lodash_1.get)(data[data.length - 1], 'sort', null);
            var cursor = searchAfterParams[1];
            if (cursor === lastPageId)
                return null;
            else {
                var nextPageCursor = searchAfterParams.join('_');
                return "".concat(firstPageId, ":").concat(lastPageId, ":").concat(nextPageCursor, "_").concat(textToAppend);
            }
        }
        return null;
    };
    PartsV410Service.prototype._getPrevPageCursor = function (data, firstPageId, lastPageId) {
        if (data && data.length > 0) {
            var textToAppend = 'asc';
            var searchAfterParams = (0, lodash_1.get)(data[0], 'sort', null);
            var cursor = searchAfterParams[1];
            if (cursor === firstPageId)
                return null;
            else {
                var prevPageCursor = searchAfterParams.join('_');
                return "".concat(firstPageId, ":").concat(lastPageId, ":").concat(prevPageCursor, "_").concat(textToAppend);
            }
        }
        return null;
    };
    PartsV410Service.prototype.getSearchResults = function (partsData, responseGroup, offsetCursor, limit, region, searchTerm) {
        return __awaiter(this, void 0, void 0, function () {
            var partsTypeToIndex, idsToIndex, projections, _a, newOffsetCursor, sortOrder, _b, searchData, searchTotalCount;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        partsTypeToIndex = Parts_Util_1.partsUtil.getUniquePartTypesToIndex(partsData);
                        idsToIndex = Parts_Util_1.partsUtil.getIdsFromParts(partsData);
                        projections = Parts_Util_1.partsUtil.getProjectionsBasedOnResponseGroup(responseGroup);
                        _a = this.prepareSortOrder(offsetCursor), newOffsetCursor = _a.newOffsetCursor, sortOrder = _a.sortOrder;
                        return [4 /*yield*/, Parts_V410_DAO_1.partsV410DAO.getPartsDataByRegion({
                                ids: idsToIndex,
                                limit: limit,
                                offsetCursor: newOffsetCursor,
                                partTypeToIndex: partsTypeToIndex.toString(),
                                projections: projections,
                                region: region,
                                searchTerm: searchTerm,
                                sortOrder: sortOrder
                            })];
                    case 1:
                        _b = _c.sent(), searchData = _b.searchData, searchTotalCount = _b.searchTotalCount;
                        if (Array.isArray(searchData) && searchData.length !== 0) {
                            if (newOffsetCursor &&
                                (newOffsetCursor === 'last-page-cursor' || sortOrder === 'asc')) {
                                // reverse original products
                                // this is only done for specific case when offset cursor is last-page-cursor
                                searchData.reverse();
                            }
                        }
                        else {
                            throw new AppError_1.AppError('No parts data found.', 404);
                        }
                        return [2 /*return*/, { searchData: searchData, searchTotalCount: searchTotalCount }];
                }
            });
        });
    };
    return PartsV410Service;
}());
exports.partsV410Service = new PartsV410Service();
