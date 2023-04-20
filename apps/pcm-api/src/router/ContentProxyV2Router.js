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
exports.contentProxyV2Router = void 0;
var config_1 = require("../config/config");
var AppLoggerUtil_1 = require("../utils/AppLoggerUtil");
var LoggerUtil_1 = require("../utils/LoggerUtil");
var BaseRouter_1 = require("./BaseRouter");
var log = LoggerUtil_1.default.getLogger('ContentProxyV2Router');
var contentApiUrl = config_1.Config.getPropertyValue('contentApiUrl');
var ContentProxyV2Router = /** @class */ (function (_super) {
    __extends(ContentProxyV2Router, _super);
    function ContentProxyV2Router() {
        return _super.call(this) || this;
    }
    /**
     * this method initializes all the routes of a ContentV2 Proxy router
     */
    ContentProxyV2Router.prototype.initRoutes = function () {
        var _this = this;
        this.router.get('/:productType/:categoryType/download', AppLoggerUtil_1.appLogger.getRequestInfoLogger(), function (req, res) {
            _this.contentV2ProxyReqHandler(req, res);
        });
        this.router.get('/:productType/download', AppLoggerUtil_1.appLogger.getRequestInfoLogger(), function (req, res) {
            _this.contentV2ProxyReqHandler(req, res);
        });
    };
    /**
     * To Handle all the CAPI V2 requests and redirect them permanently to new Content API.
     * @param req request
     * @param res response
     * Keeping the Redirection of the request in router itself for simplicity.
     */
    ContentProxyV2Router.prototype.contentV2ProxyReqHandler = function (request, response) {
        var identifierName;
        var identifierValue;
        var contentType;
        var isChapter = false;
        try {
            // Pick the Right identifier and check if the Product is chapter
            if (request.query.doi) {
                identifierName = 'doi';
                identifierValue = request.query.doi;
                // Assume as chapter if the doi has hyphen in it.
                isChapter = identifierValue.includes('-');
            }
            else if (request.query.isbn) {
                identifierName = 'isbn';
                identifierValue = request.query.isbn;
            }
            else if (request.query.dac) {
                identifierName = 'dacKey';
                identifierValue = request.query.dac;
            }
            else {
                log.warn('contentV2ProxyReqHandler Invalid Request:: request query ', request.query);
                response.status(404);
                response.send("Missing either one the required query params doc, isbn and doi");
                return;
            }
            // Derive the product type based on isChapter(derived from doi)
            var productType = isChapter ? 'chapters' : 'books';
            // Derive the Category code Based on the category Code we get in URL.
            var categoryType = request.params.categoryType === 'e' ? 'edit' : 'mono';
            // Derive the format Based on the format property in the request.
            var format = request.query.format;
            switch (format) {
                case 'pdf':
                    contentType = isChapter ? 'chapterpdf' : 'webpdf';
                    break;
                case 'googlePreviewPdf':
                case 'previewPdf':
                    contentType = 'previewpdf';
                    break;
                default:
                    contentType = format ? format.toLowerCase() : 'previewpdf';
            }
            return response.redirect(301, // Moved Permanently
            this.getNewUrl(identifierName, identifierValue, contentType, productType, categoryType));
        }
        catch (e) {
            log.error(e);
            throw e;
        }
    };
    // gets the UBX-website url corresponds to the requested product
    ContentProxyV2Router.prototype.getNewUrl = function (identifierName, identifierValue, contentType, productType, categoryType) {
        return ("".concat(contentApiUrl, "/").concat(productType, "/").concat(categoryType, "/download") +
            "?identifierName=".concat(identifierName) +
            "&identifierValue=".concat(encodeURIComponent(identifierValue)) +
            "&type=".concat(contentType));
    };
    return ContentProxyV2Router;
}(BaseRouter_1.BaseRouter));
exports.default = ContentProxyV2Router;
exports.contentProxyV2Router = new ContentProxyV2Router();
