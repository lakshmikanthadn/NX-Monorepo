import { Abstract } from '../shared/abstract';
import { Copyright } from '../shared/copyright';
import { Count } from '../shared/count';
import { FundingGroup } from '../shared/fundingGroup';
import { License } from '../shared/license';
import { Dates } from './dates';
import { Stage } from './stage';
import { Journal } from './journal';

export interface StoreScholarlyArticleMetaData {
  // graphicalAbstract: string;
  // mediaAbstract: string;
  abstracts?: Abstract[];
  articleSection?: string;
  articleType?: string;
  submissionType?: string;
  articleCategory?: string;
  copyright: Copyright;
  counts?: Count[];
  currentVersion: string;
  dataAvailability?: boolean;
  dates?: Dates;
  journal?: Journal;
  description?: string;
  fundingGroups?: FundingGroup[];
  inLanguage: string;
  license?: License;
  orderInIssue?: number;
  pageEnd?: number;
  pageStart?: number;
  publicationDate?: Date;
  publisherImprint: string;
  stages?: Stage[];
  subtitle?: string;
  archiveStatus?: string;
  decisionFinal?: string;
  inDraft?: string;
  submissionSource?: string;
  prs?: string;
  stage?: string;
  previousSubmissionId?: string;
  decisionType?: string;
  decisionName?: string;
}