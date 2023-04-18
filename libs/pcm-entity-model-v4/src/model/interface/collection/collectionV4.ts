import { Category } from '../product/category/category';
import { Classification as CollectionClassification } from '../product/classification/classification';
import { Keyword as CollectionKeyword } from '../product/keyword/keyword';
import { Contributor as CollectionContributor } from '../product/contributor/contributor';
import { StoreCollectionMetaData } from './collectionMetaDataV4';
import { DiscountGroup } from '../product/discountGroup/discountGroup';
import { IsPartOf } from '../product/isPartOf/isPartOf';
import { Price as CollectionPrice } from '../product/price/price';
import { Permission } from '../product/permission/permission';
import { Right } from '../product/right/right';
import { Audience } from '../product/audience/audience';
import { SubType } from '../shared/subType';
import { Product as ProductType } from '../product/productTypes';
import { Source } from '../shared/source';
import {
  CollectionAssociatedMedia,
  CollectionIdentifiers,
  CollectionPart,
  CommonCollectionPart
} from '../businessProducts/collection';
import { Rules } from '../shared/rules';

export interface StoreCollection {
  collection: StoreCollectionMetaData;
  categories: Category[];
  classifications?: CollectionClassification[];
  keywords?: CollectionKeyword[];
  contributors?: CollectionContributor[];
  discountGroups?: DiscountGroup[];
  isPartOf?: IsPartOf[];
  prices: CollectionPrice[];
  permissions?: Permission[];
  rights?: Right[];
  audience?: Audience[];
  _id: string;
  subType?: SubType;
  type: ProductType;
  version?: string;
  title: string;
  identifiers: CollectionIdentifiers;
  _source: Source;
  _schemaVersion: string;
  _status?: string;
  partsAdded?: CollectionPart[];
  partsRemoved?: CommonCollectionPart[];
  partsUpdated?: CollectionPart[];
  rulesList?: Rules[];
  associatedMedia?: CollectionAssociatedMedia[];
}
