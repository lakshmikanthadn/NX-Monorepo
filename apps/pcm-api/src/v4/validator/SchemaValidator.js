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
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemaValidator = void 0;
var pcm_entity_model_v4_1 = require("@tandfgroup/pcm-entity-model-v4");
var ajv_1 = require("ajv");
var _ = require("lodash");
var validator_1 = require("validator");
var AppError_1 = require("../../model/AppError");
var NullRemoverUtilsV4_1 = require("../utils/NullRemoverUtilsV4");
var SchemaValidator = /** @class */ (function () {
    function SchemaValidator() {
        this.jsonValidator = new ajv_1.default({
            allErrors: true,
            jsonPointers: true,
            schemas: [pcm_entity_model_v4_1.OpenApiComponentV4]
        });
        this.jsonValidator.addFormat('email', function (data) { return (0, validator_1.isEmail)(data); });
    }
    SchemaValidator.prototype.validate = function (schemaId, data) {
        var cleanedData = NullRemoverUtilsV4_1.NullRemover.cleanNullField(_.cloneDeep(data));
        var validateSchema = this.jsonValidator.getSchema(schemaId);
        if (validateSchema(cleanedData)) {
            return true;
        }
        else {
            throw new AppError_1.AppError('Validation error', 400, validateSchema.errors.map(function (e) {
                return __assign({ code: 400, description: e.message }, e);
            }));
        }
    };
    return SchemaValidator;
}());
exports.schemaValidator = new SchemaValidator();
