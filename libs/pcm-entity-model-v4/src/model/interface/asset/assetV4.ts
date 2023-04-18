import * as ProductTypes from '../product/productTypes';
import { Source } from '../shared/source';
import { AssetIdentifier } from './assetIdentifierV4';

export interface StoreAsset {
  _id: string;
  type: ProductTypes.Product;
  identifier: AssetIdentifier;
  _sources: Source[];
  // Making these optional because these are created/handled by mongoose.
  _createdDate?: Date;
  _modifiedDate?: Date;
}
