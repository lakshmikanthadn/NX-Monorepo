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
exports.contentV410Controller = void 0;
var privilege_authorization_manager_1 = require("@tandfgroup/privilege-authorization-manager");
var rTracer = require("cls-rtracer");
var isIp = require("is-ip");
var jwt = require("jsonwebtoken");
var jwt_decode_1 = require("jwt-decode");
var _ = require("lodash");
var AppError_1 = require("../../model/AppError");
var APIResponse_1 = require("../../utils/APIResponse");
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var ContentV4_Service_1 = require("../../v4/content/ContentV4.Service");
var SecretMangerUtils_1 = require("../../v4/utils/SecretMangerUtils");
var Content_V410_ReqValidator_1 = require("./Content.V410.ReqValidator");
var config_1 = require("../../config/config");
var log = LoggerUtil_1.default.getLogger('ContentV410Controller');
var iamEnv = config_1.Config.getPropertyValue('iamEnv');
var ContentV410Controller = function () {
    var _a;
    var _instanceExtraInitializers = [];
    var _getContentByIdBasedOnRole_decorators;
    return _a = /** @class */ (function () {
            function ContentV410Controller() {
                __runInitializers(this, _instanceExtraInitializers);
            }
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
             *     - $ref: "#/components/parameters/apiVersion410"
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
             *       name: ipSignature
             *       schema:
             *         type: string
             *       description: |
             *          - Unique encrypted token containing client information.
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
            ContentV410Controller.prototype.handleGetContentById = function (request, response) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        try {
                            Content_V410_ReqValidator_1.contentV410ReqValidator.validateQueryParams(request.query);
                            if (request.query.appName === 'KORTEXT') {
                                return [2 /*return*/, this.getContentByIdBasedOnRole(request, response)];
                            }
                            else {
                                return [2 /*return*/, this.getCfLinkToContentById(request, response)];
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
             * Returns the content based on the USER role present in the token.
             * User role should have all-content read permission.
             * @param request express request object
             * @param response express response object
             * @returns Responds with the content data
             */
            ContentV410Controller.prototype.getContentByIdBasedOnRole = function (request, response) {
                return __awaiter(this, void 0, void 0, function () {
                    var skipEntitlementCheck;
                    return __generator(this, function (_a) {
                        skipEntitlementCheck = true;
                        return [2 /*return*/, this.getCfLinkToContentById(request, response, skipEntitlementCheck)];
                    });
                });
            };
            /**
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
            ContentV410Controller.prototype.getCfLinkToContentById = function (request, response, skipEntitlementCheck) {
                var _a, _b;
                if (skipEntitlementCheck === void 0) { skipEntitlementCheck = false; }
                return __awaiter(this, void 0, void 0, function () {
                    var ipSignature, secretData, decodedIpSignature, _c, ip, userId, isValidIp, authHeaderToken, decodedJwt, content, error_1;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                _d.trys.push([0, 3, , 4]);
                                ipSignature = request.query.ipSignature;
                                if (!ipSignature) {
                                    return [2 /*return*/, APIResponse_1.APIResponse.failure(response, new AppError_1.AppError('Missing parameter ipSignature', 400))];
                                }
                                return [4 /*yield*/, (0, SecretMangerUtils_1.getAPISecretValues)()];
                            case 1:
                                secretData = _d.sent();
                                decodedIpSignature = jwt.verify(ipSignature, secretData.ipVerifierKey);
                                _c = decodedIpSignature, ip = _c.ip, userId = _c.userId;
                                isValidIp = isIp(ip);
                                if (!isValidIp) {
                                    return [2 /*return*/, APIResponse_1.APIResponse.failure(response, new AppError_1.AppError("Invalid IP ".concat(ip), 403))];
                                }
                                authHeaderToken = _.get(request, 'headers.authorization', '').replace('idtoken ', '');
                                decodedJwt = (0, jwt_decode_1.default)(authHeaderToken);
                                log.info('decodedAuthHeaderToken and decodedIpSignature', decodedJwt, decodedIpSignature);
                                if (!(userId === ((_a = decodedJwt === null || decodedJwt === void 0 ? void 0 : decodedJwt.user) === null || _a === void 0 ? void 0 : _a._id) || userId === ((_b = decodedJwt === null || decodedJwt === void 0 ? void 0 : decodedJwt.client) === null || _b === void 0 ? void 0 : _b._id))) {
                                    return [2 /*return*/, APIResponse_1.APIResponse.failure(response, new AppError_1.AppError('User id mismatch', 403))];
                                }
                                return [4 /*yield*/, ContentV4_Service_1.contentV4Service.getContentByIdAndType(request.params.id, request.query.parentId, {
                                        cf: true,
                                        contentType: request.query.type,
                                        filenamePrefix: request.query.filenamePrefix,
                                        ip: ip,
                                        isBot: false,
                                        skipEntitlementCheck: skipEntitlementCheck,
                                        toRender: request.query.render === 'true',
                                        token: authHeaderToken
                                    })];
                            case 2:
                                content = _d.sent();
                                if (!content || !Array.isArray(content) || content.length === 0) {
                                    return [2 /*return*/, APIResponse_1.APIResponse.failure(response, new AppError_1.AppError('Content not found', 404))];
                                }
                                else {
                                    return [2 /*return*/, APIResponse_1.APIResponse.success(response, {
                                            data: content,
                                            metadata: {
                                                transactionId: rTracer.id()
                                            }
                                        })];
                                }
                                return [3 /*break*/, 4];
                            case 3:
                                error_1 = _d.sent();
                                LoggerUtil_1.default.handleErrorLog(log, 'getContentById', error_1);
                                return [2 /*return*/, APIResponse_1.APIResponse.failure(response, error_1)];
                            case 4: return [2 /*return*/];
                        }
                    });
                });
            };
            return ContentV410Controller;
        }()),
        (function () {
            _getContentByIdBasedOnRole_decorators = [(0, privilege_authorization_manager_1.hasPermission)(['api', 'all-content', 'read'], null, iamEnv)];
            __esDecorate(_a, null, _getContentByIdBasedOnRole_decorators, { kind: "method", name: "getContentByIdBasedOnRole", static: false, private: false, access: { has: function (obj) { return "getContentByIdBasedOnRole" in obj; }, get: function (obj) { return obj.getContentByIdBasedOnRole; } } }, null, _instanceExtraInitializers);
        })(),
        _a;
}();
exports.contentV410Controller = new ContentV410Controller();
