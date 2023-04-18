"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.historySchema = void 0;
const mongoose = require("mongoose");
exports.historySchema = new mongoose.Schema({
    comments: { type: String },
    journalCode: { type: String },
    submissionId: { type: String },
    submissionSource: { type: String },
    transferDate: { type: Date }
});
