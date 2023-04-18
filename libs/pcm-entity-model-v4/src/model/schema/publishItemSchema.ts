import mongoose = require('mongoose');
import { publishingItemTypeEnum } from '../common/enum/hubEnums';

const IngestedItemSchema = new mongoose.Schema(
  {
    hasErrors: { type: Boolean },
    ingestedItemId: { type: String },
    type: { type: String }
  },
  {
    _id: false
  }
);

const RelatedItemSchema = new mongoose.Schema(
  {
    epubIsbn: { type: String },
    mobiIsbn: { type: String },
    type: {
      enum: publishingItemTypeEnum,
      required: true,
      type: String
    },
    webPdfIsbn: { type: String }
  },
  {
    _id: false
  }
);

export const PublishingItem: mongoose.Schema = new mongoose.Schema({
  _id: { required: true, type: String },
  bookFormat: { type: String },
  contentUpdateAllowed: { type: Boolean },
  dac: { type: String },
  doi: { type: String },
  entryDoi: { type: String },
  familyCrossValidationResult: { type: String },
  isbn: { type: String },
  issueId: { type: String },
  journalAcronym: { type: String },
  journalId: { type: String },
  latestCrossValidationResult: { type: String },
  latestIngestedItems: [{ type: IngestedItemSchema }],
  relatedItems: { type: RelatedItemSchema },
  stage: { type: String },
  status: { type: String },
  type: {
    enum: publishingItemTypeEnum,
    required: true,
    type: String
  },
  validIngestedItems: [{ type: IngestedItemSchema }],
  volume: { type: String }
});
