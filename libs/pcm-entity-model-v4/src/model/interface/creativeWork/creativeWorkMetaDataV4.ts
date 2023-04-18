import { Abstract } from '../shared/abstract';
import { Copyright } from '../shared/copyright';

export interface StoreCreativeWorkMetaData {
  abstracts?: Abstract[];
  copyright: Copyright;
  description?: string;
  firstPublishedYear?: number;
  format: string;
  inLanguage: string;
  plannedPublicationDate: Date;
  publicationDate?: Date;
  publisherImprint: string;
  subtitle?: string;
}
