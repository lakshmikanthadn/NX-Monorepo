"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartRevision = exports.Part = void 0;
const mongoose = require("mongoose");
const creativeWorkV4_1 = require("./creativeWorkV4");
const productV4_1 = require("./productV4");
const HasPart = new mongoose.Schema({
    _id: { type: String },
    curationSource: { type: String },
    format: { enum: creativeWorkV4_1.CreativeWorkFormatEnum, type: String },
    isFree: { type: Boolean },
    level: { type: Number },
    pageEnd: { type: String },
    pageStart: { type: String },
    parentId: { type: String },
    position: { type: Number },
    title: { type: Number },
    type: { type: String },
    version: { type: String }
}, { _id: false });
const partsinfo = new mongoose.Schema({
    _id: { type: String },
    type: { type: String }
});
exports.Part = new mongoose.Schema({
    _id: { type: String },
    _schemaVersion: { type: String },
    parts: [HasPart],
    version: { type: String }
}, productV4_1.schemaOptions);
exports.PartRevision = new mongoose.Schema({
    _id: { type: String },
    _schemaVersion: { type: String },
    parentId: { required: true, type: String },
    parts: [HasPart],
    partsAdded: [partsinfo],
    partsRemoved: [partsinfo],
    partsUpdated: [partsinfo],
    version: { type: String }
}, productV4_1.schemaOptions);
