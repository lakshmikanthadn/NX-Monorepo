import { MongooseSchema, StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';

import { IProductsRuleRequest } from '../model/interfaces/productRequest';
import { booksTestData } from '../test/data/BookV4';
import { journalPublishingServiceMapData } from '../test/data/JournalPublishingServiceMapV4';
import { journalData } from '../test/data/JournalV4';

import { publishingServiceData } from '../test/data/PublishingServiceV4';
import { productV4DAO } from './ProductV4.DAO';

describe('ProductV4DAO', () => {
  let mongoServer;
  before(async () => {
    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getConnectionString();
    await mongoose
      .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => {
        console.log('Connection to Test MongoDB is success.');
      })
      .catch((err) => {
        console.log('Connection to Test MongoDB is failed.', err);
      });
    const TestBooksV4 = mongoose.model(
      'TestBooksV4',
      MongooseSchema.Book,
      'books-4.0.1'
    );
    await TestBooksV4.insertMany(booksTestData);
    const PublishingServiceV4 = mongoose.model(
      'PublishingService',
      MongooseSchema.PublishingService,
      'publishingServices-4.0.1'
    );
    await PublishingServiceV4.insertMany(publishingServiceData);
    const JournalPublishingServiceMap = mongoose.model(
      'JournalPublishingServiceMap',
      MongooseSchema.JournalPublishingServiceMap,
      'journalPublishingServiceMap-4.0.1'
    );
    await JournalPublishingServiceMap.insertMany(
      journalPublishingServiceMapData
    );
    const Journal = mongoose.model(
      'Journal',
      MongooseSchema.Journal,
      'journals-4.0.1'
    );
    await Journal.insertMany(journalData);
  });
  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should have all the methods', () => {
    expect(productV4DAO).to.respondTo('getProduct');
    expect(productV4DAO).to.respondTo('getProductsWithType');
    expect(productV4DAO).to.respondTo('getProductsCountByRule');
    expect(productV4DAO).to.respondTo('getProductsByRule');
    expect(productV4DAO).to.respondTo('getProductsPriceByRules');
    expect(productV4DAO).to.respondTo('getProductsByIds');
    expect(productV4DAO).to.respondTo('getActiveProductByIds');
  });

  describe('getProduct', () => {
    it('should return Book when productType = book and id is valid', (done) => {
      const productType = 'book';
      const productVersion = '1.0.0';
      const id = '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896';
      productV4DAO
        .getProduct(productType, id, [])
        .then((product) => {
          expect(product).to.have.property('_id', id);
          expect(product).to.have.property('type', productType);
          expect(product).to.have.property('version', productVersion);
          done();
        })
        .catch(done);
    });
    it('should return Book with only projected fields when the projections are passed', (done) => {
      const productType = 'book';
      const productVersion = '1.0.0';
      const id = '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896';
      const projections = ['type', '_id', 'version', 'book', 'prices'];
      productV4DAO
        .getProduct(productType, id, projections)
        .then((product) => {
          expect(Object.keys(product).length).to.equal(projections.length);
          expect(product).to.have.property('_id', id);
          expect(product).to.have.property('type', productType);
          expect(product).to.have.property('version', productVersion);
          expect(product).to.have.property('book');
          expect(product).to.have.property('prices');
          done();
        })
        .catch(done);
    });
    it('should return null when there is no product for the given id', (done) => {
      const productType = 'book';
      const id = '6d4fb6ac-55f9-4a7a-9cfb-invalid';
      productV4DAO
        .getProduct(productType, id, [])
        .then((product) => {
          expect(product).to.equal(null);
          done();
        })
        .catch(done);
    });
    it('should return Book when id and productVersion are valid', (done) => {
      const productType = 'book';
      const productVersion = '1.0.0';
      const id = '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896';
      productV4DAO
        .getProduct(productType, id, [], undefined, undefined, productVersion)
        .then((product) => {
          expect(product).to.have.property('_id', id);
          expect(product).to.have.property('type', productType);
          expect(product).to.have.property('version', productVersion);
          done();
        })
        .catch(done);
    });
    it('should return Book when id, availabilityName and productVersion are valid', (done) => {
      const productType = 'book';
      const productVersion = '1.0.0';
      const id = 'some-uuid';
      const availabilityName = 'some-channel';
      productV4DAO
        .getProduct(
          productType,
          id,
          [],
          availabilityName,
          undefined,
          productVersion
        )
        .then((product) => {
          expect(product).to.have.property('_id', id);
          expect(product).to.have.property('type', productType);
          expect(product).to.have.property('version', productVersion);
          done();
        })
        .catch(done);
    });
    it('should return Book when id, availabilityName and availabilityStatus are valid', (done) => {
      const productType = 'book';
      const productVersion = '1.0.0';
      const id = 'some-uuid';
      const availabilityName = 'some-channel';
      const availabilityStatus = ['some-status', 'some-status1'];
      productV4DAO
        .getProduct(
          productType,
          id,
          [],
          availabilityName,
          availabilityStatus,
          productVersion
        )
        .then((product) => {
          expect(product).to.have.property('_id', id);
          expect(product).to.have.property('type', productType);
          expect(product).to.have.property('version', productVersion);
          done();
        })
        .catch(done);
    });
    it('should return null when there is no product for productVersion = 1.0.1', (done) => {
      const productType = 'book';
      const productVersion = '1.0.1';
      const id = '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896';
      productV4DAO
        .getProduct(productType, id, [], undefined, undefined, productVersion)
        .then((product) => {
          expect(product).to.equal(null);
          done();
        })
        .catch(done);
    });
    it('should throw error when productType is invalid', (done) => {
      const productType = 'product_type_invalid';
      const productVersion = '1.0.1';
      const id = '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896';
      productV4DAO
        .getProduct(
          productType as StorageModel.ProductType,
          id,
          [],
          undefined,
          undefined,
          productVersion
        )
        .then(() => {
          done(new Error('Expecting error, but got success'));
        })
        .catch((err) => {
          expect(err.message).to.equal('Invalid Product type.');
          done();
        })
        .catch(done);
    });
    it('should return Book when book is not excluded from a region', (done) => {
      const productType = 'book';
      const productVersion = '1.0.0';
      const id = '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6897';
      const region = 'IND';
      productV4DAO
        .getProduct(
          productType,
          id,
          [],
          undefined,
          undefined,
          productVersion,
          region
        )
        .then((product) => {
          expect(product).to.have.property('_id', id);
          expect(product).to.have.property('type', productType);
          expect(product).to.have.property('version', productVersion);
          done();
        })
        .catch(done);
    });
    it('should return null when book is excluded from a region', (done) => {
      const productType = 'book';
      const productVersion = '1.0.0';
      const id = '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896';
      const region = 'IND';
      productV4DAO
        .getProduct(
          productType,
          id,
          [],
          undefined,
          undefined,
          productVersion,
          region
        )
        .then((product) => {
          expect(product).to.equal(null);
          done();
        })
        .catch(done);
    });
  });
  describe('getActiveProductByIds', () => {
    it('should return product with active status when id and product type are passed', (done) => {
      const ids = [
        'bd33697a-ca93-4214-a1cd-322b1005cff2',
        'fb8b581e-580c-4125-99fc-f460da18924b',
        '877520a5-ea8d-4fc9-aec9-ccc61067affa'
      ];
      productV4DAO
        .getActiveProductByIds('journal', ids)
        .then((products) => {
          expect(products[0]).to.have.property(
            '_id',
            'bd33697a-ca93-4214-a1cd-322b1005cff2'
          );
          done();
        })
        .catch(done);
    });
    it('should return  null when no match found for id and product type', (done) => {
      const ids = ['bd33697a-ca93-4214-a1cd-322b1005cff3'];
      productV4DAO
        .getActiveProductByIds('journal', ids)
        .then((products) => {
          expect(products).to.be.an('array');
          expect(products.length).to.be.equals(0);
          done();
        })
        .catch(done);
    });
  });
  describe('getProductsWithType', () => {
    it('should return 1 Book when productType=book & limit=1,offset=0', (done) => {
      const productType = 'book';
      const productVersion = '1.0.0';
      productV4DAO
        .getProductsWithType(productType, 0, 1, [])
        .then((products) => {
          expect(products).to.be.an('array');
          expect(products.length).to.equal(1);
          products.forEach((product) => {
            expect(product).to.have.property('type', productType);
            expect(product).to.have.property('version', productVersion);
          });
          done();
        })
        .catch(done);
    });
    it('should return 3 Book when productType=book & limit=3,offset=0', (done) => {
      const productType = 'book';
      const productVersion = '1.0.0';
      productV4DAO
        .getProductsWithType(productType, 0, 3, [])
        .then((products) => {
          expect(products).to.be.an('array');
          expect(products.length).to.equal(3);
          products.forEach((product) => {
            expect(product).to.have.property('type', productType);
            expect(product).to.have.property('version', productVersion);
          });
          done();
        })
        .catch(done);
    });
    it('should return Books with only projected fields when the projections are passed', (done) => {
      const productType = 'book';
      const productVersion = '1.0.0';
      const projections = ['type', '_id', 'version', 'book', 'prices'];
      productV4DAO
        .getProductsWithType(productType, 0, 1, projections)
        .then((products) => {
          expect(products).to.be.an('array');
          expect(products.length).to.equal(1);
          products.forEach((product) => {
            expect(Object.keys(product).length).to.equal(projections.length);
            expect(product).to.have.property('type', productType);
            expect(product).to.have.property('version', productVersion);
            expect(product).to.have.property('book');
            expect(product).to.have.property('prices');
          });
          done();
        })
        .catch(done);
    });
    it('should return empty array [] when there is no product for the given type', (done) => {
      const productType = 'chapter';
      productV4DAO
        .getProductsWithType(productType, 0, 1, [])
        .then((products) => {
          expect(products).to.deep.equal([]);
          expect(products).to.be.an('array');
          expect(products.length).to.equal(0);
          done();
        })
        .catch(done);
    });
    it('should return Book when type & productVersion are valid', (done) => {
      const productType = 'book';
      const productVersion = '1.0.0';
      productV4DAO
        .getProductsWithType(
          productType,
          0,
          1,
          [],
          undefined,
          undefined,
          productVersion
        )
        .then((products) => {
          expect(products).to.be.an('array');
          expect(products.length).to.equal(1);
          products.forEach((product) => {
            expect(product).to.have.property('type', productType);
            expect(product).to.have.property('version', productVersion);
          });
          done();
        })
        .catch(done);
    });
    it('should return Book when type availabilityName & productVersion are valid', (done) => {
      const productType = 'book';
      const productVersion = '1.0.0';
      const availabilityName = 'some-channel';
      productV4DAO
        .getProductsWithType(
          productType,
          0,
          1,
          [],
          availabilityName,
          undefined,
          productVersion
        )
        .then((products) => {
          expect(products).to.be.an('array');
          expect(products.length).to.equal(1);
          products.forEach((product) => {
            expect(product).to.have.property('type', productType);
            expect(product).to.have.property('version', productVersion);
          });
          done();
        })
        .catch(done);
    });
    it('should return Book when type availabilityName & availabilityStatus are valid', (done) => {
      const productType = 'book';
      const productVersion = '1.0.0';
      const availabilityName = 'some-channel';
      const availabilityStatus = ['some-status', 'some-status1'];
      productV4DAO
        .getProductsWithType(
          productType,
          0,
          1,
          [],
          availabilityName,
          availabilityStatus,
          productVersion
        )
        .then((products) => {
          expect(products).to.be.an('array');
          expect(products.length).to.equal(1);
          products.forEach((product) => {
            expect(product).to.have.property('type', productType);
            expect(product).to.have.property('version', productVersion);
          });
          done();
        })
        .catch(done);
    });
    it('should return null when there is no product for productVersion = 1.0.1', (done) => {
      const productType = 'book';
      const productVersion = '1.0.1';
      productV4DAO
        .getProductsWithType(
          productType,
          0,
          1,
          [],
          undefined,
          undefined,
          productVersion
        )
        .then((products) => {
          expect(products).to.deep.equal([]);
          expect(products).to.be.an('array');
          expect(products.length).to.equal(0);
          done();
        })
        .catch(done);
    });
    it('should throw error Invalid projections. when projections are invalid', (done) => {
      const productType = 'book';
      const productVersion = '1.0.1';
      productV4DAO
        .getProductsWithType(
          productType,
          0,
          1,
          'invalid' as any,
          undefined,
          undefined,
          productVersion
        )
        .then(() => {
          done(new Error('Expecting error, but got success'));
        })
        .catch((err) => {
          expect(err.message).to.equal('Invalid projections.');
          done();
        })
        .catch(done);
    });
  });
  describe('getProductByTitle', () => {
    it(`should return 1 Book when productType=book and filter has title field and
    _id as null`, (done) => {
      const productType = 'book';
      const title = 'The Literary History of the Igbo Novel';
      productV4DAO
        .getProductByTitle(title, productType, ['type'])
        .then((product) => {
          expect(product).to.have.property('type', productType);
          expect(product).to.have.property(
            '_id',
            '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896'
          );
          done();
        })
        .catch(done);
    });
    it('should return null when there is no product for the given type', (done) => {
      const productType = 'chapter';
      const title = 'The Literary History of the Igbo Novel';
      productV4DAO
        .getProductByTitle(title, productType, ['type'])
        .then((product) => {
          expect(product).to.deep.equal(null);
          done();
        })
        .catch(done);
    });
  });
  describe('getProductByIdentifier', () => {
    it(`should query book collection and return book data when searching for title identifier and type=book`, (done) => {
      const identifierName = 'title';
      const identifierValue = 'The Literary History of the Igbo Novel';
      const productType = 'book';
      productV4DAO
        .getProductByIdentifier(identifierName, identifierValue, productType, [
          'type'
        ])
        .then((products) => {
          expect(products).to.be.an('array');
          expect(products.length).to.equal(3);
          products.forEach((product) => {
            expect(product).to.have.property('type', productType);
          });
          done();
        })
        .catch(done);
    });
    it('should return null when there is no book for the given identifier', (done) => {
      const identifierName = 'title';
      const identifierValue = 'some-randome-title';
      const productType = 'book';
      productV4DAO
        .getProductByIdentifier(identifierName, identifierValue, productType, [
          'type'
        ])
        .then((product) => {
          expect(product).to.deep.equal([]);
          done();
        })
        .catch(done);
    });
  });
  describe.skip('getPreArticlesByIdentifier', () => {
    it(`should query pre-articles collection and return pre-article data when searching 
    for submissionId identifier`, (done) => {
      const identifierName = 'submissionId';
      const identifierValues = ['172839139'];
      const productType = 'preArticle';
      productV4DAO
        .getPreArticlesByIdentifier(
          identifierName,
          identifierValues,
          productType,
          ['type']
        )
        .then((products) => {
          expect(products).to.be.an('array');
          expect(products.length).to.equal(1);
          products.forEach((product) => {
            expect(product).to.have.property('type', productType);
          });
          done();
        })
        .catch(done);
    });
    it('should return null when there is no preArticle for the given identifier', (done) => {
      const identifierName = 'submissionId';
      const identifierValues = ['invalid-sub-id'];
      const productType = 'preArticle';
      productV4DAO
        .getPreArticlesByIdentifier(
          identifierName,
          identifierValues,
          productType,
          ['type']
        )
        .then((product) => {
          expect(product).to.deep.equal([]);
          done();
        })
        .catch(done);
    });
    it(`should query pre-articles collection and return pre-article data when searching 
    for contributorsEmail identifier`, (done) => {
      const identifierName = 'contributorsEmail';
      const identifierValues = ['praveenmooli@mailinator.com'];
      const productType = 'preArticle';
      productV4DAO
        .getPreArticlesByIdentifier(
          identifierName,
          identifierValues,
          productType,
          ['type']
        )
        .then((products) => {
          expect(products).to.be.an('array');
          expect(products.length).to.equal(1);
          products.forEach((product) => {
            expect(product).to.have.property('type', productType);
          });
          done();
        })
        .catch(done);
    });
  });
  describe('getProductsCountByRule', () => {
    it('should return the total number of records satisfying the given rule', (done) => {
      const rule = {
        'identifiers.isbn': {
          $in: ['9780203357644']
        }
      };
      productV4DAO
        .getProductsCountByRule('book', rule)
        .then((result) => {
          expect(result).to.eql(1);
          done();
        })
        .catch(done);
    });
    it('should return the zero when there is no records satisfying the given rule', (done) => {
      const rule = {
        'identifiers.isbn': {
          $in: ['invalid-isbn']
        }
      };
      productV4DAO
        .getProductsCountByRule('book', rule)
        .then((result) => {
          expect(result).to.eql(0);
          done();
        })
        .catch(done);
    });
  });
  describe('getProductsPriceByRules', () => {
    it('should return the total prices info for the products satisfying the given rule', (done) => {
      const rule = {
        'identifiers.isbn': {
          $in: ['9781003017455']
        }
      };
      const expectedResult = [
        {
          currency: 'USD',
          price: 175 * 3,
          priceType: 'BYO Library Price',
          priceTypeCode: 'BYO',
          productsCount: 3
        },
        {
          currency: 'GBP',
          price: 135 * 3,
          priceType: 'BYO Library Price',
          priceTypeCode: 'BYO',
          productsCount: 3
        }
      ];
      productV4DAO
        .getProductsPriceByRules('book', rule)
        .then((result) => {
          expect(result).to.be.an('Array');
          expect(result.length).to.be.eql(2);
          expect(result).to.deep.equal(expectedResult);
          done();
        })
        .catch(done);
    });
    it('should return empty array when there is no products satisfying the given rule', (done) => {
      const rule = {
        'identifiers.isbn': {
          $in: ['invalid-isbn']
        }
      };
      productV4DAO
        .getProductsPriceByRules('book', rule)
        .then((result) => {
          expect(result).to.be.an('Array');
          expect(result.length).to.be.eql(0);
          done();
        })
        .catch(done);
    });
  });
  describe('getProductsByRule', () => {
    it('should return the products satisfying the given condition', (done) => {
      const rule = {
        'identifiers.isbn': {
          $in: ['9780203357644']
        }
      };
      const request: IProductsRuleRequest = {
        productType: 'book',
        projections: ['identifiers.isbn'],
        rules: rule,
        sortOrder: 'asc'
      };
      productV4DAO
        .getProductsByRule(request)
        .then((result) => {
          expect(result).to.be.an('Array');
          expect(result.length).to.be.eql(1);
          expect(result[0].identifiers.isbn).to.equal('9780203357644');
          done();
        })
        .catch(done);
    });
    it('should return empty array when there is no products satisfying the given condition', (done) => {
      const rule = {
        'identifiers.isbn': {
          $in: ['invalid-isbn']
        }
      };
      const request: IProductsRuleRequest = {
        limit: 1,
        offset: 1,
        productType: 'book',
        projections: ['_id', 'identifiers.isbn'],
        rules: rule,
        sortOrder: 'asc'
      };
      productV4DAO
        .getProductsByRule(request)
        .then((result) => {
          expect(result).to.be.an('Array');
          expect(result.length).to.be.eql(0);
          done();
        })
        .catch(done);
    });
    it('should return empty array when there is no products satisfying the given condition', (done) => {
      const rule = {
        'identifiers.doi': {
          $in: ['invalid-doi']
        }
      };
      const request: IProductsRuleRequest = {
        productType: 'book',
        projections: ['_id'],
        rules: rule,
        sortOrder: 'asc'
      };
      productV4DAO
        .getProductsByRule(request)
        .then((result) => {
          expect(result).to.be.an('Array');
          expect(result.length).to.be.eql(0);
          done();
        })
        .catch(done);
    });
    it(
      'should return the products along with the given availability info satisfying' +
        'the given condition',
      (done) => {
        const rule = {
          'identifiers.isbn': {
            $in: ['some-isbn']
          }
        };
        const request: IProductsRuleRequest = {
          availabilityName: 'some-channel',
          productType: 'book',
          projections: ['identifiers.isbn'],
          rules: rule,
          sortOrder: 'asc'
        };
        productV4DAO
          .getProductsByRule(request)
          .then((result) => {
            expect(result).to.be.an('Array');
            expect(result.length).to.be.eql(1);
            expect(result[0].identifiers.isbn).to.equal('some-isbn');
            expect(result[0].availability).to.be.an('Array');
            expect(result[0].availability.length).to.be.equals(1);
            expect(result[0].availability[0].name).to.equals('some-channel');
            expect(result[0].availability[0].status).to.eql([
              'some-status',
              'some-status1'
            ]);
            done();
          })
          .catch(done);
      }
    );
    it(`should return the products along with the given availability info satisfying
        the given condition having availability as array containing status with two
        channel for filter`, (done) => {
      const rule = {
        $and: [
          {
            'identifiers.isbn': {
              $in: ['9780429431920']
            }
          },
          {
            $and: [
              {
                availability: {
                  $elemMatch: {
                    name: 'UBX',
                    status: {
                      $in: ['SELLABLE', 'CAN_HOST', 'PUBLISHED']
                    }
                  }
                }
              },
              {
                availability: {
                  $elemMatch: {
                    name: 'AGG',
                    status: {
                      $all: ['CAN_SEND_TO_AGG']
                    }
                  }
                }
              }
            ]
          }
        ]
      };
      const availability = [
        {
          name: 'AGG',
          status: {
            ALL: ['CAN_SEND_TO_AGG']
          }
        },
        {
          name: 'UBX',
          status: {
            IN: ['SELLABLE', 'CAN_HOST', 'PUBLISHED']
          }
        }
      ];
      const request: IProductsRuleRequest = {
        availability,
        limit: 2,
        offset: 0,
        productType: 'book',
        projections: ['identifiers.isbn'],
        rules: rule,
        sortOrder: 'asc'
      };
      productV4DAO
        .getProductsByRule(request)
        .then((result) => {
          expect(result).to.be.an('Array');
          expect(result.length).to.be.eql(2);
          expect(result[0]._id).to.equal(
            'f209ebc7-a646-44dd-be3f-12a1656c6dcc'
          );
          expect(result[1]._id).to.equal(
            'f209ebc7-a646-44dd-be3f-12a1656c6dff'
          );
          expect(result[0].availability).to.be.an('Array');
          expect(result[0].availability.length).to.be.equals(2);
          expect(result[0].availability[0].name).to.equals('AGG');
          expect(result[0].availability[0].status).to.eql(['CAN_SEND_TO_AGG']);
          expect(result[0].availability[1].name).to.equals('UBX');
          expect(result[0].availability[1].status).to.eql([
            'SELLABLE',
            'CAN_HOST',
            'PUBLISHED'
          ]);
          done();
        })
        .catch(done);
    });
    it(`should return the products along with the given availability info satisfying
      the given condition having availability as array containing status with two
      channel for filter and format equal to e-Book`, (done) => {
      const rule = {
        $and: [
          {
            'book.format': {
              $eq: 'e-Book'
            }
          },
          {
            $and: [
              {
                availability: {
                  $elemMatch: {
                    name: 'UBX',
                    status: {
                      $in: ['SELLABLE', 'CAN_HOST', 'PUBLISHED']
                    }
                  }
                }
              },
              {
                availability: {
                  $elemMatch: {
                    name: 'AGG',
                    status: {
                      $all: ['CAN_SEND_TO_AGG']
                    }
                  }
                }
              }
            ]
          }
        ]
      };
      const availability = [
        {
          name: 'AGG',
          status: {
            ALL: ['CAN_SEND_TO_AGG']
          }
        },
        {
          name: 'UBX',
          status: {
            IN: ['SELLABLE', 'CAN_HOST', 'PUBLISHED']
          }
        }
      ];
      const request: IProductsRuleRequest = {
        availability,
        limit: 2,
        offset: 0,
        productType: 'book',
        projections: ['_id', 'identifiers.isbn'],
        rules: rule,
        sortOrder: 'asc'
      };
      productV4DAO
        .getProductsByRule(request)
        .then((result) => {
          expect(result).to.be.an('Array');
          expect(result.length).to.be.eql(1);
          expect(result[0]._id).to.equal(
            'f209ebc7-a646-44dd-be3f-12a1656c6dff'
          );
          expect(result[0].availability).to.be.an('Array');
          expect(result[0].availability.length).to.be.equals(2);
          expect(result[0].availability[0].name).to.equals('AGG');
          expect(result[0].availability[0].status).to.eql(['CAN_SEND_TO_AGG']);
          expect(result[0].availability[1].name).to.equals('UBX');
          expect(result[0].availability[1].status).to.eql([
            'SELLABLE',
            'CAN_HOST',
            'PUBLISHED'
          ]);
          done();
        })
        .catch(done);
    });
    it(`should return the products along with the given availability info satisfying
      the given condition having availability as array containing status with single
      channel for filter using IN operator`, (done) => {
      const rule = {
        $and: [
          {
            'book.formatCode': {
              $eq: 'EBK'
            }
          },
          {
            $and: [
              {
                availability: {
                  $elemMatch: {
                    name: 'AGG',
                    status: {
                      $in: ['SHOULD_NOTIFY']
                    }
                  }
                }
              }
            ]
          }
        ]
      };
      const availability = [
        {
          name: 'AGG',
          status: {
            IN: ['SHOULD_NOTIFY']
          }
        }
      ];
      const request: IProductsRuleRequest = {
        availability,
        limit: 2,
        offset: 0,
        productType: 'book',
        projections: ['identifiers.isbn'],
        rules: rule,
        sortOrder: 'asc'
      };
      productV4DAO
        .getProductsByRule(request)
        .then((result) => {
          expect(result).to.be.an('Array');
          expect(result.length).to.be.eql(1);
          expect(result[0]._id).to.equal(
            '7ce1dd8d-f398-4e54-9202-91d463ce28ee'
          );
          expect(result[0].availability).to.be.an('Array');
          expect(result[0].availability.length).to.be.equals(1);
          expect(result[0].availability[0].name).to.equals('AGG');
          expect(result[0].availability[0].status).to.eql(['SHOULD_NOTIFY']);
          done();
        })
        .catch(done);
    });
    it(`should return the products along with the given availability info satisfying
      the given condition having availability as array containing status with single
      channel for filter using ALL operator`, (done) => {
      const rule = {
        $and: [
          {
            'book.formatCode': {
              $eq: 'EBK'
            }
          },
          {
            $and: [
              {
                availability: {
                  $elemMatch: {
                    name: 'AGG',
                    status: {
                      $all: ['CAN_SEND_TO_AGG']
                    }
                  }
                }
              }
            ]
          }
        ]
      };
      const availability = [
        {
          name: 'AGG',
          status: {
            ALL: ['CAN_SEND_TO_AGG']
          }
        }
      ];
      const request: IProductsRuleRequest = {
        availability,
        limit: 2,
        offset: 0,
        productType: 'book',
        projections: ['identifiers.isbn'],
        rules: rule,
        sortOrder: 'asc'
      };
      productV4DAO
        .getProductsByRule(request)
        .then((result) => {
          expect(result).to.be.an('Array');
          expect(result.length).to.be.eql(2);
          expect(result[0]._id).to.equal(
            'f209ebc7-a646-44dd-be3f-12a1656c6dcc'
          );
          expect(result[1]._id).to.equal(
            'f209ebc7-a646-44dd-be3f-12a1656c6dff'
          );
          expect(result[0].availability).to.be.an('Array');
          expect(result[0].availability.length).to.be.equals(1);
          expect(result[0].availability[0].name).to.equals('AGG');
          expect(result[0].availability[0].status).to.eql(['CAN_SEND_TO_AGG']);
          done();
        })
        .catch(done);
    });
    it(`should return the empty products when availability is provided as an array along
        with squery and offset`, (done) => {
      const rule = {
        'identifiers.isbn': {
          $in: ['some-isbn']
        }
      };
      const availability = [
        {
          name: 'another-channel',
          status: {
            ALL: ['some-status', 'some-status1']
          }
        },
        {
          name: 'some-channel',
          status: {
            IN: ['some-status', 'some-status1']
          }
        }
      ];
      const request: IProductsRuleRequest = {
        availability,
        limit: 2,
        offset: 1,
        offsetCursor: 'last-page-cursor',
        productType: 'book',
        projections: ['identifiers.isbn'],
        rules: rule,
        sortOrder: 'asc'
      };
      productV4DAO
        .getProductsByRule(request)
        .then((result) => {
          expect(result).to.be.an('Array');
          expect(result.length).to.be.eql(0);
          done();
        })
        .catch(done);
    });
    it(`should return the empty products when availability is provided as an array along
        with squery and offset`, (done) => {
      const rule = {
        'identifiers.isbn': {
          $in: ['some-isbn']
        }
      };
      const availability = [
        {
          name: 'another-channel',
          status: {
            ALL: ['some-status', 'some-status1']
          }
        },
        {
          name: 'some-channel',
          status: {
            IN: ['some-status', 'some-status1']
          }
        }
      ];
      const request: IProductsRuleRequest = {
        availability,
        limit: 2,
        offset: 1,
        offsetCursor: 'some-id',
        productType: 'book',
        projections: ['identifiers.isbn'],
        rules: rule,
        sortOrder: 'asc'
      };
      productV4DAO
        .getProductsByRule(request)
        .then((result) => {
          expect(result).to.be.an('Array');
          expect(result.length).to.be.eql(0);
          done();
        })
        .catch(done);
    });
    it(`should return the empty products when availability is provided as an array along
        with squery and offset`, (done) => {
      const rule = {
        'identifiers.isbn': {
          $in: ['some-isbn']
        }
      };
      const availability = [
        {
          name: 'another-channel',
          status: {
            ALL: ['some-status', 'some-status1']
          }
        },
        {
          name: 'some-channel',
          status: {
            IN: ['some-status', 'some-status1']
          }
        }
      ];
      const request: IProductsRuleRequest = {
        availability,
        limit: 2,
        offset: 1,
        offsetCursor: 'some-id',
        productType: 'book',
        projections: ['identifiers.isbn'],
        rules: rule,
        sortOrder: 'asc'
      };
      productV4DAO
        .getProductsByRule(request)
        .then((result) => {
          expect(result).to.be.an('Array');
          expect(result.length).to.be.eql(0);
          done();
        })
        .catch(done);
    });
    it('should return the products with asc sort order for the given field', (done) => {
      const rule = {
        'identifiers.isbn': {
          $in: ['some-isbn', '9780203357644']
        }
      };
      const request: IProductsRuleRequest = {
        limit: 2,
        offset: 0,
        productType: 'book',
        projections: ['identifiers.isbn'],
        rules: rule,
        sortOrder: 'asc'
      };
      productV4DAO
        .getProductsByRule(request)
        .then((result) => {
          expect(result).to.be.an('Array');
          expect(result.length).to.be.eql(2);
          // used to validate (deep equal) entire array (including it's object fields and values )
          expect(result).to.eql([
            {
              _id: 'b4d25b04-9ca8-4f8d-9b84-72d6bc5577e1',
              identifiers: { isbn: '9780203357644' }
            },
            { _id: 'some-uuid', identifiers: { isbn: 'some-isbn' } }
          ]);
          done();
        })
        .catch(done);
    });
    // Sortby field is no more supported
    it.skip('should return the products with desc sort order for the given field', (done) => {
      const rule = {
        'identifiers.isbn': {
          $in: ['some-isbn', '9780203357644']
        }
      };
      const sortBy = 'identifiers.isbn';
      const sortOrder = 'desc';
      const request: IProductsRuleRequest = {
        limit: 2,
        offset: 0,
        productType: 'book',
        projections: ['identifiers.isbn'],
        rules: rule,
        sortOrder
      };
      productV4DAO
        .getProductsByRule(request)
        .then((result) => {
          expect(result).to.be.an('Array');
          expect(result.length).to.be.eql(2);
          // validate deep equal
          expect(result).to.eql([
            { _id: 'some-uuid', identifiers: { isbn: 'some-isbn' } },
            {
              _id: 'b4d25b04-9ca8-4f8d-9b84-72d6bc5577e1',
              identifiers: { isbn: '9780203357644' }
            }
          ]);
          done();
        })
        .catch(done);
    });
    it('should return the products with asc order based on mongo _id', (done) => {
      const rule = {
        'identifiers.isbn': {
          $in: ['some-isbn', '9780203357644']
        }
      };
      const request: IProductsRuleRequest = {
        limit: 2,
        offset: 0,
        offsetCursor: '9780203357644',
        productType: 'book',
        projections: ['identifiers.isbn'],
        rules: rule,
        sortOrder: 'asc'
      };
      productV4DAO
        .getProductsByRule(request)
        .then((result) => {
          expect(result).to.be.an('Array');
          expect(result.length).to.be.eql(2);
          expect(result).to.deep.equal([
            {
              _id: 'b4d25b04-9ca8-4f8d-9b84-72d6bc5577e1',
              identifiers: { isbn: '9780203357644' }
            },
            { _id: 'some-uuid', identifiers: { isbn: 'some-isbn' } }
          ]);
          done();
        })
        .catch(done);
    });
    it('should return the products with desc order based on mongo _id', (done) => {
      const rule = {
        'identifiers.isbn': {
          $in: ['some-isbn', '9780203357644']
        }
      };
      const request: IProductsRuleRequest = {
        limit: 2,
        offset: 0,
        offsetCursor: 'last-page-cursor',
        productType: 'book',
        projections: ['identifiers.isbn'],
        rules: rule,
        sortOrder: 'desc'
      };
      productV4DAO
        .getProductsByRule(request)
        .then((result) => {
          expect(result).to.be.an('Array');
          expect(result.length).to.be.eql(2);
          expect(result).to.deep.equal([
            { _id: 'some-uuid', identifiers: { isbn: 'some-isbn' } },
            {
              _id: 'b4d25b04-9ca8-4f8d-9b84-72d6bc5577e1',
              identifiers: { isbn: '9780203357644' }
            }
          ]);
          done();
        })
        .catch(done);
    });
  });
  describe('getProductsByIds', () => {
    it('should return Book when productType=book & single valid id & productVersion are passed', (done) => {
      const productType = 'book';
      const productVersion = '1.0.0';
      const id = '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896';
      productV4DAO
        .getProductsByIds(productType, [id], { productVersion })
        .then((products) => {
          expect(products).to.be.an('array');
          expect(products.length).to.equal(1);
          products.forEach((product) => {
            expect(product).to.have.property('type', productType);
            expect(product).to.have.property('version', productVersion);
          });
          done();
        })
        .catch(done);
    });
    it('should return Books when productType=book & multiple valid ids are passed', (done) => {
      const productType = 'book';
      const id1 = '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896';
      const id2 = '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6897';
      productV4DAO
        .getProductsByIds(productType, [id1, id2], {})
        .then((products) => {
          expect(products).to.be.an('array');
          expect(products.length).to.equal(2);
          products.forEach((product) => {
            expect(product).to.have.property('type', productType);
          });
          done();
        })
        .catch(done);
    });
    it('should return Books when productType=book & projections are passed', (done) => {
      const productType = 'book';
      const id1 = '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896';
      const id2 = '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6897';
      const projectionFields = [
        'identifiers.doi',
        'contributors.roles',
        'contributors.fullName',
        'book.format',
        'book.subtitle',
        'book.publicationDate',
        'book.publisherImprint'
      ];
      productV4DAO
        .getProductsByIds(productType, [id1, id2], { projectionFields })
        .then((products) => {
          expect(products).to.be.an('array');
          expect(products.length).to.equal(2);
          products.forEach((product) => {
            expect(product).to.have.property('identifiers');
            expect(product).to.have.property('contributors');
            expect(product).to.have.property('book');
          });
          done();
        })
        .catch(done);
    });
  });
});
