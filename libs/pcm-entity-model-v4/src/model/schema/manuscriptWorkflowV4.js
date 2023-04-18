"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManuscriptWorkflow = void 0;
const mongoose = require("mongoose");
const productV4_1 = require("./productV4");
const File = new mongoose.Schema({
    location: { type: String },
    type: { type: String }
}, { _id: false });
const Metadata = new mongoose.Schema({
    originalStatus: { type: String }
}, { _id: false });
const Stage = new mongoose.Schema({
    _id: { type: String },
    createdDate: { type: Date },
    files: { type: [File] },
    messageDate: { type: Date },
    metadata: { type: Metadata },
    source: { type: String },
    sourceFileName: { type: String },
    status: { type: String }
}, { _id: false });
const Identifiers = new mongoose.Schema({
    doi: { type: String },
    submissionId: { type: String },
    submissionSystemId: { type: String },
    submissionSystemIdLatest: { type: String }
}, { _id: false });
exports.ManuscriptWorkflow = new mongoose.Schema({
    _id: { type: String },
    identifiers: { type: Identifiers },
    stages: { type: [Stage] },
    version: { type: String }
}, productV4_1.schemaOptions);
