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
exports.taxonomyV4DAO = void 0;
var pcm_entity_model_v4_1 = require("@tandfgroup/pcm-entity-model-v4");
var mongoose = require("mongoose");
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var config_1 = require("../../config/config");
var AppError_1 = require("../../model/AppError");
var log = LoggerUtil_1.default.getLogger('TaxonomyV4DAO');
var docTypeToCollectionMapperV4 = config_1.Config.getPropertyValue('docTypeToCollectionMapperV4');
var TaxonomyV4DAO = /** @class */ (function () {
    function TaxonomyV4DAO() {
        var collectionName = docTypeToCollectionMapperV4.taxonomy;
        this.model = mongoose.model('TaxonomyV4', pcm_entity_model_v4_1.MongooseSchema.Taxonomy, collectionName);
        this.TaxonomyMaster = mongoose.model('TaxonomyMaster', pcm_entity_model_v4_1.MongooseSchema.ClassificationSchema, docTypeToCollectionMapperV4.taxonomyMaster);
    }
    TaxonomyV4DAO.prototype.getTaxonomy = function (assetType, taxonomyType, taxonomyFilter, projectionFields) {
        return __awaiter(this, void 0, void 0, function () {
            var query, projections;
            return __generator(this, function (_a) {
                log.debug('getTaxonomy:: ', { assetType: assetType, taxonomyFilter: taxonomyFilter, taxonomyType: taxonomyType });
                query = {
                    status: 'active'
                };
                if (taxonomyType) {
                    query['type'] = taxonomyType;
                }
                if (assetType) {
                    query['assetType'] = assetType;
                }
                if (taxonomyFilter.name) {
                    query['name'] = taxonomyFilter.name;
                }
                if (taxonomyFilter.code) {
                    query['code'] = taxonomyFilter.isCodePrefix
                        ? { $regex: "^".concat(taxonomyFilter.code) }
                        : taxonomyFilter.code;
                }
                if (taxonomyFilter.level) {
                    query['level'] = taxonomyFilter.extendLevel
                        ? { $gte: taxonomyFilter.level }
                        : taxonomyFilter.level;
                }
                log.debug('getTaxonomy:: ', { query: query });
                projections = this.prepareMongoProjections(projectionFields);
                return [2 /*return*/, this.model
                        .find(query, projections)
                        .lean()
                        .exec()
                        .catch(function (error) {
                        return Promise.reject('We are unable to find the Taxonomy.');
                    })];
            });
        });
    };
    TaxonomyV4DAO.prototype.getTaxonomyClassifications = function (taxonomyFilter, projectionFields) {
        return __awaiter(this, void 0, void 0, function () {
            var query, projections;
            return __generator(this, function (_a) {
                log.debug('getTaxonomyClassifications:: ', { taxonomyFilter: taxonomyFilter });
                query = {
                    classificationFamily: taxonomyFilter.classificationFamily,
                    status: 'active'
                };
                if (taxonomyFilter.classificationType) {
                    query['classificationType'] = taxonomyFilter.classificationType;
                }
                if (taxonomyFilter.code) {
                    query['code'] =
                        taxonomyFilter.level || taxonomyFilter.includeChildren
                            ? { $regex: "^".concat(taxonomyFilter.code) }
                            : taxonomyFilter.code;
                }
                if (taxonomyFilter.level) {
                    query['level'] = taxonomyFilter.includeChildren
                        ? { $gte: taxonomyFilter.level }
                        : taxonomyFilter.level;
                }
                log.debug('getTaxonomyClassifications:: ', { query: query });
                projections = this.prepareMongoProjections(projectionFields);
                try {
                    return [2 /*return*/, this.TaxonomyMaster.find(query, projections)
                            .sort({ _id: 1 })
                            .lean()
                            .exec()];
                }
                catch (error) {
                    return [2 /*return*/, Promise.reject('We are unable to find the Taxonomy.')];
                }
                return [2 /*return*/];
            });
        });
    };
    TaxonomyV4DAO.prototype.prepareMongoProjections = function (projectionFields) {
        if (Array.isArray(projectionFields)) {
            var projections_1 = {};
            projectionFields.forEach(function (property) {
                projections_1[property] = 1;
            });
            return projections_1;
        }
        else {
            throw new AppError_1.AppError('Invalid projections.', 400);
        }
    };
    return TaxonomyV4DAO;
}());
exports.taxonomyV4DAO = new TaxonomyV4DAO();
