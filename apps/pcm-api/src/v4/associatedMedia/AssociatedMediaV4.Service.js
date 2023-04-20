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
exports.associatedMediaV4Service = void 0;
var constant_1 = require("../../config/constant");
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var AssociatedMediaV4_DAO_1 = require("./AssociatedMediaV4.DAO");
var log = LoggerUtil_1.default.getLogger('AssociatedMediaV4Service');
var AssociatedMediaV4Service = /** @class */ (function () {
    function AssociatedMediaV4Service() {
        this.responseModelProjections = [
            'location',
            'type',
            'size',
            '_id',
            'versionType'
        ];
        this.contentTypesHostedInPublicDomain = constant_1.AppConstants.ContentTypesHostedInPublicDomain;
    }
    AssociatedMediaV4Service.prototype.getContentMetaDataByParentid = function (parentId, includeLocationForAll, currentVersion) {
        if (includeLocationForAll === void 0) { includeLocationForAll = false; }
        return __awaiter(this, void 0, void 0, function () {
            var respAssociatedMedias;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.debug('getContentMetaDataByParentid:: ', {
                            includeLocationForAll: includeLocationForAll,
                            parentId: parentId
                        });
                        return [4 /*yield*/, AssociatedMediaV4_DAO_1.associatedMediaV4Dao.getAssociatedMediaByParentId(parentId, this.responseModelProjections, currentVersion)];
                    case 1:
                        respAssociatedMedias = _a.sent();
                        if (includeLocationForAll) {
                            return [2 /*return*/, respAssociatedMedias];
                        }
                        return [2 /*return*/, this.enableLocationByType(respAssociatedMedias, this.contentTypesHostedInPublicDomain)];
                }
            });
        });
    };
    AssociatedMediaV4Service.prototype.getAsstMediasByParentIds = function (parentIds, includeLocationForAll) {
        if (includeLocationForAll === void 0) { includeLocationForAll = false; }
        return __awaiter(this, void 0, void 0, function () {
            var projectionWithParentId, respAssociatedMedias;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        projectionWithParentId = [
                            'location',
                            'type',
                            'size',
                            '_id',
                            'parentId',
                            'versionType'
                        ];
                        return [4 /*yield*/, AssociatedMediaV4_DAO_1.associatedMediaV4Dao.getAsstMediasByParentIds(parentIds, projectionWithParentId)];
                    case 1:
                        respAssociatedMedias = _a.sent();
                        if (includeLocationForAll) {
                            return [2 /*return*/, respAssociatedMedias];
                        }
                        return [2 /*return*/, this.enableLocationByType(respAssociatedMedias, this.contentTypesHostedInPublicDomain)];
                }
            });
        });
    };
    AssociatedMediaV4Service.prototype.getAsstMediaByParentIdAndFilename = function (parentId, fileName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, AssociatedMediaV4_DAO_1.associatedMediaV4Dao.getByParentIdAndLocation(parentId, fileName, [
                        '_id'
                    ])];
            });
        });
    };
    AssociatedMediaV4Service.prototype.getAsstMediaByParentIdAndType = function (parentId, type) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, AssociatedMediaV4_DAO_1.associatedMediaV4Dao.getAsstMediaByParentIdAndType(parentId, type, [
                        'location'
                    ])];
            });
        });
    };
    AssociatedMediaV4Service.prototype.createAssociatedMedia = function (content) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, AssociatedMediaV4_DAO_1.associatedMediaV4Dao.createAssociatedMedia(content)];
            });
        });
    };
    AssociatedMediaV4Service.prototype.enableLocationByType = function (associatedMedias, selectedTypes) {
        return associatedMedias.map(function (associatedMedia) {
            if (!selectedTypes.includes(associatedMedia.type)) {
                associatedMedia['location'] = null;
            }
            return associatedMedia;
        });
    };
    return AssociatedMediaV4Service;
}());
exports.associatedMediaV4Service = new AssociatedMediaV4Service();
