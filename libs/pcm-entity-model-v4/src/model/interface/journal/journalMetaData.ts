import { Abstract } from '../shared/abstract';
import { Copyright } from '../shared/copyright';
import { Lifetime } from './lifeTime';

export interface JournalMetaData {
  abstracts?: Abstract[];
  acronym: string;
  citation?: string;
  copyright?: Copyright;
  description?: string;
  doiRegistrationStatus?: boolean;
  edition?: number;
  endVolume?: string;
  firstPublishedYear?: number;
  inLanguage?: string;
  lifetime?: Lifetime;
  ownership?: string;
  plannedPublicationDate?: Date;
  publicationDate?: Date;
  publisherImprint: string;
  startVolume?: string;
  subtitle?: string;
  status: string;
}
