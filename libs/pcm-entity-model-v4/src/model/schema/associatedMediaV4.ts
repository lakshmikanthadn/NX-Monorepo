import mongoose = require('mongoose');
import { schemaOptions } from './productV4';

export const AssociatedMedia: mongoose.Schema = new mongoose.Schema(
  {
    _id: { type: String },
    location: { type: String },
    parentId: { type: String },
    parentType: { type: String },
    size: { type: Number },
    type: { type: String },
    versionType: { type: String }
  },
  schemaOptions
);
