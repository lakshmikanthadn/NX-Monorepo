"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.journalSchema = void 0;
const mongoose = require("mongoose");
exports.journalSchema = new mongoose.Schema({
    doi: { type: String },
    electronicIssn: { type: Date },
    journalAcronym: { type: String },
    printIssn: { type: String },
    siteName: { type: String },
    subtitle: { type: String },
    title: { type: String }
});
