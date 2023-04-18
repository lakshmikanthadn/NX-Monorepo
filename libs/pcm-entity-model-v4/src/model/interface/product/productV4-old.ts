import * as ResponseModel from '../response';
import { Source } from '../shared/source';
import * as StorageModel from '../storage';
import { Audience } from './audience/audience';
import { Availability } from './availability/availability';
import { Category } from './category/category';
import { Classification } from './classification/classification';
import { Contributor } from './contributor/contributor';
import { DiscountGroup } from './discountGroup/discountGroup';
import { ImpressionLocation } from './impressionLocation/impressionLocation';
import { IsPartOf } from './isPartOf/isPartOf';
import { IsRelatedTo } from './isRelatedTo/isRelatedTo';
import { Keyword } from './keyword/keyword';
import { Permission } from './permission/permission';
import { Price } from './price/price';
import { ProductIdentifiers } from './productIdentifier/productIdentifiers';
import * as ProductTypes from './productTypes';
import { Right } from './right/right';

export interface RespProductSmall extends ProductSmallCommonProps {
  _id: string;
}

export interface StoreProductSmall extends ProductSmallCommonProps {
  _sources: Source[];
  _schemaVersion: string;
  _createdDate?: Date;
  _modifiedDate?: Date;
  _status: string;
  _isSellable: boolean;
}

export interface StoreProduct extends ProductCommonProps, StoreProductSmall {
  book?: StorageModel.BookMetaData;
  chapter?: StorageModel.ChapterMetaData;
  collection?: StorageModel.CollectionMetaData;
  scholarlyArticle?: StorageModel.ScholarlyArticleMetaData;
  creativeWork?: StorageModel.CreativeWorkMetaData;
  set?: StorageModel.SetMetaData;
  availability?: Availability[];
  series?: StorageModel.SeriesMetaData;
  journal?: StorageModel.JournalMetaData;
  publishingService?: StorageModel.ServiceMetaData;
  promotional?: StorageModel.PromotionalMetaData;
  entryVersion?: StorageModel.EntryVersionMetaData;
}

export interface RespProduct extends ProductCommonProps, RespProductSmall {
  book?: ResponseModel.BookMetaData;
  chapter?: ResponseModel.ChapterMetaData;
  collection?: StorageModel.CollectionMetaData;
  scholarlyArticle?: ResponseModel.ScholarlyArticleMetaData;
  creativeWork?: ResponseModel.CreativeWorkMetaData;
  set?: ResponseModel.SetMetaData;
  associatedMedia?: ResponseModel.AssociatedMedia[];
  series?: StorageModel.SeriesMetaData;
  journal?: StorageModel.JournalMetaData;
  service?: StorageModel.ServiceMetaData;
  publishingService?: StorageModel.ServiceMetaData;
  promotional?: StorageModel.PromotionalMetaData;
}

interface ProductSmallCommonProps {
  _id: string;
  type: ProductTypes.Product;
  subType?: string;
  version: string;
  title: string;
  identifiers: ProductIdentifiers;
}

interface ProductCommonProps extends ProductSmallCommonProps {
  categories: Category[];
  classifications?: Classification[];
  keywords?: Keyword[];
  contributors: Contributor[];
  isPartOf?: IsPartOf[];
  isRelatedTo?: IsRelatedTo[];
  prices?: Price[];
  impressionLocations?: ImpressionLocation[];
  permissions: Permission[];
  rights?: Right[];
  audience?: Audience[];
  discountGroups?: DiscountGroup[];
  modifiedDate?: Date;
}
