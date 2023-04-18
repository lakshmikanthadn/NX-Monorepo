import { StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import { expect } from 'chai';
import * as _ from 'lodash';
import { mock } from 'sinon';
import * as sinon from 'sinon';

import { Config } from '../../config/config';
import { assetV4Service } from '../assets/AssetV4.Service';
import { eventService } from '../event/Event.Service';
import {
  IJournalProductServiceMapWithoutId,
  IPublishingService
} from '../model/interfaces/JournalPublishingServiceMapWrapper';
import { publishingServiceProductService } from '../publishingService/PublishingService.Service';
import { journalPublishingServiceMapV4DAO } from './JournalPubServiceMap.Dao';
import { journalPublishingServiceMapService } from './JournalPubServiceMap.Service';
import { journalPublishingServiceMap } from './JournalPubServiceMap.TestData';
import { ISQSQueueUrlData } from 'v4/model/interfaces/SQSQueueUrlData';

const journalPublishingServiceMapData: IJournalProductServiceMapWithoutId = {
  publishingServices: [
    {
      _id: '40950323-665d-42e0-9756-9b613b029b07',
      classification: {
        name: 'Product Review',
        type: 'article-type'
      },
      validFrom: null,
      validTo: null
    },
    {
      _id: '40950323-665d-42e0-9756-9b613b029b07',
      classification: {
        name: 'PR1',
        type: 'cats-article-type'
      },
      validFrom: null,
      validTo: null
    }
  ]
};
type Prices = StorageModel.Product['prices'];
const publishingServiceData: {
  prices: Prices;
  publishingService: IPublishingService;
} = {
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
  publishingService: {
    type: 'Rapidtrack'
  }
};

describe('JournalPublishingServiceMap.Service', () => {
  let mappingTestData;
  beforeEach(() => {
    mappingTestData = _.cloneDeep(journalPublishingServiceMap);
  });
  function getStubData() {
    const journalPublishingServiceMapV4DAOMock = sinon.mock(
      journalPublishingServiceMapV4DAO
    );
    const assetV4ServiceMock = sinon.mock(assetV4Service);
    const publishingServiceProductServiceMock = sinon.mock(
      publishingServiceProductService
    );
    return {
      assetV4ServiceMock,
      journalPublishingServiceMapV4DAOMock,
      publishingServiceProductServiceMock
    };
  }
  describe('updateJournalPublishingServiceMap', () => {
    const journalPublishingServiceMapEventQueue: ISQSQueueUrlData =
      Config.getPropertyValue('journalPublishingServiceMapEventQueue');
    it('should send an event to initiate the JournalPublishingServiceMap update', async () => {
      const journalId = 'some-id';
      const identifierName = 'journalAcronym';
      const eventPayload = {
        _id: journalId,
        ...mappingTestData
      };
      const publishingServiceIds = _.uniq(
        eventPayload.publishingServices.map((ps) => ps._id)
      );
      const eventServiceMock = mock(eventService);
      const assetV4ServiceMock = mock(assetV4Service);
      assetV4ServiceMock
        .expects('getProductByIdentifier')
        .once()
        .withArgs(identifierName, journalId)
        .resolves({ _id: 1 });
      assetV4ServiceMock
        .expects('getAssetsByIds')
        .once()
        .withArgs(publishingServiceIds)
        .resolves(
          publishingServiceIds.map((id) => {
            return { _id: id, type: 'publishingService' };
          })
        );
      eventServiceMock
        .expects('sendProductEvent')
        .once()
        .withArgs(
          eventPayload,
          journalPublishingServiceMapEventQueue,
          'SALESFORCE',
          {
            productId: journalId,
            productType: 'journalPublishingServiceMapping'
          }
        )
        .resolves('some-event-id');
      try {
        const eventId =
          await journalPublishingServiceMapService.updateJournalPublishingServiceMap(
            journalId,
            identifierName,
            mappingTestData
          );
        expect(eventId).to.equal('some-event-id');
        assetV4ServiceMock.verify();
        eventServiceMock.verify();
      } finally {
        assetV4ServiceMock.restore();
        eventServiceMock.restore();
      }
    });
    it('should NOT throw error when the mapping publishingService ids are duplicated', async () => {
      const journalId = 'some-id';
      const identifierName = 'journalAcronym';
      const eventPayload = {
        _id: journalId,
        ...mappingTestData
      };
      const publishingServiceIds = _.uniq(
        eventPayload.publishingServices.map((ps) => ps._id)
      );
      const eventServiceMock = mock(eventService);
      const assetV4ServiceMock = mock(assetV4Service);
      assetV4ServiceMock
        .expects('getProductByIdentifier')
        .once()
        .withArgs(identifierName, journalId)
        .resolves({ _id: 1 });
      assetV4ServiceMock
        .expects('getAssetsByIds')
        .once()
        .withArgs(publishingServiceIds)
        .resolves(
          publishingServiceIds.map((id) => {
            return { _id: id, type: 'publishingService' };
          })
        );
      eventServiceMock
        .expects('sendProductEvent')
        .once()
        .withArgs(
          eventPayload,
          journalPublishingServiceMapEventQueue,
          'SALESFORCE',
          {
            productId: journalId,
            productType: 'journalPublishingServiceMapping'
          }
        )
        .resolves('some-event-id');
      try {
        const eventId =
          await journalPublishingServiceMapService.updateJournalPublishingServiceMap(
            journalId,
            identifierName,
            mappingTestData
          );
        expect(eventId).to.equal('some-event-id');
        assetV4ServiceMock.verify();
        eventServiceMock.verify();
      } finally {
        assetV4ServiceMock.restore();
        eventServiceMock.restore();
      }
    });
    it('should throw error if JournalPublishingServiceMap data is invalid', async () => {
      const productIdentifier = 'some-id';
      const productIdentifierName = 'journalAcronym';
      const assetV4ServiceMock = mock(assetV4Service);
      assetV4ServiceMock.expects('getProductByIdentifier').never();
      assetV4ServiceMock.expects('getAssetsByIds').never();
      const eventServiceMock = mock(eventService);
      eventServiceMock.expects('sendProductEvent').never();
      try {
        await journalPublishingServiceMapService.updateJournalPublishingServiceMap(
          productIdentifier,
          productIdentifierName,
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
      const journalId = 'some-id';
      const identifierName = 'journalAcronym';
      const eventServiceMock = mock(eventService);
      const assetV4ServiceMock = mock(assetV4Service);
      assetV4ServiceMock
        .expects('getProductByIdentifier')
        .once()
        .withArgs(identifierName, journalId)
        .resolves(null);
      assetV4ServiceMock.expects('getAssetsByIds').never();
      eventServiceMock.expects('sendProductEvent').never();
      try {
        await journalPublishingServiceMapService.updateJournalPublishingServiceMap(
          journalId,
          identifierName,
          mappingTestData
        );
        throw new Error('Expecting error, got success');
      } catch (error) {
        expect(error.code).to.equal(404);
        expect(error.name).to.equal(`AppError`);
        expect(error.message).to.equal(
          `A Journal must exist with journalAcronym ${journalId}`
        );
        assetV4ServiceMock.verify();
        eventServiceMock.verify();
      } finally {
        assetV4ServiceMock.restore();
        eventServiceMock.restore();
      }
    });
    it('should throw error if identifierName is not journalAcronym', async () => {
      const productIdentifier = 'some-id';
      const productIdentifierName = 'uuid';
      const eventServiceMock = mock(eventService);
      const assetV4ServiceMock = mock(assetV4Service);
      assetV4ServiceMock.expects('getProductByIdentifier').never();
      assetV4ServiceMock.expects('getAssetsByIds').never();
      eventServiceMock.expects('sendProductEvent').never();
      try {
        await journalPublishingServiceMapService.updateJournalPublishingServiceMap(
          productIdentifier,
          productIdentifierName,
          mappingTestData
        );
        throw new Error('Expecting error, got success');
      } catch (error) {
        expect(error.code).to.equal(400);
        expect(error.name).to.equal(`AppError`);
        expect(error.message).to.equal(
          `Product-identifier ${productIdentifierName} is not allowed.`
        );
        assetV4ServiceMock.verify();
        eventServiceMock.verify();
      } finally {
        assetV4ServiceMock.restore();
        eventServiceMock.restore();
      }
    });
    it('should throw error if mapping publishingService ids does not exist in asset', async () => {
      const journalId = 'some-id';
      const identifierName = 'journalAcronym';
      const eventPayload = {
        _id: journalId,
        ...mappingTestData
      };
      const publishingServiceIds = _.uniq(
        eventPayload.publishingServices.map((ps) => ps._id)
      );
      const eventServiceMock = mock(eventService);
      const assetV4ServiceMock = mock(assetV4Service);
      assetV4ServiceMock
        .expects('getProductByIdentifier')
        .once()
        .withArgs(identifierName, journalId)
        .resolves({ _id: 1 });
      assetV4ServiceMock
        .expects('getAssetsByIds')
        .once()
        .withArgs(publishingServiceIds)
        .resolves([]);
      eventServiceMock.expects('sendProductEvent').never();
      try {
        await journalPublishingServiceMapService.updateJournalPublishingServiceMap(
          journalId,
          identifierName,
          mappingTestData
        );
        throw new Error('Expecting error, got success');
      } catch (error) {
        expect(error.code).to.equal(400);
        expect(error.name).to.equal(`AppError`);
        expect(error.message).to.equal(
          `Invalid Publishing Service IDs in the Mapping.`
        );
        expect(error.info).to.eql({ ids: publishingServiceIds });
        assetV4ServiceMock.verify();
        eventServiceMock.verify();
      } finally {
        assetV4ServiceMock.restore();
        eventServiceMock.restore();
      }
    });
    it('should throw error if mapping ids are not publishingService ids', async () => {
      const journalId = 'some-id';
      const identifierName = 'journalAcronym';
      const eventPayload = {
        _id: journalId,
        ...mappingTestData
      };
      const publishingServiceIds = _.uniq(
        eventPayload.publishingServices.map((ps) => ps._id)
      );
      const eventServiceMock = mock(eventService);
      const assetV4ServiceMock = mock(assetV4Service);
      assetV4ServiceMock
        .expects('getProductByIdentifier')
        .once()
        .withArgs(identifierName, journalId)
        .resolves({ _id: 1 });
      assetV4ServiceMock
        .expects('getAssetsByIds')
        .once()
        .withArgs(publishingServiceIds)
        .resolves(
          publishingServiceIds.map((id) => {
            return { _id: id, type: 'notPublishingService' };
          })
        );
      eventServiceMock.expects('sendProductEvent').never();
      try {
        await journalPublishingServiceMapService.updateJournalPublishingServiceMap(
          journalId,
          identifierName,
          mappingTestData
        );
        throw new Error('Expecting error, got success');
      } catch (error) {
        expect(error.code).to.equal(400);
        expect(error.name).to.equal(`AppError`);
        expect(error.message).to.equal(
          `Only Publishing Service IDs are allowed for Mapping.`
        );
        expect(error.info).to.eql({
          assets: publishingServiceIds.map((id) => {
            return { _id: id, type: 'notPublishingService' };
          })
        });
        assetV4ServiceMock.verify();
        eventServiceMock.verify();
      } finally {
        assetV4ServiceMock.restore();
        eventServiceMock.restore();
      }
    });
  });
  describe('getJournalPublishingServiceMap', () => {
    it('should throw error when the asset does not exist for the identifier', async () => {
      const productIdentifier = 'some-id';
      const identifierName = 'journalAcronym';
      const assetV4ServiceMock = mock(assetV4Service);
      assetV4ServiceMock
        .expects('getProductByIdentifier')
        .once()
        .withArgs(identifierName, productIdentifier)
        .resolves(null);
      try {
        await journalPublishingServiceMapService.getJournalPublishingServiceMap(
          productIdentifier,
          identifierName,
          mappingTestData
        );
        throw new Error('Expecting error, got success');
      } catch (error) {
        expect(error.code).to.equal(404);
        expect(error.name).to.equal(`AppError`);
        expect(error.message).to.equal(
          `A Journal must exist with journalAcronym ${productIdentifier}`
        );
        assetV4ServiceMock.verify();
      } finally {
        assetV4ServiceMock.restore();
      }
    });
    it('should return JournalPublishingServiceMap when product exist with _id', (done) => {
      const stubData = getStubData();
      const productIdentifier = 'some-id';
      const identifierName = 'journalAcronym';
      stubData.assetV4ServiceMock
        .expects('getProductByIdentifier')
        .once()
        .withArgs(identifierName, productIdentifier)
        .resolves({
          _id: 'some_uuid_id',
          identifier: { journalAcronym: 'some-id' }
        });
      const copyJournalPublishingServiceMapData = _.cloneDeep(
        journalPublishingServiceMapData
      );
      copyJournalPublishingServiceMapData.publishingServices.length = 1;
      stubData.journalPublishingServiceMapV4DAOMock
        .expects('getJournalPublishingServiceMapById')
        .once()
        .withArgs(productIdentifier)
        .resolves([copyJournalPublishingServiceMapData]);
      stubData.publishingServiceProductServiceMock
        .expects('getPublishingServiceById')
        .withArgs(journalPublishingServiceMapData.publishingServices[0]._id)
        .resolves(publishingServiceData);
      journalPublishingServiceMapService
        .getJournalPublishingServiceMap(productIdentifier, identifierName)
        .then((res) => {
          expect(res[0]._id).to.be.equal(
            journalPublishingServiceMapData.publishingServices[0]._id
          );
          stubData.assetV4ServiceMock.verify();
          stubData.journalPublishingServiceMapV4DAOMock.verify();
          stubData.publishingServiceProductServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.assetV4ServiceMock.restore();
          stubData.journalPublishingServiceMapV4DAOMock.restore();
          stubData.publishingServiceProductServiceMock.restore();
        });
    });
    it(`should return JournalPublishingServiceMap when product exist with _id
        but no match found for _id under publishingServices`, (done) => {
      const stubData = getStubData();
      const productIdentifier = 'some-id';
      const identifierName = 'journalAcronym';
      stubData.assetV4ServiceMock
        .expects('getProductByIdentifier')
        .once()
        .withArgs(identifierName, productIdentifier)
        .resolves({
          _id: 'some_uuid_id',
          identifier: { journalAcronym: 'some-id' }
        });
      const copyJournalPublishingServiceMapData = _.cloneDeep(
        journalPublishingServiceMapData
      );
      copyJournalPublishingServiceMapData.publishingServices.length = 1;
      stubData.journalPublishingServiceMapV4DAOMock
        .expects('getJournalPublishingServiceMapById')
        .once()
        .withArgs(productIdentifier)
        .resolves([copyJournalPublishingServiceMapData]);
      stubData.publishingServiceProductServiceMock
        .expects('getPublishingServiceById')
        .withArgs(journalPublishingServiceMapData.publishingServices[0]._id)
        .resolves(null);
      journalPublishingServiceMapService
        .getJournalPublishingServiceMap(productIdentifier, identifierName)
        .then((res) => {
          expect(res[0]._id).to.be.equal(
            journalPublishingServiceMapData.publishingServices[0]._id
          );
          expect(res[0].prices).to.be.equal(null);
          expect(res[0].subType).to.be.equal(null);
          stubData.assetV4ServiceMock.verify();
          stubData.journalPublishingServiceMapV4DAOMock.verify();
          stubData.publishingServiceProductServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.assetV4ServiceMock.restore();
          stubData.journalPublishingServiceMapV4DAOMock.restore();
          stubData.publishingServiceProductServiceMock.restore();
        });
    });
    it(`should return JournalPublishingServiceMap when product exist with _id and
        publishingServices has duplicate _id`, (done) => {
      const stubData = getStubData();
      const productIdentifier = 'some-id';
      const identifierName = 'journalAcronym';
      stubData.assetV4ServiceMock
        .expects('getProductByIdentifier')
        .once()
        .withArgs(identifierName, productIdentifier)
        .resolves({
          _id: 'some_uuid_id',
          identifier: { journalAcronym: 'some-id' }
        });
      stubData.journalPublishingServiceMapV4DAOMock
        .expects('getJournalPublishingServiceMapById')
        .once()
        .withArgs(productIdentifier)
        .resolves([journalPublishingServiceMapData]);
      stubData.publishingServiceProductServiceMock
        .expects('getPublishingServiceById')
        .withArgs(journalPublishingServiceMapData.publishingServices[0]._id)
        .resolves(publishingServiceData);
      stubData.publishingServiceProductServiceMock
        .expects('getPublishingServiceById')
        .withArgs(journalPublishingServiceMapData.publishingServices[1]._id)
        .resolves(publishingServiceData);
      journalPublishingServiceMapService
        .getJournalPublishingServiceMap(productIdentifier, identifierName)
        .then((res) => {
          expect(res[0].classification.name).to.be.equal(
            journalPublishingServiceMapData.publishingServices[0].classification
              .name
          );
          expect(res[0].classification.type).to.be.equal(
            journalPublishingServiceMapData.publishingServices[0].classification
              .type
          );
          expect(res[1].classification.name).to.be.equal(
            journalPublishingServiceMapData.publishingServices[1].classification
              .name
          );
          expect(res[1].classification.type).to.be.equal(
            journalPublishingServiceMapData.publishingServices[1].classification
              .type
          );
          stubData.assetV4ServiceMock.verify();
          stubData.journalPublishingServiceMapV4DAOMock.verify();
          stubData.publishingServiceProductServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.assetV4ServiceMock.restore();
          stubData.journalPublishingServiceMapV4DAOMock.restore();
          stubData.publishingServiceProductServiceMock.restore();
        });
    });
    it(`should return JournalPublishingServiceMap when product exist with _id which
      has empty publishing service`, async () => {
      const stubData = getStubData();
      const productIdentifier = 'some-id';
      const identifierName = 'journalAcronym';
      stubData.assetV4ServiceMock
        .expects('getProductByIdentifier')
        .once()
        .withArgs(identifierName, productIdentifier)
        .resolves({
          _id: 'some_uuid_id',
          identifier: { journalAcronym: 'some-id' }
        });
      journalPublishingServiceMapData.publishingServices = [];
      stubData.journalPublishingServiceMapV4DAOMock
        .expects('getJournalPublishingServiceMapById')
        .once()
        .withArgs(productIdentifier)
        .resolves([journalPublishingServiceMapData]);
      stubData.publishingServiceProductServiceMock
        .expects('getPublishingServiceById')
        .never();
      try {
        await journalPublishingServiceMapService.getJournalPublishingServiceMap(
          productIdentifier,
          identifierName
        );
        throw new Error('Expecting error, got success');
      } catch (error) {
        expect(error.code).to.equal(404);
        expect(error.name).to.equal(`AppError`);
        expect(error.message).to.equal(`Products not found.`);
        stubData.assetV4ServiceMock.verify();
        stubData.journalPublishingServiceMapV4DAOMock.verify();
        stubData.publishingServiceProductServiceMock.verify();
      } finally {
        stubData.assetV4ServiceMock.restore();
        stubData.journalPublishingServiceMapV4DAOMock.restore();
        stubData.publishingServiceProductServiceMock.restore();
      }
    });
    it('should return JournalPublishingServiceMap when no product exist with _id', async () => {
      const stubData = getStubData();
      const productIdentifier = 'some-id';
      const identifierName = 'journalAcronym';
      stubData.assetV4ServiceMock
        .expects('getProductByIdentifier')
        .once()
        .withArgs(identifierName, productIdentifier)
        .resolves({
          _id: 'some_uuid_id',
          identifier: { journalAcronym: 'some-id' }
        });
      stubData.journalPublishingServiceMapV4DAOMock
        .expects('getJournalPublishingServiceMapById')
        .once()
        .withArgs(productIdentifier)
        .resolves(null);
      stubData.publishingServiceProductServiceMock
        .expects('getPublishingServiceById')
        .never();
      try {
        await journalPublishingServiceMapService.getJournalPublishingServiceMap(
          productIdentifier,
          identifierName
        );
        throw new Error('Expecting error, got success');
      } catch (error) {
        expect(error.code).to.equal(404);
        expect(error.name).to.equal(`AppError`);
        expect(error.message).to.equal(`Product Mapping not found.`);
        stubData.assetV4ServiceMock.verify();
        stubData.journalPublishingServiceMapV4DAOMock.verify();
        stubData.publishingServiceProductServiceMock.verify();
      } finally {
        stubData.assetV4ServiceMock.restore();
        stubData.journalPublishingServiceMapV4DAOMock.restore();
        stubData.publishingServiceProductServiceMock.restore();
      }
    });
  });
});
