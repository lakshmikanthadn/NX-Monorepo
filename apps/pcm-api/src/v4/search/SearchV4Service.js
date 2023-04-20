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
exports.searchV4Service = void 0;
var _ = require("lodash");
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var AppError_1 = require("../../model/AppError");
var AssociatedMediaV4_Service_1 = require("../associatedMedia/AssociatedMediaV4.Service");
var ProductV4_DAO_1 = require("../products/ProductV4.DAO");
var ProductTransform_1 = require("../transform/ProductTransform");
var log = LoggerUtil_1.default.getLogger('SearchV4Service');
var SearchV4Service = /** @class */ (function () {
    function SearchV4Service() {
    }
    SearchV4Service.prototype.searchProducts = function (searchQueryParams) {
        return __awaiter(this, void 0, void 0, function () {
            var productType, offset, hasTotalPrices, hasCounts, availabilityName, availabilityStatus, availability, offsetCursor, limit, searchQueryParserResult, offsetCursorVal, countResp, count, queryWithOffsetCursor, searchResultDataPromiser, _offsetCursor, productsDataFromQuery, productsWrapper, transformedProducts, counts, nextPageCursor, prevPageCursor, _a, firstPageId, lastPageId;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        log.debug('searchProducts:: ');
                        productType = searchQueryParams.productType, offset = searchQueryParams.offset, hasTotalPrices = searchQueryParams.hasTotalPrices, hasCounts = searchQueryParams.hasCounts, availabilityName = searchQueryParams.availabilityName, availabilityStatus = searchQueryParams.availabilityStatus, availability = searchQueryParams.availability, offsetCursor = searchQueryParams.offsetCursor;
                        limit = searchQueryParams.limit;
                        searchQueryParserResult = searchQueryParams.searchQueryParserResult;
                        // Find the products then return them.
                        if (!searchQueryParserResult || searchQueryParserResult.length <= 0) {
                            throw new AppError_1.AppError('Invalid search query', 400, {
                                searchQueryParserResult: searchQueryParserResult
                            });
                        }
                        searchQueryParserResult.forEach(function (sQuery) {
                            if (!(sQuery.type && sQuery.rules)) {
                                throw new AppError_1.AppError("Invalid rule. ".concat(JSON.stringify(sQuery)), 400);
                            }
                        });
                        searchQueryParserResult = this._getQueryWithAvailability(searchQueryParserResult, availabilityName, availabilityStatus, availability);
                        offsetCursorVal = offsetCursor === 'last-page-cursor' ? null : offsetCursor;
                        countResp = [];
                        if (!(offsetCursor === 'last-page-cursor')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getSearchResultCount(searchQueryParserResult)];
                    case 1:
                        countResp = _b.sent();
                        count = countResp[1].count;
                        limit = count % limit || limit;
                        _b.label = 2;
                    case 2:
                        queryWithOffsetCursor = this._getQueryWithOffsetCursor(_.cloneDeep(searchQueryParserResult), offsetCursorVal);
                        searchResultDataPromiser = [
                            this.getSearchResults(queryWithOffsetCursor, offset, offsetCursor, limit, productType, availabilityName, availability)
                        ];
                        if (hasTotalPrices === true) {
                            searchResultDataPromiser.push(this.getSearchResultPrices(searchQueryParserResult));
                        }
                        if (hasCounts === true) {
                            if (offsetCursor === 'last-page-cursor') {
                                searchResultDataPromiser.push(Promise.resolve(countResp));
                            }
                            else {
                                searchResultDataPromiser.push(this.getSearchResultCount(searchQueryParserResult));
                            }
                        }
                        // Call it only 1 time for getting last page _id. Later use it in every request
                        if (typeof offset === 'number' && offset === 0 && !offsetCursor) {
                            _offsetCursor = 'last-page-cursor';
                            searchQueryParserResult = searchQueryParserResult.map(function (sqpr) {
                                sqpr.attributes = [];
                                return sqpr;
                            });
                            searchResultDataPromiser.push(this.getSearchResults(searchQueryParserResult, null, _offsetCursor, 1, productType, availabilityName, availability));
                        }
                        // Call it only 1 time to get first page _id when starting from end. Later use it in every request
                        if (offsetCursor === 'last-page-cursor') {
                            searchQueryParserResult = searchQueryParserResult.map(function (sqpr) {
                                sqpr.attributes = [];
                                return sqpr;
                            });
                            searchResultDataPromiser.push(this.getSearchResults(searchQueryParserResult, 0, null, 1, productType, availabilityName, availability));
                        }
                        return [4 /*yield*/, Promise.all(searchResultDataPromiser)];
                    case 3:
                        productsDataFromQuery = _b.sent();
                        productsWrapper = this._prepareProductWrapperData(productsDataFromQuery[0]);
                        transformedProducts = productsWrapper.map(function (productWrapper) {
                            productWrapper.product = ProductTransform_1.productTransform.transform(productWrapper.product);
                            return productWrapper;
                        });
                        counts = null;
                        if (hasCounts) {
                            counts = hasTotalPrices
                                ? productsDataFromQuery[2]
                                : productsDataFromQuery[1];
                        }
                        nextPageCursor = null;
                        prevPageCursor = null;
                        if (productsDataFromQuery[0].length !== 0) {
                            _a = this.getFirstPageAndLastPageId(offsetCursor, productsDataFromQuery), firstPageId = _a.firstPageId, lastPageId = _a.lastPageId;
                            nextPageCursor = this._getNextPageCursor(productsWrapper, firstPageId, lastPageId);
                            prevPageCursor = this._getPrevPageCursor(productsWrapper, firstPageId, lastPageId);
                        }
                        return [2 /*return*/, {
                                counts: counts,
                                isFirstPageReached: prevPageCursor === null ? true : false,
                                isFromCache: false,
                                isLastPageReached: nextPageCursor === null ? true : false,
                                lastPageCursor: offsetCursor === 'last-page-cursor' ? null : 'last-page-cursor',
                                nextPageCursor: nextPageCursor,
                                prevPageCursor: !offset && !offsetCursor ? null : prevPageCursor,
                                prices: hasTotalPrices === true ? productsDataFromQuery[1] : null,
                                products: transformedProducts
                            }];
                }
            });
        });
    };
    /**
     * This method returns only the metadata for the SearchQuery/RulesList
     * @param parsedSearchQuery Parsed Search query
     * @param options will have hasCounts. hasTotalPrice and availabilityName and availabilityStatus
     * @returns metadata { counts, prices }
     */
    SearchV4Service.prototype.getSearchMetadata = function (parsedSearchQuery, options) {
        return __awaiter(this, void 0, void 0, function () {
            var parsedQueryWithAvailability, searchMetadataPromiser, searchMetadata, totalCount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parsedQueryWithAvailability = this._getQueryWithAvailability(parsedSearchQuery, options.availabilityName, options.availabilityStatus, options.availability);
                        searchMetadataPromiser = [
                            this.getSearchResultCount(parsedQueryWithAvailability),
                            Promise.resolve(null) // Place holder for TotalPrice promiser
                        ];
                        // Replace TotalPrice placeholder with getSearchResultPrices if the hasTotalPrices true
                        if (options.hasTotalPrices === true) {
                            searchMetadataPromiser[1] = this.getSearchResultPrices(parsedQueryWithAvailability);
                        }
                        return [4 /*yield*/, Promise.all(searchMetadataPromiser)];
                    case 1:
                        searchMetadata = _a.sent();
                        totalCount = searchMetadata[0].find(function (count) { return count.type === 'Total'; });
                        if (totalCount.count === 0) {
                            throw new AppError_1.AppError('Products not found.', 404);
                        }
                        return [2 /*return*/, {
                                counts: options.hasCounts ? searchMetadata[0] : null,
                                prices: searchMetadata[1]
                            }];
                }
            });
        });
    };
    SearchV4Service.prototype._getQueryWithAvailability = function (searchQueryParserResult, availabilityName, availabilityStatus, availability) {
        log.debug('_getQueryWithAvailability:: ');
        var availabilityQuery = null;
        if (Array.isArray(availability)) {
            var availabilitySubQuery_1 = [];
            availability.forEach(function (avFilter) {
                availabilitySubQuery_1.push({
                    $elemMatch: {
                        name: avFilter.name,
                        status: _.has(avFilter, 'status.ALL')
                            ? { $all: avFilter.status.ALL }
                            : { $in: avFilter.status.IN }
                    }
                });
            });
            availabilityQuery = {
                availability: {
                    $all: availabilitySubQuery_1
                }
            };
        }
        else if (availabilityName && availabilityStatus) {
            availabilityQuery = {
                availability: {
                    $elemMatch: {
                        name: availabilityName,
                        status: { $all: availabilityStatus }
                    }
                }
            };
        }
        else if (availabilityName) {
            availabilityQuery = { 'availability.name': availabilityName };
        }
        if (availabilityQuery) {
            searchQueryParserResult = searchQueryParserResult.map(function (res) {
                res.rules = { $and: [res.rules, availabilityQuery] };
                return res;
            });
        }
        return searchQueryParserResult;
    };
    SearchV4Service.prototype.getFirstPageAndLastPageId = function (offsetCursor, productsDataFromQuery) {
        var lastPageId = null;
        var firstPageId = null;
        if (!offsetCursor || offsetCursor === 'last-page-cursor') {
            if (!offsetCursor) {
                lastPageId =
                    productsDataFromQuery[productsDataFromQuery.length - 1][0]._id;
                firstPageId = productsDataFromQuery[0][0]._id;
            }
            else {
                firstPageId =
                    productsDataFromQuery[productsDataFromQuery.length - 1][0]._id;
                lastPageId = productsDataFromQuery[0].slice(-1)[0]._id;
            }
        }
        else {
            firstPageId = offsetCursor.split(':')[0];
            lastPageId = offsetCursor.split(':')[1];
        }
        return { firstPageId: firstPageId, lastPageId: lastPageId };
    };
    SearchV4Service.prototype._prepareProductWrapperData = function (products) {
        return products.map(function (product) {
            var availability = product.availability ? product.availability : [];
            delete product['availability'];
            return {
                availability: availability,
                product: product
            };
        });
    };
    SearchV4Service.prototype._getNextPageCursor = function (products, fpId, lpId) {
        if (products && products.length > 0) {
            var textToAppend = 'asc';
            var cursor = _.get(products[products.length - 1], 'product._id', null);
            if (cursor === lpId)
                cursor = null;
            return "".concat(fpId, ":").concat(lpId, ":").concat(cursor, "_").concat(textToAppend);
        }
        return null;
    };
    SearchV4Service.prototype._getPrevPageCursor = function (products, fpId, lpId) {
        if (products && products.length > 0) {
            var textToAppend = 'desc';
            var cursor = _.get(products[0], 'product._id', null);
            if (cursor === fpId)
                return null;
            else
                return "".concat(fpId, ":").concat(lpId, ":").concat(cursor, "_").concat(textToAppend);
        }
        return null;
    };
    SearchV4Service.prototype._getQueryWithOffsetCursor = function (searchQueryParserResult, offsetCursorValue) {
        var _a;
        log.debug('_getQueryWithOffsetCursor:: ');
        var sortOperator = '$gt';
        if (offsetCursorValue) {
            var offsetCursorArrForColon = offsetCursorValue.split(':');
            var offsetCursorArr = offsetCursorArrForColon[offsetCursorArrForColon.length - 1].split('_');
            sortOperator = offsetCursorArr[1] === 'asc' ? '$gt' : '$lt';
            offsetCursorValue = offsetCursorArr[0];
            var offsetCursorQuery_1 = {
                _id: (_a = {}, _a["".concat(sortOperator)] = offsetCursorValue, _a)
            };
            searchQueryParserResult = searchQueryParserResult.map(function (res) {
                res.rules = { $and: [res.rules, offsetCursorQuery_1] };
                return res;
            });
        }
        return searchQueryParserResult;
    };
    SearchV4Service.prototype._calculateTotalProductPrices = function (productsPrices) {
        return productsPrices.reduce(function (totalPrices, productPrices) {
            productPrices.forEach(function (productPrice) {
                var matchingTotalPriceIndex = totalPrices.findIndex(function (totalPrice) {
                    return (totalPrice.currency === productPrice.currency &&
                        totalPrice.priceTypeCode === productPrice.priceTypeCode);
                });
                if (matchingTotalPriceIndex > -1) {
                    totalPrices[matchingTotalPriceIndex].price += productPrice.price;
                    totalPrices[matchingTotalPriceIndex].productsCount +=
                        productPrice.productsCount;
                }
                else {
                    totalPrices.push(productPrice);
                }
            });
            return totalPrices;
        }, []);
    };
    SearchV4Service.prototype.getSearchResults = function (searchQueryParserResult, offset, offsetCursor, limit, productType, availabilityName, availability) {
        if (availabilityName === void 0) { availabilityName = null; }
        return __awaiter(this, void 0, void 0, function () {
            var filteredSearchQuery, projections, sortOrder, cursorAndSortOrderResult, productsRuleRequest, products, asstMediaProjections, productsIdData, asstMedias_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.debug('getSearchResults:: Fetching data from DB', JSON.stringify({ limit: limit, offset: offset, productType: productType }));
                        filteredSearchQuery = searchQueryParserResult.find(function (sQuery) { return sQuery.type === productType; });
                        projections = Object.prototype.hasOwnProperty.call(filteredSearchQuery, 'attributes') &&
                            filteredSearchQuery.attributes.length > 0
                            ? filteredSearchQuery.attributes
                            : ['_id'];
                        sortOrder = 'asc';
                        cursorAndSortOrderResult = offsetCursor && this.getCursorAndSortOrder(offsetCursor, sortOrder);
                        if (cursorAndSortOrderResult) {
                            sortOrder = cursorAndSortOrderResult.sortOrder;
                            offsetCursor = cursorAndSortOrderResult.offsetCursor;
                        }
                        productsRuleRequest = {
                            availability: availability,
                            availabilityName: availabilityName,
                            limit: limit,
                            offset: offset,
                            offsetCursor: offsetCursor,
                            productType: filteredSearchQuery.type,
                            projections: projections,
                            rules: filteredSearchQuery.rules,
                            sortOrder: sortOrder
                        };
                        return [4 /*yield*/, ProductV4_DAO_1.productV4DAO.getProductsByRule(productsRuleRequest)];
                    case 1:
                        products = _a.sent();
                        if (offsetCursor && offsetCursor === 'last-page-cursor') {
                            // reverse original products
                            // this is only done for specific case when offset cursor is last-page-cursor
                            products.reverse();
                        }
                        asstMediaProjections = projections.filter(function (field) {
                            if (!field.includes('associatedMedia')) {
                                return false;
                            }
                            var splitedFields = field.split('.');
                            splitedFields.shift();
                            return (field === 'associatedMedia' ||
                                AssociatedMediaV4_Service_1.associatedMediaV4Service.responseModelProjections.includes(splitedFields.join()));
                        });
                        if (!(asstMediaProjections.length > 0)) return [3 /*break*/, 3];
                        productsIdData = products.map(function (product) { return product._id; });
                        return [4 /*yield*/, AssociatedMediaV4_Service_1.associatedMediaV4Service.getAsstMediasByParentIds(productsIdData)];
                    case 2:
                        asstMedias_1 = _a.sent();
                        products.forEach(function (product) {
                            product['associatedMedia'] = asstMedias_1
                                .filter(function (asstMedia) { return asstMedia.parentId === product._id; })
                                .map(function (asstMedia) {
                                delete asstMedia.parentId;
                                if (asstMediaProjections.includes('associatedMedia')) {
                                    return asstMedia;
                                }
                                var newAsstMedia = {};
                                asstMediaProjections.forEach(function (projection) {
                                    var asstMediaProperty = projection.split('.')[1];
                                    newAsstMedia[asstMediaProperty] = _.get(asstMedia, asstMediaProperty);
                                });
                                return newAsstMedia;
                            });
                        });
                        log.warn("getSearchResults Query Api looking for associatedMedia.");
                        _a.label = 3;
                    case 3: return [2 /*return*/, products];
                }
            });
        });
    };
    SearchV4Service.prototype.getSearchResultPrices = function (searchQueryParserResult) {
        return __awaiter(this, void 0, void 0, function () {
            var productsPricesPromiser, productsPrices;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        productsPricesPromiser = searchQueryParserResult.map(function (sQuery) {
                            return ProductV4_DAO_1.productV4DAO.getProductsPriceByRules(sQuery.type, sQuery.rules);
                        });
                        return [4 /*yield*/, Promise.all(productsPricesPromiser)];
                    case 1:
                        productsPrices = _a.sent();
                        return [2 /*return*/, this._calculateTotalProductPrices(productsPrices)];
                }
            });
        });
    };
    SearchV4Service.prototype.getCursorAndSortOrder = function (offsetCursor, sortOrder) {
        if (offsetCursor !== 'last-page-cursor') {
            var offsetCursorArrForColon = offsetCursor.split(':');
            var offsetCursorArr = offsetCursorArrForColon[offsetCursorArrForColon.length - 1].split('_');
            sortOrder = offsetCursorArr[1];
            offsetCursor = offsetCursorArr[0];
        }
        else {
            sortOrder = 'desc';
        }
        return { offsetCursor: offsetCursor, sortOrder: sortOrder };
    };
    SearchV4Service.prototype.getSearchResultCount = function (searchQueryParserResult) {
        return __awaiter(this, void 0, void 0, function () {
            var productsCountPromiser;
            return __generator(this, function (_a) {
                productsCountPromiser = searchQueryParserResult.map(function (sQuery) {
                    return ProductV4_DAO_1.productV4DAO.getProductsCountByRule(sQuery.type, sQuery.rules);
                });
                return [2 /*return*/, Promise.all(productsCountPromiser).then(function (counts) {
                        var totalCount = {
                            count: 0,
                            type: 'Total'
                        };
                        var productsCount = counts.map(function (count, index) {
                            totalCount.count += count;
                            var type = searchQueryParserResult[index]
                                .type;
                            return { count: count, type: type };
                        });
                        productsCount.push(totalCount);
                        return Promise.resolve(productsCount);
                    })];
            });
        });
    };
    return SearchV4Service;
}());
exports.searchV4Service = new SearchV4Service();
