import { RedisConnection } from '@tandfgroup/privilege-authorization-manager/lib/src/cache';
import { expect } from 'chai';
import { Request, Response } from 'express';
import { Cluster } from 'ioredis';
import jwt = require('jsonwebtoken');
import * as mockExpressRequest from 'mock-express-request';
import * as mockExpressResponse from 'mock-express-response';
import * as sinon from 'sinon';
import * as _ from 'lodash';

import { collectionV4Controller } from './CollectionV4.Controller';
import { collectionValidator } from './CollectionValidator';
import { schemaValidator } from '../validator/SchemaValidator';
import { collectionV4Service } from './CollectionV4.Service';
import { assetV4Service } from '../assets/AssetV4.Service';
import { Config } from '../../config/config';

const iamEnv: string = Config.getPropertyValue('iamEnv');
const patchRequest = {
  apiVersion: '4.0.1',
  data: [
    {
      op: 'replace',
      path: 'identifiers.sku',
      value: '001-555-5678'
    }
  ]
};

const createRequest = {
  action: 'save',
  apiVersion: '4.0.1',
  product: {
    _id: '83177cee-ca4a-4414-9454-69db77f201ed',
    _schemaVersion: '4.0.1',
    _source: {
      source: 'SALESFORCE',
      type: 'product'
    },
    associatedMedia: [],
    categories: [
      {
        code: '',
        name: 'collection-type',
        type: 'bespoke'
      },
      {
        code: '',
        name: 'collection-update-type',
        type: 'static'
      }
    ],
    classifications: [],
    collection: {
      abstracts: [
        {
          type: 'text',
          value: 'static'
        }
      ],
      autoRollover: false,
      backList: false,
      channels: [
        {
          name: 'GOBI',
          type: 'sales'
        }
      ],
      customers: [
        {
          name: 'Institution',
          type: 'customer'
        }
      ],
      description: '',
      firstPublishedYear: 2022,
      licenses: [
        {
          name: 'Perpetual',
          type: 'license'
        }
      ],
      plannedPublicationDate: '2022-05-25T00:00:00.000Z',
      publisherImprint: '',
      status: 'planned',
      subjectAreaCode: 'MIXED',
      subtitle: '',
      taxType: 'Q',
      validFrom: '2022-05-25T00:00:00.000Z',
      validTo: '2022-06-01T00:00:00.000Z'
    },
    identifiers: {
      collectionId: 'BD.EBOOK',
      doi: '',
      sku: '01t1q000007EvRbAAK'
    },
    partsAdded: [
      {
        identifier: 'ffe1f803-acae-469d-a9dd-205ca2e530ff',
        isFree: false,
        position: 1,
        type: 'book'
      },
      {
        identifier: 'ffdd0386-193d-4d87-9f25-bb5e5f0a5b08',
        isFree: false,
        position: 2,
        type: 'book'
      }
    ],
    permissions: [],
    prices: [
      {
        currency: 'GBP',
        discountPercentage: 0.0,
        listPrice: 2344.99,
        price: 2344.99,
        priceType: 'BYO Library Price',
        priceTypeCode: 'BYO',
        validFrom: '2022-05-25T08:00:35.000Z'
      },
      {
        currency: 'USD',
        discountPercentage: 0.0,
        listPrice: 3110.95,
        price: 3110.95,
        priceType: 'BYO Library Price',
        priceTypeCode: 'BYO',
        validFrom: '2022-05-25T08:00:35.000Z'
      }
    ],
    rulesList: [],
    title: 'Test static bespoke 1',
    type: 'collection'
  }
};

const date = Math.round(new Date().getTime());
const jwtCode = jwt.sign(
  { exp: date + 36000, iat: date, r: ['PKORA'] },
  'shhhhh'
);

const collectionSchemaId =
  'OpenApiSchema#/definitions/CollectionProductRequest';

function getStubData() {
  const request: Request = new mockExpressRequest();
  const response: Response = new mockExpressResponse();
  const responseMock = sinon.mock(response);
  const collectionValidatorMock = sinon.mock(collectionValidator);
  const schemaValidatorMock = sinon.mock(schemaValidator);
  const collectionV4ServiceMock = sinon.mock(collectionV4Service);
  const assetV4ServiceMock = sinon.mock(assetV4Service);
  return {
    assetV4ServiceMock,
    collectionV4ServiceMock,
    collectionValidatorMock,
    request,
    response,
    responseMock,
    schemaValidatorMock
  };
}

const roleMappingData =
  '[{"role_code":"PKORA","role_name":"PCM-KORTEXT-ADMIN","role_precedence":1}]';
describe('CollectionV4Controller', () => {
  describe('partialUpdateCollectionProduct', () => {
    let hmGetStub: sinon.SinonStub;
    let redisStub: sinon.SinonStubbedInstance<Cluster>;
    beforeEach(() => {
      redisStub = sinon.createStubInstance(Cluster);
      hmGetStub = sinon.stub();
      (redisStub as any).hmget = hmGetStub;
      hmGetStub
        .withArgs(iamEnv, 'api:collection-product:update')
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
      stubData.request.body = { data: { ...patchRequest } };
      const updateCollectionProductStub = sinon.stub(
        collectionV4Controller,
        '_partialUpdateCollectionProduct'
      );
      updateCollectionProductStub.resolves('success');
      collectionV4Controller.partialUpdateCollectionProduct(
        stubData.request,
        stubData.response
      );
      // There is an issue with IAM Decorator, so adding setTimeout.
      setTimeout(() => {
        try {
          expect(updateCollectionProductStub.calledOnce).to.equal(true);
          expect(hmGetStub.calledOnce).to.equal(true);
          done();
        } catch (e) {
          done(e);
        } finally {
          updateCollectionProductStub.restore();
        }
      }, 1000);
    });
  });
  describe('createCollectionProduct', () => {
    let hmGetStub: sinon.SinonStub;
    let redisStub: sinon.SinonStubbedInstance<Cluster>;
    beforeEach(() => {
      redisStub = sinon.createStubInstance(Cluster);
      hmGetStub = sinon.stub();
      (redisStub as any).hmget = hmGetStub;
      hmGetStub
        .withArgs(iamEnv, 'api:collection-product:create')
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
      stubData.request.body = { data: { ...createRequest } };
      const createCollectionProductStub = sinon.stub(
        collectionV4Controller,
        '_createCollectionProduct'
      );
      createCollectionProductStub.resolves('success');
      collectionV4Controller.createCollectionProduct(
        stubData.request,
        stubData.response
      );
      // There is an issue with IAM Decorator, so adding setTimeout.
      setTimeout(() => {
        try {
          expect(createCollectionProductStub.calledOnce).to.equal(true);
          expect(hmGetStub.calledOnce).to.equal(true);
          done();
        } catch (e) {
          done(e);
        } finally {
          createCollectionProductStub.restore();
        }
      }, 1000);
    });
  });
  describe('_createCollectionProduct', () => {
    it('should return 409 error response when product with id already exists', (done) => {
      const stubData = getStubData();
      stubData.request.body = { ...createRequest };
      const reqBody = _.cloneDeep(stubData.request.body);
      const productData = reqBody.product;
      const productDataCopy = _.cloneDeep(productData);
      const productType = 'collection';
      const responseData = {
        data: null,
        metadata: {
          _id: '83177cee-ca4a-4414-9454-69db77f201ed',
          error: '',
          message: `A product already exists with title Test static bespoke 1`,
          messages: [],
          transactionDate: '2022-05-31T07:46:35.064Z',
          transactionId: undefined,
          type: 'collection'
        }
      };
      const action = 'create';
      stubData.collectionValidatorMock
        .expects('validateCollection')
        .once()
        .withArgs(productDataCopy, action)
        .resolves(true);
      stubData.schemaValidatorMock
        .expects('validate')
        .once()
        .withArgs(collectionSchemaId, productDataCopy)
        .resolves(true);
      stubData.assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(productDataCopy._id, ['_id'])
        .resolves(null);
      stubData.collectionV4ServiceMock
        .expects('getProductByTitle')
        .once()
        .withArgs(productDataCopy.title, productType)
        .resolves({ _id: '83177cee-ca4a-4414-9454-69db77f201ed' });
      stubData.collectionV4ServiceMock.expects('uploadProduct').never();
      const isoDateMock = sinon
        .stub(Date.prototype, 'toISOString')
        .returns('2022-05-31T07:46:35.064Z');
      stubData.responseMock.expects('status').once().withArgs(409);
      stubData.responseMock.expects('json').once().withArgs(responseData);
      collectionV4Controller
        ._createCollectionProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.collectionV4ServiceMock.verify();
          stubData.collectionValidatorMock.verify();
          stubData.schemaValidatorMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.collectionV4ServiceMock.restore();
          stubData.collectionValidatorMock.restore();
          stubData.schemaValidatorMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.responseMock.restore();
          isoDateMock.restore();
        });
    });
    it('should return valid response when request body is for valid bespoke collection', (done) => {
      const stubData = getStubData();
      stubData.request.body = { ...createRequest };
      const reqBody = _.cloneDeep(stubData.request.body);
      const productData = reqBody.product;
      const productDataCopy = _.cloneDeep(productData);
      const productType = 'collection';
      const responseData = {
        _id: '83177cee-ca4a-4414-9454-69db77f201ed',
        messages: [
          {
            code: 202,
            description:
              'Product data uploaded successfully, it will be processed and acknowledged soon.'
          }
        ],
        status: 'success'
      };
      const action = 'create';
      stubData.collectionValidatorMock
        .expects('validateCollection')
        .once()
        .withArgs(productDataCopy, action)
        .resolves(true);
      stubData.schemaValidatorMock
        .expects('validate')
        .once()
        .withArgs(collectionSchemaId, productDataCopy)
        .resolves(true);
      stubData.assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(productDataCopy._id, ['_id'])
        .resolves(null);
      stubData.collectionV4ServiceMock
        .expects('getProductByTitle')
        .once()
        .withArgs(productDataCopy.title, productType)
        .resolves(null);
      stubData.collectionV4ServiceMock
        .expects('uploadProduct')
        .once()
        .withArgs(productData, action)
        .resolves(productDataCopy);
      stubData.responseMock.expects('status').once().withArgs(202);
      stubData.responseMock.expects('json').once().withArgs(responseData);
      collectionV4Controller
        ._createCollectionProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.collectionV4ServiceMock.verify();
          stubData.collectionValidatorMock.verify();
          stubData.schemaValidatorMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.collectionV4ServiceMock.restore();
          stubData.collectionValidatorMock.restore();
          stubData.schemaValidatorMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it('should return valid response when request body is for valid non-bespoke collection', (done) => {
      const stubData = getStubData();
      const collectionCreateRequest = { ...createRequest };
      collectionCreateRequest.product.categories = [
        {
          code: '',
          name: 'collection-type',
          type: 'sdgo'
        },
        {
          code: '',
          name: 'collection-update-type',
          type: 'static'
        }
      ];
      collectionCreateRequest.product.identifiers = {
        collectionId: 'SDG-ALLGOALS',
        doi: '',
        sku: '01t7R000007VZsxQAG'
      };
      stubData.request.body = { ...collectionCreateRequest };
      const reqBody = _.cloneDeep(stubData.request.body);
      const productData = reqBody.product;
      const productDataCopy = _.cloneDeep(productData);
      const productType = 'collection';
      const responseData = {
        _id: '83177cee-ca4a-4414-9454-69db77f201ed',
        messages: [
          {
            code: 202,
            description:
              'Product data uploaded successfully, it will be processed and acknowledged soon.'
          }
        ],
        status: 'success'
      };
      const action = 'create';
      stubData.collectionValidatorMock
        .expects('validateCollection')
        .once()
        .withArgs(productDataCopy, action)
        .resolves(true);
      stubData.schemaValidatorMock
        .expects('validate')
        .once()
        .withArgs(collectionSchemaId, productDataCopy)
        .resolves(true);
      stubData.assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(productDataCopy._id, ['_id'])
        .resolves(null);
      stubData.collectionV4ServiceMock
        .expects('getProductByTitle')
        .once()
        .withArgs(productDataCopy.title, productType)
        .resolves(null);
      stubData.assetV4ServiceMock
        .expects('getProductByIdentifier')
        .once()
        .withArgs('collectionId', productDataCopy.identifiers.collectionId)
        .resolves(null);
      stubData.collectionV4ServiceMock
        .expects('uploadProduct')
        .once()
        .withArgs(productData, action)
        .resolves(productDataCopy);
      stubData.responseMock.expects('status').once().withArgs(202);
      stubData.responseMock.expects('json').once().withArgs(responseData);
      collectionV4Controller
        ._createCollectionProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.collectionV4ServiceMock.verify();
          stubData.collectionValidatorMock.verify();
          stubData.schemaValidatorMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.collectionV4ServiceMock.restore();
          stubData.collectionValidatorMock.restore();
          stubData.schemaValidatorMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
  });
});
