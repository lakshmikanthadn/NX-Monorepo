import { Abstract } from '../shared/abstract';
import { Heading } from './heading';

export interface StoreEntryVersionMetaData {
  publisherImprint: string;
  status: string;
  edition?: string;
  heading: Heading;
  abstracts?: Abstract[];
  citation?: string;
  doiRegistrationStatus?: boolean;
  firstPublishedYear?: number;
  publicationDate?: Date;
}
