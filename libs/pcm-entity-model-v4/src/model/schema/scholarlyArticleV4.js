"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScholarlyArticle = void 0;
const mongoose = require("mongoose");
const productV4_1 = require("./productV4");
const sharedSchemaV4_1 = require("./sharedSchemaV4");
const Stage = new mongoose.Schema({
    _id: { type: String },
    type: { type: String }
}, { _id: false });
const Dates = new mongoose.Schema({
    manuscriptAccepted: { type: String },
    manuscriptReceived: { type: String },
    manuscriptRevised: { type: String },
    publishedOnline: { type: String },
    publishedPrint: { type: Date }
}, { _id: false });
const ScholarlyArticlePublishingItem = new mongoose.Schema({
    // graphicalAbstract: { type: String },
    // mediaAbstract: { type: String },
    abstracts: { type: [sharedSchemaV4_1.AbstractSchema] },
    articleSection: { type: String },
    articleType: { type: String },
    copyright: { required: true, type: sharedSchemaV4_1.CopyrightSchema },
    counts: { type: [sharedSchemaV4_1.CountSchema] },
    currentVersion: { type: String },
    dataAvailability: { type: Boolean },
    dates: { type: Dates },
    description: { type: String },
    fundingGroups: { type: [sharedSchemaV4_1.FundingGroupSchema] },
    inLanguage: { required: true, type: String },
    license: { type: sharedSchemaV4_1.LicenseSchema },
    orderInIssue: { type: Number },
    pageEnd: { type: Number },
    pageStart: { type: Number },
    publicationDate: { type: Date },
    publisherImprint: { required: true, type: String },
    stages: { type: [Stage] },
    subtitle: { type: String }
}, { _id: false });
exports.ScholarlyArticle = new mongoose.Schema(Object.assign(Object.assign({}, productV4_1.ProductSchemaProperties), { scholarlyArticle: { required: true, type: ScholarlyArticlePublishingItem } }), productV4_1.schemaOptions);
