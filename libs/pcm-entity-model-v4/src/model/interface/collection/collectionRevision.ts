import { StoreCollection } from './collectionV4';

export interface StoreCollectionsRevision extends StoreCollection {
  parentId: string;
  revision: number;
}
