import { Request, Response } from 'express';
import jwt = require('jsonwebtoken');
import * as mockExpressRequest from 'mock-express-request';
import * as mockExpressResponse from 'mock-express-response';
import * as sinon from 'sinon';

import { contentV4Service } from '../../v4/content/ContentV4.Service';
import * as strings from '../../v4/utils/SecretMangerUtils';
import { contentV410Controller } from './Content.V410.Controller';

const date = Math.round(new Date().getTime());
const jwtCode = jwt.sign(
  { exp: date + 36000, iat: date, user: { _id: 'some-id' } },
  'shhhhh'
);

const ip = '10.20.234.231';
const fakeIp = 'A.B.C.D';
const fakeJwtCode = jwt.sign(
  { exp: date + 36000, iat: date, user: { _id: 'some-garbage-id' } },
  'shhhhh'
);

const ipSignature = jwt.sign(
  { exp: date + 36000, iat: date, ip: '10.20.234.231', userId: 'some-id' },
  'shhhhh'
);
const fakeIpSignature = jwt.sign(
  { exp: date + 36000, iat: date, ip: fakeIp, userId: 'some-id' },
  'shhhhh'
);

function getStubData() {
  const request: Request = new mockExpressRequest();
  const response: Response = new mockExpressResponse();
  const responseMock = sinon.mock(response);
  const contentV4ServiceMock = sinon.mock(contentV4Service);
  return {
    contentV4ServiceMock,
    request,
    response,
    responseMock
  };
}

describe('Content.V410.Controller', () => {
  const isBot = false;
  const contentType = 'webpdf';
  const filenamePrefix = 'filename';
  const toRender = true;

  let stubData;
  let contentResponse;

  beforeEach(() => {
    stubData = getStubData();
    stubData.request.headers = {
      authorization: `idtoken ${jwtCode}`
    };
    stubData.request.params = {
      id: 'some-id'
    };
    contentResponse = [
      {
        accessType: 'open-access',
        location: 'https://signed-url-toupload',
        type: contentType
      }
    ];
    stubData.request.query = {
      apiVersion: '4.1.0',
      filenamePrefix,
      render: `${toRender}`,
      type: contentType
    };
  });
  describe('handleGetContentById', () => {
    it('should return content when content is valid without type', (done) => {
      stubData.request.query = {
        apiVersion: '4.1.0',
        filenamePrefix,
        ipSignature,
        render: `${toRender}`,
        type: contentType
      };
      const secretStub = sinon
        .stub(strings, 'getAPISecretValues')
        .returns({ ipVerifierKey: 'shhhhh' });
      stubData.contentV4ServiceMock
        .expects('getContentByIdAndType')
        .once()
        .withArgs(stubData.request.params.id, stubData.request.query.parentId, {
          cf: true,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          skipEntitlementCheck: false,
          toRender,
          token: jwtCode
        })
        .resolves(contentResponse);
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: contentResponse,
          metadata: { transactionId: undefined }
        });
      contentV410Controller
        .handleGetContentById(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.contentV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.contentV4ServiceMock.restore();
          secretStub.restore();
        });
    });
    it.skip(`should return content when content is valid without type and appName is
            "KORTEXT"`, (done) => {
      stubData.request.query = {
        apiVersion: '4.1.0',
        appName: 'KORTEXT',
        filenamePrefix,
        render: `${toRender}`,
        type: contentType
      };
      const skipEntitlementCheck = true;
      stubData.contentV4ServiceMock
        .expects('getContentByIdAndType')
        .once()
        .withArgs(stubData.request.params.id, stubData.request.query.parentId, {
          contentType,
          filenamePrefix,
          ip,
          isBot,
          skipEntitlementCheck,
          toRender,
          token: jwtCode
        })
        .resolves(contentResponse);
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: contentResponse,
          metadata: { transactionId: undefined }
        });
      contentV410Controller
        .handleGetContentById(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.contentV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.contentV4ServiceMock.restore();
        });
    });
    it('should return 404 error when content is null', (done) => {
      stubData.request.query = {
        apiVersion: '4.1.0',
        filenamePrefix,
        ipSignature,
        render: `${toRender}`,
        type: contentType
      };
      const secretStub = sinon
        .stub(strings, 'getAPISecretValues')
        .returns({ ipVerifierKey: 'shhhhh' });
      stubData.contentV4ServiceMock
        .expects('getContentByIdAndType')
        .once()
        .withArgs(stubData.request.params.id, stubData.request.query.parentId, {
          cf: true,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          skipEntitlementCheck: false,
          toRender,
          token: jwtCode
        })
        .resolves(null);
      stubData.responseMock.expects('status').once().withArgs(404);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Content not found',
            transactionId: undefined
          }
        });
      contentV410Controller
        .handleGetContentById(stubData.request, stubData.response)
        .then((res) => {
          stubData.responseMock.verify();
          stubData.contentV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.contentV4ServiceMock.restore();
          secretStub.restore();
        });
    });
    it('should return 404 error when content is an empty array', (done) => {
      stubData.request.query = {
        apiVersion: '4.1.0',
        filenamePrefix,
        ipSignature,
        render: `${toRender}`,
        type: contentType
      };
      const secretStub = sinon
        .stub(strings, 'getAPISecretValues')
        .returns({ ipVerifierKey: 'shhhhh' });
      stubData.contentV4ServiceMock
        .expects('getContentByIdAndType')
        .once()
        .withArgs(stubData.request.params.id, stubData.request.query.parentId, {
          cf: true,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          skipEntitlementCheck: false,
          toRender,
          token: jwtCode
        })
        .resolves([]);
      stubData.responseMock.expects('status').once().withArgs(404);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Content not found',
            transactionId: undefined
          }
        });
      contentV410Controller
        .handleGetContentById(stubData.request, stubData.response)
        .then((res) => {
          stubData.responseMock.verify();
          stubData.contentV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.contentV4ServiceMock.restore();
          secretStub.restore();
        });
    });
    it('should return 403 error when request token is invalid', (done) => {
      stubData.request.query = {
        apiVersion: '4.1.0',
        filenamePrefix,
        ipSignature,
        render: `${toRender}`,
        type: contentType
      };
      stubData.request.headers = {
        authorization: `idtoken ${fakeJwtCode}`
      };
      const secretStub = sinon
        .stub(strings, 'getAPISecretValues')
        .returns({ ipVerifierKey: 'shhhhh' });
      stubData.contentV4ServiceMock.expects('getContentByIdAndType').never();
      stubData.responseMock.expects('status').once().withArgs(403);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'User id mismatch',
            transactionId: undefined
          }
        });
      contentV410Controller
        .handleGetContentById(stubData.request, stubData.response)
        .then((res) => {
          stubData.responseMock.verify();
          stubData.contentV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.contentV4ServiceMock.restore();
          secretStub.restore();
        });
    });
    it('should return 403 error when request decoded token has invalid IP', (done) => {
      stubData.request.query = {
        apiVersion: '4.1.0',
        filenamePrefix,
        ipSignature: fakeIpSignature,
        render: `${toRender}`,
        type: contentType
      };
      stubData.request.headers = {
        authorization: `idtoken ${jwtCode}`
      };
      const secretStub = sinon
        .stub(strings, 'getAPISecretValues')
        .returns({ ipVerifierKey: 'shhhhh' });
      stubData.contentV4ServiceMock.expects('getContentByIdAndType').never();
      stubData.responseMock.expects('status').once().withArgs(403);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: `Invalid IP ${fakeIp}`,
            transactionId: undefined
          }
        });
      contentV410Controller
        .handleGetContentById(stubData.request, stubData.response)
        .then((res) => {
          stubData.responseMock.verify();
          stubData.contentV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.contentV4ServiceMock.restore();
          secretStub.restore();
        });
    });
    it('should return 400 error when request is invalid', (done) => {
      stubData.request.query = {
        apiVersion: '4.1.0',
        filenamePrefix,
        render: `${toRender}`,
        type: contentType
      };
      stubData.contentV4ServiceMock.expects('getContentByIdAndType').never();
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Missing parameter ipSignature',
            transactionId: undefined
          }
        });
      contentV410Controller
        .handleGetContentById(stubData.request, stubData.response)
        .then((res) => {
          stubData.responseMock.verify();
          stubData.contentV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.contentV4ServiceMock.restore();
        });
    });
    it('should throw 500 error when the Service layer throws error', (done) => {
      const internalError = new Error('Internal error');
      stubData.request.query = {
        apiVersion: '4.1.0',
        filenamePrefix,
        ipSignature,
        render: `${toRender}`,
        type: contentType
      };
      const secretStub = sinon
        .stub(strings, 'getAPISecretValues')
        .returns({ ipVerifierKey: 'shhhhh' });
      stubData.contentV4ServiceMock
        .expects('getContentByIdAndType')
        .once()
        .withArgs(stubData.request.params.id, stubData.request.query.parentId, {
          cf: true,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          skipEntitlementCheck: false,
          toRender,
          token: jwtCode
        })
        .rejects(internalError);
      stubData.contentV4ServiceMock.expects('getContentByIdAndType').never();
      stubData.responseMock.expects('status').once().withArgs(500);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Internal error',
            transactionId: undefined
          }
        });
      contentV410Controller
        .handleGetContentById(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.contentV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.contentV4ServiceMock.restore();
          secretStub.restore();
        });
    });
  });
});
