import { publishingItemType } from '../../common/enum/hubEnums';

interface IValidIngestedItems {
  ingestedItemId: string;
  type: string;
  hasErrors: boolean;
}

interface IRelatedItems {
  type: string;
  webPdfIsbn: string;
  mobiIsbn: string;
  epubIsbn: string;
}

export interface IPublishingItem {
  _id: string;
  type: publishingItemType;
  validIngestedItems: [IValidIngestedItems];
  latestIngestedItems: [IValidIngestedItems];
  latestCrossValidationResult?: string;
  familyCrossValidationResult?: string;
  issueId?: string;
  doi?: string;
  entryDoi?: string;
  isbn?: string;
  bookFormat?: string;
  dac?: string;
  status?: string;
  stage?: string;
  relatedItems?: IRelatedItems;
  contentUpdateAllowed?: boolean;
  journalAcronym?: string;
  volume?: string;
}
