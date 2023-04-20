"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.partsUtil = void 0;
var ESQuery_Util_1 = require("../ESQuery.Util");
var config_1 = require("../../v4/config");
var PartsUtil = /** @class */ (function () {
    function PartsUtil() {
    }
    PartsUtil.prototype.getUniquePartTypesToIndex = function (partsData) {
        var uniquePartsType = new Set(partsData.map(function (parts) { return parts.type; }));
        return __spreadArray([], uniquePartsType, true).map(function (partType) {
            return ESQuery_Util_1.esQueryUtil.getESIndexByProductType(partType);
        });
    };
    PartsUtil.prototype.getIdsFromParts = function (partsData) {
        return partsData.map(function (part) {
            return part._id;
        });
    };
    PartsUtil.prototype.getProjectionsBasedOnResponseGroup = function (resGroup) {
        if (resGroup === 'small') {
            return __spreadArray([], config_1.apiResponseGroupConfig.getProjectionFields('allProducts', 'partSmall'), true);
        }
        else {
            return __spreadArray([], config_1.apiResponseGroupConfig.getProjectionFields('allProducts', 'partMedium'), true);
        }
    };
    PartsUtil.prototype.mergePartsAndProductPartsData = function (partsData, esProductData) {
        var merged = [];
        var _loop_1 = function (prod) {
            merged.push(__assign(__assign({}, partsData.find(function (part) { return part._id === prod._id; })), prod));
        };
        for (var _i = 0, esProductData_1 = esProductData; _i < esProductData_1.length; _i++) {
            var prod = esProductData_1[_i];
            _loop_1(prod);
        }
        return merged;
    };
    PartsUtil.prototype.getPartsDataFromSearchResult = function (searchData) {
        return searchData.map(function (part) {
            var _a, _b, _c, _d, _e, _f, _g;
            var productType = (_a = part._source) === null || _a === void 0 ? void 0 : _a.type;
            var data = { _id: part._id };
            if (part._source && part._source[productType])
                data["".concat(productType)] = part._source[productType];
            if ((_b = part._source) === null || _b === void 0 ? void 0 : _b.contributors)
                data['contributors'] = part._source.contributors;
            if ((_c = part._source) === null || _c === void 0 ? void 0 : _c.identifiers)
                data['identifiers'] = part._source.identifiers;
            if ((_d = part._source) === null || _d === void 0 ? void 0 : _d.permissions)
                data['permissions'] = part._source.permissions;
            if ((_e = part._source) === null || _e === void 0 ? void 0 : _e.prices)
                data['prices'] = part._source.prices;
            if ((_f = part._source) === null || _f === void 0 ? void 0 : _f.title)
                data['title'] = part._source.title;
            if (productType === 'collection' && ((_g = part._source) === null || _g === void 0 ? void 0 : _g.categories)) {
                data['categories'] = part._source.categories;
            }
            return data;
        });
    };
    PartsUtil.prototype.getPartsDiff = function (olderPartsData, newerPartsData) {
        return newerPartsData.filter(function (newPart) {
            return !olderPartsData.some(function (oldPart) { return oldPart._id === newPart._id; });
        });
    };
    return PartsUtil;
}());
exports.partsUtil = new PartsUtil();
