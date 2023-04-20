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
exports.productRouter = void 0;
var ACK_Controller_1 = require("../v4/ack/ACK.Controller");
var JournalPubServiceMap_Controller_1 = require("../v4/JournalPubServiceMap/JournalPubServiceMap.Controller");
var PartsV4_Controller_1 = require("../v4/parts/PartsV4.Controller");
var Parts_V410_Controller_1 = require("../v410/parts/Parts.V410.Controller");
var ProductV4_Controller_1 = require("../v4/products/ProductV4.Controller");
var PartsRevisionV4_Controller_1 = require("../v4/partsRevision/PartsRevisionV4.Controller");
var BaseRouter_1 = require("./BaseRouter");
var requestValidator_1 = require("../v4/validator/schemaValidator/requestValidator");
var partsRevision_Schema_1 = require("../v4/partsRevision/partsRevision.Schema");
var ProductRouter = /** @class */ (function (_super) {
    __extends(ProductRouter, _super);
    function ProductRouter() {
        return _super.call(this) || this;
    }
    ProductRouter.prototype.initRoutes = function () {
        var _this = this;
        this.router.head('/', function (req, res) {
            if (req.query.apiVersion === '4.0.1') {
                ProductV4_Controller_1.productV4Controller.getProductByIdentifier(req, res);
            }
            else {
                _this.handleInvalidAPIVersion(req, res);
            }
        });
        this.router.get('/', function (req, res) {
            if (req.query.apiVersion === '4.0.1') {
                ProductV4_Controller_1.productV4Controller.getProducts(req, res);
            }
            else {
                _this.handleInvalidAPIVersion(req, res);
            }
        });
        this.router.get('/manuscript', function (req, res) {
            if (req.query.apiVersion === '4.0.1') {
                ProductV4_Controller_1.productV4Controller.getPreArticles(req, res);
            }
            else {
                _this.handleInvalidAPIVersion(req, res);
            }
        });
        this.router.get('/report', function (req, res) {
            if (req.query.apiVersion === '4.0.1') {
                ProductV4_Controller_1.productV4Controller.getReport(req, res);
            }
            else {
                _this.handleInvalidAPIVersion(req, res);
            }
        });
        this.router.get('/:identifier/associated-media', function (req, res) {
            if (req.query.apiVersion === '4.0.1') {
                ProductV4_Controller_1.productV4Controller.getProductAssociatedMedia(req, res);
            }
            else {
                _this.handleInvalidAPIVersion(req, res);
            }
        });
        this.router.get('/manuscript/workflow/:identifier', function (req, res) {
            if (req.query.apiVersion === '4.0.1') {
                ProductV4_Controller_1.productV4Controller.getManuscriptWorkflow(req, res);
            }
            else {
                _this.handleInvalidAPIVersion(req, res);
            }
        });
        this.router.get('/manuscript/:identifier', function (req, res) {
            if (req.query.apiVersion === '4.0.1') {
                ProductV4_Controller_1.productV4Controller.getPreArticle(req, res);
            }
            else {
                _this.handleInvalidAPIVersion(req, res);
            }
        });
        this.router.get('/:identifier', function (req, res) {
            if (req.query.apiVersion === '4.0.1') {
                ProductV4_Controller_1.productV4Controller.getProduct(req, res);
            }
            else {
                _this.handleInvalidAPIVersion(req, res);
            }
        });
        this.router.put('/:identifier', function (req, res) {
            if (req.body.apiVersion === '4.0.1') {
                ProductV4_Controller_1.productV4Controller.handleUpdateProduct(req, res);
            }
            else {
                _this.handleInvalidAPIVersion(req, res);
            }
        });
        this.router.patch('/:identifier', function (req, res) {
            if (req.body.apiVersion === '4.0.1') {
                ProductV4_Controller_1.productV4Controller.handlePartialUpdateProduct(req, res);
            }
            else {
                _this.handleInvalidAPIVersion(req, res);
            }
        });
        this.router.post('/:identifier/ack', function (req, res) {
            if (req.body.apiVersion === '4.0.1') {
                ACK_Controller_1.ackController.handleAssetDistributionAck(req, res);
            }
            else {
                _this.handleInvalidAPIVersion(req, res);
            }
        });
        this.router.put('/:identifier/publishing-services', function (req, res) {
            if (req.body.apiVersion === '4.0.1') {
                JournalPubServiceMap_Controller_1.journalPublishingServiceMapController.updateJournalPublishingServiceMap(req, res);
            }
            else {
                _this.handleInvalidAPIVersion(req, res);
            }
        });
        this.router.get('/:identifier/publishing-services', function (req, res) {
            if (req.query.apiVersion === '4.0.1') {
                JournalPubServiceMap_Controller_1.journalPublishingServiceMapController.getJournalPublishingServiceMap(req, res);
            }
            else {
                _this.handleInvalidAPIVersion(req, res);
            }
        });
        this.router.get('/:identifier/parts', function (req, res) {
            if (['4.0.1', '4.0.2'].includes(req.query.apiVersion)) {
                PartsV4_Controller_1.partsV4Controller.getProductHasParts(req, res);
            }
            else if (req.query.apiVersion === '4.1.0') {
                Parts_V410_Controller_1.partsV410Controller.getProductHasParts(req, res);
            }
            else {
                _this.handleInvalidAPIVersion(req, res);
            }
        });
        this.router.get('/:identifier/parts/:partId', function (req, res) {
            if (req.query.apiVersion === '4.0.1') {
                PartsV4_Controller_1.partsV4Controller.getProductHasPart(req, res);
            }
            else {
                _this.handleInvalidAPIVersion(req, res);
            }
        });
        this.router.get('/:identifier/parts-delta', function (request, response, next) {
            var defaultInclude = ['partsAdded', 'partsRemoved', 'partsUpdated'];
            var include = request.query.include;
            request.query.include = include ? include.split(',') : defaultInclude;
            next();
        }, requestValidator_1.validator.expressRequestValidator({
            query: partsRevision_Schema_1.partsRevisionSchema.definitions.GetPartsDeltaReqQuery
        }), function (req, res) {
            if (req.query.fromDate && req.query.apiVersion === '4.0.1') {
                PartsRevisionV4_Controller_1.partsrevisionV4Controller.getProductPartsRevisionDelta(req, res);
            }
            else if (req.query.apiVersion === '4.0.1') {
                PartsV4_Controller_1.partsV4Controller.getProductPartsDelta(req, res);
            }
            else {
                _this.handleInvalidAPIVersion(req, res);
            }
        });
        this.router.post('/', function (req, res) {
            if (req.body.apiVersion === '4.0.1') {
                ProductV4_Controller_1.productV4Controller.handlePostProduct(req, res);
            }
            else {
                _this.handleInvalidAPIVersion(req, res);
            }
        });
        this.router.post('/:identifier', function (req, res) {
            if (req.body.apiVersion === '4.0.1') {
                ProductV4_Controller_1.productV4Controller.handleCreateProductById(req, res);
            }
            else {
                _this.handleInvalidAPIVersion(req, res);
            }
        });
        this.router.get('/:assetType/classifications/:taxonomyType', function (req, res) {
            if (req.query.apiVersion === '4.0.1') {
                ProductV4_Controller_1.productV4Controller.getTaxonomy(req, res);
            }
            else {
                _this.handleInvalidAPIVersion(req, res);
            }
        });
    };
    return ProductRouter;
}(BaseRouter_1.BaseRouter));
exports.productRouter = new ProductRouter();
