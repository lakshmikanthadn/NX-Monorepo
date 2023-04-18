export const severityTypeEnum = ['error', 'warning', 'fatal', 'info'] as const;
export type severityType = (typeof severityTypeEnum)[number];

export const publishingItemTypeEnum = [
  'BOOK',
  'ENTRY_VERSION',
  'ARTICLE',
  'CREATIVEWORK'
] as const;

export type publishingItemType = (typeof publishingItemTypeEnum)[number];
