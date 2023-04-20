"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRouter = void 0;
var express_1 = require("express");
var AppError_1 = require("../model/AppError");
var APIResponse_1 = require("../utils/APIResponse");
var BaseRouter = /** @class */ (function () {
    function BaseRouter() {
        this.initiatedRoutes = false;
        this.router = (0, express_1.Router)();
    }
    BaseRouter.prototype.getRoutes = function () {
        if (!this.initiatedRoutes) {
            this.initRoutes();
            this.initiatedRoutes = true;
        }
        return this.router;
    };
    BaseRouter.prototype.handleInvalidAPIVersion = function (req, res) {
        APIResponse_1.APIResponse.failure(res, new AppError_1.AppError("Invalid API Version: ".concat(req.query.apiVersion || req.body.apiVersion), 400));
    };
    return BaseRouter;
}());
exports.BaseRouter = BaseRouter;
