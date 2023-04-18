"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Asset = void 0;
const mongoose = require("mongoose");
const productV4_1 = require("./productV4");
const sharedSchemaV4_1 = require("./sharedSchemaV4");
exports.Asset = new mongoose.Schema({
    _id: { required: true, type: String },
    _sources: { type: [sharedSchemaV4_1.SourceSchema] },
    identifier: { required: true, type: sharedSchemaV4_1.AssetIdentifier },
    type: {
        enum: productV4_1.ProductTypeEnumValues,
        required: true,
        type: String
    }
}, productV4_1.schemaOptions);
