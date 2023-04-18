import { StorageModel } from '@tandfgroup/pcm-entity-model-v4';

type Prices = StorageModel.Product['prices'];
type HasPublishingService = StorageModel.HasPublishingService;

export interface IJournalProductServiceMapWrapper extends HasPublishingService {
  prices?: Prices;
  subType?: string;
}

export type IJournalProductServiceMapWithoutId = Omit<
  StorageModel.JournalPublishingServiceMap,
  '_id' | '_createdDate' | '_updatedDate'
>;
export interface IPublishingService {
  type: string;
}
