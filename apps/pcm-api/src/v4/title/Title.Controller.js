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
exports.titleController = void 0;
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var AppError_1 = require("../../model/AppError");
var APIResponse_1 = require("../../utils/APIResponse");
var Title_Service_1 = require("./Title.Service");
var Title_Validator_1 = require("./Title.Validator");
var log = LoggerUtil_1.default.getLogger('TitleController');
var TitleController = /** @class */ (function () {
    function TitleController() {
    }
    /**
     * @swagger
     * /products#action=fetchVariants:
     *   post:
     *     tags:
     *     - Miscellaneous
     *     summary: To get variants of same Book product based on identifier (Supports only isbn13).
     *     description: Returns all the variants of the same Book product for the given ISBN.
     *     requestBody:
     *       required: true
     *       content:
     *        application/json:
     *          schema:
     *            $ref: '#/components/requestBodies/ActionFetchVariants'
     *     responses:
     *       200:
     *        description: Returns all variants of the book.
     *        content:
     *          application/json:
     *            schema:
     *              type: array
     *              items:
     *                $ref: '#/components/schemas/TitleRespBody'
     *       404:
     *         $ref: '#/components/responses/NotFoundBasic'
     *       400:
     *         $ref: '#/components/responses/BadRequestBasic'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedBasic'
     *       403:
     *         $ref: '#/components/responses/ForbiddenBasic'
     */
    TitleController.prototype.getProductVariantsByIds = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, formats, identifiers, includeEditions, identifier;
            return __generator(this, function (_b) {
                log.debug('getProductVariantsByIds:: ');
                try {
                    /**
                     * All the validators either return true or throw APP Error.
                     * Make sure to put them inside a try catch and handle the error.
                     */
                    Title_Validator_1.titleValidator.fetchVariantRequestValidator(request);
                    _a = request.body, formats = _a.formats, identifiers = _a.identifiers, includeEditions = _a.includeEditions;
                    identifier = identifiers[0];
                    return [2 /*return*/, Title_Service_1.titleService
                            .getProductVariantsByIds(identifier.name, identifier.values, {
                            formats: formats,
                            includeEditions: includeEditions
                        })
                            .then(function (variantsInfo) {
                            if (!variantsInfo || variantsInfo.length === 0) {
                                APIResponse_1.APIResponse.failure(response, new AppError_1.AppError('Product variants not found.', 404));
                                return;
                            }
                            APIResponse_1.APIResponse.success(response, variantsInfo);
                        })
                            .catch(function (error) {
                            LoggerUtil_1.default.handleErrorLog(log, 'getProductVariantsByIds', error);
                            APIResponse_1.APIResponse.failure(response, error);
                        })];
                }
                catch (error) {
                    LoggerUtil_1.default.handleErrorLog(log, 'getProductVariantsByIds', error);
                    APIResponse_1.APIResponse.failure(response, error);
                }
                return [2 /*return*/];
            });
        });
    };
    return TitleController;
}());
exports.titleController = new TitleController();
