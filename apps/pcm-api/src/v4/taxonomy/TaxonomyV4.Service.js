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
exports.taxonomyV4Service = exports.TaxonomyV4Service = void 0;
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var apiResponseGroupConfig_1 = require("../config/apiResponseGroupConfig");
var TaxonomyV4_DAO_1 = require("./TaxonomyV4.DAO");
var log = LoggerUtil_1.default.getLogger('TaxonomyV4Service');
var TaxonomyV4Service = /** @class */ (function () {
    function TaxonomyV4Service() {
    }
    TaxonomyV4Service.prototype.getTaxonomy = function (assetType, taxonomyType, taxonomyFilter) {
        return __awaiter(this, void 0, void 0, function () {
            var projectionFields;
            return __generator(this, function (_a) {
                log.debug('getTaxonomy:: ', { assetType: assetType, taxonomyFilter: taxonomyFilter, taxonomyType: taxonomyType });
                projectionFields = apiResponseGroupConfig_1.apiResponseGroupConfig.getProjectionFieldsForTaxonomy();
                return [2 /*return*/, TaxonomyV4_DAO_1.taxonomyV4DAO.getTaxonomy(assetType, taxonomyType, taxonomyFilter, projectionFields)];
            });
        });
    };
    TaxonomyV4Service.prototype.getTaxonomyClassifications = function (taxonomyFilter) {
        return __awaiter(this, void 0, void 0, function () {
            var projectionFields, taxonomyMasterResponse, filter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.debug('getTaxonomyClassifications:: ', { taxonomyFilter: taxonomyFilter });
                        projectionFields = apiResponseGroupConfig_1.apiResponseGroupConfig.getProjectionFieldsForTaxonomyMaster();
                        if (!(taxonomyFilter.classificationFamily === 'ubx')) return [3 /*break*/, 2];
                        filter = {
                            code: taxonomyFilter.code,
                            extendLevel: taxonomyFilter.includeChildren,
                            isCodePrefix: taxonomyFilter.code &&
                                (taxonomyFilter.level || taxonomyFilter.includeChildren)
                                ? true
                                : false,
                            level: taxonomyFilter.level
                        };
                        return [4 /*yield*/, TaxonomyV4_DAO_1.taxonomyV4DAO.getTaxonomy(null, taxonomyFilter.classificationType, filter, projectionFields)];
                    case 1:
                        taxonomyMasterResponse = _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, TaxonomyV4_DAO_1.taxonomyV4DAO.getTaxonomyClassifications(taxonomyFilter, projectionFields)];
                    case 3:
                        taxonomyMasterResponse = _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, this._transformTaxonomyClassifications(taxonomyMasterResponse)];
                }
            });
        });
    };
    TaxonomyV4Service.prototype._transformTaxonomyClassifications = function (taxonomyMasterResponse) {
        return taxonomyMasterResponse.map(function (taxonomy) {
            return {
                _id: taxonomy._id.toString(),
                classificationType: taxonomy.classificationType
                    ? taxonomy.classificationType
                    : taxonomy.type,
                code: taxonomy.code,
                level: taxonomy.level,
                name: taxonomy.name,
                parentId: taxonomy.parentId ? taxonomy.parentId.toString() : null
            };
        });
    };
    return TaxonomyV4Service;
}());
exports.TaxonomyV4Service = TaxonomyV4Service;
exports.taxonomyV4Service = new TaxonomyV4Service();
