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
exports.productV4DAO = void 0;
var mongoose = require("mongoose");
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var constant_1 = require("../../config/constant");
var config_1 = require("../../config/config");
var AppError_1 = require("../../model/AppError");
var GenricSchema_1 = require("../../model/GenricSchema");
var docTypeToCollectionMapperV4 = config_1.Config.getPropertyValue('docTypeToCollectionMapperV4');
var validProductTypes = Object.keys(docTypeToCollectionMapperV4);
var log = LoggerUtil_1.default.getLogger('ProductV4DAO');
var ProductV4DAO = /** @class */ (function () {
    function ProductV4DAO() {
        this.productModelsHolder = {};
    }
    ProductV4DAO.prototype.getProduct = function (productType, id, projectionFields, availabilityName, availabilityStatus, productVersion, region) {
        return __awaiter(this, void 0, void 0, function () {
            var model, query, projections;
            return __generator(this, function (_a) {
                log.debug('getProduct:: ', {
                    availabilityName: availabilityName,
                    availabilityStatus: availabilityStatus,
                    id: id,
                    productType: productType,
                    productVersion: productVersion,
                    projectionFields: projectionFields,
                    region: region
                });
                model = this.getProductModel(productType);
                query = { _id: id };
                if (productVersion) {
                    query['version'] = productVersion;
                }
                if (region) {
                    query['rights.iso3'] = { $ne: region };
                }
                projections = this.prepareMongoProjections(projectionFields);
                log.debug('getProduct:: ', { projections: projections, query: query });
                return [2 /*return*/, model.findOne(query, projections).lean().exec()];
            });
        });
    };
    /**
     * This method finds the all the product with status as active from the mongoDB.
     * @param productType
     * @param ids array of uuid
     */
    ProductV4DAO.prototype.getActiveProductByIds = function (productType, ids) {
        return __awaiter(this, void 0, void 0, function () {
            var model, query, projections;
            var _a;
            return __generator(this, function (_b) {
                log.debug('getActiveProductByIds:: ', {
                    ids: ids,
                    productType: productType
                });
                model = this.getProductModel(productType);
                query = {
                    $and: [
                        { _id: { $in: ids } },
                        (_a = {},
                            _a["".concat(productType, ".lifetime.active")] = true,
                            _a)
                    ]
                };
                projections = this.prepareMongoProjections(['_id']);
                log.debug('getActiveProductByIds:: ', { projections: projections, query: query });
                return [2 /*return*/, model.find(query, projections).lean().exec()];
            });
        });
    };
    ProductV4DAO.prototype.getProductsByIds = function (productType, ids, productFilterOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, projectionFields, productVersion, model, query, projections;
            return __generator(this, function (_b) {
                log.debug('getProductsByIds:: ', {
                    ids: ids,
                    productFilterOptions: productFilterOptions,
                    productType: productType
                });
                _a = productFilterOptions.projectionFields, projectionFields = _a === void 0 ? [] : _a, productVersion = productFilterOptions.productVersion;
                model = this.getProductModel(productType);
                query = { _id: { $in: ids } };
                if (productVersion) {
                    query['version'] = productVersion;
                }
                projections = this.prepareMongoProjections(projectionFields);
                log.debug('getProductsByIds:: ', { projections: projections, query: query });
                return [2 /*return*/, model.find(query, projections).lean().exec()];
            });
        });
    };
    ProductV4DAO.prototype.getProductsWithType = function (productType, offset, limit, filedsForProjections, availabilityName, availabilityStatus, productVersion) {
        return __awaiter(this, void 0, void 0, function () {
            var model, query, projections;
            return __generator(this, function (_a) {
                log.debug('getProductsWithType:: ', {
                    availabilityName: availabilityName,
                    filedsForProjections: filedsForProjections,
                    limit: limit,
                    offset: offset,
                    productType: productType,
                    productVersion: productVersion
                });
                model = this.getProductModel(productType);
                query = {};
                if (productVersion) {
                    query['version'] = productVersion;
                }
                projections = this.prepareMongoProjections(filedsForProjections);
                log.debug('getProductsWithType:: ', { query: query });
                return [2 /*return*/, model
                        .find(query, projections)
                        .sort({ _id: 1 })
                        .skip(offset)
                        .limit(limit)
                        .lean()
                        .exec()];
            });
        });
    };
    ProductV4DAO.prototype.getProductByTitle = function (title, productType, fieldsForProjections) {
        return __awaiter(this, void 0, void 0, function () {
            var model, query, projections;
            return __generator(this, function (_a) {
                log.debug('getProductByTitle:: ', {
                    fieldsForProjections: fieldsForProjections,
                    productType: productType,
                    title: title
                });
                model = this.getProductModel(productType);
                query = { title: title };
                projections = this.prepareMongoProjections(fieldsForProjections);
                log.debug('getProductByTitle:: ', { query: query });
                return [2 /*return*/, model.findOne(query, projections).lean().exec()];
            });
        });
    };
    ProductV4DAO.prototype.getProductByIdentifier = function (identifierName, identifierValue, productType, fieldsForProjections) {
        return __awaiter(this, void 0, void 0, function () {
            var model, query, projections;
            return __generator(this, function (_a) {
                log.debug('getProductByIdentifier:: ', {
                    fieldsForProjections: fieldsForProjections,
                    identifierName: identifierName,
                    identifierValue: identifierValue,
                    productType: productType
                });
                model = this.getProductModel(productType);
                query = {};
                query[identifierName] = identifierValue;
                projections = this.prepareMongoProjections(fieldsForProjections);
                log.debug('getProductByIdentifier:: ', { query: query });
                return [2 /*return*/, model.find(query, projections).lean().exec()];
            });
        });
    };
    ProductV4DAO.prototype.getPreArticlesByIdentifier = function (identifierName, identifierValues, productType, fieldsForProjections) {
        return __awaiter(this, void 0, void 0, function () {
            var keyNameMapper, model, query, caseInsensitiveValues, projections;
            return __generator(this, function (_a) {
                log.debug('getPreArticlesByIdentifier:: ', {
                    fieldsForProjections: fieldsForProjections,
                    identifierName: identifierName,
                    identifierValues: identifierValues,
                    productType: productType
                });
                keyNameMapper = constant_1.AppConstants.PreArticleIdentifiersNameMappingV4;
                model = this.getProductModel(productType);
                query = {};
                caseInsensitiveValues = identifierValues.map(function (item) { return new RegExp(item, 'i'); });
                query[keyNameMapper[identifierName]] = { $in: caseInsensitiveValues };
                projections = this.prepareMongoProjections(fieldsForProjections);
                log.debug('getPreArticlesByIdentifier:: ', { query: query });
                return [2 /*return*/, model.find(query, projections).lean().exec()];
            });
        });
    };
    ProductV4DAO.prototype.getProductsCountByRule = function (productType, rule) {
        return __awaiter(this, void 0, void 0, function () {
            var model;
            return __generator(this, function (_a) {
                log.debug("getProductsCount:: ", JSON.stringify({ productType: productType, rule: rule }));
                model = this.getProductModel(productType);
                return [2 /*return*/, model.count(rule).exec()];
            });
        });
    };
    ProductV4DAO.prototype.getProductsByRule = function (productsRuleRequest) {
        return __awaiter(this, void 0, void 0, function () {
            var productType, availability, model, aggQuery;
            return __generator(this, function (_a) {
                productType = productsRuleRequest.productType, availability = productsRuleRequest.availability;
                if (Array.isArray(availability) && availability.length > 0) {
                    model = this.getProductModel(productType);
                    aggQuery = this.prepareProductsRulesQuery(productsRuleRequest);
                    return [2 /*return*/, model.aggregate(aggQuery).exec()];
                }
                else {
                    return [2 /*return*/, this.prepareProductsRulesQuery(productsRuleRequest).lean().exec()];
                }
                return [2 /*return*/];
            });
        });
    };
    ProductV4DAO.prototype.getProductsPriceByRules = function (productType, rules) {
        return __awaiter(this, void 0, void 0, function () {
            var model, aggQuery;
            return __generator(this, function (_a) {
                log.debug("getProductsPriceByRules:: ", JSON.stringify({ productType: productType, rules: rules }));
                model = this.getProductModel(productType);
                aggQuery = this._generateAggQueryForPrice(rules);
                return [2 /*return*/, model.aggregate(aggQuery).exec()];
            });
        });
    };
    ProductV4DAO.prototype.prepareProductsRulesQuery = function (productsRuleRequest) {
        var productType = productsRuleRequest.productType, rules = productsRuleRequest.rules, projections = productsRuleRequest.projections, availabilityName = productsRuleRequest.availabilityName, offset = productsRuleRequest.offset, limit = productsRuleRequest.limit, availability = productsRuleRequest.availability, sortOrder = productsRuleRequest.sortOrder;
        log.debug("getProducts:: ", JSON.stringify({
            availabilityName: availabilityName,
            limit: limit,
            offset: offset,
            projections: projections,
            rules: rules
        }));
        log.info("getProducts:: inputQuery", JSON.stringify({ rules: rules }));
        var model = this.getProductModel(productType);
        var mongoProjections = this.prepareMongoProjections(projections);
        var sortQuery = {
            _id: sortOrder === 'asc' ? 1 : -1
        };
        if (Array.isArray(availability) && availability.length > 0) {
            var channelNames = availability.map(function (av) { return av.name; });
            mongoProjections['availability'] =
                this.getProjectionFilterForAvailability(channelNames);
            var aggregateQuery = [
                { $match: rules },
                { $project: mongoProjections },
                { $sort: sortQuery }
            ];
            if (offset) {
                aggregateQuery.push({ $skip: offset });
            }
            if (limit) {
                aggregateQuery.push({ $limit: limit });
            }
            return aggregateQuery;
        }
        else {
            // adds availability into projections if it's given in the request
            if (availabilityName) {
                mongoProjections['availability'] = {
                    $elemMatch: {
                        name: availabilityName
                    }
                };
            }
            var mongoQuery = model.find(rules, mongoProjections);
            mongoQuery.sort(sortQuery);
            if (offset) {
                mongoQuery.skip(offset);
            }
            if (limit) {
                mongoQuery.limit(limit);
            }
            return mongoQuery;
        }
    };
    ProductV4DAO.prototype._generateAggQueryForPrice = function (mQuery) {
        var priceFilter = {
            as: 'price',
            cond: {
                $and: [
                    { $eq: ['$$price.priceTypeCode', 'BYO'] },
                    { $in: ['$$price.currency', ['GBP', 'USD']] }
                ]
            },
            input: '$prices'
        };
        var priceGrouper = {
            _id: {
                currency: '$prices.currency',
                priceTypeCode: '$prices.priceTypeCode'
            },
            price: { $sum: '$prices.price' },
            priceType: { $first: '$prices.priceType' },
            productsCount: { $sum: 1 }
        };
        return [
            { $match: mQuery },
            {
                $project: {
                    prices: { $filter: priceFilter }
                }
            },
            { $unwind: '$prices' },
            {
                $group: priceGrouper
            },
            {
                $project: {
                    _id: 0,
                    currency: '$_id.currency',
                    price: 1,
                    priceType: 1,
                    priceTypeCode: '$_id.priceTypeCode',
                    productsCount: 1
                }
            }
        ];
    };
    ProductV4DAO.prototype.getProductModel = function (productType) {
        var productTypeLowerCase = productType.toLowerCase();
        if (!validProductTypes.includes(productTypeLowerCase)) {
            throw new Error('Invalid Product type.');
        }
        if (this.productModelsHolder[productTypeLowerCase]) {
            return this.productModelsHolder[productTypeLowerCase];
        }
        else {
            var newProductModel = mongoose.model(productType, GenricSchema_1.GenricSchema, docTypeToCollectionMapperV4[productTypeLowerCase]);
            this.productModelsHolder[productTypeLowerCase] = newProductModel;
            return newProductModel;
        }
    };
    ProductV4DAO.prototype.prepareMongoProjections = function (projectionFields) {
        if (Array.isArray(projectionFields)) {
            var projections_1 = {};
            projectionFields.forEach(function (property) {
                projections_1[property] = 1;
            });
            return projections_1;
        }
        else {
            throw new AppError_1.AppError('Invalid projections.', 400);
        }
    };
    ProductV4DAO.prototype.getProjectionFilterForAvailability = function (channelNames) {
        if (!channelNames || channelNames.length === 0) {
            return 1;
        }
        return {
            $filter: {
                as: 'av',
                cond: { $in: ['$$av.name', channelNames] },
                input: '$availability'
            }
        };
    };
    return ProductV4DAO;
}());
exports.productV4DAO = new ProductV4DAO();
