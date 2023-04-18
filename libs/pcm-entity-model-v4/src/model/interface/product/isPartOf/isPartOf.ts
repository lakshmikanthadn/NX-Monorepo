import { AssetIdentifier } from '../../asset/assetIdentifierV4';
import { SubType } from '../../shared/subType';

export interface IsPartOf {
  _id: string;
  type: string;
  subType?: SubType;
  level?: number;
  position?: number;
  title?: string;
  identifiers?: AssetIdentifier;
}
