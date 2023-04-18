"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreArticle = void 0;
const mongoose = require("mongoose");
const productV4_1 = require("./productV4");
const historyV4_1 = require("./historyV4");
const journalV4_1 = require("./journalV4");
const sharedSchemaV4_1 = require("./sharedSchemaV4");
const Stage = new mongoose.Schema({
    _id: { type: String },
    type: { type: String }
}, { _id: false });
const Dates = new mongoose.Schema({
    archiveDate: { type: String },
    dataCollectionDate: { type: String },
    decisionDate: { type: String },
    estimatedDecisionDate: { type: String },
    firstDecisionDate: { type: String },
    manuscriptAccepted: { type: String },
    manuscriptEntered: { type: String },
    manuscriptReceived: { type: String },
    manuscriptRevised: { type: String },
    publishedOnline: { type: String },
    publishedPrint: { type: Date },
    revisionDueDate: { type: String },
    versionSubmissionDate: { type: String },
    withdrawnDate: { type: String }
}, { _id: false });
const ScholarlyArticlePublishingItem = new mongoose.Schema({
    // graphicalAbstract: { type: String },
    // mediaAbstract: { type: String },
    abstracts: { type: [sharedSchemaV4_1.AbstractSchema] },
    archiveStatus: { type: String },
    articleCategory: { type: String },
    articleSection: { type: String },
    articleType: { type: String },
    copyright: { required: true, type: sharedSchemaV4_1.CopyrightSchema },
    counts: { type: [sharedSchemaV4_1.CountSchema] },
    currentVersion: { type: String },
    dataAvailability: { type: Boolean },
    dates: { type: Dates },
    decisionFinal: { type: String },
    decisionName: { type: String },
    decisionType: { type: String },
    description: { type: String },
    fundingGroups: { type: [sharedSchemaV4_1.FundingGroupSchema] },
    inDraft: { type: String },
    inLanguage: { required: true, type: String },
    journal: { type: journalV4_1.journalSchema },
    license: { type: sharedSchemaV4_1.LicenseSchema },
    orderInIssue: { type: Number },
    pageEnd: { type: Number },
    pageStart: { type: Number },
    previousSubmissionId: { type: String },
    prs: { type: String },
    publicationDate: { type: Date },
    publisherImprint: { required: true, type: String },
    stage: { type: String },
    stages: { type: [Stage] },
    submissionSource: { type: String },
    submissionType: { type: String },
    subtitle: { type: String }
}, { _id: false });
const TransferPublishingItem = new mongoose.Schema({
    history: { type: [historyV4_1.historySchema] },
    rejectionDate: { type: String },
    rejectionReason: { type: String },
    status: { type: String },
    transferSubmissionId: { type: String },
    transfersOffered: { type: Array },
    validFrom: { type: String },
    validTill: { type: String }
});
exports.PreArticle = new mongoose.Schema(Object.assign(Object.assign({}, productV4_1.ProductSchemaProperties), { scholarlyArticle: { required: true, type: ScholarlyArticlePublishingItem }, transfer: { required: true, type: TransferPublishingItem } }), productV4_1.schemaOptions);
