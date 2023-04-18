import { DiscountGroup } from '../discountGroup/discountGroup';
import { DistributionCenter } from './distributionCenter';

export interface ImpressionLocation {
  discountGroups?: DiscountGroup[];
  distributionCenter: DistributionCenter;
  plannedPublicationDate?: Date;
  publicationDate?: Date;
}
