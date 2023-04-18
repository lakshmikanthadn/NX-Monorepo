import mongoose = require('mongoose');
import { ProductTypeEnumValues, schemaOptions } from './productV4';
import { AssetIdentifier, SourceSchema } from './sharedSchemaV4';

export const Asset: mongoose.Schema = new mongoose.Schema(
  {
    _id: { required: true, type: String },
    _sources: { type: [SourceSchema] },
    identifier: { required: true, type: AssetIdentifier },
    type: {
      enum: ProductTypeEnumValues,
      required: true,
      type: String
    }
  },
  schemaOptions
);
