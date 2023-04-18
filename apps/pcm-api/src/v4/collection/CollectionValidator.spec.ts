import { expect } from 'chai';
import * as sinon from 'sinon';

import { S3UtilsV4 } from '../utils/S3UtilsV4';
import { collectionValidator } from './CollectionValidator';

describe('CollectionValidator', () => {
  let s3UtilsV4Mock;
  describe('validateInputCollection', () => {
    let product;
    beforeEach(() => {
      product = {
        _id: '588475b5-3ae7-4bb9-9de3-cbcb54c3af91',
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
          autoRollover: false,
          description: '<P>Collection of chapters and articles for SDGO</P>',
          plannedPublicationDate: '2020-09-29T00:00:00.000Z',
          status: 'planned',
          subtitle: '',
          validTo: '2020-09-30T00:00:00.000Z'
        },
        partsAdded: [
          {
            endDate: '2020-10-26T14:16:27.308Z',
            identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
            isFree: false,
            position: 1,
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
            position: 1,
            startDate: '2020-10-26T14:16:27.308Z',
            type: 'book'
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
        type: 'collection'
      };
    });
    it('should validate without any error when input collection is valid', async () => {
      const isValid = await collectionValidator.validateCollection(product);
      // tslint:disable-next-line: no-unused-expression
      expect(isValid).to.be.true;
    });
    it(`should validate without any error when partsAdded/partUpdated/partsDeleted
            all are null`, async () => {
      product.partsUpdated = null;
      product.partsAdded = null;
      product.partsRemoved = null;
      const isValid = await collectionValidator.validateCollection(product);
      // tslint:disable-next-line: no-unused-expression
      expect(isValid).to.be.true;
    });
    it('should return error when product has isPartOf field', async () => {
      product.isPartOf = [];
      try {
        await collectionValidator.validateCollection(product);
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal('Invalid property(s): isPartOf');
      }
    });
    it('should return error when product has invalid categories field', async () => {
      product.categories = null;
      try {
        await collectionValidator.validateCollection(product);
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          'Missing or Invalid required field: categories'
        );
      }
    });
    it('should return error when dynamic collection has missing rulesList', async () => {
      product.rulesList = [];
      try {
        await collectionValidator.validateCollection(product);
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          'Invalid or missing search rules for dynamic collection'
        );
      }
    });
    it(`should process without error when static collection has
            missing rulesList`, async () => {
      product.categories = [
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
      ];
      const isValid = await collectionValidator.validateCollection(product);
      // tslint:disable-next-line: no-unused-expression
      expect(isValid).to.be.true;
    });
    it(`should process without error when static collection has
            missing rulesList`, async () => {
      product.categories = [
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
      ];
      product.collection.autoRollover = true;
      try {
        await collectionValidator.validateCollection(product);
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          'Invalid autoRollover field for static collection'
        );
      }
    });
    it(`should return error when product collection validTo date is lesser that
            plannedPublicationDate`, async () => {
      product.collection = {
        plannedPublicationDate: '2020-09-30T00:00:00.000Z',
        status: 'planned',
        validTo: '2020-09-29T00:00:00.000Z'
      };
      try {
        await collectionValidator.validateCollection(product);
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          'validTo date should be greater than ' + 'plannedPublicationDate.'
        );
      }
    });
    it(`should return error when position field is missing inside
            partsAdded in static collection`, async () => {
      product.categories = [
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
      ];
      product.partsAdded = [
        {
          endDate: '2020-09-30T00:00:00.000Z',
          identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
          isFree: false,
          startDate: '2020-10-30T00:00:00.000Z',
          type: 'book'
        }
      ];
      try {
        await collectionValidator.validateCollection(product);
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          'Position field is required for static collection'
        );
      }
    });
    it(`should return error when position field is missing inside
            partsUpdated in static collection`, async () => {
      product.partsUpdated = [
        {
          endDate: '2020-09-30T00:00:00.000Z',
          identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
          isFree: false,
          startDate: '2020-09-30T00:00:00.000Z',
          type: 'book'
        }
      ];
      try {
        await collectionValidator.validateCollection(product);
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          'Position field is required for static collection'
        );
      }
    });
    it(`should return error when position are duplicated inside
            partsAdded in static collection`, async () => {
      product.categories = [
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
      ];
      product.partsAdded = [
        {
          endDate: '2020-09-30T00:00:00.000Z',
          identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
          isFree: false,
          position: 1,
          startDate: '2020-09-30T00:00:00.000Z',
          type: 'book'
        },
        {
          endDate: '2020-09-30T00:00:00.000Z',
          identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
          isFree: false,
          position: 1,
          startDate: '2020-09-30T00:00:00.000Z',
          type: 'book'
        }
      ];
      try {
        await collectionValidator.validateCollection(product);
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal('Parts should contain unique position');
      }
    });
    it(`should return error when position are duplicated inside
            partsUpdated in static collection`, async () => {
      product.categories = [
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
      ];
      product.partsUpdated = [
        {
          endDate: '2020-09-30T00:00:00.000Z',
          identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
          isFree: false,
          position: 1,
          startDate: '2020-09-30T00:00:00.000Z',
          type: 'book'
        },
        {
          endDate: '2020-09-30T00:00:00.000Z',
          identifier: '4ad89e51-de6a-4ab2-b337-12536ab9d760',
          isFree: false,
          position: 1,
          startDate: '2020-09-30T00:00:00.000Z',
          type: 'book'
        }
      ];
      try {
        await collectionValidator.validateCollection(product);
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal('Parts should contain unique position');
      }
    });
    it(`should return error when validTo date is not in ISO format`, async () => {
      product.collection.validTo = '2020-10-29T00:00:00.000';
      product.collection.plannedPublicationDate = '2020-10-26T14:16:27.308Z';
      try {
        await collectionValidator.validateCollection(product);
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          'validTo and plannedPublicationDate should ' + 'have ISO date format'
        );
      }
    });
    it(`should return error when action is update and ruleUpdateStartDate/ruleUpdateEndDate
            is missing in request payload`, async () => {
      const action = 'update';
      try {
        await collectionValidator.validateCollection(product, action);
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          'Missing ruleUpdateStartDate/ruleUpdateEndDate in the request payload.'
        );
      }
    });
    it('should return error when category name "collection-type" is missing', async () => {
      product.categories = [
        {
          code: null,
          name: 'collection-update-type',
          type: 'dynamic'
        }
      ];
      try {
        await collectionValidator.validateCollection(product);
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          'Category must contain collection-type and collection-update-type'
        );
      }
    });
    it('should return error when availability field passed as collection metadata', async () => {
      product.availability = [];
      try {
        await collectionValidator.validateCollection(product);
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal('Invalid property(s): availability');
      }
    });
    it('should return error when availability filter passed at product level', async () => {
      product.rulesList = [
        {
          availability: [],
          type: 'book'
        }
      ];
      try {
        await collectionValidator.validateCollection(product);
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          'Invalid availability filter, product ' +
            'level availability filter is not allowed'
        );
      }
    });
    it(
      'should return error when category field has incorrect' +
        '"collection-update-type"',
      async () => {
        product.categories = [
          {
            code: null,
            name: 'collection-type',
            type: 'netbase'
          },
          {
            code: null,
            name: 'collection-update-type',
            type: 'garbage'
          }
        ];
        try {
          await collectionValidator.validateCollection(product);
        } catch (err) {
          expect(err.code).to.equal(400);
          expect(err.message).to.equal(
            'Category type must be of type static or dynamic'
          );
        }
      }
    );
    it(`should return error when any of partsUpdated partIds match with
            product _id`, async () => {
      product.partsUpdated = [
        {
          endDate: '2020-10-26T14:16:27.308Z',
          identifier: '588475b5-3ae7-4bb9-9de3-cbcb54c3af91',
          isFree: false,
          position: 1,
          startDate: '2020-10-26T14:16:27.308Z',
          type: 'book'
        }
      ];
      try {
        await collectionValidator.validateCollection(product);
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          product._id +
            ' ' +
            'should not match with any of parts ' +
            'update/delete/added id in the request payload'
        );
      }
    });
    it(`should return error when any of partsRemoved partIds match with product
            _id`, async () => {
      product.partsRemoved = [
        {
          endDate: '2020-10-26T14:16:27.308Z',
          identifier: '588475b5-3ae7-4bb9-9de3-cbcb54c3af91',
          isFree: false,
          position: 1,
          startDate: '2020-10-26T14:16:27.308Z',
          type: 'book'
        }
      ];
      try {
        await collectionValidator.validateCollection(product);
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          product._id +
            ' ' +
            'should not match with any of parts ' +
            'update/delete/added id in the request payload'
        );
      }
    });
    it(`should return error when any of partsAdded partIds match with product
           _id`, async () => {
      product.partsAdded = [
        {
          endDate: '2020-10-26T14:16:27.308Z',
          identifier: '588475b5-3ae7-4bb9-9de3-cbcb54c3af91',
          isFree: false,
          position: 1,
          startDate: '2020-10-26T14:16:27.308Z',
          type: 'book'
        }
      ];
      try {
        await collectionValidator.validateCollection(product);
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          product._id +
            ' ' +
            'should not match with any of parts ' +
            'update/delete/added id in the request payload'
        );
      }
    });
  });
  describe('validateCollectionId', () => {
    const requestParams = {};
    requestParams['identifierName'] = 'collectionId';
    requestParams['identifierValue'] = 'XYZ-1234';
    it('should return true when collectionId in valid', () => {
      const isValid = collectionValidator.validateCollectionId(requestParams);
      // tslint:disable-next-line: no-unused-expression
      expect(isValid).to.be.true;
    });
    it('should return error when identifier name is missing', () => {
      try {
        requestParams['identifierName'] = null;
        collectionValidator.validateCollectionId(requestParams);
      } catch (err) {
        expect(err.message).to.equal('Missing parameter identifierName');
        expect(err.code).to.equal(400);
      }
    });
    it('should return error when identifier value is missing', () => {
      try {
        requestParams['identifierName'] = 'collectionId';
        requestParams['identifierValue'] = null;
        collectionValidator.validateCollectionId(requestParams);
      } catch (err) {
        expect(err.message).to.equal('Missing parameter identifierValue');
        expect(err.code).to.equal(400);
      }
    });
    it('should return error when identifier name is incorrect', () => {
      try {
        requestParams['identifierName'] = 'some-name';
        collectionValidator.validateCollectionId(requestParams);
      } catch (err) {
        expect(err.message).to.equal('Incorrect identifierName some-name');
        expect(err.code).to.equal(400);
      }
    });
    it('should return error when invalid parameter sent in request params', () => {
      try {
        requestParams['invalidParams'] = 'some-name';
        collectionValidator.validateCollectionId(requestParams);
      } catch (err) {
        expect(err.message).to.equal('Invalid parameter invalidParams');
        expect(err.code).to.equal(400);
      }
    });
    it('should return error when an asset identifier name and type both are passed', () => {
      const params = {};
      try {
        params['identifierName'] = 'isbn';
        params['identifierValue'] = 'some-isbn';
        params['type'] = 'collection';
        collectionValidator.validateCollectionId(params);
      } catch (err) {
        expect(err.message).to.equal('Additional parameter type not required');
        expect(err.code).to.equal(400);
      }
    });
    it('should return error when a non-asset identifier is passed without type', () => {
      const params = {};
      try {
        params['identifierName'] = 'title';
        params['identifierValue'] = 'some-title';
        collectionValidator.validateCollectionId(params);
      } catch (err) {
        expect(err.message).to.equal('Missing parameter type');
        expect(err.code).to.equal(400);
      }
    });
    it('should return error when type is passed with an incorrect value', () => {
      const params = {};
      try {
        params['identifierName'] = 'title';
        params['identifierValue'] = 'some-title';
        params['type'] = 'invalid-product-type';
        collectionValidator.validateCollectionId(params);
      } catch (err) {
        expect(err.message).to.equal('Incorrect product type');
        expect(err.code).to.equal(400);
      }
    });
  });
  describe('validateInputCollection with AssociatedMedia', () => {
    let product;
    beforeEach(() => {
      s3UtilsV4Mock = sinon.mock(S3UtilsV4);
      product = {
        _id: 'some-collection-id',
        associatedMedia: [
          {
            location:
              'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/collection/some-collection-id/coverimage.jpg',
            type: 'coverimage'
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
        collection: {
          description: '<P>Collection of chapters and articles for SDGO</P>',
          status: 'planned',
          subtitle: ''
        },
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
        type: 'collection'
      };
    });
    const bucket = 's3-euw1-ap-pe-df-pch-content-store-d';
    const keyPrefix = 'collection/some-collection-id';
    it('should return error when associated media is invalid', async () => {
      product.associatedMedia = 'invalid-type';
      try {
        await collectionValidator.validateCollection(product);
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal('Invalid associated media');
      }
    });
    it('should validate without any error when associated media is empty', async () => {
      product.associatedMedia = [];
      s3UtilsV4Mock.expects('headObjects').never();
      await collectionValidator
        .validateCollection(product)
        .then((isValid: boolean) => {
          expect(isValid).to.equal(true);
          s3UtilsV4Mock.verify();
        })
        .catch()
        .finally(() => {
          s3UtilsV4Mock.restore();
        });
    });
    it('should validate without any errors when associated media is valid', async () => {
      const associatedMedia = product.associatedMedia;
      associatedMedia.push({
        location:
          'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/collection/some-collection-id/bannerimage.jpg',
        type: 'bannerimage'
      });
      product.associatedMedia = associatedMedia;
      s3UtilsV4Mock
        .expects('headObjects')
        .once()
        .withArgs(bucket, keyPrefix + '/coverimage.jpg')
        .resolves(true);
      s3UtilsV4Mock
        .expects('headObjects')
        .once()
        .withArgs(bucket, keyPrefix + '/bannerimage.jpg')
        .resolves(true);
      await collectionValidator
        .validateCollection(product)
        .then((isValid) => {
          expect(isValid).to.equal(true);
          s3UtilsV4Mock.verify();
        })
        .catch()
        .finally(() => {
          s3UtilsV4Mock.restore();
        });
    });
    it('should return error when associated media type is invalid', async () => {
      product.associatedMedia[0].type = 'invalid-type';
      s3UtilsV4Mock.expects('headObjects').never();
      try {
        await collectionValidator.validateCollection(product);
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          `Invalid associatedMedia type: ${product.associatedMedia[0].type}`
        );
        s3UtilsV4Mock.verify();
      } finally {
        s3UtilsV4Mock.restore();
      }
    });
    it('should return error when s3 link is invalid', async () => {
      s3UtilsV4Mock
        .expects('headObjects')
        .once()
        .withArgs(bucket, keyPrefix + '/coverimage.jpg')
        .resolves(false);
      try {
        await collectionValidator.validateCollection(product);
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          `Invalid S3 URI: ${product.associatedMedia[0].location} for ${product.associatedMedia[0].type}`
        );
        s3UtilsV4Mock.verify();
      } finally {
        s3UtilsV4Mock.restore();
      }
    });
    it('should return error when s3 link is invalid', async () => {
      product.associatedMedia[0].location = 'some-invalid-url';
      s3UtilsV4Mock.expects('headObjects').never();
      try {
        await collectionValidator.validateCollection(product);
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          `Invalid S3 URI: ${product.associatedMedia[0].location} for ${product.associatedMedia[0].type}`
        );
        s3UtilsV4Mock.verify();
      } finally {
        s3UtilsV4Mock.restore();
      }
    });
  });
});
