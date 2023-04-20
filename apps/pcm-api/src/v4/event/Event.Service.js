"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventService = void 0;
var config_1 = require("../../config/config");
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var SimpleStorage_Service_1 = require("../aws/sns/SimpleStorage.Service");
var SimpleQueue_Service_1 = require("../aws/sqs/SimpleQueue.Service");
var log = LoggerUtil_1.default.getLogger('EventService');
var EventService = /** @class */ (function () {
    function EventService() {
        this.eventsStoreBucket = config_1.Config.getPropertyValue('eventStoreBucket');
    }
    EventService.prototype.sendProductEvent = function (product, destinationQueueData, source, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var productId, productType, storagePath, payload, location;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        productId = options.productId || product._id;
                        productType = options.productType || product.type;
                        log.debug("sendProductEvent:: " +
                            "".concat(JSON.stringify({
                                destinationQueueData: destinationQueueData,
                                product: product,
                                productId: productId,
                                productType: productType,
                                source: source
                            })));
                        storagePath = "/".concat(source, "/inbound").concat(productType ? '/' + productType : '');
                        payload = { data: product };
                        return [4 /*yield*/, SimpleStorage_Service_1.simpleStorageService.upload(this.eventsStoreBucket, storagePath, this.getFileName(productId), JSON.stringify(payload))];
                    case 1:
                        location = _a.sent();
                        return [2 /*return*/, SimpleQueue_Service_1.simpleQueueService.sendMessage(destinationQueueData, JSON.stringify(this.getEventMessageBody(productId, productType, location)), productId)];
                }
            });
        });
    };
    /**
     * getProductEvent
     */
    EventService.prototype.getEventMessageBody = function (id, assetType, location) {
        var sqsMessage = {
            application: 'PAC API',
            messageTimestamp: Date.now(),
            sourceFileUrl: location,
            status: 'success'
        };
        if (assetType) {
            sqsMessage.assetType = assetType;
        }
        if (id) {
            sqsMessage.publishingItemId = id;
        }
        return sqsMessage;
    };
    EventService.prototype.getFileName = function (productId, extension) {
        if (extension === void 0) { extension = '.json'; }
        return "".concat(productId ? productId + '_' : '').concat(Date.now()).concat(extension);
    };
    return EventService;
}());
exports.eventService = new EventService();
