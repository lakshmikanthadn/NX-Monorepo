import mongoose = require('mongoose');

import { ProductSchemaProperties, schemaOptions } from './productV4';
import { AbstractSchema, CopyrightSchema } from './sharedSchemaV4';

export const CreativeWorkFormatEnum = [
  'video',
  'hyperlink',
  'document',
  'presentation',
  'image',
  'portableDocument',
  'audio',
  'database',
  'archive',
  'spreadsheet',
  'html'
];

const CreativeWorkMetadata = new mongoose.Schema(
  {
    abstracts: { type: [AbstractSchema] },
    copyright: { required: true, type: CopyrightSchema },
    description: { type: String },
    firstPublishedYear: { type: Number },
    format: { enum: CreativeWorkFormatEnum, required: true, type: String },
    inLanguage: { required: true, type: String },
    plannedPublicationDate: { required: true, type: Date },
    publicationDate: { type: Date },
    publisherImprint: { required: true, type: String },
    subtitle: { type: String }
  },
  { _id: false }
);

export const CreativeWork: mongoose.Schema = new mongoose.Schema(
  {
    ...ProductSchemaProperties,
    creativeWork: { required: true, type: CreativeWorkMetadata }
  },
  schemaOptions
);
