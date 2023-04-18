import { expect } from 'chai';
import * as sinon from 'sinon';

import { searchQueryUtil } from '../../utils/SearchQueryUtil';
import { apiResponseGroupConfig } from '../config';
import { productV4DAO } from '../products/ProductV4.DAO';
import { S3UtilsV4 } from '../utils/S3UtilsV4';
import { SQSUtilsV4 } from '../utils/SQSUtilsV4';
import { collectionV4Service } from './CollectionV4.Service';
import { ResponseModel } from '@tandfgroup/pcm-entity-model-v4';

function testProperties(objectUnderTest, propertiesToTest, objectName = 'NA') {
  const failedProperties = [];
  propertiesToTest.forEach((expectedProperty) => {
    try {
      expect(
        objectUnderTest,
        `Property mismatched : "${expectedProperty}" `
      ).to.have.property(expectedProperty);
    } catch (err) {
      if (expectedProperty !== 'subType') {
        failedProperties.push(expectedProperty);
      }
    }
  });
  if (failedProperties.length > 0) {
    throw new Error(
      `Test failed for ${objectName} properties:: ${failedProperties.join()}`
    );
  }
}

function getStubData() {
  const productV4DAOMock = sinon.mock(productV4DAO);
  const s3UtilsV4Mock = sinon.mock(S3UtilsV4);
  const sqsUtilsV4Mock = sinon.mock(SQSUtilsV4);
  const searchQueryUtilMock = sinon.mock(searchQueryUtil);
  return {
    productV4DAOMock,
    s3UtilsV4Mock,
    searchQueryUtilMock,
    sqsUtilsV4Mock
  };
}

describe('collectionV4Service', () => {
  it('should have all the required methods', () => {
    expect(collectionV4Service).to.respondTo('getProductByTitle');
    expect(collectionV4Service).to.respondTo('uploadProduct');
    expect(collectionV4Service).to.respondTo('isBespokeCollection');
  });
  let productV4DAOMock;
  beforeEach(() => {
    productV4DAOMock = sinon.mock(productV4DAO);
  });
  describe('getProductByTitle', () => {
    it('should return valid products by passing title and productType', (done) => {
      const title = 'some-title';
      const productType = 'book';
      const bookProduct = {
        _createdDate: '2020-02-06T11:38:12.849+00:00',
        _id: 'some-id',
        _modifiedDate: '2020-02-06T11:38:12.849+00:00',
        identifiers: {
          isbn: 'some-isbn'
        },
        isSellable: true,
        status: 'Available',
        title: 'some-title',
        type: 'book',
        version: null
      };
      productV4DAOMock
        .expects('getProductByTitle')
        .once()
        .withArgs(
          title,
          productType,
          apiResponseGroupConfig.getProjectionFields(productType, 'small')
        )
        .resolves(bookProduct);
      collectionV4Service
        .getProductByTitle(title, productType, undefined)
        .then((retrivedProduct) => {
          expect(retrivedProduct._id).to.equal('some-id');
          testProperties(
            retrivedProduct,
            apiResponseGroupConfig.getProjectionFields(productType, 'small')
          );
          productV4DAOMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          productV4DAOMock.restore();
        });
    });
    it('should return valid products by passing title and productType', (done) => {
      const title = 'Invalid-title';
      const productType = 'book';
      productV4DAOMock
        .expects('getProductByTitle')
        .once()
        .withArgs(
          title,
          productType,
          apiResponseGroupConfig.getProjectionFields(productType, 'small')
        )
        .resolves(null);
      collectionV4Service
        .getProductByTitle(title, productType, undefined)
        .then((retrivedProduct) => {
          expect(retrivedProduct).to.deep.equal(null);
          productV4DAOMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          productV4DAOMock.restore();
        });
    });
  });
  describe('uploadProduct', () => {
    it('should return product when base price is null', (done) => {
      const stubData = getStubData();
      const product: any = {
        _id: 'some-id',
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
        collection: {
          description: 'some-description',
          status: 'planned'
        },
        prices: [
          {
            currency: 'GBP',
            discountPercentage: 20,
            listPrice: 100,
            price: null,
            priceType: 'BYO Library Price',
            priceTypeCode: 'BYO'
          }
        ],
        type: 'collection'
      };
      const action = 'create';
      const sqsCollectionType = 'dynamicCollection';
      const location = 'https://some-signed-url';
      stubData.s3UtilsV4Mock
        .expects('uploadToS3')
        .once()
        .withArgs(product, product._id)
        .resolves(location);
      stubData.sqsUtilsV4Mock
        .expects('sendMessage')
        .once()
        .withArgs(product._id, location, action, sqsCollectionType)
        .resolves('message-id');
      collectionV4Service
        .uploadProduct(product, action)
        .then((response) => {
          expect(response).to.deep.equal({ _id: product._id });
          stubData.s3UtilsV4Mock.verify();
          stubData.sqsUtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.s3UtilsV4Mock.restore();
          stubData.sqsUtilsV4Mock.restore();
        });
    });
    it('should return product when collection is static', (done) => {
      const stubData = getStubData();
      const product: any = {
        _id: 'some-id',
        categories: [
          {
            code: null,
            name: 'collection-type',
            type: 'netbase'
          },
          {
            code: null,
            name: 'collection-update-type',
            type: 'static'
          }
        ],
        collection: {
          description: 'some-description',
          status: 'planned'
        },
        prices: [
          {
            currency: 'GBP',
            discountPercentage: 20,
            listPrice: 100,
            price: null,
            priceType: 'BYO Library Price',
            priceTypeCode: 'BYO'
          }
        ],
        type: 'collection'
      };
      const action = 'create';
      const sqsCollectionType = 'staticCollection';
      const location = 'https://some-signed-url';
      stubData.s3UtilsV4Mock
        .expects('uploadToS3')
        .once()
        .withArgs(product, product._id)
        .resolves(location);
      stubData.sqsUtilsV4Mock
        .expects('sendMessage')
        .once()
        .withArgs(product._id, location, action, sqsCollectionType)
        .resolves('message-id');
      collectionV4Service
        .uploadProduct(product, action)
        .then((response) => {
          expect(response).to.deep.equal({ _id: 'some-id' });
          stubData.s3UtilsV4Mock.verify();
          stubData.sqsUtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.s3UtilsV4Mock.restore();
          stubData.sqsUtilsV4Mock.restore();
        });
    });
    it('should throw error when s3 return error', (done) => {
      const stubData = getStubData();
      const product: any = {
        _id: 'some-id',
        categories: [
          {
            code: null,
            name: 'collection-type',
            type: 'netbase/hss/sdgo/rom/ different digital products'
          },
          {
            code: null,
            name: 'collection-update-type',
            type: 'dynamic'
          }
        ],
        collection: {
          description: 'some-description',
          status: 'planned'
        },
        prices: [
          {
            currency: 'GBP',
            discountPercentage: 20,
            listPrice: 100,
            price: null,
            priceType: 'BYO Library Price',
            priceTypeCode: 'BYO'
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
        type: 'collection'
      };
      const query = [
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
          rulesString:
            '{"$and":[{"statusCode":{"$in":["LFB","VGR","IHST","WNN"]}},{"type":{"$eq":"Book"}}]}',
          type: 'Book'
        }
      ];
      const action = 'create';
      stubData.searchQueryUtilMock
        .expects('getRulesStringFromSearchQuery')
        .once()
        .withArgs(product.rulesList)
        .returns(query);
      stubData.s3UtilsV4Mock
        .expects('uploadToS3')
        .once()
        .withArgs(product, product._id)
        .resolves(null);
      stubData.sqsUtilsV4Mock.expects('sendMessage').never();
      collectionV4Service
        .uploadProduct(product, action)
        .then(() => {
          done(new Error('Expecting Products not found. but got success'));
        })
        .catch((error) => {
          expect(error.code).to.equal(400);
          expect(error.message).to.equal(`Error while uploading file`);
          expect(error.name).to.equal('AppError');
          stubData.searchQueryUtilMock.verify();
          stubData.s3UtilsV4Mock.verify();
          stubData.sqsUtilsV4Mock.verify();
          done();
        })
        .finally(() => {
          stubData.searchQueryUtilMock.restore();
          stubData.s3UtilsV4Mock.restore();
          stubData.sqsUtilsV4Mock.restore();
        });
    });
    it('should throw error when sqs return error', (done) => {
      const stubData = getStubData();
      const sqsCollectionType = 'dynamicCollection';
      const location = 'https://some-signed-url';
      const product: any = {
        _id: 'some-id',
        categories: [
          {
            code: null,
            name: 'collection-type',
            type: 'netbase/hss/sdgo/rom/ different digital products'
          },
          {
            code: null,
            name: 'collection-update-type',
            type: 'dynamic'
          }
        ],
        collection: {
          description: 'some-description',
          status: 'planned'
        },
        prices: [
          {
            currency: 'GBP',
            discountPercentage: 20,
            listPrice: 100,
            price: null,
            priceType: 'BYO Library Price',
            priceTypeCode: 'BYO'
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
        type: 'collection'
      };
      const query = [
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
          rulesString:
            '{"$and":[{"statusCode":{"$in":["LFB","VGR","IHST","WNN"]}},{"type":{"$eq":"Book"}}]}',
          type: 'Book'
        }
      ];
      const action = 'create';
      stubData.searchQueryUtilMock
        .expects('getRulesStringFromSearchQuery')
        .once()
        .withArgs(product.rulesList)
        .returns(query);
      stubData.s3UtilsV4Mock
        .expects('uploadToS3')
        .once()
        .withArgs(product, product._id)
        .resolves(location);
      stubData.sqsUtilsV4Mock
        .expects('sendMessage')
        .once()
        .withArgs(product._id, location, action, sqsCollectionType)
        .resolves(null);
      collectionV4Service
        .uploadProduct(product, action)
        .then(() => {
          done(new Error('Expecting Products not found. but got success'));
        })
        .catch((error) => {
          expect(error.code).to.equal(400);
          expect(error.message).to.equal(`Error while sending message`);
          expect(error.name).to.equal('AppError');
          stubData.searchQueryUtilMock.verify();
          stubData.s3UtilsV4Mock.verify();
          stubData.sqsUtilsV4Mock.verify();
          done();
        })
        .finally(() => {
          stubData.searchQueryUtilMock.restore();
          stubData.s3UtilsV4Mock.restore();
          stubData.sqsUtilsV4Mock.restore();
        });
    });
  });
  describe('uploadPatchProduct', () => {
    it('should return product _id ', (done) => {
      const stubData = getStubData();
      const patchRequest: any = [
        {
          op: 'replace',
          path: 'identifiers.sku',
          value: '001-555-5678'
        }
      ];
      patchRequest._id = 'some-id';
      const collectionType = 'dynamicCollection';
      const action = 'patchCollection';
      const location = 'https://some-signed-url';
      stubData.s3UtilsV4Mock
        .expects('uploadToS3')
        .once()
        .withArgs(patchRequest, patchRequest._id)
        .resolves(location);
      stubData.sqsUtilsV4Mock
        .expects('sendMessage')
        .once()
        .withArgs(patchRequest._id, location, action, collectionType)
        .resolves('message-id');
      collectionV4Service
        .uploadPatchProduct(patchRequest)
        .then((response) => {
          expect(response).to.deep.equal({ _id: patchRequest._id });
          stubData.s3UtilsV4Mock.verify();
          stubData.sqsUtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.s3UtilsV4Mock.restore();
          stubData.sqsUtilsV4Mock.restore();
        });
    });
    it('should throw error when s3 return error', (done) => {
      const stubData = getStubData();
      const patchRequest: any = [
        {
          op: 'replace',
          path: 'identifiers.sku',
          value: '001-555-5678'
        }
      ];
      patchRequest._id = 'some-id';
      stubData.s3UtilsV4Mock
        .expects('uploadToS3')
        .once()
        .withArgs(patchRequest, patchRequest._id)
        .resolves(null);
      stubData.sqsUtilsV4Mock.expects('sendMessage').never();
      collectionV4Service
        .uploadPatchProduct(patchRequest)
        .then(() => {
          done(new Error('Expecting Products not found. but got success'));
        })
        .catch((error) => {
          expect(error.code).to.equal(400);
          expect(error.message).to.equal(`Error while uploading file`);
          expect(error.name).to.equal('AppError');
          stubData.searchQueryUtilMock.verify();
          stubData.s3UtilsV4Mock.verify();
          stubData.sqsUtilsV4Mock.verify();
          done();
        })
        .finally(() => {
          stubData.searchQueryUtilMock.restore();
          stubData.s3UtilsV4Mock.restore();
          stubData.sqsUtilsV4Mock.restore();
        });
    });
  });
  describe('isBespokeCollection', () => {
    it('should return true if collection type is bespoke and collection (business) ID is BD.EBOOK', (done) => {
      const categories: ResponseModel.Category[] = [
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
      ];
      const collectionId = 'BD.EBOOK';
      const isBespoke = collectionV4Service.isBespokeCollection(
        collectionId,
        categories
      );
      expect(isBespoke).to.be.true;
      done();
    });
    it('should return false if collection type is not bespoke and collection (business) ID is BD.EBOOK', (done) => {
      const categories: ResponseModel.Category[] = [
        {
          code: '',
          name: 'collection-type',
          type: 'hss'
        },
        {
          code: '',
          name: 'collection-update-type',
          type: 'static'
        }
      ];
      const collectionId = 'BD.EBOOK';
      const isBespoke = collectionV4Service.isBespokeCollection(
        collectionId,
        categories
      );
      expect(isBespoke).to.be.false;
      done();
    });
    it('should return false if collection type is bespoke but collection (business) ID is not BD.EBOOK', (done) => {
      const categories: ResponseModel.Category[] = [
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
      ];
      const collectionId = 'HSS-ASIANSTD-2017';
      const isBespoke = collectionV4Service.isBespokeCollection(
        collectionId,
        categories
      );
      expect(isBespoke).to.be.false;
      done();
    });
  });
});
