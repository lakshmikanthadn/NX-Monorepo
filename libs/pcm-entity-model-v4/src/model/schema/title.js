"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Title = void 0;
const mongoose = require("mongoose");
const Format = new mongoose.Schema({
    bookId: { type: String },
    createdDate: { type: Date },
    format: { type: String },
    isbn: { type: String },
    modifiedDate: { type: Date },
    status: { type: String }
}, { _id: false });
const Edition = new mongoose.Schema({
    createdDate: { type: Date },
    dacKey: { type: String },
    doi: { type: String },
    edition: { type: String },
    formats: { type: [Format] },
    modifiedDate: { type: Date }
}, { _id: false });
exports.Title = new mongoose.Schema({
    _id: { type: String },
    editions: { type: [Edition] },
    publisherImprint: { type: String },
    source: { type: String },
    title: { type: String },
    titleId: { type: String }
});
