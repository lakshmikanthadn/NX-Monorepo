import { RedisConnection } from '@tandfgroup/privilege-authorization-manager/lib/src/cache';
import { expect } from 'chai';
import { Request, Response } from 'express';
import { Cluster } from 'ioredis';
import * as mockExpressRequest from 'mock-express-request';
import * as mockExpressResponse from 'mock-express-response';
import * as sinon from 'sinon';

import { publishingServiceController } from './PublishingService.Controller';
import { publishingServiceProductService } from './PublishingService.Service';

import jwt = require('jsonwebtoken');
import { Config } from '../../config/config';

const iamEnv: string = Config.getPropertyValue('iamEnv');
const date = Math.round(new Date().getTime());
const jwtCode = jwt.sign(
  { exp: date + 36000, iat: date, r: ['PKORA'] },
  'shhhhh'
);

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
describe('PublishingService.Controller ', () => {
  describe('createPublishingService', () => {
    let hmGetStub: sinon.SinonStub;
    let redisStub: sinon.SinonStubbedInstance<Cluster>;
    beforeEach(() => {
      redisStub = sinon.createStubInstance(Cluster);
      hmGetStub = sinon.stub();
      (redisStub as any).hmget = hmGetStub;
      hmGetStub
        .withArgs(iamEnv, 'api:publishing-service-product:create')
        .resolves([roleMappingData]);
      RedisConnection.getConnection = (): Promise<Cluster> => {
        return Promise.resolve(redisStub as any as Cluster);
      };
    });

    afterEach(() => {
      redisStub.restore();
    });
    it('should validate create permission, if valid then it should delegate request to handler', (done) => {
      const stubData = getStubData();
      stubData.request.headers = {
        authorization: 'idtoken ' + jwtCode
      };
      stubData.request.params = { identifier: 'some-uuid' };
      stubData.request.body = { product: {} };
      const handlePublishingServiceStub = sinon
        .stub(publishingServiceController, '_handlePublishingService')
        .resolves('success');
      publishingServiceController.createPublishingService(
        stubData.request,
        stubData.response
      );
      // There is an issue with IAM Decorator, so adding setTimeout.
      setTimeout(() => {
        try {
          expect(handlePublishingServiceStub.calledOnce).to.equal(true);
          expect(hmGetStub.calledOnce).to.equal(true);
          done();
        } catch (e) {
          done(e);
        } finally {
          handlePublishingServiceStub.restore();
        }
      }, 1000);
    });
  });
  describe('updatePublishingService', () => {
    let hmGetStub: sinon.SinonStub;
    let redisStub: sinon.SinonStubbedInstance<Cluster>;
    beforeEach(() => {
      redisStub = sinon.createStubInstance(Cluster);
      hmGetStub = sinon.stub();
      (redisStub as any).hmget = hmGetStub;
      hmGetStub
        .withArgs(iamEnv, 'api:publishing-service-product:update')
        .resolves([roleMappingData]);
      RedisConnection.getConnection = (): Promise<Cluster> => {
        return Promise.resolve(redisStub as any as Cluster);
      };
    });

    afterEach(() => {
      redisStub.restore();
    });
    it('should validate update permission, if valid then it should delegate request to handler', (done) => {
      const stubData = getStubData();
      stubData.request.headers = {
        authorization: 'idtoken ' + jwtCode
      };
      stubData.request.params = { identifier: 'some-uuid' };
      stubData.request.body = { product: {} };
      const handlePublishingServiceStub = sinon
        .stub(publishingServiceController, '_handlePublishingService')
        .resolves('success');
      publishingServiceController.updatePublishingService(
        stubData.request,
        stubData.response
      );
      // There is an issue with IAM Decorator, so adding setTimeout.
      setTimeout(() => {
        try {
          expect(handlePublishingServiceStub.calledOnce).to.equal(true);
          expect(hmGetStub.calledOnce).to.equal(true);
          done();
        } catch (e) {
          done(e);
        } finally {
          handlePublishingServiceStub.restore();
        }
      }, 1000);
    });
  });
  describe('_handlePublishingService', () => {
    it('should send success message when the request is valid and action is create', (done) => {
      const stubData = getStubData();
      const identifier = 'TCEO';
      stubData.request.params = { identifier };
      stubData.request.body = { product: {} };
      const pubServiceProductServiceMock = sinon.mock(
        publishingServiceProductService
      );
      pubServiceProductServiceMock
        .expects('createServiceProduct')
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
              `Publishing-Service product create request for id ${identifier} ` +
              `is accepted successfully, it will be processed soon.`,
            transactionId: undefined
          }
        });
      publishingServiceController
        ._handlePublishingService(stubData.request, stubData.response, 'create')
        .then(() => {
          pubServiceProductServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          pubServiceProductServiceMock.restore();
        });
    });
    it('should send success message when the request is valid and action is update', (done) => {
      const stubData = getStubData();
      const identifier = 'TCEO';
      stubData.request.params = { identifier };
      stubData.request.body = { product: {} };
      const pubServiceProductServiceMock = sinon.mock(
        publishingServiceProductService
      );
      pubServiceProductServiceMock
        .expects('updateServiceProduct')
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
              `Publishing-Service product update request for id ${identifier} ` +
              `is accepted successfully, it will be processed soon.`,
            transactionId: undefined
          }
        });
      publishingServiceController
        ._handlePublishingService(stubData.request, stubData.response, 'update')
        .then(() => {
          pubServiceProductServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          pubServiceProductServiceMock.restore();
        });
    });
    it('should send error when the request is invalid', (done) => {
      const stubData = getStubData();
      const identifier = 'some-uuid';
      stubData.request.params = { identifier };
      stubData.request.body = { product: {} };
      const pubServiceProductServiceMock = sinon.mock(
        publishingServiceProductService
      );
      pubServiceProductServiceMock
        .expects('updateServiceProduct')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.body.product
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
      publishingServiceController
        ._handlePublishingService(stubData.request, stubData.response, 'update')
        .then(() => {
          pubServiceProductServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          pubServiceProductServiceMock.restore();
        });
    });
  });
});
