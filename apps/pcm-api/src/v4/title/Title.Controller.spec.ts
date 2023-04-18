import { Request, Response } from 'express';
import * as mockExpressRequest from 'mock-express-request';
import * as mockExpressResponse from 'mock-express-response';
import * as sinon from 'sinon';

import { titleController } from './Title.Controller';
import { titleService } from './Title.Service';

describe('TitleController', () => {
  let request: Request;
  let response: Response;
  let responseMock;
  let titleServiceMock;
  let variantsInfo;
  let variantsInfoForISBN10;
  let variantsInfoInvalid;
  let variantsInfoForValidInvalid;
  beforeEach(() => {
    request = new mockExpressRequest();
    response = new mockExpressResponse();
    responseMock = sinon.mock(response);
    titleServiceMock = sinon.mock(titleService);
    variantsInfo = [
      {
        identifier: { name: 'isbn', value: '9781317623144' },
        variants: [
          {
            _id: 'aa3bc35d-4ff0-4ccc-bd83-57ba91a03e56',
            book: {
              edition: '2',
              formats: ['e-Book'],
              publisherImprint: 'Routledge',
              status: 'Available'
            },
            identifiers: {
              dacKey: 'C2013-0-21702-X',
              doi: '10.4324/9781315754116',
              isbn: '9781315754116',
              isbn10: '1315754118'
            },
            title: 'Food Wars',
            type: 'book',
            version: null
          }
        ]
      }
    ];
    variantsInfoInvalid = [
      {
        identifier: { name: 'isbn10', value: 'invalid' },
        variants: []
      }
    ];
    variantsInfoForISBN10 = [...variantsInfo];
    variantsInfoForISBN10[0].identifier = {
      name: 'isbn10',
      value: '1315754118'
    };
    variantsInfoForValidInvalid = [
      ...variantsInfoForISBN10,
      ...variantsInfoInvalid
    ];
  });
  afterEach(() => {
    responseMock.restore();
    titleServiceMock.restore();
  });

  describe('getProductVariantsByIds', () => {
    it('should respond with 500 error when the service throws unexpected error', (done) => {
      request.body = {
        action: 'fetchVariants',
        apiVersion: '4.0.1',
        formats: ['e-Book'],
        identifiers: [
          { name: 'isbn', values: ['9781317623144', '9781317740728'] }
        ],
        includeEditions: true
      };
      titleServiceMock
        .expects('getProductVariantsByIds')
        .once()
        .withArgs(
          request.body.identifiers[0].name,
          request.body.identifiers[0].values,
          {
            formats: request.body.formats,
            includeEditions: request.body.includeEditions
          }
        )
        .rejects(new Error('Unexpected error occured'));
      responseMock.expects('status').once().withArgs(500);
      responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Unexpected error occured',
            transactionId: undefined
          }
        });
      titleController
        .getProductVariantsByIds(request, response)
        .then(() => {
          responseMock.verify();
          titleServiceMock.verify();
          done();
        })
        .catch(done);
    });
    it('should respond with 500 error when the service throws unexpected error', (done) => {
      request.body = {
        action: 'fetchVariants',
        apiVersion: '4.0.1',
        formats: ['e-Book'],
        identifiers: [{ name: 'isbn10', values: ['9781317623', '9781317740'] }],
        includeEditions: true
      };
      titleServiceMock
        .expects('getProductVariantsByIds')
        .once()
        .withArgs(
          request.body.identifiers[0].name,
          request.body.identifiers[0].values,
          {
            formats: request.body.formats,
            includeEditions: request.body.includeEditions
          }
        )
        .rejects(new Error('Unexpected error occured'));
      responseMock.expects('status').once().withArgs(500);
      responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Unexpected error occured',
            transactionId: undefined
          }
        });
      titleController
        .getProductVariantsByIds(request, response)
        .then(() => {
          responseMock.verify();
          titleServiceMock.verify();
          done();
        })
        .catch(done);
    });
    it('should respond with 404 error when variants not found', (done) => {
      request.body = {
        action: 'fetchVariants',
        apiVersion: '4.0.1',
        formats: ['e-Book'],
        identifiers: [
          { name: 'isbn', values: ['9781317623144', '9781317740728'] }
        ],
        includeEditions: true
      };
      titleServiceMock
        .expects('getProductVariantsByIds')
        .once()
        .withArgs(
          request.body.identifiers[0].name,
          request.body.identifiers[0].values,
          {
            formats: request.body.formats,
            includeEditions: request.body.includeEditions
          }
        )
        .resolves([]);
      responseMock.expects('status').once().withArgs(404);
      responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Product variants not found.',
            transactionId: undefined
          }
        });
      titleController
        .getProductVariantsByIds(request, response)
        .then(() => {
          responseMock.verify();
          titleServiceMock.verify();
          done();
        })
        .catch(done);
    });
    it('should respond with 404 error when variants not found', (done) => {
      request.body = {
        action: 'fetchVariants',
        apiVersion: '4.0.1',
        formats: ['e-Book'],
        identifiers: [{ name: 'isbn10', values: ['1317623144'] }],
        includeEditions: true
      };
      titleServiceMock
        .expects('getProductVariantsByIds')
        .once()
        .withArgs(
          request.body.identifiers[0].name,
          request.body.identifiers[0].values,
          {
            formats: request.body.formats,
            includeEditions: request.body.includeEditions
          }
        )
        .resolves([]);
      responseMock.expects('status').once().withArgs(404);
      responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Product variants not found.',
            transactionId: undefined
          }
        });
      titleController
        .getProductVariantsByIds(request, response)
        .then(() => {
          responseMock.verify();
          titleServiceMock.verify();
          done();
        })
        .catch(done);
    });
    it('should respond with 400 error when request does not contain identifiers', (done) => {
      request.body = {
        action: 'fetchVariants',
        apiVersion: '4.0.1',
        formats: ['e-Book'],
        includeEditions: true
      };
      titleServiceMock.expects('getProductVariantsByIds').never();
      responseMock.expects('status').once().withArgs(400);
      responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'invalid/missing identifiers',
            transactionId: undefined
          }
        });
      titleController
        .getProductVariantsByIds(request, response)
        .then(() => {
          responseMock.verify();
          titleServiceMock.verify();
          done();
        })
        .catch(done);
    });
    it('should respond with product variants data when the request is valid', (done) => {
      request.body = {
        action: 'fetchVariants',
        apiVersion: '4.0.1',
        formats: ['e-Book'],
        identifiers: [{ name: 'isbn', values: ['9781317623144'] }],
        includeEditions: true
      };
      titleServiceMock
        .expects('getProductVariantsByIds')
        .once()
        .withArgs(
          request.body.identifiers[0].name,
          request.body.identifiers[0].values,
          {
            formats: request.body.formats,
            includeEditions: request.body.includeEditions
          }
        )
        .resolves(variantsInfo);
      responseMock.expects('status').once().withArgs(200);
      responseMock.expects('json').once().withArgs(variantsInfo);
      titleController
        .getProductVariantsByIds(request, response)
        .then(() => {
          responseMock.verify();
          titleServiceMock.verify();
          done();
        })
        .catch(done);
    });
    it('should respond with product variants data when identifierName is isbn10', (done) => {
      request.body = {
        action: 'fetchVariants',
        apiVersion: '4.0.1',
        formats: ['e-Book'],
        identifiers: [{ name: 'isbn10', values: ['1315754118'] }],
        includeEditions: true
      };
      titleServiceMock
        .expects('getProductVariantsByIds')
        .once()
        .withArgs(
          request.body.identifiers[0].name,
          request.body.identifiers[0].values,
          {
            formats: request.body.formats,
            includeEditions: request.body.includeEditions
          }
        )
        .resolves(variantsInfoForISBN10);
      responseMock.expects('status').once().withArgs(200);
      responseMock.expects('json').once().withArgs(variantsInfoForISBN10);
      titleController
        .getProductVariantsByIds(request, response)
        .then(() => {
          responseMock.verify();
          titleServiceMock.verify();
          done();
        })
        .catch(done);
    });
  });
  it('should respond with product variants data when identifierName is isbn10', (done) => {
    request.body = {
      action: 'fetchVariants',
      apiVersion: '4.0.1',
      formats: ['e-Book'],
      identifiers: [{ name: 'isbn10', values: ['1315754118', 'invalid'] }],
      includeEditions: true
    };
    titleServiceMock
      .expects('getProductVariantsByIds')
      .once()
      .withArgs(
        request.body.identifiers[0].name,
        request.body.identifiers[0].values,
        {
          formats: request.body.formats,
          includeEditions: request.body.includeEditions
        }
      )
      .resolves(variantsInfoForValidInvalid);
    responseMock.expects('status').once().withArgs(200);
    responseMock.expects('json').once().withArgs(variantsInfoForValidInvalid);
    titleController
      .getProductVariantsByIds(request, response)
      .then(() => {
        responseMock.verify();
        titleServiceMock.verify();
        done();
      })
      .catch(done);
  });
});
