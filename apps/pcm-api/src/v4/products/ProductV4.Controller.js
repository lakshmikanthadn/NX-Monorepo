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
exports.productV4Controller = exports.ProductV4Controller = void 0;
var _ = require("lodash");
var newrelic = require("newrelic");
var AssociatedMediaV4_Service_1 = require("../associatedMedia/AssociatedMediaV4.Service");
var validator_1 = require("validator");
var config_1 = require("../../config/config");
var constant_1 = require("../../config/constant");
var AppError_1 = require("../../model/AppError");
var APIResponse_1 = require("../../utils/APIResponse");
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var AssetV4_Service_1 = require("../assets/AssetV4.Service");
var CollectionV4_Controller_1 = require("../collection/CollectionV4.Controller");
var PreChapterV4_Controller_1 = require("../preChapter/PreChapterV4.Controller");
var CollectionValidator_1 = require("../collection/CollectionValidator");
var Journal_Controller_1 = require("../journal/Journal.Controller");
var PublishingService_Controller_1 = require("../publishingService/PublishingService.Controller");
var SearchV4Controller_1 = require("../search/SearchV4Controller");
var SearchV4Service_1 = require("../search/SearchV4Service");
var Title_Controller_1 = require("../title/Title.Controller");
var ProductTransform_1 = require("../transform/ProductTransform");
var PreProductTransform_1 = require("../transform/PreProductTransform");
var InputValidator_1 = require("../validator/InputValidator");
var OAUpdateAPIValidator_1 = require("../validator/requestValidator/OAUpdateAPIValidator");
var SearchDownloadApiValidator_1 = require("../validator/requestValidator/SearchDownloadApiValidator");
var ValidateAPIValidator_1 = require("../validator/requestValidator/ValidateAPIValidator");
var ProductV4_Service_1 = require("./ProductV4.Service");
var log = LoggerUtil_1.default.getLogger('ProductV4Controller');
var UUIDVersion = 4;
var ProductV4Controller = /** @class */ (function () {
    function ProductV4Controller() {
    }
    /**
     * @swagger
     * /products/report:
     *   get:
     *     tags:
     *     - Products
     *     summary: To download salessheets report.
     *     description: Return 200 status code if report exists else 404 status code.
     *     parameters:
     *       - $ref: "#/components/parameters/apiVersion"
     *       - $ref: "#/components/parameters/type"
     *     responses:
     *       200:
     *        description: Returns signed url for daily report
     *        content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               location:
     *                 type: string
     *                 description: s3 url string
     *       400:
     *        description: Bad request
     *       404:
     *        description: Not found
     */
    ProductV4Controller.prototype.getReport = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var contentType, content, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contentType = request.query.type;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        if (!contentType) {
                            throw new AppError_1.AppError('Invalid query parameter: type', 400);
                        }
                        if (contentType !== 'salessheets') {
                            throw new AppError_1.AppError("Invalid query parameter: type with value ".concat(contentType), 400);
                        }
                        return [4 /*yield*/, ProductV4_Service_1.productV4Service.getReport(contentType)];
                    case 2:
                        content = _a.sent();
                        if (!content) {
                            APIResponse_1.APIResponse.failure(response, new AppError_1.AppError('Content not found', 404));
                            return [2 /*return*/];
                        }
                        else {
                            APIResponse_1.APIResponse.success(response, { location: content });
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        LoggerUtil_1.default.handleErrorLog(log, 'getReport', error_1);
                        APIResponse_1.APIResponse.failure(response, error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ProductV4Controller.prototype.getProductAssociatedMedia = function (request, response) {
        var type = request.query.type;
        var identifier = request.params.identifier;
        return AssociatedMediaV4_Service_1.associatedMediaV4Service
            .getAsstMediaByParentIdAndType(identifier, type)
            .then(function (associatedMedias) {
            if (associatedMedias && associatedMedias.length > 0) {
                APIResponse_1.APIResponse.success(response, {
                    data: associatedMedias,
                    metadata: {}
                });
            }
            else {
                APIResponse_1.APIResponse.failure(response, new AppError_1.AppError('Product AssociatedMedia not found', 404));
            }
        })
            .catch(function (error) {
            LoggerUtil_1.default.handleErrorLog(log, 'getAssociatedMedia:: ', error);
            APIResponse_1.APIResponse.failure(response, error);
        });
    };
    /**
     * This method acts as re-router to route all the POST:/products calls.
     * This method re-routes calls to corresponding controller based on the action.
     * @param req
     * @param res
     */
    ProductV4Controller.prototype.handlePostProduct = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var requestPayload, action;
            return __generator(this, function (_a) {
                try {
                    requestPayload = req.body;
                    action = requestPayload.action;
                    newrelic.setTransactionName("products#action=".concat(action));
                    switch (action) {
                        case 'save':
                            this.handleCreateProduct(req, res);
                            break;
                        case 'download':
                            this.handleSearchRequestDownload(req, res);
                            break;
                        case 'new-id':
                            this.getNewId(req, res);
                            break;
                        case 'validate':
                            this.validateProducts(req, res);
                            break;
                        case 'query':
                            SearchV4Controller_1.searchV4Controller.searchProducts(req, res);
                            break;
                        case 'count':
                            SearchV4Controller_1.searchV4Controller.getSearchMetadata(req, res);
                            break;
                        case 'fetchVariants':
                            Title_Controller_1.titleController.getProductVariantsByIds(req, res);
                            break;
                        // This is for internal usage only. Do not add to swagger/confluence/contract-doc
                        case 'parseQuery':
                            SearchV4Controller_1.searchV4Controller.parseSearchQuery(req, res);
                            break;
                        default:
                            throw new AppError_1.AppError("Invalid action: ".concat(action), 400);
                    }
                }
                catch (error) {
                    APIResponse_1.APIResponse.failure(res, error);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * This method acts as re-router to route all the POST:/internal/products calls.
     * This method re-routes calls to corresponding controller based on the action.
     * @param req
     * @param res
     */
    ProductV4Controller.prototype.handlePostProductInternal = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var requestPayload, action;
            return __generator(this, function (_a) {
                try {
                    requestPayload = req.body;
                    action = requestPayload.action;
                    newrelic.setTransactionName("products#action=".concat(action));
                    if (action === 'save') {
                        this.handleCreateProductInternal(req, res);
                    }
                    else {
                        throw new AppError_1.AppError("Invalid action: ".concat(action), 400);
                    }
                }
                catch (error) {
                    APIResponse_1.APIResponse.failure(res, error);
                }
                return [2 /*return*/];
            });
        });
    };
    ProductV4Controller.prototype.handleSearchRequestDownload = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var requestPayload;
            return __generator(this, function (_a) {
                try {
                    requestPayload = req.body;
                    SearchDownloadApiValidator_1.searchDownloadValidator.validateSearchDownloadRequest(requestPayload);
                    requestPayload._id = ProductV4_Service_1.productV4Service.getNewId();
                    return [2 /*return*/, ProductV4_Service_1.productV4Service
                            .uploadSearchRequest(requestPayload)
                            .then(function (msgResponse) {
                            var responseData = {
                                data: null,
                                metadata: {
                                    _id: '',
                                    error: '',
                                    message: '',
                                    messages: [
                                        {
                                            code: 202,
                                            description: 'Search query is accepted. and results will be sent over email(s) soon.'
                                        }
                                    ],
                                    transactionDate: new Date().toISOString(),
                                    transactionId: ProductV4_Service_1.productV4Service.getTransactionId(),
                                    type: 'search result download'
                                }
                            };
                            APIResponse_1.APIResponse.accepted(res, responseData);
                        })
                            .catch(function (error) {
                            error['type'] = 'search result download';
                            LoggerUtil_1.default.handleErrorLog(log, 'handleSearchRequestDownload:: ', error);
                            APIResponse_1.APIResponse.failure(res, error);
                        })];
                }
                catch (error) {
                    error['type'] = 'search result download';
                    LoggerUtil_1.default.handleErrorLog(log, 'handleSearchRequestDownload:: ', error);
                    APIResponse_1.APIResponse.failure(res, error);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * @swagger
     * /products:
     *   head:
     *     tags:
     *     - Products
     *     summary: To Check if the asset exists in store based on identifier.
     *     description: Return 200 status code if product exists else 404 status code.
     *     parameters:
     *       - $ref: "#/components/parameters/apiVersion"
     *       - $ref: "#/components/parameters/identifierName"
     *       - $ref: "#/components/parameters/identifierValue"
     *     responses:
     *       200:
     *        description: OK
     *       400:
     *        description: Bad request
     *       404:
     *        description: Not found
     */
    ProductV4Controller.prototype.getProductByIdentifier = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var identifierName, identifierValue, type, asset, product, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        identifierName = request.query.identifierName;
                        identifierValue = decodeURIComponent(request.query.identifierValue);
                        type = request.query.type;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        CollectionValidator_1.collectionValidator.validateCollectionId(request.query);
                        if (!!type) return [3 /*break*/, 3];
                        return [4 /*yield*/, AssetV4_Service_1.assetV4Service.getProductByIdentifier(identifierName, identifierValue)];
                    case 2:
                        asset = _a.sent();
                        if (!asset) {
                            throw new AppError_1.AppError("Product not found", 404);
                        }
                        response.sendStatus(200);
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, ProductV4_Service_1.productV4Service.getProductByIdentifier(identifierName, identifierValue, type)];
                    case 4:
                        product = _a.sent();
                        if (!product || product.length <= 0) {
                            throw new AppError_1.AppError("Product not found", 404);
                        }
                        response.sendStatus(200);
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_2 = _a.sent();
                        LoggerUtil_1.default.handleErrorLog(log, 'getProductByIdentifier', error_2);
                        response.set('x-message', error_2.message);
                        response.sendStatus(error_2.code);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @swagger
     * /products/{id}#action=oaUpdate:
     *   put:
     *     tags:
     *     - Products
     *     summary: To update product with OA permission based on _id (UUID).
     *     description: |
     *      This endpoint will allow you to update the product OA information for the Product.
     *        - You should have a permission to update the Product,
     *        - It's for internal use only,
     *     parameters:
     *     - $ref: "#/components/parameters/id"
     *     requestBody:
     *       required: true
     *       content:
     *        application/json:
     *          schema:
     *            $ref: '#/components/requestBodies/OAProductRequest'
     *     responses:
     *       202:
     *         $ref: '#/components/responses/AcceptedBasic'
     *       404:
     *         $ref: '#/components/responses/NotFoundBasic'
     *       400:
     *         $ref: '#/components/responses/BadRequestBasic'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedBasic'
     *       403:
     *         $ref: '#/components/responses/ForbiddenBasic'
     */
    ProductV4Controller.prototype.handleOAUpdate = function (req, response) {
        return __awaiter(this, void 0, void 0, function () {
            var requestPayload, validationErrors, responseData, error_3, responseData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requestPayload = req.body;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        log.debug('handleOAUpdate:: ', { requestPayload: requestPayload });
                        validationErrors = OAUpdateAPIValidator_1.oaUpdateAPIValidator.validateOAUpdateRequest(requestPayload);
                        if (!(validationErrors.length > 0)) return [3 /*break*/, 2];
                        responseData = {
                            metadata: {
                                messages: validationErrors,
                                requestId: requestPayload.requestId,
                                transactionDate: new Date().toISOString()
                            },
                            responsePayload: null
                        };
                        APIResponse_1.APIResponse.oaFailure(response, responseData);
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, ProductV4_Service_1.productV4Service
                            .uploadOAUpdate(requestPayload, req.params.id)
                            .then(function () {
                            var responseData = {
                                messages: [
                                    {
                                        code: 202,
                                        description: 'it will be processed and acknowledged soon.'
                                    }
                                ],
                                requestId: requestPayload.requestId,
                                status: 'success'
                            };
                            APIResponse_1.APIResponse.accepted(response, responseData);
                        })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_3 = _a.sent();
                        responseData = {
                            metadata: {
                                messages: [
                                    {
                                        code: error_3.code,
                                        description: error_3.message
                                    }
                                ],
                                requestId: requestPayload.requestId,
                                transactionDate: new Date().toISOString()
                            },
                            responsePayload: null
                        };
                        LoggerUtil_1.default.handleErrorLog(log, 'handleOAUpdate:: ', error_3);
                        APIResponse_1.APIResponse.oaFailure(response, responseData, error_3.code);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @swagger
     * /products:
     *   post:
     *     tags:
     *     - Products
     *     summary: To create a product in PCM store.
     *     description: |
     *      This endpoint will allow you to create a new product in PCM store.
     *        - Supports only Collection and Creativework product.
     *        - You should have a permission to update the Product,
     *          use service account with right ROLES to update.
     *     requestBody:
     *       required: true
     *       content:
     *        application/json:
     *          schema:
     *            $ref: '#/components/requestBodies/ActionSave'
     *     responses:
     *       201:
     *        description: Returns _id of the product created. (For creativeWork only)
     *        content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               _id:
     *                 type: string
     *                 description: newly created product-id
     *       202:
     *         $ref: '#/components/responses/AcceptedBasic'
     *       404:
     *         $ref: '#/components/responses/NotFoundBasic'
     *       400:
     *         $ref: '#/components/responses/BadRequestBasic'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedBasic'
     *       403:
     *         $ref: '#/components/responses/ForbiddenBasic'
     *       405:
     *         $ref: '#/components/responses/MethodNotAllowedBasic'
     */
    ProductV4Controller.prototype.handleCreateProduct = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var productData, _a, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        log.debug('handleCreateProduct::,', { requestPayload: req.body });
                        productData = req.body.product;
                        if (!productData) {
                            throw new AppError_1.AppError("Missing product data in the request payload.", 400, { data: productData });
                        }
                        _a = productData.type;
                        switch (_a) {
                            case 'creativeWork': return [3 /*break*/, 1];
                            case 'collection': return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 5];
                    case 1: return [4 /*yield*/, this.createCreativeWorkProduct(req, res)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 3: return [4 /*yield*/, this.createCollectionProduct(req, res)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 5: throw new AppError_1.AppError("Invalid type: ".concat(productData.type), 400);
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_4 = _b.sent();
                        LoggerUtil_1.default.handleErrorLog(log, 'handleCreateProduct:: ', error_4);
                        APIResponse_1.APIResponse.failure(res, error_4);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @swagger
     * /products:
     *   post:
     *     tags:
     *     - Products
     *     summary: To create a product in PCM store.
     *     description: |
     *      This endpoint will allow you to create a new product in PCM store.
     *        - Supports only pre-chapter product.
     *        - Curently for internal use only.
     *     requestBody:
     *       required: true
     *       content:
     *        application/json:
     *          schema:
     *            $ref: '#/components/requestBodies/ActionSave'
     *     responses:
     *       201:
     *        description: Returns _id of the product created.
     *        content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               _id:
     *                 type: string
     *                 description: newly created product-id
     *       202:
     *         $ref: '#/components/responses/AcceptedBasic'
     *       404:
     *         $ref: '#/components/responses/NotFoundBasic'
     *       400:
     *         $ref: '#/components/responses/BadRequestBasic'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedBasic'
     *       403:
     *         $ref: '#/components/responses/ForbiddenBasic'
     *       405:
     *         $ref: '#/components/responses/MethodNotAllowedBasic'
     */
    ProductV4Controller.prototype.handleCreateProductInternal = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var productData, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        log.debug('handleCreateProductInternal::,', { requestPayload: req.body });
                        productData = req.body.product;
                        if (!productData) {
                            throw new AppError_1.AppError("Missing product data in the request payload.", 400, { data: productData });
                        }
                        if (!(productData.type === 'preChapter')) return [3 /*break*/, 2];
                        return [4 /*yield*/, PreChapterV4_Controller_1.prechapterV4Controller.createPreChapterProduct(req, res)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2: throw new AppError_1.AppError("Invalid type: ".concat(productData.type), 400);
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_5 = _a.sent();
                        LoggerUtil_1.default.handleErrorLog(log, 'handleCreateProductInternal:: ', error_5);
                        APIResponse_1.APIResponse.failure(res, error_5);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @swagger
     * /products/{id}:
     *   get:
     *     tags:
     *     - Products
     *     summary: To get a product data and availability based on _id (UUID) and region.
     *     description: Returns product data and availability(only for large and medium).
     *     parameters:
     *     - $ref: "#/components/parameters/id"
     *     - $ref: "#/components/parameters/apiVersion"
     *     - $ref: "#/components/parameters/responseGroup"
     *     - $ref: "#/components/parameters/availabilityNameParam"
     *     - $ref: "#/components/parameters/region"
     *     responses:
     *       200:
     *        description: Returns a Product along with its availability
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/ProductAndAvailability'
     *       404:
     *         $ref: '#/components/responses/NotFoundBasic'
     *       400:
     *         $ref: '#/components/responses/BadRequestBasic'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedBasic'
     *       403:
     *         $ref: '#/components/responses/ForbiddenBasic'
     */
    ProductV4Controller.prototype.getProduct = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var responseGroup, productVersion, identifier, availabilityName, region, productWrapper, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        responseGroup = request.query.responseGroup;
                        productVersion = request.query.productVersion;
                        identifier = request.params.identifier;
                        availabilityName = request.query.availabilityName;
                        region = request.query.region;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, ProductV4_Service_1.productV4Service.getProductById(identifier, responseGroup, productVersion, availabilityName, region)];
                    case 2:
                        productWrapper = _a.sent();
                        if (!productWrapper) {
                            APIResponse_1.APIResponse.failure(response, new AppError_1.AppError('Product not found', 404));
                            return [2 /*return*/];
                        }
                        productWrapper.product = ProductTransform_1.productTransform.transform(productWrapper.product);
                        APIResponse_1.APIResponse.success(response, productWrapper);
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _a.sent();
                        LoggerUtil_1.default.handleErrorLog(log, 'getProduct', error_6);
                        APIResponse_1.APIResponse.failure(response, error_6);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @swagger
     * /products:
     *   get:
     *     tags:
     *     - Products
     *     summary: To get multiple products based on identifier.
     *     description: Returns multiple products based on identifierName & identifierValues.
     *     parameters:
     *       - $ref: "#/components/parameters/apiVersion"
     *       - $ref: "#/components/parameters/responseGroup"
     *       - $ref: "#/components/parameters/identifierName"
     *       - $ref: "#/components/parameters/identifierValues"
     *     responses:
     *       200:
     *        description: Returns all the products along with their availability.
     *        content:
     *          application/json:
     *            schema:
     *              type: array
     *              items:
     *                $ref: '#/components/schemas/ProductAndAvailability'
     *       404:
     *         $ref: '#/components/responses/NotFoundBasic'
     *       400:
     *         $ref: '#/components/responses/BadRequestBasic'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedBasic'
     *       403:
     *         $ref: '#/components/responses/ForbiddenBasic'
     */
    ProductV4Controller.prototype.getProducts = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var responseGroup, productVersion, keyname, keyvalues, availabilityName, availableStatus, productType, limit, offset, parsedLimit, parsedOffset, whitelistedIdentifiers, defaultBatchSize, productsWrapper, availabilityStatus, identifierValues, transformedProducts, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        responseGroup = request.query.responseGroup;
                        productVersion = request.query.productVersion;
                        keyname = request.query.identifierName;
                        keyvalues = request.query.identifierValues;
                        availabilityName = request.query.availabilityName;
                        availableStatus = request.query.availabilityStatus;
                        productType = request.query.type;
                        limit = request.query.limit;
                        offset = request.query.offset;
                        parsedLimit = parseInt(limit, 10);
                        parsedOffset = parseInt(offset, 10);
                        whitelistedIdentifiers = constant_1.AppConstants.WhitelistedProductIdentifiersV4;
                        defaultBatchSize = config_1.Config.getPropertyValue('defaultBatchSizeV4');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 9]);
                        /**
                         * All validations related to this endpoint.
                         * All the validators either return "true" or throw APP Error.
                         * Make sure to put them inside a try catch and handle the error.
                         */
                        InputValidator_1.inputValidator.multipleProductsValidator(request);
                        offset = parsedOffset ? parsedOffset : 0;
                        limit = parsedLimit;
                        productsWrapper = void 0;
                        limit = limit ? limit : defaultBatchSize;
                        availabilityStatus = availableStatus
                            ? availableStatus.split(',')
                            : undefined;
                        if (!(whitelistedIdentifiers.includes(keyname) && keyvalues)) return [3 /*break*/, 3];
                        identifierValues = keyvalues.split(',');
                        return [4 /*yield*/, ProductV4_Service_1.productV4Service.getProductsByDynamicIds(keyname, identifierValues, productType, responseGroup, availabilityName, availabilityStatus, productVersion)];
                    case 2:
                        productsWrapper = _a.sent();
                        return [3 /*break*/, 7];
                    case 3:
                        if (!(constant_1.AppConstants.WhitelistedProductIdentifiersNotInAssetsV4.includes(keyname) &&
                            keyvalues &&
                            productType)) return [3 /*break*/, 5];
                        return [4 /*yield*/, ProductV4_Service_1.productV4Service.getProductByIdentifier(keyname, keyvalues, productType, responseGroup, availabilityName)];
                    case 4:
                        productsWrapper = _a.sent();
                        return [3 /*break*/, 7];
                    case 5:
                        // Set default productType to Book instead of throwing error.
                        /* istanbul ignore else */
                        if (!(request.query && productType)) {
                            productType = 'book';
                        }
                        return [4 /*yield*/, ProductV4_Service_1.productV4Service.getProductsWithType(productType, offset, limit, responseGroup, availabilityName, availabilityStatus, productVersion)];
                    case 6:
                        productsWrapper = _a.sent();
                        _a.label = 7;
                    case 7:
                        if (!productsWrapper || productsWrapper.length <= 0) {
                            APIResponse_1.APIResponse.failure(response, new AppError_1.AppError('Products not found', 404));
                            return [2 /*return*/];
                        }
                        transformedProducts = this.getTransformedProducts(productsWrapper);
                        APIResponse_1.APIResponse.success(response, transformedProducts);
                        return [3 /*break*/, 9];
                    case 8:
                        error_7 = _a.sent();
                        LoggerUtil_1.default.handleErrorLog(log, 'getProducts', error_7);
                        APIResponse_1.APIResponse.failure(response, error_7);
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @swagger
     * /{taxonomyAssetType}/classifications/{taxonomyType}:
     *   get:
     *     tags:
     *     - Taxonomy
     *     summary: To get a the taxonomy details of a classification family(rom/ubx).
     *     description: Returns list of all taxonomy for a requested classification family(rom/ubx).
     *     parameters:
     *     - $ref: "#/components/parameters/taxonomyAssetType"
     *     - $ref: "#/components/parameters/taxonomyType"
     *     - in: query
     *       name: code
     *       schema:
     *         type: string
     *       description: |
     *         Filter the classifications based on the **code**.
     *     - in: query
     *       name: level
     *       schema:
     *         type: number
     *         enum: [1,2,3,4,5,6]
     *       description: Filters a particular level.
     *     - in: query
     *       name: name
     *       schema:
     *         type: string
     *     - in: query
     *       name: isCodePrefix
     *       schema:
     *         type: boolean
     *     - in: query
     *       name: extendLevel
     *       schema:
     *         type: boolean
     *     responses:
     *       200:
     *        description: Returns a Taxonomy data for the given request.
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/TaxonomyResp'
     *       404:
     *         $ref: '#/components/responses/NotFoundBasic'
     *       400:
     *         $ref: '#/components/responses/BadRequestBasic'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedBasic'
     *       403:
     *         $ref: '#/components/responses/ForbiddenBasic'
     */
    ProductV4Controller.prototype.getTaxonomy = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var taxonomyFilter, taxonomy, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        /**
                         * All the validators either return true or throw APP Error.
                         * Make sure to put them inside a try catch and handle the error.
                         */
                        InputValidator_1.inputValidator.validateTaxonomyQueryFilters(req);
                        taxonomyFilter = {
                            code: req.query.code,
                            extendLevel: req.query.extendLevel === 'true',
                            isCodePrefix: req.query.isCodePrefix === 'true',
                            level: parseInt(req.query.level, 10),
                            name: req.query.name
                        };
                        return [4 /*yield*/, ProductV4_Service_1.productV4Service.getTaxonomy(req.params.assetType, req.params.taxonomyType, taxonomyFilter)];
                    case 1:
                        taxonomy = _a.sent();
                        if (!taxonomy || taxonomy.length === 0) {
                            APIResponse_1.APIResponse.failure(res, new AppError_1.AppError('Taxonomy not found', 404));
                            return [2 /*return*/];
                        }
                        APIResponse_1.APIResponse.success(res, taxonomy);
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _a.sent();
                        LoggerUtil_1.default.handleErrorLog(log, 'getTaxonomy', error_8);
                        APIResponse_1.APIResponse.failure(res, error_8);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @swagger
     * /taxonomy:
     *   get:
     *     tags:
     *     - Taxonomy
     *     summary: To get a the taxonomy details of a classification family(rom/ubx).
     *     description: Returns list of all taxonomy for a requested classification family(rom/ubx).
     *     parameters:
     *     - $ref: "#/components/parameters/apiVersion"
     *     - in: query
     *       name: classificationFamily
     *       required: true
     *       schema:
     *         type: string
     *         enum: [rom,hobs,ubx]
     *       description: classification family.
     *     - in: query
     *       name: classificationType
     *       schema:
     *         type: string
     *         enum: [keyword,notable-figure,period,region,subject]
     *       description: Filter the classifications based on the classificationType.
     *     - in: query
     *       name: code
     *       schema:
     *         type: string
     *       description: |
     *         Filter the classifications based on the **code**.
     *          - You can use this filter along with **includeChildren** filter
     *            to get all the children of the particular classification **code**.
     *          - You can also use the **level** filter to get children at a particular level.
     *     - in: query
     *       name: includeChildren
     *       schema:
     *         type: boolean
     *         enum: [true,false]
     *         default: false
     *       description: |
     *        - Includes all the children of the classification.
     *        - Use this filter along with the **code** filter.
     *     - in: query
     *       name: level
     *       schema:
     *         type: number
     *         enum: [1,2,3,4,5,6]
     *       description: Filters a particular level.
     *     responses:
     *       200:
     *        description: Returns a Taxonomy data for the given request.
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/TaxonomyMasterResp'
     *       404:
     *         $ref: '#/components/responses/NotFoundBasic'
     *       400:
     *         $ref: '#/components/responses/BadRequestBasic'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedBasic'
     *       403:
     *         $ref: '#/components/responses/ForbiddenBasic'
     */
    ProductV4Controller.prototype.getTaxonomyClassifications = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var taxonomyFilter, taxonomy, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        /**
                         * All the validators either return true or throw APP Error.
                         * Make sure to put them inside a try catch and handle the error.
                         */
                        InputValidator_1.inputValidator.validateTaxonomyClassificationFilters(req);
                        taxonomyFilter = {
                            classificationFamily: req.query.classificationFamily,
                            classificationType: req.query.classificationType,
                            code: req.query.code,
                            includeChildren: req.query.includeChildren === 'true',
                            level: req.query.level ? parseInt(req.query.level, 10) : undefined
                        };
                        return [4 /*yield*/, ProductV4_Service_1.productV4Service.getTaxonomyClassifications(taxonomyFilter)];
                    case 1:
                        taxonomy = _a.sent();
                        if (!taxonomy || taxonomy.length === 0) {
                            APIResponse_1.APIResponse.failureWithTraceIdInfo(res, new AppError_1.AppError('Taxonomy not found', 404));
                            return [2 /*return*/];
                        }
                        APIResponse_1.APIResponse.successWithTraceIdInfo(res, taxonomy);
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _a.sent();
                        LoggerUtil_1.default.handleErrorLog(log, 'getTaxonomy', error_9);
                        APIResponse_1.APIResponse.failureWithTraceIdInfo(res, error_9);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @swagger
     * /products#action=new-id:
     *   post:
     *     tags:
     *     - Miscellaneous
     *     summary: To get a new-id (uuid).
     *     description: This endpoint is used to generate a new UUID for product before creating it.
     *     requestBody:
     *       required: true
     *       content:
     *        application/json:
     *          schema:
     *            $ref: '#/components/requestBodies/ActionNewId'
     *     responses:
     *       201:
     *        description: Returns uuid.
     *        content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               _id:
     *                 type: string
     *                 description: new uuid
     *       401:
     *         $ref: '#/components/responses/UnauthorizedBasic'
     *       403:
     *         $ref: '#/components/responses/ForbiddenBasic'
     */
    ProductV4Controller.prototype.getNewId = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var newId;
            return __generator(this, function (_a) {
                try {
                    newId = ProductV4_Service_1.productV4Service.getNewId();
                    APIResponse_1.APIResponse.created(response, { _id: newId });
                }
                catch (error) {
                    LoggerUtil_1.default.handleErrorLog(log, 'getNewId', error);
                    APIResponse_1.APIResponse.failure(response, error);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * @swagger
     * /products/{id}:
     *   put:
     *     tags:
     *     - Products
     *     summary: To update product metadata based on _id (UUID).
     *     description: |
     *      This endpoint will allow you to update the product metadata information for the Product.
     *        - Supports only Collection, PublishingService and the Journal product.
     *        - You should have a permission to update the Product,
     *          use service account with right ROLES to update.
     *     parameters:
     *     - $ref: "#/components/parameters/id"
     *     requestBody:
     *       required: true
     *       content:
     *        application/json:
     *          schema:
     *            oneOf:
     *              - $ref: '#/components/requestBodies/CollectionProduct'
     *              - $ref: '#/components/requestBodies/PublishingServiceProduct'
     *              - $ref: '#/components/requestBodies/JournalProduct'
     *     responses:
     *       202:
     *         $ref: '#/components/responses/AcceptedBasic'
     *       404:
     *         $ref: '#/components/responses/NotFoundBasic'
     *       400:
     *         $ref: '#/components/responses/BadRequestBasic'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedBasic'
     *       403:
     *         $ref: '#/components/responses/ForbiddenBasic'
     */
    ProductV4Controller.prototype.handleUpdateProduct = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var productData, _a, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 9, , 10]);
                        log.debug('handleProduct::,', { requestPayload: req.body });
                        productData = req.body.product;
                        if (!productData) {
                            throw new AppError_1.AppError("Missing product data in the request payload.", 400, { data: productData });
                        }
                        _a = productData.type;
                        switch (_a) {
                            case 'collection': return [3 /*break*/, 1];
                            case 'publishingService': return [3 /*break*/, 3];
                            case 'journal': return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 7];
                    case 1: return [4 /*yield*/, this.updateCollectionProduct(req, res)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 3: return [4 /*yield*/, PublishingService_Controller_1.publishingServiceController.updatePublishingService(req, res)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 5: return [4 /*yield*/, Journal_Controller_1.journalController.updateJournalProduct(req, res)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 7: throw new AppError_1.AppError("Invalid type: ".concat(productData.type), 400);
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        error_10 = _b.sent();
                        LoggerUtil_1.default.handleErrorLog(log, 'handleUpdateProduct', error_10);
                        return [2 /*return*/, APIResponse_1.APIResponse.failure(res, error_10)];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @swagger
     * /products/{id}:
     *   patch:
     *     tags:
     *     - Products
     *     summary: For partially updating product metadata based on _id (UUID).
     *     description: |
     *      This endpoint will allow you to update the product metadata information for the Product.
     *        - Supports only Collection.
     *        - You should have a permission to update the Product,
     *          use service account with right ROLES to update.
     *     parameters:
     *     - $ref: "#/components/parameters/id"
     *     requestBody:
     *       required: true
     *       content:
     *        application/json:
     *          schema:
     *            - $ref: '#/components/requestBodies/PatchRequest'
     *     responses:
     *       202:
     *         $ref: '#/components/responses/AcceptedBasic'
     *       404:
     *         $ref: '#/components/responses/NotFoundBasic'
     *       400:
     *         $ref: '#/components/responses/BadRequestBasic'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedBasic'
     *       403:
     *         $ref: '#/components/responses/ForbiddenBasic'
     */
    ProductV4Controller.prototype.handlePartialUpdateProduct = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var productData, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        log.debug('handlePartialUpdateProduct::,', { requestPayload: req.body });
                        productData = req.body.data;
                        if (!productData) {
                            throw new AppError_1.AppError("Missing product data in the request payload.", 400);
                        }
                        return [4 /*yield*/, this.partialUpdateCollectionProduct(req, res)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_11 = _a.sent();
                        LoggerUtil_1.default.handleErrorLog(log, 'handlePartialUpdateProduct', error_11);
                        return [2 /*return*/, APIResponse_1.APIResponse.failure(res, error_11)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @swagger
     * /products/{id}#CreateORUpdatePublishingServiceProduct:
     *   put:
     *     tags:
     *     - Products
     *     summary: This handles the create and update requests for publishing-service-product.
     *     description: |
     *      This endpoint will allow you to create / update the publishing-service-product metadata
     *      information for the Product.
     *        - Supports only PublishingService product.
     *        - You should have a permission to update the Product,
     *          use service account with right ROLES to update.
     *     parameters:
     *     - $ref: "#/components/parameters/id"
     *     requestBody:
     *       required: true
     *       content:
     *        application/json:
     *          schema:
     *            $ref: '#/components/requestBodies/PublishingServiceProduct'
     *     responses:
     *       202:
     *         $ref: '#/components/responses/AcceptedBasic'
     *       404:
     *         $ref: '#/components/responses/NotFoundBasic'
     *       400:
     *         $ref: '#/components/responses/BadRequestBasic'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedBasic'
     *       403:
     *         $ref: '#/components/responses/ForbiddenBasic'
     */
    ProductV4Controller.prototype.handleCreateProductById = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var productData, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        log.debug('handleCreateProductById::,', {
                            id: req.params.identifier,
                            requestPayload: req.body
                        });
                        productData = req.body.product;
                        if (!productData) {
                            throw new AppError_1.AppError("Missing product data in the request payload.", 400, { data: productData });
                        }
                        if (!(productData.type && productData.type === 'publishingService')) {
                            throw new AppError_1.AppError("Invalid type: ".concat(productData.type), 400);
                        }
                        // Commented for future use, switch require minimum 3 case
                        // switch (productData.type) {
                        //   case 'publishingService':
                        //     await publishingServiceController.createPublishingService(req, res);
                        //     break;
                        //   default: throw new AppError(`Invalid type: ${productData.type}`, 400);
                        // }
                        return [4 /*yield*/, PublishingService_Controller_1.publishingServiceController.createPublishingService(req, res)];
                    case 1:
                        // Commented for future use, switch require minimum 3 case
                        // switch (productData.type) {
                        //   case 'publishingService':
                        //     await publishingServiceController.createPublishingService(req, res);
                        //     break;
                        //   default: throw new AppError(`Invalid type: ${productData.type}`, 400);
                        // }
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_12 = _a.sent();
                        LoggerUtil_1.default.handleErrorLog(log, 'handleCreateProductById', error_12);
                        APIResponse_1.APIResponse.failure(res, error_12);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @swagger
     * /products#action=validate:
     *   post:
     *     tags:
     *     - Miscellaneous
     *     summary: To validate a given list of products with supported identifiers.
     *     description: identifiers supported are _id/identifiers.doi/identifiers.isbn
     *     requestBody:
     *       required: true
     *       content:
     *        application/json:
     *          schema:
     *            $ref: '#/components/requestBodies/ActionValidate'
     *     responses:
     *       200:
     *        description: Response object of metadata and data blocks based on rules provided
     *        content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ValidateRespBody'
     *       404:
     *         $ref: '#/components/responses/NotFoundBasic'
     *       400:
     *         $ref: '#/components/responses/BadRequestBasic'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedBasic'
     *       403:
     *         $ref: '#/components/responses/ForbiddenBasic'
     */
    ProductV4Controller.prototype.validateProducts = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var requestPayload, hasCounts_1, availabilityName_1, searchQuery, inputIdentifiers_1, searchPromiser_1, allProducts_1, allCounts_1, qualifiedIdentifier_1, inputAttributes_1, searchQueryParserResult_1, searchResults, totalCount_1, validateApiResponse, error_13;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        requestPayload = request.body;
                        ValidateAPIValidator_1.validateAPIValidator.validateValidationApi(request);
                        hasCounts_1 = requestPayload.hasCounts;
                        availabilityName_1 = requestPayload.availability.name;
                        searchQuery = requestPayload.rulesList;
                        inputIdentifiers_1 = [];
                        searchPromiser_1 = [];
                        allProducts_1 = [];
                        allCounts_1 = [];
                        qualifiedIdentifier_1 = [];
                        inputAttributes_1 = [];
                        try {
                            searchQueryParserResult_1 =
                                SearchV4Controller_1.searchV4Controller.mapAndParseSearchQuery(searchQuery);
                        }
                        catch (parserError) {
                            LoggerUtil_1.default.handleErrorLog(log, 'searchProducts: ', parserError);
                            throw new AppError_1.AppError(parserError.message, 400);
                        }
                        log.debug('searchQueryParserResult::', JSON.stringify(searchQueryParserResult_1));
                        // when we have multiple rulesList so we have to go one by one
                        searchQuery.forEach(function (sQuery, index) {
                            var productType = sQuery.type;
                            var query = searchQueryParserResult_1[index];
                            // this is used to remove individual(dot) projection when root projection is passed
                            // As mongodb chooses individual one on top of the root one.
                            // e.g : ["identifiers", "identifiers.dacKey", "identifiers.doi"]
                            // e.g : ["book", "book.publicationDate", "book.subtitle"]
                            var rootAttributes = query.attributes.filter(function (attribute) { return !attribute.includes('.'); });
                            var dotAttributes = query.attributes.filter(function (attribute) {
                                return attribute.includes('.');
                            });
                            rootAttributes.forEach(function (root) {
                                dotAttributes = dotAttributes.filter(function (attribute) { return !attribute.includes(root); });
                            });
                            query.attributes = __spreadArray(__spreadArray([], rootAttributes, true), dotAttributes, true);
                            inputAttributes_1[index] = query.attributes;
                            // finding the attributes (projections) and adding isbn/doi if missing
                            // as _id by default we are getting
                            if (!query.attributes.includes('identifiers.isbn') &&
                                !query.attributes.includes('identifiers.doi') &&
                                !query.attributes.includes('identifiers')) {
                                query.attributes = __spreadArray(__spreadArray([], query.attributes, true), [
                                    'identifiers.isbn',
                                    'identifiers.doi'
                                ], false);
                            }
                            else if (!query.attributes.includes('identifiers.isbn') &&
                                !query.attributes.includes('identifiers') &&
                                query.attributes.includes('identifiers.doi')) {
                                query.attributes = __spreadArray(__spreadArray([], query.attributes, true), ['identifiers.isbn'], false);
                            }
                            else if (!query.attributes.includes('identifiers.doi') &&
                                !query.attributes.includes('identifiers') &&
                                query.attributes.includes('identifiers.isbn')) {
                                query.attributes = __spreadArray(__spreadArray([], query.attributes, true), ['identifiers.doi'], false);
                            }
                            // find qualifiedIdentifier for each rulesList & assign to qualifiedIdentifier respectively
                            qualifiedIdentifier_1[index] = _this.findQualifiedIdentifier(sQuery.rules);
                            log.debug('qualifiedIdentifier::', JSON.stringify(qualifiedIdentifier_1));
                            // creating inputIdentifiers array for each rulesList respectively to match valid/invalid
                            inputIdentifiers_1[index] = _this.getInputIdentifiers(qualifiedIdentifier_1[index]);
                            log.debug('inputIdentifiers::', JSON.stringify(inputIdentifiers_1));
                            // calling searchProducts for each rulesList and storing all promises in searchPromiser
                            searchPromiser_1.push(SearchV4Service_1.searchV4Service.searchProducts({
                                availabilityName: availabilityName_1,
                                hasCounts: hasCounts_1,
                                productType: productType,
                                searchQueryParserResult: [query]
                            }));
                        });
                        return [4 /*yield*/, Promise.all(searchPromiser_1)];
                    case 1:
                        searchResults = _a.sent();
                        totalCount_1 = 0;
                        log.debug('searchResults ::', JSON.stringify(searchResults));
                        // again traversing in the results for all rulesList respectively
                        searchResults.forEach(function (sResult, index) {
                            var products = sResult.products;
                            var counts = sResult.counts;
                            // allProducts contains all products from all the rulesList
                            allProducts_1.push.apply(allProducts_1, _this.getValidInvalidProducts(products, qualifiedIdentifier_1[index], inputIdentifiers_1[index], inputAttributes_1[index]));
                            // if hasCounts is true will get counts in searchResults for each rulesList
                            // individual counts for productType will be same but total will be addition of all
                            if (counts) {
                                counts.forEach(function (countEntity) {
                                    countEntity.type === 'Total'
                                        ? (totalCount_1 += countEntity.count)
                                        : allCounts_1.push(countEntity);
                                });
                            }
                        });
                        // assigning total count in our proper response
                        allCounts_1.push({ count: totalCount_1, type: 'Total' });
                        validateApiResponse = {
                            data: allProducts_1,
                            metadata: {
                                counts: hasCounts_1 ? allCounts_1 : null
                            }
                        };
                        APIResponse_1.APIResponse.success(response, validateApiResponse);
                        return [3 /*break*/, 3];
                    case 2:
                        error_13 = _a.sent();
                        APIResponse_1.APIResponse.failure(response, error_13);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @swagger
     * /products/rules:
     *   post:
     *     tags:
     *     - Products
     *     summary: To get parsed rulesString based on rules JSON.
     *     description: |
     *        - You should have a permission to update the Product,
     *        - It's for internal use only,
     *     requestBody:
     *       required: true
     *       content:
     *        application/json:
     *          schema:
     *            $ref: '#/components/requestBodies/JSONRuleForProduct'
     *     responses:
     *       200:
     *         description: Returns a parsed rulesString for the given request.
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ParsedRulesResponse'
     *       404:
     *         $ref: '#/components/responses/NotFoundBasic'
     *       400:
     *         $ref: '#/components/responses/BadRequestBasic'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedBasic'
     *       403:
     *         $ref: '#/components/responses/ForbiddenBasic'
     */
    ProductV4Controller.prototype.handleRuleString = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var rulesString, parsedRuleString, xTransactionId, responseData;
            return __generator(this, function (_a) {
                try {
                    rulesString = req.body.data;
                    if (!rulesString) {
                        throw new AppError_1.AppError("Missing product data in the request payload.", 400);
                    }
                    if (!Array.isArray(rulesString)) {
                        throw new AppError_1.AppError("Invalid rulesString ".concat(rulesString, "."), 400);
                    }
                    parsedRuleString = ProductV4_Service_1.productV4Service.getRulesStringFromSearchQuery(rulesString);
                    xTransactionId = ProductV4_Service_1.productV4Service.getTransactionId();
                    responseData = {
                        data: parsedRuleString,
                        metadata: {
                            message: '',
                            transactionId: xTransactionId
                        }
                    };
                    APIResponse_1.APIResponse.success(res, responseData);
                }
                catch (error) {
                    APIResponse_1.APIResponse.failure(res, error);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * @swagger
     * /products/manuscript/{id}:
     *   get:
     *     tags:
     *     - Products
     *     summary: To get a manuscript pre-article's data based on _id (UUID).
     *     description: Returns pre-article data.
     *     parameters:
     *     - $ref: "#/components/parameters/apiVersion"
     *     - $ref: "#/components/parameters/id"
     *     - $ref: "#/components/parameters/responseGroup"
     *     responses:
     *       200:
     *        description: Returns a pre-article
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/ProductAndAvailability'
     *       404:
     *         $ref: '#/components/responses/NotFoundBasic'
     *       400:
     *         $ref: '#/components/responses/BadRequestBasic'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedBasic'
     *       403:
     *         $ref: '#/components/responses/ForbiddenBasic'
     */
    ProductV4Controller.prototype.getPreArticle = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var responseGroup, identifier, preArticleWrapper, error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        responseGroup = request.query.responseGroup;
                        identifier = request.params.identifier;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, ProductV4_Service_1.productV4Service.getPreArticleById(identifier, responseGroup)];
                    case 2:
                        preArticleWrapper = _a.sent();
                        if (!preArticleWrapper) {
                            APIResponse_1.APIResponse.failure(response, new AppError_1.AppError('Product not found', 404));
                            return [2 /*return*/];
                        }
                        preArticleWrapper.product = PreProductTransform_1.preProductTransform.transform(preArticleWrapper.product);
                        APIResponse_1.APIResponse.success(response, preArticleWrapper);
                        return [3 /*break*/, 4];
                    case 3:
                        error_14 = _a.sent();
                        LoggerUtil_1.default.handleErrorLog(log, 'getPreArticle', error_14);
                        APIResponse_1.APIResponse.failure(response, error_14);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @swagger
     * /products/manuscript:
     *   get:
     *     tags:
     *     - Products
     *     summary: To get multiple pre-articles based on identifier.
     *     description: Returns multiple pre-articles based on identifierName & identifierValues.
     *     parameters:
     *       - $ref: "#/components/parameters/apiVersion"
     *       - $ref: "#/components/parameters/responseGroup"
     *       - $ref: "#/components/parameters/manuscriptIdentifierName"
     *       - $ref: "#/components/parameters/manuscriptIdentifierValues"
     *     responses:
     *       200:
     *        description: Returns all the pre-articles along with their availability.
     *        content:
     *          application/json:
     *            schema:
     *              type: array
     *              items:
     *                $ref: '#/components/schemas/ProductAndAvailability'
     *       404:
     *         $ref: '#/components/responses/NotFoundBasic'
     *       400:
     *         $ref: '#/components/responses/BadRequestBasic'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedBasic'
     *       403:
     *         $ref: '#/components/responses/ForbiddenBasic'
     */
    ProductV4Controller.prototype.getPreArticles = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var responseGroup, keyname, keyvalues, preArticlesWrapper, whitelistedIdentifiers, identifierValues, transformedPreArticles, error_15;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        responseGroup = request.query.responseGroup;
                        keyname = request.query.identifierName;
                        keyvalues = request.query.identifierValues;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        /**
                         * All validations related to this endpoint.
                         * All the validators either return "true" or throw APP Error.
                         * Make sure to put them inside a try catch and handle the error.
                         */
                        InputValidator_1.inputValidator.preArticleValidator(request, response);
                        preArticlesWrapper = void 0;
                        whitelistedIdentifiers = constant_1.AppConstants.WhitelistedPreArticleIdentifiers;
                        if (!(whitelistedIdentifiers.includes(keyname) && keyvalues)) return [3 /*break*/, 3];
                        identifierValues = keyvalues.split(',');
                        return [4 /*yield*/, ProductV4_Service_1.productV4Service.getPreArticlesByIdentifier(keyname, identifierValues, 'preArticle', responseGroup)];
                    case 2:
                        preArticlesWrapper = _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!preArticlesWrapper || preArticlesWrapper.length <= 0) {
                            APIResponse_1.APIResponse.failure(response, new AppError_1.AppError('Product not found', 404));
                            return [2 /*return*/];
                        }
                        transformedPreArticles = this.getTransformedPreProducts(preArticlesWrapper);
                        APIResponse_1.APIResponse.success(response, transformedPreArticles);
                        return [3 /*break*/, 5];
                    case 4:
                        error_15 = _a.sent();
                        LoggerUtil_1.default.handleErrorLog(log, 'getPreArticles', error_15);
                        APIResponse_1.APIResponse.failure(response, error_15);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @swagger
     * /products/manuscript/workflow/{id}:
     *   get:
     *     tags:
     *     - Products
     *     summary: To get a manuscript-workflow's data based on _id (UUID).
     *     description: Returns manuscript-workflow data.
     *     parameters:
     *     - $ref: "#/components/parameters/apiVersion"
     *     - $ref: "#/components/parameters/id"
     *     - $ref: "#/components/parameters/responseGroup"
     *     responses:
     *       200:
     *        description: Returns a manuscript-workflow
     *        content:
     *          application/json:
     *            schema:
     *              $ref: '#/components/schemas/ProductAndAvailability'
     *       404:
     *         $ref: '#/components/responses/NotFoundBasic'
     *       400:
     *         $ref: '#/components/responses/BadRequestBasic'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedBasic'
     *       403:
     *         $ref: '#/components/responses/ForbiddenBasic'
     */
    ProductV4Controller.prototype.getManuscriptWorkflow = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var responseGroup, identifier, manuscriptWorkflowWrapper, error_16;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        responseGroup = request.query.responseGroup;
                        identifier = request.params.identifier;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, ProductV4_Service_1.productV4Service.getManuscriptWorkflowById(identifier, responseGroup)];
                    case 2:
                        manuscriptWorkflowWrapper = _a.sent();
                        if (!manuscriptWorkflowWrapper) {
                            APIResponse_1.APIResponse.failure(response, new AppError_1.AppError('Product not found', 404));
                            return [2 /*return*/];
                        }
                        manuscriptWorkflowWrapper.product = PreProductTransform_1.preProductTransform.transform(manuscriptWorkflowWrapper.product);
                        APIResponse_1.APIResponse.success(response, manuscriptWorkflowWrapper);
                        return [3 /*break*/, 4];
                    case 3:
                        error_16 = _a.sent();
                        LoggerUtil_1.default.handleErrorLog(log, 'getManuscriptWorkflow', error_16);
                        APIResponse_1.APIResponse.failure(response, error_16);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ProductV4Controller.prototype.getTransformedProducts = function (productsWrapper) {
        return productsWrapper.map(function (productWrapper) {
            productWrapper.product = ProductTransform_1.productTransform.transform(productWrapper.product);
            return productWrapper;
        });
    };
    ProductV4Controller.prototype.getTransformedPreProducts = function (preProductsWrapper) {
        return preProductsWrapper.map(function (preProductWrapper) {
            preProductWrapper.product = PreProductTransform_1.preProductTransform.transform(preProductWrapper.product);
            return preProductWrapper;
        });
    };
    ProductV4Controller.prototype.updateCollectionProduct = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, CollectionV4_Controller_1.collectionV4Controller.updateCollectionProduct(req, res)];
            });
        });
    };
    ProductV4Controller.prototype.partialUpdateCollectionProduct = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, CollectionV4_Controller_1.collectionV4Controller.partialUpdateCollectionProduct(req, res)];
            });
        });
    };
    ProductV4Controller.prototype.createCreativeWorkProduct = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var productData, newUUID, isAssetExists, error_17, _a, _id, type;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        productData = req.body.product;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        if (!productData.identifiers) {
                            throw new AppError_1.AppError("Missing product-data/identifiers in the request.", 400);
                        }
                        if (productData.isPartOf) {
                            throw new AppError_1.AppError("Invalid property(s): isPartOf", 400);
                        }
                        /**
                         * Check if user is sending a valid _id
                         * if valid accept it.
                         * if invalid throw APP Error,
                         * if user is not sending, create one.
                         */
                        if (productData._id && !(0, validator_1.isUUID)(productData._id, UUIDVersion)) {
                            throw new AppError_1.AppError('Invalid _id. Note: Only UUID is allowed.', 400);
                        }
                        else {
                            /* istanbul ignore else */
                            if (!productData._id) {
                                newUUID = ProductV4_Service_1.productV4Service.getNewId();
                                productData._id = newUUID;
                            }
                        }
                        return [4 /*yield*/, AssetV4_Service_1.assetV4Service.getAssetById(productData._id, [
                                '_id'
                            ])];
                    case 2:
                        isAssetExists = _b.sent();
                        if (isAssetExists) {
                            throw new AppError_1.AppError('A product already exists with this _id.', 400);
                        }
                        return [2 /*return*/, ProductV4_Service_1.productV4Service
                                .createProduct(productData)
                                .then(function (createdProduct) {
                                APIResponse_1.APIResponse.created(res, createdProduct);
                            })
                                .catch(function (error) {
                                var _a = req.body.product, _id = _a._id, type = _a.type;
                                error['_id'] = _id;
                                error['type'] = type;
                                LoggerUtil_1.default.handleErrorLog(log, 'createCreativeWorkProduct', error);
                                APIResponse_1.APIResponse.failure(res, error);
                            })];
                    case 3:
                        error_17 = _b.sent();
                        _a = req.body.product, _id = _a._id, type = _a.type;
                        error_17['_id'] = _id;
                        error_17['type'] = type;
                        LoggerUtil_1.default.handleErrorLog(log, 'createCreativeWorkProduct', error_17);
                        APIResponse_1.APIResponse.failure(res, error_17);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ProductV4Controller.prototype.createCollectionProduct = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, CollectionV4_Controller_1.collectionV4Controller.createCollectionProduct(req, res)];
            });
        });
    };
    ProductV4Controller.prototype.findQualifiedIdentifier = function (rules) {
        var whitelistedIdentifiers = constant_1.AppConstants.whitelistedIdentifiersForValidationApi;
        var qualifiedIdentifier = null;
        rules.forEach(function (sRule) {
            if (sRule.type === 'criteria' &&
                whitelistedIdentifiers.includes(sRule.rule.attribute) &&
                !qualifiedIdentifier) {
                qualifiedIdentifier = sRule;
            }
            else if (sRule.type === 'criteria' &&
                qualifiedIdentifier.rule.relationship === 'IN' &&
                whitelistedIdentifiers.includes(sRule.rule.attribute) &&
                sRule.rule.relationship === 'IN') {
                qualifiedIdentifier =
                    sRule.rule.values.length > qualifiedIdentifier.rule.values.length
                        ? sRule
                        : qualifiedIdentifier;
            }
            else if (sRule.type === 'criteria' &&
                qualifiedIdentifier.rule.relationship === 'EQ' &&
                whitelistedIdentifiers.includes(sRule.rule.attribute) &&
                sRule.rule.relationship === 'IN') {
                qualifiedIdentifier = sRule;
            }
        });
        return qualifiedIdentifier;
    };
    ProductV4Controller.prototype.getInputIdentifiers = function (qualifiedIdentifier) {
        var inputIdentifiers = [];
        if (qualifiedIdentifier.rule.relationship === 'EQ') {
            inputIdentifiers.push({
                name: qualifiedIdentifier.rule.attribute,
                value: qualifiedIdentifier.rule.value
            });
        }
        else {
            /* istanbul ignore else */
            if (qualifiedIdentifier.rule.relationship === 'IN') {
                qualifiedIdentifier.rule.values.forEach(function (val) {
                    return inputIdentifiers.push({
                        name: qualifiedIdentifier.rule.attribute,
                        value: val
                    });
                });
            }
        }
        return inputIdentifiers;
    };
    ProductV4Controller.prototype.getValidInvalidProducts = function (products, qualifiedIdentifier, inputIdentifiers, inputAttributes) {
        log.debug('getValidInvalidProducts::', JSON.stringify(products), qualifiedIdentifier, inputIdentifiers, inputAttributes);
        products.forEach(function (validEntity) {
            // as availability info is not needed so deleting it
            // delete validEntity.availability;
            var product = validEntity.product;
            // find index of valid product from inputIdentifiers created before for each rulesList
            var inputIdentifier = inputIdentifiers.find(function (prod) {
                return prod.name === qualifiedIdentifier.rule.attribute &&
                    prod.value ===
                        _.get(product, qualifiedIdentifier.rule.attribute, undefined);
            });
            // transform valid product as proper response
            var inputIdentifierName = inputIdentifier.name.includes('.')
                ? inputIdentifier.name.split('.')[1]
                : inputIdentifier.name;
            validEntity.identifier = {
                name: inputIdentifierName,
                value: inputIdentifier.value
            };
            // removing the identifiers added by us from attributes (projections) i.e isbn/doi
            if (!inputAttributes.includes('identifiers.isbn') &&
                !inputAttributes.includes('identifiers')) {
                delete validEntity.product.identifiers.isbn;
            }
            if (!inputAttributes.includes('identifiers.doi') &&
                !inputAttributes.includes('identifiers')) {
                delete validEntity.product.identifiers.doi;
            }
        });
        // prepare Invalid Identifiers
        var invalidInputIdentifiers = inputIdentifiers.filter(function (inputId) {
            return !products.some(function (p) { return p.identifier.value === inputId.value; });
        });
        if (invalidInputIdentifiers.length !== 0) {
            invalidInputIdentifiers.forEach(function (invalidEntity) {
                invalidEntity.name = invalidEntity.name.includes('.')
                    ? invalidEntity.name.split('.')[1]
                    : invalidEntity.name;
                var invalidProduct = {};
                invalidProduct['identifier'] = invalidEntity;
                invalidProduct['product'] = {};
                invalidProduct['error'] = {
                    code: '404',
                    message: 'Product is invalid'
                };
                // here products is all products (valid + invalid) of a particular rulesList.
                products.push(invalidProduct);
            });
        }
        return products;
    };
    return ProductV4Controller;
}());
exports.ProductV4Controller = ProductV4Controller;
exports.productV4Controller = new ProductV4Controller();
