export const PublishingServiceStatusEnum = ['Available', 'Withdrawn'] as const;
export type PublishingServiceStatusType =
  (typeof PublishingServiceStatusEnum)[number];
