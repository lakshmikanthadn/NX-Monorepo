import mongoose = require('mongoose');

export const ValidationConfiguration: mongoose.Schema = new mongoose.Schema({
  _id: { type: String },
  description: { type: String },
  group: { type: String },
  messageText: { type: String },
  name: { type: String },
  severity: { type: String },
  type: { type: String }
});
