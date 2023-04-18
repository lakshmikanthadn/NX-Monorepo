import { Permission } from '../product/permission/permission';
import { Price } from '../product/price/price';

import { PartsContributor } from './partsContributor';
import { PartsIdentifier } from './partsIdentifier';
import { PartsProductMeta } from './partsProductMetadata';

export interface PartsMedium {
  _id: string;
  type: string;
  position: number;
  level: number;
  version: string;
  isFree: boolean;
  title?: string;
  prices?: Price[];
  permissions?: Permission[];
  contributors?: PartsContributor[];
  identifiers?: PartsIdentifier;
  book?: PartsProductMeta;
  chapter?: PartsProductMeta;
  collection?: PartsProductMeta;
  creativeWork?: PartsProductMeta;
  scholarlyArticle?: PartsProductMeta;
  set?: PartsProductMeta;
  series?: PartsProductMeta;
}
