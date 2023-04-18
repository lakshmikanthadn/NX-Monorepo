import * as ProductTypes from '../product/productTypes';

export interface StoreAssociatedMedia extends AssociatedMediaCommonProps {
  parentId: string;
  parentType: ProductTypes.Product;
  versionType: string;
  _createdDate?: Date;
  _modifiedDate?: Date;
}

export interface RespAssociatedMedia extends AssociatedMediaCommonProps {
  accessType?: string;
}

export interface AssociatedMediaCommonProps {
  _id: string;
  location: string;
  type: string;
  size: number;
}
