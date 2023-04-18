import { StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import { IProductsTotalPrice } from './ProductsTotalPrice';

export interface ISearchResultPart {
  _id: string;
  type?: StorageModel.ProductType;
}

export interface IResultCount {
  count: number;
  type: StorageModel.ProductType | 'Total';
}

export interface ISearchQuery {
  type: StorageModel.ProductType;
  rules: any;
  attributes?: string[];
  rulesString?: string;
}

export interface IAvailabilityArray {
  name: string;
  status: IStatusQuery;
}

export interface IAvailability {
  name: string;
  status: string[];
}

export type AvailabilityStatus = IStatusQuery | string[];
export interface IStatusQuery {
  IN?: string[];
  ALL?: string[];
}

export interface IRecipient {
  to: string[];
  cc: string[];
}
export interface ISearchReqDownload {
  rulesList: ISearchQuery[];
  availability?: IAvailability;
  _id?: string;
  apiVersion: string;
  action: string;
  recipients: IRecipient;
  fileName: string;
}

export interface ISearchRespMetadata {
  counts: IResultCount[];
  prices: IProductsTotalPrice[];
}

export interface ISearchProductResp extends ISearchRespMetadata {
  // products: StorageModel.Product[];
  products: any[];
  isFromCache: boolean;
  nextPageCursor: string;
  lastPageCursor: string;
  prevPageCursor: string;
  isFirstPageReached: boolean;
  isLastPageReached: boolean;
}

export interface ISearchQueryMetaDataParams {
  hasTotalPrices: boolean;
  hasCounts: boolean;
  availability?: any;
  availabilityName?: string;
  availabilityStatus?: AvailabilityStatus;
}

export interface ISearchQueryParams extends ISearchQueryMetaDataParams {
  limit: number;
  offset: number;
  cacheId?: string;
  productType: StorageModel.ProductType;
  searchQueryParserResult: ISearchQuery[];
  sortBy?: string;
  sortOrder?: string;
  projectedFields: string[];
  offsetCursor?: string;
}
