import mongoose = require('mongoose');

import { ProductSchemaProperties, schemaOptions } from './productV4';
import {
  AbstractSchema,
  CopyrightSchema,
  CountSchema,
  FormerImprintSchema
} from './sharedSchemaV4';

const BibliographicSpecification = new mongoose.Schema(
  {
    format: { type: String },
    height: { type: String },
    weight: { type: String },
    width: { type: String }
  },
  { _id: false }
);

const ProductionSpecification = new mongoose.Schema(
  {
    basicColor: { type: String }
  },
  { _id: false }
);

// SetMetaData or SetPublishingItem
const SetMetaData = new mongoose.Schema(
  {
    abstracts: { type: [AbstractSchema] },
    bibliographicSpecification: { type: BibliographicSpecification },
    bindingStyle: { type: String },
    bindingStyleCode: { type: String },
    citation: { type: String },
    copyright: { type: CopyrightSchema },
    counts: { type: [CountSchema] },
    description: { type: String },
    division: { type: String },
    divisionCode: { type: String },
    doiRegistrationStatus: { type: Boolean },
    edition: { type: Number },
    firstPublishedYear: { type: Number },
    firstPublishedYearNumber: { type: Number },
    format: { type: String },
    formatCode: { type: String },
    formerImprints: { type: [FormerImprintSchema] },
    impressionNo: { type: Number },
    inLanguage: { type: String },
    legacyDivision: { type: String },
    legalOwner: { type: String },
    plannedPublicationDate: { type: Date },
    productionSpecification: { type: ProductionSpecification },
    publicationDate: { type: Date },
    publicationLocation: { type: String },
    publisherArea: { type: String },
    publisherAreaCode: { type: String },
    publisherImprint: { type: String },
    shortTitle: { type: String },
    status: { type: String },
    statusCode: { type: String },
    subtitle: { type: String },
    textType: { type: String },
    textTypeCode: { type: String },
    toc: { type: String }
  },
  { _id: false }
);

export const Set: mongoose.Schema = new mongoose.Schema(
  {
    ...ProductSchemaProperties,
    set: { required: true, type: SetMetaData }
  },
  schemaOptions
);
