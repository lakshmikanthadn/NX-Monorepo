import { Abstract } from '../shared/abstract';
import { Copyright } from '../shared/copyright';
import { Count } from '../shared/count';
import { Customer } from '../shared/customer';
import { Channel } from '../shared/channel';
import { CollectionLicense } from '../shared/collectionLicense';
import { TaxType } from '../shared/taxType';
import { Status } from '../shared/collectionStatus';
import { SubjectAreaCode } from '../shared/subjectAreaCode';

export interface StoreCollectionMetaData {
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
  validFrom?: Date;
  ruleUpdateStartDate?: Date;
  ruleUpdateEndDate?: Date;
  abstracts: Abstract[];
  backList?: boolean;
  channels?: Channel[];
  customers?: Customer[];
  licenses: CollectionLicense[];
  publicationDate?: Date;
  copyright: Copyright;
  inLanguage: string;
  updatedFrom: Date;
  updatedTo: Date;
  counts?: Count[];
  citation?: string;
  doiRegistrationStatus?: boolean;
  edition?: number;
}
