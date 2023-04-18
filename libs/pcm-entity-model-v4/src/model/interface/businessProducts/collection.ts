import { AssociatedMediaCommonProps } from '../associatedMedia/associatedMediaV4';
import { Audience } from '../product/audience/audience';
import { Category } from '../product/category/category';
import { Classification } from '../product/classification/classification';
import { Contributor } from '../product/contributor/contributor';
import { DiscountGroup } from '../product/discountGroup/discountGroup';
import { IsPartOf } from '../product/isPartOf/isPartOf';
import { Keyword } from '../product/keyword/keyword';
import { Permission } from '../product/permission/permission';
import { Price } from '../product/price/price';
import { Product as ProductType } from '../product/productTypes';
import { Right } from '../product/right/right';
import { Rules } from '../shared/rules';
import { Source } from '../shared/source';
import { SubType } from '../shared/subType';
import { CollectionMetaData } from './collectionMetaData';

export interface CollectionPart extends CommonCollectionPart {
  endDate?: Date;
  isFree: boolean;
  startDate?: Date;
  position: number;
}

export interface CommonCollectionPart {
  identifier: string;
  type: ProductType;
}

export interface CollectionAssociatedMedia
  extends Omit<AssociatedMediaCommonProps, '_id'> {
  _id?: string;
}

export interface CollectionIdentifiers {
  doi?: string;
  sku: string;
  collectionId: string;
}

interface CollectionClassification
  extends Omit<Classification, 'code' | 'name'> {
  code: string;
  name?: string;
}

interface CollectionContributor
  extends Omit<Contributor, 'givenName' | 'fullName'> {
  givenName: string;
  fullName: string;
}

interface CollectionKeyword
  extends Omit<Keyword, 'name' | 'type' | 'position'> {
  name?: string;
  type?: string;
  position?: number;
}

interface CollectionPrice
  extends Omit<Price, 'validFrom' | 'priceType' | 'priceTypeCode'> {
  discountPercentage?: number;
  listPrice?: number;
  validFrom: Date;
  priceType: string;
  priceTypeCode: string;
}

export interface CollectionProductRequest {
  collection: CollectionMetaData;
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
