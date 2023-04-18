import { RequestModel } from '@tandfgroup/pcm-entity-model-v4';

export const journalProductRequest: RequestModel.Journal = {
  classifications: [
    {
      code: null,
      group: 'apc',
      level: null,
      name: 'Review',
      priority: null,
      type: 'article-type'
    },
    {
      code: null,
      group: 'apc',
      level: null,
      name: 'Product-Review',
      priority: null,
      type: 'cats-article-type'
    },
    {
      code: null,
      group: 'apc',
      level: null,
      name: 'Review',
      priority: null,
      type: 'article-type'
    },
    {
      code: null,
      group: 'apc',
      level: null,
      name: 'Review',
      priority: null,
      type: 'article-type'
    }
  ],
  contributors: [
    {
      email: 'abc@gmail.com',
      position: 1,
      roles: ['commissioningEditor']
    }
  ],
  journal: {
    legalOwner: 'US'
  },
  permissions: [
    {
      code: 'OA',
      description: null,
      name: 'open-access',
      text: 'some-text',
      type: 'access',
      validFrom: null,
      validTo: null
    }
  ],
  type: 'journal'
};
