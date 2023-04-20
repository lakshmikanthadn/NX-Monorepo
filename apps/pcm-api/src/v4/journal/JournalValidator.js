"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.journalValidator = void 0;
var AppError_1 = require("../../model/AppError");
var JournalValidator = /** @class */ (function () {
    function JournalValidator() {
    }
    JournalValidator.prototype.validate = function (request) {
        // kept for future use
        var product = request.body.product;
        var productIdentifierName = request.query.productIdentifierName;
        if (productIdentifierName !== 'journalAcronym') {
            throw new AppError_1.AppError("Product-identifier ".concat(productIdentifierName, " is not allowed."), 400);
        }
        var OAExist = false;
        var OSExist = false;
        if (product.permissions) {
            OAExist = product.permissions.some(function (perm) {
                return perm.code === 'OA' || perm.name === 'open-access';
            });
            OSExist = product.permissions.some(function (perm) {
                return perm.code === 'OS' || perm.name === 'open-select';
            });
        }
        if (OAExist && OSExist) {
            throw new AppError_1.AppError("Both OA and OS permission is not allowed at a time.", 400);
        }
        var isEmailEmpty = false;
        if (product.contributors) {
            isEmailEmpty = product.contributors.some(function (contributor) {
                return contributor.email === '';
            });
        }
        if (isEmailEmpty) {
            throw new AppError_1.AppError("contributors email can not be empty.", 400);
        }
        return true;
    };
    return JournalValidator;
}());
exports.journalValidator = new JournalValidator();
