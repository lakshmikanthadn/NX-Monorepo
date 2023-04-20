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
exports.internalRouter = void 0;
var AppError_1 = require("../model/AppError");
var APIResponse_1 = require("../utils/APIResponse");
var ProductV4_Controller_1 = require("../v4/products/ProductV4.Controller");
var BaseRouter_1 = require("./BaseRouter");
var InternalRouter = /** @class */ (function (_super) {
    __extends(InternalRouter, _super);
    function InternalRouter() {
        return _super.call(this) || this;
    }
    InternalRouter.prototype.initRoutes = function () {
        this.router.put('/:id', function (req, res) {
            if (req.body.apiVersion === '4.0.1' && req.body.action === 'oaUpdate') {
                ProductV4_Controller_1.productV4Controller.handleOAUpdate(req, res);
            }
            else {
                APIResponse_1.APIResponse.failure(res, new AppError_1.AppError('Method not allowed', 405));
            }
        });
        this.router.post('/rules', function (req, res) {
            if (req.body.apiVersion === '4.0.1') {
                ProductV4_Controller_1.productV4Controller.handleRuleString(req, res);
            }
            else {
                APIResponse_1.APIResponse.failure(res, new AppError_1.AppError('Method not allowed', 405));
            }
        });
        this.router.post('/', function (req, res) {
            if (req.body.apiVersion === '4.0.1') {
                ProductV4_Controller_1.productV4Controller.handlePostProductInternal(req, res);
            }
            else {
                APIResponse_1.APIResponse.failure(res, new AppError_1.AppError('Method not allowed', 405));
            }
        });
    };
    return InternalRouter;
}(BaseRouter_1.BaseRouter));
exports.internalRouter = new InternalRouter();
