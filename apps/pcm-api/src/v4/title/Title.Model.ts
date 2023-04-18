import { ResponseModel } from '@tandfgroup/pcm-entity-model-v4';
import { APIVersion } from '../model/interfaces/CustomDataTypes';

type FetchVariantsAction = 'fetchVariants';

// ######################################################
/**
 * Models for Request
 * This is for the Request
 */

export interface IFetchVariantFilters {
  formats: string[];
  includeEditions: boolean;
}

export interface IFetchVariantsRequestBody extends IFetchVariantFilters {
  apiVersion: APIVersion;
  action: FetchVariantsAction;
  identifiers: IRequestIdentifier[];
}

export interface IRequestIdentifier {
  name: string;
  values: string[];
}

// ######################################################
/**
 * Models for Response
 * This is for the Request
 */

export interface IFetchVariantsResponseBody {
  identifier: IRespIdentifier;
  variants: IBookVariant[];
}

interface IRespIdentifier {
  name: string;
  value: string;
}

// ######################################################
/**
 * This Model is a transformed version of Title model,
 * only "editions.formats" and "editions" are transformed from Array to Objects.
 * This is Generated after the unwind stage of the aggregator in titleDao.
 * reference to title model => '@tandfgroup/pcm-entity-model';
 */
export interface IUnwindedTitle {
  _id: string;
  title: string;
  titleId: string;
  publisherImprint: string;
  source: string;
  editions: IEdition;
}

interface IEdition {
  edition: string;
  dacKey: string;
  doi: string;
  createdDate?: Date;
  modifiedDate?: Date;
  formats: IFormat;
}

interface IFormat {
  format: string;
  isbn: string;
  isbn10: string;
  status: string;
  bookId: string;
  createdDate?: Date;
  modifiedDate?: Date;
}

// ######################################################
/**
 * This is Book Variant product
 * will be part of API Response for fetchVariants
 */
export interface IBookVariant {
  _id: string;
  title: string;
  type: ResponseModel.ProductType;
  version: string;
  book: IBookVariantMeta;
  identifiers: IBookVariantIdentifiers;
}

export interface IBookVariantMeta {
  format: string;
  publisherImprint: string;
  edition: string;
  status: string;
}

export interface IBookVariantIdentifiers {
  isbn: string;
  doi: string;
  dacKey: string;
  isbn10: string;
}
