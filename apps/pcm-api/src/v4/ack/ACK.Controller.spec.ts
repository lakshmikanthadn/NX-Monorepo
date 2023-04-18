import { RedisConnection } from '@tandfgroup/privilege-authorization-manager/lib/src/cache';
import { expect } from 'chai';
import { Request, Response } from 'express';
import { Cluster } from 'ioredis';
import jwt = require('jsonwebtoken');
import * as mockExpressRequest from 'mock-express-request';
import * as mockExpressResponse from 'mock-express-response';
import * as sinon from 'sinon';

import { AppError } from '../../model/AppError';
import { ackController } from './ACK.Controller';
import { ackService } from './ACK.Service';
import { kortextProductAck } from './ACK.TestData';
import { Config } from '../../config/config';

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
describe('ACK.Controller ', () => {
  describe('handleAssetDistributionAck', () => {
    let hmGetStub: sinon.SinonStub;
    let redisStub: sinon.SinonStubbedInstance<Cluster>;
    beforeEach(() => {
      redisStub = sinon.createStubInstance(Cluster);
      hmGetStub = sinon.stub();
      (redisStub as any).hmget = hmGetStub;
      hmGetStub
        .withArgs(iamEnv, 'api:kortext-asset-ack:create')
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
      stubData.request.body = { data: { ...kortextProductAck } };
      const handleAckAsstDistributionStub = sinon
        .stub(ackController, '_ackAssetDistribution')
        .resolves('success');
      ackController.handleAssetDistributionAck(
        stubData.request,
        stubData.response
      );
      // There is an issue with IAM Decorator, so adding setTimeout.
      setTimeout(() => {
        try {
          expect(handleAckAsstDistributionStub.calledOnce).to.equal(true);
          expect(hmGetStub.calledOnce).to.equal(true);
          done();
        } catch (e) {
          done(e);
        } finally {
          handleAckAsstDistributionStub.restore();
        }
      }, 1000);
    });

    it('should throw error when APP Name is not KORTEXT', (done) => {
      const stubData = getStubData();
      stubData.request.headers = {
        authorization: 'idtoken ' + jwtCode
      };
      stubData.request.params = { identifier: 'some-uuid' };
      stubData.request.body = {
        data: { ...kortextProductAck, name: 'NON-KORTEXT' }
      };
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: [{ message: `Invalid name NON-KORTEXT`, path: '/name' }],
            message: `Invalid application name`,
            transactionId: undefined
          }
        });
      const handleAckAsstDistributionSpy = sinon.spy(
        ackController,
        '_ackAssetDistribution'
      );
      ackController.handleAssetDistributionAck(
        stubData.request,
        stubData.response
      );
      // There is an issue with IAM Decorator, so adding setTimeout.
      setTimeout(() => {
        try {
          expect(
            handleAckAsstDistributionSpy.called,
            'handleAckAsstDistributionSpy called'
          ).to.equal(false);
          expect(hmGetStub.called, 'hmGetStub.called').to.equal(false);
          stubData.responseMock.verify();
          done();
        } catch (e) {
          done(e);
        } finally {
          handleAckAsstDistributionSpy.restore();
          stubData.responseMock.restore();
        }
      }, 1000);
    });

    it('should return success message when ack data is valid', (done) => {
      const stubData = getStubData();
      stubData.request.headers = {
        authorization: 'idtoken ' + jwtCode
      };
      stubData.request.params = { identifier: 'some-uuid' };
      stubData.request.body = { data: { ...kortextProductAck } };
      const ackAsstDistributionStub = sinon
        .stub(ackService, 'ackAssetDistribution')
        .resolves('success');
      ackController._ackAssetDistribution(stubData.request, stubData.response);
      // There is an issue with IAM Decorator, so adding setTimeout.
      setTimeout(() => {
        try {
          expect(
            ackAsstDistributionStub.calledOnce,
            'ackAsstDistributionStub.called'
          ).to.equal(true);
          expect(hmGetStub.called, 'hmGetStub.called').to.equal(false);
          done();
        } catch (e) {
          done(e);
        } finally {
          ackAsstDistributionStub.restore();
        }
      }, 1000);
    });
    it('should throw error when ackService fails to ack', (done) => {
      const stubData = getStubData();
      stubData.request.headers = {
        authorization: 'idtoken ' + jwtCode
      };
      stubData.request.params = { identifier: 'some-uuid' };
      stubData.request.body = { data: { ...kortextProductAck } };
      const ackAsstDistributionStub = sinon
        .stub(ackService, 'ackAssetDistribution')
        .rejects(new AppError('Invalid request', 400));
      ackController._ackAssetDistribution(stubData.request, stubData.response);
      // There is an issue with IAM Decorator, so adding setTimeout.
      setTimeout(() => {
        try {
          expect(
            ackAsstDistributionStub.calledOnce,
            'ackAsstDistributionStub.called'
          ).to.equal(true);
          expect(hmGetStub.called, 'hmGetStub.called').to.equal(false);
          stubData.responseMock.verify();
          done();
        } catch (e) {
          done(e);
        } finally {
          ackAsstDistributionStub.restore();
        }
      }, 1000);
    });
  });
});
