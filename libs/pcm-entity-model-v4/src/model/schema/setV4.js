"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Set = void 0;
const mongoose = require("mongoose");
const productV4_1 = require("./productV4");
const sharedSchemaV4_1 = require("./sharedSchemaV4");
const BibliographicSpecification = new mongoose.Schema({
    format: { type: String },
    height: { type: String },
    weight: { type: String },
    width: { type: String }
}, { _id: false });
const ProductionSpecification = new mongoose.Schema({
    basicColor: { type: String }
}, { _id: false });
// SetMetaData or SetPublishingItem
const SetMetaData = new mongoose.Schema({
    abstracts: { type: [sharedSchemaV4_1.AbstractSchema] },
    bibliographicSpecification: { type: BibliographicSpecification },
    bindingStyle: { type: String },
    bindingStyleCode: { type: String },
    citation: { type: String },
    copyright: { type: sharedSchemaV4_1.CopyrightSchema },
    counts: { type: [sharedSchemaV4_1.CountSchema] },
    description: { type: String },
    division: { type: String },
    divisionCode: { type: String },
    doiRegistrationStatus: { type: Boolean },
    edition: { type: Number },
    firstPublishedYear: { type: Number },
    firstPublishedYearNumber: { type: Number },
    format: { type: String },
    formatCode: { type: String },
    formerImprints: { type: [sharedSchemaV4_1.FormerImprintSchema] },
    impressionNo: { type: Number },
    inLanguage: { type: String },
    legacyDivision: { type: String },
    legalOwner: { type: String },
    plannedPublicationDate: { type: Date },
    productionSpecification: { type: ProductionSpecification },
    publicationDate: { type: Date },
    publicationLocation: { type: String },
    publisherArea: { type: String },
    publisherAreaCode: { type: String },
    publisherImprint: { type: String },
    shortTitle: { type: String },
    status: { type: String },
    statusCode: { type: String },
    subtitle: { type: String },
    textType: { type: String },
    textTypeCode: { type: String },
    toc: { type: String }
}, { _id: false });
exports.Set = new mongoose.Schema(Object.assign(Object.assign({}, productV4_1.ProductSchemaProperties), { set: { required: true, type: SetMetaData } }), productV4_1.schemaOptions);
