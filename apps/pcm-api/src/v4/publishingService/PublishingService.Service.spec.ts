import { StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import { expect } from 'chai';
import { cloneDeep } from 'lodash';
import { mock } from 'sinon';
import * as sinon from 'sinon';
import * as uuidV4 from 'uuid/v4';

import { Config } from '../../config/config';
import { assetV4Service } from '../assets/AssetV4.Service';
import { eventService } from '../event/Event.Service';
import { productV4DAO } from '../products/ProductV4.DAO';
import { publishingServiceProductService } from './PublishingService.Service';
import { publishingServiceProductRequest } from './PublishingService.TestData';
import { ISQSQueueUrlData } from '../../v4/model/interfaces/SQSQueueUrlData';

const publishingServiceProductEventQueue: ISQSQueueUrlData =
  Config.getPropertyValue('publishingServiceProductEventQueue');

type Prices = StorageModel.Product['prices'];
const publishingServiceData: { prices: Prices; subType: string } = {
  prices: [
    {
      currency: 'AUD',
      price: 3350,
      priceType: null,
      priceTypeCode: null,
      validFrom: null,
      validTo: null
    }
  ],
  subType: 'RapidTrack'
};

describe('PublishingService.Service', () => {
  let publishingServiceTestData;
  beforeEach(() => {
    publishingServiceTestData = cloneDeep(publishingServiceProductRequest);
  });
  function getStubData() {
    const assetV4ServiceMock = sinon.mock(assetV4Service);
    const productV4DAOMock = sinon.mock(productV4DAO);
    return {
      assetV4ServiceMock,
      productV4DAOMock
    };
  }
  describe('createServiceProduct', () => {
    it('should send an event to initiate the publishing product update', async () => {
      const publishingServiceId = uuidV4();
      const eventPayload = {
        _id: publishingServiceId,
        ...publishingServiceTestData,
        _sources: [{ source: 'SALESFORCE', type: 'product' }]
      };
      const eventServiceMock = mock(eventService);
      const assetV4ServiceMock = mock(assetV4Service);
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(publishingServiceId, ['_id', 'type'])
        .resolves(null);
      eventServiceMock
        .expects('sendProductEvent')
        .once()
        .withArgs(
          eventPayload,
          publishingServiceProductEventQueue,
          'SALESFORCE',
          {
            productId: publishingServiceId,
            productType: 'publishingService'
          }
        )
        .resolves('some-event-id');
      try {
        const eventId =
          await publishingServiceProductService.createServiceProduct(
            publishingServiceId,
            publishingServiceTestData
          );
        expect(eventId).to.equal('some-event-id');
        assetV4ServiceMock.verify();
        eventServiceMock.verify();
      } finally {
        assetV4ServiceMock.restore();
        eventServiceMock.restore();
      }
    });
    it('should throw error if publishing product data is invalid', async () => {
      const productIdentifier = uuidV4();
      const assetV4ServiceMock = mock(assetV4Service);
      assetV4ServiceMock.expects('getProductByIdentifier').never();
      const eventServiceMock = mock(eventService);
      eventServiceMock.expects('sendProductEvent').never();
      try {
        await publishingServiceProductService.createServiceProduct(
          productIdentifier,
          {} as any
        );
        throw new Error('Expecting error, got success');
      } catch (error) {
        expect(error.code).to.equal(400);
        expect(error.name).to.equal(`AppError`);
        expect(error.message).to.equal(`Validation error`);
        assetV4ServiceMock.verify();
        eventServiceMock.verify();
      } finally {
        assetV4ServiceMock.restore();
        eventServiceMock.restore();
      }
    });
    it('should throw error when the asset already exists for the identifier', async () => {
      const publishingServiceId = uuidV4();
      const eventServiceMock = mock(eventService);
      const assetV4ServiceMock = mock(assetV4Service);
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(publishingServiceId, ['_id', 'type'])
        .resolves({ _id: publishingServiceId, type: 'book' });
      eventServiceMock.expects('sendProductEvent').never();
      try {
        await publishingServiceProductService.createServiceProduct(
          publishingServiceId,
          publishingServiceTestData
        );
        throw new Error('Expecting error, got success');
      } catch (error) {
        expect(error.code).to.equal(409);
        expect(error.name).to.equal(`AppError`);
        expect(error.message).to.equal(
          `A product book already exists with id ${publishingServiceId}.`
        );
        assetV4ServiceMock.verify();
        eventServiceMock.verify();
      } finally {
        assetV4ServiceMock.restore();
        eventServiceMock.restore();
      }
    });
    it('should throw error if identifier is not UUID version 4', async () => {
      const publishingServiceId = 'some-id';
      const eventServiceMock = mock(eventService);
      const assetV4ServiceMock = mock(assetV4Service);
      assetV4ServiceMock.expects('getAssetById').never();
      eventServiceMock.expects('sendProductEvent').never();
      try {
        await publishingServiceProductService.createServiceProduct(
          publishingServiceId,
          publishingServiceTestData
        );
        throw new Error('Expecting error, got success');
      } catch (error) {
        expect(error.code).to.equal(400);
        expect(error.name).to.equal(`AppError`);
        expect(error.message).to.equal(
          `Invalid UUID(v4) in the path parameter.`
        );
        assetV4ServiceMock.verify();
        eventServiceMock.verify();
      } finally {
        assetV4ServiceMock.restore();
        eventServiceMock.restore();
      }
    });
  });

  describe('updateServiceProduct', () => {
    it('should send an event to initiate the publishing product update', async () => {
      const publishingServiceId = uuidV4();
      const eventPayload = {
        _id: publishingServiceId,
        ...publishingServiceTestData,
        _sources: [{ source: 'SALESFORCE', type: 'product' }]
      };
      const eventServiceMock = mock(eventService);
      const assetV4ServiceMock = mock(assetV4Service);
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(publishingServiceId, ['_id', 'type'])
        .resolves({ _id: publishingServiceId, type: 'book' });
      eventServiceMock
        .expects('sendProductEvent')
        .once()
        .withArgs(
          eventPayload,
          publishingServiceProductEventQueue,
          'SALESFORCE',
          {
            productId: publishingServiceId,
            productType: 'publishingService'
          }
        )
        .resolves('some-event-id');
      try {
        const eventId =
          await publishingServiceProductService.updateServiceProduct(
            publishingServiceId,
            publishingServiceTestData
          );
        expect(eventId).to.equal('some-event-id');
        assetV4ServiceMock.verify();
        eventServiceMock.verify();
      } finally {
        assetV4ServiceMock.restore();
        eventServiceMock.restore();
      }
    });
    it('should throw error if publishing product data is invalid', async () => {
      const productIdentifier = uuidV4();
      const assetV4ServiceMock = mock(assetV4Service);
      assetV4ServiceMock.expects('getAssetById').never();
      const eventServiceMock = mock(eventService);
      eventServiceMock.expects('sendProductEvent').never();
      try {
        await publishingServiceProductService.updateServiceProduct(
          productIdentifier,
          {} as any
        );
        throw new Error('Expecting error, got success');
      } catch (error) {
        expect(error.code).to.equal(400);
        expect(error.name).to.equal(`AppError`);
        expect(error.message).to.equal(`Validation error`);
        assetV4ServiceMock.verify();
        eventServiceMock.verify();
      } finally {
        assetV4ServiceMock.restore();
        eventServiceMock.restore();
      }
    });
    it('should throw error when the asset does not exist for the identifier', async () => {
      const publishingServiceId = uuidV4();
      const eventServiceMock = mock(eventService);
      const assetV4ServiceMock = mock(assetV4Service);
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(publishingServiceId, ['_id', 'type'])
        .resolves(null);
      eventServiceMock.expects('sendProductEvent').never();
      try {
        await publishingServiceProductService.updateServiceProduct(
          publishingServiceId,
          publishingServiceTestData
        );
        throw new Error('Expecting error, got success');
      } catch (error) {
        expect(error.code).to.equal(404);
        expect(error.name).to.equal(`AppError`);
        expect(error.message).to.equal(
          `Publishing Service product does NOT exists with id ${publishingServiceId}.`
        );
        assetV4ServiceMock.verify();
        eventServiceMock.verify();
      } finally {
        assetV4ServiceMock.restore();
        eventServiceMock.restore();
      }
    });
    it('should throw error if identifier is not UUID version 4', async () => {
      const publishingServiceId = 'some-id';
      const eventServiceMock = mock(eventService);
      const assetV4ServiceMock = mock(assetV4Service);
      assetV4ServiceMock.expects('getAssetById').never();
      eventServiceMock.expects('sendProductEvent').never();
      try {
        await publishingServiceProductService.updateServiceProduct(
          publishingServiceId,
          publishingServiceTestData
        );
        throw new Error('Expecting error, got success');
      } catch (error) {
        expect(error.code).to.equal(400);
        expect(error.name).to.equal(`AppError`);
        expect(error.message).to.equal(
          `Invalid UUID(v4) in the path parameter.`
        );
        assetV4ServiceMock.verify();
        eventServiceMock.verify();
      } finally {
        assetV4ServiceMock.restore();
        eventServiceMock.restore();
      }
    });
  });

  describe('getPublishingServiceById', () => {
    it('should send publishing product when product exist with id', async () => {
      const stubData = getStubData();
      const id = 'some-id';
      stubData.assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves({ _id: 'some_id', type: 'publishingService' });
      stubData.productV4DAOMock
        .expects('getProduct')
        .once()
        .withArgs('publishingService', id, ['prices', 'subType'])
        .resolves(publishingServiceData);
      try {
        const psData =
          await publishingServiceProductService.getPublishingServiceById(id);
        expect(psData).to.have.property('prices', publishingServiceData.prices);
        expect(psData).to.have.property('subType', 'RapidTrack');
        stubData.assetV4ServiceMock.verify();
        stubData.productV4DAOMock.verify();
      } finally {
        stubData.assetV4ServiceMock.restore();
        stubData.productV4DAOMock.restore();
      }
    });

    it('should send null when product do not exist with id', async () => {
      const stubData = getStubData();
      const id = 'some-id';
      stubData.assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves({ _id: 'some_id', type: 'publishingService' });
      stubData.productV4DAOMock
        .expects('getProduct')
        .once()
        .withArgs('publishingService', id, ['prices', 'subType'])
        .resolves(null);
      try {
        const psData =
          await publishingServiceProductService.getPublishingServiceById(id);
        expect(psData).to.have.property('prices', null);
        expect(psData).to.have.property('subType', null);
        stubData.assetV4ServiceMock.verify();
        stubData.productV4DAOMock.verify();
      } finally {
        stubData.assetV4ServiceMock.restore();
        stubData.productV4DAOMock.restore();
      }
    });

    it('should return Product not found. by passing valid UUID ', (done) => {
      const id = 'some-id';
      const stubData = getStubData();
      stubData.assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id)
        .returns(null);
      stubData.productV4DAOMock.expects('getProduct').never();
      publishingServiceProductService
        .getPublishingServiceById(id)
        .then(() => {
          done(
            new Error('Expecting Product (asset) not found. but got success')
          );
        })
        .catch((err) => {
          expect(err.message).to.equal('Product (asset) not found.');
          expect(err.code).to.equal(404);
          stubData.assetV4ServiceMock.verify();
          stubData.productV4DAOMock.verify();
          done();
        })
        .finally(() => {
          stubData.assetV4ServiceMock.restore();
          stubData.productV4DAOMock.restore();
        });
    });
  });
});
