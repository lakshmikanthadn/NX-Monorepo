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
exports.partsrevisionV4Service = void 0;
var AppError_1 = require("../../model/AppError");
var Parts_Util_1 = require("../../utils/parts/Parts.Util");
var AssetV4_Service_1 = require("../assets/AssetV4.Service");
var PartsRevisionV4_DAO_1 = require("../parts/PartsRevisionV4.DAO");
var PartsV4_Service_1 = require("../parts/PartsV4.Service");
var AssociatedMediaV4_DAO_1 = require("../associatedMedia/AssociatedMediaV4.DAO");
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var log = LoggerUtil_1.default.getLogger('PartsRevisonV4Service');
var PartsRevisionV4Service = /** @class */ (function () {
    function PartsRevisionV4Service() {
    }
    PartsRevisionV4Service.prototype.getPartsRevisionDataByDate = function (id, fromDate, toDate) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                log.debug("getPartsRevisionDataByDate:: ", {
                    fromDate: fromDate,
                    id: id,
                    toDate: toDate
                });
                return [2 /*return*/, PartsRevisionV4_DAO_1.partsRevisionV4DAO.getPartsRevisionDataByDate(id, fromDate, toDate)];
            });
        });
    };
    PartsRevisionV4Service.prototype.getProductPartsDelta = function (id, fromDate, toDate, requestedParts, channel, responseGroup) {
        return __awaiter(this, void 0, void 0, function () {
            var fromdate, todate, asset, partsRevisionData, partsAdded, partsRemoved, partsUpdated, finalPartsAdded, finalPartsRemoved, finalPartsUpdated, partsAddedIfChannel, _a, addedPartsDataFromSearchResult, removedPartsDataFromSearchResult, updatedPartsDataFromSearchResult;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        log.debug('getProductPartsDelta:: ', JSON.stringify({
                            fromDate: fromDate,
                            id: id,
                            responseGroup: responseGroup,
                            toDate: toDate
                        }));
                        fromdate = new Date(fromDate);
                        todate = new Date(toDate);
                        if (fromdate > todate) {
                            throw new AppError_1.AppError('fromDate should be less than or equal to todate', 400);
                        }
                        return [4 /*yield*/, AssetV4_Service_1.assetV4Service.getAssetById(id, [
                                'type'
                            ])];
                    case 1:
                        asset = _b.sent();
                        if (!asset || asset.type !== 'collection') {
                            throw new AppError_1.AppError('No such collection (product) found', 404);
                        }
                        return [4 /*yield*/, exports.partsrevisionV4Service.getPartsRevisionDataByDate(id, fromDate, toDate)];
                    case 2:
                        partsRevisionData = _b.sent();
                        if (!partsRevisionData) {
                            throw new AppError_1.AppError('Parts data not found for this product.', 404);
                        }
                        partsAdded = [];
                        partsRemoved = [];
                        partsUpdated = [];
                        partsRevisionData.forEach(function (partsRevision) {
                            if (partsRevision.partsAdded && requestedParts.includes('partsAdded')) {
                                partsAdded = partsAdded.concat(partsRevision.partsAdded);
                            }
                            if (partsRevision.partsRemoved &&
                                requestedParts.includes('partsRemoved')) {
                                partsRemoved = partsRemoved.concat(partsRevision.partsRemoved);
                            }
                            if (partsRevision.partsUpdated &&
                                requestedParts.includes('partsUpdated')) {
                                partsUpdated = partsUpdated.concat(partsRevision.partsUpdated);
                            }
                        });
                        finalPartsAdded = [];
                        finalPartsRemoved = [];
                        finalPartsUpdated = [];
                        partsAddedIfChannel = [];
                        return [4 /*yield*/, this.handleDateFilterOfPartsData(partsAdded, partsRemoved, partsUpdated, responseGroup)];
                    case 3:
                        _a = _b.sent(), addedPartsDataFromSearchResult = _a.addedPartsDataFromSearchResult, removedPartsDataFromSearchResult = _a.removedPartsDataFromSearchResult, updatedPartsDataFromSearchResult = _a.updatedPartsDataFromSearchResult;
                        finalPartsAdded = Parts_Util_1.partsUtil.mergePartsAndProductPartsData(partsAdded, addedPartsDataFromSearchResult);
                        finalPartsRemoved = Parts_Util_1.partsUtil.mergePartsAndProductPartsData(partsRemoved, removedPartsDataFromSearchResult);
                        finalPartsUpdated = Parts_Util_1.partsUtil.mergePartsAndProductPartsData(partsUpdated, updatedPartsDataFromSearchResult);
                        if (!channel) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.filterNoContent(finalPartsAdded)];
                    case 4:
                        partsAddedIfChannel = _b.sent();
                        return [2 /*return*/, {
                                partsAdded: partsAddedIfChannel,
                                partsRemoved: finalPartsRemoved,
                                partsUpdated: finalPartsUpdated
                            }];
                    case 5: return [2 /*return*/, {
                            partsAdded: finalPartsAdded,
                            partsRemoved: finalPartsRemoved,
                            partsUpdated: finalPartsUpdated
                        }];
                }
            });
        });
    };
    PartsRevisionV4Service.prototype.filterNoContent = function (finalPartsAdded) {
        return __awaiter(this, void 0, void 0, function () {
            var partsAddedContent, filterFinalPartsAdded;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, AssociatedMediaV4_DAO_1.associatedMediaV4Dao.isContentExists(finalPartsAdded, ['parentId'])];
                    case 1:
                        partsAddedContent = _a.sent();
                        filterFinalPartsAdded = finalPartsAdded.filter(function (parts) {
                            return parts._id === partsAddedContent[partsAddedContent.indexOf(parts._id)];
                        });
                        return [2 /*return*/, filterFinalPartsAdded];
                }
            });
        });
    };
    PartsRevisionV4Service.prototype.handleDateFilterOfPartsData = function (partsAdded, partsRemoved, partsUpdated, responseGroup) {
        return __awaiter(this, void 0, void 0, function () {
            var searchDataForAddedParts, _a, searchDataForRemovedParts, _b, searchDataForUpdatedParts, _c, addedPartsDataFromSearchResult, removedPartsDataFromSearchResult, updatedPartsDataFromSearchResult;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!(partsAdded.length > 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, PartsV4_Service_1.partsV4Service.getSearchResults(partsAdded, { responseGroup: responseGroup })];
                    case 1:
                        _a = _d.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = [];
                        _d.label = 3;
                    case 3:
                        searchDataForAddedParts = _a;
                        if (!(partsRemoved.length > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, PartsV4_Service_1.partsV4Service.getSearchResults(partsRemoved, { responseGroup: responseGroup })];
                    case 4:
                        _b = _d.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        _b = [];
                        _d.label = 6;
                    case 6:
                        searchDataForRemovedParts = _b;
                        if (!(partsUpdated.length > 0)) return [3 /*break*/, 8];
                        return [4 /*yield*/, PartsV4_Service_1.partsV4Service.getSearchResults(partsUpdated, { responseGroup: responseGroup })];
                    case 7:
                        _c = _d.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        _c = [];
                        _d.label = 9;
                    case 9:
                        searchDataForUpdatedParts = _c;
                        addedPartsDataFromSearchResult = searchDataForAddedParts.length > 0
                            ? Parts_Util_1.partsUtil.getPartsDataFromSearchResult(searchDataForAddedParts)
                            : [];
                        removedPartsDataFromSearchResult = searchDataForRemovedParts.length > 0
                            ? Parts_Util_1.partsUtil.getPartsDataFromSearchResult(searchDataForRemovedParts)
                            : [];
                        updatedPartsDataFromSearchResult = searchDataForUpdatedParts.length > 0
                            ? Parts_Util_1.partsUtil.getPartsDataFromSearchResult(searchDataForUpdatedParts)
                            : [];
                        return [2 /*return*/, {
                                addedPartsDataFromSearchResult: addedPartsDataFromSearchResult,
                                removedPartsDataFromSearchResult: removedPartsDataFromSearchResult,
                                updatedPartsDataFromSearchResult: updatedPartsDataFromSearchResult
                            }];
                }
            });
        });
    };
    return PartsRevisionV4Service;
}());
exports.partsrevisionV4Service = new PartsRevisionV4Service();
