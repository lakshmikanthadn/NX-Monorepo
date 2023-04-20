"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OaValidationError = void 0;
var OaValidationError = /** @class */ (function () {
    function OaValidationError(description) {
        this.code = '';
        this.description = description;
        this.dataPath = '';
    }
    return OaValidationError;
}());
exports.OaValidationError = OaValidationError;
