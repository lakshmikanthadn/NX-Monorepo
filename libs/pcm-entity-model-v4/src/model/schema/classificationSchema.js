"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassificationSchema = exports.ClassificationTypeEnum = exports.ClassificationFamilyEnum = void 0;
const mongoose_1 = require("mongoose");
exports.ClassificationFamilyEnum = ['rom', 'pcm', 'ubw', 'hobs'];
exports.ClassificationTypeEnum = [
    'region',
    'subject',
    'period',
    'keyword',
    'notable-figure',
    'web'
];
exports.ClassificationSchema = new mongoose_1.Schema({
    _createdDate: { default: Date.now(), type: Date },
    _id: Number,
    _modifiedDate: { default: Date.now(), type: Date },
    _source: String,
    classificationFamily: {
        enum: exports.ClassificationFamilyEnum,
        required: true,
        type: String
    },
    classificationType: {
        enum: exports.ClassificationTypeEnum,
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
