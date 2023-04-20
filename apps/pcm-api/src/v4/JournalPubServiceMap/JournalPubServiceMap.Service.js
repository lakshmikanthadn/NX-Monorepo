"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.journalPublishingServiceMapService = void 0;
var lodash_1 = require("lodash");
var config_1 = require("../../config/config");
var AppError_1 = require("../../model/AppError");
var AssetV4_Service_1 = require("../assets/AssetV4.Service");
var Event_Service_1 = require("../event/Event.Service");
var PublishingService_Service_1 = require("../publishingService/PublishingService.Service");
var JournalPubServiceMap_Dao_1 = require("./JournalPubServiceMap.Dao");
var JournalPubServiceMap_Validator_1 = require("./JournalPubServiceMap.Validator");
var JournalPublishingServiceMapService = /** @class */ (function () {
    function JournalPublishingServiceMapService() {
        this.journalPublishingServiceMapEventQueue = config_1.Config.getPropertyValue('journalPublishingServiceMapEventQueue');
        this.journalPublishingServiceSource = 'SALESFORCE';
    }
    /**
     * Will initiate the Journal to Service-Product Mapping Process by sending an event.
     * @param productIdentifier Only the acronym of the journal product is allowed.
     * @param productIdentifierName only journalAcronym value is allowed.
     * @param serviceProduct Mapping data to initiate the update Process.
     * @returns returns the the message id.
     */
    JournalPublishingServiceMapService.prototype.updateJournalPublishingServiceMap = function (productIdentifier, productIdentifierName, mappingData) {
        return __awaiter(this, void 0, void 0, function () {
            var asset;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (productIdentifierName !== 'journalAcronym') {
                            throw new AppError_1.AppError("Product-identifier ".concat(productIdentifierName, " is not allowed."), 400);
                        }
                        JournalPubServiceMap_Validator_1.journalPubServiceMapValidator.validate(mappingData);
                        return [4 /*yield*/, AssetV4_Service_1.assetV4Service.getProductByIdentifier(productIdentifierName, productIdentifier)];
                    case 1:
                        asset = _a.sent();
                        if (!asset) {
                            throw new AppError_1.AppError("A Journal must exist with ".concat(productIdentifierName) +
                                " ".concat(productIdentifier), 404);
                        }
                        return [4 /*yield*/, this.validatePubServiceIds(mappingData.publishingServices.map(function (ps) { return ps._id; }))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, Event_Service_1.eventService.sendProductEvent(__assign({ _id: productIdentifier }, mappingData), this.journalPublishingServiceMapEventQueue, this.journalPublishingServiceSource, {
                                productId: productIdentifier,
                                productType: 'journalPublishingServiceMapping'
                            })];
                }
            });
        });
    };
    JournalPublishingServiceMapService.prototype.getJournalPublishingServiceMap = function (productIdentifier, productIdentifierName, classificationName, classificationType, responseGroup) {
        return __awaiter(this, void 0, void 0, function () {
            var asset, publishingServiceMaps, publishingServices, promises;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, AssetV4_Service_1.assetV4Service.getProductByIdentifier(productIdentifierName, productIdentifier)];
                    case 1:
                        asset = _a.sent();
                        if (!asset) {
                            throw new AppError_1.AppError("A Journal must exist with ".concat(productIdentifierName) +
                                " ".concat(productIdentifier), 404);
                        }
                        return [4 /*yield*/, JournalPubServiceMap_Dao_1.journalPublishingServiceMapV4DAO.getJournalPublishingServiceMapById(asset.identifier.journalAcronym, responseGroup, classificationName, classificationType)];
                    case 2:
                        publishingServiceMaps = _a.sent();
                        if (!Array.isArray(publishingServiceMaps)) {
                            throw new AppError_1.AppError('Product Mapping not found.', 404);
                        }
                        publishingServices = [];
                        publishingServiceMaps.forEach(function (publishingServiceMap) {
                            publishingServices.push.apply(publishingServices, publishingServiceMap.publishingServices);
                        });
                        if (publishingServices.length === 0) {
                            throw new AppError_1.AppError('Products not found.', 404);
                        }
                        promises = publishingServices.map(function (publishingServiceData) { return __awaiter(_this, void 0, void 0, function () {
                            var publishingServiceMeta, _a, _b, prices, _c, subType;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0: return [4 /*yield*/, PublishingService_Service_1.publishingServiceProductService.getPublishingServiceById(publishingServiceData._id)];
                                    case 1:
                                        publishingServiceMeta = _d.sent();
                                        _a = publishingServiceMeta || {}, _b = _a.prices, prices = _b === void 0 ? null : _b, _c = _a.subType, subType = _c === void 0 ? null : _c;
                                        return [2 /*return*/, __assign(__assign({}, publishingServiceData), { prices: prices, subType: subType })];
                                }
                            });
                        }); });
                        return [2 /*return*/, Promise.all(promises)];
                }
            });
        });
    };
    /**
     * Validates if all IDs are publishing service products
     * if any one id is missing
     * or is not a publishingService
     * then throws error
     * @param pubServiceIds Publishing service ids
     * @returns {boolean} true or throws errors
     */
    JournalPublishingServiceMapService.prototype.validatePubServiceIds = function (pubServiceIds) {
        return __awaiter(this, void 0, void 0, function () {
            var uniqPubServiceIds, pubServiceAssets, missingPubServiceAssets, nonPubServiceAssets;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        uniqPubServiceIds = (0, lodash_1.uniq)(pubServiceIds);
                        return [4 /*yield*/, AssetV4_Service_1.assetV4Service.getAssetsByIds(uniqPubServiceIds, ['_id', 'type'])];
                    case 1:
                        pubServiceAssets = _a.sent();
                        if (!pubServiceAssets ||
                            pubServiceAssets.length !== uniqPubServiceIds.length) {
                            missingPubServiceAssets = (0, lodash_1.difference)(uniqPubServiceIds, pubServiceAssets.map(function (psa) { return psa._id; }));
                            throw new AppError_1.AppError('Invalid Publishing Service IDs in the Mapping.', 400, { ids: missingPubServiceAssets });
                        }
                        nonPubServiceAssets = pubServiceAssets.filter(function (psa) { return psa.type !== 'publishingService'; });
                        if (nonPubServiceAssets.length > 0) {
                            throw new AppError_1.AppError('Only Publishing Service IDs are allowed for Mapping.', 400, { assets: nonPubServiceAssets });
                        }
                        return [2 /*return*/, true];
                }
            });
        });
    };
    return JournalPublishingServiceMapService;
}());
exports.journalPublishingServiceMapService = new JournalPublishingServiceMapService();
