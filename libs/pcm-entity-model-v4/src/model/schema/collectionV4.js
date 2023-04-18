"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionRevision = exports.Collection = void 0;
const mongoose = require("mongoose");
const productV4_1 = require("./productV4");
const sharedSchemaV4_1 = require("./sharedSchemaV4");
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
const CollectionMetaData = new mongoose.Schema({
    abstracts: { type: [sharedSchemaV4_1.AbstractSchema] },
    copyright: { type: sharedSchemaV4_1.CopyrightSchema },
    counts: { type: [sharedSchemaV4_1.CountSchema] },
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
}, { _id: false });
exports.Collection = new mongoose.Schema(Object.assign({}, productV4_1.ProductSchemaProperties
// We can not use collection as a key in the mongoose
// https://mongoosejs.com/docs/api.html#schema_Schema.reserved
// collection: { type: CollectionMetaData, required: true },
), productV4_1.schemaOptions);
exports.CollectionRevision = new mongoose.Schema(Object.assign(Object.assign({}, productV4_1.ProductSchemaProperties), { 
    // We can not use collection as a key in the mongoose
    // https://mongoosejs.com/docs/api.html#schema_Schema.reserved
    // collection: { type: CollectionMetaData, required: true },
    parentId: { required: true, type: String }, revision: { type: Number } }), productV4_1.schemaOptions);
