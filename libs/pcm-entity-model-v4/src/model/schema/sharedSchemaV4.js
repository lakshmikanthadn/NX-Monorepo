"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContributorIdentifier = exports.ProductIdentifier = exports.FundingGroupSchema = exports.LicenseSchema = exports.AssetIdentifier = exports.SourceSchema = exports.ProductSourceEnumValues = exports.CountSchema = exports.CopyrightSchema = exports.FormerImprintSchema = exports.AbstractSchema = void 0;
const mongoose = require("mongoose");
exports.AbstractSchema = new mongoose.Schema({
    location: { type: String },
    source: { type: String },
    type: { required: true, type: String },
    value: { type: String }
}, { _id: false });
exports.FormerImprintSchema = new mongoose.Schema({
    code: { required: true, type: String },
    description: { required: true, type: String }
}, { _id: false });
exports.CopyrightSchema = new mongoose.Schema({
    holder: { required: true, type: String },
    statement: { type: String },
    year: { required: true, type: Number }
}, { _id: false });
const MediaTypeCountSchema = new mongoose.Schema({
    count: { type: Number },
    mediaType: { type: String }
}, { _id: false });
exports.CountSchema = new mongoose.Schema({
    count: { required: true, type: Number },
    mediaTypeCount: { type: [MediaTypeCountSchema] },
    type: { required: true, type: String }
}, { _id: false });
exports.ProductSourceEnumValues = [
    'HUB',
    'CMS',
    'MBS',
    'WEBCMS',
    'SALESFORCE',
    'DARTS'
];
exports.SourceSchema = new mongoose.Schema({
    source: { enum: exports.ProductSourceEnumValues, required: true, type: String },
    type: { required: true, type: String }
}, { _id: false });
exports.AssetIdentifier = new mongoose.Schema({
    acquisitionIsbn: { type: String },
    articleId: { type: String },
    businessId: { type: String },
    collectionId: { type: String },
    dacKey: { type: String },
    doi: { type: String },
    dxIsbn: { type: String },
    eLocationId: { type: String },
    editionId: { type: String },
    epubIsbn: { type: String },
    isbn: { type: String },
    isbn10: { type: String },
    journalId: { type: String },
    mobiIsbn: { type: String },
    msrIsbn: { type: String },
    orderNumber: { type: String },
    productId: { type: String },
    webPdfIsbn: { type: String }
}, { _id: false });
exports.LicenseSchema = new mongoose.Schema({
    description: { type: String },
    location: { required: true, type: String },
    type: { type: String }
}, { _id: false });
const AwardGroupDetailSchema = new mongoose.Schema({
    name: { required: true, type: String },
    value: { required: true, type: String }
}, { _id: false });
exports.FundingGroupSchema = new mongoose.Schema({
    awardGroupDetails: { type: [AwardGroupDetailSchema] },
    fundingStatement: { type: String }
}, { _id: false });
exports.ProductIdentifier = new mongoose.Schema({
    isbn: { type: String }
}, { _id: false });
exports.ContributorIdentifier = new mongoose.Schema({
    gtId: { type: String }
}, { _id: false });
