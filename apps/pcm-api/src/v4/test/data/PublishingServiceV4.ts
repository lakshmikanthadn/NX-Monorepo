import { StorageModel } from '@tandfgroup/pcm-entity-model-v4';

export const publishingServiceData: StorageModel.Product[] = [
  {
    _createdDate: null,
    _id: '40950323-665d-42e0-9756-9b613b029b07',
    _isSellable: false,
    _modifiedDate: null,
    _schemaVersion: '4.0.1',
    _sources: [
      {
        source: 'SALESFORCE',
        type: 'product'
      }
    ],
    _status: null,
    audience: [],
    categories: [],
    classifications: [],
    contributors: [],
    identifiers: {
      publishingServiceId: 'oama22'
    },
    isPartOf: [],
    keywords: [],
    permissions: [],
    prices: [
      {
        currency: 'AUD',
        price: 357,
        priceType: 'Retail Price',
        priceTypeCode: 'LP',
        validFrom: new Date('2020-09-21T00:00:00.000+00:00'),
        validTo: null
      }
    ],
    publishingService: {
      description: '',
      status: 'Available'
    },
    rights: [],
    title: 'RAPIDTRACK',
    type: 'publishingService',
    version: '1.0.0'
  },
  {
    _createdDate: null,
    _id: '4553b399-4d49-4137-b0b4-fdcb9fec3657',
    _isSellable: false,
    _modifiedDate: null,
    _schemaVersion: '4.0.1',
    _sources: [
      {
        source: 'SALESFORCE',
        type: 'product'
      }
    ],
    _status: null,
    audience: [],
    categories: [],
    classifications: [
      {
        code: null,
        group: 'apc',
        level: null,
        name: 'Review',
        priority: null,
        type: 'article-type'
      }
    ],
    contributors: [],
    identifiers: {
      publishingServiceId: 'oama22'
    },
    isPartOf: [],
    keywords: [],
    permissions: [],
    prices: [
      {
        currency: 'AUD',
        price: 357,
        priceType: 'Retail Price',
        priceTypeCode: 'LP',
        validFrom: new Date('2020-09-21T00:00:00.000+00:00'),
        validTo: null
      }
    ],
    publishingService: {
      description: '',
      status: 'Available'
    },
    rights: [],
    title: 'Submission Fee',
    type: 'publishingService',
    version: '1.0.0'
  }
];
