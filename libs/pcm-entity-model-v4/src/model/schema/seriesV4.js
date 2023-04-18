"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Series = void 0;
const mongoose = require("mongoose");
const productV4_1 = require("./productV4");
const sharedSchemaV4_1 = require("./sharedSchemaV4");
// SeriesMetaData or SeriesPublishingItem
const SeriesMetaData = new mongoose.Schema({
    abstracts: { type: [sharedSchemaV4_1.AbstractSchema] },
    citation: { type: String },
    copyright: { type: sharedSchemaV4_1.CopyrightSchema },
    counts: { type: [sharedSchemaV4_1.CountSchema] },
    description: { type: String },
    division: { type: String },
    divisionCode: { type: String },
    doiRegistrationStatus: { type: Boolean },
    edition: { type: Number },
    firstPublishedYear: { type: Number },
    format: { type: String },
    formatCode: { type: String },
    inLanguage: { type: String },
    legalOwner: { type: String },
    plannedPublicationDate: { type: Date },
    publicationDate: { type: Date },
    publicationLocation: { type: String },
    publisherArea: { type: String },
    publisherAreaCode: { type: String },
    publisherImprint: { type: String },
    shortTitle: { type: String },
    status: { type: String },
    statusCode: { type: String },
    subtitle: { type: String }
}, { _id: false });
exports.Series = new mongoose.Schema(Object.assign(Object.assign({}, productV4_1.ProductSchemaProperties), { series: { required: true, type: SeriesMetaData } }), productV4_1.schemaOptions);
