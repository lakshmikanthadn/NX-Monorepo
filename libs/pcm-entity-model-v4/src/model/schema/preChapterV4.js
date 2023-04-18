"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preChapter = void 0;
const mongoose = require("mongoose");
const productV4_1 = require("./productV4");
const Chapter = new mongoose.Schema({
    status: { type: String },
    subtitle: { type: String }
});
exports.preChapter = new mongoose.Schema({
    _id: { type: String },
    chapter: Chapter,
    contributors: [productV4_1.ContributorSchema],
    isPartOf: [productV4_1.IsPartOfSchema],
    title: { type: String }
}, productV4_1.schemaOptions);
