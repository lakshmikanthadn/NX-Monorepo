import { RequestModel } from '@tandfgroup/pcm-entity-model-v4';

export const publishingServiceProductRequest: RequestModel.PublishingService = {
  categories: [],
  classifications: [],
  contributors: [],
  identifiers: {
    publishingServiceId: 'oama22'
  },
  permissions: [],
  prices: [
    {
      currency: 'AUD',
      price: 3350,
      validFrom: '2019-03-01T14:16:27.308Z'
    }
  ],
  publishingService: {
    description: '',
    status: 'Available'
  },
  rights: [],
  subType: 'articlePublishingCharge',
  title: 'Submission Fee',
  type: 'publishingService',
  version: '1.0.0'
} as any;
