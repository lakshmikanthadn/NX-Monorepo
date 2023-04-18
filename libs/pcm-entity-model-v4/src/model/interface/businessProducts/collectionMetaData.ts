import { Customer } from '../shared/customer';
import { Channel } from '../shared/channel';
import { CollectionLicense } from '../shared/collectionLicense';
import { TaxType } from '../shared/taxType';
import { Status } from '../shared/collectionStatus';
import { SubjectAreaCode } from '../shared/subjectAreaCode';

interface CollectionAbstract {
  type: string;
  value: string;
}

export interface CollectionMetaData {
  taxType: TaxType;
  subtitle?: string;
  description?: string;
  status?: Status;
  autoRollover?: boolean;
  subjectAreaCode: SubjectAreaCode;
  firstPublishedYear: number;
  plannedPublicationDate: Date;
  publisherImprint?: string;
  totalCount?: number;
  validTo?: Date;
  validFrom: Date;
  ruleUpdateStartDate?: Date;
  ruleUpdateEndDate?: Date;
  abstracts: CollectionAbstract[];
  backList?: boolean;
  channels: Channel[];
  customers: Customer[];
  licenses: CollectionLicense[];
}
