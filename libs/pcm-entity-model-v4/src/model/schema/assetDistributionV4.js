"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetDistributionSchema = void 0;
const mongoose = require("mongoose");
const AssetDistributionIdentifierSchema = new mongoose.Schema({
    collectionId: { type: String },
    dac: { type: String },
    doi: { type: String },
    isbn: { type: String }
}, { _id: false });
const DistributionSchema = new mongoose.Schema({
    assetType: { type: String },
    correlationId: { type: String },
    location: { type: String },
    messages: [{ type: String }],
    name: { type: String },
    stage: { type: String },
    status: { type: String },
    transferDate: { default: new Date(), type: Date }
}, { _id: false });
exports.AssetDistributionSchema = new mongoose.Schema({
    _id: { type: String },
    distribution: [{ type: DistributionSchema }],
    identifiers: { type: AssetDistributionIdentifierSchema },
    type: { type: String }
});
