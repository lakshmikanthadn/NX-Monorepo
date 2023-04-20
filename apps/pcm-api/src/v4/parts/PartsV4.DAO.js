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
exports.partsV4DAO = void 0;
var pcm_entity_model_v4_1 = require("@tandfgroup/pcm-entity-model-v4");
var mongoose = require("mongoose");
var config_1 = require("../../config/config");
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var log = LoggerUtil_1.default.getLogger('PartsV4DAO');
var docTypeToCollectionMapperV4 = config_1.Config.getPropertyValue('docTypeToCollectionMapperV4');
var PartsV4DAO = /** @class */ (function () {
    function PartsV4DAO() {
        var collectionName = docTypeToCollectionMapperV4.part;
        this.model = mongoose.model('PartsV4', pcm_entity_model_v4_1.MongooseSchema.Part, collectionName);
    }
    PartsV4DAO.prototype.getHasPart = function (parentId, hasPartId, isFree) {
        return __awaiter(this, void 0, void 0, function () {
            var elemMatchObj, query, projections;
            return __generator(this, function (_a) {
                log.debug("getHasPart:: ", { hasPartId: hasPartId, parentId: parentId });
                elemMatchObj = { _id: hasPartId };
                if (isFree) {
                    elemMatchObj['isFree'] = true;
                }
                query = { _id: parentId, parts: { $elemMatch: elemMatchObj } };
                projections = {
                    parts: { $elemMatch: { _id: hasPartId } }
                };
                log.debug("getHasPart:: query: ".concat(JSON.stringify(query), ",\n         projections: ").concat(JSON.stringify(projections)));
                return [2 /*return*/, this.model
                        .findOne(query, projections)
                        .lean()
                        .exec()
                        .then(function (part) {
                        log.debug("getHasPart:: part: ".concat(JSON.stringify(part)));
                        var hasPart;
                        /* istanbul ignore else */
                        if (part && part.parts && part.parts.length === 1) {
                            hasPart = part.parts[0];
                        }
                        return Promise.resolve(hasPart);
                    })
                        .catch(function (error) {
                        return Promise.reject('We are unable to find the part.');
                    })];
            });
        });
    };
    /**
     * This method finds part and then slices only few has-parts(offset-limit) returns them.
     * @param  {string} productId uuid of the part (product uuid).
     * @param  {number} offset Index of the parts array  to slice from: part.parts[offset].
     * @param  {number} limit Index of parts array to slice upto: part.parts[limit]
     * @param  {ProductType} partType? Type of the part(product) this can be any of the ProductType
     * @param  {string} format? This is Creative work format type.
     * @returns {StorageModel.HasPart[]} HasPart
     */
    PartsV4DAO.prototype.getHasParts = function (productId, offset, limit, projectionFields, partType, format) {
        return __awaiter(this, void 0, void 0, function () {
            var aggregationQuery, projections, modelQuery;
            return __generator(this, function (_a) {
                log.debug("getHasParts:: ", {
                    format: format,
                    limit: limit,
                    offset: offset,
                    partType: partType,
                    productId: productId,
                    projectionFields: projectionFields
                });
                aggregationQuery = this.getAggregationQueryForParts(productId, offset, limit, partType, format);
                projections = this.prepareMongoProjections(projectionFields);
                // adds projections
                aggregationQuery.push({ $project: projections });
                modelQuery = this.model.aggregate(aggregationQuery);
                return [2 /*return*/, this.executeQuery(modelQuery, false)];
            });
        });
    };
    PartsV4DAO.prototype.getHasPartsCount = function (productId, partType, format) {
        return __awaiter(this, void 0, void 0, function () {
            var isWithFilters, modelQuery, aggregationQuery;
            return __generator(this, function (_a) {
                log.debug("getHasPartsCount:: ", { format: format, partType: partType, productId: productId });
                isWithFilters = partType || format;
                log.debug("getHasPartsCount:: ", { isWithFilters: isWithFilters });
                if (isWithFilters) {
                    aggregationQuery = this.getAggregationQueryForParts(productId, null, null, partType, format);
                    modelQuery = this.model.aggregate(aggregationQuery);
                }
                else {
                    modelQuery = this.model.find({ _id: productId }).lean();
                }
                return [2 /*return*/, this.executeQuery(modelQuery, true)];
            });
        });
    };
    /**
     * This method prepares an aggregate query to
     * - find product part by id
     * - then unwind all the parts before slicing
     * this is becuase there could be multiple parts for same product, if the part count is > 10000
     * - then add query to filter docs by product type (if required)
     * - then add query to filter docs by media type (valid for CreativeWork) (if required)
     * - then limit and skip to slice only few has-parts(offset-limit)
     * - then combine them to form a single part/entity with all the parts..
     * @param  {string} productId uuid of the part (product uuid).
     * @param  {number} offset Index of the parts array  to slice from: part.parts[offset].
     * @param  {number} limit Index of parts array to slice upto: part.parts[limit]
     * @param  {ProductType} partType? Type of the part(product) this can be any of the ProductType
     * @param  {string} format? This is Creative work media type.
     */
    PartsV4DAO.prototype.getAggregationQueryForParts = function (productId, offset, limit, partType, format) {
        var aggregationQuery = [];
        var idQuery = { _id: productId };
        aggregationQuery.push({ $match: idQuery });
        aggregationQuery.push({ $unwind: '$parts' });
        // Push the part type filter here to aggregate query.
        if (partType && partType === 'creativeWork') {
            var lookupFilter = {
                as: 'productFormat',
                foreignField: '_id',
                from: docTypeToCollectionMapperV4[partType.toLowerCase()],
                localField: 'parts._id'
            };
            // join parts and productMeta as format is inside productMeta
            aggregationQuery.push({ $lookup: lookupFilter });
            aggregationQuery.push({ $unwind: '$productFormat' });
            // add format inside parts
            var partsformat = {
                'parts.format': "$productFormat.".concat(partType, ".format")
            };
            aggregationQuery.push({ $addFields: partsformat });
        }
        else if (partType) {
            var caseInsensitiveRegexQuery = this.getCaseInsensitiveRegexQuery(partType);
            var matchFilter = { 'parts.type': caseInsensitiveRegexQuery };
            aggregationQuery.push({ $match: matchFilter });
        }
        // Push the part format-type filter here to aggregate query.
        if (format) {
            // additional filter based on input format
            var matchFilter = {
                'parts.format': format
            };
            aggregationQuery.push({ $match: matchFilter });
        }
        // Push limit and skip values to aggreagte query.
        if (offset) {
            aggregationQuery.push({ $skip: offset });
        }
        if (limit) {
            aggregationQuery.push({ $limit: limit });
        }
        // Push the group query so that it will merge the unwinded parts back to parts field.
        aggregationQuery.push({
            $group: {
                _id: null,
                parts: { $push: '$parts' }
            }
        });
        return aggregationQuery;
    };
    PartsV4DAO.prototype.getAggregationQueryForAllPartsCount = function (productId) {
        var aggregationQuery = [];
        var idQuery = { _id: productId };
        aggregationQuery.push({ $match: idQuery });
        aggregationQuery.push({ $unwind: '$parts' });
        // Push the group query so that it will return individual parts count.
        var groupQuery = {
            $group: {
                _id: '$parts.type',
                count: { $sum: 1 }
            }
        };
        aggregationQuery.push(groupQuery);
        return aggregationQuery;
    };
    PartsV4DAO.prototype.getAllPartsCount = function (productId) {
        log.debug("getAllPartsCount:: ", {
            productId: productId
        });
        var aggregationQuery = this.getAggregationQueryForAllPartsCount(productId);
        var modelQuery = this.model.aggregate(aggregationQuery).exec();
        return modelQuery;
    };
    PartsV4DAO.prototype.executeQuery = function (modelQuery, isHasPartsCountMethod) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, modelQuery
                        .exec()
                        .then(function (part) {
                        var hasParts;
                        if (part && part[0]) {
                            hasParts = part[0].parts;
                        }
                        if (isHasPartsCountMethod) {
                            var count = hasParts ? hasParts.length : 0;
                            return Promise.resolve(count);
                        }
                        else {
                            return Promise.resolve(hasParts);
                        }
                    })
                        .catch(function (error) {
                        return Promise.reject('We are unable to find the parts.');
                    })];
            });
        });
    };
    /**
     * This method prepares a case insentive text search query for mongo db.
     * @param  {string} stringValue
     * @returns {regexQuery}
     */
    PartsV4DAO.prototype.getCaseInsensitiveRegexQuery = function (stringValue) {
        var caseInsensitiveType = '^' + stringValue + '$';
        return { $options: 'i', $regex: caseInsensitiveType };
    };
    PartsV4DAO.prototype.prepareMongoProjections = function (projectionFileds) {
        var projections = {};
        projectionFileds.forEach(function (property) {
            projections[property] = 1;
        });
        return projections;
    };
    return PartsV4DAO;
}());
exports.partsV4DAO = new PartsV4DAO();
