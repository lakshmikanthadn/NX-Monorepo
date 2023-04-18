import { assert, expect } from 'chai';
import { Request, Response } from 'express';
import * as _ from 'lodash';
import * as mockExpressRequest from 'mock-express-request';
import * as mockExpressResponse from 'mock-express-response';
import * as sinon from 'sinon';

import { decorators } from '../utils/Decorators';

import { AppError } from '../../model/AppError';
import { assetV4Service } from '../assets/AssetV4.Service';
import { collectionValidator } from '../collection/CollectionValidator';
import { journalController } from '../journal/Journal.Controller';
import { publishingServiceController } from '../publishingService/PublishingService.Controller';
import { searchV4Controller } from '../search/SearchV4Controller';
import { searchV4Service } from '../search/SearchV4Service';
import { booksTestData } from '../test/data/BookV4';
import { preArticleTestData } from '../test/data/PreArticleV4';
import { manuscriptWorkflowTestData } from '../test/data/ManuscriptWorkflowV4';
import { titleController } from '../title/Title.Controller';
import { commonValidator } from '../validator/requestValidator/CommonValidator';
import { oaUpdateAPIValidator } from '../validator/requestValidator/OAUpdateAPIValidator';
import { searchDownloadValidator } from '../validator/requestValidator/SearchDownloadApiValidator';
import { validateAPIValidator } from '../validator/requestValidator/ValidateAPIValidator';
import { schemaValidator } from '../validator/SchemaValidator';
import { prechapterV4Controller } from '../preChapter/PreChapterV4.Controller';
import {
  ProductV4Controller,
  productV4Controller as pV4Controller
} from './ProductV4.Controller';
import { productV4Service } from './ProductV4.Service';

function getStubData() {
  const request: Request = new mockExpressRequest();
  const response: Response = new mockExpressResponse();
  const responseMock = sinon.mock(response);
  const productV4ServiceMock = sinon.mock(productV4Service);
  const assetV4ServiceMock = sinon.mock(assetV4Service);
  const searchV4ServiceMock = sinon.mock(searchV4Service);
  const validateAPIValidatorMock = sinon.mock(validateAPIValidator);
  const schemaValidatorMock = sinon.mock(schemaValidator);
  const collectionValidatorMock = sinon.mock(collectionValidator);
  const searchDownloadValidatorMock = sinon.mock(searchDownloadValidator);
  const commonValidatorMock = sinon.mock(commonValidator);
  const oaUpdateAPIValidatorMock = sinon.mock(oaUpdateAPIValidator);
  const prechapterV4ControllerMock = sinon.mock(prechapterV4Controller);
  const searchQueryParserResult = [
    {
      attributes: ['title', 'identifiers.isbn', 'identifiers.doi'],
      rules: {
        'identifiers.isbn': {
          $in: ['some-isbn']
        }
      },
      type: 'book'
    }
  ];
  const searchServiceResponse = {
    counts: [
      {
        count: 1,
        type: 'book'
      },
      {
        count: 1,
        type: 'Total'
      }
    ],
    products: [
      {
        availability: [
          {
            errors: ['NO_CONTENT'],
            name: 'some-channel',
            status: []
          }
        ],
        product: {
          _id: 'some-uuid',
          identifiers: {
            isbn: 'some-isbn'
          },
          title: 'some-title'
        }
      }
    ]
  };
  request.body = {
    action: 'validate',
    availability: {
      name: 'some-channel'
    },
    hasCounts: true,
    rulesList: [
      {
        attributes: ['title', 'identifiers.isbn'],
        rules: [
          {
            position: 1,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 4,
            rule: {
              attribute: 'identifiers.isbn',
              relationship: 'IN',
              values: ['some-isbn']
            },
            type: 'criteria'
          },
          {
            position: 5,
            rule: {
              value: 'END'
            },
            type: 'separator'
          }
        ],
        type: 'book'
      }
    ]
  };
  return {
    assetV4ServiceMock,
    collectionValidatorMock,
    commonValidatorMock,
    oaUpdateAPIValidatorMock,
    prechapterV4ControllerMock,
    productV4ServiceMock,
    request,
    response,
    responseMock,
    schemaValidatorMock,
    searchDownloadValidatorMock,
    searchQueryParserResult,
    searchServiceResponse,
    searchV4ServiceMock,
    validateAPIValidatorMock
  };
}
const resJson = {
  data: null,
  metadata: {
    _id: '',
    error: '',
    message: '',
    messages: [],
    transactionDate: '2021-01-18T09:01:15.627Z',
    transactionId: undefined,
    type: ''
  }
};
describe('ProductV4.Controller', () => {
  let stubData;
  let productV4Controller;
  let hasPermissionStub;
  beforeEach(() => {
    stubData = getStubData();
    hasPermissionStub = sinon
      .stub(decorators, 'hasPermission')
      .callsFake(() => {
        console.log('**************************************');
        return (target, propertyName, descriptor: any) => {
          descriptor.value();
        };
      });
    productV4Controller = new ProductV4Controller();
  });
  afterEach(() => {
    hasPermissionStub.restore();
  });
  describe('getProduct', () => {
    it('should transform and return a product when id valid product id', (done) => {
      stubData.request.params = {
        identifier: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896'
      };
      stubData.request.query.responseGroup = 'large';
      stubData.request.query.productVersion = '1.0.0';

      const book = booksTestData.find(
        (bookData) =>
          bookData._id === stubData.request.params.identifier &&
          stubData.request.query.productVersion === bookData.version
      );
      const expectedBookData = _.cloneDeep(book);
      expectedBookData.book.firstPublishedYear =
        expectedBookData.book.firstPublishedYear.toString() as any;
      expectedBookData.modifiedDate = expectedBookData._modifiedDate;
      delete expectedBookData.book.firstPublishedYearNumber;
      delete expectedBookData._schemaVersion;
      delete expectedBookData._sources;
      delete expectedBookData._modifiedDate;
      delete expectedBookData._createdDate;
      delete expectedBookData._isSellable;
      stubData.productV4ServiceMock
        .expects('getProductById')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.query.responseGroup,
          stubData.request.query.productVersion
        )
        .resolves({ product: _.cloneDeep(book) });
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({ product: expectedBookData });
      productV4Controller
        .getProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.productV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.productV4ServiceMock.restore();
        });
    });
    it('should return product when id is a valid product id', (done) => {
      stubData.request.params = {
        identifier: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896'
      };
      stubData.request.query.responseGroup = 'large';
      stubData.request.query.productVersion = '1.0.0';

      const book = booksTestData.find(
        (bookData) =>
          bookData._id === stubData.request.params.identifier &&
          stubData.request.query.productVersion === bookData.version
      );
      stubData.productV4ServiceMock
        .expects('getProductById')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.query.responseGroup,
          stubData.request.query.productVersion
        )
        .resolves({ product: book });
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs({ product: book });
      productV4Controller
        .getProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.productV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.productV4ServiceMock.restore();
        });
    });
    it('should throw 404 error when there is no product matching the id', (done) => {
      stubData.request.params = {
        identifier: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896'
      };
      stubData.request.query.responseGroup = 'large';
      stubData.request.query.productVersion = '1.0.1';

      stubData.productV4ServiceMock
        .expects('getProductById')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.query.responseGroup,
          stubData.request.query.productVersion
        )
        .resolves(null);
      stubData.responseMock.expects('status').once().withArgs(404);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Product not found',
            transactionId: undefined
          }
        });
      productV4Controller
        .getProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.productV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.productV4ServiceMock.restore();
        });
    });

    it('should throw 500 error when the Service layer throws error', (done) => {
      stubData.request.params = {
        identifier: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896'
      };
      stubData.request.query.responseGroup = 'large';
      stubData.request.query.productVersion = '1.0.1';

      const internalError = new Error('Internal error');

      stubData.productV4ServiceMock
        .expects('getProductById')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.query.responseGroup,
          stubData.request.query.productVersion
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
      productV4Controller
        .getProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.productV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.productV4ServiceMock.restore();
        });
    });
  });
  describe('handleCreateProduct', () => {
    it.skip('should return create a new creativeWork when request body is valid product', (done) => {
      const uuid = '216fd5c8-906c-4c5a-ad71-3d391227e17f';
      stubData.request.body = {
        action: 'save',
        product: {
          identifiers: {
            doi: 'abc'
          },
          title: 'Test creative work',
          type: 'creativeWork'
        }
      };
      const fakeValue = {
        _id: uuid,
        identifiers: {
          doi: 'abc'
        },
        title: 'Test creative work',
        type: 'creativeWork'
      };

      stubData.productV4ServiceMock.expects('getNewId').once().returns(uuid);
      stubData.assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(uuid, ['_id'])
        .returns(null);
      stubData.productV4ServiceMock
        .expects('createProduct')
        .once()
        .withArgs(fakeValue)
        .resolves({ _id: uuid });
      stubData.responseMock.expects('status').once().withArgs(201);
      stubData.responseMock.expects('json').once().withArgs({ _id: uuid });
      productV4Controller
        .handleCreateProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it.skip('should return valid response when request body is valid product', (done) => {
      stubData.request.body = {
        apiVersion: '4.0.1',
        product: {
          _id: '588475b5-3ae7-4bb9-9de3-cbcb54c3af92',
          _schemaVersion: '4.0.1',
          _source: {
            source: 'SALESFORCE',
            type: 'product'
          },
          associatedMedia: [
            {
              _id: '0791debe-64bc-4c0b-aeee-df17e6c456d4',
              location: 'public http location',
              size: 3000,
              type: 'coverImage'
            }
          ],
          audience: [
            {
              code: 'RPG',
              description: 'Postgraduate'
            }
          ],
          categories: [
            {
              code: null,
              name: 'collection-type',
              type: 'netbase'
            },
            {
              code: null,
              name: 'collection-update-type',
              type: 'dynamic'
            }
          ],
          classifications: [
            {
              code: 'SCEC13',
              group: null,
              level: 2,
              name: 'Electrical & Electronic Engineering',
              priority: 1,
              type: 'subject'
            }
          ],
          collection: {
            abstracts: [
              {
                type: 'text',
                value: 'A Collection Abstract'
              }
            ],
            channels: [
              {
                name: 'UBX',
                type: 'delivery'
              },
              {
                name: 'GOBI',
                type: 'delivery'
              },
              {
                name: 'GOBI',
                type: 'sales'
              }
            ],
            customers: [
              {
                name: 'institution',
                type: 'customer'
              }
            ],
            description: '<P>Collection of chapters and articles for SDGO</P>',
            firstPublishedYear: 2019,
            licenses: [
              {
                name: 'perpetual',
                type: 'license'
              },
              {
                name: 'trial',
                type: 'license'
              }
            ],
            plannedPublicationDate: '2020-07-21T10:17:59.000Z',
            ruleUpdateEndDate: '2020-10-26T14:16:27.308Z',
            ruleUpdateStartDate: '2019-10-26T14:16:27.308Z',
            status: 'planned',
            subtitle: '',
            taxType: 'Q',
            totalCount: 10
          },
          contributors: [
            {
              affiliation: [],
              bio: null,
              collab: null,
              email: null,
              familyName: 'Romanets',
              fullName: 'Maryna Romanets',
              givenName: 'Maryna',
              orcid: null,
              position: 1,
              roles: ['collectionEditor']
            }
          ],
          discountGroups: [
            {
              code: 'W',
              description: 'W - USA ST Titles'
            }
          ],
          identifiers: {
            doi: '',
            sku: 'SFId'
          },
          keywords: [
            {
              name: 'women',
              position: 1,
              type: 'catchword',
              weightage: null
            }
          ],
          partsAdded: [
            {
              endDate: '2020-10-26T14:16:27.308Z',
              identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
              isFree: false,
              startDate: '2020-10-26T14:16:27.308Z',
              type: 'book'
            }
          ],
          partsRemoved: [
            {
              identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
              type: 'book'
            }
          ],
          partsUpdated: [
            {
              endDate: '2020-10-26T14:16:27.308Z',
              identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
              isFree: false,
              startDate: '2020-10-26T14:16:27.308Z',
              type: 'book'
            }
          ],
          permissions: [
            {
              code: 'IN',
              description: null,
              name: 'info-restrict',
              text: 'Restrict Information about Product - USE WITH CAUTION',
              type: 'access',
              validFrom: null,
              validTo: null
            },
            {
              code: 'EBRALL',
              description: null,
              name: 'EBRALL',
              text: 'Institutional, retail and Atypon',
              type: 'access',
              validFrom: null,
              validTo: null
            }
          ],
          prices: [
            {
              currency: 'GBP',
              price: 135.0,
              priceType: 'BYO Library Price',
              priceTypeCode: 'BYO',
              validFrom: '2019-12-09T00:00:00.000Z'
            }
          ],
          rights: [
            {
              area: [
                {
                  code: 'USKA',
                  name: ''
                },
                {
                  code: 'AMER',
                  name: ''
                },
                {
                  code: '20RW',
                  name: ''
                }
              ],
              category: 'exclusion',
              iso2: 'CA',
              iso3: 'CAN',
              isonum: '124',
              name: 'Canada',
              type: 'acquired'
            },
            {
              area: [
                {
                  code: 'USKA',
                  name: 'United States'
                },
                {
                  code: 'AMER',
                  name: 'United States'
                }
              ],
              category: 'exclusion',
              iso2: 'US',
              iso3: 'USA',
              isonum: '840',
              name: 'United States',
              type: 'acquired'
            }
          ],
          rulesList: [
            {
              rules: [
                {
                  position: 1,
                  rule: {
                    value: 'BEGIN'
                  },
                  type: 'separator'
                },
                {
                  position: 10,
                  rule: {
                    attribute: 'type',
                    relationship: 'EQ',
                    value: 'Book'
                  },
                  type: 'criteria'
                },
                {
                  position: 11,
                  rule: {
                    value: 'END'
                  },
                  type: 'separator'
                }
              ],
              rulesString: '',
              type: 'Book'
            }
          ],
          title: 'sdgo goal 1',
          type: 'collection',
          version: '4.0.1'
        }
      };
      const reqBody = _.cloneDeep(stubData.request.body);
      const productData = reqBody.product;
      const productDataCopy = _.cloneDeep(productData);
      const productType = 'collection';
      const responseData = {
        _id: '588475b5-3ae7-4bb9-9de3-cbcb54c3af92',
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
      const parsedQueries = [
        {
          rules: [
            { position: 1, rule: { value: 'BEGIN' }, type: 'separator' },
            {
              position: 10,
              rule: { attribute: 'type', relationship: 'EQ', value: 'Book' },
              type: 'criteria'
            },
            { position: 11, rule: { value: 'END' }, type: 'separator' }
          ],
          rulesString: {
            $and: [
              {
                statusCode: { $in: ['LFB', 'VGR', 'IHST', 'WNN'] }
              },
              { type: { $eq: 'Book' } }
            ]
          },
          type: 'Book'
        }
      ];
      productDataCopy.rulesList.rule = parsedQueries;
      stubData.collectionValidatorMock
        .expects('validateCollection')
        .once()
        .withArgs(productData)
        .resolves(true);
      stubData.assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(productData._id, ['_id'])
        .resolves(null);
      stubData.productV4ServiceMock
        .expects('getProductByTitle')
        .once()
        .withArgs(productData.title, productType)
        .resolves(null);
      stubData.productV4ServiceMock
        .expects('uploadProduct')
        .once()
        .withArgs(productData, action)
        .resolves(productDataCopy);
      stubData.responseMock.expects('status').once().withArgs(202);
      stubData.responseMock.expects('json').once().withArgs(responseData);
      productV4Controller
        .handleCreateProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.collectionValidatorMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.collectionValidatorMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it.skip('should return 400 error when product _id match with partId', (done) => {
      const uuid = '216fd5c8-906c-4c5a-ad71-3d391227e17f';
      stubData.request.body = {
        action: 'save',
        product: {
          _id: uuid,
          collection: {
            status: 'planned'
          },
          identifiers: {
            doi: 'abc'
          },
          partsAdded: [
            {
              identifier: uuid,
              type: 'book'
            }
          ],
          ruleList: 'some-rule',
          title: 'Test creative work',
          type: 'collection'
        }
      };
      const responseData = {
        data: null,
        metadata: {
          _id: '216fd5c8-906c-4c5a-ad71-3d391227e17f',
          error: '',
          message: `${uuid} should not match with any of parts update/delete/added id in the request payload`,
          messages: '',
          transactionDate: '2021-01-18T09:01:15.627Z',
          transactionId: null,
          type: 'collection'
        }
      };
      stubData.assetV4ServiceMock.expects('getAssetById').never();
      stubData.productV4ServiceMock.expects('getProductByTitle').never();
      stubData.productV4ServiceMock.expects('uploadProduct').never();
      const isoDateMock = sinon
        .stub(Date.prototype, 'toISOString')
        .returns('2021-01-18T09:01:15.627Z');
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock.expects('json').once().withArgs(responseData);
      productV4Controller
        .handleCreateProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.assetV4ServiceMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.assetV4ServiceMock.restore();
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
          isoDateMock.restore();
        });
    });
    it.skip('should return 400 error when product data type is invalid', (done) => {
      const uuid = '216fd5c8-906c-4c5a-ad71-3d391227e17f';
      stubData.request.body = {
        action: 'save',
        product: {
          _id: uuid,
          collection: {
            status: 'planned'
          },
          identifiers: {
            doi: 'abc'
          },
          partsAdded: [
            {
              identifier: uuid,
              type: 'book'
            }
          ],
          ruleList: 'some-rule',
          title: 'Test creative work',
          type: 'invalid'
        }
      };
      stubData.assetV4ServiceMock.expects('getAssetById').never();
      stubData.productV4ServiceMock.expects('getProductByTitle').never();
      stubData.productV4ServiceMock.expects('uploadProduct').never();
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: { error: undefined, message: 'Invalid type: invalid' }
        });
      productV4Controller
        .handleCreateProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.assetV4ServiceMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.assetV4ServiceMock.restore();
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it.skip('should return 400 error when product invalid json passed', (done) => {
      stubData.request.body = {
        action: 'save',
        product: {
          categories: [
            {
              name: 'collection-type',
              type: 'netbase'
            },
            {
              name: 'collection-update-type',
              type: 'static'
            }
          ],
          collection: {
            status: 'planned'
          },
          identifiers: {
            doi: 'abc'
          },
          partsAdded: [
            {
              identifier: 'some-id',
              position: 1,
              type: 'book'
            }
          ],
          ruleList: 'some-rule',
          title: 'Test creative work',
          type: 'collection'
        }
      };
      const reqBody = _.cloneDeep(stubData.request.body);
      const productData = reqBody.product;
      const validationErr = new AppError('Validation error', 400, [
        {
          code: 400,
          dataPath: '',
          description: "should have required property '_id'"
        }
      ]);
      stubData.schemaValidatorMock
        .expects('validateInputCollection')
        .once()
        .withArgs(productData)
        .rejects(validationErr);
      stubData.assetV4ServiceMock.expects('getAssetById').never();
      stubData.productV4ServiceMock.expects('getProductByTitle').never();
      stubData.productV4ServiceMock.expects('uploadProduct').never();
      const isoDateMock = sinon
        .stub(Date.prototype, 'toISOString')
        .returns('2021-01-18T09:01:15.627Z');
      stubData.responseMock.expects('status').once().withArgs(400);
      const errMetaData = {
        ...resJson.metadata,
        message: 'Validation error',
        messages: [
          {
            code: 400,
            dataPath: '',
            description: "should have required property '_id'"
          }
        ],
        type: 'collection'
      };
      const errJson = {};
      errJson['data'] = null;
      errJson['metadata'] = errMetaData;
      stubData.responseMock.expects('json').once().withArgs(errJson);
      productV4Controller
        .handleCreateProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.schemaValidatorMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.schemaValidatorMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
          isoDateMock.restore();
        });
    });
    it.skip('should return 409 error when product already exist with same title', (done) => {
      stubData.request.body = {
        action: 'save',
        apiVersion: '4.0.1',
        product: {
          _id: '588475b5-3ae7-4bb9-9de3-cbcb54c3af92',
          _schemaVersion: '4.0.1',
          _source: {
            source: 'SALESFORCE',
            type: 'product'
          },
          associatedMedia: [
            {
              location:
                'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/collection/some-collection-id/coverimage.jpg',
              type: 'coverimage'
            }
          ],
          audience: [
            {
              code: 'RPG',
              description: 'Postgraduate'
            }
          ],
          categories: [
            {
              code: null,
              name: 'collection-type',
              type: 'netbase'
            },
            {
              code: null,
              name: 'collection-update-type',
              type: 'dynamic'
            }
          ],
          classifications: [
            {
              code: 'SCEC13',
              group: null,
              level: 2,
              name: 'Electrical & Electronic Engineering',
              priority: 1,
              type: 'subject'
            }
          ],
          collection: {
            abstracts: [
              {
                type: 'text',
                value: 'A Collection Abstract'
              }
            ],
            channels: [
              {
                name: 'UBX',
                type: 'delivery'
              },
              {
                name: 'GOBI',
                type: 'delivery'
              },
              {
                name: 'GOBI',
                type: 'sales'
              }
            ],
            customers: [
              {
                name: 'institution',
                type: 'customer'
              }
            ],
            description: '<P>Collection of chapters and articles for SDGO</P>',
            firstPublishedYear: 2019,
            licenses: [
              {
                name: 'perpetual',
                type: 'license'
              },
              {
                name: 'trial',
                type: 'license'
              }
            ],
            plannedPublicationDate: '2020-07-21T10:17:59.000Z',
            ruleUpdateEndDate: '2020-10-26T14:16:27.308Z',
            ruleUpdateStartDate: '2019-10-26T14:16:27.308Z',
            status: 'planned',
            subtitle: '',
            totalCount: 10
          },
          contributors: [
            {
              bio: null,
              collab: null,
              email: null,
              familyName: 'Romanets',
              fullName: 'Maryna Romanets',
              givenName: 'Maryna',
              orcid: null,
              position: 1,
              roles: ['collectionEditor']
            }
          ],
          discountGroups: [
            {
              code: 'W',
              description: 'W - USA ST Titles'
            }
          ],
          identifiers: {
            doi: '',
            sku: 'SFId'
          },
          keywords: [
            {
              name: 'women',
              position: 1,
              type: 'catchword',
              weightage: null
            }
          ],
          partsAdded: [
            {
              endDate: '2020-10-26T14:16:27.308Z',
              identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
              isFree: false,
              startDate: '2020-10-26T14:16:27.308Z',
              type: 'book'
            }
          ],
          partsRemoved: [
            {
              identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
              type: 'book'
            }
          ],
          partsUpdated: [
            {
              endDate: '2020-10-26T14:16:27.308Z',
              identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
              isFree: false,
              startDate: '2020-10-26T14:16:27.308Z',
              type: 'book'
            }
          ],
          permissions: [
            {
              code: 'IN',
              description: null,
              name: 'info-restrict',
              text: 'Restrict Information about Product - USE WITH CAUTION',
              type: 'access',
              validFrom: null,
              validTo: null
            },
            {
              code: 'EBRALL',
              description: null,
              name: 'EBRALL',
              text: 'Institutional, retail and Atypon',
              type: 'access',
              validFrom: null,
              validTo: null
            }
          ],
          prices: [
            {
              currency: 'GBP',
              price: 135.0,
              priceType: 'BYO Library Price',
              priceTypeCode: 'BYO',
              validFrom: '2019-12-09T00:00:00.000Z'
            }
          ],
          rights: [
            {
              area: [
                {
                  code: 'USKA',
                  name: ''
                },
                {
                  code: 'AMER',
                  name: ''
                },
                {
                  code: '20RW',
                  name: ''
                }
              ],
              category: 'exclusion',
              iso2: 'CA',
              iso3: 'CAN',
              isonum: '124',
              name: 'Canada',
              type: 'acquired'
            },
            {
              area: [
                {
                  code: 'USKA',
                  name: 'United States'
                },
                {
                  code: 'AMER',
                  name: 'United States'
                }
              ],
              category: 'exclusion',
              iso2: 'US',
              iso3: 'USA',
              isonum: '840',
              name: 'United States',
              type: 'acquired'
            }
          ],
          ruleList: 'some-rule',
          rulesList: [
            {
              rules: [
                {
                  position: 1,
                  rule: {
                    value: 'BEGIN'
                  },
                  type: 'separator'
                },
                {
                  position: 10,
                  rule: {
                    attribute: 'type',
                    relationship: 'EQ',
                    value: 'Book'
                  },
                  type: 'criteria'
                },
                {
                  position: 11,
                  rule: {
                    value: 'END'
                  },
                  type: 'separator'
                }
              ],
              rulesString: '',
              type: 'Book'
            }
          ],
          title: 'sdgo goal 1',
          type: 'collection'
        }
      };
      const reqBody = _.cloneDeep(stubData.request.body);
      const productData = reqBody.product;
      const productType = 'collection';
      const responseData = {
        data: null,
        metadata: {
          _id: '588475b5-3ae7-4bb9-9de3-cbcb54c3af92',
          error: '',
          message: `A product already exists with title sdgo goal 1`,
          messages: '',
          transactionDate: '2021-01-18T09:01:15.627Z',
          transactionId: null,
          type: 'collection'
        }
      };
      stubData.schemaValidatorMock
        .expects('validateInputCollection')
        .once()
        .withArgs(productData)
        .resolves(true);
      stubData.assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(productData._id, ['_id'])
        .resolves(null);
      stubData.productV4ServiceMock
        .expects('getProductByTitle')
        .once()
        .withArgs(productData.title, productType)
        .resolves({ _id: '588475b5-3ae7-4bb9-9de3-cbcb54c3af92' });
      stubData.productV4ServiceMock.expects('uploadProduct').never();
      const isoDateMock = sinon
        .stub(Date.prototype, 'toISOString')
        .returns('2021-01-18T09:01:15.627Z');
      stubData.responseMock.expects('status').once().withArgs(409);
      stubData.responseMock.expects('json').once().withArgs(responseData);
      productV4Controller
        .handleCreateProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.schemaValidatorMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.schemaValidatorMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
          isoDateMock.restore();
        });
    });
    it.skip('should return 409 error when product already exist with collectionId', (done) => {
      stubData.request.body = {
        action: 'save',
        apiVersion: '4.0.1',
        product: {
          _id: '588475b5-3ae7-4bb9-9de3-cbcb54c3af92',
          _schemaVersion: '4.0.1',
          _source: {
            source: 'SALESFORCE',
            type: 'product'
          },
          associatedMedia: [
            {
              location:
                'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/collection/some-collection-id/coverimage.jpg',
              type: 'coverimage'
            }
          ],
          audience: [
            {
              code: 'RPG',
              description: 'Postgraduate'
            }
          ],
          categories: [
            {
              code: null,
              name: 'collection-type',
              type: 'netbase'
            },
            {
              code: null,
              name: 'collection-update-type',
              type: 'dynamic'
            }
          ],
          classifications: [
            {
              code: 'SCEC13',
              group: null,
              level: 2,
              name: 'Electrical & Electronic Engineering',
              priority: 1,
              type: 'subject'
            }
          ],
          collection: {
            abstracts: [
              {
                type: 'text',
                value: 'A Collection Abstract'
              }
            ],
            channels: [
              {
                name: 'UBX',
                type: 'delivery'
              },
              {
                name: 'GOBI',
                type: 'delivery'
              },
              {
                name: 'GOBI',
                type: 'sales'
              }
            ],
            customers: [
              {
                name: 'institution',
                type: 'customer'
              }
            ],
            description: '<P>Collection of chapters and articles for SDGO</P>',
            firstPublishedYear: 2019,
            licenses: [
              {
                name: 'perpetual',
                type: 'license'
              },
              {
                name: 'trial',
                type: 'license'
              }
            ],
            plannedPublicationDate: '2020-07-21T10:17:59.000Z',
            ruleUpdateEndDate: '2020-10-26T14:16:27.308Z',
            ruleUpdateStartDate: '2019-10-26T14:16:27.308Z',
            status: 'planned',
            subtitle: '',
            totalCount: 10
          },
          contributors: [
            {
              bio: null,
              collab: null,
              email: null,
              familyName: 'Romanets',
              fullName: 'Maryna Romanets',
              givenName: 'Maryna',
              orcid: null,
              position: 1,
              roles: ['collectionEditor']
            }
          ],
          discountGroups: [
            {
              code: 'W',
              description: 'W - USA ST Titles'
            }
          ],
          identifiers: {
            collectionId: 'some-collectionId',
            doi: '',
            sku: 'SFId'
          },
          keywords: [
            {
              name: 'women',
              position: 1,
              type: 'catchword',
              weightage: null
            }
          ],
          partsAdded: [
            {
              endDate: '2020-10-26T14:16:27.308Z',
              identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
              isFree: false,
              startDate: '2020-10-26T14:16:27.308Z',
              type: 'book'
            }
          ],
          partsRemoved: [
            {
              identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
              type: 'book'
            }
          ],
          partsUpdated: [
            {
              endDate: '2020-10-26T14:16:27.308Z',
              identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
              isFree: false,
              startDate: '2020-10-26T14:16:27.308Z',
              type: 'book'
            }
          ],
          permissions: [
            {
              code: 'IN',
              description: null,
              name: 'info-restrict',
              text: 'Restrict Information about Product - USE WITH CAUTION',
              type: 'access',
              validFrom: null,
              validTo: null
            },
            {
              code: 'EBRALL',
              description: null,
              name: 'EBRALL',
              text: 'Institutional, retail and Atypon',
              type: 'access',
              validFrom: null,
              validTo: null
            }
          ],
          prices: [
            {
              currency: 'GBP',
              price: 135.0,
              priceType: 'BYO Library Price',
              priceTypeCode: 'BYO',
              validFrom: '2019-12-09T00:00:00.000Z'
            }
          ],
          rights: [
            {
              area: [
                {
                  code: 'USKA',
                  name: ''
                },
                {
                  code: 'AMER',
                  name: ''
                },
                {
                  code: '20RW',
                  name: ''
                }
              ],
              category: 'exclusion',
              iso2: 'CA',
              iso3: 'CAN',
              isonum: '124',
              name: 'Canada',
              type: 'acquired'
            },
            {
              area: [
                {
                  code: 'USKA',
                  name: 'United States'
                },
                {
                  code: 'AMER',
                  name: 'United States'
                }
              ],
              category: 'exclusion',
              iso2: 'US',
              iso3: 'USA',
              isonum: '840',
              name: 'United States',
              type: 'acquired'
            }
          ],
          ruleList: 'some-rule',
          rulesList: [
            {
              rules: [
                {
                  position: 1,
                  rule: {
                    value: 'BEGIN'
                  },
                  type: 'separator'
                },
                {
                  position: 10,
                  rule: {
                    attribute: 'type',
                    relationship: 'EQ',
                    value: 'Book'
                  },
                  type: 'criteria'
                },
                {
                  position: 11,
                  rule: {
                    value: 'END'
                  },
                  type: 'separator'
                }
              ],
              rulesString: '',
              type: 'Book'
            }
          ],
          title: 'sdgo goal 123',
          type: 'collection'
        }
      };
      const reqBody = _.cloneDeep(stubData.request.body);
      const productData = reqBody.product;
      const productType = 'collection';
      const responseData = {
        data: null,
        metadata: {
          _id: '588475b5-3ae7-4bb9-9de3-cbcb54c3af92',
          error: '',
          message: `A product already exists with collectionId some-collectionId`,
          messages: '',
          transactionDate: '2021-01-18T09:01:15.627Z',
          transactionId: null,
          type: 'collection'
        }
      };
      stubData.schemaValidatorMock
        .expects('validateInputCollection')
        .once()
        .withArgs(productData)
        .resolves(true);
      stubData.assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(productData._id, ['_id'])
        .resolves(null);
      stubData.productV4ServiceMock
        .expects('getProductByTitle')
        .once()
        .withArgs(productData.title, productType)
        .resolves(null);
      stubData.assetV4ServiceMock
        .expects('getProductByIdentifier')
        .once()
        .withArgs('collectionId', 'some-collectionId')
        .resolves({ _id: 'some-id' });
      stubData.productV4ServiceMock.expects('uploadProduct').never();
      const isoDateMock = sinon
        .stub(Date.prototype, 'toISOString')
        .returns('2021-01-18T09:01:15.627Z');
      stubData.responseMock.expects('status').once().withArgs(409);
      stubData.responseMock.expects('json').once().withArgs(responseData);
      productV4Controller
        .handleCreateProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.schemaValidatorMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.schemaValidatorMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
          isoDateMock.restore();
        });
    });
    it.skip('should return 400 error when service method upload fails', (done) => {
      stubData.request.body = {
        action: 'save',
        apiVersion: '4.0.1',
        product: {
          _id: '588475b5-3ae7-4bb9-9de3-cbcb54c3af92',
          _schemaVersion: '4.0.1',
          _source: {
            source: 'SALESFORCE',
            type: 'product'
          },
          associatedMedia: [
            {
              _id: '0791debe-64bc-4c0b-aeee-df17e6c456d4',
              location: 'public http location',
              size: 3000,
              type: 'coverImage'
            }
          ],
          audience: [
            {
              code: 'RPG',
              description: 'Postgraduate'
            }
          ],
          categories: [
            {
              code: null,
              name: 'collection-type',
              type: 'netbase'
            },
            {
              code: null,
              name: 'collection-update-type',
              type: 'dynamic'
            }
          ],
          classifications: [
            {
              code: 'SCEC13',
              group: null,
              level: 2,
              name: 'Electrical & Electronic Engineering',
              priority: 1,
              type: 'subject'
            }
          ],
          collection: {
            abstracts: [
              {
                type: 'text',
                value: 'A Collection Abstract'
              }
            ],
            channels: [
              {
                name: 'UBX',
                type: 'delivery'
              },
              {
                name: 'GOBI',
                type: 'delivery'
              },
              {
                name: 'GOBI',
                type: 'sales'
              }
            ],
            customers: [
              {
                name: 'institution',
                type: 'customer'
              }
            ],
            description: '<P>Collection of chapters and articles for SDGO</P>',
            firstPublishedYear: 2019,
            licenses: [
              {
                name: 'perpetual',
                type: 'license'
              },
              {
                name: 'trial',
                type: 'license'
              }
            ],
            plannedPublicationDate: '2020-07-21T10:17:59.000Z',
            ruleUpdateEndDate: '2020-10-26T14:16:27.308Z',
            ruleUpdateStartDate: '2019-10-26T14:16:27.308Z',
            status: 'planned',
            subtitle: '',
            totalCount: 10
          },
          contributors: [
            {
              bio: null,
              collab: null,
              email: null,
              familyName: 'Romanets',
              fullName: 'Maryna Romanets',
              givenName: 'Maryna',
              orcid: null,
              position: 1,
              roles: ['collectionEditor']
            }
          ],
          discountGroups: [
            {
              code: 'W',
              description: 'W - USA ST Titles'
            }
          ],
          identifiers: {
            doi: '',
            sku: 'SFId'
          },
          keywords: [
            {
              name: 'women',
              position: 1,
              type: 'catchword',
              weightage: null
            }
          ],
          partsAdded: [
            {
              endDate: '2020-10-26T14:16:27.308Z',
              identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
              isFree: false,
              startDate: '2020-10-26T14:16:27.308Z',
              type: 'book'
            }
          ],
          partsRemoved: [
            {
              identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
              type: 'book'
            }
          ],
          partsUpdated: [
            {
              endDate: '2020-10-26T14:16:27.308Z',
              identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
              isFree: false,
              startDate: '2020-10-26T14:16:27.308Z',
              type: 'book'
            }
          ],
          permissions: [
            {
              code: 'IN',
              description: null,
              name: 'info-restrict',
              text: 'Restrict Information about Product - USE WITH CAUTION',
              type: 'access',
              validFrom: null,
              validTo: null
            },
            {
              code: 'EBRALL',
              description: null,
              name: 'EBRALL',
              text: 'Institutional, retail and Atypon',
              type: 'access',
              validFrom: null,
              validTo: null
            }
          ],
          prices: [
            {
              currency: 'GBP',
              price: 135.0,
              priceType: 'BYO Library Price',
              priceTypeCode: 'BYO',
              validFrom: '2019-12-09T00:00:00.000Z'
            }
          ],
          rights: [
            {
              area: [
                {
                  code: 'USKA',
                  name: ''
                },
                {
                  code: 'AMER',
                  name: ''
                },
                {
                  code: '20RW',
                  name: ''
                }
              ],
              category: 'exclusion',
              iso2: 'CA',
              iso3: 'CAN',
              isonum: '124',
              name: 'Canada',
              type: 'acquired'
            },
            {
              area: [
                {
                  code: 'USKA',
                  name: 'United States'
                },
                {
                  code: 'AMER',
                  name: 'United States'
                }
              ],
              category: 'exclusion',
              iso2: 'US',
              iso3: 'USA',
              isonum: '840',
              name: 'United States',
              type: 'acquired'
            }
          ],
          rulesList: [
            {
              rules: [
                {
                  position: 1,
                  rule: {
                    value: 'BEGIN'
                  },
                  type: 'separator'
                },
                {
                  position: 10,
                  rule: {
                    attribute: 'type',
                    relationship: 'EQ',
                    value: 'Book'
                  },
                  type: 'criteria'
                },
                {
                  position: 11,
                  rule: {
                    value: 'END'
                  },
                  type: 'separator'
                }
              ],
              rulesString: '',
              type: 'Book'
            }
          ],
          title: 'sdgo goal 1',
          type: 'collection'
        }
      };
      const reqBody = _.cloneDeep(stubData.request.body);
      const productData = reqBody.product;
      const productType = 'collection';
      const validationErr = new AppError(`Error while uploading file`, 400);
      const responseData = {
        data: null,
        metadata: {
          _id: '588475b5-3ae7-4bb9-9de3-cbcb54c3af92',
          error: '',
          message: `Error while uploading file`,
          messages: '',
          transactionDate: '2021-01-18T09:01:15.627Z',
          transactionId: null,
          type: 'collection'
        }
      };
      const action = 'create';
      stubData.collectionValidatorMock
        .expects('validateCollection')
        .once()
        .withArgs(productData)
        .resolves(true);
      stubData.schemaValidatorMock
        .expects('validateInputCollection')
        .once()
        .withArgs(productData)
        .resolves(true);
      stubData.assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(productData._id, ['_id'])
        .resolves(null);
      stubData.productV4ServiceMock
        .expects('getProductByTitle')
        .once()
        .withArgs(productData.title, productType)
        .resolves(null);
      stubData.productV4ServiceMock
        .expects('uploadProduct')
        .once()
        .withArgs(productData, action)
        .rejects(validationErr);
      const isoDateMock = sinon
        .stub(Date.prototype, 'toISOString')
        .returns('2021-01-18T09:01:15.627Z');
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock.expects('json').once().withArgs(responseData);
      productV4Controller
        .handleCreateProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.collectionValidatorMock.verify();
          stubData.schemaValidatorMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.collectionValidatorMock.restore();
          stubData.schemaValidatorMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
          isoDateMock.restore();
        });
    });
    it.skip('should return 400 error when product already exist', (done) => {
      const uuid = '216fd5c8-906c-4c5a-ad71-3d391227e17f';
      stubData.request.body = {
        action: 'save',
        product: {
          identifiers: {
            doi: 'abc'
          },
          title: 'Test creative work',
          type: 'creativeWork'
        }
      };
      stubData.productV4ServiceMock.expects('getNewId').once().returns(uuid);
      stubData.assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(uuid, ['_id'])
        .returns({ _id: uuid });
      stubData.productV4ServiceMock.expects('createProduct').never();
      const isoDateMock = sinon
        .stub(Date.prototype, 'toISOString')
        .returns('2021-01-18T09:01:15.627Z');
      stubData.responseMock.expects('status').once().withArgs(400);
      const errMetaData = {
        ...resJson.metadata,
        _id: uuid,
        message: 'A product already exists with this _id.',
        type: 'creativeWork'
      };
      const errJson = {};
      errJson['data'] = null;
      errJson['metadata'] = errMetaData;
      stubData.responseMock.expects('json').once().withArgs(errJson);
      productV4Controller
        .handleCreateProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.responseMock.restore();
          isoDateMock.restore();
        });
    });
    it.skip('should return 400 error when productData is missing in request body', (done) => {
      stubData.request.body = {
        action: 'save',
        product: null
      };
      stubData.productV4ServiceMock.expects('getNewId').never();
      stubData.assetV4ServiceMock.expects('getAssetById').never();
      stubData.productV4ServiceMock.expects('createProduct').never();
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: JSON.stringify({ data: stubData.request.body.product }),
            message: 'Missing product data in the request payload.'
          }
        });
      productV4Controller
        .handleCreateProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it.skip('should return 400 error when isPartOf is present in request product', (done) => {
      stubData.request.body = {
        action: 'save',
        product: {
          identifiers: {
            doi: 'abc'
          },
          isPartOf: [
            {
              _id: '73e5c496-ca42-4f5e-9629-8ab3b5fc6b28',
              level: 1,
              position: 1,
              title: null,
              type: 'collection'
            }
          ],
          title: 'Test creative work',
          type: 'creativeWork'
        }
      };
      stubData.productV4ServiceMock.expects('getNewId').never();
      stubData.assetV4ServiceMock.expects('getAssetById').never();
      stubData.productV4ServiceMock.expects('createProduct').never();
      const isoDateMock = sinon
        .stub(Date.prototype, 'toISOString')
        .returns('2021-01-18T09:01:15.627Z');
      stubData.responseMock.expects('status').once().withArgs(400);
      const errMetaData = {
        ...resJson.metadata,
        message: 'Invalid property(s): isPartOf',
        type: 'creativeWork'
      };
      const errJson = {};
      errJson['data'] = null;
      errJson['metadata'] = errMetaData;
      stubData.responseMock.expects('json').once().withArgs(errJson);
      productV4Controller
        .handleCreateProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.responseMock.restore();
          isoDateMock.restore();
        });
    });
    it.skip('should return 400 error when identifiers is missing in request product', (done) => {
      stubData.request.body = {
        action: 'save',
        product: {
          title: 'Test creative work',
          type: 'creativeWork'
        }
      };
      stubData.productV4ServiceMock.expects('getNewId').never();
      stubData.assetV4ServiceMock.expects('getAssetById').never();
      stubData.productV4ServiceMock.expects('createProduct').never();
      const isoDateMock = sinon
        .stub(Date.prototype, 'toISOString')
        .returns('2021-01-18T09:01:15.627Z');
      stubData.responseMock.expects('status').once().withArgs(400);
      const errMetaData = {
        ...resJson.metadata,
        message: 'Missing product-data/identifiers in the request.',
        type: 'creativeWork'
      };
      const errJson = {};
      errJson['data'] = null;
      errJson['metadata'] = errMetaData;
      stubData.responseMock.expects('json').once().withArgs(errJson);
      productV4Controller
        .handleCreateProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.responseMock.restore();
          isoDateMock.restore();
        });
    });
    it.skip('should throw 500 error when the Service layer throws error', (done) => {
      const uuid = '216fd5c8-906c-4c5a-ad71-3d391227e17f';
      stubData.request.body = {
        action: 'save',
        product: {
          identifiers: {
            doi: '10.1224/216fd5c8-906c-4c5a-ad71-3d391227e17f'
          },
          title: 'test creativeWork',
          type: 'creativeWork'
        }
      };
      stubData.productV4ServiceMock.expects('getNewId').once().returns(uuid);
      stubData.assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(uuid, ['_id'])
        .returns(null);
      stubData.productV4ServiceMock
        .expects('createProduct')
        .once()
        .withArgs({ _id: uuid, ...stubData.request.body.product })
        .rejects(new Error('Internal error'));
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
      productV4Controller
        .handleCreateProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.assetV4ServiceMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.productV4ServiceMock.restore();
        });
    });
    it.skip('should throw 400 error when the _id is invalid uuid', (done) => {
      const uuid = 'invalid_uuid';
      stubData.request.body = {
        action: 'save',
        product: {
          _id: uuid,
          identifiers: {
            doi: ''
          },
          type: 'creativeWork'
        }
      };
      stubData.productV4ServiceMock.expects('getNewId').never();
      stubData.assetV4ServiceMock.expects('getAssetById').never();
      stubData.productV4ServiceMock.expects('createProduct').never();
      const isoDateMock = sinon
        .stub(Date.prototype, 'toISOString')
        .returns('2021-01-18T09:01:15.627Z');
      stubData.responseMock.expects('status').once().withArgs(400);
      const errMetaData = {
        ...resJson.metadata,
        _id: uuid,
        message: 'Invalid _id. Note: Only UUID is allowed.',
        type: 'creativeWork'
      };
      const errJson = {};
      errJson['data'] = null;
      errJson['metadata'] = errMetaData;
      stubData.responseMock.expects('json').once().withArgs(errJson);
      productV4Controller
        .handleCreateProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.responseMock.restore();
          isoDateMock.restore();
        });
    });
  });
  describe('handleCreateProductInternal', () => {
    it('should create a new preChapter when request body is valid product', (done) => {
      stubData.request.body = {
        action: 'save',
        product: {
          chapter: {
            subtitle: 'string'
          },
          contributors: [
            {
              familyName: 'Loxley',
              fullName: 'Peter Loxley',
              givenName: 'Peter',
              roles: ['author']
            }
          ],
          isPartOf: [
            {
              identifiers: {
                isbn: '9781315265209'
              },
              type: 'book'
            }
          ],
          title: 'some title',
          type: 'preChapter'
        }
      };
      const prechapterV4ControllerMock = sinon.mock(prechapterV4Controller);
      prechapterV4ControllerMock
        .expects('createPreChapterProduct')
        .once()
        .withArgs(stubData.request.body, stubData.response)
        .resolves('some-id');
      productV4Controller
        .handleCreateProductInternal(stubData.request, stubData.response)
        .then(() => {
          stubData.prechapterV4ControllerMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.prechapterV4ControllerMock.restore();
        });
    });
    it('should return 400 error when product data type is invalid', (done) => {
      stubData.request.body = {
        action: 'save',
        product: {
          chapter: {
            subtitle: 'string'
          },
          contributors: [
            {
              familyName: 'Loxley',
              fullName: 'Peter Loxley',
              givenName: 'Peter',
              roles: ['author']
            }
          ],
          isPartOf: [
            {
              identifiers: {
                isbn: '9781315265209'
              },
              type: 'book'
            }
          ],
          title: 'some title',
          type: 'invalid'
        }
      };
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Invalid type: invalid',
            transactionId: undefined
          }
        });
      productV4Controller
        .handleCreateProductInternal(stubData.request, stubData.response)
        .then(() => {
          stubData.assetV4ServiceMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.assetV4ServiceMock.restore();
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
  });
  describe('getProducts', () => {
    it('should throw 400 error when availabilityStatus is without availabilityName', (done) => {
      stubData.request.query.responseGroup = 'large';
      stubData.request.query.productVersion = '1.0.1';

      stubData.request.query.limit = 1;
      stubData.request.query.offset = 0;
      stubData.request.query.availabilityStatus = 'SELLABLE,CAN_HOST';

      stubData.productV4ServiceMock.expects('getProductsWithType').never();
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'To use availabilityStatus, availabilityName is mandatory',
            transactionId: undefined
          }
        });
      productV4Controller
        .getProducts(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.productV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.productV4ServiceMock.restore();
        });
    });
    it('should return book products when type/identifierName not provided', (done) => {
      stubData.request.query.responseGroup = 'large';
      stubData.request.query.productVersion = '1.0.0';

      stubData.request.query.limit = 1;
      stubData.request.query.offset = 4;

      const books = booksTestData;
      const bookProductsWrapper = books.map((product) => {
        return { product };
      });
      stubData.productV4ServiceMock
        .expects('getProductsWithType')
        .once()
        .withArgs(
          'book',
          4,
          1,
          stubData.request.query.responseGroup,
          undefined,
          undefined,
          stubData.request.query.productVersion
        )
        .resolves(bookProductsWrapper);
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs(bookProductsWrapper);
      productV4Controller
        .getProducts(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it(`should return book products when type/identifierName not provided but
     availabilityName is provided`, (done) => {
      stubData.request.query.responseGroup = 'large';
      stubData.request.query.productVersion = '1.0.0';

      stubData.request.query.limit = 1;
      stubData.request.query.offset = 0;
      stubData.request.query.availabilityName = 'UBX';

      const books = booksTestData;
      const bookProductsWrapper = books.map((product) => {
        return { product };
      });
      stubData.productV4ServiceMock
        .expects('getProductsWithType')
        .once()
        .withArgs(
          'book',
          0,
          1,
          stubData.request.query.responseGroup,
          stubData.request.query.availabilityName,
          undefined,
          stubData.request.query.productVersion
        )
        .resolves(bookProductsWrapper);
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs(bookProductsWrapper);
      productV4Controller
        .getProducts(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it(`should return book products when type/identifierName not provided but
    availabilityName and availabilityStatus is provided`, (done) => {
      stubData.request.query.responseGroup = 'large';
      stubData.request.query.productVersion = '1.0.0';

      stubData.request.query.limit = 1;
      stubData.request.query.offset = 0;
      stubData.request.query.availabilityName = 'UBX';
      stubData.request.query.availabilityStatus = 'SELLABLE,CAN_HOST';

      const books = booksTestData;
      const bookProductsWrapper = books.map((product) => {
        return { product };
      });
      stubData.productV4ServiceMock
        .expects('getProductsWithType')
        .once()
        .withArgs(
          'book',
          0,
          1,
          stubData.request.query.responseGroup,
          stubData.request.query.availabilityName,
          stubData.request.query.availabilityStatus.split(','),
          stubData.request.query.productVersion
        )
        .resolves(bookProductsWrapper);
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs(bookProductsWrapper);
      productV4Controller
        .getProducts(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it('should throw 404 error when products not found', (done) => {
      stubData.request.query.responseGroup = 'large';
      stubData.request.query.productVersion = '1.0.1';

      stubData.request.query.limit = 1;
      stubData.request.query.offset = 0;

      stubData.productV4ServiceMock
        .expects('getProductsWithType')
        .once()
        .withArgs(
          'book',
          0,
          1,
          stubData.request.query.responseGroup,
          undefined,
          undefined,
          stubData.request.query.productVersion
        )
        .resolves(null);
      stubData.responseMock.expects('status').once().withArgs(404);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Products not found',
            transactionId: undefined
          }
        });
      productV4Controller
        .getProducts(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.productV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.productV4ServiceMock.restore();
        });
    });
    it('should throw 500 error when the Service layer throws error', (done) => {
      stubData.request.query.responseGroup = 'large';
      stubData.request.query.productVersion = '1.0.1';

      stubData.request.query.limit = 1;
      stubData.request.query.offset = 0;

      const internalError = new Error('Internal error');

      stubData.productV4ServiceMock
        .expects('getProductsWithType')
        .once()
        .withArgs(
          'book',
          0,
          1,
          stubData.request.query.responseGroup,
          undefined,
          undefined,
          stubData.request.query.productVersion
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
      productV4Controller
        .getProducts(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.productV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.productV4ServiceMock.restore();
        });
    });
    it('should return book products when identifierName & identifierValues are provided', (done) => {
      stubData.request.query.responseGroup = 'large';
      stubData.request.query.productVersion = '1.0.1';

      stubData.request.query.identifierName = 'isbn';
      stubData.request.query.identifierValues = '9781003017455';
      stubData.request.query.type = 'book';

      const books = booksTestData;
      const bookProductsWrapper = books.map((product) => {
        return { product };
      });
      stubData.productV4ServiceMock
        .expects('getProductsByDynamicIds')
        .once()
        .withArgs(
          stubData.request.query.identifierName,
          stubData.request.query.identifierValues.split(','),
          stubData.request.query.type,
          stubData.request.query.responseGroup,
          undefined,
          undefined,
          stubData.request.query.productVersion
        )
        .resolves(bookProductsWrapper);
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs(bookProductsWrapper);
      productV4Controller
        .getProducts(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it(`should return book products when identifierName & identifierValues are provided
      with availabilityName`, (done) => {
      stubData.request.query.responseGroup = 'large';
      stubData.request.query.productVersion = '1.0.1';

      stubData.request.query.identifierName = 'isbn';
      stubData.request.query.identifierValues = '9781003017455';
      stubData.request.query.type = 'book';
      stubData.request.query.availabilityName = 'UBX';

      const books = booksTestData;
      const bookProductsWrapper = books.map((product) => {
        return { product };
      });
      stubData.productV4ServiceMock
        .expects('getProductsByDynamicIds')
        .once()
        .withArgs(
          stubData.request.query.identifierName,
          stubData.request.query.identifierValues.split(','),
          stubData.request.query.type,
          stubData.request.query.responseGroup,
          stubData.request.query.availabilityName,
          undefined,
          stubData.request.query.productVersion
        )
        .resolves(bookProductsWrapper);
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs(bookProductsWrapper);
      productV4Controller
        .getProducts(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it(`should return book products when identifierName & identifierValues are provided
     with availabilityName`, (done) => {
      stubData.request.query.responseGroup = 'large';
      stubData.request.query.productVersion = '1.0.1';

      stubData.request.query.identifierName = 'isbn';
      stubData.request.query.identifierValues = '9781003017455';
      stubData.request.query.type = 'book';
      stubData.request.query.availabilityName = 'UBX';

      const books = booksTestData;
      const bookProductsWrapper = books.map((product) => {
        return { product };
      });
      stubData.productV4ServiceMock
        .expects('getProductsByDynamicIds')
        .once()
        .withArgs(
          stubData.request.query.identifierName,
          stubData.request.query.identifierValues.split(','),
          stubData.request.query.type,
          stubData.request.query.responseGroup,
          stubData.request.query.availabilityName,
          undefined,
          stubData.request.query.productVersion
        )
        .resolves(bookProductsWrapper);
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs(bookProductsWrapper);
      productV4Controller
        .getProducts(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it(`should return book products when identifierName & identifierValues are provided
    with availabilityName and availabilityStatus`, (done) => {
      stubData.request.query.responseGroup = 'large';
      stubData.request.query.productVersion = '1.0.1';

      stubData.request.query.identifierName = 'isbn';
      stubData.request.query.identifierValues = '9781003017455';
      stubData.request.query.type = 'book';
      stubData.request.query.availabilityName = 'UBX';
      stubData.request.query.availabilityStatus = 'SELLABLE,CAN_HOST';

      const books = booksTestData;
      const bookProductsWrapper = books.map((product) => {
        return { product };
      });
      stubData.productV4ServiceMock
        .expects('getProductsByDynamicIds')
        .once()
        .withArgs(
          stubData.request.query.identifierName,
          stubData.request.query.identifierValues.split(','),
          stubData.request.query.type,
          stubData.request.query.responseGroup,
          stubData.request.query.availabilityName,
          stubData.request.query.availabilityStatus.split(','),
          stubData.request.query.productVersion
        )
        .resolves(bookProductsWrapper);
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs(bookProductsWrapper);
      productV4Controller
        .getProducts(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it(`should throw 404 error when products not found & identifierName & identifierValues
     are provided`, (done) => {
      stubData.request.query.responseGroup = 'large';
      stubData.request.query.productVersion = '1.0.1';

      stubData.request.query.identifierName = 'isbn';
      stubData.request.query.identifierValues = '9781003017455';
      stubData.request.query.type = 'book';

      stubData.productV4ServiceMock
        .expects('getProductsByDynamicIds')
        .once()
        .withArgs(
          stubData.request.query.identifierName,
          stubData.request.query.identifierValues.split(','),
          stubData.request.query.type,
          stubData.request.query.responseGroup,
          undefined,
          undefined,
          stubData.request.query.productVersion
        )
        .resolves(null);
      stubData.responseMock.expects('status').once().withArgs(404);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Products not found',
            transactionId: undefined
          }
        });
      productV4Controller
        .getProducts(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it(`should throw 500 error when the Service layer throws error& identifierName &
      identifierValues are provided`, (done) => {
      stubData.request.query.responseGroup = 'large';
      stubData.request.query.productVersion = '1.0.1';

      stubData.request.query.identifierName = 'isbn';
      stubData.request.query.identifierValues = '9781003017455';
      stubData.request.query.type = 'book';

      const internalError = new Error('Internal error');

      stubData.productV4ServiceMock
        .expects('getProductsByDynamicIds')
        .once()
        .withArgs(
          stubData.request.query.identifierName,
          stubData.request.query.identifierValues.split(','),
          stubData.request.query.type,
          stubData.request.query.responseGroup,
          undefined,
          undefined,
          stubData.request.query.productVersion
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
      productV4Controller
        .getProducts(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.productV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.productV4ServiceMock.restore();
        });
    });
    it(`should return book products when identifier title is provided`, (done) => {
      stubData.request.query.responseGroup = 'small';
      stubData.request.query.identifierName = 'title';
      stubData.request.query.identifierValues =
        'The Beaulieu Encyclopedia of the Automobile';
      stubData.request.query.type = 'book';

      const books = booksTestData;
      const bookProductsWrapper = books.map((product) => {
        return { product };
      });
      stubData.productV4ServiceMock
        .expects('getProductByIdentifier')
        .once()
        .withArgs(
          stubData.request.query.identifierName,
          stubData.request.query.identifierValues,
          stubData.request.query.type,
          stubData.request.query.responseGroup
        )
        .resolves(bookProductsWrapper);
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs(bookProductsWrapper);
      productV4Controller
        .getProducts(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
  });
  describe('getTaxonomy', () => {
    it('should return taxonomy Successfully', (done) => {
      stubData.request.params = { assetType: 'book', taxonomyType: 'subject' };
      stubData.request.query.code = 'SCAG';
      stubData.request.query.level = '1';
      stubData.request.query.isCodePrefix = 'false';
      stubData.request.query.extendLevel = 'false';
      const testTaxonomy = [
        {
          _id: 'AG',
          assetType: 'book',
          code: 'SCAG',
          level: 1,
          name: 'Environment & Agriculture',
          parentId: null,
          type: 'subject'
        }
      ];
      const taxonomyFilter = {
        code: 'SCAG',
        extendLevel: false,
        isCodePrefix: false,
        level: 1,
        name: undefined
      };
      stubData.productV4ServiceMock
        .expects('getTaxonomy')
        .once()
        .withArgs(
          stubData.request.params.assetType,
          stubData.request.params.taxonomyType,
          taxonomyFilter
        )
        .resolves(testTaxonomy);
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(testTaxonomy);
      productV4Controller
        .getTaxonomy(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it('should throw 400 error when query-param level is not numeric', (done) => {
      stubData.request.params = { assetType: 'book', taxonomyType: 'subject' };
      stubData.request.query.level = 'A';

      stubData.productV4ServiceMock.expects('getTaxonomy').never();
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Query-param `level` value is not Numeric',
            transactionId: undefined
          }
        });
      productV4Controller
        .getTaxonomy(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it('should throw 404 error when there are no matching taxonomy', (done) => {
      stubData.request.params = { assetType: 'book', taxonomyType: 'subject' };
      stubData.request.query.code = 'Tricon';
      stubData.request.query.level = '2';
      const testTaxonomy = [];
      const taxonomyFilter = {
        code: 'Tricon',
        extendLevel: false,
        isCodePrefix: false,
        level: 2,
        name: undefined
      };
      stubData.productV4ServiceMock
        .expects('getTaxonomy')
        .once()
        .withArgs(
          stubData.request.params.assetType,
          stubData.request.params.taxonomyType,
          taxonomyFilter
        )
        .resolves(testTaxonomy);
      stubData.responseMock.expects('status').once().withArgs(404);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Taxonomy not found',
            transactionId: undefined
          }
        });
      productV4Controller
        .getTaxonomy(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it('should throw 500 when Service layer throws Error', (done) => {
      stubData.request.params = { assetType: 'book', taxonomyType: 'subject' };
      stubData.request.query.code = 'SCAG';
      stubData.request.query.level = '1';
      stubData.request.query.isCodePrefix = 'false';
      stubData.request.query.extendLevel = 'false';
      const taxonomyFilter = {
        code: 'SCAG',
        extendLevel: false,
        isCodePrefix: false,
        level: 1,
        name: undefined
      };
      stubData.productV4ServiceMock
        .expects('getTaxonomy')
        .once()
        .withArgs(
          stubData.request.params.assetType,
          stubData.request.params.taxonomyType,
          taxonomyFilter
        )
        .rejects(new Error('Internal server error'));
      stubData.responseMock.expects('status').once().withArgs(500);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Internal server error',
            transactionId: undefined
          }
        });
      productV4Controller
        .getTaxonomy(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          stubData.assetV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
          stubData.assetV4ServiceMock.restore();
        });
    });
  });
  describe('getNewId', () => {
    it('should return valid id when action is new-id', (done) => {
      stubData.request.body = {
        action: 'new-id',
        apiVersion: '4.0.1'
      };
      const id = 'some-uuid';
      stubData.productV4ServiceMock.expects('getNewId').once().returns(id);
      stubData.responseMock.expects('status').once().withArgs(201);
      stubData.responseMock.expects('json').once().withArgs({ _id: id });
      productV4Controller
        .getNewId(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it('should throw error when not able to generate uuid', (done) => {
      stubData.request.body = {
        action: 'new-idd',
        apiVersion: '4.0.1'
      };
      stubData.productV4ServiceMock
        .expects('getNewId')
        .once()
        .throws(new AppError('Could not generate UUID at this moment', 404));
      stubData.responseMock.expects('status').once().withArgs(404);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Could not generate UUID at this moment',
            transactionId: undefined
          }
        });
      productV4Controller
        .getNewId(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
  });
  describe('handlePostProduct', () => {
    it('should go for valid scenario when action is save', (done) => {
      stubData.request.body = {
        action: 'save',
        apiVersion: '4.0.1'
      };
      const createProductSpy = sinon.spy(
        productV4Controller,
        'handleCreateProduct'
      );
      productV4Controller
        .handlePostProduct(stubData.request, stubData.response)
        .then(() => {
          assert(createProductSpy.calledOnce);
          done();
        })
        .catch(done)
        .finally(() => {
          createProductSpy.restore();
        });
    });
    it('should go for valid scenario when action is download', (done) => {
      stubData.request.body = {
        action: 'download',
        apiVersion: '4.0.1'
      };
      const createProductSpy = sinon.spy(
        productV4Controller,
        'handleSearchRequestDownload'
      );
      productV4Controller
        .handlePostProduct(stubData.request, stubData.response)
        .then(() => {
          assert(createProductSpy.calledOnce);
          done();
        })
        .catch(done)
        .finally(() => {
          createProductSpy.restore();
        });
    });
    it('should go for valid scenario when action is new-id', (done) => {
      stubData.request.body = {
        action: 'new-id',
        apiVersion: '4.0.1'
      };
      const getNewIdSpy = sinon.spy(productV4Controller, 'getNewId');
      productV4Controller
        .handlePostProduct(stubData.request, stubData.response)
        .then(() => {
          assert(getNewIdSpy.calledOnce);
          done();
        })
        .catch(done)
        .finally(() => {
          getNewIdSpy.restore();
        });
    });
    it('should go for valid scenario when action is parseQuery', (done) => {
      stubData.request.body = {
        action: 'parseQuery',
        apiVersion: '4.0.1'
      };
      const searchProductsSpy = sinon.spy(
        searchV4Controller,
        'parseSearchQuery'
      );
      productV4Controller
        .handlePostProduct(stubData.request, stubData.response)
        .then(() => {
          assert(searchProductsSpy.calledOnce);
          done();
        })
        .catch(done)
        .finally(() => {
          searchProductsSpy.restore();
        });
    });
    it('should go for valid scenario when action is query', (done) => {
      stubData.request.body = {
        action: 'query',
        apiVersion: '4.0.1'
      };
      const searchProductsSpy = sinon.spy(searchV4Controller, 'searchProducts');
      productV4Controller
        .handlePostProduct(stubData.request, stubData.response)
        .then(() => {
          assert(searchProductsSpy.calledOnce);
          done();
        })
        .catch(done)
        .finally(() => {
          searchProductsSpy.restore();
        });
    });
    it('should go for valid scenario when action is validate', (done) => {
      stubData.request.body = {
        action: 'validate',
        apiVersion: '4.0.1'
      };
      const validateProductsSpy = sinon.spy(
        productV4Controller,
        'validateProducts'
      );
      productV4Controller
        .handlePostProduct(stubData.request, stubData.response)
        .then(() => {
          assert(validateProductsSpy.calledOnce);
          done();
        })
        .catch(done)
        .finally(() => {
          validateProductsSpy.restore();
        });
    });
    it('should go for valid scenario when action is count', (done) => {
      stubData.request.body = {
        action: 'count',
        apiVersion: '4.0.1'
      };
      const searchProductsSpy = sinon.spy(
        searchV4Controller,
        'getSearchMetadata'
      );
      productV4Controller
        .handlePostProduct(stubData.request, stubData.response)
        .then(() => {
          assert(searchProductsSpy.calledOnce);
          done();
        })
        .catch(done)
        .finally(() => {
          searchProductsSpy.restore();
        });
    });
    it('should go for valid scenario when action is fetchVariants', (done) => {
      stubData.request.body = {
        action: 'fetchVariants',
        apiVersion: '4.0.1'
      };
      const titleControllerSpy = sinon.spy(
        titleController,
        'getProductVariantsByIds'
      );
      productV4Controller
        .handlePostProduct(stubData.request, stubData.response)
        .then(() => {
          assert(titleControllerSpy.calledOnce);
          done();
        })
        .catch(done)
        .finally(() => {
          titleControllerSpy.restore();
        });
    });
    it('should throw error when action is not valid', (done) => {
      stubData.request.body = {
        action: 'invalid-action',
        apiVersion: '4.0.1'
      };
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: `Invalid action: ${stubData.request.body.action}`,
            transactionId: undefined
          }
        });
      productV4Controller
        .handlePostProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
        });
    });
  });
  describe('handlePostProductInternal', () => {
    it('should go for valid scenario when action is save', (done) => {
      stubData.request.body = {
        action: 'save',
        apiVersion: '4.0.1'
      };
      const createProductSpy = sinon.spy(
        productV4Controller,
        'handleCreateProductInternal'
      );
      productV4Controller
        .handlePostProductInternal(stubData.request, stubData.response)
        .then(() => {
          assert(createProductSpy.calledOnce);
          done();
        })
        .catch(done)
        .finally(() => {
          createProductSpy.restore();
        });
    });
    it('should throw error when action is not valid', (done) => {
      stubData.request.body = {
        action: 'invalid-action',
        apiVersion: '4.0.1'
      };
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: `Invalid action: ${stubData.request.body.action}`,
            transactionId: undefined
          }
        });
      productV4Controller
        .handlePostProductInternal(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
        });
    });
  });
  describe('validateProducts', () => {
    it('should throw error when invalid rulesList is sent in request', (done) => {
      const reqBody = stubData.request.body;
      const invalidRulesList = [
        {
          attributes: [],
          rules: [
            {
              position: 1,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 2,
              rule: {
                attribute: '_id',
                relationship: 'EQ',
                value: '12345'
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        }
      ];
      stubData.request.body = {
        ...reqBody,
        rulesList: invalidRulesList
      };
      const validateValidationApiSpy = sinon.spy(
        validateAPIValidator,
        'validateValidationApi'
      );
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: `Invalid Input: rules are not in proper order`,
            transactionId: undefined
          }
        });
      stubData.searchV4ServiceMock.expects('searchProducts').never();
      productV4Controller
        .validateProducts(stubData.request, stubData.response)
        .then(() => {
          expect(validateValidationApiSpy.calledOnce).to.equal(true);
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          validateValidationApiSpy.restore();
          stubData.responseMock.restore();
          stubData.searchV4ServiceMock.restore();
        });
    });
    it(`should return the list of valid products without counts satisfying the rule
      with availability info`, (done) => {
      const request = stubData.request;
      const searchServiceResponse = stubData.searchServiceResponse;
      request.body.hasCounts = false;
      searchServiceResponse.counts = null;
      const response = {
        data: searchServiceResponse.products,
        metadata: {
          counts: searchServiceResponse.counts,
          transactionId: undefined
        }
      };
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(response);
      stubData.validateAPIValidatorMock
        .expects('validateValidationApi')
        .once()
        .withArgs(request)
        .returns(true);
      stubData.searchV4ServiceMock
        .expects('searchProducts')
        .once()
        .withArgs({
          availabilityName: request.body.availability.name,
          hasCounts: request.body.hasCounts,
          productType: 'book',
          searchQueryParserResult: stubData.searchQueryParserResult
        })
        .resolves(searchServiceResponse);
      productV4Controller
        .validateProducts(request, stubData.response)
        .then(() => {
          stubData.validateAPIValidatorMock.verify();
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.validateAPIValidatorMock.restore();
          stubData.searchV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it(`should return the list of valid products with counts satisfying the rule
      with availability info`, (done) => {
      const request = stubData.request;
      const response = {
        data: stubData.searchServiceResponse.products,
        metadata: {
          counts: stubData.searchServiceResponse.counts,
          transactionId: undefined
        }
      };
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(response);
      stubData.validateAPIValidatorMock
        .expects('validateValidationApi')
        .once()
        .withArgs(request)
        .returns(true);
      stubData.searchV4ServiceMock
        .expects('searchProducts')
        .once()
        .withArgs({
          availabilityName: request.body.availability.name,
          hasCounts: request.body.hasCounts,
          productType: 'book',
          searchQueryParserResult: stubData.searchQueryParserResult
        })
        .resolves(stubData.searchServiceResponse);
      productV4Controller
        .validateProducts(request, stubData.response)
        .then(() => {
          stubData.validateAPIValidatorMock.verify();
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.validateAPIValidatorMock.restore();
          stubData.searchV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it(`should return only projected identifiers e.g identifiers.dacKey`, (done) => {
      const request = stubData.request;
      const searchServiceResponse = stubData.searchServiceResponse;
      const searchQueryParserResult = stubData.searchQueryParserResult;
      request.body.hasCounts = false;
      request.body.rulesList[0].attributes = ['title', 'identifiers.dacKey'];
      searchServiceResponse.counts = null;
      searchServiceResponse.products[0].product.identifiers['dacKey'] =
        'some-dacKey';
      searchQueryParserResult[0].attributes = [
        'title',
        'identifiers.dacKey',
        'identifiers.isbn',
        'identifiers.doi'
      ];
      const response = {
        data: searchServiceResponse.products,
        metadata: {
          counts: searchServiceResponse.counts,
          transactionId: undefined
        }
      };
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(response);
      stubData.validateAPIValidatorMock
        .expects('validateValidationApi')
        .once()
        .withArgs(request)
        .returns(true);
      stubData.searchV4ServiceMock
        .expects('searchProducts')
        .once()
        .withArgs({
          availabilityName: request.body.availability.name,
          hasCounts: request.body.hasCounts,
          productType: 'book',
          searchQueryParserResult
        })
        .resolves(searchServiceResponse);
      productV4Controller
        .validateProducts(request, stubData.response)
        .then(() => {
          stubData.validateAPIValidatorMock.verify();
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.validateAPIValidatorMock.restore();
          stubData.searchV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it(`should return the list of valid products when _id is passed`, (done) => {
      const request = stubData.request;
      request.body.hasCounts = false;
      request.body.rulesList[0].attributes = ['title', 'identifiers.doi'];
      request.body.rulesList[0].rules[1].rule = {
        attribute: '_id',
        relationship: 'IN',
        values: ['some-id']
      };
      const searchQueryParserResult = [
        {
          attributes: ['title', 'identifiers.doi', 'identifiers.isbn'],
          rules: {
            _id: {
              $in: ['some-id']
            }
          },
          type: 'book'
        }
      ];
      const searchServiceResponse = {
        counts: null,
        products: [
          {
            availability: [
              {
                errors: ['NO_CONTENT'],
                name: 'some-channel',
                status: []
              }
            ],
            product: {
              _id: 'some-id',
              identifiers: {
                doi: 'some-doi',
                isbn: 'some-isbn'
              },
              title: 'some-title'
            }
          }
        ]
      };
      const response = {
        data: searchServiceResponse.products,
        metadata: {
          counts: searchServiceResponse.counts,
          transactionId: undefined
        }
      };
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(response);
      stubData.validateAPIValidatorMock
        .expects('validateValidationApi')
        .once()
        .withArgs(request)
        .returns(true);
      stubData.searchV4ServiceMock
        .expects('searchProducts')
        .once()
        .withArgs({
          availabilityName: request.body.availability.name,
          hasCounts: request.body.hasCounts,
          productType: 'book',
          searchQueryParserResult
        })
        .resolves(searchServiceResponse);
      productV4Controller
        .validateProducts(request, stubData.response)
        .then(() => {
          stubData.validateAPIValidatorMock.verify();
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.validateAPIValidatorMock.restore();
          stubData.searchV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it(`should return the list of Invalid products when _id is passed`, (done) => {
      const request = stubData.request;
      request.body.hasCounts = false;
      request.body.rulesList[0].attributes = ['title', 'identifiers.doi'];
      request.body.rulesList[0].rules[1].rule = {
        attribute: '_id',
        relationship: 'IN',
        values: ['some-id']
      };
      const searchQueryParserResult = [
        {
          attributes: ['title', 'identifiers.doi', 'identifiers.isbn'],
          rules: {
            _id: {
              $in: ['some-id']
            }
          },
          type: 'book'
        }
      ];
      const searchServiceResponse = {
        counts: null,
        products: []
      };
      const response = {
        data: searchServiceResponse.products,
        metadata: {
          counts: searchServiceResponse.counts,
          transactionId: undefined
        }
      };
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(response);
      stubData.validateAPIValidatorMock
        .expects('validateValidationApi')
        .once()
        .withArgs(request)
        .returns(true);
      stubData.searchV4ServiceMock
        .expects('searchProducts')
        .once()
        .withArgs({
          availabilityName: request.body.availability.name,
          hasCounts: request.body.hasCounts,
          productType: 'book',
          searchQueryParserResult
        })
        .resolves(searchServiceResponse);
      productV4Controller
        .validateProducts(request, stubData.response)
        .then(() => {
          stubData.validateAPIValidatorMock.verify();
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.validateAPIValidatorMock.restore();
          stubData.searchV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it(`should return the list of valid products when identifiers.doi is passed`, (done) => {
      const request = stubData.request;
      request.body.hasCounts = false;
      request.body.rulesList[0].attributes = ['title', 'identifiers.doi'];
      request.body.rulesList[0].rules[1].rule = {
        attribute: 'identifiers.doi',
        relationship: 'IN',
        values: ['some-doi']
      };
      const searchQueryParserResult = [
        {
          attributes: ['title', 'identifiers.doi', 'identifiers.isbn'],
          rules: {
            'identifiers.doi': {
              $in: ['some-doi']
            }
          },
          type: 'book'
        }
      ];
      const searchServiceResponse = {
        counts: null,
        products: [
          {
            availability: [
              {
                errors: ['NO_CONTENT'],
                name: 'some-channel',
                status: []
              }
            ],
            product: {
              _id: 'some-uuid',
              identifiers: {
                doi: 'some-doi',
                isbn: 'some-isbn'
              },
              title: 'some-title'
            }
          }
        ]
      };
      const response = {
        data: searchServiceResponse.products,
        metadata: {
          counts: searchServiceResponse.counts,
          transactionId: undefined
        }
      };
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(response);
      stubData.validateAPIValidatorMock
        .expects('validateValidationApi')
        .once()
        .withArgs(request)
        .returns(true);
      stubData.searchV4ServiceMock
        .expects('searchProducts')
        .once()
        .withArgs({
          availabilityName: request.body.availability.name,
          hasCounts: request.body.hasCounts,
          productType: 'book',
          searchQueryParserResult
        })
        .resolves(searchServiceResponse);
      productV4Controller
        .validateProducts(request, stubData.response)
        .then(() => {
          stubData.validateAPIValidatorMock.verify();
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.validateAPIValidatorMock.restore();
          stubData.searchV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it(`should return the list of valid products when identifiers.doi passed match with multiple
        products identifiers.doi`, (done) => {
      const request = stubData.request;
      request.body.hasCounts = false;
      request.body.rulesList[0].attributes = ['title', 'identifiers.doi'];
      request.body.rulesList[0].rules[1].rule = {
        attribute: 'identifiers.doi',
        relationship: 'IN',
        values: ['some-doi']
      };
      const searchQueryParserResult = [
        {
          attributes: ['title', 'identifiers.doi', 'identifiers.isbn'],
          rules: {
            'identifiers.doi': {
              $in: ['some-doi']
            }
          },
          type: 'book'
        }
      ];
      const searchServiceResponse = {
        counts: null,
        products: [
          {
            availability: [
              {
                errors: ['NO_CONTENT'],
                name: 'some-channel',
                status: []
              }
            ],
            product: {
              _id: 'some-uuid',
              identifiers: {
                doi: 'some-doi',
                isbn: 'some-isbn'
              },
              title: 'some-title'
            }
          },
          {
            availability: [
              {
                errors: ['NO_CONTENT'],
                name: 'some-channel',
                status: []
              }
            ],
            product: {
              _id: 'some-uuid2',
              identifiers: {
                doi: 'some-doi',
                isbn: 'some-isbn'
              },
              title: 'some-title'
            }
          }
        ]
      };
      const response = {
        data: searchServiceResponse.products,
        metadata: {
          counts: searchServiceResponse.counts,
          transactionId: undefined
        }
      };
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(response);
      stubData.validateAPIValidatorMock
        .expects('validateValidationApi')
        .once()
        .withArgs(request)
        .returns(true);
      stubData.searchV4ServiceMock
        .expects('searchProducts')
        .once()
        .withArgs({
          availabilityName: request.body.availability.name,
          hasCounts: request.body.hasCounts,
          productType: 'book',
          searchQueryParserResult
        })
        .resolves(searchServiceResponse);
      productV4Controller
        .validateProducts(request, stubData.response)
        .then(() => {
          stubData.validateAPIValidatorMock.verify();
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.validateAPIValidatorMock.restore();
          stubData.searchV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it(`should return all identifiers when identifiers and 'identifiers.isbn' is passed
      in projection`, (done) => {
      const request = stubData.request;
      const searchQueryParserResult = stubData.searchQueryParserResult;
      request.body.hasCounts = false;
      request.body.rulesList[0].attributes = [
        'title',
        'identifiers',
        'identifiers.isbn'
      ];
      const searchServiceResponse = {
        counts: null,
        products: [
          {
            availability: [
              {
                errors: ['NO_CONTENT'],
                name: 'some-channel',
                status: []
              }
            ],
            product: {
              _id: 'some-uuid',
              identifiers: {
                dacKey: 'C2014-0-37721-3',
                doi: '10.1201/9780429194702',
                editionId: '742027',
                isbn: 'some-isbn',
                orderNumber: 'KE87694',
                sku: null,
                titleId: '257227'
              },
              title: 'some-title'
            }
          }
        ]
      };
      searchQueryParserResult[0].attributes = ['title', 'identifiers'];
      const response = {
        data: searchServiceResponse.products,
        metadata: {
          counts: searchServiceResponse.counts,
          transactionId: undefined
        }
      };
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(response);
      stubData.validateAPIValidatorMock
        .expects('validateValidationApi')
        .once()
        .withArgs(request)
        .returns(true);
      stubData.searchV4ServiceMock
        .expects('searchProducts')
        .once()
        .withArgs({
          availabilityName: request.body.availability.name,
          hasCounts: request.body.hasCounts,
          productType: 'book',
          searchQueryParserResult
        })
        .resolves(searchServiceResponse);
      productV4Controller
        .validateProducts(request, stubData.response)
        .then(() => {
          stubData.validateAPIValidatorMock.verify();
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.validateAPIValidatorMock.restore();
          stubData.searchV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it(`should return all identifiers when only identifiers is projected`, (done) => {
      const request = stubData.request;
      const searchQueryParserResult = stubData.searchQueryParserResult;
      request.body.hasCounts = false;
      request.body.rulesList[0].attributes = ['title', 'identifiers'];
      const searchServiceResponse = {
        counts: null,
        products: [
          {
            availability: [
              {
                errors: ['NO_CONTENT'],
                name: 'some-channel',
                status: []
              }
            ],
            product: {
              _id: 'some-uuid',
              identifiers: {
                dacKey: 'C2014-0-37721-3',
                doi: '10.1201/9780429194702',
                editionId: '742027',
                isbn: 'some-isbn',
                orderNumber: 'KE87694',
                sku: null,
                titleId: '257227'
              },
              title: 'some-title'
            }
          }
        ]
      };
      searchQueryParserResult[0].attributes = ['title', 'identifiers'];
      const response = {
        data: searchServiceResponse.products,
        metadata: {
          counts: searchServiceResponse.counts,
          transactionId: undefined
        }
      };
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(response);
      stubData.validateAPIValidatorMock
        .expects('validateValidationApi')
        .once()
        .withArgs(request)
        .returns(true);
      stubData.searchV4ServiceMock
        .expects('searchProducts')
        .once()
        .withArgs({
          availabilityName: request.body.availability.name,
          hasCounts: request.body.hasCounts,
          productType: 'book',
          searchQueryParserResult
        })
        .resolves(searchServiceResponse);
      productV4Controller
        .validateProducts(request, stubData.response)
        .then(() => {
          stubData.validateAPIValidatorMock.verify();
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.validateAPIValidatorMock.restore();
          stubData.searchV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it(`should return the list of valid & invalid products without counts satisfying the rule
      with availability info`, (done) => {
      const request = stubData.request;
      const searchServiceResponse = stubData.searchServiceResponse;
      request.body.hasCounts = false;
      request.body.rulesList[0].rules[1].rule.values = [
        'some-isbn',
        'some-isbn1',
        'some-isbn2'
      ];
      const searchQueryParserResult = stubData.searchQueryParserResult;
      searchQueryParserResult[0].rules = {
        'identifiers.isbn': {
          $in: ['some-isbn', 'some-isbn1', 'some-isbn2']
        }
      };
      searchServiceResponse.counts = null;
      const response = {
        data: searchServiceResponse.products,
        metadata: {
          counts: searchServiceResponse.counts,
          transactionId: undefined
        }
      };
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(response);
      stubData.validateAPIValidatorMock
        .expects('validateValidationApi')
        .once()
        .withArgs(request)
        .returns(true);
      stubData.searchV4ServiceMock
        .expects('searchProducts')
        .once()
        .withArgs({
          availabilityName: request.body.availability.name,
          hasCounts: request.body.hasCounts,
          productType: 'book',
          searchQueryParserResult
        })
        .resolves(searchServiceResponse);
      productV4Controller
        .validateProducts(request, stubData.response)
        .then(() => {
          stubData.validateAPIValidatorMock.verify();
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.validateAPIValidatorMock.restore();
          stubData.searchV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it(`should return the list of valid & invalid products without counts satisfying the rule
      with availability info and relationship is EQ`, (done) => {
      const request = stubData.request;
      const searchServiceResponse = stubData.searchServiceResponse;
      request.body.hasCounts = false;
      request.body.rulesList[0].rules[1].rule = {
        attribute: 'identifiers.isbn',
        relationship: 'EQ',
        value: 'some-isbn'
      };
      const searchQueryParserResult = stubData.searchQueryParserResult;
      searchQueryParserResult[0].rules = {
        'identifiers.isbn': { $eq: 'some-isbn' } as any
      };
      searchServiceResponse.counts = null;
      const response = {
        data: searchServiceResponse.products,
        metadata: {
          counts: searchServiceResponse.counts,
          transactionId: undefined
        }
      };
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(response);
      stubData.validateAPIValidatorMock
        .expects('validateValidationApi')
        .once()
        .withArgs(request)
        .returns(true);
      stubData.searchV4ServiceMock
        .expects('searchProducts')
        .once()
        .withArgs({
          availabilityName: request.body.availability.name,
          hasCounts: request.body.hasCounts,
          productType: 'book',
          searchQueryParserResult
        })
        .resolves(searchServiceResponse);
      productV4Controller
        .validateProducts(request, stubData.response)
        .then(() => {
          stubData.validateAPIValidatorMock.verify();
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.validateAPIValidatorMock.restore();
          stubData.searchV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it(`should find the qualifiedIdentifer which has max length when all criteria has IN`, (done) => {
      const request = stubData.request;
      const searchServiceResponse = stubData.searchServiceResponse;
      request.body.hasCounts = false;
      request.body.rulesList[0].rules = [
        {
          position: 1,
          rule: {
            value: 'BEGIN'
          },
          type: 'separator'
        },
        {
          position: 4,
          rule: {
            attribute: 'identifiers.doi',
            relationship: 'IN',
            values: ['some-doi']
          },
          type: 'criteria'
        },
        {
          position: 1,
          rule: {
            value: 'AND'
          },
          type: 'logical'
        },
        {
          position: 4,
          rule: {
            attribute: 'identifiers.isbn',
            relationship: 'IN',
            values: ['some-isbn', 'some-isbn1', 'some-isbn2']
          },
          type: 'criteria'
        },
        {
          position: 5,
          rule: {
            value: 'END'
          },
          type: 'separator'
        }
      ];
      const searchQueryParserResult = stubData.searchQueryParserResult;
      searchQueryParserResult[0].rules = {
        $and: [
          {
            'identifiers.doi': {
              $in: ['some-doi']
            }
          },
          {
            'identifiers.isbn': {
              $in: ['some-isbn', 'some-isbn1', 'some-isbn2']
            }
          }
        ]
      } as any;
      searchServiceResponse.counts = null;
      const response = {
        data: searchServiceResponse.products,
        metadata: {
          counts: searchServiceResponse.counts,
          transactionId: undefined
        }
      };
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(response);
      stubData.validateAPIValidatorMock
        .expects('validateValidationApi')
        .once()
        .withArgs(request)
        .returns(true);
      stubData.searchV4ServiceMock
        .expects('searchProducts')
        .once()
        .withArgs({
          availabilityName: request.body.availability.name,
          hasCounts: request.body.hasCounts,
          productType: 'book',
          searchQueryParserResult
        })
        .resolves(searchServiceResponse);
      productV4Controller
        .validateProducts(request, stubData.response)
        .then(() => {
          stubData.validateAPIValidatorMock.verify();
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.validateAPIValidatorMock.restore();
          stubData.searchV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it(`should use qualifiedIdentifer from criteria which has IN
          when one has EQ and other has IN`, (done) => {
      const request = stubData.request;
      const searchServiceResponse = stubData.searchServiceResponse;
      request.body.hasCounts = false;
      request.body.rulesList[0].rules = [
        {
          position: 1,
          rule: {
            value: 'BEGIN'
          },
          type: 'separator'
        },
        {
          position: 4,
          rule: {
            attribute: 'identifiers.doi',
            relationship: 'EQ',
            value: 'some-doi'
          },
          type: 'criteria'
        },
        {
          position: 1,
          rule: {
            value: 'AND'
          },
          type: 'logical'
        },
        {
          position: 4,
          rule: {
            attribute: 'identifiers.isbn',
            relationship: 'IN',
            values: ['some-isbn', 'some-isbn1', 'some-isbn2']
          },
          type: 'criteria'
        },
        {
          position: 5,
          rule: {
            value: 'END'
          },
          type: 'separator'
        }
      ];
      const searchQueryParserResult = stubData.searchQueryParserResult;
      searchQueryParserResult[0].rules = {
        $and: [
          {
            'identifiers.doi': {
              $eq: 'some-doi'
            }
          },
          {
            'identifiers.isbn': {
              $in: ['some-isbn', 'some-isbn1', 'some-isbn2']
            }
          }
        ]
      } as any;
      searchServiceResponse.counts = null;
      const response = {
        data: searchServiceResponse.products,
        metadata: {
          counts: searchServiceResponse.counts,
          transactionId: undefined
        }
      };
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(response);
      stubData.validateAPIValidatorMock
        .expects('validateValidationApi')
        .once()
        .withArgs(request)
        .returns(true);
      stubData.searchV4ServiceMock
        .expects('searchProducts')
        .once()
        .withArgs({
          availabilityName: request.body.availability.name,
          hasCounts: request.body.hasCounts,
          productType: 'book',
          searchQueryParserResult
        })
        .resolves(searchServiceResponse);
      productV4Controller
        .validateProducts(request, stubData.response)
        .then(() => {
          stubData.validateAPIValidatorMock.verify();
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.validateAPIValidatorMock.restore();
          stubData.searchV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
  });

  describe('handleCreateProductById', () => {
    const testScenarios = [
      {
        controller: publishingServiceController,
        method: 'createPublishingService',
        productType: 'publishingService'
      }
    ];
    testScenarios.forEach((s) => {
      it(`should handle ${s.productType} create request and delegate to corresponding handler`, (done) => {
        stubData.request.params = { identifier: 'some-id' };
        stubData.request.body = {
          apiVersion: '4.0.1',
          product: {
            type: s.productType
          }
        };
        const updateMethodStub = sinon
          .stub(s.controller, s.method)
          .resolves('success');
        pV4Controller
          .handleCreateProductById(stubData.request, stubData.response)
          .then(() => {
            assert(updateMethodStub.calledOnce);
            done();
          })
          .catch(done)
          .finally(() => {
            updateMethodStub.restore();
          });
      });
    });
    // Test for all these product types
    [
      'collection',
      'journal',
      'book',
      'chapter',
      'invalid-type',
      'set',
      'series',
      'creativeWork'
    ].forEach((productType) => {
      it(`should throw error when the product type is not whitelisted`, (done) => {
        stubData.request.params = { identifier: 'some-id' };
        stubData.request.body = {
          apiVersion: '4.0.1',
          product: {
            _id: 'some-id',
            type: productType
          }
        };
        stubData.responseMock.expects('status').once().withArgs(400);
        stubData.responseMock
          .expects('json')
          .once()
          .withArgs({
            data: null,
            metadata: {
              error: undefined,
              message: `Invalid type: ${productType}`,
              transactionId: undefined
            }
          });
        productV4Controller
          .handleCreateProductById(stubData.request, stubData.response)
          .then(() => {
            stubData.responseMock.verify();
            done();
          })
          .catch((err) => {
            done(err);
          })
          .finally(() => {
            stubData.responseMock.restore();
          });
      });
    });
  });

  describe('handleUpdateProduct', () => {
    const testScenarios = [
      {
        controller: journalController,
        method: 'updateJournalProduct',
        productType: 'journal'
      },
      {
        controller: publishingServiceController,
        method: 'updatePublishingService',
        productType: 'publishingService'
      },
      {
        controller: pV4Controller,
        method: 'updateCollectionProduct',
        productType: 'collection'
      }
    ];
    testScenarios.forEach((s) => {
      it(`should handle ${s.productType} update request and delegate to corresponding handler`, (done) => {
        stubData.request.params = { identifier: 'some-id' };
        stubData.request.body = {
          apiVersion: '4.0.1',
          product: {
            _id: 'some-id',
            type: s.productType
          }
        };
        const updateMethodStub = sinon
          .stub(s.controller, s.method)
          .resolves('success');
        pV4Controller
          .handleUpdateProduct(stubData.request, stubData.response)
          .then(() => {
            assert(updateMethodStub.calledOnce);
            done();
          })
          .catch(done)
          .finally(() => {
            updateMethodStub.restore();
          });
      });
    });
    // Test for all these product types
    [
      'book',
      'chapter',
      'invalid-type',
      'set',
      'series',
      'creativeWork'
    ].forEach((productType) => {
      it(`should throw error when the product type is not whitelisted`, (done) => {
        stubData.request.params = { identifier: 'some-id' };
        stubData.request.body = {
          apiVersion: '4.0.1',
          product: {
            _id: 'some-id',
            type: productType
          }
        };
        stubData.responseMock.expects('status').once().withArgs(400);
        stubData.responseMock
          .expects('json')
          .once()
          .withArgs({
            data: null,
            metadata: {
              error: undefined,
              message: `Invalid type: ${productType}`,
              transactionId: undefined
            }
          });
        productV4Controller
          .handleUpdateProduct(stubData.request, stubData.response)
          .then(() => {
            stubData.responseMock.verify();
            done();
          })
          .catch((err) => {
            done(err);
          })
          .finally(() => {
            stubData.responseMock.restore();
          });
      });
    });
  });
  describe('handlePartialUpdateProduct', () => {
    const testScenarios = [
      {
        controller: pV4Controller,
        method: 'partialUpdateCollectionProduct'
      }
    ];
    testScenarios.forEach((s) => {
      it(`should handle collection update request and delegate to corresponding handler`, (done) => {
        stubData.request.params = { identifier: 'some-id' };
        stubData.request.body = {
          apiVersion: '4.0.1',
          data: [
            {
              op: 'replace',
              path: 'identifiers.sku',
              value: '001-555-5678'
            }
          ]
        };
        const updateMethodStub = sinon
          .stub(s.controller, s.method)
          .resolves('success');
        pV4Controller
          .handlePartialUpdateProduct(stubData.request, stubData.response)
          .then(() => {
            assert(updateMethodStub.calledOnce);
            done();
          })
          .catch(done)
          .finally(() => {
            updateMethodStub.restore();
          });
      });
      it(`should handle collection update request and throw an error and delegate to
        corresponding handler`, (done) => {
        stubData.request.params = { identifier: 'some-id' };
        stubData.request.body = {
          apiVersion: '4.0.1',
          data: null
        };
        stubData.responseMock.expects('status').once().withArgs(400);
        stubData.responseMock
          .expects('json')
          .once()
          .withArgs({
            data: null,
            metadata: {
              error: undefined,
              message: 'Missing product data in the request payload.',
              transactionId: undefined
            }
          });
        pV4Controller
          .handlePartialUpdateProduct(stubData.request, stubData.response)
          .then(() => {
            stubData.responseMock.verify();
            done();
          })
          .catch((err) => {
            done(err);
          })
          .finally(() => {
            stubData.responseMock.restore();
          });
      });
    });
  });
  describe.skip('handleUpdateProduct', () => {
    it('should return valid response when request body is valid product', (done) => {
      stubData.request.params = { identifier: 'some-id' };
      stubData.request.body = {
        action: 'save',
        apiVersion: '4.0.1',
        product: {
          _id: 'some-id',
          _schemaVersion: '4.0.1',
          _source: {
            source: 'SALESFORCE',
            type: 'product'
          },
          associatedMedia: [
            {
              _id: '0791debe-64bc-4c0b-aeee-df17e6c456d4',
              location: 'public http location',
              size: 3000,
              type: 'coverImage'
            }
          ],
          audience: [
            {
              code: 'RPG',
              description: 'Postgraduate'
            }
          ],
          categories: [
            {
              code: null,
              name: 'collection-type',
              type: 'netbase'
            },
            {
              code: null,
              name: 'collection-update-type',
              type: 'dynamic'
            }
          ],
          classifications: [
            {
              code: 'SCEC13',
              group: null,
              level: 2,
              name: 'Electrical & Electronic Engineering',
              priority: 1,
              type: 'subject'
            }
          ],
          collection: {
            abstracts: [
              {
                type: 'text',
                value: 'A Collection Abstract'
              }
            ],
            channels: [
              {
                name: 'UBX',
                type: 'delivery'
              },
              {
                name: 'GOBI',
                type: 'delivery'
              },
              {
                name: 'GOBI',
                type: 'sales'
              }
            ],
            customers: [
              {
                name: 'institution',
                type: 'customer'
              }
            ],
            description: '<P>Collection of chapters and articles for SDGO</P>',
            firstPublishedYear: 2019,
            licenses: [
              {
                name: 'perpetual',
                type: 'license'
              },
              {
                name: 'trial',
                type: 'license'
              }
            ],
            plannedPublicationDate: '2020-07-21T10:17:59.000Z',
            ruleUpdateEndDate: '2020-10-26T14:16:27.308Z',
            ruleUpdateStartDate: '2019-10-26T14:16:27.308Z',
            status: 'planned',
            subtitle: '',
            taxType: 'Q',
            totalCount: 10
          },
          contributors: [
            {
              affiliation: [],
              bio: null,
              collab: null,
              email: null,
              familyName: 'Romanets',
              fullName: 'Maryna Romanets',
              givenName: 'Maryna',
              orcid: null,
              position: 1,
              roles: ['collectionEditor']
            }
          ],
          discountGroups: [
            {
              code: 'W',
              description: 'W - USA ST Titles'
            }
          ],
          identifiers: {
            doi: '',
            sku: 'SFId'
          },
          keywords: [
            {
              name: 'women',
              position: 1,
              type: 'catchword',
              weightage: null
            }
          ],
          partsAdded: [
            {
              endDate: '2020-10-26T14:16:27.308Z',
              identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
              isFree: false,
              startDate: '2020-10-26T14:16:27.308Z',
              type: 'book'
            }
          ],
          partsRemoved: [
            {
              identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
              type: 'book'
            }
          ],
          partsUpdated: [
            {
              endDate: '2020-10-26T14:16:27.308Z',
              identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
              isFree: false,
              startDate: '2020-10-26T14:16:27.308Z',
              type: 'book'
            }
          ],
          permissions: [
            {
              code: 'IN',
              description: null,
              name: 'info-restrict',
              text: 'Restrict Information about Product - USE WITH CAUTION',
              type: 'access',
              validFrom: null,
              validTo: null
            },
            {
              code: 'EBRALL',
              description: null,
              name: 'EBRALL',
              text: 'Institutional, retail and Atypon',
              type: 'access',
              validFrom: null,
              validTo: null
            }
          ],
          prices: [
            {
              currency: 'GBP',
              price: 135.0,
              priceType: 'BYO Library Price',
              priceTypeCode: 'BYO',
              validFrom: '2019-12-09T00:00:00.000Z'
            }
          ],
          rights: [
            {
              area: [
                {
                  code: 'USKA',
                  name: ''
                },
                {
                  code: 'AMER',
                  name: ''
                },
                {
                  code: '20RW',
                  name: ''
                }
              ],
              category: 'exclusion',
              iso2: 'CA',
              iso3: 'CAN',
              isonum: '124',
              name: 'Canada',
              type: 'acquired'
            },
            {
              area: [
                {
                  code: 'USKA',
                  name: 'United States'
                },
                {
                  code: 'AMER',
                  name: 'United States'
                }
              ],
              category: 'exclusion',
              iso2: 'US',
              iso3: 'USA',
              isonum: '840',
              name: 'United States',
              type: 'acquired'
            }
          ],
          rulesList: [
            {
              rules: [
                {
                  position: 1,
                  rule: {
                    value: 'BEGIN'
                  },
                  type: 'separator'
                },
                {
                  position: 10,
                  rule: {
                    attribute: 'type',
                    relationship: 'EQ',
                    value: 'Book'
                  },
                  type: 'criteria'
                },
                {
                  position: 11,
                  rule: {
                    value: 'END'
                  },
                  type: 'separator'
                }
              ],
              rulesString: '',
              type: 'Book'
            }
          ],
          title: 'some random title',
          type: 'collection',
          version: '4.0.1'
        }
      };
      const reqBody = _.cloneDeep(stubData.request.body);
      const productData = reqBody.product;
      const productDataCopy = _.cloneDeep(productData);
      const productType = 'collection';
      const responseData = {
        _id: 'some-id',
        messages: [
          {
            code: 202,
            description:
              'Product data uploaded successfully, it will be processed and acknowledged soon.'
          }
        ],
        status: 'success'
      };
      const action = 'update';
      const parsedQueries = [
        {
          rules: [
            { position: 1, rule: { value: 'BEGIN' }, type: 'separator' },
            {
              position: 10,
              rule: { attribute: 'type', relationship: 'EQ', value: 'Book' },
              type: 'criteria'
            },
            { position: 11, rule: { value: 'END' }, type: 'separator' }
          ],
          rulesString: {
            $and: [
              {
                statusCode: { $in: ['LFB', 'VGR', 'IHST', 'WNN'] }
              },
              { type: { $eq: 'Book' } }
            ]
          },
          type: 'Book'
        }
      ];
      productDataCopy.rulesList.rule = parsedQueries;
      stubData.collectionValidatorMock
        .expects('validateCollection')
        .once()
        .withArgs(productData)
        .returns(true);
      stubData.assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(productData._id, ['_id'])
        .resolves({ _id: 'some-id' });
      stubData.productV4ServiceMock
        .expects('getProductByTitle')
        .once()
        .withArgs(productData.title, productType)
        .resolves({ _id: 'some-id' });
      stubData.productV4ServiceMock
        .expects('uploadProduct')
        .once()
        .withArgs(productData, action)
        .resolves({ _id: 'some-id' });
      stubData.responseMock.expects('status').once().withArgs(202);
      stubData.responseMock.expects('json').once().withArgs(responseData);
      productV4Controller
        .handleUpdateProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.collectionValidatorMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.collectionValidatorMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it('should return 400 error when product _id match with partId', (done) => {
      const uuid = '216fd5c8-906c-4c5a-ad71-3d391227e17f';
      stubData.request.params = { identifier: uuid };
      stubData.request.body = {
        action: 'save',
        product: {
          _id: uuid,
          collection: {
            status: 'planned'
          },
          identifiers: {
            doi: 'abc'
          },
          partsAdded: [
            {
              identifier: uuid,
              type: 'book'
            }
          ],
          ruleList: 'some-rule',
          title: 'Test creative work',
          type: 'collection'
        }
      };
      const responseData = {
        data: null,
        metadata: {
          _id: '216fd5c8-906c-4c5a-ad71-3d391227e17f',
          error: '',
          message: `${uuid} should not match with any of parts update/delete/added id in the request payload`,
          messages: '',
          transactionDate: '2021-01-18T09:01:15.627Z',
          transactionId: null,
          type: 'collection'
        }
      };
      stubData.assetV4ServiceMock.expects('getAssetById').never();
      stubData.productV4ServiceMock.expects('getProductByTitle').never();
      stubData.productV4ServiceMock.expects('uploadProduct').never();
      const isoDateMock = sinon
        .stub(Date.prototype, 'toISOString')
        .returns('2021-01-18T09:01:15.627Z');
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock.expects('json').once().withArgs(responseData);
      productV4Controller
        .handleUpdateProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.assetV4ServiceMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.assetV4ServiceMock.restore();
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
          isoDateMock.restore();
        });
    });
    it('should return 400 error when product type is not collection', (done) => {
      const uuid = '216fd5c8-906c-4c5a-ad71-3d391227e17f';
      stubData.request.params = { identifier: uuid };
      stubData.request.body = {
        action: 'save',
        product: {
          _id: uuid,
          collection: {
            status: 'planned'
          },
          identifiers: {
            doi: 'abc'
          },
          partsAdded: [
            {
              identifier: 'uuid-new',
              type: 'book'
            }
          ],
          ruleList: 'some-rule',
          title: 'Test creative work',
          type: 'book'
        }
      };
      stubData.assetV4ServiceMock.expects('getAssetById').never();
      stubData.productV4ServiceMock.expects('getProductByTitle').never();
      stubData.productV4ServiceMock.expects('uploadProduct').never();
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: { error: undefined, message: 'Invalid type: book' }
        });
      productV4Controller
        .handleUpdateProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.assetV4ServiceMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.assetV4ServiceMock.restore();
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it('should return 400 error when product data is missing', (done) => {
      const uuid = '216fd5c8-906c-4c5a-ad71-3d391227e17f';
      stubData.request.params = { identifier: uuid };
      stubData.request.body = {
        action: 'save'
      };
      stubData.assetV4ServiceMock.expects('getAssetById').never();
      stubData.productV4ServiceMock.expects('getProductByTitle').never();
      stubData.productV4ServiceMock.expects('uploadProduct').never();
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: '{}',
            message: 'Missing product data in the request payload.'
          }
        });
      productV4Controller
        .handleUpdateProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.assetV4ServiceMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.assetV4ServiceMock.restore();
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it('should return 400 error when product invalid json passed', (done) => {
      const uuid = '216fd5c8-906c-4c5a-ad71-3d391227e17f';
      stubData.request.params = { identifier: uuid };
      stubData.request.body = {
        action: 'save',
        product: {
          categories: [
            {
              name: 'collection-type',
              type: 'netbase'
            },
            {
              name: 'collection-update-type',
              type: 'static'
            }
          ],
          collection: {
            status: 'planned'
          },
          identifiers: {
            doi: 'abc'
          },
          isPartOf: [],
          partsAdded: [
            {
              identifier: 'some-id',
              type: 'book'
            }
          ],
          title: 'Test creative work',
          type: 'collection'
        }
      };
      const responseData = {
        data: null,
        metadata: {
          _id: '216fd5c8-906c-4c5a-ad71-3d391227e17f',
          error: '',
          message: 'Invalid property(s): isPartOf',
          messages: '',
          transactionDate: '2021-01-18T09:01:15.627Z',
          transactionId: null,
          type: 'collection'
        }
      };
      stubData.schemaValidatorMock.expects('validateInputCollection').never();
      stubData.assetV4ServiceMock.expects('getAssetById').never();
      stubData.productV4ServiceMock.expects('getProductByTitle').never();
      stubData.productV4ServiceMock.expects('uploadProduct').never();
      const isoDateMock = sinon
        .stub(Date.prototype, 'toISOString')
        .returns('2021-01-18T09:01:15.627Z');
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock.expects('json').once().withArgs(responseData);
      productV4Controller
        .handleUpdateProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.schemaValidatorMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.schemaValidatorMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
          isoDateMock.restore();
        });
    });
    it('should return 400 error when product did not exist with _id', (done) => {
      stubData.request.params = {
        identifier: '588475b5-3ae7-4bb9-9de3-cbcb54c3af92'
      };
      stubData.request.body = {
        action: 'save',
        apiVersion: '4.0.1',
        product: {
          _id: '588475b5-3ae7-4bb9-9de3-cbcb54c3af92',
          _schemaVersion: '4.0.1',
          _source: {
            source: 'SALESFORCE',
            type: 'product'
          },
          associatedMedia: [
            {
              location:
                'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/collection/some-collection-id/coverimage.jpg',
              type: 'coverimage'
            }
          ],
          audience: [
            {
              code: 'RPG',
              description: 'Postgraduate'
            }
          ],
          categories: [
            {
              code: null,
              name: 'collection-type',
              type: 'netbase'
            },
            {
              code: null,
              name: 'collection-update-type',
              type: 'dynamic'
            }
          ],
          classifications: [
            {
              code: 'SCEC13',
              group: null,
              level: 2,
              name: 'Electrical & Electronic Engineering',
              priority: 1,
              type: 'subject'
            }
          ],
          collection: {
            abstracts: [
              {
                type: 'text',
                value: 'A Collection Abstract'
              }
            ],
            channels: [
              {
                name: 'UBX',
                type: 'delivery'
              },
              {
                name: 'GOBI',
                type: 'delivery'
              },
              {
                name: 'GOBI',
                type: 'sales'
              }
            ],
            customers: [
              {
                name: 'institution',
                type: 'customer'
              }
            ],
            description: '<P>Collection of chapters and articles for SDGO</P>',
            firstPublishedYear: 2019,
            licenses: [
              {
                name: 'perpetual',
                type: 'license'
              },
              {
                name: 'trial',
                type: 'license'
              }
            ],
            plannedPublicationDate: '2020-07-21T10:17:59.000Z',
            ruleUpdateEndDate: '2020-10-26T14:16:27.308Z',
            ruleUpdateStartDate: '2019-10-26T14:16:27.308Z',
            status: 'planned',
            subtitle: '',
            totalCount: 10
          },
          contributors: [
            {
              bio: null,
              collab: null,
              email: null,
              familyName: 'Romanets',
              fullName: 'Maryna Romanets',
              givenName: 'Maryna',
              orcid: null,
              position: 1,
              roles: ['collectionEditor']
            }
          ],
          discountGroups: [
            {
              code: 'W',
              description: 'W - USA ST Titles'
            }
          ],
          identifiers: {
            doi: '',
            sku: 'SFId'
          },
          keywords: [
            {
              name: 'women',
              position: 1,
              type: 'catchword',
              weightage: null
            }
          ],
          partsAdded: [
            {
              endDate: '2020-10-26T14:16:27.308Z',
              identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
              isFree: false,
              startDate: '2020-10-26T14:16:27.308Z',
              type: 'book'
            }
          ],
          partsRemoved: [
            {
              identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
              type: 'book'
            }
          ],
          partsUpdated: [
            {
              endDate: '2020-10-26T14:16:27.308Z',
              identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
              isFree: false,
              startDate: '2020-10-26T14:16:27.308Z',
              type: 'book'
            }
          ],
          permissions: [
            {
              code: 'IN',
              description: null,
              name: 'info-restrict',
              text: 'Restrict Information about Product - USE WITH CAUTION',
              type: 'access',
              validFrom: null,
              validTo: null
            },
            {
              code: 'EBRALL',
              description: null,
              name: 'EBRALL',
              text: 'Institutional, retail and Atypon',
              type: 'access',
              validFrom: null,
              validTo: null
            }
          ],
          prices: [
            {
              currency: 'GBP',
              price: 135.0,
              priceType: 'BYO Library Price',
              priceTypeCode: 'BYO',
              validFrom: '2019-12-09T00:00:00.000Z'
            }
          ],
          rights: [
            {
              area: [
                {
                  code: 'USKA',
                  name: ''
                },
                {
                  code: 'AMER',
                  name: ''
                },
                {
                  code: '20RW',
                  name: ''
                }
              ],
              category: 'exclusion',
              iso2: 'CA',
              iso3: 'CAN',
              isonum: '124',
              name: 'Canada',
              type: 'acquired'
            },
            {
              area: [
                {
                  code: 'USKA',
                  name: 'United States'
                },
                {
                  code: 'AMER',
                  name: 'United States'
                }
              ],
              category: 'exclusion',
              iso2: 'US',
              iso3: 'USA',
              isonum: '840',
              name: 'United States',
              type: 'acquired'
            }
          ],
          ruleList: 'some-rule',
          rulesList: [
            {
              rules: [
                {
                  position: 1,
                  rule: {
                    value: 'BEGIN'
                  },
                  type: 'separator'
                },
                {
                  position: 10,
                  rule: {
                    attribute: 'type',
                    relationship: 'EQ',
                    value: 'Book'
                  },
                  type: 'criteria'
                },
                {
                  position: 11,
                  rule: {
                    value: 'END'
                  },
                  type: 'separator'
                }
              ],
              rulesString: '',
              type: 'Book'
            }
          ],
          title: 'sdgo goal 1',
          type: 'collection'
        }
      };
      const reqBody = _.cloneDeep(stubData.request.body);
      const productData = reqBody.product;
      const productType = 'collection';
      const responseData = {
        data: null,
        metadata: {
          _id: '588475b5-3ae7-4bb9-9de3-cbcb54c3af92',
          error: '',
          message:
            'A product must exists with _id 588475b5-3ae7-4bb9-9de3-cbcb54c3af92',
          messages: '',
          transactionDate: '2021-01-18T09:01:15.627Z',
          transactionId: null,
          type: productData.type
        }
      };
      stubData.schemaValidatorMock
        .expects('validateInputCollection')
        .once()
        .withArgs(productData)
        .resolves(true);
      stubData.assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(productData._id, ['_id'])
        .resolves(null);
      stubData.productV4ServiceMock
        .expects('getProductByTitle')
        .once()
        .withArgs(productData.title, productType)
        .resolves(null);
      stubData.productV4ServiceMock.expects('uploadProduct').never();
      const isoDateMock = sinon
        .stub(Date.prototype, 'toISOString')
        .returns('2021-01-18T09:01:15.627Z');
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock.expects('json').once().withArgs(responseData);
      productV4Controller
        .handleUpdateProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.schemaValidatorMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.schemaValidatorMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
          isoDateMock.restore();
        });
    });
    it('should return 400 error when product did not exist with collectionId', (done) => {
      stubData.request.params = {
        identifier: '588475b5-3ae7-4bb9-9de3-cbcb54c3af92'
      };
      stubData.request.body = {
        action: 'save',
        apiVersion: '4.0.1',
        product: {
          _id: '588475b5-3ae7-4bb9-9de3-cbcb54c3af92',
          _schemaVersion: '4.0.1',
          _source: {
            source: 'SALESFORCE',
            type: 'product'
          },
          associatedMedia: [
            {
              location:
                'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/collection/some-collection-id/coverimage.jpg',
              type: 'coverimage'
            }
          ],
          audience: [
            {
              code: 'RPG',
              description: 'Postgraduate'
            }
          ],
          categories: [
            {
              code: null,
              name: 'collection-type',
              type: 'netbase'
            },
            {
              code: null,
              name: 'collection-update-type',
              type: 'dynamic'
            }
          ],
          classifications: [
            {
              code: 'SCEC13',
              group: null,
              level: 2,
              name: 'Electrical & Electronic Engineering',
              priority: 1,
              type: 'subject'
            }
          ],
          collection: {
            abstracts: [
              {
                type: 'text',
                value: 'A Collection Abstract'
              }
            ],
            channels: [
              {
                name: 'UBX',
                type: 'delivery'
              },
              {
                name: 'GOBI',
                type: 'delivery'
              },
              {
                name: 'GOBI',
                type: 'sales'
              }
            ],
            customers: [
              {
                name: 'institution',
                type: 'customer'
              }
            ],
            description: '<P>Collection of chapters and articles for SDGO</P>',
            firstPublishedYear: 2019,
            licenses: [
              {
                name: 'perpetual',
                type: 'license'
              },
              {
                name: 'trial',
                type: 'license'
              }
            ],
            plannedPublicationDate: '2020-07-21T10:17:59.000Z',
            ruleUpdateEndDate: '2020-10-26T14:16:27.308Z',
            ruleUpdateStartDate: '2019-10-26T14:16:27.308Z',
            status: 'planned',
            subtitle: '',
            totalCount: 10
          },
          contributors: [
            {
              bio: null,
              collab: null,
              email: null,
              familyName: 'Romanets',
              fullName: 'Maryna Romanets',
              givenName: 'Maryna',
              orcid: null,
              position: 1,
              roles: ['collectionEditor']
            }
          ],
          discountGroups: [
            {
              code: 'W',
              description: 'W - USA ST Titles'
            }
          ],
          identifiers: {
            collectionId: 'some-collectionId',
            doi: '',
            sku: 'SFId'
          },
          keywords: [
            {
              name: 'women',
              position: 1,
              type: 'catchword',
              weightage: null
            }
          ],
          partsAdded: [
            {
              endDate: '2020-10-26T14:16:27.308Z',
              identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
              isFree: false,
              startDate: '2020-10-26T14:16:27.308Z',
              type: 'book'
            }
          ],
          partsRemoved: [
            {
              identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
              type: 'book'
            }
          ],
          partsUpdated: [
            {
              endDate: '2020-10-26T14:16:27.308Z',
              identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
              isFree: false,
              startDate: '2020-10-26T14:16:27.308Z',
              type: 'book'
            }
          ],
          permissions: [
            {
              code: 'IN',
              description: null,
              name: 'info-restrict',
              text: 'Restrict Information about Product - USE WITH CAUTION',
              type: 'access',
              validFrom: null,
              validTo: null
            },
            {
              code: 'EBRALL',
              description: null,
              name: 'EBRALL',
              text: 'Institutional, retail and Atypon',
              type: 'access',
              validFrom: null,
              validTo: null
            }
          ],
          prices: [
            {
              currency: 'GBP',
              price: 135.0,
              priceType: 'BYO Library Price',
              priceTypeCode: 'BYO',
              validFrom: '2019-12-09T00:00:00.000Z'
            }
          ],
          rights: [
            {
              area: [
                {
                  code: 'USKA',
                  name: ''
                },
                {
                  code: 'AMER',
                  name: ''
                },
                {
                  code: '20RW',
                  name: ''
                }
              ],
              category: 'exclusion',
              iso2: 'CA',
              iso3: 'CAN',
              isonum: '124',
              name: 'Canada',
              type: 'acquired'
            },
            {
              area: [
                {
                  code: 'USKA',
                  name: 'United States'
                },
                {
                  code: 'AMER',
                  name: 'United States'
                }
              ],
              category: 'exclusion',
              iso2: 'US',
              iso3: 'USA',
              isonum: '840',
              name: 'United States',
              type: 'acquired'
            }
          ],
          ruleList: 'some-rule',
          rulesList: [
            {
              rules: [
                {
                  position: 1,
                  rule: {
                    value: 'BEGIN'
                  },
                  type: 'separator'
                },
                {
                  position: 10,
                  rule: {
                    attribute: 'type',
                    relationship: 'EQ',
                    value: 'Book'
                  },
                  type: 'criteria'
                },
                {
                  position: 11,
                  rule: {
                    value: 'END'
                  },
                  type: 'separator'
                }
              ],
              rulesString: '',
              type: 'Book'
            }
          ],
          title: 'sdgo goal 1',
          type: 'collection'
        }
      };
      const reqBody = _.cloneDeep(stubData.request.body);
      const productData = reqBody.product;
      const productType = 'collection';
      const responseData = {
        data: null,
        metadata: {
          _id: '588475b5-3ae7-4bb9-9de3-cbcb54c3af92',
          error: '',
          message: 'A product must exists with collectionId some-collectionId',
          messages: '',
          transactionDate: '2021-01-18T09:01:15.627Z',
          transactionId: null,
          type: productData.type
        }
      };
      stubData.schemaValidatorMock
        .expects('validateInputCollection')
        .once()
        .withArgs(productData)
        .resolves(true);
      stubData.assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(productData._id, ['_id'])
        .resolves({ _id: 'some-id' });
      stubData.productV4ServiceMock
        .expects('getProductByTitle')
        .once()
        .withArgs(productData.title, productType)
        .resolves({ _id: 'some-id' });
      stubData.assetV4ServiceMock
        .expects('getProductByIdentifier')
        .once()
        .withArgs('collectionId', 'some-collectionId')
        .resolves(null);
      stubData.productV4ServiceMock.expects('uploadProduct').never();
      const isoDateMock = sinon
        .stub(Date.prototype, 'toISOString')
        .returns('2021-01-18T09:01:15.627Z');
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock.expects('json').once().withArgs(responseData);
      productV4Controller
        .handleUpdateProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.schemaValidatorMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.schemaValidatorMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
          isoDateMock.restore();
        });
    });
    it('should return 400 error when product did not exist with title', (done) => {
      stubData.request.params = {
        identifier: '588475b5-3ae7-4bb9-9de3-cbcb54c3af92'
      };
      stubData.request.body = {
        action: 'save',
        apiVersion: '4.0.1',
        product: {
          _id: '588475b5-3ae7-4bb9-9de3-cbcb54c3af92',
          _schemaVersion: '4.0.1',
          _source: {
            source: 'SALESFORCE',
            type: 'product'
          },
          associatedMedia: [
            {
              location:
                'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/collection/some-collection-id/coverimage.jpg',
              type: 'coverimage'
            }
          ],
          audience: [
            {
              code: 'RPG',
              description: 'Postgraduate'
            }
          ],
          categories: [
            {
              code: null,
              name: 'collection-type',
              type: 'netbase'
            },
            {
              code: null,
              name: 'collection-update-type',
              type: 'dynamic'
            }
          ],
          classifications: [
            {
              code: 'SCEC13',
              group: null,
              level: 2,
              name: 'Electrical & Electronic Engineering',
              priority: 1,
              type: 'subject'
            }
          ],
          collection: {
            abstracts: [
              {
                type: 'text',
                value: 'A Collection Abstract'
              }
            ],
            channels: [
              {
                name: 'UBX',
                type: 'delivery'
              },
              {
                name: 'GOBI',
                type: 'delivery'
              },
              {
                name: 'GOBI',
                type: 'sales'
              }
            ],
            customers: [
              {
                name: 'institution',
                type: 'customer'
              }
            ],
            description: '<P>Collection of chapters and articles for SDGO</P>',
            firstPublishedYear: 2019,
            licenses: [
              {
                name: 'perpetual',
                type: 'license'
              },
              {
                name: 'trial',
                type: 'license'
              }
            ],
            plannedPublicationDate: '2020-07-21T10:17:59.000Z',
            ruleUpdateEndDate: '2020-10-26T14:16:27.308Z',
            ruleUpdateStartDate: '2019-10-26T14:16:27.308Z',
            status: 'planned',
            subtitle: '',
            totalCount: 10
          },
          contributors: [
            {
              bio: null,
              collab: null,
              email: null,
              familyName: 'Romanets',
              fullName: 'Maryna Romanets',
              givenName: 'Maryna',
              orcid: null,
              position: 1,
              roles: ['collectionEditor']
            }
          ],
          discountGroups: [
            {
              code: 'W',
              description: 'W - USA ST Titles'
            }
          ],
          identifiers: {
            doi: '',
            sku: 'SFId'
          },
          keywords: [
            {
              name: 'women',
              position: 1,
              type: 'catchword',
              weightage: null
            }
          ],
          partsAdded: [
            {
              endDate: '2020-10-26T14:16:27.308Z',
              identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
              isFree: false,
              startDate: '2020-10-26T14:16:27.308Z',
              type: 'book'
            }
          ],
          partsRemoved: [
            {
              identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
              type: 'book'
            }
          ],
          partsUpdated: [
            {
              endDate: '2020-10-26T14:16:27.308Z',
              identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
              isFree: false,
              startDate: '2020-10-26T14:16:27.308Z',
              type: 'book'
            }
          ],
          permissions: [
            {
              code: 'IN',
              description: null,
              name: 'info-restrict',
              text: 'Restrict Information about Product - USE WITH CAUTION',
              type: 'access',
              validFrom: null,
              validTo: null
            },
            {
              code: 'EBRALL',
              description: null,
              name: 'EBRALL',
              text: 'Institutional, retail and Atypon',
              type: 'access',
              validFrom: null,
              validTo: null
            }
          ],
          prices: [
            {
              currency: 'GBP',
              price: 135.0,
              priceType: 'BYO Library Price',
              priceTypeCode: 'BYO',
              validFrom: '2019-12-09T00:00:00.000Z'
            }
          ],
          rights: [
            {
              area: [
                {
                  code: 'USKA',
                  name: ''
                },
                {
                  code: 'AMER',
                  name: ''
                },
                {
                  code: '20RW',
                  name: ''
                }
              ],
              category: 'exclusion',
              iso2: 'CA',
              iso3: 'CAN',
              isonum: '124',
              name: 'Canada',
              type: 'acquired'
            },
            {
              area: [
                {
                  code: 'USKA',
                  name: 'United States'
                },
                {
                  code: 'AMER',
                  name: 'United States'
                }
              ],
              category: 'exclusion',
              iso2: 'US',
              iso3: 'USA',
              isonum: '840',
              name: 'United States',
              type: 'acquired'
            }
          ],
          ruleList: 'some-rule',
          rulesList: [
            {
              rules: [
                {
                  position: 1,
                  rule: {
                    value: 'BEGIN'
                  },
                  type: 'separator'
                },
                {
                  position: 10,
                  rule: {
                    attribute: 'type',
                    relationship: 'EQ',
                    value: 'Book'
                  },
                  type: 'criteria'
                },
                {
                  position: 11,
                  rule: {
                    value: 'END'
                  },
                  type: 'separator'
                }
              ],
              rulesString: '',
              type: 'Book'
            }
          ],
          title: 'sdgo goal 1',
          type: 'collection'
        }
      };
      const reqBody = _.cloneDeep(stubData.request.body);
      const productData = reqBody.product;
      const productType = 'collection';
      const responseData = {
        data: null,
        metadata: {
          _id: '588475b5-3ae7-4bb9-9de3-cbcb54c3af92',
          error: '',
          message: 'A product must exists with title sdgo goal 1',
          messages: '',
          transactionDate: '2021-01-18T09:01:15.627Z',
          transactionId: null,
          type: productData.type
        }
      };
      stubData.schemaValidatorMock
        .expects('validateInputCollection')
        .once()
        .withArgs(productData)
        .resolves(true);
      stubData.assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(productData._id, ['_id'])
        .resolves({ _id: 'some-id' });
      stubData.productV4ServiceMock
        .expects('getProductByTitle')
        .once()
        .withArgs(productData.title, productType)
        .resolves(null);
      stubData.productV4ServiceMock.expects('uploadProduct').never();
      const isoDateMock = sinon
        .stub(Date.prototype, 'toISOString')
        .returns('2021-01-18T09:01:15.627Z');
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock.expects('json').once().withArgs(responseData);
      productV4Controller
        .handleUpdateProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.schemaValidatorMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.schemaValidatorMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
          isoDateMock.restore();
        });
    });
    it('should return 400 error when service method upload fails', (done) => {
      stubData.request.params = {
        identifier: '588475b5-3ae7-4bb9-9de3-cbcb54c3af92'
      };
      stubData.request.body = {
        action: 'save',
        apiVersion: '4.0.1',
        product: {
          _id: '588475b5-3ae7-4bb9-9de3-cbcb54c3af92',
          _schemaVersion: '4.0.1',
          _source: {
            source: 'SALESFORCE',
            type: 'product'
          },
          associatedMedia: [
            {
              location:
                'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/collection/some-collection-id/coverimage.jpg',
              type: 'coverimage'
            }
          ],
          audience: [
            {
              code: 'RPG',
              description: 'Postgraduate'
            }
          ],
          categories: [
            {
              code: null,
              name: 'collection-type',
              type: 'netbase'
            },
            {
              code: null,
              name: 'collection-update-type',
              type: 'dynamic'
            }
          ],
          classifications: [
            {
              code: 'SCEC13',
              group: null,
              level: 2,
              name: 'Electrical & Electronic Engineering',
              priority: 1,
              type: 'subject'
            }
          ],
          collection: {
            abstracts: [
              {
                type: 'text',
                value: 'A Collection Abstract'
              }
            ],
            channels: [
              {
                name: 'UBX',
                type: 'delivery'
              },
              {
                name: 'GOBI',
                type: 'delivery'
              },
              {
                name: 'GOBI',
                type: 'sales'
              }
            ],
            customers: [
              {
                name: 'institution',
                type: 'customer'
              }
            ],
            description: '<P>Collection of chapters and articles for SDGO</P>',
            firstPublishedYear: 2019,
            licenses: [
              {
                name: 'perpetual',
                type: 'license'
              },
              {
                name: 'trial',
                type: 'license'
              }
            ],
            plannedPublicationDate: '2020-07-21T10:17:59.000Z',
            ruleUpdateEndDate: '2020-10-26T14:16:27.308Z',
            ruleUpdateStartDate: '2019-10-26T14:16:27.308Z',
            status: 'planned',
            subtitle: '',
            totalCount: 10
          },
          contributors: [
            {
              bio: null,
              collab: null,
              email: null,
              familyName: 'Romanets',
              fullName: 'Maryna Romanets',
              givenName: 'Maryna',
              orcid: null,
              position: 1,
              roles: ['collectionEditor']
            }
          ],
          discountGroups: [
            {
              code: 'W',
              description: 'W - USA ST Titles'
            }
          ],
          identifiers: {
            doi: '',
            sku: 'SFId'
          },
          keywords: [
            {
              name: 'women',
              position: 1,
              type: 'catchword',
              weightage: null
            }
          ],
          partsAdded: [
            {
              endDate: '2020-10-26T14:16:27.308Z',
              identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
              isFree: false,
              startDate: '2020-10-26T14:16:27.308Z',
              type: 'book'
            }
          ],
          partsRemoved: [
            {
              identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
              type: 'book'
            }
          ],
          partsUpdated: [
            {
              endDate: '2020-10-26T14:16:27.308Z',
              identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
              isFree: false,
              startDate: '2020-10-26T14:16:27.308Z',
              type: 'book'
            }
          ],
          permissions: [
            {
              code: 'IN',
              description: null,
              name: 'info-restrict',
              text: 'Restrict Information about Product - USE WITH CAUTION',
              type: 'access',
              validFrom: null,
              validTo: null
            },
            {
              code: 'EBRALL',
              description: null,
              name: 'EBRALL',
              text: 'Institutional, retail and Atypon',
              type: 'access',
              validFrom: null,
              validTo: null
            }
          ],
          prices: [
            {
              currency: 'GBP',
              price: 135.0,
              priceType: 'BYO Library Price',
              priceTypeCode: 'BYO',
              validFrom: '2019-12-09T00:00:00.000Z'
            }
          ],
          rights: [
            {
              area: [
                {
                  code: 'USKA',
                  name: ''
                },
                {
                  code: 'AMER',
                  name: ''
                },
                {
                  code: '20RW',
                  name: ''
                }
              ],
              category: 'exclusion',
              iso2: 'CA',
              iso3: 'CAN',
              isonum: '124',
              name: 'Canada',
              type: 'acquired'
            },
            {
              area: [
                {
                  code: 'USKA',
                  name: 'United States'
                },
                {
                  code: 'AMER',
                  name: 'United States'
                }
              ],
              category: 'exclusion',
              iso2: 'US',
              iso3: 'USA',
              isonum: '840',
              name: 'United States',
              type: 'acquired'
            }
          ],
          ruleList: 'some-rule',
          rulesList: [
            {
              rules: [
                {
                  position: 1,
                  rule: {
                    value: 'BEGIN'
                  },
                  type: 'separator'
                },
                {
                  position: 10,
                  rule: {
                    attribute: 'type',
                    relationship: 'EQ',
                    value: 'Book'
                  },
                  type: 'criteria'
                },
                {
                  position: 11,
                  rule: {
                    value: 'END'
                  },
                  type: 'separator'
                }
              ],
              rulesString: '',
              type: 'Book'
            }
          ],
          title: 'sdgo goal 1',
          type: 'collection'
        }
      };
      const reqBody = _.cloneDeep(stubData.request.body);
      const productData = reqBody.product;
      const productType = 'collection';
      const validationErr = new AppError(`Error while uploading file`, 400);
      const responseData = {
        data: null,
        metadata: {
          _id: '588475b5-3ae7-4bb9-9de3-cbcb54c3af92',
          error: '',
          message: 'Error while uploading file',
          messages: '',
          transactionDate: '2021-01-18T09:01:15.627Z',
          transactionId: null,
          type: productData.type
        }
      };
      const action = 'update';
      stubData.schemaValidatorMock
        .expects('validateInputCollection')
        .once()
        .withArgs(productData)
        .resolves(true);
      stubData.assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(productData._id, ['_id'])
        .resolves({ _id: 'some-id' });
      stubData.productV4ServiceMock
        .expects('getProductByTitle')
        .once()
        .withArgs(productData.title, productType)
        .resolves({ _id: 'some-id' });
      stubData.productV4ServiceMock
        .expects('uploadProduct')
        .once()
        .withArgs(productData, action)
        .rejects(validationErr);
      const isoDateMock = sinon
        .stub(Date.prototype, 'toISOString')
        .returns('2021-01-18T09:01:15.627Z');
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock.expects('json').once().withArgs(responseData);
      productV4Controller
        .handleUpdateProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.schemaValidatorMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.schemaValidatorMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
          isoDateMock.restore();
        });
    });
  });
  describe('handleSearchRequestDownload', () => {
    let searchRequest;
    beforeEach(() => {
      searchRequest = {
        _id: 'UUID',
        action: 'download',
        apiVersion: '4.0.1',
        availability: {
          name: 'UBX',
          status: ['SELLABLE']
        },
        fileName: 'HSS-Frontlist-2020-10-22_16_48.csv',
        recipients: {
          cc: ['cc@abc.com'],
          to: ['test@xyz.com']
        },
        rulesList: [
          {
            attributes: ['title', 'identifiers.doi', 'contributors.fullName'],
            rules: [
              {
                position: 0,
                rule: {
                  value: 'BEGIN'
                },
                type: 'separator'
              },
              {
                position: 1,
                rule: {
                  attribute: 'book.publicationDate',
                  relationship: 'GT',
                  value: '2020-01-20T00:00:00.000Z'
                },
                type: 'criteria'
              },
              {
                position: 0,
                rule: {
                  value: 'END'
                },
                type: 'separator'
              }
            ],
            type: 'book'
          }
        ],
        rulesString: ''
      };
    });
    it('should return a valid response when the request body has a valid download request', (done) => {
      stubData.request.body = searchRequest;
      const successMetaData = {
        ...resJson.metadata,
        messages: [
          {
            code: 202,
            description:
              'Search query is accepted. and results will be sent over email(s) soon.'
          }
        ],
        transactionDate: '2021-01-18T09:01:15.627Z',
        transactionId: undefined,
        type: 'search result download'
      };
      const successJson = {};
      successJson['data'] = null;
      successJson['metadata'] = successMetaData;
      stubData.searchDownloadValidatorMock
        .expects('validateSearchDownloadRequest')
        .once()
        .withArgs(searchRequest)
        .returns(true);
      stubData.productV4ServiceMock
        .expects('getNewId')
        .once()
        .returns('some-id');
      stubData.productV4ServiceMock
        .expects('uploadSearchRequest')
        .once()
        .withArgs(searchRequest)
        .resolves({ _id: 'some-id' });
      stubData.productV4ServiceMock
        .expects('getTransactionId')
        .once()
        .returns('some-transaction-id');
      const isoDateMock = sinon
        .stub(Date.prototype, 'toISOString')
        .returns('2021-01-18T09:01:15.627Z');
      stubData.responseMock.expects('status').once().withArgs(202);
      stubData.responseMock.expects('json').once().withArgs(successJson);
      productV4Controller
        .handleSearchRequestDownload(stubData.request, stubData.response)
        .then(() => {
          stubData.searchDownloadValidatorMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.searchDownloadValidatorMock.restore();
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
          isoDateMock.restore();
        });
    });
    it('should return error when request is invalid', (done) => {
      stubData.request.body = searchRequest;
      stubData.request.body['recipients'] = null;
      const validationErr = new AppError('Validation error', 400, [
        {
          code: 400,
          dataPath: '',
          description: 'Missing field recipients in request payload'
        }
      ]);
      stubData.searchDownloadValidatorMock
        .expects('validateSearchDownloadRequest')
        .once()
        .withArgs(searchRequest)
        .throws(validationErr);
      stubData.productV4ServiceMock.expects('getNewId').never();
      stubData.productV4ServiceMock.expects('uploadSearchRequest').never();
      const isoDateMock = sinon
        .stub(Date.prototype, 'toISOString')
        .returns('2021-01-18T09:01:15.627Z');
      stubData.responseMock.expects('status').once().withArgs(400);
      const errMetaData = {
        ...resJson.metadata,
        message: 'Validation error',
        messages: [
          {
            code: 400,
            dataPath: '',
            description: 'Missing field recipients in request payload'
          }
        ],
        type: 'search result download'
      };
      const errJson = {};
      errJson['data'] = null;
      errJson['metadata'] = errMetaData;
      stubData.responseMock.expects('json').once().withArgs(errJson);
      productV4Controller
        .handleSearchRequestDownload(stubData.request, stubData.response)
        .then(() => {
          stubData.searchDownloadValidatorMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.searchDownloadValidatorMock.restore();
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
          isoDateMock.restore();
        });
    });
    it('should return error when search upload fails', (done) => {
      stubData.request.body = searchRequest;
      stubData.searchDownloadValidatorMock
        .expects('validateSearchDownloadRequest')
        .once()
        .withArgs(searchRequest)
        .returns(true);
      stubData.productV4ServiceMock
        .expects('getNewId')
        .once()
        .returns('some-id');
      const validationErr = new AppError('Error while sending message', 400);
      const parsedRequest = { ...searchRequest, _id: 'some-id' };
      stubData.productV4ServiceMock
        .expects('uploadSearchRequest')
        .once()
        .withArgs(parsedRequest)
        .rejects(validationErr);
      const isoDateMock = sinon
        .stub(Date.prototype, 'toISOString')
        .returns('2021-01-18T09:01:15.627Z');
      stubData.responseMock.expects('status').once().withArgs(400);
      const errMetaData = {
        ...resJson.metadata,
        message: 'Error while sending message',
        type: 'search result download'
      };
      const errJson = {};
      errJson['data'] = null;
      errJson['metadata'] = errMetaData;
      stubData.responseMock.expects('json').once().withArgs(errJson);
      productV4Controller
        .handleSearchRequestDownload(stubData.request, stubData.response)
        .then(() => {
          stubData.searchDownloadValidatorMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.searchDownloadValidatorMock.restore();
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
          isoDateMock.restore();
        });
    });
  });
  describe('getProductByIdentifier', () => {
    it('should return 404 when collection do not exist', (done) => {
      stubData.request.query.identifierName = 'collectionId';
      stubData.request.query.identifierValue = 'SDG-1234';
      stubData.assetV4ServiceMock
        .expects('getProductByIdentifier')
        .once()
        .withArgs(
          stubData.request.query.identifierName,
          stubData.request.query.identifierValue
        )
        .resolves(null);
      stubData.responseMock.expects('sendStatus').once().withArgs(404);
      productV4Controller
        .getProductByIdentifier(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.assetV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.assetV4ServiceMock.restore();
        });
    });
    it('should return 200 when collection exist', (done) => {
      stubData.request.query.identifierName = 'collectionId';
      stubData.request.query.identifierValue = 'SDG-1234';
      stubData.assetV4ServiceMock
        .expects('getProductByIdentifier')
        .once()
        .withArgs(
          stubData.request.query.identifierName,
          stubData.request.query.identifierValue
        )
        .resolves({ _id: 'some-id' });
      stubData.responseMock.expects('sendStatus').once().withArgs(200);
      productV4Controller
        .getProductByIdentifier(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.assetV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.assetV4ServiceMock.restore();
        });
    });
    it('should return 400 when identifierName is missing', (done) => {
      stubData.request.query.identifierName = null;
      stubData.request.query.identifierValue = null;
      stubData.responseMock.expects('sendStatus').once().withArgs(400);
      productV4Controller
        .getProductByIdentifier(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
        });
    });
    it('should return 400 when identifierName is incorrect', (done) => {
      stubData.request.query.identifierName = 'invalid-name';
      stubData.request.query.identifierValue = null;
      stubData.responseMock.expects('sendStatus').once().withArgs(400);
      productV4Controller
        .getProductByIdentifier(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
        });
    });
    it('should return 404 if product does not exist when type has been specified', (done) => {
      stubData.request.query.identifierName = 'title';
      stubData.request.query.identifierValue = 'some-invalid-title';
      stubData.request.query.type = 'book';
      stubData.productV4ServiceMock
        .expects('getProductByIdentifier')
        .once()
        .withArgs(
          stubData.request.query.identifierName,
          stubData.request.query.identifierValue,
          stubData.request.query.type
        )
        .resolves(null);
      stubData.responseMock.expects('sendStatus').once().withArgs(404);
      productV4Controller
        .getProductByIdentifier(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.productV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.productV4ServiceMock.restore();
        });
    });
    it('should return 200 if product exists when type has been specified', (done) => {
      stubData.request.query.identifierName = 'title';
      stubData.request.query.identifierValue = 'some-valid-title';
      stubData.request.query.type = 'book';
      stubData.productV4ServiceMock
        .expects('getProductByIdentifier')
        .once()
        .withArgs(
          stubData.request.query.identifierName,
          stubData.request.query.identifierValue,
          stubData.request.query.type
        )
        .resolves({ _id: 'some-id', type: 'book' });
      stubData.responseMock.expects('sendStatus').once().withArgs(200);
      productV4Controller
        .getProductByIdentifier(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.productV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.productV4ServiceMock.restore();
        });
    });
  });
  describe('handle oaUpdate', () => {
    it('should return 400 error when request is invalid', (done) => {
      stubData.request.body = {
        appName: 'invalid appName',
        callBackurl: 'http://some_valid_url.com/',
        requestId: null
      };
      stubData.request.params = { id: 'some-valid-id' };
      const validationErrors = [
        {
          code: '',
          dataPath: '',
          discription: 'invalid appName'
        },
        {
          code: '',
          dataPath: '',
          discription: 'invalid requestId'
        }
      ];
      const isoDateMock = sinon
        .stub(Date.prototype, 'toISOString')
        .returns('2021-02-15T12:15:05.627Z');
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          metadata: {
            messages: validationErrors,
            requestId: stubData.request.body.requestId,
            transactionDate: new Date().toISOString(),
            transactionId: undefined
          },
          responsePayload: null
        });
      stubData.oaUpdateAPIValidatorMock
        .expects('validateOAUpdateRequest')
        .once()
        .withArgs(stubData.request.body)
        .returns(validationErrors);
      stubData.productV4ServiceMock.expects('uploadOAUpdate').never();
      productV4Controller
        .handleOAUpdate(stubData.request, stubData.response)
        .then(() => {
          stubData.oaUpdateAPIValidatorMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.oaUpdateAPIValidatorMock.restore();
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
          isoDateMock.restore();
        });
    });
    it('should return 200 when data processed successfullly', (done) => {
      stubData.request.body = {
        appName: 'OMS',
        callBackurl: 'http://some_valid_url.com/',
        requestId: 'some-id',
        requestPayload: {}
      };
      stubData.request.params = { id: 'some-valid-id' };
      const responseData = {
        messages: [
          {
            code: 202,
            description: 'it will be processed and acknowledged soon.'
          }
        ],
        requestId: stubData.request.body.requestId,
        status: 'success'
      };
      stubData.responseMock.expects('status').once().withArgs(202);
      stubData.responseMock.expects('json').once().withArgs(responseData);
      stubData.oaUpdateAPIValidatorMock
        .expects('validateOAUpdateRequest')
        .once()
        .withArgs(stubData.request.body)
        .returns([]);
      stubData.productV4ServiceMock
        .expects('uploadOAUpdate')
        .once()
        .withArgs(stubData.request.body, stubData.request.params.id)
        .resolves('some-messageId');
      productV4Controller
        .handleOAUpdate(stubData.request, stubData.response)
        .then(() => {
          stubData.oaUpdateAPIValidatorMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.oaUpdateAPIValidatorMock.restore();
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it('should return 500 error when service method upload fails', (done) => {
      stubData.request.body = {
        appName: 'OMS',
        callBackurl: 'http://some_valid_url.com/',
        requestId: 'some-id',
        requestPayload: {}
      };
      stubData.request.params = { id: 'some-valid-id' };
      const isoDateMock = sinon
        .stub(Date.prototype, 'toISOString')
        .returns('2021-02-15T12:15:05.627Z');
      const responseData = {
        metadata: {
          messages: [
            {
              code: 500,
              description: 'Error while uploading oaUpdate message'
            }
          ],
          requestId: stubData.request.body.requestId,
          transactionDate: new Date().toISOString(),
          transactionId: undefined
        },
        responsePayload: null
      };
      const sqsErr = new AppError(
        `Error while uploading oaUpdate message`,
        500
      );
      stubData.responseMock.expects('status').once().withArgs(500);
      stubData.responseMock.expects('json').once().withArgs(responseData);

      stubData.oaUpdateAPIValidatorMock
        .expects('validateOAUpdateRequest')
        .once()
        .withArgs(stubData.request.body)
        .returns([]);
      stubData.productV4ServiceMock
        .expects('uploadOAUpdate')
        .once()
        .withArgs(stubData.request.body, stubData.request.params.id)
        .rejects(sqsErr);
      productV4Controller
        .handleOAUpdate(stubData.request, stubData.response)
        .then(() => {
          stubData.oaUpdateAPIValidatorMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.oaUpdateAPIValidatorMock.restore();
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
          isoDateMock.restore();
        });
    });
    it('should return 404 error by passing invalid UUID', (done) => {
      stubData.request.body = {
        appName: 'OMS',
        callBackurl: 'http://some_valid_url.com/',
        requestId: 'some-id',
        requestPayload: {}
      };
      stubData.request.params = { id: 'some-invalid-id' };
      const isoDateMock = sinon
        .stub(Date.prototype, 'toISOString')
        .returns('2021-02-15T12:15:05.627Z');
      const responseData = {
        metadata: {
          messages: [
            {
              code: 404,
              description: 'Product (asset) not found.'
            }
          ],
          requestId: stubData.request.body.requestId,
          transactionDate: new Date().toISOString(),
          transactionId: undefined
        },
        responsePayload: null
      };
      const assetErr = new AppError(`Product (asset) not found.`, 404);
      stubData.responseMock.expects('status').once().withArgs(404);
      stubData.responseMock.expects('json').once().withArgs(responseData);

      stubData.oaUpdateAPIValidatorMock
        .expects('validateOAUpdateRequest')
        .once()
        .withArgs(stubData.request.body)
        .returns([]);
      stubData.productV4ServiceMock
        .expects('uploadOAUpdate')
        .once()
        .withArgs(stubData.request.body, stubData.request.params.id)
        .rejects(assetErr);
      productV4Controller
        .handleOAUpdate(stubData.request, stubData.response)
        .then(() => {
          stubData.oaUpdateAPIValidatorMock.verify();
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.oaUpdateAPIValidatorMock.restore();
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
          isoDateMock.restore();
        });
    });
  });
  describe('handleRuleString', () => {
    let rulesString;
    beforeEach(
      () =>
        (rulesString = {
          apiVersion: '4.0.1',
          data: {
            rules: [
              {
                position: 0,
                rule: {
                  value: 'BEGIN'
                },
                type: 'separator'
              },
              {
                position: 1,
                rule: {
                  attribute: 'book.format',
                  relationship: 'EQ',
                  value: 'e-Book'
                },
                type: 'criteria'
              },
              {
                position: 8,
                rule: {
                  value: 'END'
                },
                type: 'separator'
              }
            ],
            type: 'book'
          }
        })
    );

    it('should return 400 error when request body is invalid', (done) => {
      const isoDateMock = sinon
        .stub(Date.prototype, 'toISOString')
        .returns('2021-02-15T12:15:05.627Z');
      stubData.request.body = {
        data: null
      };
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Missing product data in the request payload.',
            transactionId: undefined
          }
        });

      stubData.productV4ServiceMock
        .expects('getRulesStringFromSearchQuery')
        .never();
      stubData.productV4ServiceMock.expects('getTransactionId').never();

      productV4Controller
        .handleRuleString(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
          isoDateMock.restore();
        });
    });
    it('should return 400 error when request data is not an array', (done) => {
      const isoDateMock = sinon
        .stub(Date.prototype, 'toISOString')
        .returns('2021-02-15T12:15:05.627Z');
      stubData.request.body = {
        data: 'garbage'
      };
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Invalid rulesString garbage.',
            transactionId: undefined
          }
        });

      stubData.productV4ServiceMock
        .expects('getRulesStringFromSearchQuery')
        .never();
      stubData.productV4ServiceMock.expects('getTransactionId').never();

      productV4Controller
        .handleRuleString(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
          isoDateMock.restore();
        });
    });
    it('should return 200 when data processed successfully', (done) => {
      stubData.request.body.data = [rulesString.data];
      const isoDateMock = sinon
        .stub(Date.prototype, 'toISOString')
        .returns('2021-02-15T12:15:05.627Z');
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: [
            { rulesString: { 'book.format': { $eq: 'e-Book' } }, type: 'book' }
          ],
          metadata: {
            message: '',
            transactionId: undefined
          }
        });

      stubData.productV4ServiceMock
        .expects('getRulesStringFromSearchQuery')
        .once()
        .withArgs([rulesString.data])
        .returns([
          { rulesString: { 'book.format': { $eq: 'e-Book' } }, type: 'book' }
        ]);
      stubData.productV4ServiceMock
        .expects('getTransactionId')
        .once()
        .returns('some-transaction-id');
      productV4Controller
        .handleRuleString(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
          isoDateMock.restore();
        });
    });
  });
  describe('getTaxonomyClassifications', () => {
    it('should return classifications Successfully from taxonomy master', (done) => {
      stubData.request.query = {
        classificationFamily: 'rom',
        classificationType: 'subject',
        code: 'sub_1'
      };
      const testTaxonomy = [
        {
          _id: '1',
          classificationType: 'subject',
          code: 'sub_1',
          level: 1,
          name: 'Environment & Agriculture',
          parentId: null
        }
      ];
      const taxonomyMasterFilter = {
        classificationFamily: 'rom',
        classificationType: 'subject',
        code: 'sub_1',
        includeChildren: false,
        level: undefined
      };
      stubData.productV4ServiceMock
        .expects('getTaxonomyClassifications')
        .once()
        .withArgs(taxonomyMasterFilter)
        .resolves(testTaxonomy);
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: testTaxonomy,
          metadata: { transactionId: undefined }
        });
      productV4Controller
        .getTaxonomyClassifications(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it('should throw 400 error when query-param level is not numeric', (done) => {
      stubData.request.query = {
        classificationFamily: 'rom',
        classificationType: 'subject',
        code: 'sub_1',
        level: 'one'
      };
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            message: 'Query-param `level` value is not Numeric',
            transactionId: undefined
          }
        });
      stubData.productV4ServiceMock
        .expects('getTaxonomyClassifications')
        .never();
      productV4Controller
        .getTaxonomyClassifications(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it('should throw 404 error when there are no matching classifications', (done) => {
      stubData.request.query = {
        classificationFamily: 'rom',
        classificationType: 'subject',
        code: 'sub_1',
        level: '1'
      };
      const testTaxonomy = [];
      const taxonomyMasterFilter = {
        classificationFamily: 'rom',
        classificationType: 'subject',
        code: 'sub_1',
        includeChildren: false,
        level: 1
      };
      stubData.productV4ServiceMock
        .expects('getTaxonomyClassifications')
        .once()
        .withArgs(taxonomyMasterFilter)
        .resolves(testTaxonomy);
      stubData.responseMock.expects('status').once().withArgs(404);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            message: 'Taxonomy not found',
            transactionId: undefined
          }
        });
      productV4Controller
        .getTaxonomyClassifications(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
  });
  describe('getReport', () => {
    it('it should throw error when type is other than salessheets', (done) => {
      stubData.request.query.type = null;
      stubData.productV4ServiceMock.expects('getReport').never();
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Invalid query parameter: type',
            transactionId: undefined
          }
        });
      productV4Controller
        .getReport(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it('it should throw error when type is null or undefined', (done) => {
      stubData.request.query.type = 'document';
      stubData.productV4ServiceMock.expects('getReport').never();
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Invalid query parameter: type with value document',
            transactionId: undefined
          }
        });
      productV4Controller
        .getReport(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it('it should throw error when no content found', (done) => {
      stubData.request.query.type = 'salessheets';
      stubData.productV4ServiceMock
        .expects('getReport')
        .once()
        .withArgs(stubData.request.query.type)
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
      productV4Controller
        .getReport(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it('should return signed url for salessheets report', (done) => {
      stubData.request.query.type = 'salessheets';
      stubData.productV4ServiceMock
        .expects('getReport')
        .once()
        .withArgs(stubData.request.query.type)
        .resolves('some-signed-url');
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs({
        location: 'some-signed-url'
      });
      productV4Controller
        .getReport(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
  });
  describe('getPreArticle', () => {
    it('should transform and return a pre-article when id is valid pre-article id', (done) => {
      stubData.request.params = {
        identifier: '41b11dfe-9367-44f8-85e9-42cdf5c3f5ee'
      };
      stubData.request.query.responseGroup = 'large';

      const preArticle = preArticleTestData.find(
        (preArticleData) =>
          preArticleData._id === stubData.request.params.identifier
      );
      const expectedPreArticleData = _.cloneDeep(preArticle);
      delete expectedPreArticleData._schemaVersion;
      delete expectedPreArticleData._sources;
      delete expectedPreArticleData._modifiedDate;
      delete expectedPreArticleData._createdDate;
      // delete expectedPreArticleData._isSellable;
      stubData.productV4ServiceMock
        .expects('getPreArticleById')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.query.responseGroup
        )
        .resolves({ product: _.cloneDeep(preArticle) });
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({ product: expectedPreArticleData });
      productV4Controller
        .getPreArticle(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.productV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.productV4ServiceMock.restore();
        });
    });
    it('should throw 404 error when there is no pre-article matching the id', (done) => {
      stubData.request.params = {
        identifier: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896'
      };
      stubData.request.query.responseGroup = 'large';

      stubData.productV4ServiceMock
        .expects('getPreArticleById')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.query.responseGroup
        )
        .resolves(null);
      stubData.responseMock.expects('status').once().withArgs(404);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Product not found',
            transactionId: undefined
          }
        });
      productV4Controller
        .getPreArticle(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.productV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.productV4ServiceMock.restore();
        });
    });

    it('should throw 500 error when the Service layer throws error', (done) => {
      stubData.request.params = {
        identifier: '41b11dfe-9367-44f8-85e9-42cdf5c3f5ee'
      };
      stubData.request.query.responseGroup = 'large';

      const internalError = new Error('Internal error');

      stubData.productV4ServiceMock
        .expects('getPreArticleById')
        .once()
        .withArgs(
          stubData.request.params.identifier,
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
      productV4Controller
        .getPreArticle(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.productV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.productV4ServiceMock.restore();
        });
    });
  });
  describe('getPreArticles', () => {
    it('should return preArticles when identifierName & identifierValues are provided', (done) => {
      stubData.request.query.responseGroup = 'large';
      stubData.request.query.identifierName = 'submissionId';
      stubData.request.query.identifierValues = '172839139';

      const preArticles = preArticleTestData;
      const preArticlesWrapper = preArticles.map((product) => {
        return { product };
      });
      stubData.productV4ServiceMock
        .expects('getPreArticlesByIdentifier')
        .once()
        .withArgs(
          stubData.request.query.identifierName,
          stubData.request.query.identifierValues.split(','),
          'preArticle',
          stubData.request.query.responseGroup
        )
        .resolves(preArticlesWrapper);
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(preArticlesWrapper);
      productV4Controller
        .getPreArticles(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });

    it('should return preArticles when contributorsEmail provided', (done) => {
      stubData.request.query.responseGroup = 'large';
      stubData.request.query.identifierName = 'contributorsEmail';
      stubData.request.query.identifierValues = 'praveenmooli@mailinator.com';

      const preArticles = preArticleTestData;
      const preArticlesWrapper = preArticles.map((product) => {
        return { product };
      });
      stubData.productV4ServiceMock
        .expects('getPreArticlesByIdentifier')
        .once()
        .withArgs(
          stubData.request.query.identifierName,
          stubData.request.query.identifierValues.split(','),
          'preArticle',
          stubData.request.query.responseGroup
        )
        .resolves(preArticlesWrapper);
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(preArticlesWrapper);
      productV4Controller
        .getPreArticles(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it(`should throw 404 error when preArticles not found with given 
    identifierName & identifierValues`, (done) => {
      stubData.request.query.responseGroup = 'large';
      stubData.request.query.identifierName = 'submissionId';
      stubData.request.query.identifierValues = '172839139';

      stubData.productV4ServiceMock
        .expects('getPreArticlesByIdentifier')
        .once()
        .withArgs(
          stubData.request.query.identifierName,
          stubData.request.query.identifierValues.split(','),
          'preArticle',
          stubData.request.query.responseGroup
        )
        .resolves(null);
      stubData.responseMock.expects('status').once().withArgs(404);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Product not found',
            transactionId: undefined
          }
        });
      productV4Controller
        .getPreArticles(stubData.request, stubData.response)
        .then(() => {
          stubData.productV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.productV4ServiceMock.restore();
          stubData.responseMock.restore();
        });
    });
    it(`should throw 500 error when the Service layer throws error& identifierName &
      identifierValues are provided`, (done) => {
      stubData.request.query.responseGroup = 'large';
      stubData.request.query.identifierName = 'submissionId';
      stubData.request.query.identifierValues = '172839139';

      const internalError = new Error('Internal error');

      stubData.productV4ServiceMock
        .expects('getPreArticlesByIdentifier')
        .once()
        .withArgs(
          stubData.request.query.identifierName,
          stubData.request.query.identifierValues.split(','),
          'preArticle',
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
      productV4Controller
        .getPreArticles(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.productV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.productV4ServiceMock.restore();
        });
    });
  });
  describe('getManuscriptWorkflow', () => {
    it('should transform and return a manuscript-workflow when id is valid manuscript-workflow id', (done) => {
      stubData.request.params = {
        identifier: '673dd6d8-000d-4b07-ae03-0631ac469aad'
      };
      stubData.request.query.responseGroup = 'medium';

      const manuscriptWorkflow = manuscriptWorkflowTestData.find(
        (manuscriptWorkflowData) =>
          manuscriptWorkflowData._id === stubData.request.params.identifier
      );
      const expectedManuscriptWorkflowData = _.cloneDeep(manuscriptWorkflow);
      // delete expectedPreArticleData._isSellable;
      stubData.productV4ServiceMock
        .expects('getManuscriptWorkflowById')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.query.responseGroup
        )
        .resolves({ product: _.cloneDeep(manuscriptWorkflow) });
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({ product: expectedManuscriptWorkflowData });
      productV4Controller
        .getManuscriptWorkflow(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.productV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.productV4ServiceMock.restore();
        });
    });
    it('should throw 404 error when there is no manuscript-workflow matching the id', (done) => {
      stubData.request.params = {
        identifier: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896'
      };
      stubData.request.query.responseGroup = 'medium';

      stubData.productV4ServiceMock
        .expects('getManuscriptWorkflowById')
        .once()
        .withArgs(
          stubData.request.params.identifier,
          stubData.request.query.responseGroup
        )
        .resolves(null);
      stubData.responseMock.expects('status').once().withArgs(404);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: 'Product not found',
            transactionId: undefined
          }
        });
      productV4Controller
        .getManuscriptWorkflow(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.productV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.productV4ServiceMock.restore();
        });
    });

    it('should throw 500 error when the Service layer throws error', (done) => {
      stubData.request.params = {
        identifier: '673dd6d8-000d-4b07-ae03-0631ac469aad'
      };
      stubData.request.query.responseGroup = 'medium';

      const internalError = new Error('Internal error');

      stubData.productV4ServiceMock
        .expects('getManuscriptWorkflowById')
        .once()
        .withArgs(
          stubData.request.params.identifier,
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
      productV4Controller
        .getManuscriptWorkflow(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          stubData.productV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.productV4ServiceMock.restore();
        });
    });
  });
});
