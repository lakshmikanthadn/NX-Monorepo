"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.taxonomyRouter = void 0;
var ProductV4_Controller_1 = require("../v4/products/ProductV4.Controller");
var BaseRouter_1 = require("./BaseRouter");
var TaxonomyRouter = /** @class */ (function (_super) {
    __extends(TaxonomyRouter, _super);
    function TaxonomyRouter() {
        return _super.call(this) || this;
    }
    TaxonomyRouter.prototype.initRoutes = function () {
        var _this = this;
        this.router.get('/', function (req, res) {
            if (req.query.apiVersion === '4.0.1') {
                ProductV4_Controller_1.productV4Controller.getTaxonomyClassifications(req, res);
            }
            else {
                _this.handleInvalidAPIVersion(req, res);
            }
        });
    };
    return TaxonomyRouter;
}(BaseRouter_1.BaseRouter));
exports.taxonomyRouter = new TaxonomyRouter();
