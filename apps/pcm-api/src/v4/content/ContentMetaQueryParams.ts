export interface IContentMetaQueryParams extends IContentFilterOptions {
  skipEntitlementCheck?: boolean;
  token: string;
}

export interface IContentFilterOptions {
  cf: boolean;
  contentType?: string;
  filenamePrefix?: string;
  ip: string;
  toRender: boolean;
  isBot: boolean;
}
