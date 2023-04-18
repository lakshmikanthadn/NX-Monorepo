import { RequestModel } from '@tandfgroup/pcm-entity-model-v4';

export const preChapterProductRequest: RequestModel.PreChapter = {
  chapter: {
    status: 'Available',
    subtitle: 'string'
  },
  contributors: [
    {
      affiliations: [],
      bio: null,
      collab: null,
      email: null,
      familyName: 'Loxley',
      fullName: 'Peter Loxley',
      givenName: 'Peter',
      identifiers: null,
      orcid: null,
      position: 1,
      prefix: null,
      roles: ['author'],
      suffix: null
    }
  ],
  isPartOf: [
    {
      _id: 'uuid-of-book',
      identifiers: {
        isbn: '9781315265209'
      },
      type: 'book'
    }
  ],
  title: 'some title',
  type: 'preChapter'
} as any;
