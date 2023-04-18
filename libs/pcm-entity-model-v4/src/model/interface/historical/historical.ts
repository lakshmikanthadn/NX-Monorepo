import { publishingItemType, severityType } from '../../common/enum/hubEnums';

interface Identifiers {
  dac: string;
  doi: string;
  isbn: string;
  pubId: string;
}
interface Metadata {
  title: string;
  copyrightYear: number;
  format: string;
  status: string;
}
interface Entries {
  code: string;
  passed: boolean;
  messages: [string];
  validationType: string;
  _id: string;
  name: string;
  severity: severityType;
  messageText: string;
  description: string;
  group: string;
  type: string;
}
interface ValidationResults {
  entries: [Entries];
  basicValidation: string;
  familyValidation: string;
  crossValidation: string;
  overallValidation: boolean;
}
export interface Historical {
  _id: string;
  baseType: publishingItemType;
  createdDate: Date;
  identifiers: Identifiers;
  isLatest: boolean;
  metadata: Metadata;
  source: string;
  type: string;
  validationResults: ValidationResults;
}
