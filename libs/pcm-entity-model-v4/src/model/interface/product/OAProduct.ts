import { License } from '../shared/license';
import { Permission } from './permission/permission';

export type ApiVersionTypes = '4.0.1';
export type OAAppNameTypes = 'OMS';
export type OAActionTypes = 'oaUpdate';
export type OAAssetTypes = 'book' | 'chapter';

interface AwardGroupDetails {
  name: string;
  value: string;
}

interface FundingGroups {
  fundingStatement: string;
  awardGroupDetails: AwardGroupDetails[];
}

interface OARequestPayload {
  id: string;
  source: OAAppNameTypes;
  assetType: OAAssetTypes;
  fundingGroups: FundingGroups[];
  license: License;
  permissions: Permission[];
}

export interface OAProductRequest {
  apiVersion: ApiVersionTypes;
  appName: OAAppNameTypes;
  action: OAActionTypes;
  orderNumber: string;
  requestId: string;
  callBackurl: string;
  requestPayload: OARequestPayload;
}
