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
exports.publishingServiceProductService = void 0;
var lodash_1 = require("lodash");
var validator_1 = require("validator");
var config_1 = require("../../config/config");
var AppError_1 = require("../../model/AppError");
var AssetV4_Service_1 = require("../assets/AssetV4.Service");
var Event_Service_1 = require("../event/Event.Service");
var ProductV4_DAO_1 = require("../products/ProductV4.DAO");
var SchemaValidator_1 = require("../validator/SchemaValidator");
var PublishingServiceProductService = /** @class */ (function () {
    function PublishingServiceProductService() {
        this.publishingServiceProductEventQueue = config_1.Config.getPropertyValue('publishingServiceProductEventQueue');
        this.publishingServiceProductSource = 'SALESFORCE';
        this.schemaId = 'OpenApiSchema#/definitions/PublishingServiceProductRequest';
    }
    /**
     * Will initiate the Service Product Create Process by sending an event
     * @param id UUID for the product
     * @param serviceProduct ServiceProduct
     * @returns messageID
     */
    PublishingServiceProductService.prototype.createServiceProduct = function (id, serviceProduct) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handleServiceProduct(id, serviceProduct, 'create')];
            });
        });
    };
    /**
     * Will initiate the Service Product update Process by sending an event
     * @param id UUID for the product
     * @param serviceProduct ServiceProduct
     * @returns messageID
     */
    PublishingServiceProductService.prototype.updateServiceProduct = function (id, serviceProduct) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handleServiceProduct(id, serviceProduct, 'update')];
            });
        });
    };
    /**
     * Will initiate the Service Product get Process by sending an id
     * @param id UUID for the product
     */
    PublishingServiceProductService.prototype.getPublishingServiceById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var asset, projectionFields, publishingService, _a, _b, prices, _c, subType;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, AssetV4_Service_1.assetV4Service.getAssetById(id, [
                            'type'
                        ])];
                    case 1:
                        asset = _d.sent();
                        if (!asset) {
                            throw new AppError_1.AppError('Product (asset) not found.', 404);
                        }
                        projectionFields = ['prices', 'subType'];
                        return [4 /*yield*/, ProductV4_DAO_1.productV4DAO.getProduct(asset.type, id, projectionFields)];
                    case 2:
                        publishingService = _d.sent();
                        _a = publishingService || {}, _b = _a.prices, prices = _b === void 0 ? null : _b, _c = _a.subType, subType = _c === void 0 ? null : _c;
                        return [2 /*return*/, { prices: prices, subType: subType }];
                }
            });
        });
    };
    /**
     * Will initiate the Service Product create/update Process based on action
     * by sending an event
     * @param id UUID for the product
     * @param serviceProduct ServiceProduct
     * @param action create/update
     * @returns messageID
     */
    PublishingServiceProductService.prototype.handleServiceProduct = function (id, serviceProduct, action) {
        return __awaiter(this, void 0, void 0, function () {
            var asset;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(0, validator_1.isUUID)(id, 4)) {
                            throw new AppError_1.AppError('Invalid UUID(v4) in the path parameter.', 400, {
                                id: id
                            });
                        }
                        SchemaValidator_1.schemaValidator.validate(this.schemaId, (0, lodash_1.cloneDeep)(serviceProduct));
                        return [4 /*yield*/, AssetV4_Service_1.assetV4Service.getAssetById(id, ['_id', 'type'])];
                    case 1:
                        asset = _a.sent();
                        if (action === 'create' && asset && asset._id) {
                            throw new AppError_1.AppError("A product ".concat(asset.type, " already exists with id ").concat(id, "."), 409);
                        }
                        else if (action === 'update' && !asset) {
                            throw new AppError_1.AppError("Publishing Service product does NOT exists with id ".concat(id, "."), 404);
                        }
                        return [2 /*return*/, Event_Service_1.eventService.sendProductEvent(__assign(__assign({}, serviceProduct), { _id: id, _sources: [
                                    { source: this.publishingServiceProductSource, type: 'product' }
                                ] }), this.publishingServiceProductEventQueue, this.publishingServiceProductSource, { productId: id, productType: serviceProduct.type })];
                }
            });
        });
    };
    return PublishingServiceProductService;
}());
exports.publishingServiceProductService = new PublishingServiceProductService();
