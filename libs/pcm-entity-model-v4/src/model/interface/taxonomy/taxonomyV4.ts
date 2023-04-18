import * as ProductTypes from '../product/productTypes';

type TaxonomyType = 'subject';
type TaxonomyStatus = 'active' | 'inactive';

export interface Taxonomy {
  _id: string;
  assetType: ProductTypes.Product;
  code: string;
  level: number;
  name: string;
  parentId: string;
  type: TaxonomyType;
  status: TaxonomyStatus;
}
