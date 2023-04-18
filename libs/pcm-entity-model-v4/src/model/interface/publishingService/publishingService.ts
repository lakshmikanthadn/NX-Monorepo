import { BaseProduct } from '../product/baseProduct';
import { InternalProps } from '../product/internal/internalProps';
import { PublishingServiceIdentifiers } from './publishingServiceIdentifiers';
import { ServiceMetaData } from './publishingServiceMetaData';

export interface PublishingService extends BaseProduct, InternalProps {
  publishingService: ServiceMetaData;
  identifiers: PublishingServiceIdentifiers;
}
