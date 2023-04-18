import mongoose = require('mongoose');
import { ProductTypeEnumValues } from './productV4';

export const Taxonomy: mongoose.Schema = new mongoose.Schema({
  _id: { type: String },
  assetType: { enum: ProductTypeEnumValues, type: String },
  code: { type: String },
  level: { type: Number },
  name: { type: String },
  parentId: { type: String },
  status: { enum: ['active', 'inactive'], type: String },
  type: { enum: ['subject'], type: String }
});
