import mongoose = require('mongoose');
import { ContributorSchema, IsPartOfSchema, schemaOptions } from './productV4';

const Chapter = new mongoose.Schema({
  status: { type: String },
  subtitle: { type: String }
});

export const preChapter = new mongoose.Schema(
  {
    _id: { type: String },
    chapter: Chapter,
    contributors: [ContributorSchema],
    isPartOf: [IsPartOfSchema],
    title: { type: String }
  },
  schemaOptions
);
