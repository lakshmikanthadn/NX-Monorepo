"use strict";
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
exports.apiResponseGroupConfig = void 0;
var AppError_1 = require("../../model/AppError");
var APIResponseGroupConfig = /** @class */ (function () {
    function APIResponseGroupConfig() {
        this.taxonomyFields = [
            '_id',
            'name',
            'level',
            'code',
            'parentId'
        ];
        this.taxonomyMasterFields = [
            '_id',
            'name',
            'level',
            'classificationType',
            'code',
            'parentId'
        ];
        this.productSmall = [
            '_id',
            'type',
            'subType',
            'version',
            'title',
            'identifiers'
        ];
        this.manuscriptWorkflowSmall = ['_id', 'version', 'identifiers'];
        this.productMedium = [
            '_id',
            'associatedMedia',
            'availability',
            'categories',
            'contributors',
            'discountGroups',
            'identifiers',
            'permissions',
            'prices',
            'rights',
            'title',
            'type',
            'subType',
            'version'
        ];
        this.productLarge = [
            '_id',
            'associatedMedia',
            'audience',
            'availability',
            'categories',
            'classifications',
            'contributors',
            'discountGroups',
            'identifiers',
            'impressionLocations',
            'isPartOf',
            'isRelatedTo',
            'keywords',
            'permissions',
            'prices',
            'references',
            'rights',
            'title',
            'type',
            'subType',
            'version',
            'transfer',
            '_modifiedDate'
        ];
        this.partSmall = [
            'parts._id',
            'parts.type',
            'parts.position',
            'parts.isFree'
        ];
        this.partMedium = [
            'parts._id',
            'parts.format',
            'parts.isFree',
            'parts.level',
            'parts.position',
            'parts.type',
            'parts.version',
            'parts.curationSource',
            'parts.title'
        ];
        this.stagesMedium = [
            'stages.createdDate',
            'stages.messageDate',
            'stages.source',
            'stages.metadata.originalStatus',
            'stages.status'
        ];
        this.scholarlyArticleMedium = [
            'scholarlyArticle.journal.siteName',
            'scholarlyArticle.journal.journalAcronym',
            'scholarlyArticle.journal.title',
            'scholarlyArticle.status',
            'scholarlyArticle.dates'
        ];
        this.bookMetadataSmall = [];
        this.bookMetadataLarge = ['book'];
        this.chapterMetadataSmall = [];
        this.chapterMetadataLarge = ['chapter'];
        this.projectionResponseGroupMapper = {
            allProducts: {
                partMedium: [
                    'title',
                    'type',
                    'identifiers.doi',
                    'contributors.roles',
                    'contributors.fullName',
                    'categories.name',
                    'categories.type',
                    'book.format',
                    'book.subtitle',
                    'book.publicationDate',
                    'book.publisherImprint',
                    'book.plannedPublicationDate',
                    'collection.format',
                    'collection.subtitle',
                    'collection.publicationDate',
                    'collection.publisherImprint',
                    'collection.plannedPublicationDate',
                    'chapter.format',
                    'chapter.subtitle',
                    'chapter.publicationDate',
                    'chapter.publisherImprint',
                    'chapter.plannedPublicationDate',
                    'set.format',
                    'set.subtitle',
                    'set.publicationDate',
                    'set.publisherImprint',
                    'set.plannedPublicationDate',
                    'creativeWork.format',
                    'creativeWork.subtitle',
                    'creativeWork.publicationDate',
                    'creativeWork.publisherImprint',
                    'creativeWork.plannedPublicationDate',
                    'prices',
                    'permissions',
                    'entryVersion.publicationDate',
                    'entryVersion.publisherImprint',
                    'entryVersion.plannedPublicationDate',
                    'scholarlyArticle.format',
                    'scholarlyArticle.subtitle',
                    'scholarlyArticle.publicationDate',
                    'scholarlyArticle.publisherImprint',
                    'scholarlyArticle.plannedPublicationDate',
                    'series.format',
                    'series.subtitle',
                    'series.publicationDate',
                    'series.publisherImprint',
                    'series.plannedPublicationDate'
                ],
                partSmall: ['_id', 'type', 'identifiers.doi', 'identifiers.isbn']
            },
            book: {
                large: this.productLarge.concat(this.bookMetadataLarge),
                medium: __spreadArray(__spreadArray([], this.productMedium, true), ['book'], false),
                partMedium: [
                    'title',
                    'identifiers.doi',
                    'contributors.roles',
                    'contributors.fullName',
                    'book.format',
                    'book.subtitle',
                    'book.publicationDate',
                    'book.publisherImprint',
                    'book.plannedPublicationDate',
                    'prices',
                    'permissions'
                ],
                small: this.productSmall.concat(this.bookMetadataSmall)
            },
            chapter: {
                large: this.productLarge.concat(this.chapterMetadataLarge),
                medium: __spreadArray(__spreadArray([], this.productMedium, true), ['chapter'], false),
                partMedium: [
                    'title',
                    'identifiers.doi',
                    'contributors.roles',
                    'contributors.fullName',
                    'chapter.format',
                    'chapter.subtitle',
                    'chapter.publicationDate',
                    'chapter.publisherImprint',
                    'chapter.plannedPublicationDate',
                    'prices',
                    'permissions'
                ],
                small: this.productSmall.concat(this.chapterMetadataSmall)
            },
            collection: {
                large: __spreadArray(__spreadArray([], this.productLarge, true), ['collection'], false),
                medium: __spreadArray(__spreadArray([], this.productSmall, true), ['collection'], false),
                partMedium: [
                    'title',
                    'identifiers.doi',
                    'contributors.roles',
                    'contributors.fullName',
                    'collection.format',
                    'collection.subtitle',
                    'collection.publicationDate',
                    'collection.publisherImprint',
                    'collection.plannedPublicationDate',
                    'categories.name',
                    'categories.type',
                    'prices',
                    'permissions'
                ],
                small: this.productSmall
            },
            creativeWork: {
                large: __spreadArray(__spreadArray([], this.productLarge, true), ['creativeWork'], false),
                medium: __spreadArray(__spreadArray([], this.productSmall, true), ['creativeWork'], false),
                partMedium: [
                    'title',
                    'identifiers.doi',
                    'contributors.roles',
                    'contributors.fullName',
                    'creativeWork.format',
                    'creativeWork.subtitle',
                    'creativeWork.publicationDate',
                    'creativeWork.publisherImprint',
                    'creativeWork.plannedPublicationDate',
                    'prices',
                    'permissions'
                ],
                small: this.productSmall
            },
            entry: {
                large: this.productLarge,
                medium: this.productSmall,
                partMedium: [
                    'title',
                    'identifiers.doi',
                    'contributors.roles',
                    'contributors.fullName',
                    'prices',
                    'permissions'
                ],
                small: this.productSmall
            },
            entryVersion: {
                large: __spreadArray(__spreadArray([], this.productLarge, true), ['entryVersion'], false),
                medium: __spreadArray(__spreadArray([], this.productSmall, true), ['entryVersion'], false),
                partMedium: [
                    'title',
                    'identifiers.doi',
                    'contributors.roles',
                    'contributors.fullName',
                    'prices',
                    'permissions',
                    'entryVersion.publicationDate',
                    'entryVersion.publisherImprint',
                    'entryVersion.plannedPublicationDate'
                ],
                small: this.productSmall
            },
            journal: {
                large: __spreadArray(__spreadArray([], this.productLarge, true), ['journal'], false),
                medium: __spreadArray(__spreadArray([], this.productSmall, true), ['journal'], false),
                small: this.productSmall
            },
            manuscriptWorkflow: {
                large: __spreadArray(__spreadArray([], this.manuscriptWorkflowSmall, true), ['stages'], false),
                medium: __spreadArray(__spreadArray([], this.manuscriptWorkflowSmall, true), this.stagesMedium, true),
                small: this.manuscriptWorkflowSmall
            },
            part: {
                medium: this.partMedium,
                small: this.partSmall
            },
            preArticle: {
                large: __spreadArray(__spreadArray([], this.productLarge, true), ['scholarlyArticle'], false),
                medium: __spreadArray(__spreadArray([], this.productSmall, true), this.scholarlyArticleMedium, true),
                partMedium: [
                    'title',
                    'identifiers.doi',
                    'contributors.roles',
                    'contributors.fullName',
                    'scholarlyArticle.format',
                    'scholarlyArticle.subtitle',
                    'scholarlyArticle.publicationDate',
                    'scholarlyArticle.publisherImprint',
                    'scholarlyArticle.plannedPublicationDate',
                    'prices',
                    'permissions'
                ],
                small: this.productSmall
            },
            publishingService: {
                large: __spreadArray(__spreadArray([], this.productLarge, true), ['publishingService'], false),
                medium: __spreadArray(__spreadArray([], this.productSmall, true), ['publishingService'], false),
                small: this.productSmall
            },
            scholarlyArticle: {
                large: __spreadArray(__spreadArray([], this.productLarge, true), ['scholarlyArticle'], false),
                medium: __spreadArray(__spreadArray([], this.productSmall, true), ['scholarlyArticle'], false),
                partMedium: [
                    'title',
                    'identifiers.doi',
                    'contributors.roles',
                    'contributors.fullName',
                    'scholarlyArticle.format',
                    'scholarlyArticle.subtitle',
                    'scholarlyArticle.publicationDate',
                    'scholarlyArticle.publisherImprint',
                    'scholarlyArticle.plannedPublicationDate',
                    'prices',
                    'permissions'
                ],
                small: this.productSmall
            },
            series: {
                large: __spreadArray(__spreadArray([], this.productLarge, true), ['series'], false),
                medium: __spreadArray(__spreadArray([], this.productSmall, true), ['series'], false),
                partMedium: [
                    'title',
                    'identifiers.doi',
                    'contributors.roles',
                    'contributors.fullName',
                    'series.format',
                    'series.subtitle',
                    'series.publicationDate',
                    'series.publisherImprint',
                    'series.plannedPublicationDate',
                    'prices',
                    'permissions'
                ],
                small: this.productSmall
            },
            set: {
                large: __spreadArray(__spreadArray([], this.productLarge, true), ['set'], false),
                medium: __spreadArray(__spreadArray([], this.productSmall, true), ['set'], false),
                partMedium: [
                    'title',
                    'identifiers.doi',
                    'contributors.roles',
                    'contributors.fullName',
                    'set.format',
                    'set.subtitle',
                    'set.publicationDate',
                    'set.publisherImprint',
                    'set.plannedPublicationDate',
                    'prices',
                    'permissions'
                ],
                small: this.productSmall
            }
        };
    }
    APIResponseGroupConfig.prototype.getProjectionFields = function (productType, responseGroup) {
        if (!this.projectionResponseGroupMapper[productType]) {
            throw new AppError_1.AppError("Product type - ".concat(productType, " is not configured for Response Group."), 400);
        }
        if (!this.projectionResponseGroupMapper[productType][responseGroup]) {
            throw new Error("Response Group - ".concat(responseGroup, " is not configured for Product type - ").concat(productType));
        }
        return this.projectionResponseGroupMapper[productType][responseGroup];
    };
    APIResponseGroupConfig.prototype.getProjectionFieldsForTaxonomy = function () {
        return this.taxonomyFields;
    };
    APIResponseGroupConfig.prototype.getProjectionFieldsForTaxonomyMaster = function () {
        return this.taxonomyMasterFields;
    };
    return APIResponseGroupConfig;
}());
exports.apiResponseGroupConfig = new APIResponseGroupConfig();
