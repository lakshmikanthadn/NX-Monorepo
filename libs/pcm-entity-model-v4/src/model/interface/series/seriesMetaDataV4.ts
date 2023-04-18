import { Abstract } from '../shared/abstract';
import { Copyright } from '../shared/copyright';
import { Count } from '../shared/count';

export interface StoreSeriesMetaData {
  subtitle: string;
  shortTitle: string;
  description: string;
  publisherImprint: string;
  publicationDate: Date;
  copyright: Copyright;
  edition: number;
  formatCode: string;
  format: string;
  publisherArea: string;
  publisherAreaCode: string;
  publicationLocation: string;
  division: string;
  divisionCode: string;
  legalOwner: string;
  status: string;
  statusCode: string;
  doiRegistrationStatus: boolean;
  firstPublishedYear: number;
  plannedPublicationDate: Date;
  inLanguage: string;
  abstracts: Abstract[];
  counts: Count[];
  citation: string;
}
