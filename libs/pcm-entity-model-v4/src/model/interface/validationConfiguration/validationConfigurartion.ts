import { severityType } from '../../common/enum/hubEnums';

export interface IValidationConfiguration {
  name: string;
  severity: severityType;
  messageText: string;
  description: string;
  group: string;
  type: string;
}
