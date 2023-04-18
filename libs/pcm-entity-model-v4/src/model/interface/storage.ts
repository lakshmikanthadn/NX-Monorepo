export {
  StoreProduct as Product,
  StoreProductSmall as ProductSmall
} from './product/productV4-old';

export { Product as ProductType } from './product/productTypes';
export { Availability } from './product/availability/availability';

export { StoreAsset as Asset } from './asset/assetV4';
export { StoreAssociatedMedia as AssociatedMedia } from './associatedMedia/associatedMediaV4';

export { StoreBookMetaData as BookMetaData } from './book/bookMetaDataV4';
export { StoreEntryVersionMetaData as EntryVersionMetaData } from './entryVersion/entryVersionMetaDataV4';
export { StoreChapterMetaData as ChapterMetaData } from './chapter/chapterMetaDataV4';
export { StoreCollectionMetaData as CollectionMetaData } from './collection/collectionMetaDataV4';
export { StoreScholarlyArticleMetaData as ScholarlyArticleMetaData } from './scholarlyArticle/scholarlyArticleMetaDataV4';
export { StoreCreativeWorkMetaData as CreativeWorkMetaData } from './creativeWork/creativeWorkMetaDataV4';
export { StoreSetMetaData as SetMetaData } from './set/setMetaDataV4';
export { StoreSeriesMetaData as SeriesMetaData } from './series/seriesMetaDataV4';
export { StorePromotionalMetaData as PromotionalMetaData } from './promotional/promotionalMetaDataV4';
export { JournalMetaData } from './journal/journalMetaData';
export { ServiceMetaData } from './publishingService/publishingServiceMetaData';

export { Parts } from './parts/partsV4';
export { PreChapterProductRequest as PreChapter } from './businessProducts/preChapter';
export { HasPart } from './parts/hasPart';
export { PartsRevision } from './parts/partsRevision';
export { Taxonomy } from './taxonomy/taxonomyV4';
export { JournalPublishingServiceMap } from './journalPublishingServiceMap/journalPublishingServiceMap';
export { HasPublishingService } from './journalPublishingServiceMap/hasPublishingService';
export { TitleMetaData } from './title/titleMetaData';
export { StoreCollection as Collection } from './collection/collectionV4';
export { StoreCollectionsRevision as CollectionsRevision } from './collection/collectionRevision';
