import { expect } from 'chai';
import { Request, Response } from 'express';
import * as mockExpressRequest from 'mock-express-request';
import * as mockExpressResponse from 'mock-express-response';
import * as sinon from 'sinon';

import { prechapterV4Controller } from './PreChapterV4.Controller';
import { preChapterProductService } from './PreChapterV4.Service';

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
describe('PreChapterV4.Controller ', () => {
  describe('createPreChapterProduct', () => {
    it('should validate create permission, if valid then it should delegate request to handler', (done) => {
      const stubData = getStubData();
      stubData.request.params = { identifier: 'some-uuid' };
      stubData.request.body = { product: {} };
      const handlePreChapterStub = sinon
        .stub(prechapterV4Controller, '_handlePreChapter')
        .resolves('success');
      prechapterV4Controller.createPreChapterProduct(
        stubData.request,
        stubData.response
      );
      try {
        expect(handlePreChapterStub.calledOnce).to.equal(true);
        done();
      } catch (e) {
        done(e);
      } finally {
        handlePreChapterStub.restore();
      }
    });
  });
  describe('updatePreChapterProduct', () => {
    it('should validate update permission, if valid then it should delegate request to handler', (done) => {
      const stubData = getStubData();
      stubData.request.params = { identifier: 'some-uuid' };
      stubData.request.body = { product: {} };
      const handlePreChapterStub = sinon
        .stub(prechapterV4Controller, '_handlePreChapter')
        .resolves('success');
      prechapterV4Controller.updatePreChapterProduct(
        stubData.request,
        stubData.response
      );
      try {
        expect(handlePreChapterStub.calledOnce).to.equal(true);
        done();
      } catch (e) {
        done(e);
      } finally {
        handlePreChapterStub.restore();
      }
    });
  });
  describe('_handlePreChapter', () => {
    it('should send success message when the request is valid and action is create', (done) => {
      const stubData = getStubData();
      const identifier = 'TCEO';
      stubData.request.params = { identifier };
      stubData.request.body = { product: {} };
      const pubServiceProductServiceMock = sinon.mock(preChapterProductService);
      pubServiceProductServiceMock
        .expects('createPreChapterProduct')
        .once()
        .withArgs(stubData.request.body.product)
        .resolves('message-id-123');
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            message: [
              {
                code: 202,
                description: `Pre-Chapter product create request is accepted successfully, it will be processed soon.`
              }
            ],
            status: 'success',
            transactionId: undefined
          }
        });
      prechapterV4Controller
        ._handlePreChapter(stubData.request, stubData.response, 'create')
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
      const pubServiceProductServiceMock = sinon.mock(preChapterProductService);
      pubServiceProductServiceMock
        .expects('updatePreChapterProduct')
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
            message: [
              {
                code: 202,
                description: `Pre-Chapter product update request is accepted successfully, it will be processed soon.`
              }
            ],
            status: 'success',
            transactionId: undefined
          }
        });
      prechapterV4Controller
        ._handlePreChapter(stubData.request, stubData.response, 'update')
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
      const pubServiceProductServiceMock = sinon.mock(preChapterProductService);
      pubServiceProductServiceMock
        .expects('updatePreChapterProduct')
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
      prechapterV4Controller
        ._handlePreChapter(stubData.request, stubData.response, 'update')
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
