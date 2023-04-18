import { StorageModel } from '@tandfgroup/pcm-entity-model-v4';

export interface IProductWrapper {
  product: StorageModel.Product;
  availability?: StorageModel.Availability[];
  identifier?: INameValue;
}

interface INameValue {
  name: string;
  value: string;
}
