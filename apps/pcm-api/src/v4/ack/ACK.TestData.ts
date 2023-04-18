import { RequestModel } from '@tandfgroup/pcm-entity-model-v4';

export const kortextProductAck: RequestModel.ProductAcknowledgement = {
  correlationId: 'abc123',
  messages: ['some messages'],
  name: 'KORTEXT',
  status: 'success'
};
