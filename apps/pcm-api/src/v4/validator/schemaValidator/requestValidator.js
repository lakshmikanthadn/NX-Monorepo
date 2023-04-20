"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validator = void 0;
var ajv_1 = require("ajv");
var ajvErrors = require("ajv-errors");
var AppError_1 = require("../../../model/AppError");
var APIResponse_1 = require("../../../utils/APIResponse");
var Validator = /** @class */ (function () {
    function Validator() {
    }
    Validator.prototype.expressRequestValidator = function (reqSchema) {
        var _this = this;
        return function (request, response, next) {
            try {
                if (reqSchema.query) {
                    _this.validate(reqSchema.query, request.query);
                    next();
                }
            }
            catch (error) {
                APIResponse_1.APIResponse.failure(response, error);
            }
        };
    };
    Validator.prototype.validate = function (schema, data) {
        var ajv = new ajv_1.default({ allErrors: true });
        ajvErrors(ajv);
        var validate = ajv.compile(schema);
        var valid = validate(data);
        if (valid) {
            return true;
        }
        else {
            throw new AppError_1.AppError('Validation error', 400, validate.errors);
        }
    };
    return Validator;
}());
exports.validator = new Validator();
