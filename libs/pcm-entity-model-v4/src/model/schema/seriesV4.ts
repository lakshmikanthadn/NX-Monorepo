import mongoose = require('mongoose');

import { ProductSchemaProperties, schemaOptions } from './productV4';
import { AbstractSchema, CopyrightSchema, CountSchema } from './sharedSchemaV4';

// SeriesMetaData or SeriesPublishingItem
const SeriesMetaData = new mongoose.Schema(
  {
    abstracts: { type: [AbstractSchema] },
    citation: { type: String },
    copyright: { type: CopyrightSchema },
    counts: { type: [CountSchema] },
    description: { type: String },
    division: { type: String },
    divisionCode: { type: String },
    doiRegistrationStatus: { type: Boolean },
    edition: { type: Number },
    firstPublishedYear: { type: Number },
    format: { type: String },
    formatCode: { type: String },
    inLanguage: { type: String },
    legalOwner: { type: String },
    plannedPublicationDate: { type: Date },
    publicationDate: { type: Date },
    publicationLocation: { type: String },
    publisherArea: { type: String },
    publisherAreaCode: { type: String },
    publisherImprint: { type: String },
    shortTitle: { type: String },
    status: { type: String },
    statusCode: { type: String },
    subtitle: { type: String }
  },
  { _id: false }
);

export const Series: mongoose.Schema = new mongoose.Schema(
  {
    ...ProductSchemaProperties,
    series: { required: true, type: SeriesMetaData }
  },
  schemaOptions
);
