"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NullRemover = void 0;
var NullRemover = /** @class */ (function () {
    function NullRemover() {
    }
    NullRemover.cleanNullField = function (object) {
        Object.entries(object).forEach(function (_a) {
            var k = _a[0], v = _a[1];
            if (v && typeof v === 'object') {
                NullRemover.cleanNullField(v);
            }
            if ((v && typeof v === 'object' && !Object.keys(v).length) ||
                v === null) {
                if (Array.isArray(object)) {
                    object.splice(Number(k), 1);
                }
                else {
                    delete object[k];
                }
            }
        });
        return object;
    };
    return NullRemover;
}());
exports.NullRemover = NullRemover;
