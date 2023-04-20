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
exports.contentRouter = void 0;
var ContentV4_Controller_1 = require("../v4/content/ContentV4.Controller");
var Content_V410_Controller_1 = require("../v410/content/Content.V410.Controller");
var BaseRouter_1 = require("./BaseRouter");
var ContentRouter = /** @class */ (function (_super) {
    __extends(ContentRouter, _super);
    function ContentRouter() {
        return _super.call(this) || this;
    }
    ContentRouter.prototype.initRoutes = function () {
        var _this = this;
        this.router.get('/:id', function (req, res) {
            if (req.query.apiVersion === '4.0.1') {
                ContentV4_Controller_1.contentV4Controller.handleGetContentById(req, res);
            }
            else if (req.query.apiVersion === '4.1.0') {
                Content_V410_Controller_1.contentV410Controller.handleGetContentById(req, res);
            }
            else {
                _this.handleInvalidAPIVersion(req, res);
            }
        });
        this.router.get('/', function (req, res) {
            if (req.query.apiVersion === '4.0.1') {
                ContentV4_Controller_1.contentV4Controller.getContentByIdentifier(req, res);
            }
            else {
                _this.handleInvalidAPIVersion(req, res);
            }
        });
        this.router.post('/', function (req, res) {
            if (req.body.apiVersion === '4.0.1') {
                ContentV4_Controller_1.contentV4Controller.createAssociatedMedia(req, res);
            }
            else {
                _this.handleInvalidAPIVersion(req, res);
            }
        });
    };
    return ContentRouter;
}(BaseRouter_1.BaseRouter));
exports.contentRouter = new ContentRouter();
