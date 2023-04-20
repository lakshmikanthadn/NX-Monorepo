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
exports.productV4Service = void 0;
var _ = require("lodash");
var v4_1 = require("uuid/v4");
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var framework_utility_ubx_website_1 = require("@tandfgroup/framework-utility-ubx-website");
var rTracer = require("cls-rtracer");
var Event_Service_1 = require("../event/Event.Service");
var config_1 = require("../../config/config");
var SearchV4Service_1 = require("../search/SearchV4Service");
var constant_1 = require("../../config/constant");
var AppError_1 = require("../../model/AppError");
var SearchQueryUtil_1 = require("../../utils/SearchQueryUtil");
var AssetV4_Service_1 = require("../assets/AssetV4.Service");
var AssociatedMediaV4_Service_1 = require("../associatedMedia/AssociatedMediaV4.Service");
var config_2 = require("../config");
var CreativeWorkV4_Service_1 = require("../creativeWork/CreativeWorkV4.Service");
var TaxonomyV4_Service_1 = require("../taxonomy/TaxonomyV4.Service");
var SQSUtilsV4_1 = require("../utils/SQSUtilsV4");
var ProductV4_DAO_1 = require("./ProductV4.DAO");
var ManuscriptV4_DAO_1 = require("./ManuscriptV4.DAO");
var S3UtilsV4_1 = require("../utils/S3UtilsV4");
var log = LoggerUtil_1.default.getLogger('ProductV4Service');
var ubxWebsUrl = config_1.Config.getPropertyValue('ubxWebsUrl');
var ProductV4Service = /** @class */ (function () {
    function ProductV4Service() {
        this.productSource = 'SEARCHDOWNLOAD';
        this.searchResultDownloadQueue = config_1.Config.getPropertyValue('searchResultDownloadQueue');
    }
    ProductV4Service.prototype.getReport = function (type) {
        return __awaiter(this, void 0, void 0, function () {
            var bucketName, absolutePath, unsignedUrl;
            return __generator(this, function (_a) {
                bucketName = config_1.Config.getPropertyValue('contentS3Bucket');
                absolutePath = "".concat(type, "/reports/daily/").concat(type, ".zip");
                unsignedUrl = "https://".concat(bucketName, ".s3.eu-west-1.amazonaws.com/").concat(absolutePath);
                return [2 /*return*/, S3UtilsV4_1.S3UtilsV4.getPresignedUrlToRead(unsignedUrl, false, false)];
            });
        });
    };
    ProductV4Service.prototype.uploadSearchRequest = function (searchRequestData) {
        return __awaiter(this, void 0, void 0, function () {
            var rulesList, finalRule;
            return __generator(this, function (_a) {
                log.debug('uploadSearchRequest::,', { action: searchRequestData.action });
                rulesList = searchRequestData.rulesList;
                rulesList.forEach(function (sq) {
                    var queries = SearchQueryUtil_1.searchQueryUtil.getQueryForRulesProductsQuery(sq.type, sq.rules);
                    var availability = searchRequestData.availability;
                    if (availability) {
                        var searchQueryParserResult = _.cloneDeep(rulesList);
                        searchQueryParserResult[0].rules = queries;
                        var availabilityName = availability.name;
                        var availabilityStatus = availability.status;
                        var queryWithAvailability = SearchV4Service_1.searchV4Service._getQueryWithAvailability(searchQueryParserResult, availabilityName, availabilityStatus, availability);
                        finalRule = queryWithAvailability[0].rules;
                    }
                    else {
                        finalRule = queries;
                    }
                    // preparing final rulesString to be processed
                    sq.rulesString = JSON.stringify(finalRule, SearchQueryUtil_1.searchQueryUtil.replacer);
                    // update rulesString for date
                    sq.rulesString = sq.rulesString.replace(/"ISODate\(/g, 'ISODate("');
                    sq.rulesString = sq.rulesString.replace(/Z\)"/g, 'Z")');
                    // send sqs message
                });
                Event_Service_1.eventService.sendProductEvent(searchRequestData, this.searchResultDownloadQueue, this.productSource, {});
                return [2 /*return*/, { _id: searchRequestData._id }];
            });
        });
    };
    ProductV4Service.prototype.getNewId = function () {
        log.debug('getNewId');
        var uuid = (0, v4_1.default)();
        if (uuid) {
            return uuid;
        }
        else {
            throw new AppError_1.AppError('Could not generate UUID at this moment', 404);
        }
    };
    ProductV4Service.prototype.getTransactionId = function () {
        return rTracer.id();
    };
    ProductV4Service.prototype.createProduct = function (product) {
        return __awaiter(this, void 0, void 0, function () {
            var productType, creativeWork, format;
            return __generator(this, function (_a) {
                productType = product.type;
                creativeWork = product.creativeWork;
                // _createdDate and _modifiedDate are handled by mongoose.
                delete product._createdDate;
                delete product._modifiedDate;
                if (!productType) {
                    throw new AppError_1.AppError('Product Type not defined', 400);
                }
                if (productType !== 'creativeWork') {
                    throw new AppError_1.AppError("Invalid Product type: ".concat(productType, "."), 405);
                }
                if (!creativeWork) {
                    throw new AppError_1.AppError("Invalid creativeWork: ".concat(product.creativeWork, "."), 400);
                }
                // no need to store mediaType
                delete product.creativeWork['mediaType'];
                product._sources = [{ source: 'WEBCMS', type: 'product' }];
                format = product.creativeWork.format;
                if (!(format && constant_1.AppConstants.FormatTypeList.includes(format))) {
                    throw new AppError_1.AppError("Invalid format: ".concat(format, "."), 400);
                }
                if (!product.subType) {
                    product.subType = format;
                }
                return [2 /*return*/, CreativeWorkV4_Service_1.creativeWorkV4Service.createCreativeWork(product)];
            });
        });
    };
    ProductV4Service.prototype.uploadOAUpdate = function (oaUpdate, id) {
        return __awaiter(this, void 0, void 0, function () {
            var asset, uploadOAUpdate, messageId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.debug('uploadOAUpdate::,', oaUpdate);
                        return [4 /*yield*/, AssetV4_Service_1.assetV4Service.getAssetById(id, [
                                'type'
                            ])];
                    case 1:
                        asset = _a.sent();
                        if (!asset) {
                            throw new AppError_1.AppError('Product (asset) not found.', 404);
                        }
                        uploadOAUpdate = {
                            callBackurl: oaUpdate.callBackurl,
                            data: oaUpdate.requestPayload,
                            orderNumber: oaUpdate.orderNumber,
                            transactionId: oaUpdate.requestId
                        };
                        uploadOAUpdate.data.id = id;
                        return [4 /*yield*/, SQSUtilsV4_1.SQSUtilsV4.sendOAUpdateMessage(uploadOAUpdate)];
                    case 2:
                        messageId = _a.sent();
                        if (!(messageId && messageId !== '')) {
                            throw new AppError_1.AppError('Error while uploading oaUpdate message', 500);
                        }
                        return [2 /*return*/, messageId];
                }
            });
        });
    };
    ProductV4Service.prototype.getTaxonomy = function (assetType, taxonomyType, taxonomyFilter) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                log.debug('getTaxonomy:: ', { assetType: assetType, taxonomyFilter: taxonomyFilter, taxonomyType: taxonomyType });
                return [2 /*return*/, TaxonomyV4_Service_1.taxonomyV4Service.getTaxonomy(assetType, taxonomyType, taxonomyFilter)];
            });
        });
    };
    ProductV4Service.prototype.getTaxonomyClassifications = function (taxonomyFilter) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                log.debug('getTaxonomyClassifications:: ', { taxonomyFilter: taxonomyFilter });
                return [2 /*return*/, TaxonomyV4_Service_1.taxonomyV4Service.getTaxonomyClassifications(taxonomyFilter)];
            });
        });
    };
    ProductV4Service.prototype.getRulesStringFromSearchQuery = function (ruleString) {
        return SearchQueryUtil_1.searchQueryUtil
            .getRulesStringFromSearchQuery(ruleString)
            .map(function (_a) {
            var type = _a.type, rulesString = _a.rulesString;
            return { rulesString: rulesString, type: type };
        });
    };
    ProductV4Service.prototype.getProductById = function (id, responseGroup, productVersion, availabilityName, region) {
        if (responseGroup === void 0) { responseGroup = 'small'; }
        return __awaiter(this, void 0, void 0, function () {
            var asset;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.debug('getProductById:: ', {
                            id: id,
                            productVersion: productVersion,
                            region: region,
                            responseGroup: responseGroup
                        });
                        return [4 /*yield*/, AssetV4_Service_1.assetV4Service.getAssetById(id, [
                                'type'
                            ])];
                    case 1:
                        asset = _a.sent();
                        if (!asset) {
                            throw new AppError_1.AppError('Product (asset) not found.', 404);
                        }
                        return [2 /*return*/, this.getProductByIdAndType({
                                availabilityName: availabilityName,
                                availabilityStatus: undefined,
                                hasPartPosition: undefined,
                                id: id,
                                productType: asset.type,
                                productVersion: productVersion,
                                region: region,
                                responseGroup: responseGroup
                            })];
                }
            });
        });
    };
    ProductV4Service.prototype.getProductsByDynamicIds = function (idName, idValues, productType, responseGroup, availabilityName, availabilityStatus, productVersion) {
        if (responseGroup === void 0) { responseGroup = 'small'; }
        return __awaiter(this, void 0, void 0, function () {
            var assets, productsIdsByType, activeJournals, productsDataPromiserForEachType, productsDataForEachType, allProductsData;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.debug('getProductsByDynamicIds:: ', {
                            availabilityName: availabilityName,
                            availabilityStatus: availabilityStatus,
                            idName: idName,
                            idValues: idValues,
                            productType: productType,
                            productVersion: productVersion,
                            responseGroup: responseGroup
                        });
                        return [4 /*yield*/, AssetV4_Service_1.assetV4Service.getAssetsByIdentifierNameValues(idName, idValues, productType)];
                    case 1:
                        assets = _a.sent();
                        if (!assets || assets.length <= 0) {
                            throw new AppError_1.AppError('Products (assets) not found.', 404);
                        }
                        productsIdsByType = this.groupProductIdsByType(assets);
                        if (!Object.prototype.hasOwnProperty.call(productsIdsByType, 'journal')) return [3 /*break*/, 3];
                        return [4 /*yield*/, ProductV4_DAO_1.productV4DAO.getActiveProductByIds('journal', productsIdsByType.journal)];
                    case 2:
                        activeJournals = _a.sent();
                        productsIdsByType.journal = activeJournals.map(function (aJournal) { return aJournal._id; });
                        _a.label = 3;
                    case 3:
                        productsDataPromiserForEachType = Object.keys(productsIdsByType).map(function (pType) {
                            return _this.getProductsByIdsAndType(pType, productsIdsByType[pType], {
                                availabilityName: availabilityName,
                                availabilityStatus: availabilityStatus,
                                productVersion: productVersion,
                                responseGroup: responseGroup
                            });
                        });
                        return [4 /*yield*/, Promise.all(productsDataPromiserForEachType)];
                    case 4:
                        productsDataForEachType = _a.sent();
                        allProductsData = productsDataForEachType.reduce(function (allProducts, products) {
                            return allProducts.concat(products);
                        }, []);
                        if (!allProductsData || allProductsData.length === 0) {
                            throw new AppError_1.AppError('Products not found.', 404, {
                                additionalMessage: 'Incase of journal, there are no ACTIVE journal products.'
                            });
                        }
                        return [2 /*return*/, allProductsData];
                }
            });
        });
    };
    ProductV4Service.prototype.getProductsWithType = function (productType, offset, limit, responseGroup, availabilityName, availabilityStatus, productVersion) {
        if (responseGroup === void 0) { responseGroup = 'small'; }
        return __awaiter(this, void 0, void 0, function () {
            var projectionFields, products, wrappedProducts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.debug('getProductsWithType:: ', {
                            availabilityName: availabilityName,
                            limit: limit,
                            offset: offset,
                            productType: productType,
                            productVersion: productVersion,
                            responseGroup: responseGroup
                        });
                        if (!productType) return [3 /*break*/, 3];
                        projectionFields = config_2.apiResponseGroupConfig.getProjectionFields(productType, responseGroup);
                        return [4 /*yield*/, ProductV4_DAO_1.productV4DAO.getProductsWithType(productType, offset, limit, projectionFields, availabilityName, availabilityStatus, productVersion)];
                    case 1:
                        products = _a.sent();
                        return [4 /*yield*/, this.stitchProductsWithAvailabilityAndAsstMedia(products, projectionFields, availabilityName)];
                    case 2:
                        wrappedProducts = _a.sent();
                        return [2 /*return*/, wrappedProducts];
                    case 3: throw new AppError_1.AppError('Products not found.', 404);
                }
            });
        });
    };
    ProductV4Service.prototype.getProductByTitle = function (title, productType, responseGroup) {
        if (responseGroup === void 0) { responseGroup = 'small'; }
        return __awaiter(this, void 0, void 0, function () {
            var projectionFields;
            return __generator(this, function (_a) {
                log.debug('getProductByTitle:: ', {
                    productType: productType,
                    responseGroup: responseGroup,
                    title: title
                });
                projectionFields = config_2.apiResponseGroupConfig.getProjectionFields(productType, responseGroup);
                return [2 /*return*/, ProductV4_DAO_1.productV4DAO.getProductByTitle(title, productType, projectionFields)];
            });
        });
    };
    ProductV4Service.prototype.getProductByIdentifier = function (identifierName, identifierValue, productType, responseGroup, availabilityName) {
        if (responseGroup === void 0) { responseGroup = 'small'; }
        return __awaiter(this, void 0, void 0, function () {
            var projectionFields, products, wrappedProducts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.debug('getProductByIdentifier:: ', {
                            availabilityName: availabilityName,
                            identifierName: identifierName,
                            identifierValue: identifierValue,
                            productType: productType,
                            responseGroup: responseGroup
                        });
                        projectionFields = config_2.apiResponseGroupConfig.getProjectionFields(productType, responseGroup);
                        return [4 /*yield*/, ProductV4_DAO_1.productV4DAO.getProductByIdentifier(identifierName, identifierValue, productType, projectionFields)];
                    case 1:
                        products = _a.sent();
                        return [4 /*yield*/, this.stitchProductsWithAvailabilityAndAsstMedia(products, projectionFields, availabilityName)];
                    case 2:
                        wrappedProducts = _a.sent();
                        return [2 /*return*/, wrappedProducts];
                }
            });
        });
    };
    ProductV4Service.prototype.getPreArticlesByIdentifier = function (identifierName, identifierValues, productType, responseGroup) {
        if (responseGroup === void 0) { responseGroup = 'small'; }
        return __awaiter(this, void 0, void 0, function () {
            var projectionFields, products, wrappedProducts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.debug('getPreArticlesByIdentifier:: ', {
                            identifierName: identifierName,
                            identifierValues: identifierValues,
                            productType: productType,
                            responseGroup: responseGroup
                        });
                        projectionFields = config_2.apiResponseGroupConfig.getProjectionFields(productType, responseGroup);
                        return [4 /*yield*/, ProductV4_DAO_1.productV4DAO.getPreArticlesByIdentifier(identifierName, identifierValues, productType, projectionFields)];
                    case 1:
                        products = _a.sent();
                        return [4 /*yield*/, this.stitchProductsWithAvailabilityAndAsstMedia(products, projectionFields)];
                    case 2:
                        wrappedProducts = _a.sent();
                        return [2 /*return*/, wrappedProducts];
                }
            });
        });
    };
    ProductV4Service.prototype.isOpenAccess = function (productType, id) {
        log.debug("isOpenAccess:: ", { id: id, productType: productType });
        return ProductV4_DAO_1.productV4DAO
            .getProduct(productType, id, ['permissions.name'])
            .then(function (product) {
            if (!(product && product.permissions && product.permissions.length > 0)) {
                return false;
            }
            return product.permissions.some(function (permit) { return permit.name === 'open-access'; });
        });
    };
    ProductV4Service.prototype.getValidEbookId = function (ids, type) {
        return __awaiter(this, void 0, void 0, function () {
            var formatCodeProperty, statusProperty, projectionFields, products, eBookProduct, statusAvail, statusOop, statusWithdrawn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (ids.length === 1) {
                            return [2 /*return*/, ids[0]];
                        }
                        formatCodeProperty = type + '.formatCode';
                        statusProperty = type + '.status';
                        projectionFields = [formatCodeProperty, '_id', statusProperty];
                        return [4 /*yield*/, ProductV4_DAO_1.productV4DAO.getProductsByIds(type, ids, {
                                projectionFields: projectionFields
                            })];
                    case 1:
                        products = _a.sent();
                        eBookProduct = products.filter(function (eBooks) { return eBooks.book && eBooks.book.formatCode === 'EBK'; });
                        if (eBookProduct.length === 0) {
                            return [2 /*return*/, null];
                        }
                        else if (eBookProduct.length === 1) {
                            return [2 /*return*/, eBookProduct[0]._id];
                        }
                        statusAvail = eBookProduct.find(function (status) { return status.book.status === 'Available'; });
                        if (statusAvail) {
                            return [2 /*return*/, statusAvail._id];
                        }
                        statusOop = eBookProduct.find(function (status) { return status.book.status === 'Out of Print'; });
                        if (statusOop) {
                            return [2 /*return*/, statusOop._id];
                        }
                        statusWithdrawn = eBookProduct.find(function (status) { return status.book.status === 'Withdrawn'; });
                        if (statusWithdrawn) {
                            return [2 /*return*/, statusWithdrawn._id];
                        }
                        return [2 /*return*/, null];
                }
            });
        });
    };
    ProductV4Service.prototype.getAvailabilityForChannel = function (product, availabilityName) {
        log.debug("getAvailabilityFromProduct:: ", { availabilityName: availabilityName, product: product });
        if (!product || !product.availability) {
            return [];
        }
        if (!availabilityName) {
            return product.availability;
        }
        return product.availability.filter(function (item) { return item.name === availabilityName; });
    };
    ProductV4Service.prototype.getRelUrlFromProduct = function (id, type) {
        return __awaiter(this, void 0, void 0, function () {
            var projectionFields, product;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.debug("getRelUrlFromProduct:: ", {
                            id: id,
                            type: type
                        });
                        projectionFields = config_2.apiResponseGroupConfig.getProjectionFields(type, 'medium');
                        return [4 /*yield*/, ProductV4_DAO_1.productV4DAO.getProduct(type, id, projectionFields)];
                    case 1:
                        product = _a.sent();
                        return [2 /*return*/, "".concat(ubxWebsUrl, "/").concat((0, framework_utility_ubx_website_1.getMeaningFullUrl)(product))];
                }
            });
        });
    };
    ProductV4Service.prototype.getPreArticleById = function (id, responseGroup) {
        if (responseGroup === void 0) { responseGroup = 'small'; }
        return __awaiter(this, void 0, void 0, function () {
            var productType;
            return __generator(this, function (_a) {
                log.debug('getPreArticleById:: ', {
                    id: id,
                    responseGroup: responseGroup
                });
                productType = 'preArticle';
                return [2 /*return*/, this.getProductByIdAndType({
                        id: id,
                        productType: productType,
                        responseGroup: responseGroup
                    })];
            });
        });
    };
    ProductV4Service.prototype.getManuscriptWorkflowById = function (id, responseGroup) {
        if (responseGroup === void 0) { responseGroup = 'small'; }
        return __awaiter(this, void 0, void 0, function () {
            var productType;
            return __generator(this, function (_a) {
                log.debug('getManuscriptWorkflowById:: ', {
                    id: id,
                    responseGroup: responseGroup
                });
                productType = 'manuscriptWorkflow';
                return [2 /*return*/, this.getProductByIdAndType({
                        id: id,
                        productType: productType,
                        responseGroup: responseGroup
                    })];
            });
        });
    };
    ProductV4Service.prototype.getProductByIdAndType = function (productByIdTypeQuery) {
        return __awaiter(this, void 0, void 0, function () {
            var availabilityName, availabilityStatus, hasPartPosition, id, productType, productVersion, region, responseGroup, projectionFields, productDataPromiser, includeLocationForAll;
            var _this = this;
            return __generator(this, function (_a) {
                availabilityName = productByIdTypeQuery.availabilityName, availabilityStatus = productByIdTypeQuery.availabilityStatus, hasPartPosition = productByIdTypeQuery.hasPartPosition, id = productByIdTypeQuery.id, productType = productByIdTypeQuery.productType, productVersion = productByIdTypeQuery.productVersion, region = productByIdTypeQuery.region, responseGroup = productByIdTypeQuery.responseGroup;
                log.debug('getProductByIdAndType:: ', {
                    availabilityName: availabilityName,
                    availabilityStatus: availabilityStatus,
                    hasPartPosition: hasPartPosition,
                    id: id,
                    productType: productType,
                    productVersion: productVersion,
                    region: region,
                    responseGroup: responseGroup
                });
                projectionFields = config_2.apiResponseGroupConfig.getProjectionFields(productType, responseGroup);
                if (productType == 'manuscriptWorkflow') {
                    productDataPromiser = [
                        ManuscriptV4_DAO_1.manuscriptV4DAO.getManuscript(productType, id, projectionFields, availabilityName, availabilityStatus, productVersion, region)
                    ];
                }
                else {
                    productDataPromiser = [
                        ProductV4_DAO_1.productV4DAO.getProduct(productType, id, projectionFields, availabilityName, availabilityStatus, productVersion, region)
                    ];
                }
                // Modify here for each foreign-key(field) of a Product.
                if (projectionFields.length === 0 ||
                    projectionFields.includes('associatedMedia')) {
                    includeLocationForAll = false;
                    productDataPromiser.push(AssociatedMediaV4_Service_1.associatedMediaV4Service.getContentMetaDataByParentid(id, includeLocationForAll));
                }
                return [2 /*return*/, Promise.all(productDataPromiser).then(function (resolvedData) {
                        var product = resolvedData[0];
                        if (product) {
                            // Modify here for availability field on case of large Product.
                            if (projectionFields.includes('availability')) {
                                var availability = _this.getAvailabilityForChannel(product, availabilityName);
                                delete product['availability'];
                                if (product.type === 'scholarlyArticle' &&
                                    Array.isArray(resolvedData[1])) {
                                    product['associatedMedia'] = resolvedData[1].filter(function (asstMedia) {
                                        return (asstMedia.versionType ===
                                            product['scholarlyArticle']['currentVersion']);
                                    });
                                }
                                else {
                                    product['associatedMedia'] = resolvedData[1];
                                }
                                return Promise.resolve({ availability: availability, product: product });
                            }
                            else {
                                return Promise.resolve({ product: product });
                            }
                        }
                        else {
                            throw new AppError_1.AppError('Product not found.', 404);
                        }
                    })];
            });
        });
    };
    ProductV4Service.prototype.getProductsByIdsAndType = function (productType, ids, opts) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, responseGroup, productVersion, availabilityName, availabilityStatus, projectionFields, productDataPromiser, includeLocationForAll;
            var _this = this;
            return __generator(this, function (_b) {
                _a = opts.responseGroup, responseGroup = _a === void 0 ? 'small' : _a, productVersion = opts.productVersion, availabilityName = opts.availabilityName, availabilityStatus = opts.availabilityStatus;
                log.debug('getProductsByIdsAndType:: ', {
                    availabilityName: availabilityName,
                    availabilityStatus: availabilityStatus,
                    ids: ids,
                    productType: productType,
                    productVersion: productVersion,
                    responseGroup: responseGroup
                });
                projectionFields = config_2.apiResponseGroupConfig.getProjectionFields(productType, responseGroup);
                productDataPromiser = [
                    ProductV4_DAO_1.productV4DAO.getProductsByIds(productType, ids, {
                        availabilityName: availabilityName,
                        availabilityStatus: availabilityStatus,
                        productVersion: productVersion,
                        projectionFields: projectionFields
                    })
                ];
                // Modify here for each foreign-key(field) of a Product.
                if (projectionFields.length === 0 ||
                    projectionFields.includes('associatedMedia')) {
                    includeLocationForAll = false;
                    productDataPromiser.push(AssociatedMediaV4_Service_1.associatedMediaV4Service.getAsstMediasByParentIds(ids, includeLocationForAll));
                }
                return [2 /*return*/, Promise.all(productDataPromiser).then(function (resolvedData) {
                        var products = _this.stichProductsWithAsstMedia(resolvedData[0], resolvedData[1]);
                        if (projectionFields.includes('availability')) {
                            return products.map(function (product) {
                                var availability = [];
                                if (product['availability']) {
                                    availability = _this.getAvailabilityForChannel(product, availabilityName);
                                    delete product['availability'];
                                }
                                return { availability: availability, product: product };
                            });
                        }
                        else {
                            return products.map(function (product) {
                                return { product: product };
                            });
                        }
                    })];
            });
        });
    };
    /**
     * This method groups each product with its product type
     * @param asset Accepts a asset with type and _id
     *
     */
    ProductV4Service.prototype.groupProductIdsByType = function (asset) {
        var productsByType = {};
        asset.forEach(function (product) {
            /* istanbul ignore else */
            if (constant_1.AppConstants.ProductTypesV4.includes(product.type)) {
                productsByType[product.type] = Object.prototype.hasOwnProperty.call(productsByType, product.type)
                    ? productsByType[product.type]
                    : [];
                productsByType[product.type].push(product._id);
            }
        });
        return productsByType;
    };
    ProductV4Service.prototype.stichProductsWithAsstMedia = function (products, asstMedias) {
        if (!products || products.length === 0) {
            return [];
        }
        if (!asstMedias || asstMedias.length === 0) {
            return products;
        }
        return products.map(function (product) {
            product['associatedMedia'] = asstMedias
                .filter(function (asstMedia) {
                return product.type === 'scholarlyArticle'
                    ? asstMedia.parentId === product._id &&
                        asstMedia.versionType ===
                            product['scholarlyArticle']['currentVersion']
                    : asstMedia.parentId === product._id;
            })
                .map(function (asstMedia) {
                delete asstMedia.parentId;
                return asstMedia;
            });
            return product;
        });
    };
    ProductV4Service.prototype.stitchProductsWithAvailabilityAndAsstMedia = function (products, projectionFields, availabilityName) {
        return __awaiter(this, void 0, void 0, function () {
            var wrappedProducts, productsIdData, asstMedias_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        wrappedProducts = [];
                        if (projectionFields.includes('availability')) {
                            wrappedProducts = products.map(function (product) {
                                var availability = _this.getAvailabilityForChannel(product, availabilityName);
                                delete product['availability'];
                                return { availability: availability, product: product };
                            });
                        }
                        else {
                            wrappedProducts = products.map(function (product) {
                                delete product['availability'];
                                return { product: product };
                            });
                        }
                        if (!(projectionFields.length === 0 ||
                            projectionFields.includes('associatedMedia'))) return [3 /*break*/, 2];
                        productsIdData = products.map(function (product) { return product._id; });
                        return [4 /*yield*/, AssociatedMediaV4_Service_1.associatedMediaV4Service.getAsstMediasByParentIds(productsIdData)];
                    case 1:
                        asstMedias_1 = _a.sent();
                        wrappedProducts.forEach(function (wrappedProduct) {
                            wrappedProduct['product']['associatedMedia'] = asstMedias_1
                                .filter(function (asstMedia) { return asstMedia.parentId === wrappedProduct.product._id; })
                                .map(function (asstMedia) {
                                delete asstMedia.parentId;
                                return asstMedia;
                            });
                        });
                        _a.label = 2;
                    case 2: return [2 /*return*/, wrappedProducts];
                }
            });
        });
    };
    return ProductV4Service;
}());
exports.productV4Service = new ProductV4Service();
