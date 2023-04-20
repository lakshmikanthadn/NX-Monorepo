"use strict";
/**
 * ####################################################
 * V4 CONFIG
 * ####################################################
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConstants = void 0;
/**
 * -------------------------------------------------------------------------
 * VALIDATION CONFIG FOR
 * POST /content/
 * -------------------------------------------------------------------------
 */
var ValidateAsstMediaFieldsV4 = ['fileName', 'type', 'parentId'];
/**
 * -------------------------------------------------------------------------
 * VALIDATION CONFIG FOR
 * GET /content/{product-id}?type={contentType}
 * -------------------------------------------------------------------------
 */
/**
 * The content types that are in public Location.
 * Like youtube links or hosted in public S3.
 * These contents needs to be included in the Product Metadata. (For large)
 */
var ContentTypesHostedInPublicDomain = [
    'hyperlink',
    'coverimage',
    'bannerimage',
    'posterimage',
    'thumbnail',
    'companionwebsite'
];
/**
 * The content types that are not S3 locations
 * Or they are hosted in Public domain/S3 location.
 * They don't need to be signed from AWS SDK.
 * For database, we don't store the URLs.
 */
var ContentTypesSignatureNotRequired = __spreadArray(__spreadArray([], ContentTypesHostedInPublicDomain, true), [
    'database'
], false);
/**
 * These content types MAY or MAY-NOT be in public location.
 * But needs to delivered to our clients even if they are NOT entitled.
 * I.e These contents are kept before the paywall.
 */
var ContentTypesWhitelistBeforePayWall = __spreadArray(__spreadArray([], ContentTypesHostedInPublicDomain, true), [
    'previewpdf',
    'googlepdf',
    'exportcsv',
    'partslist'
], false);
/**
 * These mappings are for the content API to MAP the
 * content-type-requested to content-type-stored
 * Currently we store chapter xml and book xml as dbits xml, so we need to map.
 * if an entry is missing here we consider what ever is present in the request.
 */
var ContentTypeMapping = {
    bookxml: 'dbitsxml',
    chapterxml: 'dbitsxml'
};
/**
 * -------------------------------------------------------------------------
 * VALIDATION CONFIG FOR
 * GET /products?identifierName={idName}&IdentifierValues={idValues}
 * -------------------------------------------------------------------------
 */
var AssetIdentifiersNameMappingV4 = {
    _id: '_id',
    businessId: 'identifier.businessId',
    collectionId: 'identifier.collectionId',
    dacKey: 'identifier.dacKey',
    doi: 'identifier.doi',
    isbn: 'identifier.isbn',
    issn: 'identifier.issn',
    journalAcronym: 'identifier.journalAcronym',
    journalId: 'identifier.journalId'
};
var PreArticleIdentifiersNameMappingV4 = {
    contributorsEmail: 'contributors.email',
    doi: 'identifiers.doi',
    submissionId: 'identifiers.submissionId',
    submissionSystemId: 'identifiers.submissionSystemId'
};
var WhitelistedProductIdentifiersV4 = [
    'doi',
    'isbn',
    'dacKey',
    'collectionId',
    '_id',
    'journalId',
    'journalAcronym',
    'businessId'
];
var WhitelistedProductIdentifiersNotInAssetsV4 = ['title'];
var WhitelistedPreArticleIdentifiers = [
    'submissionId',
    'doi',
    'submissionSystemId',
    'contributorsEmail'
];
var ProductTypesV4WithTitle = [
    'book',
    'chapter',
    'collection',
    'creativeWork',
    'entry',
    'entryVersion',
    'journal',
    'publishingService',
    'scholarlyArticle',
    'series',
    'set'
];
var WhitelistedProductIdentifiersWithNonAssetIdentifiersV4 = __spreadArray(__spreadArray([], WhitelistedProductIdentifiersV4, true), [
    'title'
], false);
var IdentifierAndResponseGroupBasedLimitV4 = {
    _id: {
        large: 50,
        medium: 100,
        small: 100
    },
    default: {
        large: 30,
        medium: 30,
        small: 30
    },
    isbn: {
        large: 50,
        medium: 100,
        small: 100
    },
    journalAcronym: {
        large: 50,
        medium: 100,
        small: 100
    }
};
/**
 * -------------------------------------------------------------------------
 * VALIDATION CONFIG FOR
 * POST /products#action=validate
 * -------------------------------------------------------------------------
 */
var whitelistedIdentifiersForValidationApi = [
    '_id',
    'identifiers.isbn',
    'identifiers.doi'
];
/**
 * -------------------------------------------------------------------------
 * COMMON VALIDATION CONFIG
 * -------------------------------------------------------------------------
 */
var ProductTypesV4 = [
    'book',
    'chapter',
    'creativeWork',
    'set',
    'series',
    'scholarlyArticle',
    'collection',
    'journal',
    'publishingService',
    'entry',
    'entryVersion'
];
var PreProductTypesV4 = ['preChapter'];
var ContentProxyWhitelistedResources = [
    'books',
    'chapters',
    'entry-versions',
    'collections'
];
var ContentProxyResourceMapping = {
    books: 'books',
    chapters: 'chapters',
    'entry-versions': 'entries'
};
var ContentProxyResourceCategories = ['mono', 'oa-mono', 'edit', 'oa-edit'];
/**
 * -------------------------------------------------------------------------
 * VALIDATION CONFIG FOR
 * GET /products/{id}/parts?format={belowFormat}
 * -------------------------------------------------------------------------
 */
var FormatTypeList = [
    'video',
    'hyperlink',
    'document',
    'presentation',
    'image',
    'portableDocument',
    'audio',
    'database',
    'archive',
    'spreadsheet',
    'html'
];
var titlesQueryMapping = {
    _id: '_id',
    dacKey: 'editions.dacKey',
    isbn: 'editions.formats.isbn',
    isbn10: 'editions.formats.isbn10',
    titleId: 'titleId'
};
var WhitelistedPartsIdentiferTypes = ['_id', 'isbn', 'doi'];
exports.AppConstants = {
    AssetIdentifiersNameMappingV4: AssetIdentifiersNameMappingV4,
    ContentProxyResourceCategories: ContentProxyResourceCategories,
    ContentProxyResourceMapping: ContentProxyResourceMapping,
    ContentProxyWhitelistedResources: ContentProxyWhitelistedResources,
    ContentTypeMapping: ContentTypeMapping,
    ContentTypesHostedInPublicDomain: ContentTypesHostedInPublicDomain,
    ContentTypesSignatureNotRequired: ContentTypesSignatureNotRequired,
    ContentTypesWhitelistBeforePayWall: ContentTypesWhitelistBeforePayWall,
    FormatTypeList: FormatTypeList,
    IdentifierAndResponseGroupBasedLimitV4: IdentifierAndResponseGroupBasedLimitV4,
    PreArticleIdentifiersNameMappingV4: PreArticleIdentifiersNameMappingV4,
    PreProductTypesV4: PreProductTypesV4,
    ProductTypesV4: ProductTypesV4,
    ProductTypesV4WithTitle: ProductTypesV4WithTitle,
    ValidateAsstMediaFieldsV4: ValidateAsstMediaFieldsV4,
    WhitelistedPartsIdentiferTypes: WhitelistedPartsIdentiferTypes,
    WhitelistedPreArticleIdentifiers: WhitelistedPreArticleIdentifiers,
    WhitelistedProductIdentifiersNotInAssetsV4: WhitelistedProductIdentifiersNotInAssetsV4,
    WhitelistedProductIdentifiersV4: WhitelistedProductIdentifiersV4,
    WhitelistedProductIdentifiersWithNonAssetIdentifiersV4: WhitelistedProductIdentifiersWithNonAssetIdentifiersV4,
    titlesQueryMapping: titlesQueryMapping,
    whitelistedIdentifiersForValidationApi: whitelistedIdentifiersForValidationApi
};
