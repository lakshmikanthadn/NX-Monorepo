"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Taxonomy = void 0;
const mongoose = require("mongoose");
const productV4_1 = require("./productV4");
exports.Taxonomy = new mongoose.Schema({
    _id: { type: String },
    assetType: { enum: productV4_1.ProductTypeEnumValues, type: String },
    code: { type: String },
    level: { type: Number },
    name: { type: String },
    parentId: { type: String },
    status: { enum: ['active', 'inactive'], type: String },
    type: { enum: ['subject'], type: String }
});
