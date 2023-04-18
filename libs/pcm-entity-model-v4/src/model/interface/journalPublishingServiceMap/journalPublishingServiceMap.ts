import { HasPublishingService } from './hasPublishingService';
export interface JournalPublishingServiceMap {
  _id: string;
  publishingServices: HasPublishingService[];
  _createdDate: Date;
  _updatedDate: Date;
}
