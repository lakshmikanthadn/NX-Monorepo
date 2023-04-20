"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.push(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.push(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectionV4Controller = exports.CollectionV4Controller = void 0;
var privilege_authorization_manager_1 = require("@tandfgroup/privilege-authorization-manager");
var ProductV4_Service_1 = require("../products/ProductV4.Service");
var AppError_1 = require("../../model/AppError");
var APIResponse_1 = require("../../utils/APIResponse");
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var AssetV4_Service_1 = require("../assets/AssetV4.Service");
var CollectionValidator_1 = require("./CollectionValidator");
var PatchAPIValidator_1 = require("../validator/requestValidator/PatchAPIValidator");
var SchemaValidator_1 = require("../validator/SchemaValidator");
var CollectionV4_Service_1 = require("./CollectionV4.Service");
var config_1 = require("../../config/config");
var log = LoggerUtil_1.default.getLogger('collectionV4Controller');
var iamEnv = config_1.Config.getPropertyValue('iamEnv');
var CollectionV4Controller = exports.CollectionV4Controller = function () {
    var _a;
    var _instanceExtraInitializers = [];
    var _updateCollectionProduct_decorators;
    var _partialUpdateCollectionProduct_decorators;
    var _createCollectionProduct_decorators;
    return _a = /** @class */ (function () {
            function CollectionV4Controller() {
                this.schemaId = (__runInitializers(this, _instanceExtraInitializers), 'OpenApiSchema#/definitions/CollectionProductRequest');
            }
            /**
             * This method acts as re-router to route all the POST:/products calls.
             * This method re-routes calls to corresponding controller based on the action.
             * @param req
             * @param res
             */
            CollectionV4Controller.prototype.updateCollectionProduct = function (req, res) {
                return __awaiter(this, void 0, void 0, function () {
                    var productData, identifier, action, error_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                log.debug('updateCollectionProduct:: received');
                                productData = req.body.product;
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 5, , 6]);
                                identifier = req.params.identifier;
                                productData._id = productData._id || identifier;
                                log.debug('updateCollectionProduct:: _id', productData._id);
                                action = 'update';
                                return [4 /*yield*/, CollectionValidator_1.collectionValidator.validateCollection(productData)];
                            case 2:
                                _a.sent();
                                // Validate collection using schema
                                return [4 /*yield*/, SchemaValidator_1.schemaValidator.validate(this.schemaId, productData)];
                            case 3:
                                // Validate collection using schema
                                _a.sent();
                                return [4 /*yield*/, this.handleProductExistError(productData, action)];
                            case 4:
                                _a.sent();
                                return [2 /*return*/, this.handleUploadProduct(req, res, productData, action)];
                            case 5:
                                error_1 = _a.sent();
                                error_1['_id'] = req.params.identifier;
                                error_1['type'] = req.body.product.type;
                                APIResponse_1.APIResponse.failure(res, error_1);
                                return [3 /*break*/, 6];
                            case 6: return [2 /*return*/];
                        }
                    });
                });
            };
            CollectionV4Controller.prototype.partialUpdateCollectionProduct = function (req, res) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        log.debug('partialUpdateCollectionProduct:: received');
                        return [2 /*return*/, this._partialUpdateCollectionProduct(req, res)];
                    });
                });
            };
            CollectionV4Controller.prototype._partialUpdateCollectionProduct = function (req, res) {
                return __awaiter(this, void 0, void 0, function () {
                    var productData, identifier, productReqWithId, responseData, error_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                productData = req.body.data;
                                identifier = req.params.identifier;
                                // Validate Patch Collection
                                PatchAPIValidator_1.patchAPIValidator.validatePatchRequest(productData);
                                productReqWithId = { _id: identifier, data: productData };
                                log.debug('handlePatchProductUpload:: _id', productReqWithId['_id']);
                                return [4 /*yield*/, CollectionV4_Service_1.collectionV4Service.uploadPatchProduct(productReqWithId)];
                            case 1:
                                _a.sent();
                                responseData = {
                                    data: null,
                                    metadata: {
                                        message: 'Product data uploaded successfully, it will be processed and acknowledged soon.',
                                        transactionId: ProductV4_Service_1.productV4Service.getTransactionId()
                                    }
                                };
                                return [2 /*return*/, APIResponse_1.APIResponse.accepted(res, responseData)];
                            case 2:
                                error_2 = _a.sent();
                                LoggerUtil_1.default.handleErrorLog(log, 'handlePatchProductUpload:: ', error_2);
                                return [2 /*return*/, APIResponse_1.APIResponse.failure(res, error_2)];
                            case 3: return [2 /*return*/];
                        }
                    });
                });
            };
            CollectionV4Controller.prototype.createCollectionProduct = function (req, res) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        log.debug('createCollectionProduct:: received');
                        return [2 /*return*/, this._createCollectionProduct(req, res)];
                    });
                });
            };
            CollectionV4Controller.prototype._createCollectionProduct = function (req, res) {
                return __awaiter(this, void 0, void 0, function () {
                    var productData, action, error_3, _id, type;
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                productData = req.body.product;
                                _b.label = 1;
                            case 1:
                                _b.trys.push([1, 5, , 6]);
                                action = 'create';
                                return [4 /*yield*/, CollectionValidator_1.collectionValidator.validateCollection(productData, action)];
                            case 2:
                                _b.sent();
                                // Validate request with AjV
                                return [4 /*yield*/, SchemaValidator_1.schemaValidator.validate(this.schemaId, productData)];
                            case 3:
                                // Validate request with AjV
                                _b.sent();
                                return [4 /*yield*/, this.handleProductExistError(productData, action)];
                            case 4:
                                _b.sent();
                                return [2 /*return*/, this.handleUploadProduct(req, res, productData, action)];
                            case 5:
                                error_3 = _b.sent();
                                _id = (_a = req.body.product, _a._id), type = _a.type;
                                error_3['_id'] = _id;
                                error_3['type'] = type;
                                LoggerUtil_1.default.handleErrorLog(log, 'createCollectionProduct', error_3);
                                APIResponse_1.APIResponse.failure(res, error_3);
                                return [3 /*break*/, 6];
                            case 6: return [2 /*return*/];
                        }
                    });
                });
            };
            CollectionV4Controller.prototype.handleUploadProduct = function (req, res, productData, action) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, CollectionV4_Service_1.collectionV4Service
                                .uploadProduct(productData, action)
                                .then(function (product) {
                                var responseData = {
                                    _id: product._id,
                                    messages: [
                                        {
                                            code: 202,
                                            description: 'Product data uploaded successfully, it will be processed and acknowledged soon.'
                                        }
                                    ],
                                    status: 'success'
                                };
                                APIResponse_1.APIResponse.accepted(res, responseData);
                            })
                                .catch(function (error) {
                                var _a;
                                var _id = (_a = req.body.product, _a._id), type = _a.type;
                                error['_id'] = _id;
                                error['type'] = type;
                                LoggerUtil_1.default.handleErrorLog(log, 'handleUploadProduct', error);
                                APIResponse_1.APIResponse.failure(res, error);
                            })];
                    });
                });
            };
            CollectionV4Controller.prototype.handleProductExistError = function (productData, action) {
                return __awaiter(this, void 0, void 0, function () {
                    var productType, title, _id, collectionId, productCategories, isBespokeCollection, promises, productRes, errorStr, errorVal;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                productType = productData.type;
                                title = productData.title;
                                _id = productData._id;
                                collectionId = productData.identifiers && productData.identifiers.collectionId;
                                productCategories = productData.categories;
                                isBespokeCollection = CollectionV4_Service_1.collectionV4Service.isBespokeCollection(collectionId, productCategories);
                                promises = [AssetV4_Service_1.assetV4Service.getAssetById(_id, ['_id'])];
                                promises.push(CollectionV4_Service_1.collectionV4Service.getProductByTitle(title, productType));
                                if (collectionId && !isBespokeCollection) {
                                    promises.push(AssetV4_Service_1.assetV4Service.getProductByIdentifier('collectionId', collectionId));
                                }
                                return [4 /*yield*/, Promise.all(promises)];
                            case 1:
                                productRes = _a.sent();
                                errorStr = ['_id', 'title', 'collectionId'];
                                errorVal = [_id, title, collectionId];
                                if (action === 'create') {
                                    productRes.forEach(function (res, i) {
                                        if (res) {
                                            // throw error if product exist for any one of collectionId, _id and title while create
                                            throw new AppError_1.AppError("A product already exists with ".concat(errorStr[i], " ").concat(errorVal[i]), 409);
                                        }
                                    });
                                }
                                else {
                                    productRes.forEach(function (res, i) {
                                        if (!res) {
                                            // throw error if product don't exists for collectionId, _id and title while update
                                            throw new AppError_1.AppError("A product must exists with ".concat(errorStr[i], " ").concat(errorVal[i]), 400);
                                        }
                                    });
                                }
                                return [2 /*return*/, true];
                        }
                    });
                });
            };
            return CollectionV4Controller;
        }()),
        (function () {
            _updateCollectionProduct_decorators = [(0, privilege_authorization_manager_1.hasPermission)(['api', 'collection-product', 'update'], null, iamEnv)];
            _partialUpdateCollectionProduct_decorators = [(0, privilege_authorization_manager_1.hasPermission)(['api', 'collection-product', 'update'], null, iamEnv)];
            _createCollectionProduct_decorators = [(0, privilege_authorization_manager_1.hasPermission)(['api', 'collection-product', 'create'], null, iamEnv)];
            __esDecorate(_a, null, _updateCollectionProduct_decorators, { kind: "method", name: "updateCollectionProduct", static: false, private: false, access: { has: function (obj) { return "updateCollectionProduct" in obj; }, get: function (obj) { return obj.updateCollectionProduct; } } }, null, _instanceExtraInitializers);
            __esDecorate(_a, null, _partialUpdateCollectionProduct_decorators, { kind: "method", name: "partialUpdateCollectionProduct", static: false, private: false, access: { has: function (obj) { return "partialUpdateCollectionProduct" in obj; }, get: function (obj) { return obj.partialUpdateCollectionProduct; } } }, null, _instanceExtraInitializers);
            __esDecorate(_a, null, _createCollectionProduct_decorators, { kind: "method", name: "createCollectionProduct", static: false, private: false, access: { has: function (obj) { return "createCollectionProduct" in obj; }, get: function (obj) { return obj.createCollectionProduct; } } }, null, _instanceExtraInitializers);
        })(),
        _a;
}();
exports.collectionV4Controller = new CollectionV4Controller();
