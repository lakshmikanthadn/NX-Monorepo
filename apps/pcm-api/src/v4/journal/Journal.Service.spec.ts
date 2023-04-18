import { expect } from 'chai';
import { cloneDeep } from 'lodash';
import { mock } from 'sinon';
import { ISQSQueueUrlData } from 'v4/model/interfaces/SQSQueueUrlData';

import { Config } from '../../config/config';
import { assetV4Service } from '../assets/AssetV4.Service';
import { eventService } from '../event/Event.Service';
import { journalService } from './Journal.Service';
import { journalProductRequest } from './Journal.TestData';

describe('Journal.Service', () => {
  let journalTestData;
  beforeEach(() => {
    journalTestData = cloneDeep(journalProductRequest);
  });
  describe('updateJournalProduct', () => {
    const journalProductEventQueue: ISQSQueueUrlData = Config.getPropertyValue(
      'journalProductEventQueue'
    );
    it('should send an event to initiate the journal product update', async () => {
      const journalId = 'some-id';
      const identifierName = 'journalAcronym';
      const eventPayload = {
        identifiers: { journalAcronym: journalId },
        ...journalTestData
      };
      const eventServiceMock = mock(eventService);
      const assetV4ServiceMock = mock(assetV4Service);
      assetV4ServiceMock
        .expects('getProductByIdentifier')
        .once()
        .withArgs(identifierName, journalId)
        .resolves({ _id: 1 });
      eventServiceMock
        .expects('sendProductEvent')
        .once()
        .withArgs(eventPayload, journalProductEventQueue, 'SALESFORCE', {
          productId: journalId,
          productType: 'journal'
        })
        .resolves('some-event-id');
      try {
        const eventId = await journalService.updateJournalProduct(
          journalId,
          journalTestData
        );
        expect(eventId).to.equal('some-event-id');
        assetV4ServiceMock.verify();
        eventServiceMock.verify();
      } finally {
        assetV4ServiceMock.restore();
        eventServiceMock.restore();
      }
    });
    it('should throw error if journal data is invalid', async () => {
      const productIdentifier = 'some-id';
      const assetV4ServiceMock = mock(assetV4Service);
      assetV4ServiceMock.expects('getProductByIdentifier').never();
      const eventServiceMock = mock(eventService);
      eventServiceMock.expects('sendProductEvent').never();
      try {
        await journalService.updateJournalProduct(productIdentifier, {} as any);
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
      eventServiceMock.expects('sendProductEvent').never();
      try {
        await journalService.updateJournalProduct(journalId, journalTestData);
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
  });
});
