import mongoose = require('mongoose');

import { ProductSchemaProperties, schemaOptions } from './productV4';
import { historySchema } from './historyV4';
import { journalSchema } from './journalV4';
import {
  AbstractSchema,
  CopyrightSchema,
  CountSchema,
  FundingGroupSchema,
  LicenseSchema
} from './sharedSchemaV4';

const Stage = new mongoose.Schema(
  {
    _id: { type: String },
    type: { type: String }
  },
  { _id: false }
);

const Dates = new mongoose.Schema(
  {
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
  },
  { _id: false }
);

const ScholarlyArticlePublishingItem = new mongoose.Schema(
  {
    // graphicalAbstract: { type: String },
    // mediaAbstract: { type: String },
    abstracts: { type: [AbstractSchema] },
    archiveStatus: { type: String },
    articleCategory: { type: String },
    articleSection: { type: String },
    articleType: { type: String },
    copyright: { required: true, type: CopyrightSchema },
    counts: { type: [CountSchema] },
    currentVersion: { type: String },
    dataAvailability: { type: Boolean },
    dates: { type: Dates },
    decisionFinal: { type: String },
    decisionName: { type: String },
    decisionType: { type: String },
    description: { type: String },
    fundingGroups: { type: [FundingGroupSchema] },
    inDraft: { type: String },
    inLanguage: { required: true, type: String },
    journal: { type: journalSchema },
    license: { type: LicenseSchema },
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
  },
  { _id: false }
);
const TransferPublishingItem = new mongoose.Schema({
  history: { type: [historySchema] },
  rejectionDate: { type: String },
  rejectionReason: { type: String },
  status: { type: String },
  transferSubmissionId: { type: String },
  transfersOffered: { type: Array },
  validFrom: { type: String },
  validTill: { type: String }
});

export const PreArticle: mongoose.Schema = new mongoose.Schema(
  {
    ...ProductSchemaProperties,
    scholarlyArticle: { required: true, type: ScholarlyArticlePublishingItem },
    transfer: { required: true, type: TransferPublishingItem }
  },
  schemaOptions
);
