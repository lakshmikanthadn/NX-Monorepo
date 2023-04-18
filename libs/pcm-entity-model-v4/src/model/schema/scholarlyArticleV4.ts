import mongoose = require('mongoose');

import { ProductSchemaProperties, schemaOptions } from './productV4';
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
    manuscriptAccepted: { type: String },
    manuscriptReceived: { type: String },
    manuscriptRevised: { type: String },
    publishedOnline: { type: String },
    publishedPrint: { type: Date }
  },
  { _id: false }
);

const ScholarlyArticlePublishingItem = new mongoose.Schema(
  {
    // graphicalAbstract: { type: String },
    // mediaAbstract: { type: String },
    abstracts: { type: [AbstractSchema] },
    articleSection: { type: String },
    articleType: { type: String },
    copyright: { required: true, type: CopyrightSchema },
    counts: { type: [CountSchema] },
    currentVersion: { type: String },
    dataAvailability: { type: Boolean },
    dates: { type: Dates },
    description: { type: String },
    fundingGroups: { type: [FundingGroupSchema] },
    inLanguage: { required: true, type: String },
    license: { type: LicenseSchema },
    orderInIssue: { type: Number },
    pageEnd: { type: Number },
    pageStart: { type: Number },
    publicationDate: { type: Date },
    publisherImprint: { required: true, type: String },
    stages: { type: [Stage] },
    subtitle: { type: String }
  },
  { _id: false }
);

export const ScholarlyArticle: mongoose.Schema = new mongoose.Schema(
  {
    ...ProductSchemaProperties,
    scholarlyArticle: { required: true, type: ScholarlyArticlePublishingItem }
  },
  schemaOptions
);
