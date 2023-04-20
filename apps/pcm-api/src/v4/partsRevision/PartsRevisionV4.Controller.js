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
exports.partsrevisionV4Controller = exports.PartsRevisionV4Controller = void 0;
var APIResponse_1 = require("../../utils/APIResponse");
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var rTracer = require("cls-rtracer");
var PartsRevisionV4_Service_1 = require("./PartsRevisionV4.Service");
var log = LoggerUtil_1.default.getLogger('PartsRevisionV4Controller');
var PartsRevisionV4Controller = /** @class */ (function () {
    function PartsRevisionV4Controller() {
    }
    PartsRevisionV4Controller.prototype.getProductPartsRevisionDelta = function (request, response) {
        return __awaiter(this, void 0, void 0, function () {
            var identifier, include, fromDate, toDate, channel, responseGroup, productPartsDelta_1, counts_1, data_1, respMetadata, responseOb, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.debug('getProductPartsRevisionDelta : Request Params : ', request.params);
                        identifier = request.params.identifier;
                        include = request.query.include;
                        fromDate = request.query.fromDate;
                        toDate = request.query.toDate;
                        channel = request.query.channel;
                        responseGroup = request.query.responseGroup;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, PartsRevisionV4_Service_1.partsrevisionV4Service.getProductPartsDelta(identifier, fromDate, toDate, include, channel, responseGroup)];
                    case 2:
                        productPartsDelta_1 = _a.sent();
                        counts_1 = [];
                        data_1 = {};
                        include.forEach(function (parts) {
                            data_1[parts] = productPartsDelta_1[parts];
                            counts_1.push({
                                count: productPartsDelta_1[parts].length,
                                type: parts
                            });
                        });
                        respMetadata = {
                            counts: counts_1,
                            transactionId: rTracer.id()
                        };
                        responseOb = { data: data_1, metadata: respMetadata };
                        APIResponse_1.APIResponse.success(response, responseOb);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        LoggerUtil_1.default.handleErrorLog(log, 'getProductPartsRevisionDelta', error_1);
                        APIResponse_1.APIResponse.failure(response, error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return PartsRevisionV4Controller;
}());
exports.PartsRevisionV4Controller = PartsRevisionV4Controller;
exports.partsrevisionV4Controller = new PartsRevisionV4Controller();
