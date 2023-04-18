"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssociatedMedia = void 0;
const mongoose = require("mongoose");
const productV4_1 = require("./productV4");
exports.AssociatedMedia = new mongoose.Schema({
    _id: { type: String },
    location: { type: String },
    parentId: { type: String },
    parentType: { type: String },
    size: { type: Number },
    type: { type: String },
    versionType: { type: String }
}, productV4_1.schemaOptions);
