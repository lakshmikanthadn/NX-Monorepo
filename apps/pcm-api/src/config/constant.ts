/**
 * ####################################################
 * V4 CONFIG
 * ####################################################
 */

/**
 * -------------------------------------------------------------------------
 * VALIDATION CONFIG FOR
 * POST /content/
 * -------------------------------------------------------------------------
 */

const ValidateAsstMediaFieldsV4 = ['fileName', 'type', 'parentId'];

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
const ContentTypesHostedInPublicDomain = [
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
const ContentTypesSignatureNotRequired = [
  ...ContentTypesHostedInPublicDomain,
  'database'
];

/**
 * These content types MAY or MAY-NOT be in public location.
 * But needs to delivered to our clients even if they are NOT entitled.
 * I.e These contents are kept before the paywall.
 */
const ContentTypesWhitelistBeforePayWall = [
  ...ContentTypesHostedInPublicDomain,
  'previewpdf',
  'googlepdf',
  'exportcsv',
  'partslist'
];

/**
 * These mappings are for the content API to MAP the
 * content-type-requested to content-type-stored
 * Currently we store chapter xml and book xml as dbits xml, so we need to map.
 * if an entry is missing here we consider what ever is present in the request.
 */
const ContentTypeMapping = {
  bookxml: 'dbitsxml',
  chapterxml: 'dbitsxml'
};

/**
 * -------------------------------------------------------------------------
 * VALIDATION CONFIG FOR
 * GET /products?identifierName={idName}&IdentifierValues={idValues}
 * -------------------------------------------------------------------------
 */
const AssetIdentifiersNameMappingV4 = {
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

const PreArticleIdentifiersNameMappingV4 = {
  contributorsEmail: 'contributors.email',
  doi: 'identifiers.doi',
  submissionId: 'identifiers.submissionId',
  submissionSystemId: 'identifiers.submissionSystemId'
};

const WhitelistedProductIdentifiersV4 = [
  'doi',
  'isbn',
  'dacKey',
  'collectionId',
  '_id',
  'journalId',
  'journalAcronym',
  'businessId'
];

const WhitelistedProductIdentifiersNotInAssetsV4 = ['title'];

const WhitelistedPreArticleIdentifiers = [
  'submissionId',
  'doi',
  'submissionSystemId',
  'contributorsEmail'
];

const ProductTypesV4WithTitle = [
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

const WhitelistedProductIdentifiersWithNonAssetIdentifiersV4 = [
  ...WhitelistedProductIdentifiersV4,
  'title'
];

const IdentifierAndResponseGroupBasedLimitV4 = {
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
const whitelistedIdentifiersForValidationApi = [
  '_id',
  'identifiers.isbn',
  'identifiers.doi'
];

/**
 * -------------------------------------------------------------------------
 * COMMON VALIDATION CONFIG
 * -------------------------------------------------------------------------
 */

const ProductTypesV4 = [
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

const PreProductTypesV4 = ['preChapter'];

const ContentProxyWhitelistedResources = [
  'books',
  'chapters',
  'entry-versions',
  'collections'
];

const ContentProxyResourceMapping = {
  books: 'books',
  chapters: 'chapters',
  'entry-versions': 'entries'
};

const ContentProxyResourceCategories = ['mono', 'oa-mono', 'edit', 'oa-edit'];

/**
 * -------------------------------------------------------------------------
 * VALIDATION CONFIG FOR
 * GET /products/{id}/parts?format={belowFormat}
 * -------------------------------------------------------------------------
 */

const FormatTypeList = [
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

const titlesQueryMapping = {
  _id: '_id',
  dacKey: 'editions.dacKey',
  isbn: 'editions.formats.isbn',
  isbn10: 'editions.formats.isbn10',
  titleId: 'titleId'
};

const WhitelistedPartsIdentiferTypes = ['_id', 'isbn', 'doi'];

export const AppConstants = {
  AssetIdentifiersNameMappingV4,
  ContentProxyResourceCategories,
  ContentProxyResourceMapping,
  ContentProxyWhitelistedResources,
  ContentTypeMapping,
  ContentTypesHostedInPublicDomain,
  ContentTypesSignatureNotRequired,
  ContentTypesWhitelistBeforePayWall,
  FormatTypeList,
  IdentifierAndResponseGroupBasedLimitV4,
  PreArticleIdentifiersNameMappingV4,
  PreProductTypesV4,
  ProductTypesV4,
  ProductTypesV4WithTitle,
  ValidateAsstMediaFieldsV4,
  WhitelistedPartsIdentiferTypes,
  WhitelistedPreArticleIdentifiers,
  WhitelistedProductIdentifiersNotInAssetsV4,
  WhitelistedProductIdentifiersV4,
  WhitelistedProductIdentifiersWithNonAssetIdentifiersV4,
  titlesQueryMapping,
  whitelistedIdentifiersForValidationApi
};
