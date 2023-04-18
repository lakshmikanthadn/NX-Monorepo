import { BaseProduct } from '../product/baseProduct';
import { Classification } from '../product/classification/classification';
import { PublishingServiceIdentifiers } from '../publishingService/publishingServiceIdentifiers';
import { ServiceMetaData } from '../publishingService/publishingServiceMetaData';

export type Subtype =
  | 'articlePublishingCharge'
  | 'acceleratedPublishing1'
  | 'acceleratedPublishing3'
  | 'acceleratedPublishing5'
  | 'submissionFee';

export interface PublishingServiceRequestClassification
  extends Omit<Classification, 'group'> {
  group?: string;
}

export interface PublishingServiceProductRequest
  extends Omit<BaseProduct, '_id' | 'classification'> {
  subType: Subtype;
  publishingService: ServiceMetaData;
  identifiers: PublishingServiceIdentifiers;
  classifications?: PublishingServiceRequestClassification[];
}
