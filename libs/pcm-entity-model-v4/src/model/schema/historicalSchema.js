"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Historical = void 0;
const mongoose = require("mongoose");
const hubEnums_1 = require("../common/enum/hubEnums");
// this schema is related to the collections historical and historical-4.0.1
const IdentifiersSchema = new mongoose.Schema({
    dac: { type: String },
    doi: { type: String },
    isbn: { type: String },
    pubId: { type: String }
}, {
    _id: false
});
const MetadataSchema = new mongoose.Schema({
    copyrightYear: { type: Number },
    format: { type: String },
    status: { type: String },
    title: { type: String }
}, {
    _id: false
});
const EntriesSchema = new mongoose.Schema({
    _id: { type: String },
    code: { type: String },
    description: { type: String },
    group: { type: String },
    messageText: { type: String },
    messages: [{ type: String }],
    name: { type: String },
    passed: { type: Boolean },
    severity: { type: hubEnums_1.severityTypeEnum },
    type: { type: String },
    validationType: { type: String }
}, {
    _id: false
});
const ValidationResultsSchema = new mongoose.Schema({
    basicValidation: { type: String },
    crossValidation: { type: String },
    entries: [{ type: EntriesSchema }],
    familyValidation: { type: String },
    overallValidation: { type: Boolean }
}, {
    _id: false
});
exports.Historical = new mongoose.Schema({
    _id: { type: String },
    baseType: { type: hubEnums_1.publishingItemTypeEnum },
    createdDate: { type: Date },
    identifiers: { type: IdentifiersSchema },
    isLatest: { type: Boolean },
    metadata: { type: MetadataSchema },
    source: { type: String },
    type: { type: String },
    validationResults: { type: ValidationResultsSchema }
});
