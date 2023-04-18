import { expect } from 'chai';
import { cloneDeep } from 'lodash';
import { mock } from 'sinon';
import * as sinon from 'sinon';
import * as uuidV4 from 'uuid/v4';

import { Config } from '../../config/config';
import { assetV4Service } from '../assets/AssetV4.Service';
import { simpleQueueService } from '../aws/sqs/SimpleQueue.Service';
import { ackService } from './ACK.Service';
import { kortextProductAck } from './ACK.TestData';
import { ISQSQueueUrlData } from 'v4/model/interfaces/SQSQueueUrlData';

describe('ACK.Service', () => {
  let kortextProductAckTestData;
  beforeEach(() => {
    kortextProductAckTestData = cloneDeep(kortextProductAck);
  });

  describe('ackAssetDistribution', () => {
    const ackEventQueue: ISQSQueueUrlData = Config.getPropertyValue(
      'productAckEventQueue'
    );
    it('should send an event to initiate the product ack', async () => {
      const assetId = uuidV4();
      const dateStub = sinon.stub(global, 'Date').returns(123456789);
      const assetV4ServiceMock = mock(assetV4Service);
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(assetId, ['_id'])
        .resolves({ _id: assetId });
      const eventPayload = {
        ...kortextProductAckTestData,
        _id: assetId,
        stage: 'ACK',
        transferDate: new Date(),
        type: 'product'
      };
      const simpleQueueServiceMock = mock(simpleQueueService);
      simpleQueueServiceMock
        .expects('sendMessage')
        .once()
        .withArgs(ackEventQueue, JSON.stringify(eventPayload), assetId)
        .resolves('some-event-id');
      try {
        const eventId = await ackService.ackAssetDistribution(
          assetId,
          kortextProductAckTestData
        );
        expect(eventId).to.equal('some-event-id');
        assetV4ServiceMock.verify();
        simpleQueueServiceMock.verify();
      } finally {
        assetV4ServiceMock.restore();
        simpleQueueServiceMock.restore();
        dateStub.restore();
      }
    });
    it('should throw error if the identifier is not UUID version 4', async () => {
      const assetId = uuidV4();
      const simpleQueueServiceMock = mock(simpleQueueService);
      const assetV4ServiceMock = mock(assetV4Service);
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(assetId, ['_id'])
        .resolves(null);
      simpleQueueServiceMock.expects('sendMessage').never();
      try {
        await ackService.ackAssetDistribution(
          assetId,
          kortextProductAckTestData
        );
        throw new Error('Expecting error, got success');
      } catch (error) {
        simpleQueueServiceMock.verify();
        assetV4ServiceMock.verify();
        expect(error.code).to.equal(404);
        expect(error.name).to.equal(`AppError`);
        expect(error.message).to.equal(
          `Product does NOT exists with id ${assetId}.`
        );
      } finally {
        assetV4ServiceMock.restore();
        simpleQueueServiceMock.restore();
      }
    });
    it('should throw error when product id does not exist in asset', async () => {
      const assetId = 'some-id';
      const simpleQueueServiceMock = mock(simpleQueueService);
      const assetV4ServiceMock = mock(assetV4Service);
      assetV4ServiceMock.expects('getAssetById').never();
      simpleQueueServiceMock.expects('sendMessage').never();
      try {
        await ackService.ackAssetDistribution(
          assetId,
          kortextProductAckTestData
        );
        throw new Error('Expecting error, got success');
      } catch (error) {
        simpleQueueServiceMock.verify();
        assetV4ServiceMock.verify();
        expect(error.code).to.equal(400);
        expect(error.name).to.equal(`AppError`);
        expect(error.message).to.equal(
          `Invalid UUID(v4) in the path parameter.`
        );
      } finally {
        assetV4ServiceMock.restore();
        simpleQueueServiceMock.restore();
      }
    });
    it('should throw error if appName is not valid', async () => {
      const assetId = uuidV4();
      const simpleQueueServiceMock = mock(simpleQueueService);
      const assetV4ServiceMock = mock(assetV4Service);
      assetV4ServiceMock.expects('getAssetById').never();
      simpleQueueServiceMock.expects('sendMessage').never();
      try {
        await ackService.ackAssetDistribution(assetId, {
          ...kortextProductAckTestData,
          name: 'NOT-KORTEXT'
        });
        throw new Error('Expecting error, got success');
      } catch (error) {
        simpleQueueServiceMock.verify();
        assetV4ServiceMock.verify();
        expect(error.code).to.equal(400);
        expect(error.name).to.equal(`AppError`);
        expect(error.message).to.equal(`Validation error`);
      } finally {
        assetV4ServiceMock.restore();
        simpleQueueServiceMock.restore();
      }
    });
  });
});
