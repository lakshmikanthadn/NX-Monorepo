"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jwt_decode_1 = require("jwt-decode");
var lodash_1 = require("lodash");
var TokenDecoder = /** @class */ (function () {
    function TokenDecoder(token) {
        try {
            this._decodedToken = (0, jwt_decode_1.default)(token);
        }
        catch (e) {
            this._decodedToken = {};
        }
    }
    TokenDecoder.prototype.getTokenIdentity = function () {
        var client = (0, lodash_1.get)(this._decodedToken, 'client', undefined);
        if (client) {
            return client.username ? client.username : client.name;
        }
        var user = (0, lodash_1.get)(this._decodedToken, 'user', undefined);
        if (user) {
            if (user.organizationName && user.organizationName != '') {
                return user.organizationName;
            }
            if (this._decodedToken.ip != '') {
                return "annonymous - ".concat(user.username && user.username != ''
                    ? user.username
                    : this._decodedToken.ip);
            }
            return 'annonymous';
        }
        return undefined;
    };
    return TokenDecoder;
}());
exports.default = TokenDecoder;
