import { Edition } from './edition';

export interface TitleMetaData {
  _id: string;
  editions: Edition[];
  publisherImprint: string;
  source: string;
  title: string;
  titleId: string;
}
