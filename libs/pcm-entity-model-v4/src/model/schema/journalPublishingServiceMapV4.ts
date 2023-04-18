import mongoose = require('mongoose');

import { schemaOptions } from './productV4';

const ClassificationSchema = new mongoose.Schema(
  {
    name: { required: true, type: String },
    type: { required: true, type: String }
  },
  { _id: false }
);

export const PublishingServicesSchema = new mongoose.Schema({
  _id: { type: String },
  classification: { type: ClassificationSchema },
  validFrom: { type: Date },
  validTo: { type: Date }
});

export const JournalPublishingServiceMap: mongoose.Schema = new mongoose.Schema(
  {
    _createdDate: { type: Date },
    _id: { required: true, type: String },
    _updatedDate: { type: Date },
    publishingServices: { required: true, type: [PublishingServicesSchema] }
  },
  schemaOptions
);
