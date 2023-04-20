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
var AppError_1 = require("../model/AppError");
var APIResponse_1 = require("../utils/APIResponse");
var AppLoggerUtil_1 = require("../utils/AppLoggerUtil");
var ContentV4_Controller_1 = require("../v4/content/ContentV4.Controller");
var constant_1 = require("../config/constant");
var BaseRouter_1 = require("./BaseRouter");
var ContentProxyRouter = /** @class */ (function (_super) {
    __extends(ContentProxyRouter, _super);
    function ContentProxyRouter(contentProxyHandler) {
        var _this = _super.call(this) || this;
        _this.contentProxyHandler = contentProxyHandler;
        return _this;
    }
    /**
     * The below 2 endpoints for GOOGLE SCHOLAR to deliver content.
     * These endpoints completly does authentication based on the IP.
     *
     *
     * The ProductType and categoryType are not respected by PCM.
     * and these parmas are added for SEO improvemenet.
     *
     * this method initializes all the routes of a Content Proxy router
     */
    ContentProxyRouter.prototype.initRoutes = function () {
        this.router.get('/:productType/:categoryType/download', this.contentProxyReqValidator, this.contentProxyHandler.getExpressMiddleWare(), AppLoggerUtil_1.appLogger.getRequestInfoLogger(), function (req, res) {
            ContentV4_Controller_1.contentV4Controller.downloadContentByIdentifier(req, res);
        });
        this.router.get('/:productType/download', this.contentProxyReqValidator, this.contentProxyHandler.getExpressMiddleWare(), AppLoggerUtil_1.appLogger.getRequestInfoLogger(), function (req, res) {
            ContentV4_Controller_1.contentV4Controller.downloadContentByIdentifier(req, res);
        });
    };
    /**
     * Express middleware for validation
     * @param req request
     * @param res response
     * @param next nextFunction
     * Keeping the validation in the router itself for simplicity.
     */
    ContentProxyRouter.prototype.contentProxyReqValidator = function (req, res, next) {
        // Setting this intentionally, We need to consider content proxy API as 4.0.1 version.
        req.query.apiVersion = '4.0.1';
        var categoryType = req.params.categoryType;
        var productType = req.params.productType;
        if (!constant_1.AppConstants.ContentProxyWhitelistedResources.includes(productType.toLowerCase())) {
            APIResponse_1.APIResponse.failure(res, new AppError_1.AppError("Invalid product type ".concat(productType), 400));
        }
        else if (categoryType &&
            !constant_1.AppConstants.ContentProxyResourceCategories.includes(categoryType.toLowerCase())) {
            APIResponse_1.APIResponse.failure(res, new AppError_1.AppError("Invalid category type ".concat(categoryType), 400));
        }
        else {
            next();
        }
    };
    return ContentProxyRouter;
}(BaseRouter_1.BaseRouter));
exports.default = ContentProxyRouter;
