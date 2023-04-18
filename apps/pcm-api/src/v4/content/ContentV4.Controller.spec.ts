import { Request, Response } from 'express';
import * as mockExpressRequest from 'mock-express-request';
import * as mockExpressResponse from 'mock-express-response';
import * as sinon from 'sinon';

import { assert, expect } from 'chai';
import { assetV4Service } from '../assets/AssetV4.Service';
import { productV4Service } from '../products/ProductV4.Service';
import { contentV4Controller } from './ContentV4.Controller';
import { contentV4Service } from './ContentV4.Service';
import { Config } from '../../config/config';

function getStubData() {
  const request: Request & { hasAllContentAccess: boolean } =
    new mockExpressRequest();
  const response: Response = new mockExpressResponse();
  const responseMock = sinon.mock(response);
  const contentV4ServiceMock = sinon.mock(contentV4Service);
  const contentV4ControllerMock = sinon.mock(contentV4Controller);
  const assetV4ServiceMock = sinon.mock(assetV4Service);
  const productV4ServiceMock = sinon.mock(productV4Service);
  return {
    assetV4ServiceMock,
    contentV4ControllerMock,
    contentV4ServiceMock,
    productV4ServiceMock,
    request,
    response,
    responseMock
  };
}

describe('ContentV4.Controller', () => {
  const isBot = false;
  const ip = null;
  const cf = false;
  describe('createAssociatedMedia', () => {
    it('should return location when content is created & signed properly', (done) => {
      const stubData = getStubData();
      stubData.request.body = {
        fileName: 'content3.mp4',
        parentId: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'video'
      };
      const contentResponse = {
        location: 'https://signed-url-toupload'
      };
      stubData.contentV4ServiceMock
        .expects('createAssociatedMedia')
        .once()
        .withArgs(stubData.request.body)
        .resolves(contentResponse);
      stubData.responseMock.expects('status').once().withArgs(202);
      stubData.responseMock.expects('json').once().withArgs(contentResponse);
      contentV4Controller
        .createAssociatedMedia(stubData.request, stubData.response)
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
    it('should return error when validation fails', (done) => {
      const stubData = getStubData();
      stubData.request.body = {
        fileName: 'content3.mp4',
        parentId: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'hyperlink'
      };
      stubData.contentV4ServiceMock.expects('createAssociatedMedia').never();
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'hyperlink is no more supported using this api',
            transactionId: undefined
          }
        });
      contentV4Controller
        .createAssociatedMedia(stubData.request, stubData.response)
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
      const stubData = getStubData();
      stubData.request.body = {
        fileName: 'content3.mp4',
        parentId: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'video'
      };

      const internalError = new Error('Internal error');

      stubData.contentV4ServiceMock
        .expects('createAssociatedMedia')
        .once()
        .withArgs(stubData.request.body)
        .rejects(internalError);
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
      contentV4Controller
        .createAssociatedMedia(stubData.request, stubData.response)
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
  });
  describe('handleGetContentById', () => {
    it('should return content when content is valid without type', (done) => {
      const stubData = getStubData();
      stubData.request.params = {
        id: 'some-id'
      };
      stubData.request.query = {
        parentId: undefined,
        render: 'true',
        type: undefined
      };
      stubData.request.headers = {
        authorization: 'idtoken some-token'
      };
      const contentResponse = [
        {
          accessType: 'open-access',
          location: 'https://signed-url-toupload',
          type: 'googlepdf'
        }
      ];
      const contentType = undefined;
      const toRender = true;
      const token = 'some-token';
      const filenamePrefix = undefined;
      stubData.contentV4ServiceMock
        .expects('getContentByIdAndType')
        .once()
        .withArgs(stubData.request.params.id, stubData.request.query.parentId, {
          cf,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          skipEntitlementCheck: false,
          toRender,
          token
        })
        .resolves(contentResponse);
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(contentResponse);
      contentV4Controller
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
    it.skip(`should return content when content is valid without type and appName is
            "KORTEXT"`, (done) => {
      const stubData = getStubData();
      stubData.request.params = {
        id: 'some-id'
      };
      stubData.request.query = {
        appName: 'KORTEXT',
        parentId: undefined,
        render: 'true',
        type: undefined
      };
      stubData.request.headers = {
        authorization: 'idtoken some-token'
      };
      const contentResponse = [
        {
          accessType: 'open-access',
          location: 'https://signed-url-toupload',
          type: 'googlepdf'
        }
      ];
      const contentType = undefined;
      const toRender = true;
      const token = 'some-token';
      const filenamePrefix = undefined;
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
          token
        })
        .resolves(contentResponse);
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(contentResponse);
      contentV4Controller
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
    it('should return content when content is valid with type', (done) => {
      const stubData = getStubData();
      stubData.request.params = {
        id: 'some-id'
      };
      stubData.request.query = {
        parentId: undefined,
        render: 'true',
        type: 'googlepdf'
      };
      stubData.request.headers = {
        authorization: 'idtoken some-token'
      };
      const contentResponse = [
        {
          accessType: 'open-access',
          location: 'https://signed-url-toupload',
          type: 'googlepdf'
        }
      ];
      const contentType = stubData.request.query.type;
      const toRender = true;
      const token = 'some-token';
      const filenamePrefix = undefined;
      stubData.contentV4ServiceMock
        .expects('getContentByIdAndType')
        .once()
        .withArgs(stubData.request.params.id, stubData.request.query.parentId, {
          cf,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          skipEntitlementCheck: false,
          toRender,
          token
        })
        .resolves(contentResponse);
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(contentResponse);
      contentV4Controller
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
    it('should return content when content is valid and toRender is false', (done) => {
      const stubData = getStubData();
      stubData.request.params = {
        id: 'some-id'
      };
      stubData.request.query = {
        parentId: undefined,
        render: 'false',
        type: undefined
      };
      stubData.request.headers = {
        authorization: 'idtoken some-token'
      };
      const contentResponse = [
        {
          accessType: 'open-access',
          location: 'https://signed-url-toupload',
          type: 'googlepdf'
        }
      ];
      const contentType = undefined;
      const toRender = false;
      const token = 'some-token';
      const filenamePrefix = undefined;
      stubData.contentV4ServiceMock
        .expects('getContentByIdAndType')
        .once()
        .withArgs(stubData.request.params.id, stubData.request.query.parentId, {
          cf,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          skipEntitlementCheck: false,
          toRender,
          token
        })
        .resolves(contentResponse);
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(contentResponse);
      contentV4Controller
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
    it('should assume toRender as false when it is not defined', (done) => {
      const stubData = getStubData();
      stubData.request.params = {
        id: 'some-id'
      };
      stubData.request.query = {
        parentId: undefined,
        type: undefined
      };
      stubData.request.headers = {
        authorization: 'idtoken some-token'
      };
      const contentResponse = [
        {
          accessType: 'open-access',
          location: 'https://signed-url-toupload',
          type: 'googlepdf'
        }
      ];
      const contentType = undefined;
      const toRender = false;
      const token = 'some-token';
      const filenamePrefix = undefined;
      stubData.contentV4ServiceMock
        .expects('getContentByIdAndType')
        .once()
        .withArgs(stubData.request.params.id, stubData.request.query.parentId, {
          cf,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          skipEntitlementCheck: false,
          toRender,
          token
        })
        .resolves(contentResponse);
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(contentResponse);
      contentV4Controller
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
    it('should return error when render is not true or false', (done) => {
      const stubData = getStubData();
      stubData.request.params = {
        id: 'some-id'
      };
      stubData.request.query = {
        parentId: undefined,
        render: 'trueee',
        type: undefined
      };
      stubData.request.headers = {
        authorization: 'idtoken some-token'
      };
      stubData.contentV4ServiceMock.expects('getContentByIdAndType').never();
      stubData.contentV4ServiceMock.expects('getContentByIdAndType').never();
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Invalid query parameter: render',
            transactionId: undefined
          }
        });
      contentV4Controller
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
    it('should return error when filenamePrefix exceed maximum length', (done) => {
      const stubData = getStubData();
      stubData.request.params = {
        id: 'some-id'
      };
      stubData.request.query = {
        filenamePrefix:
          'AAAAAAAAAAABBBBBBBBBBBCCCCCCCCCCDDDDDDDDDDDEEEEEEEEFFFFFFFFFF',
        parentId: undefined,
        type: undefined
      };
      stubData.request.headers = {
        authorization: 'idtoken some-token'
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
            message:
              'Maximum character length should not exceed 50 for filenamePrefix',
            transactionId: undefined
          }
        });
      contentV4Controller
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
    it('should return error when content is null', (done) => {
      const stubData = getStubData();
      stubData.request.params = {
        id: 'some-id'
      };
      stubData.request.query = {
        parentId: undefined,
        render: 'true',
        type: undefined
      };
      stubData.request.headers = {
        authorization: 'idtoken some-token'
      };
      const contentType = undefined;
      const toRender = true;
      const token = 'some-token';
      const filenamePrefix = undefined;
      stubData.contentV4ServiceMock
        .expects('getContentByIdAndType')
        .once()
        .withArgs(stubData.request.params.id, stubData.request.query.parentId, {
          cf,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          skipEntitlementCheck: false,
          toRender,
          token
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
      contentV4Controller
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
    it('should return error when content is an empty array', (done) => {
      const stubData = getStubData();
      stubData.request.params = {
        id: 'some-id'
      };
      stubData.request.query = {
        parentId: undefined,
        render: 'true',
        type: undefined
      };
      stubData.request.headers = {
        authorization: 'idtoken some-token'
      };
      const contentType = undefined;
      const toRender = true;
      const token = 'some-token';
      const filenamePrefix = undefined;
      stubData.contentV4ServiceMock
        .expects('getContentByIdAndType')
        .once()
        .withArgs(stubData.request.params.id, stubData.request.query.parentId, {
          cf,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          skipEntitlementCheck: false,
          toRender,
          token
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
      contentV4Controller
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
      const stubData = getStubData();
      stubData.request.params = {
        id: 'some-id'
      };
      stubData.request.query = {
        parentId: undefined,
        render: 'true',
        type: undefined
      };
      stubData.request.headers = {
        authorization: 'idtoken some-token'
      };

      const internalError = new Error('Internal error');

      const contentType = undefined;
      const toRender = true;
      const token = 'some-token';
      const filenamePrefix = undefined;
      stubData.contentV4ServiceMock
        .expects('getContentByIdAndType')
        .once()
        .withArgs(stubData.request.params.id, stubData.request.query.parentId, {
          cf,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          skipEntitlementCheck: false,
          toRender,
          token
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
      contentV4Controller
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
  });
  describe('getContentByIdentifier', () => {
    it('should return error when identifier name not is passed', (done) => {
      const stubData = getStubData();
      stubData.request.query = {
        identifierValue: 'some-value'
      };
      stubData.request.headers = {
        authorization: 'idtoken some-token'
      };
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Missing parameter identifierName',
            transactionId: undefined
          }
        });
      stubData.assetV4ServiceMock
        .expects('getAssetsByIdentifierNameValues')
        .never();
      stubData.productV4ServiceMock.expects('getValidEbookId').never();
      const createContentSpy = sinon.spy(
        contentV4Controller,
        'getContentByIdBasedOnEntitlement'
      );
      contentV4Controller
        .getContentByIdentifier(stubData.request, stubData.response)
        .then((res) => {
          stubData.responseMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.productV4ServiceMock.verify();
          expect(createContentSpy.calledOnce).to.equal(false);
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.productV4ServiceMock.restore();
          createContentSpy.restore();
        });
    });
    it('should return error when incorrect identifier name is passed', (done) => {
      const stubData = getStubData();
      stubData.request.query = {
        identifierName: 'invalid-identifier',
        identifierValue: 'some-value',
        parentId: undefined,
        render: 'trueee',
        type: undefined
      };
      stubData.request.headers = {
        authorization: 'idtoken some-token'
      };
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Incorrect identifierName: invalid-identifier',
            transactionId: undefined
          }
        });
      stubData.assetV4ServiceMock
        .expects('getAssetsByIdentifierNameValues')
        .never();
      stubData.productV4ServiceMock.expects('getValidEbookId').never();
      const createContentSpy = sinon.spy(
        contentV4Controller,
        'getContentByIdBasedOnEntitlement'
      );
      contentV4Controller
        .getContentByIdentifier(stubData.request, stubData.response)
        .then((res) => {
          stubData.responseMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.productV4ServiceMock.verify();
          expect(createContentSpy.calledOnce).to.equal(false);
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.productV4ServiceMock.restore();
          createContentSpy.restore();
        });
    });
    it('should return error when identifier value not is passed', (done) => {
      const stubData = getStubData();
      stubData.request.query = {
        identifierName: 'isbn'
      };
      stubData.request.headers = {
        authorization: 'idtoken some-token'
      };
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Missing parameter identifierValue',
            transactionId: undefined
          }
        });
      stubData.assetV4ServiceMock
        .expects('getAssetsByIdentifierNameValues')
        .never();
      stubData.productV4ServiceMock.expects('getValidEbookId').never();
      const createContentSpy = sinon.spy(
        contentV4Controller,
        'getContentByIdBasedOnEntitlement'
      );
      contentV4Controller
        .getContentByIdentifier(stubData.request, stubData.response)
        .then((res) => {
          stubData.responseMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.productV4ServiceMock.verify();
          expect(createContentSpy.calledOnce).to.equal(false);
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.productV4ServiceMock.restore();
          createContentSpy.restore();
        });
    });
    it('should return 404 when asset does not exists', (done) => {
      const stubData = getStubData();
      stubData.request.query = {
        identifierName: 'isbn',
        identifierValue: 'some-value'
      };
      stubData.request.headers = {
        authorization: 'idtoken some-token'
      };
      stubData.responseMock.expects('status').once().withArgs(404);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Content (Product/Asset) not found',
            transactionId: undefined
          }
        });
      stubData.assetV4ServiceMock
        .expects('getAssetsByIdentifierNameValues')
        .once()
        .withArgs(stubData.request.query.identifierName, [
          stubData.request.query.identifierValue
        ])
        .resolves(null);
      stubData.productV4ServiceMock.expects('getValidEbookId').never();
      const createContentSpy = sinon.spy(
        contentV4Controller,
        'getContentByIdBasedOnEntitlement'
      );
      contentV4Controller
        .getContentByIdentifier(stubData.request, stubData.response)
        .then((res) => {
          stubData.responseMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.productV4ServiceMock.verify();
          expect(createContentSpy.calledOnce).to.equal(false);
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.productV4ServiceMock.restore();
          createContentSpy.restore();
        });
    });
    it(
      'should return 409 when multiple product types exists' +
        ' for the given identifier',
      (done) => {
        const stubData = getStubData();
        stubData.request.query = {
          identifierName: 'isbn',
          identifierValue: 'some-value'
        };
        stubData.request.headers = {
          authorization: 'idtoken some-token'
        };
        stubData.responseMock.expects('status').once().withArgs(409);
        stubData.responseMock
          .expects('json')
          .once()
          .withArgs({
            data: null,
            metadata: {
              error: undefined,
              message:
                'Product identifier is associated with ' +
                'multiple product types.',
              transactionId: undefined
            }
          });
        stubData.assetV4ServiceMock
          .expects('getAssetsByIdentifierNameValues')
          .once()
          .withArgs(stubData.request.query.identifierName, [
            stubData.request.query.identifierValue
          ])
          .resolves([
            { _id: 'some-id', type: 'other' },
            { _id: 'another-id', type: 'another-type' }
          ]);
        stubData.productV4ServiceMock.expects('getValidEbookId').never();
        const createContentSpy = sinon.spy(
          contentV4Controller,
          'getContentByIdBasedOnEntitlement'
        );
        contentV4Controller
          .getContentByIdentifier(stubData.request, stubData.response)
          .then((res) => {
            stubData.responseMock.verify();
            stubData.assetV4ServiceMock.verify();
            stubData.productV4ServiceMock.verify();
            expect(createContentSpy.calledOnce).to.equal(false);
            done();
          })
          .catch(done)
          .finally(() => {
            stubData.responseMock.restore();
            stubData.assetV4ServiceMock.restore();
            stubData.productV4ServiceMock.restore();
            createContentSpy.restore();
          });
      }
    );
    it('should go for valid scenario when request had valid ebook record', (done) => {
      const stubData = getStubData();
      stubData.request.query = {
        identifierName: 'isbn',
        identifierValue: 'some-value'
      };
      stubData.request.headers = {
        authorization: 'idtoken some-token'
      };
      stubData.assetV4ServiceMock
        .expects('getAssetsByIdentifierNameValues')
        .once()
        .withArgs(stubData.request.query.identifierName, [
          stubData.request.query.identifierValue
        ])
        .resolves([
          { _id: 'some-id', type: 'book' },
          { _id: 'some-other-id', type: 'other' }
        ]);
      stubData.productV4ServiceMock
        .expects('getValidEbookId')
        .once()
        .withArgs(['some-id'], 'book')
        .resolves('some-id');
      const createContentStub = sinon
        .stub(contentV4Controller, 'getContentByIdBasedOnEntitlement')
        .callsFake();
      contentV4Controller
        .getContentByIdentifier(stubData.request, stubData.response)
        .then(() => {
          stubData.assetV4ServiceMock.verify();
          stubData.productV4ServiceMock.verify();
          assert(createContentStub.calledOnce);
          done();
        })
        .catch(done)
        .finally(() => {
          createContentStub.restore();
          stubData.productV4ServiceMock.restore();
          stubData.assetV4ServiceMock.restore();
        });
    });
    it(
      'should return 404 when no valid ebook record found' +
        'for the given identifier',
      (done) => {
        const stubData = getStubData();
        stubData.request.query = {
          identifierName: 'isbn',
          identifierValue: 'some-value'
        };
        stubData.request.headers = {
          authorization: 'idtoken some-token'
        };
        stubData.responseMock.expects('status').once().withArgs(404);
        stubData.responseMock
          .expects('json')
          .once()
          .withArgs({
            data: null,
            metadata: {
              error: undefined,
              message: 'Content (Product/Asset) not found',
              transactionId: undefined
            }
          });
        stubData.assetV4ServiceMock
          .expects('getAssetsByIdentifierNameValues')
          .once()
          .withArgs(stubData.request.query.identifierName, [
            stubData.request.query.identifierValue
          ])
          .resolves([
            { _id: 'some-id', type: 'book' },
            { _id: 'another-id', type: 'book' }
          ]);
        stubData.productV4ServiceMock
          .expects('getValidEbookId')
          .once()
          .withArgs(['some-id', 'another-id'], 'book')
          .resolves(null);
        const createContentSpy = sinon.spy(
          contentV4Controller,
          'getContentByIdBasedOnEntitlement'
        );
        contentV4Controller
          .getContentByIdentifier(stubData.request, stubData.response)
          .then((res) => {
            stubData.responseMock.verify();
            stubData.assetV4ServiceMock.verify();
            stubData.productV4ServiceMock.verify();
            expect(createContentSpy.calledOnce).to.equal(false);
            done();
          })
          .catch(done)
          .finally(() => {
            stubData.responseMock.restore();
            stubData.assetV4ServiceMock.restore();
            stubData.productV4ServiceMock.restore();
            createContentSpy.restore();
          });
      }
    );
    it('should return content when content is valid without type', (done) => {
      const stubData = getStubData();
      stubData.request.query = {
        identifierName: 'isbn',
        identifierValue: 'some-value',
        parentId: undefined,
        render: 'true',
        type: undefined
      };
      stubData.request.headers = {
        authorization: 'idtoken some-token'
      };
      const assetResponse = { _id: 'some-id', type: 'book' };
      const contentResponse = [
        {
          accessType: 'open-access',
          location: 'https://signed-url-toupload',
          type: 'googlepdf'
        }
      ];
      stubData.assetV4ServiceMock
        .expects('getAssetsByIdentifierNameValues')
        .once()
        .withArgs(stubData.request.query.identifierName, [
          stubData.request.query.identifierValue
        ])
        .resolves([assetResponse]);
      stubData.productV4ServiceMock.expects('getValidEbookId').never();
      const contentType = undefined;
      const toRender = true;
      const token = 'some-token';
      const filenamePrefix = undefined;
      stubData.contentV4ServiceMock
        .expects('getContentByIdAndType')
        .once()
        .withArgs(assetResponse._id, stubData.request.query.parentId, {
          cf,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          skipEntitlementCheck: false,
          toRender,
          token
        })
        .resolves(contentResponse);
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(contentResponse);
      contentV4Controller
        .getContentByIdentifier(stubData.request, stubData.response)
        .then(() => {
          stubData.assetV4ServiceMock.verify();
          stubData.responseMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.contentV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.productV4ServiceMock.restore();
          stubData.contentV4ServiceMock.restore();
        });
    });
    it('should go for valid scenario when request is valid', (done) => {
      const stubData = getStubData();
      stubData.request.query = {
        identifierName: 'isbn',
        identifierValue: 'some-value'
      };
      stubData.request.headers = {
        authorization: 'idtoken some-token'
      };
      stubData.assetV4ServiceMock
        .expects('getAssetsByIdentifierNameValues')
        .once()
        .withArgs(stubData.request.query.identifierName, [
          stubData.request.query.identifierValue
        ])
        .resolves([{ _id: 'some-id', type: 'book' }]);
      stubData.productV4ServiceMock.expects('getValidEbookId').never();
      const createContentStub = sinon
        .stub(contentV4Controller, 'getContentByIdBasedOnEntitlement')
        .callsFake();
      contentV4Controller
        .getContentByIdentifier(stubData.request, stubData.response)
        .then(() => {
          stubData.assetV4ServiceMock.verify();
          stubData.productV4ServiceMock.verify();
          assert(createContentStub.calledOnce);
          done();
        })
        .catch(done)
        .finally(() => {
          createContentStub.restore();
          stubData.productV4ServiceMock.restore();
          stubData.assetV4ServiceMock.restore();
        });
    });
    it('should go for valid scenario when request had valid entry-version with valid contextId', (done) => {
      const stubData = getStubData();
      stubData.request.query = {
        identifierName: 'doi',
        identifierValue: 'some-doi'
      };
      stubData.request.headers = {
        authorization: 'idtoken some-token'
      };
      stubData.assetV4ServiceMock
        .expects('getAssetsByIdentifierNameValues')
        .once()
        .withArgs(stubData.request.query.identifierName, [
          stubData.request.query.identifierValue
        ])
        .resolves([{ _id: 'some-id', type: 'entryVersion' }]);
      stubData.productV4ServiceMock.expects('getValidEbookId').never();
      const createContentStub = sinon
        .stub(contentV4Controller, 'getContentByIdBasedOnEntitlement')
        .callsFake();
      contentV4Controller
        .getContentByIdentifier(stubData.request, stubData.response)
        .then(() => {
          stubData.assetV4ServiceMock.verify();
          stubData.productV4ServiceMock.verify();
          assert(createContentStub.calledOnce);
          done();
        })
        .catch(done)
        .finally(() => {
          createContentStub.restore();
          stubData.productV4ServiceMock.restore();
          stubData.assetV4ServiceMock.restore();
        });
    });
    it('should go for valid scenario when request had valid ebook record', (done) => {
      const stubData = getStubData();
      stubData.request.query = {
        identifierName: 'isbn',
        identifierValue: 'some-value'
      };
      stubData.request.headers = {
        authorization: 'idtoken some-token'
      };
      stubData.assetV4ServiceMock
        .expects('getAssetsByIdentifierNameValues')
        .once()
        .withArgs(stubData.request.query.identifierName, [
          stubData.request.query.identifierValue
        ])
        .resolves([
          { _id: 'some-id', type: 'book' },
          { _id: 'some-other-id', type: 'book' }
        ]);
      stubData.productV4ServiceMock
        .expects('getValidEbookId')
        .once()
        .withArgs(['some-id', 'some-other-id'], 'book')
        .resolves('some-id');
      const createContentStub = sinon
        .stub(contentV4Controller, 'getContentByIdBasedOnEntitlement')
        .callsFake();
      contentV4Controller
        .getContentByIdentifier(stubData.request, stubData.response)
        .then(() => {
          stubData.assetV4ServiceMock.verify();
          stubData.productV4ServiceMock.verify();
          assert(createContentStub.calledOnce);
          done();
        })
        .catch(done)
        .finally(() => {
          createContentStub.restore();
          stubData.productV4ServiceMock.restore();
          stubData.assetV4ServiceMock.restore();
        });
    });
    it(
      'should return CMS content when multiple chapters ' +
        'exists for the same identifier',
      (done) => {
        const stubData = getStubData();
        stubData.request.query = {
          identifierName: 'doi',
          identifierValue: 'some-value',
          parentId: undefined,
          render: 'true',
          type: undefined
        };
        stubData.request.headers = {
          authorization: 'idtoken some-token'
        };
        const assetResponse = [
          {
            _id: 'some-other-id',
            _sources: [
              {
                source: 'MBS',
                type: 'product'
              },
              {
                source: 'PMP',
                type: 'content'
              }
            ],
            type: 'chapter'
          },
          {
            _id: 'some-id',
            _sources: [
              {
                source: 'MBS',
                type: 'product'
              },
              {
                source: 'CMS',
                type: 'content'
              }
            ],
            type: 'chapter'
          }
        ];
        const contentResponse = [
          {
            accessType: 'open-access',
            location: 'https://signed-url-toupload',
            type: 'chapterpdf'
          }
        ];
        stubData.assetV4ServiceMock
          .expects('getAssetsByIdentifierNameValues')
          .once()
          .withArgs(stubData.request.query.identifierName, [
            stubData.request.query.identifierValue
          ])
          .resolves(assetResponse);
        stubData.productV4ServiceMock.expects('getValidEbookId').never();
        const contentType = undefined;
        const toRender = true;
        const token = 'some-token';
        const filenamePrefix = undefined;
        stubData.contentV4ServiceMock
          .expects('getContentByIdAndType')
          .once()
          .withArgs(assetResponse[1]._id, stubData.request.query.parentId, {
            cf,
            contentType,
            filenamePrefix,
            ip,
            isBot,
            skipEntitlementCheck: false,
            toRender,
            token
          })
          .resolves(contentResponse);
        stubData.responseMock.expects('status').once().withArgs(200);
        stubData.responseMock.expects('json').once().withArgs(contentResponse);
        contentV4Controller
          .getContentByIdentifier(stubData.request, stubData.response)
          .then(() => {
            stubData.assetV4ServiceMock.verify();
            stubData.responseMock.verify();
            stubData.productV4ServiceMock.verify();
            stubData.contentV4ServiceMock.verify();
            done();
          })
          .catch(done)
          .finally(() => {
            stubData.responseMock.restore();
            stubData.assetV4ServiceMock.restore();
            stubData.productV4ServiceMock.restore();
            stubData.contentV4ServiceMock.restore();
          });
      }
    );
    it(
      'should return latest PMP record content when multiple chapters' +
        ' with same PMP content source exists for the same identifier',
      (done) => {
        const stubData = getStubData();
        stubData.request.query = {
          identifierName: 'doi',
          identifierValue: 'some-value',
          parentId: undefined,
          render: 'true',
          type: undefined
        };
        stubData.request.headers = {
          authorization: 'idtoken some-token'
        };
        const assetResponse = [
          {
            _id: 'some-other-id',
            _modifiedDate: new Date(new Date().getDate() - 1),
            _sources: [
              {
                source: 'MBS',
                type: 'product'
              },
              {
                source: 'PMP',
                type: 'content'
              }
            ],
            type: 'chapter'
          },
          {
            _id: 'some-id',
            _modifiedDate: new Date(),
            _sources: [
              {
                source: 'MBS',
                type: 'product'
              },
              {
                source: 'PMP',
                type: 'content'
              }
            ],
            type: 'chapter'
          }
        ];
        const contentResponse = [
          {
            accessType: 'open-access',
            location: 'https://signed-url-toupload',
            type: 'chapterpdf'
          }
        ];
        stubData.assetV4ServiceMock
          .expects('getAssetsByIdentifierNameValues')
          .once()
          .withArgs(stubData.request.query.identifierName, [
            stubData.request.query.identifierValue
          ])
          .resolves(assetResponse);
        stubData.productV4ServiceMock.expects('getValidEbookId').never();
        const contentType = undefined;
        const toRender = true;
        const token = 'some-token';
        const filenamePrefix = undefined;
        stubData.contentV4ServiceMock
          .expects('getContentByIdAndType')
          .once()
          .withArgs(assetResponse[1]._id, stubData.request.query.parentId, {
            cf,
            contentType,
            filenamePrefix,
            ip,
            isBot,
            skipEntitlementCheck: false,
            toRender,
            token
          })
          .resolves(contentResponse);
        stubData.responseMock.expects('status').once().withArgs(200);
        stubData.responseMock.expects('json').once().withArgs(contentResponse);
        contentV4Controller
          .getContentByIdentifier(stubData.request, stubData.response)
          .then(() => {
            stubData.assetV4ServiceMock.verify();
            stubData.responseMock.verify();
            stubData.productV4ServiceMock.verify();
            stubData.contentV4ServiceMock.verify();
            done();
          })
          .catch(done)
          .finally(() => {
            stubData.responseMock.restore();
            stubData.assetV4ServiceMock.restore();
            stubData.productV4ServiceMock.restore();
            stubData.contentV4ServiceMock.restore();
          });
      }
    );
    it(
      'should return latest CMS record content when multiple chapters' +
        ' with same CMS content source exists for the same identifier',
      (done) => {
        const stubData = getStubData();
        stubData.request.query = {
          identifierName: 'doi',
          identifierValue: 'some-value',
          parentId: undefined,
          render: 'true',
          type: undefined
        };
        stubData.request.headers = {
          authorization: 'idtoken some-token'
        };
        const assetResponse = [
          {
            _id: 'some-other-id',
            _modifiedDate: new Date(),
            _sources: [
              {
                source: 'MBS',
                type: 'product'
              },
              {
                source: 'CMS',
                type: 'content'
              }
            ],
            type: 'chapter'
          },
          {
            _id: 'some-id',
            _modifiedDate: new Date(new Date().getDate() - 1),
            _sources: [
              {
                source: 'MBS',
                type: 'product'
              },
              {
                source: 'CMS',
                type: 'content'
              }
            ],
            type: 'chapter'
          }
        ];
        const contentResponse = [
          {
            accessType: 'open-access',
            location: 'https://signed-url-toupload',
            type: 'chapterpdf'
          }
        ];
        stubData.assetV4ServiceMock
          .expects('getAssetsByIdentifierNameValues')
          .once()
          .withArgs(stubData.request.query.identifierName, [
            stubData.request.query.identifierValue
          ])
          .resolves(assetResponse);
        stubData.productV4ServiceMock.expects('getValidEbookId').never();
        const contentType = undefined;
        const toRender = true;
        const token = 'some-token';
        const filenamePrefix = undefined;
        stubData.contentV4ServiceMock
          .expects('getContentByIdAndType')
          .once()
          .withArgs(assetResponse[0]._id, stubData.request.query.parentId, {
            cf,
            contentType,
            filenamePrefix,
            ip,
            isBot,
            skipEntitlementCheck: false,
            toRender,
            token
          })
          .resolves(contentResponse);
        stubData.responseMock.expects('status').once().withArgs(200);
        stubData.responseMock.expects('json').once().withArgs(contentResponse);
        contentV4Controller
          .getContentByIdentifier(stubData.request, stubData.response)
          .then(() => {
            stubData.assetV4ServiceMock.verify();
            stubData.responseMock.verify();
            stubData.productV4ServiceMock.verify();
            stubData.contentV4ServiceMock.verify();
            done();
          })
          .catch(done)
          .finally(() => {
            stubData.responseMock.restore();
            stubData.assetV4ServiceMock.restore();
            stubData.productV4ServiceMock.restore();
            stubData.contentV4ServiceMock.restore();
          });
      }
    );
    it(
      'should return 409 when multiple products (except book, chapter) exists ' +
        'for the given identifier',
      (done) => {
        const stubData = getStubData();
        stubData.request.query = {
          identifierName: 'isbn',
          identifierValue: 'some-value'
        };
        stubData.request.headers = {
          authorization: 'idtoken some-token'
        };
        stubData.responseMock.expects('status').once().withArgs(409);
        stubData.responseMock
          .expects('json')
          .once()
          .withArgs({
            data: null,
            metadata: {
              error: undefined,
              message:
                'Product identifier is associated with more than one Product.',
              transactionId: undefined
            }
          });
        stubData.assetV4ServiceMock
          .expects('getAssetsByIdentifierNameValues')
          .once()
          .withArgs(stubData.request.query.identifierName, [
            stubData.request.query.identifierValue
          ])
          .resolves([
            { _id: 'some-id', type: 'other-type' },
            { _id: 'another-id', type: 'other-type' }
          ]);
        stubData.productV4ServiceMock.expects('getValidEbookId').never();
        const createContentSpy = sinon.spy(
          contentV4Controller,
          'handleGetContentById'
        );
        contentV4Controller
          .getContentByIdentifier(stubData.request, stubData.response)
          .then(() => {
            stubData.responseMock.verify();
            stubData.assetV4ServiceMock.verify();
            stubData.productV4ServiceMock.verify();
            expect(createContentSpy.calledOnce).to.equal(false);
            done();
          })
          .catch(done)
          .finally(() => {
            stubData.responseMock.restore();
            stubData.assetV4ServiceMock.restore();
            stubData.productV4ServiceMock.restore();
            createContentSpy.restore();
          });
      }
    );
  });
  describe('downloadContentByIdentifier', () => {
    it('should redirect to UBX page when the hasAccess is false', (done) => {
      const stubData = getStubData();
      stubData.request.hasAllContentAccess = true;
      const identifierName = 'isbn';
      const identifierValue = 'some-value';
      const categoryType = 'oa';
      const productType = 'books';
      const baseUrl = Config.getPropertyValue('ubxWebsUrl');
      stubData.request.query = {
        identifierName,
        identifierValue
      };
      stubData.request.params = {
        categoryType,
        productType
      };
      const url = `${baseUrl}/${productType}/${categoryType}/${identifierValue}`;
      stubData.request.headers = {
        authorization: 'idtoken some-token'
      };
      stubData.responseMock.expects('redirect').once().withArgs(url);
      contentV4Controller
        .downloadContentByIdentifier(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          stubData.responseMock.restore();
        });
    });
    it('should redirect to UBX page when the hasAccess is true && content type is missing', (done) => {
      const stubData = getStubData();
      stubData.request.hasAllContentAccess = true;
      const identifierName = 'isbn';
      const identifierValue = 'some-value';
      const categoryType = 'oa';
      const productType = 'books';
      const baseUrl = Config.getPropertyValue('ubxWebsUrl');
      stubData.request.query = {
        identifierName,
        identifierValue
      };
      stubData.request.params = {
        categoryType,
        productType
      };
      const url = `${baseUrl}/${productType}/${categoryType}/${identifierValue}`;
      stubData.request.headers = {
        authorization: 'idtoken some-token'
      };
      stubData.responseMock.expects('redirect').once().withArgs(url);
      contentV4Controller
        .downloadContentByIdentifier(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          stubData.responseMock.restore();
        });
    });

    it('should redirect to UBX page when the hasAccess is false && content type is missing', (done) => {
      const stubData = getStubData();
      stubData.request.hasAllContentAccess = false;
      const identifierName = 'isbn';
      const identifierValue = 'some-value';
      const categoryType = 'oa';
      const productType = 'books';
      const baseUrl = Config.getPropertyValue('ubxWebsUrl');
      stubData.request.query = {
        identifierName,
        identifierValue
      };
      stubData.request.params = {
        categoryType,
        productType
      };
      const url = `${baseUrl}/${productType}/${categoryType}/${identifierValue}`;
      stubData.request.headers = {
        authorization: 'idtoken some-token'
      };
      stubData.responseMock.expects('redirect').once().withArgs(url);
      contentV4Controller
        .downloadContentByIdentifier(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          stubData.responseMock.restore();
        });
    });
    it('should redirect to UBX page when the hasAccess is false and content type is there', (done) => {
      const stubData = getStubData();
      stubData.request.hasAllContentAccess = true;
      const identifierName = 'isbn';
      const identifierValue = 'some-value';
      const categoryType = 'oa';
      const productType = 'books';
      const contentType = 'previewpdf';
      const baseUrl = Config.getPropertyValue('ubxWebsUrl');
      stubData.request.query = {
        contentType,
        identifierName,
        identifierValue
      };
      stubData.request.params = {
        categoryType,
        productType
      };
      const url = `${baseUrl}/${productType}/${categoryType}/${identifierValue}`;
      stubData.request.headers = {
        authorization: 'idtoken some-token'
      };
      stubData.responseMock.expects('redirect').once().withArgs(url);
      contentV4Controller
        .downloadContentByIdentifier(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          stubData.responseMock.restore();
        });
    });
    it('should redirect to UBX page when identifierName is missing', (done) => {
      const stubData = getStubData();
      stubData.request.hasAllContentAccess = true;
      const identifierValue = 'some-value';
      const categoryType = 'oa';
      const productType = 'books';
      const contentType = 'previewpdf';
      const baseUrl = Config.getPropertyValue('ubxWebsUrl');
      stubData.request.query = {
        contentType,
        identifierValue
      };
      stubData.request.params = {
        categoryType,
        productType
      };
      const url = `${baseUrl}/${productType}/${categoryType}/${identifierValue}`;
      stubData.request.headers = {
        authorization: 'idtoken some-token'
      };
      stubData.responseMock.expects('redirect').once().withArgs(url);
      contentV4Controller
        .downloadContentByIdentifier(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          stubData.responseMock.restore();
        });
    });
    it('should redirect to UBX page when identifierValue is missing', (done) => {
      const stubData = getStubData();
      stubData.request.hasAllContentAccess = true;
      const identifierName = 'isbn';
      const identifierValue = undefined;
      const categoryType = 'oa';
      const productType = 'books';
      const contentType = 'previewpdf';
      const baseUrl = Config.getPropertyValue('ubxWebsUrl');
      stubData.request.query = {
        contentType,
        identifierName
      };
      stubData.request.params = {
        categoryType,
        productType
      };
      const url = `${baseUrl}/${productType}/${categoryType}/${identifierValue}`;
      stubData.request.headers = {
        authorization: 'idtoken some-token'
      };
      stubData.responseMock.expects('redirect').once().withArgs(url);
      contentV4Controller
        .downloadContentByIdentifier(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          stubData.responseMock.restore();
        });
    });
    it('should redirect to UBX page when identifierName is not isbn or doi', (done) => {
      const stubData = getStubData();
      stubData.request.hasAllContentAccess = true;
      const identifierName = 'some';
      const identifierValue = 'some-value';
      const categoryType = 'oa';
      const productType = 'books';
      const contentType = 'previewpdf';
      const baseUrl = Config.getPropertyValue('ubxWebsUrl');
      stubData.request.query = {
        contentType,
        identifierName,
        identifierValue
      };
      stubData.request.params = {
        categoryType,
        productType
      };
      const url = `${baseUrl}/${productType}/${categoryType}/${identifierValue}`;
      stubData.request.headers = {
        authorization: 'idtoken some-token'
      };
      stubData.responseMock.expects('redirect').once().withArgs(url);
      contentV4Controller
        .downloadContentByIdentifier(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          stubData.responseMock.restore();
        });
    });
    it('should get url when productId and type is present', (done) => {
      const stubData = getStubData();
      stubData.request.hasAllContentAccess = true;
      const categoryType = 'oa';
      const productType = 'books';
      const contentType = 'webpdf';
      const identifierValue = 'some-value';
      const _id = 'some-id';
      const contextId = 'context-id';
      const baseUrl = Config.getPropertyValue('ubxWebsUrl');
      const contentResponse = [
        {
          accessType: 'open-access',
          location: 'https://signed-url-toupload',
          type: 'webpdf'
        }
      ];
      const contentLocation = 'https://signed-url-toupload';
      stubData.request.query = {
        contextId,
        identifierName: 'isbn',
        identifierValue: 'some-value',
        type: contentType
      };
      stubData.request.params = {
        categoryType,
        productType
      };
      const url = `${baseUrl}/${productType}/${categoryType}/${identifierValue}`;
      stubData.assetV4ServiceMock
        .expects('getValidAssetByIdentifierNameValue')
        .once()
        .withArgs(
          stubData.request.query.identifierName,
          stubData.request.query.identifierValue
        )
        .resolves({ _id: null, type: 'book' });
      stubData.responseMock.expects('redirect').once().withArgs(url);
      contentV4Controller
        .downloadContentByIdentifier(stubData.request, stubData.response)
        .then(() => {
          stubData.assetV4ServiceMock.verify();
          stubData.responseMock.verify();

          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          stubData.assetV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it('should get url when productId and type is present and asset returns id', (done) => {
      const stubData = getStubData();
      stubData.request.hasAllContentAccess = true;
      const categoryType = 'oa';
      const productType = 'books';
      const contentType = 'webpdf';
      const identifierValue = 'some-value';
      const _id = 'some-id';
      const contextId = 'context-id';
      const baseUrl = Config.getPropertyValue('ubxWebsUrl');
      const contentResponse = [
        {
          accessType: 'open-access',
          location: 'https://signed-url-toupload',
          type: 'webpdf'
        }
      ];
      const contentLocation = 'https://signed-url-toupload';
      stubData.request.query = {
        contextId,
        identifierName: 'isbn',
        identifierValue: 'some-value',
        type: contentType
      };
      stubData.request.params = {
        categoryType,
        productType
      };
      const url = `/${productType}/${categoryType}/${identifierValue}`;
      stubData.assetV4ServiceMock
        .expects('getValidAssetByIdentifierNameValue')
        .once()
        .withArgs(
          stubData.request.query.identifierName,
          stubData.request.query.identifierValue
        )
        .resolves({ _id: 'some-id', type: 'book' });
      stubData.productV4ServiceMock
        .expects('getRelUrlFromProduct')
        .once()
        .withArgs('some-id', 'book')
        .resolves(`${productType}/${categoryType}/${identifierValue}`);
      const toRender = false;
      const token = '';
      const filenamePrefix = 'some-value';
      stubData.contentV4ServiceMock
        .expects('getContentByIdAndType')
        .once()
        .withArgs('some-id', stubData.request.query.contextId, {
          cf,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .resolves(contentResponse);

      stubData.responseMock
        .expects('redirect')
        .once()
        .withArgs(contentLocation);
      contentV4Controller
        .downloadContentByIdentifier(stubData.request, stubData.response)
        .then(() => {
          stubData.assetV4ServiceMock.verify();
          stubData.responseMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.contentV4ServiceMock.verify();

          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          stubData.assetV4ServiceMock.restore();
          stubData.responseMock.restore();
          stubData.productV4ServiceMock.restore();
          stubData.contentV4ServiceMock.restore();
        });
    });
    it('should get url when productId and type is present and content type is googlepdf', (done) => {
      const stubData = getStubData();
      stubData.request.hasAllContentAccess = true;
      const categoryType = 'oa';
      const productType = 'books';
      const contentType = 'googlepdf';
      const identifierValue = 'some-value';
      const _id = 'some-id';
      const contextId = 'context-id';
      const baseUrl = Config.getPropertyValue('ubxWebsUrl');
      const contentResponse = [
        {
          accessType: 'open-access',
          type: 'googlepdf'
        }
      ];
      const contentResponseForGooglePdf = [
        {
          accessType: 'open-access',
          location: 'https://signed-url-toupload',
          type: 'previewpdf'
        }
      ];
      const contentLocation = 'https://signed-url-toupload';
      stubData.request.query = {
        contextId,
        identifierName: 'isbn',
        identifierValue: 'some-value',
        type: contentType
      };
      stubData.request.params = {
        categoryType,
        productType
      };
      const url = `${baseUrl}/${productType}/${categoryType}/${identifierValue}`;
      stubData.assetV4ServiceMock
        .expects('getValidAssetByIdentifierNameValue')
        .once()
        .withArgs(
          stubData.request.query.identifierName,
          stubData.request.query.identifierValue
        )
        .resolves({ _id: 'some-id', type: 'book' });
      stubData.productV4ServiceMock
        .expects('getRelUrlFromProduct')
        .once()
        .withArgs('some-id', 'book')
        .resolves(`${productType}/${categoryType}/${identifierValue}`);
      const toRender = false;
      const token = '';
      const filenamePrefix = 'some-value';
      stubData.contentV4ServiceMock
        .expects('getContentByIdAndType')
        .once()
        .withArgs('some-id', stubData.request.query.contextId, {
          cf,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .resolves(contentResponse);
      stubData.contentV4ServiceMock
        .expects('getContentByIdAndType')
        .once()
        .withArgs('some-id', null, {
          cf,
          contentType: 'previewpdf',
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .resolves(contentResponseForGooglePdf);

      stubData.responseMock
        .expects('redirect')
        .once()
        .withArgs(contentLocation);
      contentV4Controller
        .downloadContentByIdentifier(stubData.request, stubData.response)
        .then(() => {
          stubData.assetV4ServiceMock.verify();
          stubData.responseMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.contentV4ServiceMock.verify();

          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          stubData.assetV4ServiceMock.restore();
          stubData.responseMock.restore();
          stubData.contentV4ServiceMock.restore();
          stubData.productV4ServiceMock.restore();
        });
    });
    it('should get url when productId and type is present and content type is not googlepdf', (done) => {
      const stubData = getStubData();
      stubData.request.hasAllContentAccess = true;
      const categoryType = 'oa';
      const productType = 'books';
      const contentType = 'webpdf';
      const identifierValue = 'some-value';
      const _id = 'some-id';
      const contextId = 'context-id';
      const baseUrl = Config.getPropertyValue('ubxWebsUrl');
      const contentResponse = [
        {
          accessType: 'open-access',
          type: 'webpdf'
        }
      ];
      const contentLocation = 'https://signed-url-toupload';
      stubData.request.query = {
        contextId,
        identifierName: 'isbn',
        identifierValue: 'some-value',
        type: contentType
      };
      stubData.request.params = {
        categoryType,
        productType
      };
      const url = `${baseUrl}/${productType}/${categoryType}/${identifierValue}`;
      stubData.assetV4ServiceMock
        .expects('getValidAssetByIdentifierNameValue')
        .once()
        .withArgs(
          stubData.request.query.identifierName,
          stubData.request.query.identifierValue
        )
        .resolves({ _id: 'some-id', type: 'book' });
      stubData.productV4ServiceMock
        .expects('getRelUrlFromProduct')
        .once()
        .withArgs('some-id', 'book')
        .resolves(`${productType}/${categoryType}/${identifierValue}`);
      const toRender = false;
      const token = '';
      const filenamePrefix = 'some-value';
      stubData.contentV4ServiceMock
        .expects('getContentByIdAndType')
        .once()
        .withArgs('some-id', stubData.request.query.contextId, {
          cf,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .resolves(contentResponse);
      stubData.responseMock.expects('redirect').once().withArgs(url);
      contentV4Controller
        .downloadContentByIdentifier(stubData.request, stubData.response)
        .then(() => {
          stubData.assetV4ServiceMock.verify();
          stubData.responseMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.contentV4ServiceMock.verify();

          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          stubData.assetV4ServiceMock.restore();
          stubData.responseMock.restore();
          stubData.contentV4ServiceMock.restore();
          stubData.productV4ServiceMock.restore();
        });
    });
    it('should get url when productId and type is present', (done) => {
      const stubData = getStubData();
      stubData.request.hasAllContentAccess = true;
      const categoryType = 'oa';
      const productType = 'books';
      const contentType = 'webpdf';
      const identifierValue = 'some-value';
      const _id = 'some-id';
      const contextId = 'context-id';
      const baseUrl = Config.getPropertyValue('ubxWebsUrl');
      const contentResponse = [
        {
          accessType: 'open-access',
          location: 'https://signed-url-toupload',
          type: 'webpdf'
        }
      ];
      const contentLocation = 'https://signed-url-toupload';
      stubData.request.query = {
        contextId,
        identifierName: 'isbn',
        identifierValue: 'some-value',
        type: contentType
      };
      stubData.request.params = {
        categoryType,
        productType
      };
      const url = `${baseUrl}/${productType}/${categoryType}/${identifierValue}`;
      stubData.assetV4ServiceMock
        .expects('getValidAssetByIdentifierNameValue')
        .once()
        .withArgs(
          stubData.request.query.identifierName,
          stubData.request.query.identifierValue
        )
        .resolves({ _id: null, type: 'book' });
      stubData.responseMock.expects('redirect').once().withArgs(url);
      contentV4Controller
        .downloadContentByIdentifier(stubData.request, stubData.response)
        .then(() => {
          stubData.assetV4ServiceMock.verify();
          stubData.responseMock.verify();

          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          stubData.assetV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it('should get url when productId and type is present and asset returns id', (done) => {
      const stubData = getStubData();
      stubData.request.hasAllContentAccess = false;
      const categoryType = 'oa';
      const productType = 'books';
      const contentType = 'webpdf';
      const identifierValue = 'some-value';
      const _id = 'some-id';
      const contextId = 'context-id';
      const baseUrl = Config.getPropertyValue('ubxWebsUrl');
      const contentResponse = [
        {
          accessType: 'open-access',
          location: 'https://signed-url-toupload',
          type: 'webpdf'
        }
      ];
      const contentLocation = 'https://signed-url-toupload';
      stubData.request.query = {
        contextId,
        identifierName: 'isbn',
        identifierValue: 'some-value',
        type: contentType
      };
      stubData.request.params = {
        categoryType,
        productType
      };
      const url = `/${productType}/${categoryType}/${identifierValue}`;
      stubData.assetV4ServiceMock
        .expects('getValidAssetByIdentifierNameValue')
        .once()
        .withArgs(
          stubData.request.query.identifierName,
          stubData.request.query.identifierValue
        )
        .resolves({ _id: 'some-id', type: 'book' });
      stubData.productV4ServiceMock
        .expects('getRelUrlFromProduct')
        .once()
        .withArgs('some-id', 'book')
        .resolves(`${productType}/${categoryType}/${identifierValue}`);
      const toRender = false;
      const token = '';
      const filenamePrefix = 'some-value';
      stubData.contentV4ServiceMock
        .expects('getOAandBeforePayWallContentByIdAndType')
        .once()
        .withArgs('some-id', stubData.request.query.contextId, {
          cf,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .resolves(contentResponse);

      stubData.responseMock
        .expects('redirect')
        .once()
        .withArgs(contentLocation);
      contentV4Controller
        .downloadContentByIdentifier(stubData.request, stubData.response)
        .then(() => {
          stubData.assetV4ServiceMock.verify();
          stubData.responseMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.contentV4ServiceMock.verify();

          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          stubData.assetV4ServiceMock.restore();
          stubData.responseMock.restore();
          stubData.productV4ServiceMock.restore();
          stubData.contentV4ServiceMock.restore();
        });
    });
  });
});
