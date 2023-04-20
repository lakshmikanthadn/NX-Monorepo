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
exports.titleDao = void 0;
var pcm_entity_model_v4_1 = require("@tandfgroup/pcm-entity-model-v4");
var lodash_1 = require("lodash");
var mongoose = require("mongoose");
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var config_1 = require("../../config/config");
var constant_1 = require("../../config/constant");
var AppError_1 = require("../../model/AppError");
var Title_Transform_1 = require("./Title.Transform");
var log = LoggerUtil_1.default.getLogger('TitleDAO');
var docTypeToCollectionMapping = config_1.Config.getPropertyValue('docTypeToCollectionMapping');
var titlesQueryMapping = constant_1.AppConstants.titlesQueryMapping;
var TitleDAO = /** @class */ (function () {
    function TitleDAO() {
        this.model = mongoose.model('Title', pcm_entity_model_v4_1.MongooseSchema.Title, docTypeToCollectionMapping.title);
    }
    /**
     * This method returns the Book Variants data based on the input id.
     * @param idName
     * @param idValues
     * @param filters
     */
    TitleDAO.prototype.getProductVariantsByIds = function (idName, idValues, filters) {
        return __awaiter(this, void 0, void 0, function () {
            var identifierPath, aggQuery;
            var _this = this;
            return __generator(this, function (_a) {
                log.debug("getProductVariantsByIds:: ", { filters: filters, idName: idName, idValues: idValues });
                identifierPath = titlesQueryMapping[idName];
                aggQuery = this._getAggregateQuery(identifierPath, idValues, filters);
                return [2 /*return*/, this.model
                        .aggregate(aggQuery)
                        .exec()
                        .then(function (results) {
                        if (results.length === 0) {
                            throw new AppError_1.AppError('Variants not found.', 404);
                        }
                        var variantsInfo = [];
                        results.forEach(function (result) {
                            variantsInfo.push.apply(variantsInfo, _this._filterTransformAndStitch(result, idValues, idName, filters));
                        });
                        return variantsInfo;
                    })
                        .catch(function (err) {
                        throw err;
                    })];
            });
        });
    };
    /**
     * This method prepares a aggregate query for the titles API.
     * Step 1: Add $match stage for identifier query.
     * then unwind all editions.
     * Step 2: Add the $projection stage if we need to get only the editions Of the input id
     * Step 3: add $unwind stage for editions.formats and editions,
     *  So that we don't need think of using $eleMatch for additional filters (if any).
     * Step 4: Addtional filters can be applied here but inorder to find out
     *  inputidentifer we need to apply filter outside aggragation.
     * Last Stage: #group all the books back to its title.
     * @param identifierPath
     * @param idValues
     * @param filters
     */
    TitleDAO.prototype._getAggregateQuery = function (identifierPath, idValues, filters) {
        log.debug("_getAggregateQuery:: ", { filters: filters, idValues: idValues, identifierPath: identifierPath });
        // Step 1
        var query = {};
        query[identifierPath] = { $in: idValues };
        var aggQuery = [];
        aggQuery.push({ $match: query });
        aggQuery.push({ $unwind: '$editions' });
        // Step 2
        if (!filters.includeEditions) {
            // Push the query once again after unwonding editions
            // so it filters only the editions in which given id is exists.
            aggQuery.push({ $match: query });
        }
        // Step 3
        aggQuery.push({ $unwind: '$editions.formats' });
        // Last Step
        if (!filters.includeEditions) {
            // Need this check when two input isbns(identifiers)
            // matching same title but different edition.
            aggQuery.push({
                $group: {
                    _id: { edition: '$editions.edition', titleId: '$_id' },
                    unwindedTitles: { $push: '$$ROOT' }
                }
            });
        }
        else {
            aggQuery.push({
                $group: { _id: '$_id', unwindedTitles: { $push: '$$ROOT' } }
            });
        }
        log.debug('_getAggregateQuery:: ', { aggQuery: JSON.stringify(aggQuery) });
        return aggQuery;
    };
    /**
     * This method will
     * 1. Find outs the input indetifier from aggragator result
     * 2. Apply the filter. If passed through filter then
     *    - transform the title to book variant
     *    - stitch it with its input identifer
     * @param aggTitleResults the outcome of the aggregator query
     * @param idValues all the input identifers
     * @param idName identifier name
     */
    TitleDAO.prototype._filterTransformAndStitch = function (titlesObject, idValues, idName, filters) {
        log.debug("_filterTransformAndStitch:: ", { idName: idName, idValues: idValues });
        var identifierPath = titlesQueryMapping[idName];
        var inputIdentifiers = [];
        var variants = [];
        // Transformation and Stitching begins here
        titlesObject.unwindedTitles.forEach(function (unwindedTitle) {
            var currIdentifier = (0, lodash_1.get)(unwindedTitle, identifierPath, undefined);
            if (idValues.includes(currIdentifier) &&
                !inputIdentifiers.includes(currIdentifier)) {
                inputIdentifiers.push(currIdentifier);
            }
            // Derive the include flag based on the filters need to be applied.
            var includeThisProduct = !filters.formats ||
                filters.formats.includes(unwindedTitle.editions.formats.format);
            // transform and push if this product has to be included.
            if (includeThisProduct) {
                var bookVariant = Title_Transform_1.titleTransform.unwindedTitleToVariant(unwindedTitle);
                variants.push(bookVariant);
            }
        });
        return inputIdentifiers.map(function (inputIdentifierValue) {
            return {
                identifier: { name: idName, value: inputIdentifierValue },
                variants: variants
            };
        });
    };
    return TitleDAO;
}());
// This module exports only one instance of the titleDao instead of exporting the class.
exports.titleDao = new TitleDAO();
