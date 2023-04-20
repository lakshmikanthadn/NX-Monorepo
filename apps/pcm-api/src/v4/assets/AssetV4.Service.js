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
exports.assetV4Service = void 0;
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var AppError_1 = require("../../model/AppError");
var AssetV4_DAO_1 = require("./AssetV4.DAO");
var ProductV4_Service_1 = require("../products/ProductV4.Service");
var log = LoggerUtil_1.default.getLogger('AssetV4Service');
var AssetV4Service = /** @class */ (function () {
    function AssetV4Service() {
    }
    AssetV4Service.prototype.getProductByIdentifier = function (identifierName, identifierValue) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                log.debug("getProductByIdentifier:: ", { identifierName: identifierName, identifierValue: identifierValue });
                return [2 /*return*/, AssetV4_DAO_1.assetDaoV4.getAssetByIdentifierNameValue(identifierName, identifierValue, [])];
            });
        });
    };
    AssetV4Service.prototype.createAsset = function (asset) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                log.debug("createAsset:: asset: ".concat(asset));
                return [2 /*return*/, AssetV4_DAO_1.assetDaoV4.createAsset(asset)];
            });
        });
    };
    AssetV4Service.prototype.updateAssetSources = function (parentId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                log.debug("updateAssetSources:: parentId: ".concat(parentId));
                return [2 /*return*/, AssetV4_DAO_1.assetDaoV4.updateAssetSources(parentId)];
            });
        });
    };
    AssetV4Service.prototype.getAssetById = function (id, projectionProperties) {
        if (projectionProperties === void 0) { projectionProperties = []; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                log.debug("getAssetById:: id: ".concat(id));
                return [2 /*return*/, AssetV4_DAO_1.assetDaoV4.getAssetById(id, projectionProperties)];
            });
        });
    };
    AssetV4Service.prototype.getAssetsByIds = function (ids, projectionProperties) {
        if (projectionProperties === void 0) { projectionProperties = []; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                log.debug("getAssetByIds:: ids: ".concat(ids.join()));
                return [2 /*return*/, AssetV4_DAO_1.assetDaoV4.getAssetsByIds(ids, projectionProperties)];
            });
        });
    };
    /**
     * Get the Product ID of the requested content by using
     * Note: Here the identifier should be unique,
     * if an given identifier matches more than one product an 400 error is thrown
     * except for the books where we try to get the eBook
     * @param identifierName identifier name (isbn/doi/_id)
     * @param identifierValue value of the identifier
     */
    AssetV4Service.prototype.getValidAssetByIdentifierNameValue = function (identifierName, identifierValue) {
        return __awaiter(this, void 0, void 0, function () {
            var assets, productTypes, uniqueProductTypes, bookAssets, ids, chapterAssets, assetsWithCmsContent;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        log.debug("getValidAssetByIdentifierNameValue:: ", {
                            identifierName: identifierName,
                            identifierValue: identifierValue
                        });
                        return [4 /*yield*/, this.getAssetsByIdentifierNameValues(identifierName, [
                                identifierValue
                            ])];
                    case 1:
                        assets = _b.sent();
                        if (!assets || assets.length <= 0) {
                            return [2 /*return*/, { _id: null, type: null }];
                        }
                        // If Only One Asset for the ID then Return
                        if (assets.length === 1) {
                            return [2 /*return*/, assets[0]];
                        }
                        productTypes = assets.map(function (asset) { return asset.type; });
                        uniqueProductTypes = new Set(productTypes);
                        if (!uniqueProductTypes.has('book')) return [3 /*break*/, 3];
                        bookAssets = assets.filter(function (asset) { return asset.type === 'book'; });
                        ids = bookAssets.map(function (book) { return book._id; });
                        _a = {};
                        return [4 /*yield*/, ProductV4_Service_1.productV4Service.getValidEbookId(ids, bookAssets[0].type)];
                    case 2: return [2 /*return*/, (_a._id = _b.sent(),
                            _a.type = bookAssets[0].type,
                            _a)];
                    case 3:
                        // Try to Pick the Best chapter if chapter Present
                        if (uniqueProductTypes.has('chapter')) {
                            chapterAssets = assets.filter(function (asset) { return asset.type === 'chapter'; });
                            assetsWithCmsContent = chapterAssets.filter(function (asset) {
                                return asset._sources.find(function (source) { return source.source === 'CMS'; });
                            });
                            if (assetsWithCmsContent.length === 0) {
                                assetsWithCmsContent = chapterAssets;
                            }
                            return [2 /*return*/, assetsWithCmsContent.sort(function (a, b) { return b._modifiedDate.getTime() - a._modifiedDate.getTime(); })[0]];
                        }
                        if (uniqueProductTypes.size > 1) {
                            log.error("Product identifier ".concat(identifierValue, " is associated with ") +
                                " multiple product types: ".concat(JSON.stringify(__spreadArray([], uniqueProductTypes, true))));
                            throw new AppError_1.AppError('Product identifier is associated with multiple product types.', 409);
                        }
                        else {
                            throw new AppError_1.AppError('Product identifier is associated with more than one Product.', 409);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AssetV4Service.prototype.getAssetsByIdentifierNameValues = function (keyname, keyvalues, productType) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                log.debug("getAssetsByIdentifierNameValues:: ", {
                    keyname: keyname,
                    keyvalues: keyvalues,
                    productType: productType
                });
                return [2 /*return*/, AssetV4_DAO_1.assetDaoV4.getAssetsByIdentifierNameValues(keyname, keyvalues, productType)];
            });
        });
    };
    return AssetV4Service;
}());
// This module exports only one instance of the AssetService instead of exporting the class.
exports.assetV4Service = new AssetV4Service();
