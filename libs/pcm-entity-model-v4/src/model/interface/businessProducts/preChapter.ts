import { preChapter } from '../preChapter/preChapter';
import { IsPartOf } from './../product/isPartOf/isPartOf';

export interface PreChapterProductRequest extends Omit<preChapter, 'isPartOf'> {
  isPartOf?: IsPartOf[];
}
