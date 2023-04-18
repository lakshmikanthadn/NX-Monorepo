import { PublishingServiceStatusType } from '../../common/enum/publishingServiceStatus';

export interface ServiceMetaData {
  status: PublishingServiceStatusType;
  description: string;
}
