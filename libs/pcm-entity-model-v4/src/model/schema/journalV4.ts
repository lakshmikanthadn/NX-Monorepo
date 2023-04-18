import mongoose = require('mongoose');

export const journalSchema = new mongoose.Schema({
  doi: { type: String },
  electronicIssn: { type: Date },
  journalAcronym: { type: String },
  printIssn: { type: String },
  siteName: { type: String },
  subtitle: { type: String },
  title: { type: String }
});
