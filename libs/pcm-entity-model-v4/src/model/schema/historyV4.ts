import mongoose = require('mongoose');

export const historySchema = new mongoose.Schema({
  comments: { type: String },
  journalCode: { type: String },
  submissionId: { type: String },
  submissionSource: { type: String },
  transferDate: { type: Date }
});
