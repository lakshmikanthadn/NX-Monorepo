"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchQueryUtil = void 0;
var moment_1 = require("moment");
var AppError_1 = require("../model/AppError");
var QueryParser_1 = require("./QueryParser");
var SearchQueryUtil = /** @class */ (function () {
    function SearchQueryUtil() {
        this.replacer = function (key, value) {
            if ((0, moment_1.default)(value, 'YYYY-MM-DDTHH:mm:ss.sssZ', true).isValid()) {
                return 'ISODate(' + value + ')';
            }
            return value;
        };
    }
    SearchQueryUtil.prototype.getQueryForRulesProductsQuery = function (productType, rules) {
        var query;
        try {
            query = QueryParser_1.queryParserV4.parse([{ rules: rules, type: productType }]);
        }
        catch (e) {
            throw new AppError_1.AppError(e.message, 400);
        }
        return query[0].rules;
    };
    SearchQueryUtil.prototype.getRulesStringFromSearchQuery = function (searchQuery) {
        var _this = this;
        return searchQuery.map(function (sq) {
            sq.rulesString = JSON.stringify(_this.getQueryForRulesProductsQuery(sq.type, sq.rules), _this.replacer);
            sq.rulesString = sq.rulesString.replace(/"ISODate\(/g, 'ISODate("');
            sq.rulesString = sq.rulesString.replace(/Z\)"/g, 'Z")');
            return sq;
        });
    };
    return SearchQueryUtil;
}());
exports.searchQueryUtil = new SearchQueryUtil();
