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
exports.creativeWorkV4Service = exports.CreativeWorkV4Service = void 0;
var config_1 = require("../../config/config");
var AppError_1 = require("../../model/AppError");
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var AssetV4_Service_1 = require("../assets/AssetV4.Service");
var AssociatedMediaV4_Service_1 = require("../associatedMedia/AssociatedMediaV4.Service");
var SimpleQueue_Service_1 = require("../aws/sqs/SimpleQueue.Service");
var ProductV4_Service_1 = require("../products/ProductV4.Service");
var CreativeWorkV4_DAO_1 = require("./CreativeWorkV4.DAO");
var log = LoggerUtil_1.default.getLogger('CreativeWorkV4Service');
var CreativeWorkV4Service = /** @class */ (function () {
    function CreativeWorkV4Service() {
        this.creativeWorkFIFOQueue = config_1.Config.getPropertyValue('creativeWorkFIFOQueue');
    }
    CreativeWorkV4Service.prototype.getCreativeWorkByIds = function (productIds, projectionData) {
        if (projectionData === void 0) { projectionData = []; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, CreativeWorkV4_DAO_1.creativeWorkV4Dao.getCreativeWorkByIds(productIds, projectionData)];
            });
        });
    };
    CreativeWorkV4Service.prototype.updateCreativeWorkSources = function (parentId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, CreativeWorkV4_DAO_1.creativeWorkV4Dao.updateCreativeWorkSources(parentId)];
            });
        });
    };
    CreativeWorkV4Service.prototype.createCreativeWork = function (creativeWork) {
        return __awaiter(this, void 0, void 0, function () {
            var isHyperLinkProduct, createdCreativeWorkData, notification;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.debug("createCreativeWork");
                        creativeWork.identifiers.doi = "10.4324/".concat(creativeWork._id);
                        isHyperLinkProduct = creativeWork.creativeWork.format === 'hyperlink';
                        if (isHyperLinkProduct &&
                            !(creativeWork['associatedMedia'] &&
                                Array.isArray(creativeWork['associatedMedia']))) {
                            throw new AppError_1.AppError('associatedMedia with location is required when format is hyperlink', 400);
                        }
                        if (isHyperLinkProduct && creativeWork['associatedMedia'].length !== 1) {
                            throw new AppError_1.AppError('currently we are supporting only single associatedMedia', 400);
                        }
                        if (isHyperLinkProduct && !creativeWork['associatedMedia'][0].location) {
                            throw new AppError_1.AppError('location is required', 400);
                        }
                        return [4 /*yield*/, CreativeWorkV4_DAO_1.creativeWorkV4Dao.createCreativeWork(creativeWork)];
                    case 1:
                        createdCreativeWorkData = _a.sent();
                        if (!isHyperLinkProduct) return [3 /*break*/, 3];
                        return [4 /*yield*/, AssociatedMediaV4_Service_1.associatedMediaV4Service.createAssociatedMedia(this.prepareHyperlinkAsstMedia(creativeWork))];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, AssetV4_Service_1.assetV4Service.createAsset(this.prepareNewAssetForCreativeWork(creativeWork))];
                    case 4:
                        _a.sent();
                        notification = this.prepareNotificationV4(creativeWork);
                        return [4 /*yield*/, SimpleQueue_Service_1.simpleQueueService.sendMessage(this.creativeWorkFIFOQueue, JSON.stringify(notification), createdCreativeWorkData._id)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, { _id: createdCreativeWorkData._id }];
                }
            });
        });
    };
    CreativeWorkV4Service.prototype.prepareNotificationV4 = function (creativeWork) {
        return {
            application: 'PAC API',
            assetType: 'CREATIVEWORK',
            eventType: 'AGGREGATION4',
            messageTimestamp: new Date(),
            messageType: 'CREATE',
            productType: 'CREATIVEWORK',
            publishingItemId: creativeWork._id,
            sourceFileUrl: '',
            status: 'SUCCESS'
        };
    };
    CreativeWorkV4Service.prototype.prepareNewAssetForCreativeWork = function (creativeWork) {
        return {
            _id: creativeWork._id,
            _sources: creativeWork._sources,
            identifier: {
                doi: creativeWork.identifiers.doi,
                editionId: creativeWork.identifiers.editionId || null,
                orderNumber: creativeWork.identifiers.orderNumber || null,
                productId: creativeWork.identifiers.productId || null
            },
            type: creativeWork.type
        };
    };
    CreativeWorkV4Service.prototype.prepareHyperlinkAsstMedia = function (creativeWork) {
        return {
            _id: ProductV4_Service_1.productV4Service.getNewId(),
            location: creativeWork['associatedMedia'][0].location,
            parentId: creativeWork._id,
            parentType: creativeWork.type,
            size: null,
            type: 'hyperlink',
            versionType: 'FINAL'
        };
    };
    return CreativeWorkV4Service;
}());
exports.CreativeWorkV4Service = CreativeWorkV4Service;
// This module exports only one instance of the CreativeWorkV4Service instead of exporting the class
exports.creativeWorkV4Service = new CreativeWorkV4Service();
