import mongoose = require('mongoose');
import { CreativeWorkFormatEnum } from './creativeWorkV4';
import { schemaOptions } from './productV4';

const HasPart: mongoose.Schema = new mongoose.Schema(
  {
    _id: { type: String },
    curationSource: { type: String },
    format: { enum: CreativeWorkFormatEnum, type: String },
    isFree: { type: Boolean },
    level: { type: Number },
    pageEnd: { type: String },
    pageStart: { type: String },
    parentId: { type: String },
    position: { type: Number },
    title: { type: Number },
    type: { type: String },
    version: { type: String }
  },
  { _id: false }
);
const partsinfo: mongoose.Schema = new mongoose.Schema({
  _id: { type: String },
  type: { type: String }
});

export const Part: mongoose.Schema = new mongoose.Schema(
  {
    _id: { type: String },
    _schemaVersion: { type: String },
    parts: [HasPart],
    version: { type: String }
  },
  schemaOptions
);

export const PartRevision: mongoose.Schema = new mongoose.Schema(
  {
    _id: { type: String },
    _schemaVersion: { type: String },
    parentId: { required: true, type: String },
    parts: [HasPart],
    partsAdded: [partsinfo],
    partsRemoved: [partsinfo],
    partsUpdated: [partsinfo],
    version: { type: String }
  },
  schemaOptions
);
