"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationConfiguration = void 0;
const mongoose = require("mongoose");
exports.ValidationConfiguration = new mongoose.Schema({
    _id: { type: String },
    description: { type: String },
    group: { type: String },
    messageText: { type: String },
    name: { type: String },
    severity: { type: String },
    type: { type: String }
});
