import { Abstract } from '../shared/abstract';
import { Copyright } from '../shared/copyright';
import { FundingGroup } from '../shared/fundingGroup';
import { License } from '../shared/license';
export interface StoreChapterMetaData {
  abstracts?: Abstract[];
  citation?: string;
  copyright: Copyright;
  description?: string;
  doiRegistrationStatus?: boolean;
  edition?: number;
  firstPublishedYear?: number;
  firstPublishedYearNumber?: number;
  fundingGroups?: FundingGroup[];
  inLanguage: string;
  label?: string;
  license?: License;
  pageEnd?: number;
  pageStart?: number;
  plannedPublicationDate: Date;
  publicationDate?: Date;
  publisherImprint: string;
  subtitle?: string;
}
