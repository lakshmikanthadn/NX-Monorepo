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
exports.partsV410Controller = exports.PartsV410Controller = void 0;
var config_1 = require("../../config/config");
var APIResponse_1 = require("../../utils/APIResponse");
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var InputValidator_1 = require("../../v4/validator/InputValidator");
var Parts_V410_Service_1 = require("./Parts.V410.Service");
var log = LoggerUtil_1.default.getLogger('PartsV410Controller');
var PartsV410Controller = /** @class */ (function () {
    function PartsV410Controller() {
    }
    /**
     * @swagger
     * /products/{id}/parts:
     *   get:
     *     tags:
     *     - Parts
     *     summary: >
     *       To get parts data with region exclusion and partial search
     *       of the given collection product based on id (collection product uuid).
     *     description: >
     *       Returns list of all the parts for a given product id.
     *       Currently accepts only product id of collection products.
     *       Also the response is available in two flavours small and medium.
     *     parameters:
     *     - $ref: "#/components/parameters/id"
     *     - $ref: "#/components/parameters/apiVersion"
     *     - $ref: "#/components/parameters/responseGroupForParts"
     *     - $ref: "#/components/parameters/offsetParam"
     *     - $ref: "#/components/parameters/limitParamForParts"
     *     - $ref: "#/components/parameters/region"
     *     responses:
     *       200:
     *        description: Returns a collection product's Has-parts
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
    PartsV410Controller.prototype.getProductHasParts = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var queryParams, responseGroup, id, limit, offsetCursor, region, version, searchTerm, appName, productHasParts, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.debug('getProductHasParts : Request Params: ', request.params);
                        queryParams = request.query;
                        responseGroup = request.query.responseGroup || 'small';
                        id = request.params.identifier;
                        limit = parseInt(queryParams.limit, 10)
                            ? parseInt(queryParams.limit, 10)
                            : config_1.Config.getPropertyValue('defaultBatchSizeV4');
                        offsetCursor = queryParams.offsetCursor;
                        region = queryParams.region;
                        version = queryParams.version;
                        searchTerm = queryParams.q;
                        appName = queryParams.appName;
                        log.debug('getProductHasParts: ', {
                            appName: appName,
                            id: id,
                            limit: limit,
                            offsetCursor: offsetCursor,
                            region: region,
                            responseGroup: responseGroup,
                            searchTerm: searchTerm,
                            version: version
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        InputValidator_1.inputValidator.productv410HasPartsValidator(request);
                        return [4 /*yield*/, Parts_V410_Service_1.partsV410Service.getProductHasParts(id, limit, offsetCursor, region, version, searchTerm, responseGroup)];
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
    return PartsV410Controller;
}());
exports.PartsV410Controller = PartsV410Controller;
exports.partsV410Controller = new PartsV410Controller();
