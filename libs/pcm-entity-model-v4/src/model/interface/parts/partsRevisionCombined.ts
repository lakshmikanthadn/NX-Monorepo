import { Permission } from '../product/permission/permission';
import { Price } from '../product/price/price';
import { PartsContributor } from './partsContributor';
import { PartsIdentifier } from './partsIdentifier';
import { PartsProductMeta } from './partsProductMetadata';
// model to have combination of small and medium flavour
// that can be used to represent both
export interface PartsCombined {
  _id: string;
  type: string;
  position?: number;
  isFree?: boolean;
  level?: number;
  version?: string;
  parentId?: string;
  revision?: number;
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
