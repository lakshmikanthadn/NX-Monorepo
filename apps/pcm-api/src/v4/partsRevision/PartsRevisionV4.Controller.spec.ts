import { Request, Response } from 'express';
import * as mockExpressRequest from 'mock-express-request';
import * as mockExpressResponse from 'mock-express-response';
import * as sinon from 'sinon';

import { AppError } from '../../model/AppError';
import { assetV4Service } from '../assets/AssetV4.Service';
import { commonValidator } from '../validator/requestValidator/CommonValidator';
import { partsrevisionV4Controller } from './PartsRevisionV4.Controller';
import { partsrevisionV4Service } from './PartsRevisionV4.Service';

function getStubData() {
  const request: Request = new mockExpressRequest();
  const response: Response = new mockExpressResponse();
  const responseMock = sinon.mock(response);
  const partsRevisionV4ServiceMock = sinon.mock(partsrevisionV4Service);
  const assetV4ServiceMock = sinon.mock(assetV4Service);
  const commonValidatorMock = sinon.mock(commonValidator);
  return {
    assetV4ServiceMock,
    commonValidatorMock,
    partsRevisionV4ServiceMock,
    request,
    response,
    responseMock
  };
}
describe('PartsRevisionV4.Controller', () => {
  let stubData;
  beforeEach(() => {
    stubData = getStubData();
  });
  describe('getProductPartsRevisionDelta', () => {
    it('should throw 404 error when parts data not found for given collection (product) versions', (done) => {
      stubData.request.params = {
        identifier: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896'
      };
      stubData.request.query.fromDate = '10.12.2022';
      stubData.request.query.toDate = '12.12.2022';
      const productRevisionDataNotFoundErr = new AppError(
        'Parts data not found for the given date range of this product.',
        404
      );
      stubData.partsRevisionV4ServiceMock
        .expects('getProductPartsDelta')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.query.fromDate,
          stubData.request.query.toDate
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
              'Parts data not found for the given date range of this product.',
            transactionId: undefined
          }
        });
      partsrevisionV4Controller
        .getProductPartsRevisionDelta(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.partsRevisionV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.partsRevisionV4ServiceMock.restore();
        });
    });
    it('should return list of delta of parts when valid collectionId and versions passed', (done) => {
      stubData.request.params = {
        identifier: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896'
      };
      stubData.request.query.fromDate = '10.12.2022';
      stubData.request.query.toDate = '12.12.2022';
      stubData.request.query.include = ['partsAdded'];
      const response = {
        data: {
          partsAdded: [
            {
              _id: '78979465-9f9b-4980-9ea1-4288028d040c',
              identifiers: {
                doi: '',
                isbn: ''
              },
              isbn: '',
              title: '',
              type: 'book'
            }
          ]
        },
        metadata: {
          counts: [
            {
              count: 1,
              type: 'partsAdded'
            }
          ],
          transactionId: undefined
        }
      };
      const responseData = {
        partsAdded: [
          {
            _id: '78979465-9f9b-4980-9ea1-4288028d040c',
            identifiers: {
              doi: '',
              isbn: ''
            },
            isbn: '',
            title: '',
            type: 'book'
          }
        ]
      };
      stubData.partsRevisionV4ServiceMock
        .expects('getProductPartsDelta')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.query.fromDate,
          stubData.request.query.toDate
        )
        .resolves(responseData);
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(response);
      partsrevisionV4Controller
        .getProductPartsRevisionDelta(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.partsRevisionV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.partsRevisionV4ServiceMock.restore();
        });
    });
  });
});
