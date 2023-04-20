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
exports.partsV4Controller = exports.PartsV4Controller = void 0;
var config_1 = require("../../config/config");
var APIResponse_1 = require("../../utils/APIResponse");
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var InputValidator_1 = require("../validator/InputValidator");
var PartsV4_Service_1 = require("./PartsV4.Service");
var log = LoggerUtil_1.default.getLogger('PartsV4Controller');
var PartsV4Controller = /** @class */ (function () {
    function PartsV4Controller() {
    }
    /**
     * @swagger
     * /products/{id}/parts:
     *   get:
     *     tags:
     *     - Parts
     *     summary: To get parts data of the product based on id (product uuid).
     *     description: >
     *       Returns list of all the parts for a given product id.
     *        One can use additional filters to get the specific parts using productType and format.
     *        Also the response is available in two flavours small and medium.
     *     parameters:
     *     - $ref: "#/components/parameters/id"
     *     - $ref: "#/components/parameters/apiVersion"
     *     - $ref: "#/components/parameters/responseGroupForParts"
     *     - $ref: "#/components/parameters/offsetParam"
     *     - $ref: "#/components/parameters/limitParamForParts"
     *     - $ref: "#/components/parameters/productType"
     *     - $ref: "#/components/parameters/depth"
     *     - in: query
     *       name: format
     *       schema:
     *         type: string
     *         enum: [video, hyperlink, document, presentation, image,
     * portableDocument, audio, database, archive, spreadsheet]
     *       description: Filter product parts by specific format, applicable only for creativeWork
     *     responses:
     *       200:
     *        description: Returns a Product's Has-parts
     *        content:
     *          application/json:
     *            schema:
     *              type: array
     *              items:
     *                anyOf:
     *                 - $ref: '#/components/schemas/PartsSmall'
     *                 - $ref: '#/components/schemas/PartsMedium'
     *       404:
     *         $ref: '#/components/responses/NotFoundBasic'
     *       400:
     *         $ref: '#/components/responses/BadRequestBasic'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedBasic'
     *       403:
     *         $ref: '#/components/responses/ForbiddenBasic'
     */
    PartsV4Controller.prototype.getProductHasParts = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var responseGroup, identifierValue, limit, offset, parsedLimit, parsedOffset, defaultBatchSize, partType, format, productVersion, depth, requestedIncludeCounts, includeCounts, identifierName, parsedDepth, productHasParts, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.debug('getProductHasParts : Request Params : ', request.params);
                        responseGroup = request.query.responseGroup;
                        identifierValue = request.params.identifier;
                        limit = request.query.limit;
                        offset = request.query.offset;
                        parsedLimit = parseInt(limit, 10);
                        parsedOffset = parseInt(offset, 10);
                        defaultBatchSize = config_1.Config.getPropertyValue('defaultBatchSizeV4');
                        partType = request.query.type;
                        format = request.query.format;
                        productVersion = request.query.productVersion;
                        depth = request.query.depth;
                        requestedIncludeCounts = request.query.includeCounts;
                        includeCounts = requestedIncludeCounts && requestedIncludeCounts.toLowerCase() === 'true'
                            ? true
                            : false;
                        identifierName = request.query.productIdentifierName;
                        parsedDepth = parseInt(depth, 10) || 1;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        /**
                         * All the validators either return true or throw APP Error.
                         * Make sure to put them inside a try catch and handle the error.
                         */
                        InputValidator_1.inputValidator.productHasPartsValidator(request);
                        offset = parsedOffset ? parsedOffset : 0;
                        limit = parsedLimit ? parsedLimit : defaultBatchSize;
                        identifierName = identifierName ? identifierName : '_id';
                        return [4 /*yield*/, PartsV4_Service_1.partsV4Service.getProductHasParts(identifierValue, identifierName, offset, limit, includeCounts, partType, format, responseGroup, productVersion, request.query.apiVersion === '4.0.2' ? true : false, parsedDepth)];
                    case 2:
                        productHasParts = _a.sent();
                        APIResponse_1.APIResponse.success(response, productHasParts);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        LoggerUtil_1.default.handleErrorLog(log, 'getProductHasParts', error_1);
                        APIResponse_1.APIResponse.failure(response, error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @swagger
     * /products/{id}/parts/{partId}:
     *   get:
     *     tags:
     *     - Parts
     *     summary: To get part details of the product based on product id and part id.
     *     description: >
     *       Returns a one part for a given part-id from the list of parts of the parent.
     *       Also the response is available in two flavours small and medium.
     *     parameters:
     *     - $ref: "#/components/parameters/id"
     *     - $ref: "#/components/parameters/partIdParam"
     *     - $ref: "#/components/parameters/apiVersion"
     *     - $ref: "#/components/parameters/responseGroupForParts"
     *     responses:
     *       200:
     *        description: Returns a Product's Has-part
     *        content:
     *          application/json:
     *            schema:
     *             anyOf:
     *              - $ref: '#/components/schemas/PartsSmall'
     *              - $ref: '#/components/schemas/PartsMedium'
     *       404:
     *         $ref: '#/components/responses/NotFoundBasic'
     *       400:
     *         $ref: '#/components/responses/BadRequestBasic'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedBasic'
     *       403:
     *         $ref: '#/components/responses/ForbiddenBasic'
     */
    PartsV4Controller.prototype.getProductHasPart = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var responseGroup, identifier, partId, productHasPart, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.debug('getProductHasPart : Request Params : ', request.params);
                        responseGroup = request.query.responseGroup;
                        identifier = request.params.identifier;
                        partId = request.params.partId;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        /**
                         * All the validators either return true or throw APP Error.
                         * Make sure to put them inside a try catch and handle the error.
                         */
                        InputValidator_1.inputValidator.productHasPartsValidator(request);
                        return [4 /*yield*/, PartsV4_Service_1.partsV4Service.getProductHasPart(identifier, partId, responseGroup)];
                    case 2:
                        productHasPart = _a.sent();
                        APIResponse_1.APIResponse.success(response, productHasPart);
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        LoggerUtil_1.default.handleErrorLog(log, 'getProductHasPart', error_2);
                        APIResponse_1.APIResponse.failure(response, error_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @swagger
     * /products/{id}/parts-delta:
     *   get:
     *     tags:
     *     - Parts
     *     summary: To get delta in parts of a product based on the product versions and product id.
     *     description: >
     *       Returns the parts added and removed from the list of parts of any 2 versions of the parent.
     *       Region filter can also be applied to restrict parts from specifed region in response.
     *       The response is available in small flavour.
     *     parameters:
     *     - $ref: "#/components/parameters/id"
     *     - $ref: "#/components/parameters/apiVersion"
     *     - $ref: "#/components/parameters/responseGroupForParts"
     *     - $ref: "#/components/parameters/region"
     *     responses:
     *       200:
     *        description: returns delta between a product's parts
     *        content:
     *          application/json:
     *            schema:
     *             anyOf:
     *              - $ref: '#/components/schemas/PartsSmall'
     *       404:
     *         $ref: '#/components/responses/NotFoundBasic'
     *       400:
     *         $ref: '#/components/responses/BadRequestBasic'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedBasic'
     *       403:
     *         $ref: '#/components/responses/ForbiddenBasic'
     */
    PartsV4Controller.prototype.getProductPartsDelta = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var identifier, v1, v2, responseGroup, region, productPartsDelta, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.debug('getProductPartsDelta : Request Params : ', request.params);
                        identifier = request.params.identifier;
                        v1 = request.query.v1;
                        v2 = request.query.v2;
                        responseGroup = request.query.responseGroup;
                        region = request.query.region;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        InputValidator_1.inputValidator.productPartsDeltaValidator(request);
                        return [4 /*yield*/, PartsV4_Service_1.partsV4Service.getProductPartsDelta(identifier, v1, v2, region, responseGroup)];
                    case 2:
                        productPartsDelta = _a.sent();
                        APIResponse_1.APIResponse.success(response, productPartsDelta);
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        LoggerUtil_1.default.handleErrorLog(log, 'getProductHasPart', error_3);
                        APIResponse_1.APIResponse.failure(response, error_3);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return PartsV4Controller;
}());
exports.PartsV4Controller = PartsV4Controller;
exports.partsV4Controller = new PartsV4Controller();
