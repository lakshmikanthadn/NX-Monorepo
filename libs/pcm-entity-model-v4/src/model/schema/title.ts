import mongoose = require('mongoose');

const Format: mongoose.Schema = new mongoose.Schema(
  {
    bookId: { type: String },
    createdDate: { type: Date },
    format: { type: String },
    isbn: { type: String },
    modifiedDate: { type: Date },
    status: { type: String }
  },
  { _id: false }
);

const Edition: mongoose.Schema = new mongoose.Schema(
  {
    createdDate: { type: Date },
    dacKey: { type: String },
    doi: { type: String },
    edition: { type: String },
    formats: { type: [Format] },
    modifiedDate: { type: Date }
  },
  { _id: false }
);

export const Title: mongoose.Schema = new mongoose.Schema({
  _id: { type: String },
  editions: { type: [Edition] },
  publisherImprint: { type: String },
  source: { type: String },
  title: { type: String },
  titleId: { type: String }
});
