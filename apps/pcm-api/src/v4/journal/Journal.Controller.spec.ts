import { RedisConnection } from '@tandfgroup/privilege-authorization-manager/lib/src/cache';
import { expect } from 'chai';
import { Request, Response } from 'express';
import { Cluster } from 'ioredis';
import * as mockExpressRequest from 'mock-express-request';
import * as mockExpressResponse from 'mock-express-response';
import * as sinon from 'sinon';

import { journalController } from './Journal.Controller';
import { journalService } from './Journal.Service';
import { Config } from '../../config/config';

import jwt = require('jsonwebtoken');
const date = Math.round(new Date().getTime());
const jwtCode = jwt.sign(
  { exp: date + 36000, iat: date, r: ['PKORA'] },
  'shhhhh'
);
const iamEnv: string = Config.getPropertyValue('iamEnv');

function getStubData() {
  const request: Request = new mockExpressRequest();
  const response: Response = new mockExpressResponse();
  const responseMock = sinon.mock(response);
  return {
    request,
    response,
    responseMock
  };
}

const roleMappingData =
  '[{"role_code":"PKORA","role_name":"PCM-KORTEXT-ADMIN","role_precedence":1}]';

describe('Journal.Controller ', () => {
  let hmGetStub: sinon.SinonStub;
  let redisStub: sinon.SinonStubbedInstance<Cluster>;
  beforeEach(() => {
    redisStub = sinon.createStubInstance(Cluster);
    hmGetStub = sinon.stub();
    (redisStub as any).hmget = hmGetStub;
    hmGetStub
      .withArgs(iamEnv, 'api:journal-product:update')
      .resolves([roleMappingData]);
    RedisConnection.getConnection = (): Promise<Cluster> => {
      return Promise.resolve(redisStub as any as Cluster);
    };
  });

  afterEach(() => {
    redisStub.restore();
  });

  describe('updateJournalProduct', () => {
    it('should test the permission data and if valid then should delegate request handler', (done) => {
      const stubData = getStubData();
      stubData.request.headers = {
        authorization: 'idtoken ' + jwtCode
      };
      stubData.request.params = { identifier: 'TCEO' };
      stubData.request.query.productIdentifierName = 'journalAcronym';
      stubData.request.body = { product: {} };
      const updateJournalProductStub = sinon.stub(
        journalController,
        '_updateJournalProduct'
      );
      updateJournalProductStub.resolves('success');
      journalController.updateJournalProduct(
        stubData.request,
        stubData.response
      );
      // There is an issue with IAM Decorator
      setTimeout(() => {
        try {
          expect(updateJournalProductStub.calledOnce).to.equal(true);
          expect(hmGetStub.calledOnce).to.equal(true);
          done();
        } catch (e) {
          done(e);
        } finally {
          updateJournalProductStub.restore();
        }
      }, 1000);
    });
    it('should send success message when the request is valid', (done) => {
      const stubData = getStubData();
      stubData.request.params = { identifier: 'TCEO' };
      stubData.request.query.productIdentifierName = 'journalAcronym';
      stubData.request.body = { product: {} };
      const journalServiceMock = sinon.mock(journalService);
      journalServiceMock
        .expects('updateJournalProduct')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.body.product
        )
        .resolves('message-id-123');
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            message:
              `Journal product data for ${stubData.request.query.productIdentifierName}` +
              ` ${stubData.request.params.identifier} ` +
              `is accepted successfully, it will be processed soon.`,
            transactionId: undefined
          }
        });
      journalController
        ._updateJournalProduct(stubData.request, stubData.response)
        .then(() => {
          journalServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          journalServiceMock.restore();
          stubData.responseMock.restore();
        });
    });

    it('should send error when the request is invalid', (done) => {
      const stubData = getStubData();
      stubData.request.params = { identifier: 'TCEO' };
      stubData.request.query.productIdentifierName = 'invalid-id';
      stubData.request.body = { product: {} };
      const journalServiceMock = sinon.mock(journalService);
      journalServiceMock.expects('updateJournalProduct').never();
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: `Product-identifier invalid-id is not allowed.`,
            transactionId: undefined
          }
        });
      journalController
        ._updateJournalProduct(stubData.request, stubData.response)
        .then(() => {
          journalServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          journalServiceMock.restore();
          stubData.responseMock.restore();
        });
    });

    // Not needed now
    it.skip('should consider identifierName as _id if productIdentifierName is missing', (done) => {
      const stubData = getStubData();
      stubData.request.params = { identifier: '123456789' };
      stubData.request.body = { product: {} };
      const journalServiceMock = sinon.mock(journalService);
      journalServiceMock
        .expects('updateJournalProduct')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          '_id',
          stubData.request.body.product
        )
        .rejects(new Error('Invalid identifier'));
      journalController
        ._updateJournalProduct(stubData.request, stubData.response)
        .then(() => {
          journalServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          journalServiceMock.restore();
        });
    });
  });
});
