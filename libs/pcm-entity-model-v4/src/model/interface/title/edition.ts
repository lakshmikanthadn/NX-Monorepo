import { Format } from './format';

export interface Edition {
  createdDate?: Date;
  dacKey: string;
  doi: string;
  edition: string;
  formats: Format[];
  modifiedDate?: Date;
}
