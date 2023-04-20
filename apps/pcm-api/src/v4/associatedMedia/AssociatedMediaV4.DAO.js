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
exports.associatedMediaV4Dao = void 0;
var pcm_entity_model_v4_1 = require("@tandfgroup/pcm-entity-model-v4");
var mongoose = require("mongoose");
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var config_1 = require("../../config/config");
var AppError_1 = require("../../model/AppError");
var log = LoggerUtil_1.default.getLogger('AssociatedMediaDAO');
var docTypeToCollectionMapperV4 = config_1.Config.getPropertyValue('docTypeToCollectionMapperV4');
var AssociatedMediaV4DAO = /** @class */ (function () {
    function AssociatedMediaV4DAO() {
        var collectionName = docTypeToCollectionMapperV4.associatedmedia;
        this.model = mongoose.model('AssociatedMediaV4', pcm_entity_model_v4_1.MongooseSchema.AssociatedMedia, collectionName);
    }
    AssociatedMediaV4DAO.prototype.getAssociatedMediaByParentId = function (parentId, projectionData, currentVersion) {
        if (projectionData === void 0) { projectionData = []; }
        return __awaiter(this, void 0, void 0, function () {
            var projection;
            return __generator(this, function (_a) {
                log.debug('getAssociatedMediaByParentId', { parentId: parentId, projectionData: projectionData });
                projection = {};
                projectionData.forEach(function (property) {
                    projection[property] = 1;
                });
                if (currentVersion) {
                    return [2 /*return*/, this.model
                            .find({ parentId: parentId, versionType: currentVersion }, projection)
                            .lean()
                            .exec()
                            .catch(function (error) {
                            return Promise.reject('We are unable to find the AssociatedMedia.');
                        })];
                }
                else {
                    return [2 /*return*/, this.model
                            .find({ parentId: parentId }, projection)
                            .lean()
                            .exec()
                            .catch(function (error) {
                            return Promise.reject('We are unable to find the AssociatedMedia.');
                        })];
                }
                return [2 /*return*/];
            });
        });
    };
    AssociatedMediaV4DAO.prototype.getAsstMediasByParentIds = function (parentIds, projectionData) {
        if (projectionData === void 0) { projectionData = []; }
        return __awaiter(this, void 0, void 0, function () {
            var query, projection;
            return __generator(this, function (_a) {
                log.debug('getAsstMediasByParentIds', { parentIds: parentIds, projectionData: projectionData });
                query = { parentId: { $in: parentIds } };
                projection = {};
                projectionData.forEach(function (property) {
                    projection[property] = 1;
                });
                return [2 /*return*/, this.model
                        .find(query, projection)
                        .lean()
                        .exec()
                        .catch(function (error) {
                        return Promise.reject('We are unable to find the AssociatedMedia.');
                    })];
            });
        });
    };
    AssociatedMediaV4DAO.prototype.getAsstMediaByParentIdAndType = function (parentId, type, projectionData) {
        if (projectionData === void 0) { projectionData = []; }
        return __awaiter(this, void 0, void 0, function () {
            var query, projection;
            return __generator(this, function (_a) {
                log.debug('getAsstMediasByParentIds', { parentId: parentId, projectionData: projectionData });
                query = { parentId: parentId, type: type };
                projection = {};
                projectionData.forEach(function (property) {
                    projection[property] = 1;
                });
                return [2 /*return*/, this.model
                        .find(query, projection)
                        .lean()
                        .exec()
                        .catch(function (error) {
                        return Promise.reject('We are unable to find the AssociatedMedia.');
                    })];
            });
        });
    };
    AssociatedMediaV4DAO.prototype.getByParentIdAndLocation = function (parentId, location, projectionData) {
        if (projectionData === void 0) { projectionData = []; }
        return __awaiter(this, void 0, void 0, function () {
            var projection;
            return __generator(this, function (_a) {
                log.debug('getByParentIdAndLocation', {
                    location: location,
                    parentId: parentId,
                    projectionData: projectionData
                });
                projection = {};
                projectionData.forEach(function (property) {
                    projection[property] = 1;
                });
                return [2 /*return*/, this.model
                        .findOne({ location: location, parentId: parentId }, projection)
                        .lean()
                        .exec()
                        .catch(function (error) {
                        return Promise.reject('We are unable to find the AssociatedMedia.');
                    })];
            });
        });
    };
    AssociatedMediaV4DAO.prototype.isContentExists = function (partsAdded, projectionData) {
        return __awaiter(this, void 0, void 0, function () {
            var product, remainingProduct, remainingIds, ids, bookChapterPdfData, bookChapterPdfParentId, bookChapterXmlData, bookChapterXmlParentId, parentIds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.debug('isContentExists', {
                            partsAdded: partsAdded,
                            projectionData: projectionData
                        });
                        product = partsAdded.filter(function (parts) { return parts.type === 'book' || parts.type === 'chapter'; });
                        remainingProduct = partsAdded.filter(function (parts) { return !(parts.type === 'book' || parts.type === 'chapter'); });
                        remainingIds = remainingProduct.map(function (asset) { return asset._id; });
                        ids = product.map(function (asset) { return asset._id; });
                        return [4 /*yield*/, this.isPdfExists(ids, projectionData)];
                    case 1:
                        bookChapterPdfData = _a.sent();
                        bookChapterPdfParentId = bookChapterPdfData.map(function (asset) { return asset.parentId; });
                        return [4 /*yield*/, this.isXmlExists(bookChapterPdfParentId, projectionData)];
                    case 2:
                        bookChapterXmlData = _a.sent();
                        bookChapterXmlParentId = bookChapterXmlData.map(function (asset) { return asset.parentId; });
                        parentIds = remainingIds.concat(bookChapterXmlParentId);
                        return [2 /*return*/, parentIds];
                }
            });
        });
    };
    AssociatedMediaV4DAO.prototype.isPdfExists = function (ids, projectionData) {
        return __awaiter(this, void 0, void 0, function () {
            var query, projection;
            return __generator(this, function (_a) {
                query = {
                    parentId: { $in: ids },
                    type: { $in: ['webpdf', 'chapterpdf'] }
                };
                projection = {};
                projectionData.forEach(function (property) {
                    projection[property] = 1;
                });
                return [2 /*return*/, this.model
                        .find(query, projection)
                        .lean()
                        .exec()
                        .catch(function (error) {
                        return Promise.reject('We are unable to find pdf for this AssociatedMedia.');
                    })];
            });
        });
    };
    AssociatedMediaV4DAO.prototype.isXmlExists = function (ids, projectionData) {
        return __awaiter(this, void 0, void 0, function () {
            var query, projection;
            return __generator(this, function (_a) {
                query = {
                    parentId: { $in: ids },
                    type: { $eq: 'dbitsxml' }
                };
                projection = {};
                projectionData.forEach(function (property) {
                    projection[property] = 1;
                });
                return [2 /*return*/, this.model
                        .find(query, projection)
                        .lean()
                        .exec()
                        .catch(function () {
                        return Promise.reject('We are unable to find dbitsxml for the AssociatedMedia.');
                    })];
            });
        });
    };
    AssociatedMediaV4DAO.prototype.createAssociatedMedia = function (content) {
        log.debug('createAssociatedMedia:: content: ', content);
        return this.model.create(content).catch(function (error) {
            throw new AppError_1.AppError('Error while creating content', 400, error);
        });
    };
    return AssociatedMediaV4DAO;
}());
exports.associatedMediaV4Dao = new AssociatedMediaV4DAO();
