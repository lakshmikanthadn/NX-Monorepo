import { Contributor } from './preChapterContributor';
import { IsPartOf } from './isPartOf';
import { PreChapterMetaData } from './preChapterMetaDataV4';

export interface preChapter {
  /**
   * @minLength 1
   */
  title: string;
  type: string;
  chapter: PreChapterMetaData;
  isPartOf: IsPartOf[];
  contributors: Contributor[];
}
