import { expect } from 'chai';
import { cloneDeep } from 'lodash';
import { mock } from 'sinon';
import * as uuidV4 from 'uuid/v4';

import { Config } from '../../config/config';
import { assetV4Service } from '../assets/AssetV4.Service';
import { eventService } from '../event/Event.Service';
import { preChapterProductService } from './PreChapterV4.Service';
import { preChapterProductRequest } from './PreChapter.TestData';
import { ISQSQueueUrlData } from 'v4/model/interfaces/SQSQueueUrlData';
import { productV4Service } from '../products/ProductV4.Service';
import { productV4DAO } from '../products/ProductV4.DAO';

const preChapterProductEventQueue: ISQSQueueUrlData = Config.getPropertyValue(
  'preChapterProductEventQueue'
);

describe('PreChapterV4.Service', () => {
  let preChapterTestData;
  beforeEach(() => {
    preChapterTestData = cloneDeep(preChapterProductRequest);
  });

  describe('createPreChapterProduct', () => {
    it('should send an event to initiate the pre-Chapter product create', async () => {
      const preChapterId = 'abc123';
      const bookId = 'uuid-of-book';
      const type = 'book';
      const eventPayload = {
        _id: preChapterId,
        ...preChapterTestData,
        _sources: [{ source: 'ACTIVITY', type: 'product' }]
      };
      const eventServiceMock = mock(eventService);
      const productV4DaoMock = mock(productV4DAO);
      productV4DaoMock
        .expects('getProduct')
        .once()
        .withArgs(type, bookId, ['book.status', 'type', 'identifiers.isbn'])
        .resolves({
          _id: bookId,
          book: {
            status: 'Available'
          },
          identifiers: {
            isbn: '9781315265209'
          },
          type: 'book'
        });
      const productV4Mock = mock(productV4Service);
      productV4Mock.expects('getNewId').once().returns(preChapterId);
      eventServiceMock
        .expects('sendProductEvent')
        .once()
        .withArgs(eventPayload, preChapterProductEventQueue, 'ACTIVITY', {
          productId: preChapterId
        })
        .resolves('some-event-id');
      try {
        const eventId = await preChapterProductService.createPreChapterProduct(
          preChapterTestData
        );
        expect(eventId).to.equal('some-event-id');
        eventServiceMock.verify();
        productV4DaoMock.verify();
        productV4Mock.verify();
      } finally {
        eventServiceMock.restore();
        productV4DaoMock.verify();
        productV4Mock.restore();
      }
    });
    it('should throw error if title does not exist', async () => {
      const eventServiceMock = mock(eventService);
      const productV4DaoMock = mock(productV4DAO);
      productV4DaoMock.expects('getProduct').never();
      eventServiceMock.expects('sendProductEvent').never();
      try {
        await preChapterProductService.createPreChapterProduct({
          ...preChapterTestData,
          title: null
        });
        throw new Error('Expecting error, got success');
      } catch (error) {
        expect(error.code).to.equal(400);
        expect(error.name).to.equal(`AppError`);
        expect(error.message).to.equal('Validation error');
        eventServiceMock.verify();
        productV4DaoMock.verify();
      } finally {
        eventServiceMock.restore();
        productV4DaoMock.restore();
      }
    });
    it('should throw error if id does not exist', async () => {
      const bookId = 'uuid-of-book';
      const type = 'book';
      const eventServiceMock = mock(eventService);
      const productV4DaoMock = mock(productV4DAO);
      productV4DaoMock
        .expects('getProduct')
        .once()
        .withArgs(type, bookId, ['book.status', 'type', 'identifiers.isbn'])
        .resolves(null);
      eventServiceMock.expects('sendProductEvent').never();
      try {
        await preChapterProductService.createPreChapterProduct({
          ...preChapterTestData
        });
        throw new Error('Expecting error, got success');
      } catch (error) {
        expect(error.code).to.equal(400);
        expect(error.name).to.equal(`AppError`);
        expect(error.message).to.equal(
          `book product does NOT exists with id ${bookId}.`
        );
        eventServiceMock.verify();
        productV4DaoMock.verify();
      } finally {
        eventServiceMock.restore();
        productV4DaoMock.restore();
      }
    });
    it('should throw error if isbn does not match', async () => {
      const bookId = 'uuid-of-book';
      const type = 'book';
      const isbn = '9781315265209';
      const eventServiceMock = mock(eventService);
      const productV4DaoMock = mock(productV4DAO);
      productV4DaoMock
        .expects('getProduct')
        .once()
        .withArgs(type, bookId, ['book.status', 'type', 'identifiers.isbn'])
        .resolves({
          _id: bookId,
          book: {
            status: 'Available'
          },
          identifiers: {
            isbn: 'some'
          },
          type: 'book'
        });
      eventServiceMock.expects('sendProductEvent').never();
      try {
        await preChapterProductService.createPreChapterProduct({
          ...preChapterTestData
        });
        throw new Error('Expecting error, got success');
      } catch (error) {
        expect(error.code).to.equal(400);
        expect(error.name).to.equal(`AppError`);
        expect(error.message).to.equal(
          `isbn ${isbn} does not match with isbn of book id ${bookId}.`
        );
        eventServiceMock.verify();
        productV4DaoMock.verify();
      } finally {
        eventServiceMock.restore();
        productV4DaoMock.restore();
      }
    });
    it('should throw error if type does not match', async () => {
      const bookId = 'uuid-of-book';
      const type = 'book';
      const eventServiceMock = mock(eventService);
      const productV4DaoMock = mock(productV4DAO);
      productV4DaoMock
        .expects('getProduct')
        .once()
        .withArgs(type, bookId, ['book.status', 'type', 'identifiers.isbn'])
        .resolves({
          _id: bookId,
          book: {
            status: 'Available'
          },
          identifiers: {
            isbn: '9781315265209'
          },
          type: 'some'
        });
      eventServiceMock.expects('sendProductEvent').never();
      try {
        await preChapterProductService.createPreChapterProduct({
          ...preChapterTestData
        });
        throw new Error('Expecting error, got success');
      } catch (error) {
        expect(error.code).to.equal(400);
        expect(error.name).to.equal(`AppError`);
        expect(error.message).to.equal(
          `type for id ${bookId} does not match with book.`
        );
        eventServiceMock.verify();
        productV4DaoMock.verify();
      } finally {
        eventServiceMock.restore();
        productV4DaoMock.restore();
      }
    });
    it('should throw error if status of book is Out of Print', async () => {
      const bookId = 'uuid-of-book';
      const type = 'book';
      const isbn = '9781315265209';
      const eventServiceMock = mock(eventService);
      const productV4DaoMock = mock(productV4DAO);
      productV4DaoMock
        .expects('getProduct')
        .once()
        .withArgs(type, bookId, ['book.status', 'type', 'identifiers.isbn'])
        .resolves({
          _id: bookId,
          book: {
            status: 'Out of Print'
          },
          identifiers: {
            isbn: '9781315265209'
          },
          type: 'book'
        });
      eventServiceMock.expects('sendProductEvent').never();
      try {
        await preChapterProductService.createPreChapterProduct({
          ...preChapterTestData
        });
        throw new Error('Expecting error, got success');
      } catch (error) {
        expect(error.code).to.equal(400);
        expect(error.name).to.equal(`AppError`);
        expect(error.message).to.equal(
          `book with status Out of Print is not allowed.`
        );
        eventServiceMock.verify();
        productV4DaoMock.verify();
      } finally {
        eventServiceMock.restore();
        productV4DaoMock.restore();
      }
    });
    it('should throw error if status of book is Withdrawn', async () => {
      const bookId = 'uuid-of-book';
      const type = 'book';
      const eventServiceMock = mock(eventService);
      const productV4DaoMock = mock(productV4DAO);
      productV4DaoMock
        .expects('getProduct')
        .once()
        .withArgs(type, bookId, ['book.status', 'type', 'identifiers.isbn'])
        .resolves({
          _id: bookId,
          book: {
            status: 'Withdrawn'
          },
          identifiers: {
            isbn: '9781315265209'
          },
          type: 'book'
        });
      eventServiceMock.expects('sendProductEvent').never();
      try {
        await preChapterProductService.createPreChapterProduct({
          ...preChapterTestData
        });
        throw new Error('Expecting error, got success');
      } catch (error) {
        expect(error.code).to.equal(400);
        expect(error.name).to.equal(`AppError`);
        expect(error.message).to.equal(
          `book with status Withdrawn is not allowed.`
        );
        eventServiceMock.verify();
        productV4DaoMock.verify();
      } finally {
        eventServiceMock.restore();
        productV4DaoMock.restore();
      }
    });
    it('should throw error if status of book is Deprecated', async () => {
      const bookId = 'uuid-of-book';
      const type = 'book';
      const eventServiceMock = mock(eventService);
      const productV4DaoMock = mock(productV4DAO);
      productV4DaoMock
        .expects('getProduct')
        .once()
        .withArgs(type, bookId, ['book.status', 'type', 'identifiers.isbn'])
        .resolves({
          _id: bookId,
          book: {
            status: 'Deprecated'
          },
          identifiers: {
            isbn: '9781315265209'
          },
          type: 'book'
        });
      eventServiceMock.expects('sendProductEvent').never();
      try {
        await preChapterProductService.createPreChapterProduct({
          ...preChapterTestData
        });
        throw new Error('Expecting error, got success');
      } catch (error) {
        expect(error.code).to.equal(400);
        expect(error.name).to.equal(`AppError`);
        expect(error.message).to.equal(
          `book with status Deprecated is not allowed.`
        );
        eventServiceMock.verify();
        productV4DaoMock.verify();
      } finally {
        eventServiceMock.restore();
        productV4DaoMock.restore();
      }
    });
    it('should throw error if type of request payload is not book', async () => {
      const bookId = 'uuid-of-book';
      const type = 'some';
      const isPartOf = [
        {
          _id: 'uuid-of-book',
          identifiers: {
            isbn: '9781315265209'
          },
          type: 'some'
        }
      ];
      const eventServiceMock = mock(eventService);
      const productV4DaoMock = mock(productV4DAO);
      productV4DaoMock.expects('getProduct').never();
      eventServiceMock.expects('sendProductEvent').never();
      try {
        await preChapterProductService.createPreChapterProduct({
          ...preChapterTestData,
          isPartOf
        });
        throw new Error('Expecting error, got success');
      } catch (error) {
        expect(error.code).to.equal(400);
        expect(error.name).to.equal(`AppError`);
        expect(error.message).to.equal(`type should be book.`);
        eventServiceMock.verify();
        productV4DaoMock.verify();
      } finally {
        eventServiceMock.restore();
        productV4DaoMock.restore();
      }
    });
    it('should throw error if isPartOf has more than 1 element ', async () => {
      const bookId = 'uuid-of-book';
      const type = 'some';
      const isPartOf = [
        {
          _id: 'uuid-of-book',
          identifiers: {
            isbn: '9781315265209'
          },
          type: 'some'
        },
        {
          _id: 'uuid-of-book',
          identifiers: {
            isbn: '9781315265209'
          },
          type: 'some'
        }
      ];
      const eventServiceMock = mock(eventService);
      const productV4DaoMock = mock(productV4DAO);
      productV4DaoMock.expects('getProduct').never();
      eventServiceMock.expects('sendProductEvent').never();
      try {
        await preChapterProductService.createPreChapterProduct({
          ...preChapterTestData,
          isPartOf
        });
        throw new Error('Expecting error, got success');
      } catch (error) {
        expect(error.code).to.equal(400);
        expect(error.name).to.equal(`AppError`);
        expect(error.message).to.equal(`isPartOf should have length one.`);
        eventServiceMock.verify();
        productV4DaoMock.verify();
      } finally {
        eventServiceMock.restore();
        productV4DaoMock.restore();
      }
    });
  });

  describe('updatePreChapterProduct', () => {
    it('should send an event to initiate the preChapter product update', async () => {
      const prechapterId = uuidV4();
      const eventPayload = {
        _id: prechapterId,
        ...preChapterTestData,
        _sources: [{ source: 'ACTIVITY', type: 'product' }]
      };
      const eventServiceMock = mock(eventService);
      const assetV4ServiceMock = mock(assetV4Service);
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(prechapterId, ['_id', 'type'])
        .resolves({ _id: prechapterId, type: 'book' });
      eventServiceMock
        .expects('sendProductEvent')
        .once()
        .withArgs(eventPayload, preChapterProductEventQueue, 'ACTIVITY', {
          productId: prechapterId
        })
        .resolves('some-event-id');
      try {
        const eventId = await preChapterProductService.updatePreChapterProduct(
          prechapterId,
          preChapterTestData
        );
        expect(eventId).to.equal('some-event-id');
        assetV4ServiceMock.verify();
        eventServiceMock.verify();
      } finally {
        assetV4ServiceMock.restore();
        eventServiceMock.restore();
      }
    });
    it('should throw error when the asset does not exist for the identifier', async () => {
      const preChapterId = uuidV4();
      const eventServiceMock = mock(eventService);
      const assetV4ServiceMock = mock(assetV4Service);
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(preChapterId, ['_id', 'type'])
        .resolves(null);
      eventServiceMock.expects('sendProductEvent').never();
      try {
        await preChapterProductService.updatePreChapterProduct(
          preChapterId,
          preChapterTestData
        );
        throw new Error('Expecting error, got success');
      } catch (error) {
        expect(error.code).to.equal(404);
        expect(error.name).to.equal(`AppError`);
        expect(error.message).to.equal(
          `Pre Chapter product does NOT exists with id ${preChapterId}.`
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
