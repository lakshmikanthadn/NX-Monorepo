"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Journal = exports.LifetimeSchema = void 0;
const mongoose = require("mongoose");
const productV4_1 = require("./productV4");
const sharedSchemaV4_1 = require("./sharedSchemaV4");
exports.LifetimeSchema = new mongoose.Schema({
    active: { type: Boolean },
    changeDate: { type: String },
    changeEvent: { type: String },
    fromJournal: { type: [String] },
    toJournal: { type: [String] }
}, { _id: false });
// JournalMetaData
const JournalMetaData = new mongoose.Schema({
    abstracts: { type: [sharedSchemaV4_1.AbstractSchema] },
    acronym: { type: String },
    citation: { type: String },
    copyright: { type: sharedSchemaV4_1.CopyrightSchema },
    description: { type: String },
    doiRegistrationStatus: { type: Boolean },
    edition: { type: Number },
    endVolume: { type: String },
    firstPublishedYear: { type: Number },
    inLanguage: { type: String },
    lifetime: { type: exports.LifetimeSchema },
    ownership: { type: String },
    plannedPublicationDate: { type: Date },
    publicationDate: { type: Date },
    publisherImprint: { type: String },
    startVolume: { type: String },
    status: { type: String },
    subtitle: { type: String }
}, { _id: false });
exports.Journal = new mongoose.Schema(Object.assign(Object.assign({}, productV4_1.ProductSchemaProperties), { journal: { required: true, type: JournalMetaData } }), productV4_1.schemaOptions);
