"use strict";
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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
exports.contentV4Controller = void 0;
var privilege_authorization_manager_1 = require("@tandfgroup/privilege-authorization-manager");
var constant_1 = require("../../config/constant");
var _ = require("lodash");
var requestIp = require("request-ip");
var config_1 = require("../../config/config");
var AppError_1 = require("../../model/AppError");
var APIResponse_1 = require("../../utils/APIResponse");
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var AssetV4_Service_1 = require("../assets/AssetV4.Service");
var ProductV4_Service_1 = require("../products/ProductV4.Service");
var InputValidator_1 = require("../validator/InputValidator");
var ContentV4_Service_1 = require("./ContentV4.Service");
var log = LoggerUtil_1.default.getLogger('ContentController');
var iamEnv = config_1.Config.getPropertyValue('iamEnv');
var featureToggles = config_1.Config.getPropertyValue('featureToggles');
var ContentV4Controller = function () {
    var _a;
    var _instanceExtraInitializers = [];
    var _getContentByIdBasedOnRole_decorators;
    return _a = /** @class */ (function () {
            function ContentV4Controller() {
                __runInitializers(this, _instanceExtraInitializers);
            }
            /**
             * @swagger
             * /content:
             *   post:
             *     tags:
             *     - Content
             *     summary: To create a content(Associated media) in PCM for a existing product.
             *     description: >
             *       This endpoint will allow user to create a content in PCM for a product.
             *       (Supports only Creativework product).
             *        - It returns an S3 location (valid for 10 minutes) to upload a content.
             *        - Once content is uploaded to the given s3 location,
             *          content will be processed and can be consumed by the user.
             *     requestBody:
             *       required: true
             *       content:
             *        application/json:
             *          schema:
             *            $ref: '#/components/requestBodies/CreateContent'
             *     responses:
             *       202:
             *        description: The AWS s3 URL to upload the content file - Returns "accepted" status.
             *        content:
             *         application/json:
             *           schema:
             *             type: object
             *             properties:
             *               location:
             *                 type: string
             *                 description: pre-signed AWS s3 URL of the content to upload
             *               _id:
             *                 type: string
             *                 description: newly created content-id
             *       404:
             *         $ref: '#/components/responses/NotFoundBasic'
             *       400:
             *         $ref: '#/components/responses/BadRequestBasic'
             *       401:
             *         $ref: '#/components/responses/UnauthorizedBasic'
             *       403:
             *         $ref: '#/components/responses/ForbiddenBasic'
             */
            ContentV4Controller.prototype.createAssociatedMedia = function (request, response) {
                return __awaiter(this, void 0, void 0, function () {
                    var contentJson;
                    return __generator(this, function (_a) {
                        log.debug('createAssociatedMedia:: Request creativeWork:', request.body);
                        contentJson = request.body;
                        try {
                            // all validations related to this api.
                            InputValidator_1.inputValidator.validateAssociatedMedia(request);
                            return [2 /*return*/, ContentV4_Service_1.contentV4Service
                                    .createAssociatedMedia(contentJson)
                                    .then(function (createdContent) {
                                    APIResponse_1.APIResponse.accepted(response, createdContent);
                                })
                                    .catch(function (error) {
                                    APIResponse_1.APIResponse.failure(response, error);
                                })];
                        }
                        catch (error) {
                            LoggerUtil_1.default.handleErrorLog(log, 'createAssociatedMedia:: ', error);
                            APIResponse_1.APIResponse.failure(response, error);
                        }
                        return [2 /*return*/];
                    });
                });
            };
            /**
             * @swagger
             * /content/{id}:
             *   get:
             *     tags:
             *     - Content
             *     summary: To get content data (location of the content) based on product id.
             *     description: |
             *       Returns content location details (i.e presigned s3 url OR public url) for all
             *       content types of the product.
             *         - User should have entitlement/read-access to content.
             *         - Open access and free access content can be accessed without entitlement.
             *         - Few content types are free to access. find the list below.
             *            - previewpdf
             *            - googlepdf
             *            - coverimage
             *            - bannerimage
             *            - exportcsv
             *            - hyperlink
             *            - partslist
             *         - All presigned S3 Urls are valid ONLY for 10 seconds.
             *     parameters:
             *     - $ref: "#/components/parameters/id"
             *     - $ref: "#/components/parameters/apiVersion"
             *     - in: query
             *       name: type
             *       required: false
             *       schema:
             *         type: string
             *         enum: [webpdf,previewpdf,dbitsxml,googlepdf,chapterpdf,video,partslist,coverimage]
             *       description: type of the content to filter.
             *     - in: query
             *       name: parentId
             *       schema:
             *         type: string
             *       description: |
             *          - Unique Identifier of the parent product.
             *          - Useful when accessing the free content of collection.
             *     - in: query
             *       name: render
             *       schema:
             *         type: boolean
             *         default: false
             *       description: |
             *          - when true s3 url will allow you to render the content/file.
             *          - when false s3 url will allow user to download the content/file.
             *     - in: query
             *       name: filenamePrefix
             *       schema:
             *         type: string
             *       description: |
             *         Valid when render=false. Used for prefixing the filename.
             *         Note: Do not use semicolon in the filenamePrefix. They will be removed.
             *         fileName = filenamePrefix + content-type + .extension
             *     responses:
             *       200:
             *        description: Returns list of content having presigned s3 url, type and accessType.
             *        content:
             *          application/json:
             *            schema:
             *              type: array
             *              items:
             *                $ref: '#/components/schemas/ContentRespBody'
             *       404:
             *         $ref: '#/components/responses/NotFoundBasic'
             *       400:
             *         $ref: '#/components/responses/BadRequestBasic'
             *       401:
             *         $ref: '#/components/responses/UnauthorizedBasic'
             *       403:
             *         $ref: '#/components/responses/ForbiddenBasic'
             */
            /**
             * We have implemented ROLE based content access for KORTEXT
             * This handleGetContentById method redirects the request to
             * proper handler based on the APP-NAME.
             * @param request express request object
             * @param response express response object
             */
            ContentV4Controller.prototype.handleGetContentById = function (request, response) {
                return __awaiter(this, void 0, void 0, function () {
                    var appName, isAppWhiltested;
                    return __generator(this, function (_a) {
                        appName = request.query.appName;
                        isAppWhiltested = ['KORTEXT', 'CATS-WMS'].includes(appName);
                        try {
                            if (appName && !isAppWhiltested) {
                                throw new AppError_1.AppError("Invalid query param ".concat(appName, "."), 400);
                            }
                            if (appName && isAppWhiltested) {
                                return [2 /*return*/, this.getContentByIdBasedOnRole(request, response)];
                            }
                            else {
                                return [2 /*return*/, this.getContentByIdBasedOnEntitlement(request, response)];
                            }
                        }
                        catch (error) {
                            LoggerUtil_1.default.handleErrorLog(log, 'handleGetContentById:: ', error);
                            APIResponse_1.APIResponse.failure(response, error);
                        }
                        return [2 /*return*/];
                    });
                });
            };
            /**
             * @swagger
             * /content:
             *   get:
             *     tags:
             *     - Content
             *     summary: To get content data (location of the content) based on product identifierName and
             *       identifierValue.
             *     description: |
             *       Returns content location details (i.e presigned s3 url OR public url) for all
             *       content types of the product.
             *         - User should have entitlement/read-access to content.
             *         - Open access and free access content can be accessed without entitlement.
             *         - Few content types are free to access. find the list below.
             *            - previewpdf
             *            - googlepdf
             *            - coverimage
             *            - bannerimage
             *            - exportcsv
             *            - hyperlink
             *            - partslist
             *         - All presigned S3 Urls are valid ONLY for 10 seconds.
             *     parameters:
             *     - $ref: "#/components/parameters/apiVersion"
             *     - $ref: "#/components/parameters/identifierName"
             *     - $ref: "#/components/parameters/identifierValue"
             *     responses:
             *       200:
             *        description: Returns list of content having presigned s3 url, type and accessType.
             *        content:
             *          application/json:
             *            schema:
             *              type: array
             *              items:
             *                $ref: '#/components/schemas/ContentRespBody'
             *       404:
             *         $ref: '#/components/responses/NotFoundBasic'
             *       400:
             *         $ref: '#/components/responses/BadRequestBasic'
             *       401:
             *         $ref: '#/components/responses/UnauthorizedBasic'
             *       403:
             *         $ref: '#/components/responses/ForbiddenBasic'
             */
            /**
             * Get all the content of the product in a json format.
             *
             * @param request
             * @param response
             */
            ContentV4Controller.prototype.getContentByIdentifier = function (request, response) {
                return __awaiter(this, void 0, void 0, function () {
                    var identifierName, identifierValue, productId, error_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                identifierName = request.query.identifierName;
                                identifierValue = request.query.identifierValue;
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 4, , 5]);
                                if (!identifierName) {
                                    throw new AppError_1.AppError("Missing parameter identifierName", 400);
                                }
                                if (!['doi', 'isbn', '_id'].includes(identifierName)) {
                                    throw new AppError_1.AppError("Incorrect identifierName: ".concat(identifierName), 400);
                                }
                                if (!identifierValue) {
                                    throw new AppError_1.AppError("Missing parameter identifierValue", 400);
                                }
                                return [4 /*yield*/, AssetV4_Service_1.assetV4Service.getValidAssetByIdentifierNameValue(identifierName, identifierValue)];
                            case 2:
                                productId = (_a.sent())._id;
                                if (!productId) {
                                    throw new AppError_1.AppError('Content (Product/Asset) not found', 404);
                                }
                                request.params = { id: productId };
                                return [4 /*yield*/, this.getContentByIdBasedOnEntitlement(request, response)];
                            case 3:
                                _a.sent();
                                return [3 /*break*/, 5];
                            case 4:
                                error_1 = _a.sent();
                                LoggerUtil_1.default.handleErrorLog(log, 'getContentByIdentifier', error_1);
                                APIResponse_1.APIResponse.failure(response, error_1);
                                return [3 /*break*/, 5];
                            case 5: return [2 /*return*/];
                        }
                    });
                });
            };
            /**
             * @swagger
             * /content/{productTypeSupported}/download:
             *   get:
             *     tags:
             *     - Content
             *     summary: To get the content url then redirect to the url based on product identifierName
             *       and identifierValue.
             *     description: |
             *       Redirect to the url based on product identifierName and identifierValue.
             *     parameters:
             *     - $ref: "#/components/parameters/productTypeSupported"
             *     - in: query
             *       name: type
             *       required: false
             *       schema:
             *         type: string
             *         enum: [webpdf,previewpdf,dbitsxml,googlepdf,chapterpdf,video,partslist,coverimage]
             *       description: type of the content to filter.
             *     responses:
             *       200:
             *        description: Redirect to another url.
             *       404:
             *         $ref: '#/components/responses/NotFoundBasic'
             *       400:
             *         $ref: '#/components/responses/BadRequestBasic'
             *       401:
             *         $ref: '#/components/responses/UnauthorizedBasic'
             *       403:
             *         $ref: '#/components/responses/ForbiddenBasic'
             */
            /**
             * get the content url then redirect to the url
             * @param request
             * @param response
             */
            ContentV4Controller.prototype.downloadContentByIdentifier = function (request, response) {
                return __awaiter(this, void 0, void 0, function () {
                    var identifierName, identifierValue, contentType, isBot, hasAllContentAccess, productType, categoryType, contextId, _a, productId, type, relUrl, token, ip, filenamePrefix, toRender, content, contentLocation, previewPdfContent, previewPdfLocation, error_2;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                identifierName = request.query.identifierName;
                                identifierValue = request.query.identifierValue;
                                contentType = request.query.type;
                                isBot = request.isBot ? request.isBot : false;
                                hasAllContentAccess = request.hasAllContentAccess
                                    ? request.hasAllContentAccess
                                    : false;
                                productType = request.params.productType;
                                categoryType = request.params.categoryType;
                                contextId = request.query.contextId;
                                _b.label = 1;
                            case 1:
                                _b.trys.push([1, 12, , 13]);
                                if (!identifierName) {
                                    throw new AppError_1.AppError("Missing parameter identifierName", 400);
                                }
                                if (!['doi', 'isbn'].includes(identifierName)) {
                                    throw new AppError_1.AppError("Incorrect identifierName: ".concat(identifierName), 400);
                                }
                                if (!identifierValue) {
                                    throw new AppError_1.AppError("Missing parameter identifierValue", 400);
                                }
                                if (!contentType) {
                                    throw new AppError_1.AppError("Missing parameter type (contentType)", 400);
                                }
                                return [4 /*yield*/, AssetV4_Service_1.assetV4Service.getValidAssetByIdentifierNameValue(identifierName, identifierValue)];
                            case 2:
                                _a = _b.sent(), productId = _a._id, type = _a.type;
                                if (!(productId && type)) {
                                    throw new AppError_1.AppError('Content (Product/Asset) not found', 404);
                                }
                                return [4 /*yield*/, ProductV4_Service_1.productV4Service.getRelUrlFromProduct(productId, type)];
                            case 3:
                                relUrl = _b.sent();
                                token = _.get(request, 'headers.authorization', '').replace('idtoken ', '');
                                ip = requestIp.getClientIp(request);
                                filenamePrefix = identifierValue.replace('/', '_');
                                toRender = false;
                                content = void 0;
                                if (!hasAllContentAccess) return [3 /*break*/, 5];
                                return [4 /*yield*/, ContentV4_Service_1.contentV4Service.getContentByIdAndType(productId, contextId, {
                                        cf: false,
                                        contentType: contentType,
                                        filenamePrefix: filenamePrefix,
                                        ip: ip,
                                        isBot: isBot,
                                        toRender: toRender,
                                        token: token
                                    })];
                            case 4:
                                content = _b.sent();
                                return [3 /*break*/, 7];
                            case 5: return [4 /*yield*/, ContentV4_Service_1.contentV4Service.getOAandBeforePayWallContentByIdAndType(productId, contextId, {
                                    cf: false,
                                    contentType: contentType,
                                    filenamePrefix: filenamePrefix,
                                    ip: ip,
                                    isBot: isBot,
                                    toRender: toRender,
                                    token: token
                                })];
                            case 6:
                                content =
                                    _b.sent();
                                _b.label = 7;
                            case 7:
                                contentLocation = content && content[0] && content[0].location;
                                if (!contentLocation) return [3 /*break*/, 8];
                                this.redirect(response, contentLocation, relUrl);
                                return [3 /*break*/, 11];
                            case 8:
                                if (!(!contentLocation && contentType === 'googlepdf')) return [3 /*break*/, 10];
                                log.info('downloadContentByIdentifier: Google PDF is missing, pulling preview PDF.');
                                return [4 /*yield*/, ContentV4_Service_1.contentV4Service.getContentByIdAndType(productId, null, {
                                        cf: false,
                                        contentType: 'previewpdf',
                                        filenamePrefix: filenamePrefix,
                                        ip: ip,
                                        isBot: isBot,
                                        toRender: toRender,
                                        token: token
                                    })];
                            case 9:
                                previewPdfContent = _b.sent();
                                previewPdfLocation = (previewPdfContent &&
                                    previewPdfContent[0] &&
                                    previewPdfContent[0].location) ||
                                    this.getUBXPageUrl(productType, categoryType, identifierValue);
                                this.redirect(response, previewPdfLocation, relUrl);
                                return [3 /*break*/, 11];
                            case 10:
                                this.redirect(response, this.getUBXPageUrl(productType, categoryType, identifierValue), relUrl);
                                _b.label = 11;
                            case 11: return [3 /*break*/, 13];
                            case 12:
                                error_2 = _b.sent();
                                LoggerUtil_1.default.handleErrorLog(log, 'getContentByIdentifier', error_2);
                                this.redirect(response, this.getUBXPageUrl(productType, categoryType, identifierValue), '');
                                return [3 /*break*/, 13];
                            case 13: return [2 /*return*/];
                        }
                    });
                });
            };
            ContentV4Controller.prototype.redirect = function (response, url, relUrl) {
                log.info('downloadContentByIdentifier: Redirecting to: ', url);
                try {
                    if (relUrl) {
                        response.setHeader('rel', relUrl);
                    }
                }
                catch (error) {
                    log.error('downloadContentByIdentifier: Error setting rel header: ', error);
                }
                response.redirect(url);
            };
            /**
             * Returns the content based on the USER role present in the token.
             * User role should have all-content read permission.
             * @param request express request object
             * @param response express response object
             * @returns Responds with the content data
             */
            ContentV4Controller.prototype.getContentByIdBasedOnRole = function (request, response) {
                return __awaiter(this, void 0, void 0, function () {
                    var skipEntitlementCheck;
                    return __generator(this, function (_a) {
                        skipEntitlementCheck = true;
                        return [2 /*return*/, this.__getContentById(request, response, skipEntitlementCheck)];
                    });
                });
            };
            /**
             * Returns the content based on the entitlement
             * entitlement is checked against (org id of) the token.
             * @param request express request object
             * @param response express response object
             * @returns Responds with the content data
             */
            ContentV4Controller.prototype.getContentByIdBasedOnEntitlement = function (request, response) {
                return __awaiter(this, void 0, void 0, function () {
                    var skipEntitlementCheck;
                    return __generator(this, function (_a) {
                        skipEntitlementCheck = false;
                        return [2 /*return*/, this.__getContentById(request, response, skipEntitlementCheck)];
                    });
                });
            };
            /**
             * DO NOT USE THIS METHOD,
             * instead use getContentByIdBasedOnEntitlement or getContentByIdBasedOnRole.
             * If you want to use then first understand the skipEntitlementCheck parameter,
             * else set the skipEntitlementCheck false,
             * if set to true then this method returns a CONTENT for FREE.
             *
             * This method sends back the requested content data.
             * @param request express request object
             * @param response express response object
             * @param skipEntitlementCheck To skip the entitlement check.
             * Make sure to use this flag carefully.
             * If you have no idea on this flag then set this to "false"
             * @returns Responds with the content data
             */
            ContentV4Controller.prototype.__getContentById = function (request, response, skipEntitlementCheck) {
                if (skipEntitlementCheck === void 0) { skipEntitlementCheck = false; }
                return __awaiter(this, void 0, void 0, function () {
                    var productId, toRender, parentId, contentType, filenamePrefix, token, content, error_3;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                productId = request.params.id;
                                toRender = request.query.render;
                                parentId = request.query.parentId;
                                contentType = request.query.type;
                                filenamePrefix = request.query.filenamePrefix;
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                if (filenamePrefix && filenamePrefix.length > 50) {
                                    throw new AppError_1.AppError('Maximum character length should not exceed 50 for filenamePrefix', 400);
                                }
                                if (toRender && toRender.toLowerCase() === 'true') {
                                    toRender = true;
                                }
                                else if (toRender && toRender.toLowerCase() === 'false') {
                                    toRender = false;
                                }
                                else if (toRender) {
                                    throw new AppError_1.AppError('Invalid query parameter: render', 400);
                                }
                                else {
                                    toRender = false;
                                }
                                token = _.get(request, 'headers.authorization', '').replace('idtoken ', '');
                                return [4 /*yield*/, ContentV4_Service_1.contentV4Service.getContentByIdAndType(productId, parentId, {
                                        cf: false,
                                        contentType: contentType,
                                        filenamePrefix: filenamePrefix,
                                        ip: requestIp.getClientIp(request),
                                        isBot: false,
                                        skipEntitlementCheck: skipEntitlementCheck,
                                        toRender: toRender,
                                        token: token
                                    })];
                            case 2:
                                content = _a.sent();
                                if (!content || !Array.isArray(content) || content.length === 0) {
                                    APIResponse_1.APIResponse.failure(response, new AppError_1.AppError('Content not found', 404));
                                }
                                else {
                                    APIResponse_1.APIResponse.success(response, content);
                                }
                                return [2 /*return*/];
                            case 3:
                                error_3 = _a.sent();
                                LoggerUtil_1.default.handleErrorLog(log, 'getContentById', error_3);
                                APIResponse_1.APIResponse.failure(response, error_3);
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                });
            };
            // gets the UBX-website url corresponds to the requested product
            ContentV4Controller.prototype.getUBXPageUrl = function (type, categoryType, id) {
                return ("".concat(config_1.Config.getPropertyValue('ubxWebsUrl'), "/").concat(constant_1.AppConstants.ContentProxyResourceMapping[type.toLowerCase()]) +
                    (categoryType ? "/".concat(categoryType, "/") : '/') +
                    id);
            };
            return ContentV4Controller;
        }()),
        (function () {
            _getContentByIdBasedOnRole_decorators = [(0, privilege_authorization_manager_1.hasPermission)(['api', 'all-content', 'read'], null, iamEnv)];
            __esDecorate(_a, null, _getContentByIdBasedOnRole_decorators, { kind: "method", name: "getContentByIdBasedOnRole", static: false, private: false, access: { has: function (obj) { return "getContentByIdBasedOnRole" in obj; }, get: function (obj) { return obj.getContentByIdBasedOnRole; } } }, null, _instanceExtraInitializers);
        })(),
        _a;
}();
exports.contentV4Controller = new ContentV4Controller();
