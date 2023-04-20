"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentV410ReqValidator = void 0;
var ajv_1 = require("ajv");
var AppError_1 = require("../../model/AppError");
var ajv = new ajv_1.default();
var ReqQuerySchema = {
    additionalProperties: false,
    properties: {
        apiVersion: { enum: ['4.1.0'], type: 'string' },
        appName: { enum: ['KORTEXT'], type: 'string' },
        filenamePrefix: { maxLength: 50, type: 'string' },
        ipSignature: { type: 'string' },
        parentId: { type: 'string' },
        render: { enum: ['true', 'false'], type: 'string' },
        // Query parameters will always be string
        type: { type: 'string' }
    },
    required: ['apiVersion'],
    type: 'object'
};
var validateQuery = ajv.compile(ReqQuerySchema);
var ContentV410ReqValidator = /** @class */ (function () {
    function ContentV410ReqValidator() {
    }
    ContentV410ReqValidator.prototype.validateQueryParams = function (query) {
        var valid = validateQuery(query);
        if (!valid) {
            throw new AppError_1.AppError('Request validation error.', 400, validateQuery.errors);
        }
    };
    return ContentV410ReqValidator;
}());
exports.contentV410ReqValidator = new ContentV410ReqValidator();
