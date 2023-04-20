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
exports.entitlementUtils = void 0;
var axios_1 = require("axios");
var config_1 = require("../config/config");
var LoggerUtil_1 = require("./LoggerUtil");
var log = LoggerUtil_1.default.getLogger('EntitlementUtils');
var EntitlementUtils = /** @class */ (function () {
    function EntitlementUtils() {
    }
    EntitlementUtils.prototype.isEntitled = function (partyId, productId, organizationId, apiVersion, render, token, ip) {
        if (apiVersion === void 0) { apiVersion = '4.0.0'; }
        return __awaiter(this, void 0, void 0, function () {
            var url, config, entitlementUrlV4, response, e_1, json, view, download, grantTypes, validView, validDownload, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        url = void 0;
                        config = void 0;
                        entitlementUrlV4 = config_1.Config.getPropertyValue('entitlementUrlV4');
                        log.debug("isEntitled::", { organizationId: organizationId, partyId: partyId, productId: productId, render: render });
                        if (apiVersion === '4.0.1' && entitlementUrlV4) {
                            url = entitlementUrlV4 + productId;
                            config = {
                                headers: {
                                    Authorization: 'idtoken ' + token,
                                    'Content-Type': 'application/json'
                                },
                                method: 'GET'
                            };
                        }
                        else {
                            if (partyId && organizationId) {
                                url =
                                    config_1.Config.getPropertyValue('entitlementUrl') +
                                        '?customerId=' +
                                        partyId +
                                        '&orgId=' +
                                        organizationId +
                                        '&productId=' +
                                        productId;
                            }
                            else {
                                url =
                                    config_1.Config.getPropertyValue('entitlementUrl') +
                                        '?customerId=' +
                                        (!partyId ? organizationId : partyId) +
                                        '&productId=' +
                                        productId;
                            }
                            config = {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'ignore-auth': 'true'
                                },
                                method: 'GET'
                            };
                        }
                        response = void 0;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, axios_1.default)(url, config)];
                    case 2:
                        response = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        if (this.shouldLogEntitlementAPIError(e_1)) {
                            log.error("isEntitled:: ERROR while calling entitlement API: ".concat(e_1));
                        }
                        else {
                            log.warn("isEntitled:: Entitlement API response: ".concat({
                                e: e_1,
                                token: token
                            }));
                        }
                        return [2 /*return*/, false];
                    case 4:
                        json = response.data;
                        // for 4.0.1
                        if (apiVersion === '4.0.1') {
                            if (!json.entitledResponse || response.status !== 200) {
                                log.warn("isEntitled:: Entitlement Check failure ip:".concat(ip, " url: ").concat(url, " response:").concat(response, " token:").concat(token));
                                return [2 /*return*/, false];
                            }
                            view = entitlementUrlV4 ? 'view' : 'View';
                            download = entitlementUrlV4 ? 'download' : 'Download';
                            grantTypes = entitlementUrlV4
                                ? json.entitledResponse[0]
                                    ? json.entitledResponse[0].grantTypes
                                    : []
                                : json.grantTypes;
                            validView = grantTypes && grantTypes.includes(view) && render === true;
                            validDownload = grantTypes && grantTypes.includes(download) && render === false;
                            return [2 /*return*/, response.status === 200 && (validView || validDownload)
                                    ? true
                                    : false];
                        }
                        else {
                            // for 4.0.0
                            return [2 /*return*/, json.metaData.code === 200 &&
                                    json.grantTypes.indexOf('View') > -1
                                    ? true
                                    : false];
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        err_1 = _a.sent();
                        log.error("isEntitled:: ERROR: ".concat(err_1));
                        // Do not throw error handle the error here and return false.
                        return [2 /*return*/, false];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * This method returns true if 403 and 401 error responses are returned by the entitlement API
     * @param statusCode error status code returned by entitlement API
     * @returns boolean
     */
    EntitlementUtils.prototype.isAccessError = function (statusCode) {
        return statusCode === 401 || statusCode === 403 ? true : false;
    };
    EntitlementUtils.prototype.shouldLogEntitlementAPIError = function (e) {
        return !e.response ||
            !e.response.status ||
            !this.isAccessError(e.response.status)
            ? true
            : false;
    };
    return EntitlementUtils;
}());
exports.entitlementUtils = new EntitlementUtils();
