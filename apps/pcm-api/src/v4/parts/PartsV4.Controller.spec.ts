import { Request, Response } from 'express';
import * as mockExpressRequest from 'mock-express-request';
import * as mockExpressResponse from 'mock-express-response';
import * as sinon from 'sinon';

import { AppError } from '../../model/AppError';
import { assetV4Service } from '../assets/AssetV4.Service';
import { commonValidator } from '../validator/requestValidator/CommonValidator';
import { partsV4Controller } from './PartsV4.Controller';
import { partsV4Service } from './PartsV4.Service';

function getStubData() {
  const request: Request = new mockExpressRequest();
  const response: Response = new mockExpressResponse();
  const responseMock = sinon.mock(response);
  const partsV4ServiceMock = sinon.mock(partsV4Service);
  const assetV4ServiceMock = sinon.mock(assetV4Service);
  const commonValidatorMock = sinon.mock(commonValidator);
  return {
    assetV4ServiceMock,
    commonValidatorMock,
    partsV4ServiceMock,
    request,
    response,
    responseMock
  };
}
describe('PartsV4.Controller', () => {
  let stubData;
  beforeEach(() => {
    stubData = getStubData();
  });
  describe('getProductHasParts', () => {
    it('should throw 500 error when the Service layer throws error', (done) => {
      stubData.request.params = {
        identifier: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896'
      };
      stubData.request.query.responseGroup = 'small';
      stubData.request.query.productIdentifierName = '_id';
      stubData.request.query.limit = 1;
      stubData.request.query.offset = 0;
      const internalError = new Error('Internal error');

      stubData.partsV4ServiceMock
        .expects('getProductHasParts')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.query.productIdentifierName,
          stubData.request.query.offset,
          stubData.request.query.limit,
          false,
          undefined,
          undefined,
          stubData.request.query.responseGroup
        )
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
      partsV4Controller
        .getProductHasParts(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.partsV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.partsV4ServiceMock.restore();
        });
    });
    it('should throw 404 error when Product (asset) not found.', (done) => {
      stubData.request.params = {
        identifier: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896'
      };
      stubData.request.query.productIdentifierName = '_id';
      const productNotFoundErr = new AppError(
        'Product (asset) not found.',
        404
      );
      stubData.partsV4ServiceMock
        .expects('getProductHasParts')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.query.productIdentifierName,
          0,
          30,
          false,
          undefined,
          undefined
        )
        .rejects(productNotFoundErr);
      stubData.responseMock.expects('status').once().withArgs(404);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Product (asset) not found.',
            transactionId: undefined
          }
        });
      partsV4Controller
        .getProductHasParts(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.partsV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.partsV4ServiceMock.restore();
        });
    });
    it('should throw 404 error when product parts not found', (done) => {
      stubData.request.params = {
        identifier: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896'
      };
      stubData.request.query.includeCounts = 'true';
      stubData.request.query.responseGroup = 'small';
      stubData.request.query.productIdentifierName = '_id';
      stubData.request.query.limit = 1;
      stubData.request.query.offset = 0;

      const productPartsNotFoundErr = new AppError(
        'Product parts not found.',
        404
      );
      stubData.partsV4ServiceMock
        .expects('getProductHasParts')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.query.productIdentifierName,
          stubData.request.query.offset,
          stubData.request.query.limit,
          true,
          undefined,
          undefined,
          stubData.request.query.responseGroup
        )
        .rejects(productPartsNotFoundErr);
      stubData.responseMock.expects('status').once().withArgs(404);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Product parts not found.',
            transactionId: undefined
          }
        });
      partsV4Controller
        .getProductHasParts(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.partsV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.partsV4ServiceMock.restore();
        });
    });
    it('should throw 400 Offset value is more than the total parts.', (done) => {
      stubData.request.params = {
        identifier: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896'
      };
      stubData.request.query.responseGroup = 'medium';
      stubData.request.query.productIdentifierName = '_id';
      stubData.request.query.limit = 10;
      stubData.request.query.offset = 10;

      const OffsetError = new AppError(
        'Offset value is more than the total parts. totalCount: 5',
        400
      );
      stubData.partsV4ServiceMock
        .expects('getProductHasParts')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.query.productIdentifierName,
          stubData.request.query.offset,
          stubData.request.query.limit,
          false,
          undefined,
          undefined,
          stubData.request.query.responseGroup
        )
        .rejects(OffsetError);
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Offset value is more than the total parts. totalCount: 5',
            transactionId: undefined
          }
        });
      partsV4Controller
        .getProductHasParts(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.partsV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.partsV4ServiceMock.restore();
        });
    });
    it('should return list of parts when valid productId and offset & limit passed', (done) => {
      stubData.request.params = {
        identifier: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896'
      };
      stubData.request.query.responseGroup = 'small';
      stubData.request.query.productIdentifierName = '_id';
      stubData.request.query.limit = 1;
      stubData.request.query.offset = 0;
      const response = [
        {
          _id: 'some-partId',
          position: 0,
          type: 'chapter'
        }
      ];

      stubData.partsV4ServiceMock
        .expects('getProductHasParts')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.query.productIdentifierName,
          stubData.request.query.offset,
          stubData.request.query.limit,
          false,
          undefined,
          undefined,
          stubData.request.query.responseGroup
        )
        .resolves(response);
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(response);
      partsV4Controller
        .getProductHasParts(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.partsV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.partsV4ServiceMock.restore();
        });
    });
    it('should return list of parts with counts info when valid productId and offset & limit passed with apiVersion=4.0.2', (done) => {
      stubData.request.params = {
        identifier: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896'
      };
      stubData.request.query.responseGroup = 'small';
      stubData.request.query.apiVersion = '4.0.2';
      stubData.request.query.limit = 1;
      stubData.request.query.offset = 0;
      const response = {
        data: [
          {
            _id: 'some-partId',
            position: 0,
            type: 'chapter'
          }
        ],
        metadata: {
          counts: [
            {
              count: 1,
              type: 'total'
            },
            {
              count: 1,
              formatsCount: [],
              type: 'chapter'
            }
          ]
        }
      };

      stubData.partsV4ServiceMock
        .expects('getProductHasParts')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          '_id',
          stubData.request.query.offset,
          stubData.request.query.limit,
          false,
          undefined,
          undefined,
          stubData.request.query.responseGroup
        )
        .resolves(response);
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(response);
      partsV4Controller
        .getProductHasParts(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.partsV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.partsV4ServiceMock.restore();
        });
    });
    it.skip(`should return list of parts when valid productId, offset, limit & availabilityName
      passed`, (done) => {
      stubData.request.params = {
        identifier: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896'
      };
      stubData.request.query.responseGroup = 'small';

      stubData.request.query.limit = 1;
      stubData.request.query.offset = 0;
      stubData.request.query.availabilityName = 'UBX';
      const response = [
        {
          _id: 'some-partId',
          position: 0,
          type: 'chapter'
        }
      ];

      stubData.partsV4ServiceMock
        .expects('getProductHasParts')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.query.offset,
          stubData.request.query.limit,
          stubData.request.query.availabilityName,
          undefined,
          undefined,
          undefined,
          stubData.request.query.responseGroup
        )
        .resolves(response);
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(response);
      partsV4Controller
        .getProductHasParts(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.partsV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.partsV4ServiceMock.restore();
        });
    });
    it.skip(`should return list of parts when valid productId, offset, limit, availabilityName
      and availabilityStatus passed`, (done) => {
      stubData.request.params = {
        identifier: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896'
      };
      stubData.request.query.responseGroup = 'small';

      stubData.request.query.limit = 1;
      stubData.request.query.offset = 0;
      stubData.request.query.availabilityName = 'UBX';
      stubData.request.query.availabilityStatus = 'SELLABLE,CAN_HOST';
      const response = [
        {
          _id: 'some-partId',
          position: 0,
          type: 'chapter'
        }
      ];

      stubData.partsV4ServiceMock
        .expects('getProductHasParts')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.query.offset,
          stubData.request.query.limit,
          stubData.request.query.availabilityName,
          stubData.request.query.availabilityStatus.split(','),
          undefined,
          undefined,
          stubData.request.query.responseGroup
        )
        .resolves(response);
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(response);
      partsV4Controller
        .getProductHasParts(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.partsV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.partsV4ServiceMock.restore();
        });
    });
    it.skip('should throw 400 when availabilityStatus is without availabilityName', (done) => {
      stubData.request.params = {
        identifier: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896'
      };
      stubData.request.query.responseGroup = 'large';

      stubData.request.query.limit = 10;
      stubData.request.query.offset = 10;
      stubData.request.query.availabilityStatus = 'SELLABLE,CAN_HOST';

      stubData.partsV4ServiceMock.expects('getProductHasParts').never();
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'To use availabilityStatus, availabilityName is mandatory'
          }
        });
      partsV4Controller
        .getProductHasParts(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.partsV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.partsV4ServiceMock.restore();
        });
    });
  });
  describe('getProductHasPart', () => {
    it('should throw 500 error when the Service layer throws error', (done) => {
      stubData.request.params = {
        identifier: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896',
        partId: 'some-id'
      };
      stubData.request.query.responseGroup = 'small';
      const internalError = new Error('Internal error');

      stubData.partsV4ServiceMock
        .expects('getProductHasPart')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.params.partId,
          stubData.request.query.responseGroup
        )
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
      partsV4Controller
        .getProductHasPart(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.partsV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.partsV4ServiceMock.restore();
        });
    });
    it('should throw 404 error when Product (asset) not found.', (done) => {
      stubData.request.params = {
        identifier: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896',
        partId: 'some-id'
      };

      const productNotFoundErr = new AppError(
        'Product (asset) not found.',
        404
      );
      stubData.partsV4ServiceMock
        .expects('getProductHasPart')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.params.partId,
          stubData.request.query.responseGroup
        )
        .rejects(productNotFoundErr);
      stubData.responseMock.expects('status').once().withArgs(404);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Product (asset) not found.',
            transactionId: undefined
          }
        });
      partsV4Controller
        .getProductHasPart(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.partsV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.partsV4ServiceMock.restore();
        });
    });
    it('should throw 404 error when product parts not found', (done) => {
      stubData.request.params = {
        identifier: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896',
        partId: 'some-id'
      };
      stubData.request.query.responseGroup = 'small';

      const productPartsNotFoundErr = new AppError(
        'Product parts not found.',
        404
      );
      stubData.partsV4ServiceMock
        .expects('getProductHasPart')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.params.partId,
          stubData.request.query.responseGroup
        )
        .rejects(productPartsNotFoundErr);
      stubData.responseMock.expects('status').once().withArgs(404);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Product parts not found.',
            transactionId: undefined
          }
        });
      partsV4Controller
        .getProductHasPart(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.partsV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.partsV4ServiceMock.restore();
        });
    });
    it('should return list of parts when valid productId and partId passed', (done) => {
      stubData.request.params = {
        identifier: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896',
        partId: 'some-id'
      };
      stubData.request.query.responseGroup = 'small';
      const response = {
        _id: 'some-partId',
        isFree: false,
        level: null,
        pageEnd: null,
        pageStart: null,
        parentId: null,
        position: 0,
        title: null,
        type: 'chapter',
        version: null
      };

      stubData.partsV4ServiceMock
        .expects('getProductHasPart')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.params.partId,
          stubData.request.query.responseGroup
        )
        .resolves(response);
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(response);
      partsV4Controller
        .getProductHasPart(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.partsV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.partsV4ServiceMock.restore();
        });
    });
  });
  describe('getProductPartsDelta', () => {
    it('should throw 500 error when the Service layer throws error', (done) => {
      stubData.request.params = {
        identifier: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896'
      };
      stubData.request.query.responseGroup = 'small';
      stubData.request.query.v1 = '1.0.0';
      stubData.request.query.v2 = '1.0.1';
      const internalError = new Error('Internal error');

      stubData.partsV4ServiceMock
        .expects('getProductPartsDelta')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.query.v1,
          stubData.request.query.v2,
          undefined,
          stubData.request.query.responseGroup
        )
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
      partsV4Controller
        .getProductPartsDelta(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.partsV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.partsV4ServiceMock.restore();
        });
    });
    it('should throw 404 error when collection (product) not found.', (done) => {
      stubData.request.params = {
        identifier: 'some-invalid-identifier'
      };
      stubData.request.query.responseGroup = 'small';
      stubData.request.query.v1 = '1.0.0';
      stubData.request.query.v2 = '1.0.1';
      const productNotFoundErr = new AppError(
        'No such collection (product) found',
        404
      );
      stubData.partsV4ServiceMock
        .expects('getProductPartsDelta')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.query.v1,
          stubData.request.query.v2,
          undefined,
          stubData.request.query.responseGroup
        )
        .rejects(productNotFoundErr);
      stubData.responseMock.expects('status').once().withArgs(404);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'No such collection (product) found',
            transactionId: undefined
          }
        });
      partsV4Controller
        .getProductPartsDelta(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.partsV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.partsV4ServiceMock.restore();
        });
    });
    it('should throw 404 error when data not found for given collection (product) versions', (done) => {
      stubData.request.params = {
        identifier: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896'
      };
      stubData.request.query.responseGroup = 'small';
      stubData.request.query.v1 = '1.0.0';
      stubData.request.query.v2 = 'some-invalid-version';
      const productRevisionDataNotFoundErr = new AppError(
        'Data for one or both versions of this product not found.',
        404
      );
      stubData.partsV4ServiceMock
        .expects('getProductPartsDelta')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.query.v1,
          stubData.request.query.v2,
          undefined,
          stubData.request.query.responseGroup
        )
        .rejects(productRevisionDataNotFoundErr);
      stubData.responseMock.expects('status').once().withArgs(404);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Data for one or both versions of this product not found.',
            transactionId: undefined
          }
        });
      partsV4Controller
        .getProductPartsDelta(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.partsV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.partsV4ServiceMock.restore();
        });
    });
    it('should throw 404 error when parts data not found for given collection (product) versions', (done) => {
      stubData.request.params = {
        identifier: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896'
      };
      stubData.request.query.responseGroup = 'small';
      stubData.request.query.v1 = '1.0.0';
      stubData.request.query.v2 = '1.0.1';
      const productRevisionDataNotFoundErr = new AppError(
        'Parts data not found for one or both versions of this product.',
        404
      );
      stubData.partsV4ServiceMock
        .expects('getProductPartsDelta')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.query.v1,
          stubData.request.query.v2,
          undefined,
          stubData.request.query.responseGroup
        )
        .rejects(productRevisionDataNotFoundErr);
      stubData.responseMock.expects('status').once().withArgs(404);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message:
              'Parts data not found for one or both versions of this product.',
            transactionId: undefined
          }
        });
      partsV4Controller
        .getProductPartsDelta(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.partsV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.partsV4ServiceMock.restore();
        });
    });
    it('should return list of delta of parts when valid collectionId and versions passed', (done) => {
      stubData.request.params = {
        identifier: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896'
      };
      stubData.request.query.responseGroup = 'small';
      stubData.request.query.v1 = '1.0.0';
      stubData.request.query.v2 = '1.0.1';
      const response = {
        data: {
          partsAdded: [
            {
              _id: 'some-partId',
              isFree: false,
              position: 0,
              type: 'book'
            }
          ],
          partsRemoved: []
        },
        metadata: {
          transactionId: undefined
        }
      };
      stubData.partsV4ServiceMock
        .expects('getProductPartsDelta')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.query.v1,
          stubData.request.query.v2,
          undefined,
          stubData.request.query.responseGroup
        )
        .resolves(response);
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(response);
      partsV4Controller
        .getProductPartsDelta(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.partsV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.partsV4ServiceMock.restore();
        });
    });
  });
});
