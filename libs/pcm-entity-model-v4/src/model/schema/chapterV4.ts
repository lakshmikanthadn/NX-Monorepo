import mongoose = require('mongoose');

import { ProductSchemaProperties, schemaOptions } from './productV4';
import {
  AbstractSchema,
  CopyrightSchema,
  FundingGroupSchema,
  LicenseSchema
} from './sharedSchemaV4';

// ChapterBookMetaData or ChapterPublishingItem
const ChapterBookMetaData = new mongoose.Schema(
  {
    abstracts: { type: [AbstractSchema] },
    citation: { type: String },
    copyright: { required: true, type: CopyrightSchema },
    description: { type: String },
    doiRegistrationStatus: { type: Boolean },
    edition: { type: Number },
    firstPublishedYear: { type: Number },
    firstPublishedYearNumber: { type: Number },
    fundingGroups: { type: [FundingGroupSchema] },
    inLanguage: { required: true, type: String },
    label: { type: String },
    license: { type: LicenseSchema },
    pageEnd: { type: Number },
    pageStart: { type: Number },
    plannedPublicationDate: { required: true, type: Date },
    publicationDate: { type: Date },
    publisherImprint: { required: true, type: String },
    subtitle: { type: String }
  },
  { _id: false }
);

export const Chapter: mongoose.Schema = new mongoose.Schema(
  {
    ...ProductSchemaProperties,
    chapter: { required: true, type: ChapterBookMetaData }
  },
  schemaOptions
);
