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
exports.assetDaoV4 = exports.AssetV4DAO = void 0;
var pcm_entity_model_v4_1 = require("@tandfgroup/pcm-entity-model-v4");
var mongoose = require("mongoose");
var config_1 = require("../../config/config");
var constant_1 = require("../../config/constant");
var AppError_1 = require("../../model/AppError");
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var log = LoggerUtil_1.default.getLogger('AssetV4DAO');
var docTypeToCollectionMapperV4 = config_1.Config.getPropertyValue('docTypeToCollectionMapperV4');
var AssetV4DAO = /** @class */ (function () {
    function AssetV4DAO() {
        var collectionName = docTypeToCollectionMapperV4.asset;
        this.model = mongoose.model('AssetV4', pcm_entity_model_v4_1.MongooseSchema.Asset, collectionName);
    }
    /**
     * This method finds the asset by id from the mongoDB.
     * @param id
     */
    AssetV4DAO.prototype.getAssetById = function (id, projectionProperties) {
        if (projectionProperties === void 0) { projectionProperties = []; }
        return __awaiter(this, void 0, void 0, function () {
            var projection, query;
            return __generator(this, function (_a) {
                log.debug("getAssetById:: id: ".concat(id));
                projection = {};
                if (projectionProperties.length > 0) {
                    projectionProperties.forEach(function (propertyName) { return (projection[propertyName] = 1); });
                }
                query = { _id: id };
                return [2 /*return*/, this.getAsset(query, projection)];
            });
        });
    };
    AssetV4DAO.prototype.getAssetsByIds = function (ids, projectionProperties) {
        if (projectionProperties === void 0) { projectionProperties = []; }
        return __awaiter(this, void 0, void 0, function () {
            var projection, query;
            return __generator(this, function (_a) {
                log.debug("getAssetsByIds:: ids: ".concat(ids.join()));
                projection = {};
                if (projectionProperties.length > 0) {
                    projectionProperties.forEach(function (propertyName) { return (projection[propertyName] = 1); });
                }
                query = { _id: { $in: ids } };
                return [2 /*return*/, this.getAssets(query, projection)];
            });
        });
    };
    AssetV4DAO.prototype.getAssetByIdentifierNameValue = function (identifierName, identifierValue, projectionProperties) {
        return __awaiter(this, void 0, void 0, function () {
            var keyNameMapper, query, projection;
            return __generator(this, function (_a) {
                log.debug('getAssetByIdentifierNameValue:: ', {
                    identifierName: identifierName,
                    identifierValue: identifierValue
                });
                keyNameMapper = constant_1.AppConstants.AssetIdentifiersNameMappingV4;
                query = {};
                projection = {};
                projectionProperties.forEach(function (propertyName) { return (projection[propertyName] = 1); });
                query[keyNameMapper[identifierName]] = { $eq: identifierValue };
                return [2 /*return*/, this.getAsset(query, projection)];
            });
        });
    };
    AssetV4DAO.prototype.updateAssetSources = function (parentId) {
        return __awaiter(this, void 0, void 0, function () {
            var condition, updateQuery;
            return __generator(this, function (_a) {
                log.debug('updateAssetSources', { parentId: parentId });
                condition = { _id: parentId, '_sources.type': { $ne: 'content' } };
                updateQuery = {
                    $push: { _sources: { source: 'WEBCMS', type: 'content' } }
                };
                return [2 /*return*/, this.model
                        .findOneAndUpdate(condition, updateQuery, { new: true })
                        .lean()
                        .exec()
                        .catch(function (error) {
                        return Promise.reject('Error while updating asset');
                    })];
            });
        });
    };
    AssetV4DAO.prototype.createAsset = function (asset) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                log.debug('createAsset:: asset: ', asset);
                return [2 /*return*/, this.model
                        .create(asset)
                        .then(function (createdAsset) {
                        return Promise.resolve(createdAsset.toObject());
                    })
                        .catch(function (error) {
                        throw new AppError_1.AppError('Error while creating asset', 400, error);
                    })];
            });
        });
    };
    AssetV4DAO.prototype.getAssetsByIdentifierNameValues = function (keyname, keyvalues, productType) {
        return __awaiter(this, void 0, void 0, function () {
            var keyNameMapper, query;
            return __generator(this, function (_a) {
                log.debug('getAssetsByIdentifierNameValues:: ', {
                    keyname: keyname,
                    keyvalues: keyvalues,
                    productType: productType
                });
                keyNameMapper = constant_1.AppConstants.AssetIdentifiersNameMappingV4;
                query = {};
                query[keyNameMapper[keyname]] = { $in: keyvalues };
                if (productType) {
                    query['type'] = productType;
                }
                return [2 /*return*/, this.getAssets(query, {})];
            });
        });
    };
    AssetV4DAO.prototype.getAsset = function (query, projections) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                log.debug("getAsset::, query: ".concat(JSON.stringify(query)));
                return [2 /*return*/, this.model
                        .findOne(query, projections)
                        .lean()
                        .exec()
                        .catch(function (error) {
                        return Promise.reject('We are unable to find the asset.');
                    })];
            });
        });
    };
    AssetV4DAO.prototype.getAssets = function (query, projections) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                log.debug("getAssets::, query: ".concat(JSON.stringify(query)));
                return [2 /*return*/, this.model
                        .find(query, projections)
                        .lean()
                        .exec()
                        .catch(function (error) {
                        return Promise.reject('We are unable to find the assets.');
                    })];
            });
        });
    };
    return AssetV4DAO;
}());
exports.AssetV4DAO = AssetV4DAO;
// This module exports only one instance of the AssetDAO instead of exporting the class.
exports.assetDaoV4 = new AssetV4DAO();
