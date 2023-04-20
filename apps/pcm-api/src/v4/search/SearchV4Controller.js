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
exports.searchV4Controller = void 0;
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var config_1 = require("../../config/config");
var AppError_1 = require("../../model/AppError");
var APIResponse_1 = require("../../utils/APIResponse");
var QueryParser_1 = require("../../utils/QueryParser");
var CountAPIValidator_1 = require("../validator/requestValidator/CountAPIValidator");
var QueryAPIValidator_1 = require("../validator/requestValidator/QueryAPIValidator");
var SearchV4Service_1 = require("./SearchV4Service");
var log = LoggerUtil_1.default.getLogger('SearchV4Controller');
var SearchV4Controller = /** @class */ (function () {
    function SearchV4Controller() {
    }
    /**
     * @swagger
     * /products#action=query:
     *   post:
     *     tags:
     *     - Miscellaneous
     *     summary: To query products based on rules
     *     description: |
     *      This endpoint is used to query the products Based the rules.
     *        - Response is paginated.
     *        - Use limit parameter(in-body) to limit the number of products.
     *        - Use attributes parameter(in-body) to project only required fields.
     *        - By default returns only _id for each product.
     *        - Each nested filter has to be enclosed within a BEGIN and END separator.
     *     requestBody:
     *       required: true
     *       content:
     *        application/json:
     *          schema:
     *            $ref: '#/components/requestBodies/ActionQuery'
     *     responses:
     *       200:
     *        description: Response object of metadata and data blocks based on rules provided
     *        content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/QueryRespBody'
     *       404:
     *         $ref: '#/components/responses/NotFoundBasic'
     *       400:
     *         $ref: '#/components/responses/BadRequestBasic'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedBasic'
     *       403:
     *         $ref: '#/components/responses/ForbiddenBasic'
     */
    SearchV4Controller.prototype.searchProducts = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var searchPayload, offset_1, limit_1, offsetCursor, hasTotalPrices, hasCounts, productType_1, searchQuery, cacheId, sortBy, sortOrder, availability, availabilityName, availabilityStatus, name_1, status_1, searchQueryParserResult;
            return __generator(this, function (_a) {
                searchPayload = request.body;
                try {
                    QueryAPIValidator_1.queryAPIValidator.validateSearch(request);
                    offset_1 = parseInt(searchPayload.offset, 10)
                        ? parseInt(searchPayload.offset, 10)
                        : 0;
                    limit_1 = parseInt(searchPayload.limit, 10)
                        ? parseInt(searchPayload.limit, 10)
                        : config_1.Config.getPropertyValue('defaultBatchSizeV4');
                    offsetCursor = searchPayload.offsetCursor;
                    hasTotalPrices = searchPayload.hasTotalPrices;
                    hasCounts = searchPayload.hasCounts;
                    productType_1 = searchPayload.rulesList[0].type;
                    searchQuery = searchPayload.rulesList;
                    cacheId = searchPayload['@id'];
                    sortBy = searchPayload.sortBy;
                    sortOrder = searchPayload.sortOrder;
                    availability = searchPayload.availability;
                    availabilityName = void 0;
                    availabilityStatus = void 0;
                    if (availability && !Array.isArray(availability)) {
                        name_1 = availability.name, status_1 = availability.status;
                        availabilityName = name_1;
                        availabilityStatus = status_1;
                    }
                    log.debug('searchProducts: ', {
                        hasCounts: hasCounts,
                        hasTotalPrices: hasTotalPrices,
                        limit: limit_1,
                        offset: offset_1,
                        productType: productType_1,
                        sortBy: sortBy,
                        sortOrder: sortOrder
                    });
                    searchQueryParserResult = void 0;
                    try {
                        searchQueryParserResult = this.mapAndParseSearchQuery(searchQuery);
                    }
                    catch (parserError) {
                        throw new AppError_1.AppError(parserError.message, 400);
                    }
                    if (availability) {
                        searchQueryParserResult = SearchV4Service_1.searchV4Service._getQueryWithAvailability(searchQueryParserResult, availabilityName, availabilityStatus, availability);
                    }
                    log.debug('searchQueryParserResult::', JSON.stringify(searchQueryParserResult));
                    return [2 /*return*/, SearchV4Service_1.searchV4Service
                            .searchProducts({
                            availability: availability,
                            availabilityName: availabilityName,
                            availabilityStatus: availabilityStatus,
                            cacheId: cacheId,
                            hasCounts: hasCounts,
                            hasTotalPrices: hasTotalPrices,
                            limit: limit_1,
                            offset: offset_1,
                            offsetCursor: offsetCursor,
                            productType: productType_1,
                            searchQueryParserResult: searchQueryParserResult
                        })
                            .then(function (searchResult) {
                            log.debug('searchProducts Results:::', JSON.stringify(searchResult));
                            var products = searchResult.products;
                            if (!(products && products.length > 0)) {
                                throw new AppError_1.AppError('Products not found', 404);
                            }
                            // This to trim the price values to max two decimal numbers.
                            if (searchResult && searchResult.prices) {
                                searchResult.prices = searchResult.prices.map(function (searchResultPrice) {
                                    searchResultPrice.price = parseFloat(searchResultPrice.price.toFixed(2));
                                    return searchResultPrice;
                                });
                            }
                            var respMetadata = {
                                counts: searchResult.counts,
                                isFirstPageReached: searchResult.isFirstPageReached,
                                isLastPageReached: searchResult.isLastPageReached,
                                lastPageCursor: searchResult.lastPageCursor,
                                limit: limit_1,
                                nextPageCursor: searchResult.nextPageCursor,
                                offset: offset_1,
                                prevPageCursor: searchResult.prevPageCursor,
                                prices: searchResult.prices,
                                source: 'Mongo',
                                type: productType_1
                            };
                            var responseOb = { data: products, metadata: respMetadata };
                            APIResponse_1.APIResponse.success(response, responseOb);
                        })
                            .catch(function (error) {
                            LoggerUtil_1.default.handleErrorLog(log, 'searchProducts: ', error);
                            APIResponse_1.APIResponse.failure(response, error);
                        })];
                }
                catch (error) {
                    LoggerUtil_1.default.handleErrorLog(log, 'searchProducts: ', error);
                    APIResponse_1.APIResponse.failure(response, error);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * @swagger
     * /products#action=count:
     *   post:
     *     tags:
     *     - Miscellaneous
     *     summary: To count products with a given set of criteria.
     *     description: To count specifically products and prices.
     *     requestBody:
     *       required: true
     *       content:
     *        application/json:
     *          schema:
     *            $ref: '#/components/requestBodies/ActionCount'
     *     responses:
     *       200:
     *        description: Response object of only metadata block
     *        content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CountRespBody'
     *       404:
     *         $ref: '#/components/responses/NotFoundBasic'
     *       400:
     *         $ref: '#/components/responses/BadRequestBasic'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedBasic'
     *       403:
     *         $ref: '#/components/responses/ForbiddenBasic'
     */
    SearchV4Controller.prototype.getSearchMetadata = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, hasTotalPrices, hasCounts, availability, availabilityName, availabilityStatus, name_2, status_2, searchQueryParserResult;
            return __generator(this, function (_b) {
                try {
                    CountAPIValidator_1.countAPIValidator.validateCountApi(request);
                    _a = request.body, hasTotalPrices = _a.hasTotalPrices, hasCounts = _a.hasCounts, availability = _a.availability;
                    availabilityName = void 0;
                    availabilityStatus = void 0;
                    if (availability && !Array.isArray(availability)) {
                        name_2 = availability.name, status_2 = availability.status;
                        availabilityName = name_2;
                        availabilityStatus = status_2;
                    }
                    searchQueryParserResult = void 0;
                    try {
                        searchQueryParserResult = this.mapAndParseSearchQuery(request.body.rulesList);
                    }
                    catch (parserError) {
                        LoggerUtil_1.default.handleErrorLog(log, 'getSearchMetadata: ', parserError);
                        throw new AppError_1.AppError(parserError.message, 400);
                    }
                    if (availability) {
                        searchQueryParserResult = SearchV4Service_1.searchV4Service._getQueryWithAvailability(searchQueryParserResult, availabilityName, availabilityStatus, availability);
                    }
                    return [2 /*return*/, SearchV4Service_1.searchV4Service
                            .getSearchMetadata(searchQueryParserResult, {
                            availability: availability,
                            availabilityName: availabilityName,
                            availabilityStatus: availabilityStatus,
                            hasCounts: hasCounts,
                            hasTotalPrices: hasTotalPrices
                        })
                            .then(function (searchMetaData) {
                            if (searchMetaData && searchMetaData.prices) {
                                searchMetaData.prices = searchMetaData.prices.map(function (searchResultPrice) {
                                    searchResultPrice.price = parseFloat(searchResultPrice.price.toFixed(2));
                                    return searchResultPrice;
                                });
                            }
                            var respMetadata = {
                                counts: searchMetaData.counts,
                                prices: searchMetaData.prices
                            };
                            var responseOb = { data: null, metadata: respMetadata };
                            APIResponse_1.APIResponse.success(response, responseOb);
                        })
                            .catch(function (error) {
                            LoggerUtil_1.default.handleErrorLog(log, 'getSearchMetadata', error);
                            APIResponse_1.APIResponse.failure(response, error);
                        })];
                }
                catch (error) {
                    LoggerUtil_1.default.handleErrorLog(log, 'getSearchMetadata', error);
                    APIResponse_1.APIResponse.failure(response, error);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Developed for internal usage only
     * This method is to just parse rulesList
     * and send the parsed ruleList in response
     * @param request
     * @param response
     */
    SearchV4Controller.prototype.parseSearchQuery = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var searchQueryParserResult;
            return __generator(this, function (_a) {
                try {
                    searchQueryParserResult = this.mapAndParseSearchQuery(request.body.rulesList);
                    APIResponse_1.APIResponse.success(response, searchQueryParserResult);
                }
                catch (parserError) {
                    LoggerUtil_1.default.handleErrorLog(log, 'parseSearchQuery: ', parserError);
                    APIResponse_1.APIResponse.failure(response, new AppError_1.AppError(parserError.message, 400));
                }
                return [2 /*return*/];
            });
        });
    };
    SearchV4Controller.prototype.mapAndParseSearchQuery = function (searchQueries) {
        return QueryParser_1.queryParserV4.parse(searchQueries);
    };
    return SearchV4Controller;
}());
exports.searchV4Controller = new SearchV4Controller();
