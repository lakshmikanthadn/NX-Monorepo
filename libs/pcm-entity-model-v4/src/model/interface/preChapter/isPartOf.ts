import { preChapterIdentifier } from './preChapterIdentifier';

export interface IsPartOf {
  _id: string;
  type: string;
  identifiers?: preChapterIdentifier;
}
