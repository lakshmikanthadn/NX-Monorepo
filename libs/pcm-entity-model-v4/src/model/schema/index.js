"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Historical = exports.IngestedItem = exports.ValidationConfiguration = exports.PublishingItem = exports.Title = exports.Promotional = exports.PublishingService = exports.JournalPublishingServiceMap = exports.ClassificationTypeEnum = exports.ClassificationFamilyEnum = exports.ClassificationSchema = exports.Journal = exports.Series = exports.Set = exports.Taxonomy = exports.PartRevision = exports.Part = exports.AssociatedMedia = exports.ManuscriptWorkflow = exports.PreArticle = exports.ScholarlyArticle = exports.CreativeWork = exports.CollectionRevision = exports.Collection = exports.Chapter = exports.Book = exports.Asset = void 0;
// export all mongoose schema
var assetV4_1 = require("./assetV4");
Object.defineProperty(exports, "Asset", { enumerable: true, get: function () { return assetV4_1.Asset; } });
var bookV4_1 = require("./bookV4");
Object.defineProperty(exports, "Book", { enumerable: true, get: function () { return bookV4_1.Book; } });
var chapterV4_1 = require("./chapterV4");
Object.defineProperty(exports, "Chapter", { enumerable: true, get: function () { return chapterV4_1.Chapter; } });
var collectionV4_1 = require("./collectionV4");
Object.defineProperty(exports, "Collection", { enumerable: true, get: function () { return collectionV4_1.Collection; } });
Object.defineProperty(exports, "CollectionRevision", { enumerable: true, get: function () { return collectionV4_1.CollectionRevision; } });
var creativeWorkV4_1 = require("./creativeWorkV4");
Object.defineProperty(exports, "CreativeWork", { enumerable: true, get: function () { return creativeWorkV4_1.CreativeWork; } });
var scholarlyArticleV4_1 = require("./scholarlyArticleV4");
Object.defineProperty(exports, "ScholarlyArticle", { enumerable: true, get: function () { return scholarlyArticleV4_1.ScholarlyArticle; } });
var preArticleV4_1 = require("./preArticleV4");
Object.defineProperty(exports, "PreArticle", { enumerable: true, get: function () { return preArticleV4_1.PreArticle; } });
var manuscriptWorkflowV4_1 = require("./manuscriptWorkflowV4");
Object.defineProperty(exports, "ManuscriptWorkflow", { enumerable: true, get: function () { return manuscriptWorkflowV4_1.ManuscriptWorkflow; } });
var associatedMediaV4_1 = require("./associatedMediaV4");
Object.defineProperty(exports, "AssociatedMedia", { enumerable: true, get: function () { return associatedMediaV4_1.AssociatedMedia; } });
var partV4_1 = require("./partV4");
Object.defineProperty(exports, "Part", { enumerable: true, get: function () { return partV4_1.Part; } });
Object.defineProperty(exports, "PartRevision", { enumerable: true, get: function () { return partV4_1.PartRevision; } });
var taxonomyV4_1 = require("./taxonomyV4");
Object.defineProperty(exports, "Taxonomy", { enumerable: true, get: function () { return taxonomyV4_1.Taxonomy; } });
var setV4_1 = require("./setV4");
Object.defineProperty(exports, "Set", { enumerable: true, get: function () { return setV4_1.Set; } });
var seriesV4_1 = require("./seriesV4");
Object.defineProperty(exports, "Series", { enumerable: true, get: function () { return seriesV4_1.Series; } });
var journal_1 = require("./journal");
Object.defineProperty(exports, "Journal", { enumerable: true, get: function () { return journal_1.Journal; } });
var classificationSchema_1 = require("./classificationSchema");
Object.defineProperty(exports, "ClassificationSchema", { enumerable: true, get: function () { return classificationSchema_1.ClassificationSchema; } });
Object.defineProperty(exports, "ClassificationFamilyEnum", { enumerable: true, get: function () { return classificationSchema_1.ClassificationFamilyEnum; } });
Object.defineProperty(exports, "ClassificationTypeEnum", { enumerable: true, get: function () { return classificationSchema_1.ClassificationTypeEnum; } });
var journalPublishingServiceMapV4_1 = require("./journalPublishingServiceMapV4");
Object.defineProperty(exports, "JournalPublishingServiceMap", { enumerable: true, get: function () { return journalPublishingServiceMapV4_1.JournalPublishingServiceMap; } });
var publishingServiceV4_1 = require("./publishingServiceV4");
Object.defineProperty(exports, "PublishingService", { enumerable: true, get: function () { return publishingServiceV4_1.PublishingService; } });
var promotionalV4_1 = require("./promotionalV4");
Object.defineProperty(exports, "Promotional", { enumerable: true, get: function () { return promotionalV4_1.Promotional; } });
var title_1 = require("./title");
Object.defineProperty(exports, "Title", { enumerable: true, get: function () { return title_1.Title; } });
var publishItemSchema_1 = require("./publishItemSchema");
Object.defineProperty(exports, "PublishingItem", { enumerable: true, get: function () { return publishItemSchema_1.PublishingItem; } });
var validationConfigurationSchema_1 = require("./validationConfigurationSchema");
Object.defineProperty(exports, "ValidationConfiguration", { enumerable: true, get: function () { return validationConfigurationSchema_1.ValidationConfiguration; } });
var ingestedItem_1 = require("./ingestedItem");
Object.defineProperty(exports, "IngestedItem", { enumerable: true, get: function () { return ingestedItem_1.IngestedItem; } });
var historicalSchema_1 = require("./historicalSchema");
Object.defineProperty(exports, "Historical", { enumerable: true, get: function () { return historicalSchema_1.Historical; } });
