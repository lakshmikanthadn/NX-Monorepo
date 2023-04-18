import mongoose = require('mongoose');

import { ProductSchemaProperties, schemaOptions } from './productV4';
import { AbstractSchema, CopyrightSchema } from './sharedSchemaV4';

export const LifetimeSchema = new mongoose.Schema(
  {
    active: { type: Boolean },
    changeDate: { type: String },
    changeEvent: { type: String },
    fromJournal: { type: [String] },
    toJournal: { type: [String] }
  },
  { _id: false }
);

// JournalMetaData
const JournalMetaData = new mongoose.Schema(
  {
    abstracts: { type: [AbstractSchema] },
    acronym: { type: String },
    citation: { type: String },
    copyright: { type: CopyrightSchema },
    description: { type: String },
    doiRegistrationStatus: { type: Boolean },
    edition: { type: Number },
    endVolume: { type: String },
    firstPublishedYear: { type: Number },
    inLanguage: { type: String },
    lifetime: { type: LifetimeSchema },
    ownership: { type: String },
    plannedPublicationDate: { type: Date },
    publicationDate: { type: Date },
    publisherImprint: { type: String },
    startVolume: { type: String },
    status: { type: String },
    subtitle: { type: String }
  },
  { _id: false }
);

export const Journal: mongoose.Schema = new mongoose.Schema(
  {
    ...ProductSchemaProperties,
    journal: { required: true, type: JournalMetaData }
  },
  schemaOptions
);
