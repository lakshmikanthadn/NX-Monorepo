"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchAPIValidator = void 0;
var AppError_1 = require("../../../model/AppError");
var PatchAPIValidator = /** @class */ (function () {
    function PatchAPIValidator() {
    }
    PatchAPIValidator.prototype.validatePatchRequest = function (productRequests) {
        productRequests.forEach(function (pReq) {
            var op = pReq.op, path = pReq.path, value = pReq.value;
            if (!(op && path && value)) {
                throw new AppError_1.AppError("missing either one of these fields op, path, value", 400);
            }
            if (op !== 'replace') {
                throw new AppError_1.AppError("invalid patch request with operation ".concat(op), 400);
            }
        });
        return true;
    };
    return PatchAPIValidator;
}());
exports.patchAPIValidator = new PatchAPIValidator();
