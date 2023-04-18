import { CitationContributor } from '../../entryVersion/citationContributor';
import { CitationPublisher } from '../../entryVersion/citationPublisher';

export interface Reference {
  type: string;
  source?: string;
  doi?: string;
  articleTitle?: string;
  pageStart?: string;
  pageEnd?: string;
  volume?: string;
  issue?: string;
  edition?: string;
  publicationYear?: string;
  publisher?: CitationPublisher;
  chapterTitle?: string;
  conferenceName?: string;
  patent?: string;
  patentCountry?: string;
  additionalComments?: string;
  url?: string;
  contributors: CitationContributor[];
  text?: string;
}
