export type Product =
  | Book
  | Chapter
  | ScholarlyArticle
  | Collection
  | CreativeWork
  | Set
  | Series
  | Journal
  | PublishingService
  | PreArticle
  | ManuscriptWorkflow
  | Promotional
  | Entry
  | preChapter
  | EntryVersion;

export type Book = 'book';
export type preChapter = 'preChapter';
export type Chapter = 'chapter';
export type ScholarlyArticle = 'scholarlyArticle';
export type Collection = 'collection';
export type CreativeWork = 'creativeWork';
export type Series = 'series';
export type Set = 'set';
export type Journal = 'journal';
export type PublishingService = 'publishingService';
export type PreArticle = 'preArticle';
export type ManuscriptWorkflow = 'manuscriptWorkflow';
export type Promotional = 'promotional';
// New type introduced for encyclopedia
export type Entry = 'entry';
export type EntryVersion = 'entryVersion';
