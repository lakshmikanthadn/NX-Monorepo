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
exports.collectionV4Service = void 0;
var AppError_1 = require("../../model/AppError");
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var SearchQueryUtil_1 = require("../../utils/SearchQueryUtil");
var config_1 = require("../config");
var ProductV4_DAO_1 = require("../products/ProductV4.DAO");
var S3UtilsV4_1 = require("../utils/S3UtilsV4");
var SQSUtilsV4_1 = require("../utils/SQSUtilsV4");
var log = LoggerUtil_1.default.getLogger('collectionV4Service');
var CollectionV4Service = /** @class */ (function () {
    function CollectionV4Service() {
    }
    CollectionV4Service.prototype.uploadProduct = function (product, action) {
        return __awaiter(this, void 0, void 0, function () {
            var isDynamicCollection, rulesList, queries, collectionType, location, messageId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.debug('uploadProduct::,', { _id: product._id, action: action });
                        isDynamicCollection = product.categories.some(function (item) {
                            return item.name === 'collection-update-type' && item.type === 'dynamic';
                        });
                        product.prices.forEach(function (item) {
                            if (!item.price) {
                                log.error('uploadProduct:: collection product is missing the prices', {
                                    _id: product._id,
                                    action: action
                                });
                            }
                        });
                        rulesList = product.rulesList;
                        if (rulesList) {
                            queries = SearchQueryUtil_1.searchQueryUtil.getRulesStringFromSearchQuery(rulesList);
                            product.rulesList = queries;
                        }
                        collectionType = isDynamicCollection
                            ? 'dynamicCollection'
                            : 'staticCollection';
                        return [4 /*yield*/, S3UtilsV4_1.S3UtilsV4.uploadToS3(product, product._id)];
                    case 1:
                        location = _a.sent();
                        if (!(location && location !== '')) {
                            throw new AppError_1.AppError('Error while uploading file', 400);
                        }
                        return [4 /*yield*/, SQSUtilsV4_1.SQSUtilsV4.sendMessage(product._id, location, action, collectionType)];
                    case 2:
                        messageId = _a.sent();
                        if (!(messageId && messageId !== '')) {
                            throw new AppError_1.AppError('Error while sending message', 400);
                        }
                        return [2 /*return*/, { _id: product._id }];
                }
            });
        });
    };
    CollectionV4Service.prototype.uploadPatchProduct = function (product) {
        return __awaiter(this, void 0, void 0, function () {
            var location, collectionType, action;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.debug('uploadPatchProduct::,', { _id: product._id });
                        return [4 /*yield*/, S3UtilsV4_1.S3UtilsV4.uploadToS3(product, product._id)];
                    case 1:
                        location = _a.sent();
                        if (!(location && location !== '')) {
                            throw new AppError_1.AppError('Error while uploading file', 400);
                        }
                        collectionType = 'dynamicCollection';
                        action = 'patchCollection';
                        // send sqs message
                        return [4 /*yield*/, SQSUtilsV4_1.SQSUtilsV4.sendMessage(product._id, location, action, collectionType)];
                    case 2:
                        // send sqs message
                        _a.sent();
                        return [2 /*return*/, { _id: product._id }];
                }
            });
        });
    };
    CollectionV4Service.prototype.getProductByTitle = function (title, productType, responseGroup) {
        if (responseGroup === void 0) { responseGroup = 'small'; }
        return __awaiter(this, void 0, void 0, function () {
            var projectionFields;
            return __generator(this, function (_a) {
                log.debug('getProductByTitle:: ', {
                    productType: productType,
                    responseGroup: responseGroup,
                    title: title
                });
                projectionFields = config_1.apiResponseGroupConfig.getProjectionFields(productType, responseGroup);
                return [2 /*return*/, ProductV4_DAO_1.productV4DAO.getProductByTitle(title, productType, projectionFields)];
            });
        });
    };
    CollectionV4Service.prototype.isBespokeCollection = function (collectionId, categories) {
        var isCollectionTypeBespoke = categories.some(function (item) {
            return item.name === 'collection-type' && item.type === 'bespoke';
        });
        return isCollectionTypeBespoke && collectionId === 'BD.EBOOK';
    };
    return CollectionV4Service;
}());
exports.collectionV4Service = new CollectionV4Service();
