import { Reference } from './reference/reference';
import { Audience } from './audience/audience';
import { Category } from './category/category';
import { Classification } from './classification/classification';
import { Contributor } from './contributor/contributor';
import { DiscountGroup } from './discountGroup/discountGroup';
import { ImpressionLocation } from './impressionLocation/impressionLocation';
import { IsPartOf } from './isPartOf/isPartOf';
import { Keyword } from './keyword/keyword';
import { Permission } from './permission/permission';
import { Price } from './price/price';
import * as ProductTypes from './productTypes';
import { Right } from './right/right';
import { IsRelatedTo } from './isRelatedTo/isRelatedTo';

export interface BaseProduct {
  _id: string;
  type: ProductTypes.Product;
  version: string;
  title: string;
  categories?: Category[];
  classifications?: Classification[];
  keywords?: Keyword[];
  contributors?: Contributor[];
  isPartOf?: IsPartOf[];
  prices?: Price[];
  impressionLocations?: ImpressionLocation[];
  permissions?: Permission[];
  references?: Reference[];
  rights?: Right[];
  audience?: Audience[];
  discountGroups?: DiscountGroup[];
  subType?: string;
  isRelatedTo?: IsRelatedTo[];
}
