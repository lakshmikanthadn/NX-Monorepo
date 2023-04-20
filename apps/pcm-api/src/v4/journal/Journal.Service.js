"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.journalService = void 0;
var lodash_1 = require("lodash");
var config_1 = require("../../config/config");
var AppError_1 = require("../../model/AppError");
var AssetV4_Service_1 = require("../assets/AssetV4.Service");
var Event_Service_1 = require("../event/Event.Service");
var SchemaValidator_1 = require("../validator/SchemaValidator");
var JournalService = /** @class */ (function () {
    function JournalService() {
        this.journalProductEventQueue = config_1.Config.getPropertyValue('journalProductEventQueue');
        // Only classification data is coming from SF and is based on acronym,
        // so calling the source as journalProductClassificationSource
        this.journalProductClassificationSource = 'SALESFORCE';
        this.schemaId = 'OpenApiSchema#/definitions/JournalProductRequest';
    }
    /**
     * Update the journal product by using the product identifier
     * @param productIdentifier product identifier
     * @param productIdentifierName product identifier name
     * @param journalData journal data to be updated
     * @returns messageID
     */
    JournalService.prototype.updateJournalProduct = function (productIdentifier, journalData, productIdentifierName) {
        return this.updateJournalProductByAcronym(productIdentifier, journalData);
    };
    /**
     * Update the journal product by acronym
     * @param acronym acronym of the journal
     * @param journalData journal data to be updated (supports only classifications)
     * @returns messageID
     */
    JournalService.prototype.updateJournalProductByAcronym = function (acronym, journalData) {
        return __awaiter(this, void 0, void 0, function () {
            var asset;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        SchemaValidator_1.schemaValidator.validate(this.schemaId, (0, lodash_1.cloneDeep)(journalData));
                        return [4 /*yield*/, AssetV4_Service_1.assetV4Service.getProductByIdentifier('journalAcronym', acronym)];
                    case 1:
                        asset = _a.sent();
                        if (!asset) {
                            throw new AppError_1.AppError("A Journal must exist with journalAcronym" + " ".concat(acronym), 404);
                        }
                        return [2 /*return*/, Event_Service_1.eventService.sendProductEvent(__assign({ identifiers: { journalAcronym: acronym } }, journalData), this.journalProductEventQueue, this.journalProductClassificationSource, { productId: acronym, productType: journalData.type })];
                }
            });
        });
    };
    return JournalService;
}());
exports.journalService = new JournalService();
