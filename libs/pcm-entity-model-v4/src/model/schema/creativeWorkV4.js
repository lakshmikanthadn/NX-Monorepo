"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreativeWork = exports.CreativeWorkFormatEnum = void 0;
const mongoose = require("mongoose");
const productV4_1 = require("./productV4");
const sharedSchemaV4_1 = require("./sharedSchemaV4");
exports.CreativeWorkFormatEnum = [
    'video',
    'hyperlink',
    'document',
    'presentation',
    'image',
    'portableDocument',
    'audio',
    'database',
    'archive',
    'spreadsheet',
    'html'
];
const CreativeWorkMetadata = new mongoose.Schema({
    abstracts: { type: [sharedSchemaV4_1.AbstractSchema] },
    copyright: { required: true, type: sharedSchemaV4_1.CopyrightSchema },
    description: { type: String },
    firstPublishedYear: { type: Number },
    format: { enum: exports.CreativeWorkFormatEnum, required: true, type: String },
    inLanguage: { required: true, type: String },
    plannedPublicationDate: { required: true, type: Date },
    publicationDate: { type: Date },
    publisherImprint: { required: true, type: String },
    subtitle: { type: String }
}, { _id: false });
exports.CreativeWork = new mongoose.Schema(Object.assign(Object.assign({}, productV4_1.ProductSchemaProperties), { creativeWork: { required: true, type: CreativeWorkMetadata } }), productV4_1.schemaOptions);
