import { RedisConnection } from '@tandfgroup/privilege-authorization-manager/lib/src/cache';
import { expect } from 'chai';
import { Request, Response } from 'express';
import { Cluster } from 'ioredis';
import * as mockExpressRequest from 'mock-express-request';
import * as mockExpressResponse from 'mock-express-response';
import * as sinon from 'sinon';

import { journalPublishingServiceMapController } from './JournalPubServiceMap.Controller';
import { journalPublishingServiceMapService } from './JournalPubServiceMap.Service';

import jwt = require('jsonwebtoken');
import { IJournalProductServiceMapWrapper } from 'v4/model/interfaces/JournalPublishingServiceMapWrapper';
import { Config } from '../../config/config';

const iamEnv: string = Config.getPropertyValue('iamEnv');
const date = Math.round(new Date().getTime());
const jwtCode = jwt.sign(
  { exp: date + 36000, iat: date, r: ['PKORA'] },
  'shhhhh'
);

const journalPublishingServiceMapData: IJournalProductServiceMapWrapper[] = [
  {
    _id: 'fd428c4f-edc2-4dcc-9f04-376fa52d8ac4',
    classification: {
      name: 'Product Review',
      type: 'article-type'
    },
    prices: [
      {
        currency: 'AUD',
        price: 3350,
        validFrom: null
      }
    ],
    subType: 'Rapidtrack',
    validFrom: null,
    validTo: null
  },
  {
    _id: 'fd428c4f-edc2-4dcc-9fwereewererwer',
    classification: {
      name: 'Announcement',
      type: 'cats-article-type'
    },
    prices: [
      {
        currency: 'AUD',
        price: 3350,
        validFrom: null
      }
    ],
    subType: 'Rapidtrack',
    validFrom: null,
    validTo: null
  },
  {
    _id: 'fd428c4f-edc2-4dcc-9f04-376fa52d8ac4',
    classification: {
      name: 'Case-Report',
      type: 'article-type'
    },
    prices: [
      {
        currency: 'AUD',
        price: 3350,
        validFrom: null
      }
    ],
    subType: 'Submission Fee',
    validFrom: null,
    validTo: null
  }
];

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

describe('JournalPublishingServiceMap.Controller ', () => {
  describe('updateJournalPublishingServiceMap', () => {
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
    it('should test the permission data if valid then it should delegate request to handler', (done) => {
      const stubData = getStubData();
      stubData.request.headers = {
        authorization: 'idtoken ' + jwtCode
      };
      stubData.request.params = { identifier: 'TCEO' };
      stubData.request.query.productIdentifierName = 'journalAcronym';
      stubData.request.body = { data: {} };
      const updateJournalPublishingServiceMapStub = sinon.stub(
        journalPublishingServiceMapController,
        '_updateJournalPublishingServiceMap'
      );
      updateJournalPublishingServiceMapStub.resolves('success');
      journalPublishingServiceMapController.updateJournalPublishingServiceMap(
        stubData.request,
        stubData.response
      );
      // There is an issue with IAM Decorator, so adding setTimeout.
      setTimeout(() => {
        try {
          expect(updateJournalPublishingServiceMapStub.calledOnce).to.equal(
            true
          );
          expect(hmGetStub.calledOnce).to.equal(true);
          done();
        } catch (e) {
          done(e);
        } finally {
          updateJournalPublishingServiceMapStub.restore();
        }
      }, 1000);
    });
    it('should send success message when the request is valid', (done) => {
      const stubData = getStubData();
      const identifier = 'TCEO';
      stubData.request.params = { identifier };
      stubData.request.query.productIdentifierName = 'journalAcronym';
      stubData.request.body = { data: {} };
      const journalPubServiceMapMock = sinon.mock(
        journalPublishingServiceMapService
      );
      journalPubServiceMapMock
        .expects('updateJournalPublishingServiceMap')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.query.productIdentifierName,
          stubData.request.body.data
        )
        .resolves('message-id-123');
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            message:
              `Journal Publishing-Service mapping data for ` +
              `${stubData.request.query.productIdentifierName} ${identifier} ` +
              `is accepted successfully, it will be processed soon.`,
            transactionId: undefined
          }
        });
      journalPublishingServiceMapController
        ._updateJournalPublishingServiceMap(stubData.request, stubData.response)
        .then(() => {
          journalPubServiceMapMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          journalPubServiceMapMock.restore();
        });
    });
    it('should send error when the request is invalid', (done) => {
      const stubData = getStubData();
      const identifier = 'TCEO';
      stubData.request.params = { identifier };
      stubData.request.query.productIdentifierName = 'journalAcronym';
      stubData.request.body = { data: {} };
      const journalPubServiceMapMock = sinon.mock(
        journalPublishingServiceMapService
      );
      journalPubServiceMapMock
        .expects('updateJournalPublishingServiceMap')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.query.productIdentifierName,
          stubData.request.body.data
        )
        .rejects(new Error('Invalid request'));
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: `Invalid request`,
            transactionId: undefined
          }
        });
      journalPublishingServiceMapController
        ._updateJournalPublishingServiceMap(stubData.request, stubData.response)
        .then(() => {
          journalPubServiceMapMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          journalPubServiceMapMock.restore();
        });
    });
  });
  describe('getJournalPublishingServiceMap', () => {
    it('should send error when the request has invalid productIdentifierName', (done) => {
      const stubData = getStubData();
      const identifier = 'TCEO';
      stubData.request.params = { identifier };
      stubData.request.query.productIdentifierName = 'Garbage';
      stubData.request.query.apiVersion = '4.0.1';
      const journalPubServiceMapMock = sinon.mock(
        journalPublishingServiceMapService
      );
      journalPubServiceMapMock
        .expects('getJournalPublishingServiceMap')
        .never();
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: `Product-identifier Garbage is not allowed.`,
            transactionId: undefined
          }
        });
      journalPublishingServiceMapController
        .getJournalPublishingServiceMap(stubData.request, stubData.response)
        .then(() => {
          journalPubServiceMapMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          journalPubServiceMapMock.restore();
        });
    });
    it('should send success when the getJournalPublishingServiceMap request is valid', (done) => {
      const stubData = getStubData();
      const identifier = 'TCEO';
      stubData.request.params = { identifier };
      stubData.request.query.productIdentifierName = 'journalAcronym';
      stubData.request.query.apiVersion = '4.0.1';
      const journalPubServiceMapMock = sinon.mock(
        journalPublishingServiceMapService
      );
      journalPubServiceMapMock
        .expects('getJournalPublishingServiceMap')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.query.productIdentifierName,
          undefined,
          undefined,
          undefined
        )
        .resolves(journalPublishingServiceMapData);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: journalPublishingServiceMapData,
          metadata: {
            transactionId: undefined
          }
        });
      journalPublishingServiceMapController
        .getJournalPublishingServiceMap(stubData.request, stubData.response)
        .then(() => {
          journalPubServiceMapMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          journalPubServiceMapMock.restore();
        });
    });
    it('should send success when the product identifier name is missing and assume _id as identifier name', (done) => {
      const stubData = getStubData();
      const identifier = 'TCEO';
      stubData.request.params = { identifier };
      stubData.request.query.apiVersion = '4.0.1';
      const journalPubServiceMapMock = sinon.mock(
        journalPublishingServiceMapService
      );
      journalPubServiceMapMock
        .expects('getJournalPublishingServiceMap')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          '_id',
          undefined,
          undefined,
          undefined
        )
        .resolves(journalPublishingServiceMapData);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: journalPublishingServiceMapData,
          metadata: {
            transactionId: undefined
          }
        });
      journalPublishingServiceMapController
        .getJournalPublishingServiceMap(stubData.request, stubData.response)
        .then(() => {
          journalPubServiceMapMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          journalPubServiceMapMock.restore();
        });
    });
    it(`should send success when the getJournalPublishingServiceMap request has
            both classificationName and classificationType filter`, (done) => {
      const stubData = getStubData();
      const identifier = 'TCEO';
      stubData.request.params = { identifier };
      stubData.request.query.productIdentifierName = 'journalAcronym';
      stubData.request.query.classificationName = 'Product Review';
      stubData.request.query.classificationType = 'article-type';
      stubData.request.query.apiVersion = '4.0.1';
      const journalPubServiceMapMock = sinon.mock(
        journalPublishingServiceMapService
      );
      const journalPublishingServiceMapFilterData =
        journalPublishingServiceMapData.filter((item) => {
          return (
            item.classification.name === 'Product Review' &&
            item.classification.type === 'article-type'
          );
        });
      journalPubServiceMapMock
        .expects('getJournalPublishingServiceMap')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.query.productIdentifierName,
          stubData.request.query.classificationName,
          stubData.request.query.classificationType,
          undefined
        )
        .resolves(journalPublishingServiceMapFilterData);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: journalPublishingServiceMapFilterData,
          metadata: {
            transactionId: undefined
          }
        });
      journalPublishingServiceMapController
        .getJournalPublishingServiceMap(stubData.request, stubData.response)
        .then(() => {
          journalPubServiceMapMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          journalPubServiceMapMock.restore();
        });
    });
    it(`should send null when method getJournalPublishingServiceMap from service
      return null`, (done) => {
      const stubData = getStubData();
      const identifier = 'TCEO';
      stubData.request.params = { identifier };
      stubData.request.query.productIdentifierName = 'journalAcronym';
      stubData.request.query.apiVersion = '4.0.1';
      const journalPubServiceMapMock = sinon.mock(
        journalPublishingServiceMapService
      );
      journalPubServiceMapMock
        .expects('getJournalPublishingServiceMap')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.query.productIdentifierName,
          undefined,
          undefined,
          undefined
        )
        .resolves(null);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            transactionId: undefined
          }
        });
      journalPublishingServiceMapController
        .getJournalPublishingServiceMap(stubData.request, stubData.response)
        .then(() => {
          journalPubServiceMapMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          journalPubServiceMapMock.restore();
        });
    });
    it(`should send success when the getJournalPublishingServiceMap request has only
            classificationType filter`, (done) => {
      const stubData = getStubData();
      const identifier = 'TCEO';
      stubData.request.params = { identifier };
      stubData.request.query.productIdentifierName = 'journalAcronym';
      stubData.request.query.classificationType = 'article-type';
      stubData.request.query.apiVersion = '4.0.1';
      const journalPubServiceMapMock = sinon.mock(
        journalPublishingServiceMapService
      );
      const journalPublishingServiceMapFilterData: IJournalProductServiceMapWrapper[] =
        journalPublishingServiceMapData.filter((item) => {
          return item.classification.type === 'article-type';
        });
      journalPubServiceMapMock
        .expects('getJournalPublishingServiceMap')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.query.productIdentifierName,
          stubData.request.query.classificationName,
          stubData.request.query.classificationType,
          undefined
        )
        .resolves(journalPublishingServiceMapFilterData);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: journalPublishingServiceMapFilterData,
          metadata: {
            transactionId: undefined
          }
        });
      journalPublishingServiceMapController
        .getJournalPublishingServiceMap(stubData.request, stubData.response)
        .then(() => {
          journalPubServiceMapMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          journalPubServiceMapMock.restore();
        });
    });
  });
});
