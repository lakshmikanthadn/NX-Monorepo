import { Schema } from 'mongoose';

export const ClassificationFamilyEnum = ['rom', 'pcm', 'ubw', 'hobs'] as const;
export const ClassificationTypeEnum = [
  'region',
  'subject',
  'period',
  'keyword',
  'notable-figure',
  'web'
] as const;

export const ClassificationSchema: Schema = new Schema({
  _createdDate: { default: Date.now(), type: Date },
  _id: Number,
  _modifiedDate: { default: Date.now(), type: Date },
  _source: String,
  classificationFamily: {
    enum: ClassificationFamilyEnum,
    required: true,
    type: String
  },
  classificationType: {
    enum: ClassificationTypeEnum,
    required: true,
    type: String
  },
  code: String,
  level: Number,
  name: {
    required: true,
    type: String
  },
  network: [Number],
  parentId: Number,
  status: String
});
