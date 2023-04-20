"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.push(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.push(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
exports.journalController = void 0;
var privilege_authorization_manager_1 = require("@tandfgroup/privilege-authorization-manager");
var APIResponse_1 = require("../../utils/APIResponse");
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var Journal_Service_1 = require("./Journal.Service");
var JournalValidator_1 = require("./JournalValidator");
var config_1 = require("../../config/config");
var log = LoggerUtil_1.default.getLogger('JournalController');
var iamEnv = config_1.Config.getPropertyValue('iamEnv');
var JournalController = function () {
    var _a;
    var _instanceExtraInitializers = [];
    var _updateJournalProduct_decorators;
    return _a = /** @class */ (function () {
            function JournalController() {
                __runInitializers(this, _instanceExtraInitializers);
            }
            /**
             *
             * @param request express request object
             * @param response express response object
             * @returns hands over the request to handler
             */
            JournalController.prototype.updateJournalProduct = function (request, response) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, this._updateJournalProduct(request, response)];
                    });
                });
            };
            /**
             * This method is temporary solution to test the Decorated method updateJournalProduct
             * Right now the Mocking is not working as expected with typescript Decorator.
             * Keeping this public for testing.
             * @param request
             * @param response
             * @returns updates the journal product
             */
            JournalController.prototype._updateJournalProduct = function (request, response) {
                return __awaiter(this, void 0, void 0, function () {
                    var product, productIdentifier, productIdentifierName, responseData, error_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                product = request.body.product;
                                productIdentifier = request.params.identifier;
                                productIdentifierName = request.query.productIdentifierName || '_id';
                                JournalValidator_1.journalValidator.validate(request);
                                return [4 /*yield*/, Journal_Service_1.journalService.updateJournalProduct(productIdentifier, product, productIdentifierName)];
                            case 1:
                                _a.sent();
                                responseData = {
                                    message: "Journal product data for ".concat(productIdentifierName, " ").concat(productIdentifier, " ") +
                                        "is accepted successfully, it will be processed soon."
                                };
                                return [2 /*return*/, APIResponse_1.APIResponse.accepted(response, {
                                        data: null,
                                        metadata: responseData
                                    })];
                            case 2:
                                error_1 = _a.sent();
                                LoggerUtil_1.default.handleErrorLog(log, 'updateJournalProduct:: ', error_1);
                                return [2 /*return*/, APIResponse_1.APIResponse.failure(response, error_1)];
                            case 3: return [2 /*return*/];
                        }
                    });
                });
            };
            return JournalController;
        }()),
        (function () {
            _updateJournalProduct_decorators = [(0, privilege_authorization_manager_1.hasPermission)(['api', 'journal-product', 'update'], null, iamEnv)];
            __esDecorate(_a, null, _updateJournalProduct_decorators, { kind: "method", name: "updateJournalProduct", static: false, private: false, access: { has: function (obj) { return "updateJournalProduct" in obj; }, get: function (obj) { return obj.updateJournalProduct; } } }, null, _instanceExtraInitializers);
        })(),
        _a;
}();
exports.journalController = new JournalController();
