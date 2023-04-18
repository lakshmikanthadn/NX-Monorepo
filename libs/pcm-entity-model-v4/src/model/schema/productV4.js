"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductSchemaProperties = exports.ImpressionLocationSchema = exports.AvailabilitySchema = exports.IsPartOfSchema = exports.ContributorSchema = exports.schemaOptions = exports.ProductTypeEnumValues = void 0;
const mongoose = require("mongoose");
const currency_1 = require("../common/enum/currency");
const sharedSchemaV4_1 = require("./sharedSchemaV4");
exports.ProductTypeEnumValues = [
    'book',
    'chapter',
    'collection',
    'creativeWork',
    'scholarlyArticle',
    'set',
    'series',
    'journal',
    'publishingService',
    'promotional'
];
exports.schemaOptions = {
    timestamps: { createdAt: '_createdDate', updatedAt: '_modifiedDate' },
    versionKey: false
};
const Identifiers = new mongoose.Schema({
    articleId: { type: String },
    articleSectionId: { type: String },
    businessId: { type: String },
    chapterId: { type: String },
    code: { type: String },
    collectionId: { type: String },
    dacKey: { type: String },
    documentIdLatest: { type: String },
    doi: { type: String },
    editionId: { type: String },
    electronicIssn: { type: String },
    isbn: { type: String },
    journalId: { type: String },
    orderNumber: { type: String },
    printIssn: { type: String },
    productId: { type: String },
    publishingServiceId: { type: String },
    seriesCode: { type: String },
    sku: { type: String },
    submissionSystemIdLatest: { type: String },
    titleId: { type: String }
}, { _id: false });
const CategorySchema = new mongoose.Schema({
    code: { type: String },
    name: { required: true, type: String },
    type: { required: true, type: String }
}, { _id: false });
const ClassificationSchema = new mongoose.Schema({
    code: { type: String },
    group: { type: String },
    level: { type: Number },
    name: { required: true, type: String },
    priority: { type: Number },
    type: { required: true, type: String }
}, { _id: false });
const KeywordSchema = new mongoose.Schema({
    name: { required: true, type: String },
    position: { required: true, type: Number },
    type: { required: true, type: String },
    weightage: { type: Number }
}, { _id: false });
const AddressSchema = new mongoose.Schema({
    city: { type: String },
    country: { type: String },
    locality: { type: String },
    state: { type: String }
}, { _id: false });
const AffiliationSchema = new mongoose.Schema({
    address: { type: AddressSchema },
    department: { type: String },
    name: { required: true, type: String }
}, { _id: false });
exports.ContributorSchema = new mongoose.Schema({
    affiliations: { type: [AffiliationSchema] },
    bio: { type: String },
    collab: { type: String },
    email: { type: String },
    familyName: { type: String },
    fullName: { type: String },
    givenName: { type: String },
    identifiers: { type: sharedSchemaV4_1.ContributorIdentifier },
    orcid: { type: String },
    position: { required: true, type: Number },
    prefix: { type: String },
    roles: { required: true, type: [String] },
    suffix: { type: String }
}, { _id: false });
exports.IsPartOfSchema = new mongoose.Schema({
    _id: { required: true, type: String },
    identifiers: { type: sharedSchemaV4_1.AssetIdentifier },
    level: { type: Number },
    position: { type: Number },
    title: { type: String },
    type: { required: true, type: String }
}, { _id: false });
const IsRelatedToSchema = new mongoose.Schema({
    identifiers: { type: sharedSchemaV4_1.ProductIdentifier }
}, { _id: false });
const PriceSchema = new mongoose.Schema({
    currency: { enum: currency_1.CurrencyEnum, required: true, type: String },
    price: { required: true, type: Number },
    priceType: { required: true, type: String },
    priceTypeCode: { type: String },
    validFrom: { required: true, type: Date }
}, { _id: false });
const PermissionSchema = new mongoose.Schema({
    // TODO: code needs to be discussed with Sasi
    code: { type: String },
    description: { type: String },
    name: { required: true, type: String },
    text: { required: true, type: String },
    type: { required: true, type: String },
    validFrom: { type: Date },
    validTo: { type: Date }
}, { _id: false });
const AreaSchema = new mongoose.Schema({
    code: { type: String },
    name: { required: true, type: String }
}, { _id: false });
const RightSchema = new mongoose.Schema({
    area: { type: [AreaSchema] },
    category: { required: true, type: String },
    iso2: { required: true, type: String },
    iso3: { required: true, type: String },
    isonum: { required: true, type: String },
    name: { required: true, type: String },
    type: { required: true, type: String }
}, { _id: false });
const DiscountGroupSchema = new mongoose.Schema({
    code: { required: true, type: String },
    description: { required: true, type: String }
}, { _id: false });
const Audience = new mongoose.Schema({
    code: { required: true, type: String },
    description: { required: true, type: String }
}, { _id: false });
exports.AvailabilitySchema = new mongoose.Schema({
    // commenting errors filed as it is reserver word in mongoose
    // errors: {type: [String]},
    name: { required: true, type: String },
    status: { required: true, type: [String] }
}, { _id: false });
const StockStatus = new mongoose.Schema({
    name: { type: String },
    vale: { type: Number }
}, { _id: false });
const DistributionCenter = new mongoose.Schema({
    code: { type: String },
    location: { type: String },
    stockStatus: { default: [], required: true, type: [StockStatus] },
    stockStatusNew: { default: [], required: true, type: [StockStatus] }
}, { _id: false });
exports.ImpressionLocationSchema = new mongoose.Schema({
    discountGroups: { type: [DiscountGroupSchema] },
    distributionCenter: { type: DistributionCenter },
    plannedPublicationDate: { type: Date },
    publicationDate: { type: Date }
}, { _id: false });
exports.ProductSchemaProperties = {
    // Remove required: true, unique: true options
    // as mongoose throws warning and these flags are true default
    _id: { type: String },
    _isSellable: { type: Boolean },
    _schemaVersion: { type: String },
    _sources: { type: [sharedSchemaV4_1.SourceSchema] },
    _status: { type: String },
    audience: { type: [Audience] },
    availability: { type: [exports.AvailabilitySchema] },
    categories: { default: [], required: true, type: [CategorySchema] },
    classifications: { type: [ClassificationSchema] },
    contributors: { default: [], required: true, type: [exports.ContributorSchema] },
    discountGroups: { type: [DiscountGroupSchema] },
    identifiers: { required: true, type: Identifiers },
    impressionLocations: { default: [], type: [exports.ImpressionLocationSchema] },
    isPartOf: { type: [exports.IsPartOfSchema] },
    isRelatedTo: { type: [IsRelatedToSchema] },
    keywords: { type: [KeywordSchema] },
    permissions: { default: [], required: true, type: [PermissionSchema] },
    prices: { type: [PriceSchema] },
    rights: { type: [RightSchema] },
    subType: { type: String },
    title: { required: true, type: String },
    type: { enum: exports.ProductTypeEnumValues, required: true, type: String },
    version: { type: String }
};
