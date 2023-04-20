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
exports.SQSUtilsV4 = void 0;
var AWS = require("aws-sdk");
var v4_1 = require("uuid/v4");
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var config_1 = require("../../config/config");
var log = LoggerUtil_1.default.getLogger('SQSUtilsV4');
// Create an SQS service object
var sqs = new AWS.SQS({ apiVersion: '2012-11-05', region: 'eu-west-1' });
var collectionFIFOQueue = config_1.Config.getPropertyValue('collectionFIFOQueue');
var searchResultQueue = config_1.Config.getPropertyValue('searchResultDownloadQueue');
var oaUpdateQueue = config_1.Config.getPropertyValue('oaUpdateQueue');
var SQSUtilsV4 = /** @class */ (function () {
    function SQSUtilsV4() {
    }
    SQSUtilsV4.sendMessage = function (id, location, action, collectionType) {
        return __awaiter(this, void 0, void 0, function () {
            var date, dateInMillisecond, messageBody, sqsData;
            return __generator(this, function (_a) {
                log.debug('sendMessage::,', "id: ".concat(id, ", location: ").concat(location, ", action: ").concat(action, ",\n            collectionType: ").concat(collectionType));
                date = new Date();
                dateInMillisecond = date.getTime();
                messageBody = {
                    application: 'PAC API',
                    assetType: 'collection',
                    eventType: 'AGGREGATION4',
                    messageTimestamp: dateInMillisecond,
                    messageType: action,
                    // create/update
                    productType: collectionType,
                    publishingItemId: id,
                    sourceFileUrl: location,
                    status: 'success'
                };
                sqsData = {
                    MessageBody: JSON.stringify(messageBody),
                    /*
                            The message deduplication ID is the token used for deduplication
                            of sent messages. If a message with a particular message deduplication
                            ID is sent successfully, any messages sent with the same message
                            deduplication ID are accepted successfully but aren't delivered
                            during the 5-minute deduplication interval
                          */
                    MessageDeduplicationId: (0, v4_1.default)(),
                    /*
                            The message group ID is the tag that specifies that a
                            message belongs to a specific message group. Messages
                            that belong to the same message group are always processed one by one,
                            in a strict order relative to the message group
                          */
                    MessageGroupId: id,
                    QueueUrl: collectionFIFOQueue.url
                };
                // Send the data to the SQS queue
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        sqs.sendMessage(sqsData, function (SQSErr, data) {
                            if (SQSErr) {
                                log.error("ERROR: ".concat(SQSErr));
                                resolve(null);
                                return;
                            }
                            log.info("Message sent successfully with message id ".concat(data.MessageId));
                            resolve(data.MessageId);
                        });
                    })];
            });
        });
    };
    SQSUtilsV4.sendSearchRequestMessage = function (searchRequestData) {
        return __awaiter(this, void 0, void 0, function () {
            var date, isoDate, messageHeader, completeMsg, messageBody, sqsData;
            return __generator(this, function (_a) {
                log.debug('sendSearchRequestMessage::,', "id: ".concat(searchRequestData._id));
                date = new Date();
                isoDate = date.toISOString();
                messageHeader = {
                    application: 'sales-force',
                    id: searchRequestData._id,
                    source: 'PCM',
                    status: 'success',
                    statusDescription: '',
                    timestamp: isoDate,
                    version: '4.0.1'
                };
                completeMsg = {
                    body: searchRequestData,
                    header: messageHeader
                };
                messageBody = JSON.stringify(completeMsg);
                sqsData = {
                    MessageBody: messageBody,
                    QueueUrl: searchResultQueue.url
                };
                // Send the data to the SQS queue
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        sqs.sendMessage(sqsData, function (SQSErr, data) {
                            if (SQSErr) {
                                log.error("ERROR: ".concat(SQSErr));
                                resolve(null);
                                return;
                            }
                            log.info("Message sent successfully with message id ".concat(data.MessageId));
                            resolve(data.MessageId);
                        });
                    })];
            });
        });
    };
    SQSUtilsV4.sendOAUpdateMessage = function (oaUpdateInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var sqsData;
            return __generator(this, function (_a) {
                log.debug('sendOAUpdateMessage::,', "oaUpdateInfo: ".concat(JSON.stringify(oaUpdateInfo)));
                sqsData = {
                    MessageBody: JSON.stringify(oaUpdateInfo),
                    QueueUrl: oaUpdateQueue.url
                };
                // Send the data to the SQS queue
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        sqs.sendMessage(sqsData, function (SQSErr, data) {
                            if (SQSErr) {
                                log.error("sendMessage:: ERROR: ".concat(SQSErr));
                                resolve(null);
                                return;
                            }
                            log.info("Message sent successfully with message id ".concat(data.MessageId));
                            resolve(data.MessageId);
                        });
                    })];
            });
        });
    };
    return SQSUtilsV4;
}());
exports.SQSUtilsV4 = SQSUtilsV4;
