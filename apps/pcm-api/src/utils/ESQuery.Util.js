"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.esQueryUtil = void 0;
var config_1 = require("../config/config");
var docTypeToESIndexMapperV4 = config_1.Config.getPropertyValue('docTypeToESIndexMapperV4');
var ESQueryUtil = /** @class */ (function () {
    function ESQueryUtil() {
    }
    ESQueryUtil.prototype.getESIndexByProductType = function (productType) {
        var indexName = "".concat(productType, "Index");
        return docTypeToESIndexMapperV4[indexName];
    };
    return ESQueryUtil;
}());
exports.esQueryUtil = new ESQueryUtil();
