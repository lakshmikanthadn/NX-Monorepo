"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Book = void 0;
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
// BookMetaData or BookPublishingItem
const BookMetaData = new mongoose.Schema({
    abstracts: { type: [sharedSchemaV4_1.AbstractSchema] },
    bibliographicSpecification: { type: BibliographicSpecification },
    bindingStyle: { required: true, type: String },
    bindingStyleCode: { required: true, type: String },
    citation: { type: String },
    copyright: { required: true, type: sharedSchemaV4_1.CopyrightSchema },
    counts: { type: [sharedSchemaV4_1.CountSchema] },
    description: { type: String },
    division: { type: String },
    divisionCode: { type: String },
    doiRegistrationStatus: { type: Boolean },
    edition: { type: Number },
    firstPublishedYear: { type: Number },
    firstPublishedYearNumber: { type: Number },
    format: { required: true, type: String },
    formatCode: { required: true, type: String },
    formerImprints: { type: [sharedSchemaV4_1.FormerImprintSchema] },
    fundingGroups: { type: [sharedSchemaV4_1.FundingGroupSchema] },
    inLanguage: { required: true, type: String },
    legacyDivision: { type: String },
    legalOwner: { type: String },
    license: { type: sharedSchemaV4_1.LicenseSchema },
    plannedPublicationDate: { required: true, type: Date },
    productionSpecification: { type: ProductionSpecification },
    publicationDate: { type: Date },
    publicationLocation: { type: String },
    publisherArea: { type: String },
    publisherAreaCode: { type: String },
    publisherImprint: { required: true, type: String },
    shortTitle: { type: String },
    status: { required: true, type: String },
    statusCode: { required: true, type: String },
    subtitle: { type: String },
    textType: { type: String },
    textTypeCode: { type: String },
    toc: { type: String }
}, { _id: false });
exports.Book = new mongoose.Schema(Object.assign(Object.assign({}, productV4_1.ProductSchemaProperties), { book: { required: true, type: BookMetaData } }), productV4_1.schemaOptions);
