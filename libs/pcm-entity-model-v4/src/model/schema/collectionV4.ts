import mongoose = require('mongoose');

import { ProductSchemaProperties, schemaOptions } from './productV4';
import { AbstractSchema, CopyrightSchema, CountSchema } from './sharedSchemaV4';

// const Attribute = new mongoose.Schema({
//     name: { type: String },
//     position: { type: Number },
// }, { _id: false });

// const RulePart = new mongoose.Schema({
//     attribute: { type: String },
//     relationship: { type: String },
//     value: { type: String },
//     values: { type: [String] },
// }, { _id: false });

// const ProductRule = new mongoose.Schema({
//     position: { type: Number },
//     rulePart: { type: RulePart },
//     type: { type: String },
// }, { _id: false });

// const Rule = new mongoose.Schema({
//     attributes: { type: [Attribute] },
//     rule: { type: [ProductRule] },
//     ruleString: { type: String },
//     type: { type: String },
// }, { _id: false });

// CollectionMetaData or CollectionPublishingItem
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CollectionMetaData = new mongoose.Schema(
  {
    abstracts: { type: [AbstractSchema] },
    copyright: { type: CopyrightSchema },
    counts: { type: [CountSchema] },
    description: { type: String },
    firstPublishedYear: { type: Number },
    inLanguage: { type: String },
    plannedPublicationDate: { type: Date },
    publicationDate: { type: Date },
    publisherImprint: { type: String },
    // This is for Dynamic collection so commenting for now.
    // rules: { type: [Rule] },
    subtitle: { type: String },
    updatedFrom: { type: Date },
    updatedTo: { type: Date },
    validFrom: { type: Date },
    validTo: { type: Date }
  },
  { _id: false }
);

export const Collection: mongoose.Schema = new mongoose.Schema(
  {
    ...ProductSchemaProperties
    // We can not use collection as a key in the mongoose
    // https://mongoosejs.com/docs/api.html#schema_Schema.reserved
    // collection: { type: CollectionMetaData, required: true },
  },
  schemaOptions
);

export const CollectionRevision: mongoose.Schema = new mongoose.Schema(
  {
    ...ProductSchemaProperties,
    // We can not use collection as a key in the mongoose
    // https://mongoosejs.com/docs/api.html#schema_Schema.reserved
    // collection: { type: CollectionMetaData, required: true },
    parentId: { required: true, type: String },
    revision: { type: Number }
  },
  schemaOptions
);
