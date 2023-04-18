import mongoose = require('mongoose');

import { ProductSchemaProperties, schemaOptions } from './productV4';
import {
  AbstractSchema,
  CopyrightSchema,
  CountSchema,
  FormerImprintSchema,
  FundingGroupSchema,
  LicenseSchema
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

// BookMetaData or BookPublishingItem
const BookMetaData = new mongoose.Schema(
  {
    abstracts: { type: [AbstractSchema] },
    bibliographicSpecification: { type: BibliographicSpecification },
    bindingStyle: { required: true, type: String },
    bindingStyleCode: { required: true, type: String },
    citation: { type: String },
    copyright: { required: true, type: CopyrightSchema },
    counts: { type: [CountSchema] },
    description: { type: String },
    division: { type: String },
    divisionCode: { type: String },
    doiRegistrationStatus: { type: Boolean },
    edition: { type: Number },
    firstPublishedYear: { type: Number },
    firstPublishedYearNumber: { type: Number },
    format: { required: true, type: String },
    formatCode: { required: true, type: String },
    formerImprints: { type: [FormerImprintSchema] },
    fundingGroups: { type: [FundingGroupSchema] },
    inLanguage: { required: true, type: String },
    legacyDivision: { type: String },
    legalOwner: { type: String },
    license: { type: LicenseSchema },
    plannedPublicationDate: { required: true, type: Date },
    productionSpecification: { type: ProductionSpecification },
    publicationDate: { type: Date },
    publicationLocation: { type: String },
    publisherArea: { type: String },
    publisherAreaCode: { type: String },
    publisherImprint: { required: true, type: String },
    shortTitle: { type: String },
    status: { required: true, type: String },
    statusCode: { required: true, type: String },
    subtitle: { type: String },
    textType: { type: String },
    textTypeCode: { type: String },
    toc: { type: String }
  },
  { _id: false }
);

export const Book: mongoose.Schema = new mongoose.Schema(
  {
    ...ProductSchemaProperties,
    book: { required: true, type: BookMetaData }
  },
  schemaOptions
);
