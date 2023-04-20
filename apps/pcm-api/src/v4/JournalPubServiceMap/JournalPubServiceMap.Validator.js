"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.journalPubServiceMapValidator = void 0;
var lodash_1 = require("lodash");
var AppError_1 = require("../../model/AppError");
var NullRemoverUtilsV4_1 = require("../utils/NullRemoverUtilsV4");
var SchemaValidator_1 = require("../validator/SchemaValidator");
var JournalPubServiceMapValidator = /** @class */ (function () {
    function JournalPubServiceMapValidator() {
        this.schemaId = 'OpenApiSchema#/definitions/JournalPublishingServiceMapRequest';
    }
    JournalPubServiceMapValidator.prototype.validate = function (mappingData) {
        SchemaValidator_1.schemaValidator.validate(this.schemaId, mappingData);
        this.validateDuplicateMapping(mappingData.publishingServices);
        return true;
    };
    /**
     * Checks if the mapping data has duplicate entries.
     * Duplication is completely based on the entire object.
     * Same publishing service is allowed to have more than one entry in the mapping
     * but NOT for the same article type classification.
     * So instead of comparing just the _id of the mapping data, check the entire mapping object.
     *
     * @publishingServiceMapping publishingServiceMapping
     * @returns {boolean}
     *
     */
    JournalPubServiceMapValidator.prototype.validateDuplicateMapping = function (publishingServiceMapping) {
        var cleanedData = NullRemoverUtilsV4_1.NullRemover.cleanNullField((0, lodash_1.cloneDeep)(publishingServiceMapping));
        var uniqValues = [];
        var duplicatePubServices = [];
        var hasDuplicate = false;
        cleanedData.forEach(function (pubServiceUnderTest, index) {
            if (uniqValues.some(function (pubService) {
                return (0, lodash_1.isEqual)(pubService, pubServiceUnderTest);
            })) {
                hasDuplicate = true;
                duplicatePubServices.push({
                    dataPath: "/publishingServices/".concat(index),
                    description: 'should NOT have duplicate entry',
                    keyword: 'duplicate',
                    params: {
                        duplicateObject: pubServiceUnderTest
                    },
                    schemaPath: '#/publishingServices'
                });
            }
            else {
                uniqValues.push(pubServiceUnderTest);
            }
        });
        if (hasDuplicate) {
            throw new AppError_1.AppError('Duplicate entries in the mapping data.', 400, duplicatePubServices);
        }
        return true;
    };
    return JournalPubServiceMapValidator;
}());
exports.journalPubServiceMapValidator = new JournalPubServiceMapValidator();
