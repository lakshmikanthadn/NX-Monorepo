import { APIResponseGroup } from './CustomDataTypes';

export interface IProductFilterOptions {
  projectionFields?: string[];
  availabilityName?: string;
  availabilityStatus?: string[];
  productVersion?: string;
  responseGroup?: APIResponseGroup;
}
