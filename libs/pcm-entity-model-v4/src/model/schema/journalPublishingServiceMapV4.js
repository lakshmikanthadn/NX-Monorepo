"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JournalPublishingServiceMap = exports.PublishingServicesSchema = void 0;
const mongoose = require("mongoose");
const productV4_1 = require("./productV4");
const ClassificationSchema = new mongoose.Schema({
    name: { required: true, type: String },
    type: { required: true, type: String }
}, { _id: false });
exports.PublishingServicesSchema = new mongoose.Schema({
    _id: { type: String },
    classification: { type: ClassificationSchema },
    validFrom: { type: Date },
    validTo: { type: Date }
});
exports.JournalPublishingServiceMap = new mongoose.Schema({
    _createdDate: { type: Date },
    _id: { required: true, type: String },
    _updatedDate: { type: Date },
    publishingServices: { required: true, type: [exports.PublishingServicesSchema] }
}, productV4_1.schemaOptions);
