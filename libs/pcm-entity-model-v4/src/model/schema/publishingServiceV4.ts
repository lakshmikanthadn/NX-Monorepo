import mongoose = require('mongoose');
import { PublishingServiceStatusEnum } from '../common/enum/publishingServiceStatus';

import { ProductSchemaProperties, schemaOptions } from './productV4';

export const ServiceMetaDataSchema = new mongoose.Schema(
  {
    description: { type: String },
    status: { enum: PublishingServiceStatusEnum, required: true, type: String },
    type: { type: String }
  },
  { _id: false }
);

export const PublishingService: mongoose.Schema = new mongoose.Schema(
  {
    ...ProductSchemaProperties,
    publishingService: { required: true, type: ServiceMetaDataSchema }
  },
  schemaOptions
);
