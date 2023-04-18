"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishingService = exports.ServiceMetaDataSchema = void 0;
const mongoose = require("mongoose");
const publishingServiceStatus_1 = require("../common/enum/publishingServiceStatus");
const productV4_1 = require("./productV4");
exports.ServiceMetaDataSchema = new mongoose.Schema({
    description: { type: String },
    status: { enum: publishingServiceStatus_1.PublishingServiceStatusEnum, required: true, type: String },
    type: { type: String }
}, { _id: false });
exports.PublishingService = new mongoose.Schema(Object.assign(Object.assign({}, productV4_1.ProductSchemaProperties), { publishingService: { required: true, type: exports.ServiceMetaDataSchema } }), productV4_1.schemaOptions);
