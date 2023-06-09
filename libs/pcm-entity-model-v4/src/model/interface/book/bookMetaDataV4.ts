import { Abstract } from '../shared/abstract';
import { BibliographicSpecification } from '../shared/bibliographicSpecification';
import { Copyright } from '../shared/copyright';
import { Count } from '../shared/count';
import { FormerImprint } from '../shared/formerImprint';
import { FundingGroup } from '../shared/fundingGroup';
import { License } from '../shared/license';
import { ProductionSpecification } from '../shared/productSpecification';

export interface StoreBookMetaData {
  abstracts?: Abstract[];
  bibliographicSpecification?: BibliographicSpecification;
  bindingStyle: string;
  bindingStyleCode: string;
  citation?: string;
  copyright: Copyright;
  counts?: Count[];
  description?: string;
  division?: string;
  divisionCode?: string;
  doiRegistrationStatus?: boolean;
  edition?: number;
  firstPublishedYear?: number;
  firstPublishedYearNumber?: number;
  format: string;
  formatCode: string;
  formerImprints?: FormerImprint[];
  inLanguage: string;
  legacyDivision?: string;
  legalOwner?: string;
  plannedPublicationDate: Date;
  productionSpecification?: ProductionSpecification;
  publicationDate?: Date;
  publicationLocation?: string;
  publisherArea?: string;
  publisherAreaCode?: string;
  publisherImprint: string;
  shortTitle?: string;
  status: string;
  statusCode: string;
  subtitle?: string;
  textType?: string;
  textTypeCode?: string;
  toc?: string;
  fundingGroups?: FundingGroup[];
  license?: License;
}
