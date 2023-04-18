import { expect } from 'chai';
import * as sinon from 'sinon';

import { Config } from '../../config/config';
import { simpleStorageService } from '../aws/sns/SimpleStorage.Service';
import { simpleQueueService } from '../aws/sqs/SimpleQueue.Service';
import { eventService, ISendSQSMessage } from './Event.Service';

const eventsStoreBucket = Config.getPropertyValue('eventStoreBucket');

describe('Event.Service', () => {
  describe('sendProductEvent', () => {
    let testData;
    let dateNowStub;
    beforeEach(() => {
      dateNowStub = sinon.stub(Date, 'now').callsFake(() => 1621023034794);
      testData = {
        messageId: 'message-id-123',
        productId: '1234',
        productType: 'product',
        queueUrlData: {
          isFifoQueue: true,
          url: 'some-queue-url'
        },
        source: 'productSource'
      };
    });
    afterEach(() => {
      dateNowStub.restore();
    });

    it('it should deposit the product data in s3 and send SQS message', async () => {
      const productData = {};
      const path = `/${testData.source}/inbound${
        testData.productType ? '/' + testData.productType : ''
      }`;
      const fileName = `${
        testData.productId ? testData.productId + '_' : ''
      }${Date.now()}.json`;
      const sqsMessage: ISendSQSMessage = {
        application: 'PAC API',
        messageTimestamp: Date.now(),
        sourceFileUrl: 'some-location',
        status: 'success'
      };
      if (testData.productType) {
        sqsMessage.assetType = testData.productType;
      }
      if (testData.productId) {
        sqsMessage.publishingItemId = testData.productId;
      }
      const simpleStorageServiceMock = sinon.mock(simpleStorageService);
      const simpleQueueServiceMock = sinon.mock(simpleQueueService);
      simpleStorageServiceMock
        .expects('upload')
        .once()
        .withArgs(
          eventsStoreBucket,
          path,
          fileName,
          JSON.stringify({ data: productData })
        )
        .resolves('some-location');
      simpleQueueServiceMock
        .expects('sendMessage')
        .once()
        .withArgs(
          testData.queueUrlData,
          JSON.stringify(sqsMessage),
          testData.productId
        )
        .resolves('message-id');
      try {
        const messageId = await eventService.sendProductEvent(
          productData,
          testData.queueUrlData,
          testData.source,
          {
            productId: testData.productId,
            productType: testData.productType
          }
        );
        simpleStorageServiceMock.verify();
        expect(messageId).to.equal('message-id');
        simpleQueueServiceMock.verify();
      } catch (e) {
        console.error(e);
        throw e;
      } finally {
        simpleStorageServiceMock.restore();
        simpleQueueServiceMock.restore();
      }
    });
    it('it should not throw an error when productid and productType is not passed', async () => {
      testData = {
        messageId: 'message-id-123',
        queueUrlData: {
          isFifoQueue: false,
          url: 'some-queue-url'
        },
        source: 'productSource'
      };
      const productData = {};
      const path = `/${testData.source}/inbound${
        testData.productType ? '/' + testData.productType : ''
      }`;
      const fileName = `${
        testData.productId ? testData.productId + '_' : ''
      }${Date.now()}.json`;
      const sqsMessage: ISendSQSMessage = {
        application: 'PAC API',
        messageTimestamp: Date.now(),
        sourceFileUrl: 'some-location',
        status: 'success'
      };
      if (testData.productType) {
        sqsMessage.assetType = testData.productType;
      }
      if (testData.productId) {
        sqsMessage.publishingItemId = testData.productId;
      }
      const simpleStorageServiceMock = sinon.mock(simpleStorageService);
      const simpleQueueServiceMock = sinon.mock(simpleQueueService);
      simpleStorageServiceMock
        .expects('upload')
        .once()
        .withArgs(
          eventsStoreBucket,
          path,
          fileName,
          JSON.stringify({ data: productData })
        )
        .resolves('some-location');
      simpleQueueServiceMock
        .expects('sendMessage')
        .once()
        .withArgs(testData.queueUrlData, JSON.stringify(sqsMessage))
        .resolves('message-id');
      try {
        const messageId = await eventService.sendProductEvent(
          productData,
          testData.queueUrlData,
          testData.source,
          {}
        );
        simpleStorageServiceMock.verify();
        expect(messageId).to.equal('message-id');
        simpleQueueServiceMock.verify();
      } catch (e) {
        console.error(e);
        throw e;
      } finally {
        simpleStorageServiceMock.restore();
        simpleQueueServiceMock.restore();
      }
    });

    it('it should pick product _id and type if productId & productType options are not passed', async () => {
      const productData = {
        _id: testData.productId,
        type: testData.productType
      };
      const path = `/${testData.source}/inbound${
        testData.productType ? '/' + testData.productType : ''
      }`;
      const fileName = `${
        testData.productId ? testData.productId + '_' : ''
      }${Date.now()}.json`;
      const sqsMessage: ISendSQSMessage = {
        application: 'PAC API',
        messageTimestamp: Date.now(),
        sourceFileUrl: 'some-location',
        status: 'success'
      };
      if (testData.productType) {
        sqsMessage.assetType = testData.productType;
      }
      if (testData.productId) {
        sqsMessage.publishingItemId = testData.productId;
      }
      const simpleStorageServiceMock = sinon.mock(simpleStorageService);
      const simpleQueueServiceMock = sinon.mock(simpleQueueService);
      simpleStorageServiceMock
        .expects('upload')
        .once()
        .withArgs(
          eventsStoreBucket,
          path,
          fileName,
          JSON.stringify({ data: productData })
        )
        .resolves('some-location');
      simpleQueueServiceMock
        .expects('sendMessage')
        .once()
        .withArgs(
          testData.queueUrlData,
          JSON.stringify(sqsMessage),
          testData.productId
        )
        .resolves('message-id');
      try {
        const messageId = await eventService.sendProductEvent(
          productData,
          testData.queueUrlData,
          testData.source,
          {}
        );
        simpleStorageServiceMock.verify();
        expect(messageId).to.equal('message-id');
        simpleQueueServiceMock.verify();
      } catch (e) {
        console.error(e);
        throw e;
      } finally {
        simpleStorageServiceMock.restore();
        simpleQueueServiceMock.restore();
      }
    });

    it('it should throw error and should NOT send message if file upload fails', async () => {
      const productData = {};
      const simpleStorageServiceStub = sinon
        .stub(simpleStorageService, 'upload')
        .callsFake(() => Promise.reject(new Error('Upload failed')));
      const simpleQueueServiceMock = sinon.mock(simpleQueueService);
      simpleQueueServiceMock.expects('sendMessage').never();
      try {
        await eventService.sendProductEvent(
          productData,
          testData.queueUrlData,
          testData.source,
          {
            productId: testData.productId,
            productType: testData.productType
          }
        );
        throw new Error('Expecting error, got success.');
      } catch (e) {
        expect(e.message).to.equal('Upload failed');
        simpleQueueServiceMock.verify();
      } finally {
        simpleStorageServiceStub.restore();
        simpleQueueServiceMock.restore();
      }
    });

    it('it should throw error when file upload succeeds but messaging fails', async () => {
      const productData = {};
      const simpleStorageServiceStub = sinon
        .stub(simpleStorageService, 'upload')
        .callsFake(() => Promise.resolve('some-s3-location'));
      const simpleQueueServiceStub = sinon
        .stub(simpleQueueService, 'sendMessage')
        .callsFake(() => Promise.reject(new Error('Message failed')));
      try {
        await eventService.sendProductEvent(
          productData,
          testData.queueUrlData,
          testData.source,
          {
            productId: testData.productId,
            productType: testData.productType
          }
        );
        throw new Error('Expecting error, got success.');
      } catch (e) {
        expect(e.message).to.equal('Message failed');
      } finally {
        simpleStorageServiceStub.restore();
        simpleQueueServiceStub.restore();
      }
    });
  });
});
