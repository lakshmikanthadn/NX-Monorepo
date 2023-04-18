"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chapter = void 0;
const mongoose = require("mongoose");
const productV4_1 = require("./productV4");
const sharedSchemaV4_1 = require("./sharedSchemaV4");
// ChapterBookMetaData or ChapterPublishingItem
const ChapterBookMetaData = new mongoose.Schema({
    abstracts: { type: [sharedSchemaV4_1.AbstractSchema] },
    citation: { type: String },
    copyright: { required: true, type: sharedSchemaV4_1.CopyrightSchema },
    description: { type: String },
    doiRegistrationStatus: { type: Boolean },
    edition: { type: Number },
    firstPublishedYear: { type: Number },
    firstPublishedYearNumber: { type: Number },
    fundingGroups: { type: [sharedSchemaV4_1.FundingGroupSchema] },
    inLanguage: { required: true, type: String },
    label: { type: String },
    license: { type: sharedSchemaV4_1.LicenseSchema },
    pageEnd: { type: Number },
    pageStart: { type: Number },
    plannedPublicationDate: { required: true, type: Date },
    publicationDate: { type: Date },
    publisherImprint: { required: true, type: String },
    subtitle: { type: String }
}, { _id: false });
exports.Chapter = new mongoose.Schema(Object.assign(Object.assign({}, productV4_1.ProductSchemaProperties), { chapter: { required: true, type: ChapterBookMetaData } }), productV4_1.schemaOptions);
