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
exports.preChapterProductService = void 0;
var lodash_1 = require("lodash");
var config_1 = require("../../config/config");
var AppError_1 = require("../../model/AppError");
var AssetV4_Service_1 = require("../assets/AssetV4.Service");
var Event_Service_1 = require("../event/Event.Service");
var SchemaValidator_1 = require("../validator/SchemaValidator");
var ProductV4_Service_1 = require("../products/ProductV4.Service");
var ProductV4_DAO_1 = require("../products/ProductV4.DAO");
var PreChapterProductService = /** @class */ (function () {
    function PreChapterProductService() {
        this.preChapterProductEventQueue = config_1.Config.getPropertyValue('preChapterProductEventQueue');
        this.preChapterProductSource = 'ACTIVITY';
        this.schemaId = 'OpenApiSchema#/definitions/PreChapterProductRequest';
        this.bookStatus = ['Out of Print', 'Deprecated', 'Withdrawn'];
    }
    /**
     * Will initiate the Service Product Create Process by sending an event
     * @param id UUID for the product
     * @param serviceProduct ServiceProduct
     * @returns messageID
     */
    PreChapterProductService.prototype.createPreChapterProduct = function (serviceProduct) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handleServiceProduct(serviceProduct, 'create', ProductV4_Service_1.productV4Service.getNewId())];
            });
        });
    };
    /**
     * Will initiate the Service Product update Process by sending an event
     * @param id UUID for the product
     * @param serviceProduct ServiceProduct
     * @returns messageID
     */
    PreChapterProductService.prototype.updatePreChapterProduct = function (id, serviceProduct) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.handleServiceProduct(serviceProduct, 'update', id)];
            });
        });
    };
    PreChapterProductService.prototype.handleServiceProduct = function (preChapterProduct, action, id) {
        return __awaiter(this, void 0, void 0, function () {
            var asset;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        SchemaValidator_1.schemaValidator.validate(this.schemaId, (0, lodash_1.cloneDeep)(preChapterProduct));
                        if (!(action === 'create')) return [3 /*break*/, 2];
                        if (preChapterProduct.isPartOf.length != 1) {
                            throw new AppError_1.AppError("isPartOf should have length one.", 400);
                        }
                        return [4 /*yield*/, this.isValidBookPart(preChapterProduct.isPartOf[0])];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!(action === 'update')) return [3 /*break*/, 4];
                        return [4 /*yield*/, AssetV4_Service_1.assetV4Service.getAssetById(id, ['_id', 'type'])];
                    case 3:
                        asset = _a.sent();
                        if (!asset) {
                            throw new AppError_1.AppError("Pre Chapter product does NOT exists with id ".concat(id, "."), 404);
                        }
                        _a.label = 4;
                    case 4: return [2 /*return*/, Event_Service_1.eventService.sendProductEvent(__assign(__assign({}, preChapterProduct), { _id: id, _sources: [{ source: this.preChapterProductSource, type: 'product' }] }), this.preChapterProductEventQueue, this.preChapterProductSource, { productId: id })];
                }
            });
        });
    };
    PreChapterProductService.prototype.isValidBookPart = function (preChapterIsPartOf) {
        return __awaiter(this, void 0, void 0, function () {
            var product;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (preChapterIsPartOf.type != 'book') {
                            throw new AppError_1.AppError("type should be book.", 400);
                        }
                        return [4 /*yield*/, ProductV4_DAO_1.productV4DAO.getProduct(preChapterIsPartOf.type, preChapterIsPartOf._id, ['book.status', 'type', 'identifiers.isbn'])];
                    case 1:
                        product = _a.sent();
                        if (product === null) {
                            throw new AppError_1.AppError("book product does NOT exists with id ".concat(preChapterIsPartOf._id, "."), 400);
                        }
                        if (product.identifiers.isbn !== preChapterIsPartOf.identifiers.isbn) {
                            throw new AppError_1.AppError("isbn ".concat(preChapterIsPartOf.identifiers.isbn, " does not match with isbn of book id ").concat(preChapterIsPartOf._id, "."), 400);
                        }
                        if (product.type !== preChapterIsPartOf.type) {
                            throw new AppError_1.AppError("type for id ".concat(preChapterIsPartOf._id, " does not match with ").concat(preChapterIsPartOf.type, "."), 400);
                        }
                        if (this.bookStatus.includes(product.book.status)) {
                            throw new AppError_1.AppError("".concat(preChapterIsPartOf.type, " with status ").concat(product.book.status, " is not allowed."), 400);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return PreChapterProductService;
}());
exports.preChapterProductService = new PreChapterProductService();
