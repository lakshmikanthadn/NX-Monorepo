import { MongooseSchema, StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import { expect } from 'chai';
import * as _ from 'lodash';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as sinon from 'sinon';
import { ISearchReqDownload } from '../model/interfaces/SearchResult';

import { searchQueryUtil } from '../../utils/SearchQueryUtil';
import { assetV4Service } from '../assets/AssetV4.Service';
import { associatedMediaV4Service } from '../associatedMedia/AssociatedMediaV4.Service';
import { apiResponseGroupConfig } from '../config';
import { creativeWorkV4Service } from '../creativeWork/CreativeWorkV4.Service';
import { IProductFilterOptions } from '../model/interfaces/ProductFilterOptions';
import { taxonomyV4Service } from '../taxonomy/TaxonomyV4.Service';
import { assetsTestData } from '../test/data/AssetsV4';
import { associatedMediaTestData } from '../test/data/AssociatedMediaV4';
import { booksTestData } from '../test/data/BookV4';
import { S3UtilsV4 } from '../utils/S3UtilsV4';
import { SQSUtilsV4 } from '../utils/SQSUtilsV4';
import { Config } from '../../config/config';
import { productV4DAO } from './ProductV4.DAO';
import { manuscriptV4DAO } from './ManuscriptV4.DAO';
import { productV4Service } from './ProductV4.Service';
import { simpleStorageService } from '../aws/sns/SimpleStorage.Service';
import { eventService } from '../event/Event.Service';
import { ISQSQueueUrlData } from 'v4/model/interfaces/SQSQueueUrlData';
import { GroupedSearchQuery } from '@tandfgroup/pcm-rules-parser';

const featureToggles = Config.getPropertyValue('featureToggles');
const urlDomain = Config.getPropertyValue('ubxWebsUrl');
const searchResultDownloadQueue: ISQSQueueUrlData = Config.getPropertyValue(
  'searchResultDownloadQueue'
);

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
  const associatedMediaV4ServiceMock = sinon.mock(associatedMediaV4Service);
  const creativeWorkV4ServiceMock = sinon.mock(creativeWorkV4Service);
  const productV4DAOMock = sinon.mock(productV4DAO);
  const manuscriptV4DAOMock = sinon.mock(manuscriptV4DAO);
  const assetV4ServiceMock = sinon.mock(assetV4Service);
  const taxonomyV4ServiceMock = sinon.mock(taxonomyV4Service);
  const apiResponseGroupConfigMock = sinon.mock(apiResponseGroupConfig);
  const s3UtilsV4Mock = sinon.mock(S3UtilsV4);
  const sqsUtilsV4Mock = sinon.mock(SQSUtilsV4);
  const searchQueryUtilMock = sinon.mock(searchQueryUtil);
  const simpleStorageServiceMock = sinon.mock(simpleStorageService);
  return {
    apiResponseGroupConfigMock,
    assetV4ServiceMock,
    associatedMediaV4ServiceMock,
    creativeWorkV4ServiceMock,
    manuscriptV4DAOMock,
    productV4DAOMock,
    s3UtilsV4Mock,
    searchQueryUtilMock,
    simpleStorageServiceMock,
    sqsUtilsV4Mock,
    taxonomyV4ServiceMock
  };
}

describe('ProductV4Service', () => {
  it('should have all the required methods', () => {
    expect(productV4Service).to.respondTo('getProductById');
    expect(productV4Service).to.respondTo('getProductsByDynamicIds');
    expect(productV4Service).to.respondTo('getProductsWithType');
    expect(productV4Service).to.respondTo('getNewId');
    expect(productV4Service).to.respondTo('createProduct');
    expect(productV4Service).to.respondTo('getTaxonomy');
    expect(productV4Service).to.respondTo('getAvailabilityForChannel');
    expect(productV4Service).to.respondTo('getReport');
    expect(productV4Service).to.respondTo('getProductByIdentifier');
  });
  let assetV4ServiceMock;
  let associatedMediaV4ServiceMock;
  let productV4DAOMock;
  let manuscriptV4DAOMock;
  beforeEach(() => {
    assetV4ServiceMock = sinon.mock(assetV4Service);
    associatedMediaV4ServiceMock = sinon.mock(associatedMediaV4Service);
    productV4DAOMock = sinon.mock(productV4DAO);
    manuscriptV4DAOMock = sinon.mock(manuscriptV4DAO);
  });
  describe('getReport', () => {
    it('should return signed url when request is valid', (done) => {
      const type = 'salessheets';
      const bucketName = Config.getPropertyValue('contentS3Bucket');
      const absolutePath = `${type}/reports/daily/${type}.zip`;
      const unsignedUrl = `https://${bucketName}.s3.eu-west-1.amazonaws.com/${absolutePath}`;
      const stubData = getStubData();
      stubData.s3UtilsV4Mock
        .expects('getPresignedUrlToRead')
        .once()
        .withArgs(unsignedUrl, false, false)
        .resolves('some-sign-url');
      productV4Service
        .getReport(type)
        .then((result) => {
          expect(result).to.equal('some-sign-url');
          stubData.s3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.s3UtilsV4Mock.restore();
        });
    });
  });
  describe('getProductById', () => {
    it('should return a product large when the response group is large', (done) => {
      const id = '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896';
      const productType = 'book';
      const responseGroup = 'large';
      const productVersion = '4.0.1';
      const availability = [
        {
          errors: ['random'],
          name: 'some-channel',
          status: ['some-status', 'some-status1']
        },
        {
          errors: ['random'],
          name: 'another-channel',
          status: ['some-status', 'some-status1']
        }
      ];
      const associatedMediaTestDataCopy = JSON.parse(
        JSON.stringify(associatedMediaTestData)
      );
      const stubData = getStubData();
      // Set expectation of/from Asset Service.
      stubData.assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id)
        .resolves({ _id: id, type: productType });
      // Set the expectation of/from api Response Group Config
      stubData.apiResponseGroupConfigMock
        .expects('getProjectionFields')
        .once()
        .withArgs(productType, responseGroup)
        .returns(['_id', 'type', 'associatedMedia', 'availability']);
      // Set expectation of/from Product DAO.
      stubData.productV4DAOMock
        .expects('getProduct')
        .once()
        .withArgs(
          productType,
          id,
          ['_id', 'type', 'associatedMedia', 'availability'],
          undefined,
          undefined,
          productVersion
        )
        .resolves({ _id: id, availability, type: productType });
      // Set expectation of/from Associated media Service.
      stubData.associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, false)
        .resolves(
          associatedMediaTestDataCopy.filter(
            (asstMedia) => asstMedia.parentId === id
          )
        );

      productV4Service
        .getProductById(id, responseGroup, productVersion)
        .then((productWrapper) => {
          expect(productWrapper).to.have.nested.property('product._id', id);
          expect(productWrapper).to.have.nested.property(
            'product.type',
            productType
          );
          expect(productWrapper).to.have.property('availability', availability);
          stubData.associatedMediaV4ServiceMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.apiResponseGroupConfigMock.verify();
          stubData.productV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.associatedMediaV4ServiceMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.apiResponseGroupConfigMock.restore();
          stubData.productV4DAOMock.restore();
        });
    });
    it(`should return a product large when the response group is large`, (done) => {
      const id = '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896';
      const productType = 'book';
      const responseGroup = 'large';
      const productVersion = '4.0.1';
      const availability = [
        {
          errors: ['random'],
          name: 'some-channel',
          status: ['some-status', 'some-status1']
        },
        {
          errors: ['random'],
          name: 'another-channel',
          status: ['some-status', 'some-status1']
        }
      ];
      const associatedMediaTestDataCopy = JSON.parse(
        JSON.stringify(associatedMediaTestData)
      );
      const stubData = getStubData();
      // Set expectaion of/from Asset Service.
      stubData.assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id)
        .resolves({ _id: id, type: productType });
      // Set the expectation of/from api Response Group Config
      stubData.apiResponseGroupConfigMock
        .expects('getProjectionFields')
        .once()
        .withArgs(productType, responseGroup)
        .returns(['_id', 'type', 'associatedMedia']);
      // Set expectaion of/from Product DAO.
      stubData.productV4DAOMock
        .expects('getProduct')
        .once()
        .withArgs(
          productType,
          id,
          ['_id', 'type', 'associatedMedia'],
          undefined,
          undefined,
          productVersion
        )
        .resolves({ _id: id, type: productType });
      // Set expectaion of/from Associated media Service.
      stubData.associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, false)
        .resolves(
          associatedMediaTestDataCopy.filter(
            (asstmedia) => asstmedia.parentId === id
          )
        );

      productV4Service
        .getProductById(id, responseGroup, productVersion)
        .then(({ product }) => {
          expect(product).to.have.nested.property('_id', id);
          expect(product).to.have.nested.property('type', productType);
          expect(product).to.not.have.property('availability', availability);
          stubData.associatedMediaV4ServiceMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.apiResponseGroupConfigMock.verify();
          stubData.productV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.associatedMediaV4ServiceMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.apiResponseGroupConfigMock.restore();
          stubData.productV4DAOMock.restore();
        });
    });
    it(`should return a product large when the response group is large and
        incorrect channel name provided`, (done) => {
      const id = '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896';
      const productType = 'book';
      const responseGroup = 'large';
      const productVersion = '4.0.1';
      const availabilityName = 'some-garbage-channel';
      const availability = [
        {
          errors: ['random'],
          name: 'some-channel',
          status: ['some-status', 'some-status1']
        },
        {
          errors: ['random'],
          name: 'another-channel',
          status: ['some-status', 'some-status1']
        }
      ];
      const associatedMediaTestDataCopy = JSON.parse(
        JSON.stringify(associatedMediaTestData)
      );
      const stubData = getStubData();
      // Set expectaion of/from Asset Service.
      stubData.assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id)
        .resolves({ _id: id, type: productType });
      // Set the expectation of/from api Response Group Config
      stubData.apiResponseGroupConfigMock
        .expects('getProjectionFields')
        .once()
        .withArgs(productType, responseGroup)
        .returns(['_id', 'type', 'associatedMedia', 'availability']);
      // Set expectaion of/from Product DAO.
      stubData.productV4DAOMock
        .expects('getProduct')
        .once()
        .withArgs(
          productType,
          id,
          ['_id', 'type', 'associatedMedia', 'availability'],
          availabilityName,
          undefined,
          productVersion
        )
        .resolves({ _id: id, availability, type: productType });
      // Set expectaion of/from Associated media Service.
      stubData.associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, false)
        .resolves(
          associatedMediaTestDataCopy.filter(
            (asstmedia) => asstmedia.parentId === id
          )
        );

      productV4Service
        .getProductById(id, responseGroup, productVersion, availabilityName)
        .then((productWrapper) => {
          expect(productWrapper).to.have.nested.property('product._id', id);
          expect(productWrapper).to.have.nested.property(
            'product.type',
            productType
          );
          expect(productWrapper).to.have.property(
            'availability',
            productWrapper.availability
          );
          expect(productWrapper.availability).to.have.length(0);
          stubData.associatedMediaV4ServiceMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.apiResponseGroupConfigMock.verify();
          stubData.productV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.associatedMediaV4ServiceMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.apiResponseGroupConfigMock.restore();
          stubData.productV4DAOMock.restore();
        });
    });
    it(`should return a product large along with specific channel when the
        response group is large and channel name provided`, (done) => {
      const id = '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896';
      const productType = 'book';
      const responseGroup = 'large';
      const productVersion = '4.0.1';
      const availabilityName = 'some-channel';
      const availability = [
        {
          errors: ['random'],
          name: 'some-channel',
          status: ['some-status', 'some-status1']
        }
      ];
      const associatedMediaTestDataCopy = JSON.parse(
        JSON.stringify(associatedMediaTestData)
      );
      const stubData = getStubData();
      // Set expectaion of/from Asset Service.
      stubData.assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id)
        .resolves({ _id: id, type: productType });
      // Set the expectation of/from api Response Group Config
      stubData.apiResponseGroupConfigMock
        .expects('getProjectionFields')
        .once()
        .withArgs(productType, responseGroup)
        .returns(['_id', 'type', 'associatedMedia', 'availability']);
      // Set expectaion of/from Product DAO.
      stubData.productV4DAOMock
        .expects('getProduct')
        .once()
        .withArgs(
          productType,
          id,
          ['_id', 'type', 'associatedMedia', 'availability'],
          availabilityName,
          undefined,
          productVersion
        )
        .resolves({ _id: id, availability, type: productType });
      // Set expectaion of/from Associated media Service.
      stubData.associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, false)
        .resolves(
          associatedMediaTestDataCopy.filter(
            (asstmedia) => asstmedia.parentId === id
          )
        );

      productV4Service
        .getProductById(id, responseGroup, productVersion, availabilityName)
        .then((productWrapper) => {
          const product = productWrapper['product'];
          expect(product).to.have.property('_id', id);
          expect(product).to.have.property('type', productType);
          expect(productWrapper).to.have.property('availability');
          expect(productWrapper.availability[0]).to.have.property(
            'name',
            availabilityName
          );
          stubData.associatedMediaV4ServiceMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.apiResponseGroupConfigMock.verify();
          stubData.productV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.associatedMediaV4ServiceMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.apiResponseGroupConfigMock.restore();
          stubData.productV4DAOMock.restore();
        });
    });
    it('should return valid product small response by passing valid UUID', (done) => {
      const id = 'some-id';
      const asset = {
        id: 'some-id',
        type: 'book'
      };
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
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id)
        .returns(asset);
      productV4DAOMock
        .expects('getProduct')
        .once()
        .withArgs(
          asset.type,
          asset.id,
          apiResponseGroupConfig.getProjectionFields(asset.type, 'small'),
          undefined,
          undefined,
          undefined
        )
        .returns(bookProduct);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .never();
      productV4Service
        .getProductById(id)
        .then((retrievedProduct) => {
          expect(retrievedProduct).to.be.an('object');
          testProperties(
            bookProduct,
            apiResponseGroupConfig.getProjectionFields(asset.type, 'small')
          );
          assetV4ServiceMock.verify();
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
    it('should return Product (asset) not found. by passing invalid UUID', (done) => {
      const id = 'some-id';
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id)
        .returns(null);
      productV4DAOMock.expects('getProduct').never();
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .never();
      productV4Service
        .getProductById(id)
        .then(() => {
          done(
            new Error('Expecting Product (asset) not found. but got success')
          );
        })
        .catch((err) => {
          expect(err.message).to.equal('Product (asset) not found.');
          expect(err.code).to.equal(404);
          assetV4ServiceMock.verify();
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
    it('should return Product not found. by passing valid UUID ', (done) => {
      const id = 'some-id';
      const asset = {
        id: 'some-id',
        type: 'book'
      };
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id)
        .returns(asset);
      productV4DAOMock
        .expects('getProduct')
        .once()
        .withArgs(
          asset.type,
          asset.id,
          apiResponseGroupConfig.getProjectionFields(asset.type, 'small')
        )
        .returns(null);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .never();
      productV4Service
        .getProductById(id)
        .then(() => {
          done(
            new Error('Expecting Product (asset) not found. but got success')
          );
        })
        .catch((err) => {
          expect(err.message).to.equal('Product not found.');
          expect(err.code).to.equal(404);
          assetV4ServiceMock.verify();
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
    it(`should return Product (asset) not found. by passing invalid UUID and responseGroup
     as large`, (done) => {
      const id = 'some-uuid';
      const responseGroup = 'large';
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id)
        .returns(null);
      productV4DAOMock.expects('getProduct').never();
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .never();
      productV4Service
        .getProductById(id, responseGroup)
        .then(() => {
          done(
            new Error('Expecting Product (asset) not found. but got success')
          );
        })
        .catch((err) => {
          expect(err.message).to.equal('Product (asset) not found.');
          expect(err.code).to.equal(404);
          assetV4ServiceMock.verify();
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
    it('should return Product (asset) not found. by passing id as null', (done) => {
      const id = null;
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id)
        .returns(null);
      productV4DAOMock.expects('getProduct').never();
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .never();
      productV4Service
        .getProductById(id)
        .then(() => {
          done(
            new Error('Expecting Product (asset) not found. but got success')
          );
        })
        .catch((err) => {
          expect(err.message).to.equal('Product (asset) not found.');
          expect(err.code).to.equal(404);
          assetV4ServiceMock.verify();
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
    it('should return Product (asset) not found. by passing id as undefined', (done) => {
      const id = undefined;
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id)
        .returns(null);
      productV4DAOMock.expects('getProduct').never();
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .never();
      productV4Service
        .getProductById(id)
        .then(() => {
          done(
            new Error('Expecting Product (asset) not found. but got success')
          );
        })
        .catch((err) => {
          expect(err.message).to.equal('Product (asset) not found.');
          expect(err.code).to.equal(404);
          assetV4ServiceMock.verify();
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
    it(`should return valid product small response by passing valid UUID and responseGroup
     as small`, (done) => {
      const id = 'some-uuid';
      const responseGroup = 'small';
      const asset = {
        id: 'some-uuid',
        type: 'book'
      };
      const bookProduct = {
        _createdDate: '2020-02-06T11:38:12.849+00:00',
        _id: 'some-uuid',
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
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id)
        .returns(asset);
      productV4DAOMock
        .expects('getProduct')
        .once()
        .withArgs(
          asset.type,
          asset.id,
          apiResponseGroupConfig.getProjectionFields(asset.type, 'small')
        )
        .returns(bookProduct);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .never();
      productV4Service
        .getProductById(id, responseGroup)
        .then((retrivedProduct) => {
          expect(retrivedProduct).to.be.an('object');
          testProperties(
            bookProduct,
            apiResponseGroupConfig.getProjectionFields(asset.type, 'small')
          );
          assetV4ServiceMock.verify();
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
    it(`should return valid product large response by passing valid UUID and responseGroup
     as large`, (done) => {
      const id = 'some-uuid';
      const responseGroup = 'large';
      const asset = {
        id: 'some-uuid',
        type: 'chapter'
      };
      const chapterProduct = {
        _createdDate: '2020-02-04T11:20:03.202Z',
        _id: '47dda348-4031-44bb-91ea-6a85b0219cfa',
        _isSellable: false,
        _modifiedDate: '2020-02-04T11:20:03.202Z',
        _schemaVersion: '4.0.1',
        _status: 'Available',
        associatedMedia: [],
        audience: [],
        categories: [],
        chapter: {
          abstracts: [
            {
              location: null,
              type: 'text',
              value:
                'The purpose of this book has been to summarize the actions, styles and symbols depicted by children and adolescents in their Kinetic Family Drawings.'
            }
          ],
          copyright: null,
          description: null,
          doiRegistrationStatus: false,
          edition: null,
          firstPublishedYear: null,
          inLanguage: null,
          pageEnd: 296,
          pageStart: 296,
          plannedPublicationDate: null,
          publicationDate: null,
          publisherImprint: 'Routledge',
          subtitle: null
        },
        classifications: [
          {
            code: 'SCBE0525',
            level: 3,
            name: 'Creative Arts & Expressive Therapies',
            priority: 1,
            type: 'subject'
          }
        ],
        contributors: [],
        discountGroups: [],
        identifiers: {
          chapterId: null,
          doi: '10.4324/9780203765531-8',
          sku: null
        },
        impressionLocations: [],
        isPartOf: [],
        isRelatedTo: [],
        keywords: [],
        permissions: [],
        prices: [],
        references: [],
        rights: [],
        source: 'HUB',
        title: 'CONCLUSION',
        transfer: [],
        type: 'chapter',
        version: null
      };
      const associatedMedia = [
        {
          _id: 'some-id',
          location: 'image-url',
          parentId: 'some-uuid',
          parentType: 'chapter',
          size: 0,
          type: 'coverimage',
          versionType: 'FINAL'
        }
      ];
      const projections = JSON.parse(
        JSON.stringify(
          apiResponseGroupConfig.getProjectionFields(asset.type, 'large')
        )
      );
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id)
        .returns(asset);
      productV4DAOMock
        .expects('getProduct')
        .once()
        .withArgs(asset.type, asset.id, [...projections])
        .returns(chapterProduct);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id)
        .returns(associatedMedia);
      productV4Service
        .getProductById(id, responseGroup)
        .then((retrivedProduct) => {
          expect(retrivedProduct).to.be.an('object');
          projections.splice(projections.indexOf('availability'), 1);
          testProperties(retrivedProduct['product'], projections);
          assetV4ServiceMock.verify();
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
  });
  describe('getProductsByDynamicIds', () => {
    let productFilterOptions: IProductFilterOptions;
    beforeEach(() => {
      productFilterOptions = {
        availabilityName: undefined,
        availabilityStatus: undefined,
        productVersion: undefined
      };
    });
    it(
      'should return valid products by passing identiferName and ' +
        'identifierValues',
      (done) => {
        const keyName = 'some-name';
        const keyValues = ['value1'];
        const assets = [
          {
            _id: 'some-id',
            identifiers: {
              isbn: 'some-isbn'
            },
            name: 'some-name',
            type: 'book'
          }
        ];
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
        const projectionFields = apiResponseGroupConfig.getProjectionFields(
          assets[0].type,
          'small'
        );
        assetV4ServiceMock
          .expects('getAssetsByIdentifierNameValues')
          .once()
          .withArgs(keyName, keyValues)
          .returns(assets);
        productV4DAOMock
          .expects('getProductsByIds')
          .once()
          .withArgs(assets[0].type, [assets[0]._id], {
            ...productFilterOptions,
            projectionFields
          })
          .returns([bookProduct]);
        associatedMediaV4ServiceMock
          .expects('getAsstMediasByParentIds')
          .never();
        productV4Service
          .getProductsByDynamicIds(keyName, keyValues, 'book')
          .then((retrivedProduct) => {
            expect(retrivedProduct).to.be.an('Array');
            expect(retrivedProduct.length).to.equal(1);
            expect(retrivedProduct[0].product._id).to.equal(bookProduct._id);
            assetV4ServiceMock.verify();
            productV4DAOMock.verify();
            associatedMediaV4ServiceMock.verify();
            done();
          })
          .catch((err) => {
            done(err);
          })
          .finally(() => {
            assetV4ServiceMock.restore();
            productV4DAOMock.restore();
            associatedMediaV4ServiceMock.restore();
          });
      }
    );
    it(
      'should return valid products by passing identiferName and ' +
        'identifierValues and responseGroup as small',
      (done) => {
        const keyName = 'some-name';
        const keyValues = ['value1'];
        const responseGroup = 'small';
        const assets = [
          {
            _id: 'some-id',
            identifiers: {
              isbn: 'some-isbn'
            },
            name: 'some-name',
            type: 'book'
          }
        ];
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
        const projectionFields = apiResponseGroupConfig.getProjectionFields(
          assets[0].type,
          'small'
        );
        assetV4ServiceMock
          .expects('getAssetsByIdentifierNameValues')
          .once()
          .withArgs(keyName, keyValues)
          .returns(assets);
        productV4DAOMock
          .expects('getProductsByIds')
          .once()
          .withArgs(assets[0].type, [assets[0]._id], {
            ...productFilterOptions,
            projectionFields
          })
          .returns([bookProduct]);
        associatedMediaV4ServiceMock
          .expects('getAsstMediasByParentIds')
          .never();
        productV4Service
          .getProductsByDynamicIds(keyName, keyValues, 'book', responseGroup)
          .then((retrivedProduct) => {
            expect(retrivedProduct).to.be.an('Array');
            expect(retrivedProduct.length).to.equal(1);
            expect(retrivedProduct[0].product._id).to.equal(bookProduct._id);
            assetV4ServiceMock.verify();
            productV4DAOMock.verify();
            associatedMediaV4ServiceMock.verify();
            done();
          })
          .catch((err) => {
            done(err);
          })
          .finally(() => {
            assetV4ServiceMock.restore();
            productV4DAOMock.restore();
            associatedMediaV4ServiceMock.restore();
          });
      }
    );
    it(
      'should return valid products by passing identiferName and ' +
        'identifierValues belong to journal and responseGroup as small',
      (done) => {
        const keyName = 'journalAcronym';
        const keyValues = ['CCOS'];
        const responseGroup = 'small';
        const assets = [
          {
            _id: 'some-id1',
            identifiers: {
              isbn: 'some-isbn',
              journalAcronym: 'CCOS'
            },
            name: 'some-name',
            type: 'journal'
          },
          {
            _id: 'some-id2',
            identifiers: {
              isbn: 'some-isbn',
              journalAcronym: 'CCOS'
            },
            name: 'some-name',
            type: 'journal'
          }
        ];
        const assetIds = assets.map((asset) => asset._id);
        const journalProduct = {
          _createdDate: '2020-02-06T11:38:12.849+00:00',
          _id: 'some-id1',
          _modifiedDate: '2020-02-06T11:38:12.849+00:00',
          identifiers: {
            isbn: 'some-isbn'
          },
          isSellable: true,
          status: 'Available',
          title: 'some-title',
          type: 'journal',
          version: null
        };
        const projectionFields = apiResponseGroupConfig.getProjectionFields(
          assets[0].type,
          'small'
        );
        assetV4ServiceMock
          .expects('getAssetsByIdentifierNameValues')
          .once()
          .withArgs(keyName, keyValues)
          .resolves(assets);
        productV4DAOMock
          .expects('getActiveProductByIds')
          .once()
          .withArgs(assets[0].type, assetIds)
          .resolves([{ _id: assets[0]._id }]);
        productV4DAOMock
          .expects('getProductsByIds')
          .once()
          .withArgs(assets[0].type, [assets[0]._id], {
            ...productFilterOptions,
            projectionFields
          })
          .resolves([journalProduct]);
        associatedMediaV4ServiceMock
          .expects('getAsstMediasByParentIds')
          .never();
        productV4Service
          .getProductsByDynamicIds(keyName, keyValues, 'journal', responseGroup)
          .then((retrivedProduct) => {
            expect(retrivedProduct).to.be.an('Array');
            expect(retrivedProduct.length).to.equal(1);
            expect(retrivedProduct[0].product._id).to.equal(journalProduct._id);
            assetV4ServiceMock.verify();
            productV4DAOMock.verify();
            associatedMediaV4ServiceMock.verify();
            done();
          })
          .catch((err) => {
            done(err);
          })
          .finally(() => {
            assetV4ServiceMock.restore();
            productV4DAOMock.restore();
            associatedMediaV4ServiceMock.restore();
          });
      }
    );
    it(
      'should return  when identifierName and identifierValues belong to' +
        ' journal and responseGroup as small has no active journal',
      (done) => {
        const keyName = 'journalAcronym';
        const keyValues = ['CCOS'];
        const responseGroup = 'small';
        const assets = [
          {
            _id: 'some-id1',
            identifiers: {
              isbn: 'some-isbn',
              journalAcronym: 'CCOS'
            },
            name: 'some-name',
            type: 'journal'
          },
          {
            _id: 'some-id2',
            identifiers: {
              isbn: 'some-isbn',
              journalAcronym: 'CCOS'
            },
            name: 'some-name',
            type: 'journal'
          }
        ];
        const projectionFields = apiResponseGroupConfig.getProjectionFields(
          assets[0].type,
          'small'
        );
        const assetIds = assets.map((asset) => asset._id);
        assetV4ServiceMock
          .expects('getAssetsByIdentifierNameValues')
          .once()
          .withArgs(keyName, keyValues)
          .resolves(assets);
        productV4DAOMock
          .expects('getActiveProductByIds')
          .once()
          .withArgs(assets[0].type, assetIds)
          .resolves([]);
        productV4DAOMock
          .expects('getProductsByIds')
          .once()
          .withArgs(assets[0].type, [], {
            ...productFilterOptions,
            projectionFields
          });
        associatedMediaV4ServiceMock
          .expects('getAsstMediasByParentIds')
          .never();
        productV4Service
          .getProductsByDynamicIds(keyName, keyValues, 'journal', responseGroup)
          .then(() => {
            done(new Error('Expecting Products not found. but got success'));
          })
          .catch((err) => {
            expect(err.code).to.equal(404);
            expect(err.message).to.equal('Products not found.');
            assetV4ServiceMock.verify();
            productV4DAOMock.verify();
            associatedMediaV4ServiceMock.verify();
            done();
          })
          .catch(done)
          .finally(() => {
            assetV4ServiceMock.restore();
            productV4DAOMock.restore();
            associatedMediaV4ServiceMock.restore();
          });
      }
    );
    it(
      'should return valid products by passing identiferName, identifierValues,' +
        'availabilityName and responseGroup as small',
      (done) => {
        const keyName = 'some-name';
        const keyValues = ['value1'];
        const responseGroup = 'small';
        const availabilityName = 'UBX';
        const assets = [
          {
            _id: 'some-id',
            identifiers: {
              isbn: 'some-isbn'
            },
            name: 'some-name',
            type: 'book'
          }
        ];
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
        const projectionFields = apiResponseGroupConfig.getProjectionFields(
          assets[0].type,
          responseGroup
        );
        assetV4ServiceMock
          .expects('getAssetsByIdentifierNameValues')
          .once()
          .withArgs(keyName, keyValues)
          .returns(assets);
        productV4DAOMock
          .expects('getProductsByIds')
          .once()
          .withArgs(assets[0].type, [assets[0]._id], {
            ...productFilterOptions,
            availabilityName,
            projectionFields
          })
          .returns([bookProduct]);
        associatedMediaV4ServiceMock
          .expects('getAsstMediasByParentIds')
          .never();
        productV4Service
          .getProductsByDynamicIds(
            keyName,
            keyValues,
            'book',
            responseGroup,
            availabilityName
          )
          .then((retrivedProduct) => {
            expect(retrivedProduct).to.be.an('Array');
            expect(retrivedProduct.length).to.equal(1);
            expect(retrivedProduct[0].product._id).to.equal(bookProduct._id);
            assetV4ServiceMock.verify();
            productV4DAOMock.verify();
            associatedMediaV4ServiceMock.verify();
            done();
          })
          .catch((err) => {
            done(err);
          })
          .finally(() => {
            assetV4ServiceMock.restore();
            productV4DAOMock.restore();
            associatedMediaV4ServiceMock.restore();
          });
      }
    );
    it(
      'should return valid products by passing identiferName, identifierValues,' +
        'availabilityName, availabilityStatus and responseGroup as small',
      (done) => {
        const keyName = 'some-name';
        const keyValues = ['value1'];
        const responseGroup = 'small';
        const availabilityName = 'UBX';
        const availabilityStatus = ['some-status', 'some-status1'];
        const assets = [
          {
            _id: 'some-id',
            identifiers: {
              isbn: 'some-isbn'
            },
            name: 'some-name',
            type: 'book'
          }
        ];
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
        const projectionFields = apiResponseGroupConfig.getProjectionFields(
          assets[0].type,
          responseGroup
        );
        assetV4ServiceMock
          .expects('getAssetsByIdentifierNameValues')
          .once()
          .withArgs(keyName, keyValues)
          .returns(assets);
        productV4DAOMock
          .expects('getProductsByIds')
          .once()
          .withArgs(assets[0].type, [assets[0]._id], {
            ...productFilterOptions,
            availabilityName,
            availabilityStatus,
            projectionFields
          })
          .returns([bookProduct]);
        associatedMediaV4ServiceMock
          .expects('getAsstMediasByParentIds')
          .never();
        productV4Service
          .getProductsByDynamicIds(
            keyName,
            keyValues,
            'book',
            responseGroup,
            availabilityName,
            availabilityStatus
          )
          .then((retrivedProduct) => {
            expect(retrivedProduct).to.be.an('Array');
            expect(retrivedProduct.length).to.equal(1);
            expect(retrivedProduct[0].product._id).to.equal(bookProduct._id);
            assetV4ServiceMock.verify();
            productV4DAOMock.verify();
            associatedMediaV4ServiceMock.verify();
            done();
          })
          .catch((err) => {
            done(err);
          })
          .finally(() => {
            assetV4ServiceMock.restore();
            productV4DAOMock.restore();
            associatedMediaV4ServiceMock.restore();
          });
      }
    );
    it(
      'should return valid products by passing identiferName, identifierValues,' +
        'availabilityName, availabilityStatus and responseGroup as small',
      (done) => {
        const keyName = 'some-name';
        const keyValues = ['value1'];
        const responseGroup = 'small';
        const availabilityName = 'UBX';
        const availabilityStatus = ['some-status', 'some-status1'];
        const assets = [
          {
            _id: 'some-id',
            identifiers: {
              isbn: 'some-isbn'
            },
            name: 'some-name',
            type: 'book'
          }
        ];
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
        const projectionFields = apiResponseGroupConfig.getProjectionFields(
          assets[0].type,
          responseGroup
        );
        assetV4ServiceMock
          .expects('getAssetsByIdentifierNameValues')
          .once()
          .withArgs(keyName, keyValues)
          .returns(assets);
        productV4DAOMock
          .expects('getProductsByIds')
          .once()
          .withArgs(assets[0].type, [assets[0]._id], {
            ...productFilterOptions,
            availabilityName,
            availabilityStatus,
            projectionFields
          })
          .returns([bookProduct]);
        associatedMediaV4ServiceMock
          .expects('getAsstMediasByParentIds')
          .never();
        productV4Service
          .getProductsByDynamicIds(
            keyName,
            keyValues,
            'book',
            responseGroup,
            availabilityName,
            availabilityStatus
          )
          .then((retrivedProduct) => {
            expect(retrivedProduct).to.be.an('Array');
            expect(retrivedProduct.length).to.equal(1);
            expect(retrivedProduct[0].product._id).to.equal(bookProduct._id);
            assetV4ServiceMock.verify();
            productV4DAOMock.verify();
            associatedMediaV4ServiceMock.verify();
            done();
          })
          .catch((err) => {
            done(err);
          })
          .finally(() => {
            assetV4ServiceMock.restore();
            productV4DAOMock.restore();
            associatedMediaV4ServiceMock.restore();
          });
      }
    );
    it(
      'should through Products (assets) not found. passing identiferName and ' +
        'invalid identifierValues ',
      (done) => {
        const keyName = 'some-name';
        const keyValues = ['invalid-value'];
        const responseGroup = 'small';
        assetV4ServiceMock
          .expects('getAssetsByIdentifierNameValues')
          .once()
          .withArgs(keyName, keyValues)
          .returns(null);
        productV4DAOMock.expects('getProductsByIds').never();
        associatedMediaV4ServiceMock
          .expects('getAsstMediasByParentIds')
          .never();
        productV4Service
          .getProductsByDynamicIds(keyName, keyValues, 'book', responseGroup)
          .then(() => {
            done(
              new Error(
                'Expecting Products (assets) not found. but got success'
              )
            );
          })
          .catch((err) => {
            expect(err.message).to.equal('Products (assets) not found.');
            expect(err.code).to.equal(404);
            assetV4ServiceMock.verify();
            productV4DAOMock.verify();
            associatedMediaV4ServiceMock.verify();
            done();
          })
          .finally(() => {
            assetV4ServiceMock.restore();
            productV4DAOMock.restore();
            associatedMediaV4ServiceMock.restore();
          });
      }
    );
    it(
      'should through Products (assets) not found. passing identiferName and ' +
        'identifierValues as null',
      (done) => {
        const keyName = 'some-name';
        const keyValues = null;
        assetV4ServiceMock
          .expects('getAssetsByIdentifierNameValues')
          .once()
          .withArgs(keyName, keyValues)
          .returns(null);
        productV4DAOMock.expects('getProductsByIds').never();
        associatedMediaV4ServiceMock
          .expects('getAsstMediasByParentIds')
          .never();
        productV4Service
          .getProductsByDynamicIds(keyName, keyValues, 'book')
          .then(() => {
            done(
              new Error(
                'Expecting Products (assets) not found. but got success'
              )
            );
          })
          .catch((err) => {
            expect(err.message).to.equal('Products (assets) not found.');
            expect(err.code).to.equal(404);
            assetV4ServiceMock.verify();
            productV4DAOMock.verify();
            associatedMediaV4ServiceMock.verify();
            done();
          })
          .finally(() => {
            assetV4ServiceMock.restore();
            productV4DAOMock.restore();
            associatedMediaV4ServiceMock.restore();
          });
      }
    );
    it(
      'should through Products (assets) not found. passing identiferName and ' +
        'identifierValues as undefined',
      (done) => {
        const keyName = 'some-name';
        const keyValues = undefined;
        assetV4ServiceMock
          .expects('getAssetsByIdentifierNameValues')
          .once()
          .withArgs(keyName, keyValues)
          .returns(null);
        productV4DAOMock.expects('getProductsByIds').never();
        associatedMediaV4ServiceMock
          .expects('getAsstMediasByParentIds')
          .never();
        productV4Service
          .getProductsByDynamicIds(keyName, keyValues, 'book')
          .then(() => {
            done(
              new Error(
                'Expecting Products (assets) not found. but got success'
              )
            );
          })
          .catch((err) => {
            expect(err.message).to.equal('Products (assets) not found.');
            expect(err.code).to.equal(404);
            assetV4ServiceMock.verify();
            productV4DAOMock.verify();
            associatedMediaV4ServiceMock.verify();
            done();
          })
          .finally(() => {
            assetV4ServiceMock.restore();
            productV4DAOMock.restore();
            associatedMediaV4ServiceMock.restore();
          });
      }
    );
    it(
      'should through Products (assets) not found. passing identiferName and ' +
        'identifierValues as empty Array',
      (done) => {
        const keyName = 'some-name';
        const keyValues = [];
        assetV4ServiceMock
          .expects('getAssetsByIdentifierNameValues')
          .once()
          .withArgs(keyName, keyValues)
          .returns(null);
        productV4DAOMock.expects('getProductsByIds').never();
        associatedMediaV4ServiceMock
          .expects('getAsstMediasByParentIds')
          .never();
        productV4Service
          .getProductsByDynamicIds(keyName, keyValues, 'book')
          .then(() => {
            done(
              new Error(
                'Expecting Products (assets) not found. but got success'
              )
            );
          })
          .catch((err) => {
            expect(err.message).to.equal('Products (assets) not found.');
            expect(err.code).to.equal(404);
            assetV4ServiceMock.verify();
            productV4DAOMock.verify();
            associatedMediaV4ServiceMock.verify();
            done();
          })
          .finally(() => {
            assetV4ServiceMock.restore();
            productV4DAOMock.restore();
            associatedMediaV4ServiceMock.restore();
          });
      }
    );
    it(
      'should return valid products by passing identiferName and ' +
        'identifierValues and responseGroup as large',
      (done) => {
        const keyName = 'doi';
        const keyValues = ['some-doi'];
        const responseGroup = 'large';
        const assets = [
          {
            _id: 'some-id',
            identifiers: {
              doi: 'some-doi'
            },
            name: 'some-name',
            type: 'chapter'
          }
        ];
        const chapterProduct = {
          _createdDate: '2020-02-04T11:20:03.202Z',
          _id: 'some-uuid',
          _isSellable: false,
          _modifiedDate: '2020-02-04T11:20:03.202Z',
          _schemaVersion: '4.0.1',
          _status: 'Available',
          associatedMedia: [],
          audience: [],
          categories: [],
          chapter: {
            abstracts: [
              {
                location: null,
                type: 'text',
                value:
                  'The purpose of this book has been to summarize the actions, styles and symbols depicted by children and adolescents in their Kinetic Family Drawings.'
              }
            ],
            copyright: null,
            description: null,
            doiRegistrationStatus: false,
            edition: null,
            firstPublishedYear: null,
            inLanguage: null,
            pageEnd: 296,
            pageStart: 296,
            plannedPublicationDate: null,
            publicationDate: null,
            publisherImprint: 'Routledge',
            subtitle: null
          },
          classifications: [
            {
              code: 'SCBE0525',
              level: 3,
              name: 'Creative Arts & Expressive Therapies',
              priority: 1,
              type: 'subject'
            }
          ],
          contributors: [],
          discountGroups: [],
          identifiers: {
            chapterId: null,
            doi: '10.4324/9780203765531-8',
            sku: null
          },
          impressionLocations: [],
          isPartOf: [],
          isRelatedTo: [],
          keywords: [],
          permissions: [],
          prices: [],
          references: [],
          rights: [],
          source: 'HUB',
          title: 'CONCLUSION',
          transfer: [],
          type: 'chapter',
          version: null
        };
        const associatedMedia = [
          {
            _id: 'some-id',
            location: 'image-url',
            parentId: 'some-uuid',
            parentType: 'some-type',
            size: 0,
            type: 'coverimage',
            versionType: 'FINAL'
          }
        ];
        let projectionFields = JSON.parse(
          JSON.stringify(
            apiResponseGroupConfig.getProjectionFields(
              assets[0].type,
              responseGroup
            )
          )
        );
        projectionFields = [...projectionFields];
        assetV4ServiceMock
          .expects('getAssetsByIdentifierNameValues')
          .once()
          .withArgs(keyName, keyValues)
          .returns(assets);
        productV4DAOMock
          .expects('getProductsByIds')
          .once()
          .withArgs(assets[0].type, [assets[0]._id], {
            ...productFilterOptions,
            projectionFields
          })
          .returns([chapterProduct]);
        associatedMediaV4ServiceMock
          .expects('getAsstMediasByParentIds')
          .once()
          .withArgs([assets[0]._id])
          .returns(associatedMedia);
        productV4Service
          .getProductsByDynamicIds(keyName, keyValues, 'book', responseGroup)
          .then((retrivedProduct) => {
            expect(retrivedProduct).to.be.an('Array');
            expect(retrivedProduct.length).to.equal(1);
            expect(retrivedProduct[0].product._id).to.equal(chapterProduct._id);
            projectionFields.splice(
              projectionFields.indexOf('availability'),
              1
            );
            testProperties(retrivedProduct[0].product, projectionFields);
            assetV4ServiceMock.verify();
            productV4DAOMock.verify();
            associatedMediaV4ServiceMock.verify();
            done();
          })
          .catch((err) => {
            done(err);
          })
          .finally(() => {
            assetV4ServiceMock.restore();
            productV4DAOMock.restore();
            associatedMediaV4ServiceMock.restore();
          });
      }
    );
    it(`should return valid products with availability as empty array by passing identiferName and identifierValues
        and responseGroup as large along with availabilityName`, (done) => {
      const keyName = 'doi';
      const keyValues = ['some-doi'];
      const responseGroup = 'large';
      const availabilityName = 'some-name';
      const assets = [
        {
          _id: 'some-id',
          identifiers: {
            doi: 'some-doi'
          },
          name: 'some-name',
          type: 'chapter'
        }
      ];
      const chapterProduct = {
        _createdDate: '2020-02-04T11:20:03.202Z',
        _id: 'some-uuid',
        _isSellable: false,
        _modifiedDate: '2020-02-04T11:20:03.202Z',
        _schemaVersion: '4.0.1',
        _status: 'Available',
        associatedMedia: [],
        audience: [],
        categories: [],
        chapter: {
          abstracts: [
            {
              location: null,
              type: 'text',
              value:
                'The purpose of this book has been to summarize the actions, styles and symbols depicted by children and adolescents in their Kinetic Family Drawings.'
            }
          ],
          copyright: null,
          description: null,
          doiRegistrationStatus: false,
          edition: null,
          firstPublishedYear: null,
          inLanguage: null,
          pageEnd: 296,
          pageStart: 296,
          plannedPublicationDate: null,
          publicationDate: null,
          publisherImprint: 'Routledge',
          subtitle: null
        },
        classifications: [
          {
            code: 'SCBE0525',
            level: 3,
            name: 'Creative Arts & Expressive Therapies',
            priority: 1,
            type: 'subject'
          }
        ],
        contributors: [],
        discountGroups: [],
        identifiers: {
          chapterId: null,
          doi: '10.4324/9780203765531-8',
          sku: null
        },
        impressionLocations: [],
        isPartOf: [],
        isRelatedTo: [],
        keywords: [],
        permissions: [],
        prices: [],
        references: [],
        rights: [],
        source: 'HUB',
        title: 'CONCLUSION',
        transfer: [],
        type: 'chapter',
        version: null
      };
      const associatedMedia = [
        {
          _id: 'some-id',
          location: 'image-url',
          parentId: 'some-uuid',
          parentType: 'some-type',
          size: 0,
          type: 'coverimage',
          versionType: 'FINAL'
        }
      ];
      const projectionFields = JSON.parse(
        JSON.stringify(
          apiResponseGroupConfig.getProjectionFields(
            assets[0].type,
            responseGroup
          )
        )
      );
      assetV4ServiceMock
        .expects('getAssetsByIdentifierNameValues')
        .once()
        .withArgs(keyName, keyValues)
        .returns(assets);
      productV4DAOMock
        .expects('getProductsByIds')
        .once()
        .withArgs(assets[0].type, [assets[0]._id], {
          ...productFilterOptions,
          availabilityName,
          projectionFields
        })
        .returns([chapterProduct]);
      associatedMediaV4ServiceMock
        .expects('getAsstMediasByParentIds')
        .once()
        .withArgs([assets[0]._id])
        .returns(associatedMedia);
      productV4Service
        .getProductsByDynamicIds(
          keyName,
          keyValues,
          'book',
          responseGroup,
          availabilityName
        )
        .then((retrivedProduct) => {
          expect(retrivedProduct).to.be.an('Array');
          expect(retrivedProduct.length).to.equal(1);
          expect(retrivedProduct[0].product._id).to.equal(chapterProduct._id);
          expect(retrivedProduct[0].availability).to.be.an('Array');
          expect(retrivedProduct[0].availability.length).to.equal(0);
          projectionFields.splice(projectionFields.indexOf('availability'), 1);
          testProperties(retrivedProduct[0].product, projectionFields);
          assetV4ServiceMock.verify();
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
    it(`should return valid products with availability by passing identiferName and identifierValues and responseGroup
       as large along with availabilityName`, (done) => {
      const keyName = 'doi';
      const keyValues = ['some-doi'];
      const responseGroup = 'large';
      const availabilityName = 'some-channel';
      const assets = [
        {
          _id: 'some-id',
          identifiers: {
            doi: 'some-doi'
          },
          name: 'some-name',
          type: 'chapter'
        }
      ];
      const chapterProduct = {
        _createdDate: '2020-02-04T11:20:03.202Z',
        _id: 'some-uuid',
        _isSellable: false,
        _modifiedDate: '2020-02-04T11:20:03.202Z',
        _schemaVersion: '4.0.1',
        _status: 'Available',
        associatedMedia: [],
        audience: [],
        availability: [
          {
            errors: ['random'],
            name: 'some-channel',
            status: ['some-status', 'some-status1']
          }
        ],
        categories: [],
        chapter: {
          abstracts: [
            {
              location: null,
              type: 'text',
              value:
                'The purpose of this book has been to summarize the actions, styles and symbols depicted by children and adolescents in their Kinetic Family Drawings.'
            }
          ],
          copyright: null,
          description: null,
          doiRegistrationStatus: false,
          edition: null,
          firstPublishedYear: null,
          inLanguage: null,
          pageEnd: 296,
          pageStart: 296,
          plannedPublicationDate: null,
          publicationDate: null,
          publisherImprint: 'Routledge',
          subtitle: null
        },
        classifications: [
          {
            code: 'SCBE0525',
            level: 3,
            name: 'Creative Arts & Expressive Therapies',
            priority: 1,
            type: 'subject'
          }
        ],
        contributors: [],
        discountGroups: [],
        identifiers: {
          chapterId: null,
          doi: '10.4324/9780203765531-8',
          sku: null
        },
        impressionLocations: [],
        isPartOf: [],
        isRelatedTo: [],
        keywords: [],
        permissions: [],
        prices: [],
        references: [],
        rights: [],
        source: 'HUB',
        title: 'CONCLUSION',
        transfer: [],
        type: 'chapter',
        version: null
      };
      const associatedMedia = [
        {
          _id: 'some-id',
          location: 'image-url',
          parentId: 'some-uuid',
          parentType: 'some-type',
          size: 0,
          type: 'coverimage',
          versionType: 'FINAL'
        }
      ];
      const projectionFields = JSON.parse(
        JSON.stringify(
          apiResponseGroupConfig.getProjectionFields(
            assets[0].type,
            responseGroup
          )
        )
      );
      assetV4ServiceMock
        .expects('getAssetsByIdentifierNameValues')
        .once()
        .withArgs(keyName, keyValues)
        .returns(assets);
      productV4DAOMock
        .expects('getProductsByIds')
        .once()
        .withArgs(assets[0].type, [assets[0]._id], {
          ...productFilterOptions,
          availabilityName,
          projectionFields
        })
        .returns([chapterProduct]);
      associatedMediaV4ServiceMock
        .expects('getAsstMediasByParentIds')
        .once()
        .withArgs([assets[0]._id])
        .returns(associatedMedia);
      productV4Service
        .getProductsByDynamicIds(
          keyName,
          keyValues,
          'book',
          responseGroup,
          availabilityName
        )
        .then((retrivedProduct) => {
          expect(retrivedProduct).to.be.an('Array');
          expect(retrivedProduct.length).to.equal(1);
          expect(retrivedProduct[0].product._id).to.equal(chapterProduct._id);
          expect(retrivedProduct[0].availability).to.be.an('Array');
          expect(retrivedProduct[0].availability.length).to.equal(1);
          expect(retrivedProduct[0].availability[0].name).to.equal(
            availabilityName
          );
          projectionFields.splice(projectionFields.indexOf('availability'), 1);
          testProperties(retrivedProduct[0].product, projectionFields);
          assetV4ServiceMock.verify();
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
    it(`should return valid products with availability as empty array by passing identiferName and identifierValues and responseGroup
      as large along with availabilityName when not matching availabilty found`, (done) => {
      const keyName = 'doi';
      const keyValues = ['some-doi'];
      const responseGroup = 'large';
      const availabilityName = 'some-channel-new';
      const assets = [
        {
          _id: 'some-id',
          identifiers: {
            doi: 'some-doi'
          },
          name: 'some-name',
          type: 'chapter'
        }
      ];
      const chapterProduct = {
        _createdDate: '2020-02-04T11:20:03.202Z',
        _id: 'some-uuid',
        _isSellable: false,
        _modifiedDate: '2020-02-04T11:20:03.202Z',
        _schemaVersion: '4.0.1',
        _status: 'Available',
        associatedMedia: [],
        audience: [],
        availability: [
          {
            errors: ['random'],
            name: 'some-channel',
            status: ['some-status', 'some-status1']
          }
        ],
        categories: [],
        chapter: {
          abstracts: [
            {
              location: null,
              type: 'text',
              value:
                'The purpose of this book has been to summarize the actions, styles and symbols depicted by children and adolescents in their Kinetic Family Drawings.'
            }
          ],
          copyright: null,
          description: null,
          doiRegistrationStatus: false,
          edition: null,
          firstPublishedYear: null,
          inLanguage: null,
          pageEnd: 296,
          pageStart: 296,
          plannedPublicationDate: null,
          publicationDate: null,
          publisherImprint: 'Routledge',
          subtitle: null
        },
        classifications: [
          {
            code: 'SCBE0525',
            level: 3,
            name: 'Creative Arts & Expressive Therapies',
            priority: 1,
            type: 'subject'
          }
        ],
        contributors: [],
        discountGroups: [],
        identifiers: {
          chapterId: null,
          doi: '10.4324/9780203765531-8',
          sku: null
        },
        impressionLocations: [],
        isPartOf: [],
        isRelatedTo: [],
        keywords: [],
        permissions: [],
        prices: [],
        references: [],
        rights: [],
        source: 'HUB',
        title: 'CONCLUSION',
        transfer: [],
        type: 'chapter',
        version: null
      };
      const associatedMedia = [
        {
          _id: 'some-id',
          location: 'image-url',
          parentId: 'some-uuid',
          parentType: 'some-type',
          size: 0,
          type: 'coverimage',
          versionType: 'FINAL'
        }
      ];
      const projectionFields = JSON.parse(
        JSON.stringify(
          apiResponseGroupConfig.getProjectionFields(
            assets[0].type,
            responseGroup
          )
        )
      );
      assetV4ServiceMock
        .expects('getAssetsByIdentifierNameValues')
        .once()
        .withArgs(keyName, keyValues)
        .returns(assets);
      productV4DAOMock
        .expects('getProductsByIds')
        .once()
        .withArgs(assets[0].type, [assets[0]._id], {
          ...productFilterOptions,
          availabilityName,
          projectionFields
        })
        .returns([chapterProduct]);
      associatedMediaV4ServiceMock
        .expects('getAsstMediasByParentIds')
        .once()
        .withArgs([assets[0]._id])
        .returns(associatedMedia);
      productV4Service
        .getProductsByDynamicIds(
          keyName,
          keyValues,
          'book',
          responseGroup,
          availabilityName
        )
        .then((retrivedProduct) => {
          expect(retrivedProduct).to.be.an('Array');
          expect(retrivedProduct.length).to.equal(1);
          expect(retrivedProduct[0].product._id).to.equal(chapterProduct._id);
          expect(retrivedProduct[0].availability).to.be.an('Array');
          expect(retrivedProduct[0].availability.length).to.equal(0);
          projectionFields.splice(projectionFields.indexOf('availability'), 1);
          testProperties(retrivedProduct[0].product, projectionFields);
          assetV4ServiceMock.verify();
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
    it(`should throw Product not found, when asset is available but product is not`, (done) => {
      const keyName = 'some-name';
      const keyValues = ['value1'];
      const assets = [
        {
          _id: 'some-id',
          identifiers: {
            isbn: 'some-isbn'
          },
          name: 'some-name',
          type: 'book'
        }
      ];
      const projectionFields = apiResponseGroupConfig.getProjectionFields(
        assets[0].type,
        'small'
      );
      assetV4ServiceMock
        .expects('getAssetsByIdentifierNameValues')
        .once()
        .withArgs(keyName, keyValues)
        .resolves(assets);
      productV4DAOMock
        .expects('getProductsByIds')
        .once()
        .withArgs(assets[0].type, [assets[0]._id], {
          ...productFilterOptions,
          projectionFields
        })
        .resolves(null);
      associatedMediaV4ServiceMock.expects('getAsstMediasByParentIds').never();
      productV4Service
        .getProductsByDynamicIds(keyName, keyValues, 'book')
        .then(() => {
          done(new Error('Expecting Products not found. but got success'));
        })
        .catch((err) => {
          expect(err.message).to.equal('Products not found.');
          expect(err.code).to.equal(404);
          assetV4ServiceMock.verify();
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
    it('should return Invalid response group. by passing invalid response group', (done) => {
      const id = 'some-id';
      const responseGroup = 'invalid-group' as any;
      const asset = {
        id: 'some-id',
        type: 'book'
      };
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id)
        .returns(asset);
      productV4DAOMock.expects('getProductsByIds').never();
      associatedMediaV4ServiceMock.expects('getAsstMediasByParentIds').never();
      productV4Service
        .getProductById(id, responseGroup)
        .then(() => {
          done(new Error('Expecting Invalid response group. but got success'));
        })
        .catch((err) => {
          expect(err.message).to.equal(
            `Response Group - ${responseGroup} is not configured for Product type - ${asset.type}`
          );
          assetV4ServiceMock.verify();
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
  });
  describe('getProductsWithType', () => {
    it('should return valid products by passing offset & limit', (done) => {
      const request = {
        limit: 1,
        offset: 0,
        productType: 'book'
      };
      const bookProducts = [
        {
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
        }
      ];
      productV4DAOMock
        .expects('getProductsWithType')
        .once()
        .withArgs(
          request.productType,
          request.offset,
          request.limit,
          apiResponseGroupConfig.getProjectionFields(
            request.productType,
            'small'
          )
        )
        .returns(bookProducts);
      associatedMediaV4ServiceMock.expects('getAsstMediasByParentIds').never();
      productV4Service
        .getProductsWithType(
          request.productType as any,
          request.offset,
          request.limit
        )
        .then((retrivedProduct) => {
          expect(retrivedProduct).to.be.an('Array');
          expect(retrivedProduct.length).to.equal(1);
          testProperties(
            retrivedProduct[0].product,
            apiResponseGroupConfig.getProjectionFields(
              request.productType,
              'small'
            )
          );
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
    it('should throw Products not found. when passing productType as null', (done) => {
      const request = {
        limit: 1,
        offset: 0,
        productType: null
      };
      productV4DAOMock.expects('getProductsWithType').never();
      associatedMediaV4ServiceMock.expects('getAsstMediasByParentIds').never();
      productV4Service
        .getProductsWithType(request.productType, request.offset, request.limit)
        .then(() => {
          done(new Error('Expecting Products not found. but got success'));
        })
        .catch((err) => {
          expect(err.message).to.equal('Products not found.');
          expect(err.code).to.equal(404);
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .finally(() => {
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
    it('should throw Products not found. when passing productType as undefined', (done) => {
      const request = {
        limit: 1,
        offset: 0,
        productType: undefined
      };
      productV4DAOMock.expects('getProductsWithType').never();
      associatedMediaV4ServiceMock.expects('getAsstMediasByParentIds').never();
      productV4Service
        .getProductsWithType(request.productType, request.offset, request.limit)
        .then(() => {
          done(new Error('Expecting Products not found. but got success'));
        })
        .catch((err) => {
          expect(err.message).to.equal('Products not found.');
          expect(err.code).to.equal(404);
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .finally(() => {
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
    it('should return valid products by passing responseGroup as small, offset & limit', (done) => {
      const request = {
        limit: 1,
        offset: 0,
        productType: 'book',
        responseGroup: 'small'
      };
      const bookProducts = [
        {
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
        }
      ];
      productV4DAOMock
        .expects('getProductsWithType')
        .once()
        .withArgs(
          request.productType,
          request.offset,
          request.limit,
          apiResponseGroupConfig.getProjectionFields(
            request.productType,
            'small'
          )
        )
        .returns(bookProducts);
      associatedMediaV4ServiceMock.expects('getAsstMediasByParentIds').never();
      productV4Service
        .getProductsWithType(
          request.productType as any,
          request.offset,
          request.limit
        )
        .then((retrivedProduct) => {
          expect(retrivedProduct).to.be.an('Array');
          expect(retrivedProduct.length).to.equal(1);
          testProperties(
            retrivedProduct[0].product,
            apiResponseGroupConfig.getProjectionFields(
              request.productType,
              'small'
            )
          );
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
    it('should return valid products by passing responseGroup as small, offset & limit', (done) => {
      const request = {
        limit: 1,
        offset: 0,
        productType: 'book',
        responseGroup: 'small'
      };
      const bookProducts = [
        {
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
        }
      ];
      productV4DAOMock
        .expects('getProductsWithType')
        .once()
        .withArgs(
          request.productType,
          request.offset,
          request.limit,
          apiResponseGroupConfig.getProjectionFields(
            request.productType,
            'small'
          )
        )
        .returns(bookProducts);
      associatedMediaV4ServiceMock.expects('getAsstMediasByParentIds').never();
      productV4Service
        .getProductsWithType(
          request.productType as any,
          request.offset,
          request.limit
        )
        .then((retrivedProduct) => {
          expect(retrivedProduct).to.be.an('Array');
          expect(retrivedProduct.length).to.equal(1);
          testProperties(
            retrivedProduct[0].product,
            apiResponseGroupConfig.getProjectionFields(
              request.productType,
              'small'
            )
          );
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
    it(`should return valid products by passing responseGroup as small, offset, limit and
     avilabilityName`, (done) => {
      const request = {
        avilabilityName: 'UBX',
        limit: 1,
        offset: 0,
        productType: 'book',
        responseGroup: 'small'
      };
      const bookProducts = [
        {
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
        }
      ];
      productV4DAOMock
        .expects('getProductsWithType')
        .once()
        .withArgs(
          request.productType,
          request.offset,
          request.limit,
          apiResponseGroupConfig.getProjectionFields(
            request.productType,
            'small'
          ),
          request.avilabilityName
        )
        .returns(bookProducts);
      associatedMediaV4ServiceMock.expects('getAsstMediasByParentIds').never();
      productV4Service
        .getProductsWithType(
          request.productType as any,
          request.offset,
          request.limit,
          request.responseGroup as any,
          request.avilabilityName
        )
        .then((retrivedProduct) => {
          expect(retrivedProduct).to.be.an('Array');
          expect(retrivedProduct.length).to.equal(1);
          testProperties(
            retrivedProduct[0].product,
            apiResponseGroupConfig.getProjectionFields(
              request.productType,
              'small'
            )
          );
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
    it(`should return valid products by passing responseGroup as small, offset, limit and
    avilabilityName`, (done) => {
      const request = {
        avilabilityName: 'UBX',
        limit: 1,
        offset: 0,
        productType: 'book',
        responseGroup: 'small'
      };
      const availabilityStatus = ['some-status', 'some-status1'];
      const bookProducts = [
        {
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
        }
      ];
      productV4DAOMock
        .expects('getProductsWithType')
        .once()
        .withArgs(
          request.productType,
          request.offset,
          request.limit,
          apiResponseGroupConfig.getProjectionFields(
            request.productType,
            'small'
          ),
          request.avilabilityName,
          availabilityStatus
        )
        .returns(bookProducts);
      associatedMediaV4ServiceMock.expects('getAsstMediasByParentIds').never();
      productV4Service
        .getProductsWithType(
          request.productType as any,
          request.offset,
          request.limit,
          request.responseGroup as any,
          request.avilabilityName,
          availabilityStatus
        )
        .then((retrivedProduct) => {
          expect(retrivedProduct).to.be.an('Array');
          expect(retrivedProduct.length).to.equal(1);
          testProperties(
            retrivedProduct[0].product,
            apiResponseGroupConfig.getProjectionFields(
              request.productType,
              'small'
            )
          );
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
    it('should return valid products by passing responseGroup as large', (done) => {
      const request = {
        limit: 1,
        offset: 0,
        productType: 'chapter',
        responseGroup: 'large'
      };
      const chapterProducts = [
        {
          _createdDate: '2020-02-04T11:20:03.202Z',
          _id: 'some-uuid',
          _isSellable: false,
          _modifiedDate: '2020-02-04T11:20:03.202Z',
          _schemaVersion: '4.0.1',
          _status: 'Available',
          associatedMedia: [],
          audience: [],
          availability: [
            {
              errors: ['random'],
              name: 'some-channel',
              status: ['some-status', 'some-status1']
            }
          ],
          categories: [],
          chapter: {
            abstracts: [
              {
                location: null,
                type: 'text',
                value:
                  'The purpose of this chapter has been to summarize the actions, styles and symbols depicted by children and adolescents in their Kinetic Family Drawings.'
              }
            ],
            copyright: null,
            description: null,
            doiRegistrationStatus: false,
            edition: null,
            firstPublishedYear: null,
            inLanguage: null,
            pageEnd: 296,
            pageStart: 296,
            plannedPublicationDate: null,
            publicationDate: null,
            publisherImprint: 'Routledge',
            subtitle: null
          },
          classifications: [
            {
              code: 'SCBE0525',
              level: 3,
              name: 'Creative Arts & Expressive Therapies',
              priority: 1,
              type: 'subject'
            }
          ],
          contributors: [],
          identifiers: {
            chapterId: null,
            doi: '10.4324/9780203765531-8',
            sku: null
          },
          isPartOf: [],
          keywords: [],
          permissions: [],
          rights: [],
          source: 'HUB',
          title: 'CONCLUSION',
          type: 'chapter',
          version: null
        }
      ];
      const associatedMedia = [
        {
          _id: 'some-id',
          location: 'image-url',
          parentId: 'some-uuid',
          parentType: 'some-type',
          size: 0,
          type: 'coverimage',
          versionType: 'FINAL'
        }
      ];
      const testProductIds = ['some-uuid'];
      productV4DAOMock
        .expects('getProductsWithType')
        .once()
        .withArgs(request.productType, request.offset, request.limit, [
          ...apiResponseGroupConfig.getProjectionFields(
            request.productType,
            'large'
          )
        ])
        .returns(chapterProducts);
      associatedMediaV4ServiceMock
        .expects('getAsstMediasByParentIds')
        .once()
        .withArgs(testProductIds)
        .returns(associatedMedia);
      productV4Service
        .getProductsWithType(
          request.productType as any,
          request.offset,
          request.limit,
          request.responseGroup as any
        )
        .then((retrivedProduct) => {
          expect(retrivedProduct).to.be.an('Array');
          expect(retrivedProduct.length).to.equal(1);
          expect(retrivedProduct[0].product._id).to.equal(
            chapterProducts[0]._id
          );
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
    it(`should return valid products along with availabilty by passing
      responseGroup as large`, (done) => {
      const request = {
        limit: 1,
        offset: 0,
        productType: 'chapter',
        responseGroup: 'large'
      };
      const chapterProducts = [
        {
          _createdDate: '2020-02-04T11:20:03.202Z',
          _id: 'some-uuid',
          _isSellable: false,
          _modifiedDate: '2020-02-04T11:20:03.202Z',
          _schemaVersion: '4.0.1',
          _status: 'Available',
          associatedMedia: [],
          audience: [],
          availability: [
            {
              errors: ['random'],
              name: 'some-channel',
              status: ['some-status', 'some-status1']
            }
          ],
          categories: [],
          chapter: {
            abstracts: [
              {
                location: null,
                type: 'text',
                value:
                  'The purpose of this chapter has been to summarize the actions, styles and symbols depicted by children and adolescents in their Kinetic Family Drawings.'
              }
            ],
            copyright: null,
            description: null,
            doiRegistrationStatus: false,
            edition: null,
            firstPublishedYear: null,
            inLanguage: null,
            pageEnd: 296,
            pageStart: 296,
            plannedPublicationDate: null,
            publicationDate: null,
            publisherImprint: 'Routledge',
            subtitle: null
          },
          classifications: [
            {
              code: 'SCBE0525',
              level: 3,
              name: 'Creative Arts & Expressive Therapies',
              priority: 1,
              type: 'subject'
            }
          ],
          contributors: [],
          identifiers: {
            chapterId: null,
            doi: '10.4324/9780203765531-8',
            sku: null
          },
          isPartOf: [],
          keywords: [],
          permissions: [],
          rights: [],
          source: 'HUB',
          title: 'CONCLUSION',
          type: 'chapter',
          version: null
        }
      ];
      const associatedMedia = [
        {
          _id: 'some-id',
          location: 'image-url',
          parentId: 'some-uuid',
          parentType: 'some-type',
          size: 0,
          type: 'coverimage',
          versionType: 'FINAL'
        }
      ];
      const testProductIds = ['some-uuid'];
      productV4DAOMock
        .expects('getProductsWithType')
        .once()
        .withArgs(request.productType, request.offset, request.limit, [
          ...apiResponseGroupConfig.getProjectionFields(
            request.productType,
            'large'
          )
        ])
        .returns(chapterProducts);
      associatedMediaV4ServiceMock
        .expects('getAsstMediasByParentIds')
        .once()
        .withArgs(testProductIds)
        .returns(associatedMedia);
      productV4Service
        .getProductsWithType(
          request.productType as any,
          request.offset,
          request.limit,
          request.responseGroup as any
        )
        .then((retrivedProduct) => {
          expect(retrivedProduct).to.be.an('Array');
          expect(retrivedProduct.length).to.equal(1);
          expect(retrivedProduct[0]).to.have.property('product');
          expect(retrivedProduct[0].product._id).to.equal(
            chapterProducts[0]._id
          );
          expect(retrivedProduct[0].availability).to.be.an('Array');
          expect(retrivedProduct[0].availability.length).to.equal(1);
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
    it(`should return valid products by passing responseGroup as large`, (done) => {
      const request = {
        limit: 1,
        offset: 0,
        productType: 'chapter',
        responseGroup: 'large'
      };
      const chapterProducts = [
        {
          _createdDate: '2020-02-04T11:20:03.202Z',
          _id: 'some-uuid',
          _isSellable: false,
          _modifiedDate: '2020-02-04T11:20:03.202Z',
          _schemaVersion: '4.0.1',
          _status: 'Available',
          associatedMedia: [],
          audience: [],
          availability: [
            {
              errors: ['random'],
              name: 'some-channel',
              status: ['some-status', 'some-status1']
            }
          ],
          categories: [],
          chapter: {
            abstracts: [
              {
                location: null,
                type: 'text',
                value:
                  'The purpose of this chapter has been to summarize the actions, styles and symbols depicted by children and adolescents in their Kinetic Family Drawings.'
              }
            ],
            copyright: null,
            description: null,
            doiRegistrationStatus: false,
            edition: null,
            firstPublishedYear: null,
            inLanguage: null,
            pageEnd: 296,
            pageStart: 296,
            plannedPublicationDate: null,
            publicationDate: null,
            publisherImprint: 'Routledge',
            subtitle: null
          },
          classifications: [
            {
              code: 'SCBE0525',
              level: 3,
              name: 'Creative Arts & Expressive Therapies',
              priority: 1,
              type: 'subject'
            }
          ],
          contributors: [],
          identifiers: {
            chapterId: null,
            doi: '10.4324/9780203765531-8',
            sku: null
          },
          isPartOf: [],
          keywords: [],
          permissions: [],
          rights: [],
          source: 'HUB',
          title: 'CONCLUSION',
          type: 'chapter',
          version: null
        }
      ];
      const associatedMedia = [
        {
          _id: 'some-id',
          location: 'image-url',
          parentId: 'some-uuid',
          parentType: 'some-type',
          size: 0,
          type: 'coverimage',
          versionType: 'FINAL'
        }
      ];
      const testProductIds = ['some-uuid'];
      productV4DAOMock
        .expects('getProductsWithType')
        .once()
        .withArgs(
          request.productType,
          request.offset,
          request.limit,
          apiResponseGroupConfig.getProjectionFields(
            request.productType,
            'large'
          )
        )
        .returns(chapterProducts);
      associatedMediaV4ServiceMock
        .expects('getAsstMediasByParentIds')
        .once()
        .withArgs(testProductIds)
        .returns(associatedMedia);
      productV4Service
        .getProductsWithType(
          request.productType as any,
          request.offset,
          request.limit,
          request.responseGroup as any
        )
        .then((retrivedProduct) => {
          expect(retrivedProduct).to.be.an('Array');
          expect(retrivedProduct.length).to.equal(1);
          expect(retrivedProduct[0].product._id).to.equal(
            chapterProducts[0]._id
          );
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
    it(`should return valid products along with specific availabilty by passing
      responseGroup as large and availabilityName`, (done) => {
      const request = {
        limit: 1,
        offset: 0,
        productType: 'chapter',
        responseGroup: 'large'
      };
      const chapterProducts = [
        {
          _createdDate: '2020-02-04T11:20:03.202Z',
          _id: 'some-uuid',
          _isSellable: false,
          _modifiedDate: '2020-02-04T11:20:03.202Z',
          _schemaVersion: '4.0.1',
          _status: 'Available',
          associatedMedia: [],
          audience: [],
          availability: [
            {
              errors: ['random'],
              name: 'some-channel',
              status: ['some-status', 'some-status1']
            }
          ],
          categories: [],
          chapter: {
            abstracts: [
              {
                location: null,
                type: 'text',
                value:
                  'The purpose of this chapter has been to summarize the actions, styles and symbols depicted by children and adolescents in their Kinetic Family Drawings.'
              }
            ],
            copyright: null,
            description: null,
            doiRegistrationStatus: false,
            edition: null,
            firstPublishedYear: null,
            inLanguage: null,
            pageEnd: 296,
            pageStart: 296,
            plannedPublicationDate: null,
            publicationDate: null,
            publisherImprint: 'Routledge',
            subtitle: null
          },
          classifications: [
            {
              code: 'SCBE0525',
              level: 3,
              name: 'Creative Arts & Expressive Therapies',
              priority: 1,
              type: 'subject'
            }
          ],
          contributors: [],
          identifiers: {
            chapterId: null,
            doi: '10.4324/9780203765531-8',
            sku: null
          },
          isPartOf: [],
          keywords: [],
          permissions: [],
          rights: [],
          source: 'HUB',
          title: 'CONCLUSION',
          type: 'chapter',
          version: null
        }
      ];
      const availabilityName = 'some-channel';
      const associatedMedia = [
        {
          _id: 'some-id',
          location: 'image-url',
          parentId: 'some-uuid',
          parentType: 'some-type',
          size: 0,
          type: 'coverimage',
          versionType: 'FINAL'
        }
      ];
      const testProductIds = ['some-uuid'];
      productV4DAOMock
        .expects('getProductsWithType')
        .once()
        .withArgs(request.productType, request.offset, request.limit, [
          ...apiResponseGroupConfig.getProjectionFields(
            request.productType,
            'large'
          )
        ])
        .returns(chapterProducts);
      associatedMediaV4ServiceMock
        .expects('getAsstMediasByParentIds')
        .once()
        .withArgs(testProductIds)
        .returns(associatedMedia);
      productV4Service
        .getProductsWithType(
          request.productType as any,
          request.offset,
          request.limit,
          request.responseGroup as any,
          availabilityName
        )
        .then((retrivedProduct) => {
          expect(retrivedProduct).to.be.an('Array');
          expect(retrivedProduct.length).to.equal(1);
          expect(retrivedProduct[0].product._id).to.equal(
            chapterProducts[0]._id
          );
          expect(retrivedProduct[0].availability).to.be.an('Array');
          expect(retrivedProduct[0].availability.length).to.equal(1);
          expect(retrivedProduct[0].availability[0].name).to.equal(
            availabilityName
          );
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
    it(`should return valid products along with empty availabilty by passing
        responseGroup as large and availabilityName as incorrect`, (done) => {
      const request = {
        limit: 1,
        offset: 0,
        productType: 'chapter',
        responseGroup: 'large'
      };
      const chapterProducts = [
        {
          _createdDate: '2020-02-04T11:20:03.202Z',
          _id: 'some-uuid',
          _isSellable: false,
          _modifiedDate: '2020-02-04T11:20:03.202Z',
          _schemaVersion: '4.0.1',
          _status: 'Available',
          associatedMedia: [],
          audience: [],
          availability: [
            {
              errors: ['random'],
              name: 'some-channel',
              status: ['some-status', 'some-status1']
            }
          ],
          categories: [],
          chapter: {
            abstracts: [
              {
                location: null,
                type: 'text',
                value:
                  'The purpose of this chapter has been to summarize the actions, styles and symbols depicted by children and adolescents in their Kinetic Family Drawings.'
              }
            ],
            copyright: null,
            description: null,
            doiRegistrationStatus: false,
            edition: null,
            firstPublishedYear: null,
            inLanguage: null,
            pageEnd: 296,
            pageStart: 296,
            plannedPublicationDate: null,
            publicationDate: null,
            publisherImprint: 'Routledge',
            subtitle: null
          },
          classifications: [
            {
              code: 'SCBE0525',
              level: 3,
              name: 'Creative Arts & Expressive Therapies',
              priority: 1,
              type: 'subject'
            }
          ],
          contributors: [],
          identifiers: {
            chapterId: null,
            doi: '10.4324/9780203765531-8',
            sku: null
          },
          isPartOf: [],
          keywords: [],
          permissions: [],
          rights: [],
          source: 'HUB',
          title: 'CONCLUSION',
          type: 'chapter',
          version: null
        }
      ];
      const availabilityName = 'Garbgevalue';
      const associatedMedia = [
        {
          _id: 'some-id',
          location: 'image-url',
          parentId: 'some-uuid',
          parentType: 'some-type',
          size: 0,
          type: 'coverimage',
          versionType: 'FINAL'
        }
      ];
      const testProductIds = ['some-uuid'];
      productV4DAOMock
        .expects('getProductsWithType')
        .once()
        .withArgs(request.productType, request.offset, request.limit, [
          ...apiResponseGroupConfig.getProjectionFields(
            request.productType,
            'large'
          )
        ])
        .returns(chapterProducts);
      associatedMediaV4ServiceMock
        .expects('getAsstMediasByParentIds')
        .once()
        .withArgs(testProductIds)
        .returns(associatedMedia);
      productV4Service
        .getProductsWithType(
          request.productType as any,
          request.offset,
          request.limit,
          request.responseGroup as any,
          availabilityName
        )
        .then((retrivedProduct) => {
          expect(retrivedProduct).to.be.an('Array');
          expect(retrivedProduct.length).to.equal(1);
          expect(retrivedProduct[0].product._id).to.equal(
            chapterProducts[0]._id
          );
          expect(retrivedProduct[0].availability).to.be.an('Array');
          expect(retrivedProduct[0].availability.length).to.equal(0);
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
    it(`should return valid products with empty availabilty when product does not have availabilty by passing
      responseGroup as large and availabilityName as incorrect`, (done) => {
      const request = {
        limit: 1,
        offset: 0,
        productType: 'chapter',
        responseGroup: 'large'
      };
      const chapterProducts = [
        {
          _createdDate: '2020-02-04T11:20:03.202Z',
          _id: 'some-uuid',
          _isSellable: false,
          _modifiedDate: '2020-02-04T11:20:03.202Z',
          _schemaVersion: '4.0.1',
          _status: 'Available',
          associatedMedia: [],
          audience: [],
          categories: [],
          chapter: {
            abstracts: [
              {
                location: null,
                type: 'text',
                value:
                  'The purpose of this chapter has been to summarize the actions, styles and symbols depicted by children and adolescents in their Kinetic Family Drawings.'
              }
            ],
            copyright: null,
            description: null,
            doiRegistrationStatus: false,
            edition: null,
            firstPublishedYear: null,
            inLanguage: null,
            pageEnd: 296,
            pageStart: 296,
            plannedPublicationDate: null,
            publicationDate: null,
            publisherImprint: 'Routledge',
            subtitle: null
          },
          classifications: [
            {
              code: 'SCBE0525',
              level: 3,
              name: 'Creative Arts & Expressive Therapies',
              priority: 1,
              type: 'subject'
            }
          ],
          contributors: [],
          identifiers: {
            chapterId: null,
            doi: '10.4324/9780203765531-8',
            sku: null
          },
          isPartOf: [],
          keywords: [],
          permissions: [],
          rights: [],
          source: 'HUB',
          title: 'CONCLUSION',
          type: 'chapter',
          version: null
        }
      ];
      const availabilityName = 'Garbagevalue';
      const associatedMedia = [
        {
          _id: 'some-id',
          location: 'image-url',
          parentId: 'some-uuid',
          parentType: 'some-type',
          size: 0,
          type: 'coverimage',
          versionType: 'FINAL'
        }
      ];
      const testProductIds = ['some-uuid'];
      const projectionFields = JSON.parse(
        JSON.stringify(
          apiResponseGroupConfig.getProjectionFields(
            request.productType,
            'large'
          )
        )
      );
      productV4DAOMock
        .expects('getProductsWithType')
        .once()
        .withArgs(
          request.productType,
          request.offset,
          request.limit,
          projectionFields
        )
        .returns(chapterProducts);
      associatedMediaV4ServiceMock
        .expects('getAsstMediasByParentIds')
        .once()
        .withArgs(testProductIds)
        .returns(associatedMedia);
      productV4Service
        .getProductsWithType(
          request.productType as any,
          request.offset,
          request.limit,
          request.responseGroup as any,
          availabilityName
        )
        .then((retrivedProduct) => {
          expect(retrivedProduct).to.be.an('Array');
          expect(retrivedProduct.length).to.equal(1);
          expect(retrivedProduct[0].product._id).to.equal(
            chapterProducts[0]._id
          );
          expect(retrivedProduct[0].availability).to.be.an('Array');
          expect(retrivedProduct[0].availability.length).to.equal(0);
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
  });
  describe('getNewId', () => {
    it('should return a string uuid', (done) => {
      try {
        const returnedUUID = productV4Service.getNewId();
        expect(returnedUUID).to.be.a('string');
        done();
      } catch (error) {
        done(error);
      }
    });
  });
  describe('createProduct', () => {
    it('should process creativework', (done) => {
      const stubData = getStubData();
      const testCreativeWork = {
        _id: 'abc',
        _sources: [{ source: 'WEBCMS', type: 'product' }],
        creativeWork: {
          format: 'portableDocument'
        },
        identifiers: {},
        isPartOf: [],
        subType: 'some-valid-subType',
        type: 'creativeWork'
      };
      const res = { _id: testCreativeWork._id };
      stubData.creativeWorkV4ServiceMock
        .expects('createCreativeWork')
        .once()
        .withArgs(testCreativeWork)
        .returns(res);
      productV4Service
        .createProduct(testCreativeWork as any)
        .then((createdProduct) => {
          expect(createdProduct).to.deep.equal(res);
          stubData.creativeWorkV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.creativeWorkV4ServiceMock.restore();
        });
    });
    it('should process creativework by coping the same format as subType', (done) => {
      const stubData = getStubData();
      const testCreativeWork = {
        _id: 'abc',
        _sources: [{ source: 'WEBCMS', type: 'product' }],
        creativeWork: {
          format: 'portableDocument',
          mediaType: 'application/pdf'
        },
        identifiers: {},
        isPartOf: [],
        type: 'creativeWork'
      };
      const res = { _id: testCreativeWork._id };
      stubData.creativeWorkV4ServiceMock
        .expects('createCreativeWork')
        .once()
        .withArgs({
          ...testCreativeWork,
          creativeWork: {
            format: 'portableDocument'
          },
          subType: 'portableDocument'
        })
        .returns(res);
      productV4Service
        .createProduct(testCreativeWork as any)
        .then((createdProduct) => {
          expect(createdProduct).to.deep.equal(res);
          stubData.creativeWorkV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          stubData.creativeWorkV4ServiceMock.restore();
        });
    });
    it('should throw error when productType is undefined', (done) => {
      const stubData = getStubData();
      const testCreativeWork: StorageModel.Product = {
        _id: 'abc',
        _sources: [{ source: 'WEBCMS', type: 'product' }],
        identifiers: {
          doi: 'abc'
        }
      } as StorageModel.Product;
      stubData.creativeWorkV4ServiceMock.expects('createCreativeWork').never();
      productV4Service
        .createProduct(testCreativeWork)
        .then(() => {
          done(new Error('Expecting Products not found. but got success'));
        })
        .catch((error) => {
          expect(error.code).to.equal(400);
          expect(error.message).to.equal('Product Type not defined');
          expect(error.name).to.equal('AppError');
          stubData.creativeWorkV4ServiceMock.verify();
          done();
        })
        .finally(() => {
          stubData.creativeWorkV4ServiceMock.restore();
        });
    });
    it('should throw error when productType is invalid', (done) => {
      const stubData = getStubData();
      const testCreativeWork = {
        _id: 'abc',
        identifiers: {
          doi: 'abc'
        },
        source: 'API',
        type: 'invalid_product_type'
      } as any;
      stubData.creativeWorkV4ServiceMock.expects('createCreativeWork').never();
      productV4Service
        .createProduct(testCreativeWork)
        .then(() => {
          done(new Error('Expecting Products not found. but got success'));
        })
        .catch((error) => {
          expect(error.code).to.equal(405);
          expect(error.message).to.equal(
            `Invalid Product type: ${testCreativeWork.type}.`
          );
          expect(error.name).to.equal('AppError');
          stubData.creativeWorkV4ServiceMock.verify();
          done();
        })
        .finally(() => {
          stubData.creativeWorkV4ServiceMock.restore();
        });
    });
    it('should throw error when creativeWork attribute is missing', (done) => {
      const stubData = getStubData();
      const testCreativeWork = {
        _id: 'abc',
        identifiers: {
          doi: 'abc'
        },
        source: 'API',
        type: 'creativeWork'
      } as any;
      stubData.creativeWorkV4ServiceMock.expects('createCreativeWork').never();
      productV4Service
        .createProduct(testCreativeWork)
        .then(() => {
          done(new Error('Expecting Products not found. but got success'));
        })
        .catch((error) => {
          expect(error.code).to.equal(400);
          expect(error.message).to.equal(
            `Invalid creativeWork: ${testCreativeWork.creativeWork}.`
          );
          expect(error.name).to.equal('AppError');
          stubData.creativeWorkV4ServiceMock.verify();
          done();
        })
        .finally(() => {
          stubData.creativeWorkV4ServiceMock.restore();
        });
    });
    it('should throw error when format attribute is missing', (done) => {
      const stubData = getStubData();
      const testCreativeWork = {
        _id: 'abc',
        creativeWork: {
          subType: 'portableDocument'
        },
        identifiers: {
          doi: 'abc'
        },
        source: 'API',
        type: 'creativeWork'
      } as any;
      stubData.creativeWorkV4ServiceMock.expects('createCreativeWork').never();
      productV4Service
        .createProduct(testCreativeWork)
        .then(() => {
          done(new Error('Expecting Products not found. but got success'));
        })
        .catch((error) => {
          expect(error.code).to.equal(400);
          expect(error.message).to.equal(
            `Invalid format: ${testCreativeWork.creativeWork.format}.`
          );
          expect(error.name).to.equal('AppError');
          stubData.creativeWorkV4ServiceMock.verify();
          done();
        })
        .finally(() => {
          stubData.creativeWorkV4ServiceMock.restore();
        });
    });
    it('should throw error when format is not valid', (done) => {
      const stubData = getStubData();
      const testCreativeWork = {
        _id: 'abc',
        creativeWork: {
          format: 'invalid-format',
          mediaType: 'invalid-media-type'
        },
        identifiers: {
          doi: 'abc'
        },
        source: 'API',
        type: 'creativeWork'
      } as any;
      stubData.creativeWorkV4ServiceMock.expects('createCreativeWork').never();
      productV4Service
        .createProduct(testCreativeWork)
        .then(() => {
          done(new Error('Expecting Products not found. but got success'));
        })
        .catch((error) => {
          expect(error.code).to.equal(400);
          expect(error.message).to.equal(
            `Invalid format: ${testCreativeWork.creativeWork.format}.`
          );
          expect(error.name).to.equal('AppError');
          stubData.creativeWorkV4ServiceMock.verify();
          done();
        })
        .finally(() => {
          stubData.creativeWorkV4ServiceMock.restore();
        });
    });
  });
  describe('isOpenAccess', () => {
    it('should return true when product has permission open-access', (done) => {
      const id = 'some-id';
      const productType = 'book';
      const stubData = getStubData();
      stubData.productV4DAOMock
        .expects('getProduct')
        .once()
        .withArgs(productType, id, ['permissions.name'])
        .resolves({
          _id: id,
          permissions: [{ name: 'rfm' }, { name: 'open-access' }]
        });
      productV4Service
        .isOpenAccess(productType, id)
        .then((product) => {
          expect(product).to.equal(true);
          stubData.productV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.productV4DAOMock.restore();
        });
    });
    it('should return false when product doesnot have permission open-access', (done) => {
      const id = 'some-id';
      const productType = 'book';
      const stubData = getStubData();
      stubData.productV4DAOMock
        .expects('getProduct')
        .once()
        .withArgs(productType, id, ['permissions.name'])
        .resolves({ _id: id, permissions: [{ name: 'rfm' }, { name: 'drm' }] });
      productV4Service
        .isOpenAccess(productType, id)
        .then((product) => {
          expect(product).to.equal(false);
          stubData.productV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.productV4DAOMock.restore();
        });
    });
    it('should return false when product is null', (done) => {
      const id = 'some-id';
      const productType = 'book';
      const stubData = getStubData();
      stubData.productV4DAOMock
        .expects('getProduct')
        .once()
        .withArgs(productType, id, ['permissions.name'])
        .resolves(null);
      productV4Service
        .isOpenAccess(productType, id)
        .then((product) => {
          expect(product).to.equal(false);
          stubData.productV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.productV4DAOMock.restore();
        });
    });
    it('should return false when permissions is null', (done) => {
      const id = 'some-id';
      const productType = 'book';
      const stubData = getStubData();
      stubData.productV4DAOMock
        .expects('getProduct')
        .once()
        .withArgs(productType, id, ['permissions.name'])
        .resolves({ _id: id, permissions: null });
      productV4Service
        .isOpenAccess(productType, id)
        .then((product) => {
          expect(product).to.equal(false);
          stubData.productV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.productV4DAOMock.restore();
        });
    });
    it('should return false when permissions is empty array []', (done) => {
      const id = 'some-id';
      const productType = 'book';
      const stubData = getStubData();
      stubData.productV4DAOMock
        .expects('getProduct')
        .once()
        .withArgs(productType, id, ['permissions.name'])
        .resolves({ _id: id, permissions: [] });
      productV4Service
        .isOpenAccess(productType, id)
        .then((product) => {
          expect(product).to.equal(false);
          stubData.productV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.productV4DAOMock.restore();
        });
    });
  });
  describe('E2E', () => {
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
      const TestAsset = mongoose.model(
        'TestAssetV4',
        MongooseSchema.Asset,
        'assets-4.0.1'
      );
      await TestAsset.insertMany(assetsTestData);
      const TestAssociatedMedia = mongoose.model(
        'TestAssociatedMediaV4',
        MongooseSchema.AssociatedMedia,
        'associatedmedia-4.0.1'
      );
      await TestAssociatedMedia.insertMany(associatedMediaTestData);
      const TestBooksV4 = mongoose.model(
        'TestBooksV4',
        MongooseSchema.Book,
        'books-4.0.1'
      );
      await TestBooksV4.insertMany(booksTestData);
    });
    after(async () => {
      await mongoose.disconnect();
      await mongoServer.stop();
    });

    it('should have all the methods', () => {
      expect(productV4Service).to.respondTo('getProductById');
    });

    describe('getProduct', () => {
      it('should return a product small when the response group is small', (done) => {
        const id = '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896';
        const productType = 'book';
        const responseGroup = 'small';
        productV4Service
          .getProductById(id, responseGroup)
          .then((response) => {
            const product = response.product;
            expect(product).to.have.property('_id', id);
            expect(product).to.have.property('type', productType);
            expect(product).to.have.property('version');
            expect(product).to.have.property('title');
            expect(product).to.have.property('identifiers');
            expect(product).to.not.have.property('book');
            expect(product).to.not.have.property('audience');
            expect(product).to.not.have.property('categories');
            expect(product).to.not.have.property('classifications');
            expect(product).to.not.have.property('contributors');
            expect(product).to.not.have.property('discountGroups');
            expect(product).to.not.have.property('isPartOf');
            expect(product).to.not.have.property('keywords');
            expect(product).to.not.have.property('permissions');
            expect(product).to.not.have.property('prices');
            expect(product).to.not.have.property('rights');
            done();
          })
          .catch(done);
      });
      it('should return a book medium for a book-id when response group is medium', (done) => {
        const id = '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896';
        const productType = 'book';
        const responseGroup = 'medium';
        productV4Service
          .getProductById(id, responseGroup)
          .then((response) => {
            const product = response['product'];
            const expectedBookMetadataProps = [
              'subtitle',
              'publisherImprint',
              'publicationDate',
              'copyright',
              'edition',
              'doiRegistrationStatus',
              'firstPublishedYear',
              'plannedPublicationDate',
              'inLanguage',
              'shortTitle',
              'bindingStyle',
              'bindingStyleCode',
              'publicationLocation',
              'legacyDivision',
              'formerImprints',
              'legalOwner',
              'formatCode',
              'format',
              'textType',
              'textTypeCode',
              'publisherArea',
              'publisherAreaCode',
              'division',
              'divisionCode',
              'status',
              'statusCode',
              'fundingGroups',
              'license'
            ];
            expect(product).to.have.property('_id', id);
            expect(product).to.have.property('type', productType);
            expect(product).to.have.property('version');
            expect(product).to.have.property('title');
            expect(product).to.have.property('identifiers');
            expect(product).to.have.property('categories');
            expect(product).to.have.property('contributors');
            expect(product).to.have.property('permissions');
            expect(product).to.have.property('prices');
            expect(product).to.have.property('rights');
            expect(product).to.have.property('discountGroups');
            expect(product).to.have.property('book');
            expectedBookMetadataProps.forEach((prop) => {
              expect(product.book).to.have.property(prop);
            });
            expect(product).to.not.have.property('isPartOf');
            expect(product).to.not.have.property('keywords');
            expect(product).to.not.have.property('classifications');
            expect(product).to.not.have.property('audience');
            done();
          })
          .catch(done);
      });

      it('should return a product large when the response group is large', (done) => {
        const id = '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896';
        const productType = 'book';
        const responseGroup = 'large';
        productV4Service
          .getProductById(id, responseGroup)
          .then((response) => {
            const product = response['product'];
            // TODO: Find a better way to check each and every property of Product
            expect(product).to.have.property('_id', id);
            expect(product).to.have.property('type', productType);
            expect(product).to.have.property('version');
            expect(product).to.have.property('title');
            expect(product).to.have.property('identifiers');
            expect(product).to.have.property('book');
            expect(product).to.have.property('associatedMedia');
            expect(product).to.have.property('audience');
            expect(product).to.have.property('categories');
            expect(product).to.have.property('classifications');
            expect(product).to.have.property('contributors');
            expect(product).to.have.property('discountGroups');
            expect(product).to.have.property('isPartOf');
            expect(product).to.have.property('keywords');
            expect(product).to.have.property('permissions');
            expect(product).to.have.property('prices');
            expect(product).to.have.property('rights');
            done();
          })
          .catch(done);
      });
    });
  });
  describe('getTaxonomy', () => {
    it('should return taxonomy', (done) => {
      const stubData = getStubData();
      const assetType = 'book';
      const taxonomyType = 'subject';
      const testTaxonomyFilter = {
        code: 'SCAG',
        extendLevel: false,
        isCodePrefix: false,
        level: 1,
        name: undefined
      };
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
      stubData.taxonomyV4ServiceMock
        .expects('getTaxonomy')
        .once()
        .withArgs(assetType, taxonomyType, testTaxonomyFilter)
        .resolves(testTaxonomy);
      productV4Service
        .getTaxonomy(assetType, taxonomyType, testTaxonomyFilter)
        .then((taxonomys) => {
          expect(taxonomys).to.be.an('array');
          expect(taxonomys.length).to.equal(1);
          taxonomys.forEach((taxonomy) => {
            expect(taxonomy).to.have.property('assetType', assetType);
            expect(taxonomy).to.have.property('type', taxonomyType);
          });
          stubData.taxonomyV4ServiceMock.verify();
          stubData.associatedMediaV4ServiceMock.verify();
          stubData.assetV4ServiceMock.verify();
          stubData.apiResponseGroupConfigMock.verify();
          stubData.productV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.taxonomyV4ServiceMock.restore();
          stubData.associatedMediaV4ServiceMock.restore();
          stubData.assetV4ServiceMock.restore();
          stubData.apiResponseGroupConfigMock.restore();
          stubData.productV4DAOMock.restore();
        });
    });
  });
  describe('getAvailabilityForChannel', () => {
    it('should return specific availability', (done) => {
      const bookProduct: StorageModel.Product = {
        _id: 'some-id',
        _isSellable: true,
        _status: 'Available',
        availability: [
          {
            errors: ['random'],
            name: 'some-channel',
            status: ['some-status', 'some-status1']
          },
          {
            errors: ['random'],
            name: 'another-channel',
            status: ['some-status', 'some-status1']
          }
        ],
        identifiers: {
          isbn: 'some-isbn'
        },
        title: 'some-title',
        type: 'book',
        version: null
      } as StorageModel.Product;

      const availabilityName = 'some-channel';
      try {
        const availability = productV4Service.getAvailabilityForChannel(
          bookProduct,
          availabilityName
        );
        expect(availability).to.be.an('Array');
        expect(availability.length).to.equal(1);
        expect(availability[0].name).to.equal(availabilityName);
        done();
      } catch (error) {
        done(error);
      }
    });

    it('should return empty availability when the channel name is invalid', (done) => {
      const bookProduct: StorageModel.Product = {
        _id: 'some-id',
        _isSellable: true,
        _status: 'Available',
        availability: [
          {
            errors: ['random'],
            name: 'some-channel',
            status: ['some-status', 'some-status1']
          },
          {
            errors: ['random'],
            name: 'another-channel',
            status: ['some-status', 'some-status1']
          }
        ],
        identifiers: {
          isbn: 'some-isbn'
        },
        title: 'some-title',
        type: 'book',
        version: null
      } as StorageModel.Product;

      const availabilityName = 'garbage-channel';
      try {
        const availability = productV4Service.getAvailabilityForChannel(
          bookProduct,
          availabilityName
        );
        expect(availability).to.be.an('Array');
        expect(availability.length).to.equal(0);
        done();
      } catch (error) {
        done(error);
      }
    });
    it('should return empty availability when product is invalid', (done) => {
      const bookProduct: StorageModel.Product = {} as StorageModel.Product;
      const availabilityName = 'UBX';
      try {
        const availability = productV4Service.getAvailabilityForChannel(
          bookProduct,
          availabilityName
        );
        expect(availability).to.be.an('Array');
        expect(availability.length).to.equal(0);
        done();
      } catch (error) {
        done(error);
      }
    });
  });
  describe('getRulesStringFromSearchQuery', () => {
    it('it should return _id when request is valid', (done) => {
      const searchRequest: { apiVersion: string; data: GroupedSearchQuery[] } =
        {
          apiVersion: '4.0.1',
          data: [
            {
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
          ]
        };
      const rulesString =
        '{"book.publicationDate":{"$gt":ISODate("2020-01-20T00:00:00.000Z")}}';
      const searchRequestCopy = _.cloneDeep(searchRequest) as any;
      delete searchRequestCopy.data[0].rules;
      searchRequestCopy.data[0].rulesString = rulesString;
      try {
        const response = productV4Service.getRulesStringFromSearchQuery(
          searchRequest.data
        );

        expect(response).to.deep.equal(searchRequestCopy.data);
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  describe('uploadSearchRequest', () => {
    it('it should return _id when request is valid', (done) => {
      const searchRequest: ISearchReqDownload = {
        _id: 'UUID',
        action: 'download',
        apiVersion: '4.0.1',
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
        ]
      };
      const rulesString =
        '{"book.publicationDate":{"$gt":ISODate("2020-01-20T00:00:00.000Z")}}';
      const eventServiceMock = sinon.mock(eventService);
      const searchRequestCopy = _.cloneDeep(searchRequest);
      const productSource = 'SEARCHDOWNLOAD';
      searchRequestCopy.rulesList[0].rulesString = rulesString;
      eventServiceMock
        .expects('sendProductEvent')
        .once()
        .withArgs(searchRequest, searchResultDownloadQueue, productSource)
        .resolves('some-event-id');
      productV4Service
        .uploadSearchRequest(searchRequest)
        .then((response) => {
          expect(response).to.deep.equal({ _id: 'UUID' });
          eventServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          eventServiceMock.restore();
        });
    });
    it(`it should return _id when request is valid and rulesList
        containing more than one object`, (done) => {
      const searchRequest: ISearchReqDownload = {
        _id: 'UUID',
        action: 'download',
        apiVersion: '4.0.1',
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
          },
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
                  relationship: 'LT',
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
        ]
      };
      const rulesString1 =
        '{"book.publicationDate":{"$gt":ISODate("2020-01-20T00:00:00.000Z")}}';
      const rulesString2 =
        '{"book.publicationDate":{"$lt":ISODate("2020-01-20T00:00:00.000Z")}}';
      const searchRequestCopy = _.cloneDeep(searchRequest);
      const eventServiceMock = sinon.mock(eventService);
      const productSource = 'SEARCHDOWNLOAD';
      searchRequestCopy.rulesList[0].rulesString = rulesString1;
      searchRequestCopy.rulesList[1].rulesString = rulesString2;
      eventServiceMock
        .expects('sendProductEvent')
        .once()
        .withArgs(searchRequest, searchResultDownloadQueue, productSource)
        .resolves('some-event-id');
      productV4Service
        .uploadSearchRequest(searchRequest)
        .then((response) => {
          expect(response).to.deep.equal({ _id: 'UUID' });
          eventServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          eventServiceMock.restore();
        });
    });
    it('it should return _id when request is valid and contain availabilty filter', (done) => {
      const searchRequest: ISearchReqDownload = {
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
        ]
      };
      const rulesString =
        '{"$and":[' +
        '{"book.publicationDate":{"$gt":ISODate("2020-01-20T00:00:00.000Z")}},' +
        '{"availability":{"$elemMatch":{"name":"UBX","status":{"$all":["SELLABLE"]}}}}' +
        ']' +
        '}';
      const searchRequestCopy = _.cloneDeep(searchRequest);
      const eventServiceMock = sinon.mock(eventService);
      const productSource = 'SEARCHDOWNLOAD';
      searchRequestCopy.rulesList[0].rulesString = rulesString;
      eventServiceMock
        .expects('sendProductEvent')
        .once()
        .withArgs(searchRequest, searchResultDownloadQueue, productSource)
        .resolves('some-event-id');
      productV4Service
        .uploadSearchRequest(searchRequest)
        .then((response) => {
          expect(response).to.deep.equal({ _id: 'UUID' });
          eventServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          eventServiceMock.restore();
        });
    });
  });
  describe('uploadOAUpdate', () => {
    it('should throw error when sqs return error', (done) => {
      const stubData = getStubData();
      const productId = 'some-uuid';
      const oaUpdate = {
        callBackurl: 'some-url',
        orderNumber: 'some-orderNumber',
        requestId: 'some-uuid',
        requestPayload: {}
      };
      stubData.assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(productId)
        .resolves({ _id: productId, type: 'BOOK' });
      stubData.sqsUtilsV4Mock
        .expects('sendOAUpdateMessage')
        .once()
        .withArgs({
          callBackurl: oaUpdate.callBackurl,
          data: { id: productId },
          orderNumber: oaUpdate.orderNumber,
          transactionId: oaUpdate.requestId
        })
        .resolves(null);
      productV4Service
        .uploadOAUpdate(oaUpdate, productId)
        .then(() => {
          done(new Error('Expecting sqs error. but got success'));
        })
        .catch((error) => {
          expect(error.code).to.equal(500);
          expect(error.message).to.equal(
            `Error while uploading oaUpdate message`
          );
          expect(error.name).to.equal('AppError');
          stubData.assetV4ServiceMock.verify();
          stubData.sqsUtilsV4Mock.verify();
          done();
        })
        .finally(() => {
          stubData.assetV4ServiceMock.restore();
          stubData.sqsUtilsV4Mock.restore();
        });
    });
    it('should return Product (asset) not found. by passing invalid UUID', (done) => {
      const stubData = getStubData();
      const productId = 'invalid-uuid';
      const oaUpdate = {
        callBackurl: 'some-url',
        orderNumber: 'some-orderNumber',
        requestId: 'some-uuid',
        requestPayload: {}
      };
      stubData.assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(productId)
        .resolves(null);
      stubData.sqsUtilsV4Mock.expects('sendOAUpdateMessage').never();
      productV4Service
        .uploadOAUpdate(oaUpdate, productId)
        .then(() => {
          done(
            new Error('Expecting Product (asset) not found. but got success')
          );
        })
        .catch((err) => {
          expect(err.message).to.equal('Product (asset) not found.');
          expect(err.code).to.equal(404);
          expect(err.name).to.equal('AppError');
          stubData.assetV4ServiceMock.verify();
          stubData.sqsUtilsV4Mock.verify();
          done();
        })
        .finally(() => {
          stubData.assetV4ServiceMock.restore();
          stubData.sqsUtilsV4Mock.restore();
        });
    });
    it('should return valid messageId when processed successfully', (done) => {
      const stubData = getStubData();
      const productId = 'some-uuid';
      const oaUpdate = {
        callBackurl: 'some-url',
        orderNumber: 'some-orderNumber',
        requestId: 'some-uuid',
        requestPayload: {}
      };
      stubData.assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(productId)
        .resolves({ _id: productId, type: 'BOOK' });
      stubData.sqsUtilsV4Mock
        .expects('sendOAUpdateMessage')
        .once()
        .withArgs({
          callBackurl: oaUpdate.callBackurl,
          data: { id: productId },
          orderNumber: oaUpdate.orderNumber,
          transactionId: oaUpdate.requestId
        })
        .resolves('some-messageId');
      productV4Service
        .uploadOAUpdate(oaUpdate, productId)
        .then((res) => {
          expect(res).to.be.eqls('some-messageId');
          stubData.assetV4ServiceMock.verify();
          stubData.sqsUtilsV4Mock.verify();
          done();
        })
        .catch((error) => {
          done(error);
        })
        .finally(() => {
          stubData.assetV4ServiceMock.restore();
          stubData.sqsUtilsV4Mock.restore();
        });
    });
  });
  describe('getValidEbookId', () => {
    it('should return valid ebook Id for books', (done) => {
      const stubData = getStubData();
      const ids = ['some-id', 'other-id'];
      const projectionFields = ['book.formatCode', '_id', 'book.status'];
      stubData.productV4DAOMock
        .expects('getProductsByIds')
        .once()
        .withArgs('book', ids, { projectionFields })
        .resolves([
          {
            _id: ids[0],
            book: {
              formatCode: 'EBK',
              status: 'Available'
            }
          },
          {
            _id: ids[1],
            book: {
              formatCode: 'EBK',
              status: 'Out of Print'
            }
          }
        ]);
      productV4Service
        .getValidEbookId(ids, 'book')
        .then((res) => {
          expect(res).to.be.eqls(ids[0]);
          stubData.productV4DAOMock.verify();
          done();
        })
        .catch((error) => {
          done(error);
        })
        .finally(() => {
          stubData.productV4DAOMock.restore();
        });
    });
    it('should return valid ebook Id for books and status code is available', (done) => {
      const stubData = getStubData();
      const ids = ['some-id', 'other-id'];
      const projectionFields = ['book.formatCode', '_id', 'book.status'];
      stubData.productV4DAOMock
        .expects('getProductsByIds')
        .once()
        .withArgs('book', ids, { projectionFields })
        .resolves([
          {
            _id: ids[0],
            book: {
              formatCode: 'EBK',
              status: 'Available'
            }
          },
          {
            _id: ids[1],
            book: {
              formatCode: 'EBK',
              status: 'Out of Print'
            }
          }
        ]);
      productV4Service
        .getValidEbookId(ids, 'book')
        .then((res) => {
          expect(res).to.be.eqls(ids[0]);
          stubData.productV4DAOMock.verify();
          done();
        })
        .catch((error) => {
          done(error);
        })
        .finally(() => {
          stubData.productV4DAOMock.restore();
        });
    });
    it('should return valid ebook Id for books and status code is out of print', (done) => {
      const stubData = getStubData();
      const ids = ['some-id', 'other-id'];
      const projectionFields = ['book.formatCode', '_id', 'book.status'];
      stubData.productV4DAOMock
        .expects('getProductsByIds')
        .once()
        .withArgs('book', ids, { projectionFields })
        .resolves([
          {
            _id: ids[0],
            book: {
              formatCode: 'EBK',
              status: 'Out of Print'
            }
          },
          {
            _id: ids[1],
            book: {
              formatCode: 'EBK',
              status: 'Withdrawn'
            }
          }
        ]);
      productV4Service
        .getValidEbookId(ids, 'book')
        .then((res) => {
          expect(res).to.be.eqls(ids[0]);
          stubData.productV4DAOMock.verify();
          done();
        })
        .catch((error) => {
          done(error);
        })
        .finally(() => {
          stubData.productV4DAOMock.restore();
        });
    });
    it('should return valid ebook Id for books and status code is Withdrawn', (done) => {
      const stubData = getStubData();
      const ids = ['some-id', 'other-id'];
      const projectionFields = ['book.formatCode', '_id', 'book.status'];
      stubData.productV4DAOMock
        .expects('getProductsByIds')
        .once()
        .withArgs('book', ids, { projectionFields })
        .resolves([
          {
            _id: ids[0],
            book: {
              formatCode: 'EBK',
              status: 'Withdrawn'
            }
          },
          {
            _id: ids[1],
            book: {
              formatCode: 'EBK',
              status: 'some'
            }
          }
        ]);
      productV4Service
        .getValidEbookId(ids, 'book')
        .then((res) => {
          expect(res).to.be.eqls(ids[0]);
          stubData.productV4DAOMock.verify();
          done();
        })
        .catch((error) => {
          done(error);
        })
        .finally(() => {
          stubData.productV4DAOMock.restore();
        });
    });
    it('should return valid ebook Id for books and status code is Withdrawn and format is EBK', (done) => {
      const stubData = getStubData();
      const ids = ['some-id', 'other-id'];
      const projectionFields = ['book.formatCode', '_id', 'book.status'];
      stubData.productV4DAOMock
        .expects('getProductsByIds')
        .once()
        .withArgs('book', ids, { projectionFields })
        .resolves([
          {
            _id: ids[0],
            book: {
              formatCode: 'EBK',
              status: 'Withdrawn'
            }
          },
          {
            _id: ids[1],
            book: {
              formatCode: 'hardBack',
              status: 'some'
            }
          }
        ]);
      productV4Service
        .getValidEbookId(ids, 'book')
        .then((res) => {
          expect(res).to.be.eqls(ids[0]);
          stubData.productV4DAOMock.verify();
          done();
        })
        .catch((error) => {
          done(error);
        })
        .finally(() => {
          stubData.productV4DAOMock.restore();
        });
    });
    it('should return null when status is invalid', (done) => {
      const stubData = getStubData();
      const ids = ['some-id', 'other-id'];
      const projectionFields = ['book.formatCode', '_id', 'book.status'];
      stubData.productV4DAOMock
        .expects('getProductsByIds')
        .once()
        .withArgs('book', ids, { projectionFields })
        .resolves([
          {
            _id: ids[0],
            book: {
              formatCode: 'EBK',
              status: 'some-2'
            }
          },
          {
            _id: ids[1],
            book: {
              formatCode: 'EBK',
              status: 'some'
            }
          }
        ]);
      productV4Service
        .getValidEbookId(ids, 'book')
        .then((res) => {
          expect(res).to.be.eqls(null);
          stubData.productV4DAOMock.verify();
          done();
        })
        .catch((error) => {
          done(error);
        })
        .finally(() => {
          stubData.productV4DAOMock.restore();
        });
    });
    it('should return valid Id when only one id is valid', (done) => {
      const stubData = getStubData();
      const ids = ['some-id'];
      stubData.productV4DAOMock.expects('getProductsByIds').never();
      productV4Service
        .getValidEbookId(ids, 'book')
        .then((res) => {
          expect(res).to.be.eqls(ids[0]);
          stubData.productV4DAOMock.verify();
          done();
        })
        .catch((error) => {
          done(error);
        })
        .finally(() => {
          stubData.productV4DAOMock.restore();
        });
    });
    it('should return null when ebook product is empty', (done) => {
      const stubData = getStubData();
      const ids = ['some-id', 'other-id'];
      const projectionFields = ['book.formatCode', '_id', 'book.status'];
      stubData.productV4DAOMock
        .expects('getProductsByIds')
        .once()
        .withArgs('book', ids, { projectionFields })
        .resolves([
          {
            _id: ids[0],
            book: {
              formatCode: 'other',
              status: 'Withdrawn'
            }
          },
          {
            _id: ids[1],
            book: {
              formatCode: 'other',
              status: 'some'
            }
          }
        ]);
      productV4Service
        .getValidEbookId(ids, 'book')
        .then((res) => {
          expect(res).to.be.eqls(null);
          stubData.productV4DAOMock.verify();
          done();
        })
        .catch((error) => {
          done(error);
        })
        .finally(() => {
          stubData.productV4DAOMock.restore();
        });
    });
    it('should return null when there is no valid ebook Id', (done) => {
      const stubData = getStubData();
      const ids = ['some-id', 'some-other-id'];
      const projectionFields = ['book.formatCode', '_id', 'book.status'];
      stubData.productV4DAOMock
        .expects('getProductsByIds')
        .once()
        .withArgs('book', ids, { projectionFields })
        .resolves([
          {
            _id: null,
            book: {
              formatCode: 'EBK',
              status: 'Available'
            }
          },
          {
            _id: ids[1],
            book: {
              formatCode: 'EBK',
              status: 'Out of Print'
            }
          }
        ]);
      productV4Service
        .getValidEbookId(ids, 'book')
        .then((res) => {
          expect(res).to.be.eqls(null);
          stubData.productV4DAOMock.verify();
          done();
        })
        .catch((error) => {
          done(error);
        })
        .finally(() => {
          stubData.productV4DAOMock.restore();
        });
    });
  });
  describe('getTaxonomyClassifications', () => {
    it('should return classifications from taxonomy master', (done) => {
      const stubData = getStubData();
      const taxonomyMasterFilter = {
        classificationFamily: 'rom',
        classificationType: 'subject',
        code: 'sub_1',
        includeChildren: false,
        level: undefined
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
      stubData.taxonomyV4ServiceMock
        .expects('getTaxonomyClassifications')
        .once()
        .withArgs(taxonomyMasterFilter)
        .resolves(testTaxonomy);
      productV4Service
        .getTaxonomyClassifications(taxonomyMasterFilter)
        .then((classifications) => {
          expect(classifications).to.be.an('array');
          expect(classifications.length).to.equal(1);
          expect(classifications[0]).to.have.property('code', 'sub_1');
          expect(classifications[0]).to.have.property(
            'classificationType',
            'subject'
          );
          stubData.taxonomyV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.taxonomyV4ServiceMock.restore();
        });
    });
  });
  describe('getRelUrlFromProduct', () => {
    it('should return the canonical url for a book product', (done) => {
      const id = 'some-uuid';
      const productType = 'book';
      const projectionFields = apiResponseGroupConfig.getProjectionFields(
        productType,
        'medium'
      );
      const bookData = booksTestData.filter((book) => {
        return book._id === id && book.type === productType;
      });
      const expectedUrl = `${urlDomain}/books/mono/some-doi/title`;
      const stubData = getStubData();
      stubData.productV4DAOMock
        .expects('getProduct')
        .once()
        .withArgs(productType, id, projectionFields)
        .resolves({
          _id: bookData[0]._id,
          categories: bookData[0].categories,
          contributors: bookData[0].contributors,
          identifiers: bookData[0].identifiers,
          permissions: bookData[0].permissions,
          title: bookData[0].title,
          type: bookData[0].type
        });
      productV4Service
        .getRelUrlFromProduct(id, productType)
        .then((relUrl) => {
          expect(relUrl).to.equal(expectedUrl);
          stubData.productV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.productV4DAOMock.restore();
        });
    });
  });
  describe('getProductByIdentifier', () => {
    const identifierName = 'title';
    let identifierValue = 'The Beaulieu Encyclopedia of the Automobile';
    const productType = 'book';
    it('should return product record when passing valid identifier value and name', (done) => {
      productV4DAOMock
        .expects('getProductByIdentifier')
        .once()
        .withArgs(
          identifierName,
          identifierValue,
          productType,
          apiResponseGroupConfig.getProjectionFields(productType, 'small')
        )
        .resolves([{ _id: 'some-id', type: 'book' }]);
      productV4Service
        .getProductByIdentifier(identifierName, identifierValue, productType)
        .then((products) => {
          expect(products).to.be.an('array');
          expect(products.length).to.equal(1);
          productV4DAOMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          productV4DAOMock.restore();
        });
    });
    it('should return null when passing invalid identifier value and name', (done) => {
      identifierValue = 'invalid-value';
      productV4DAOMock
        .expects('getProductByIdentifier')
        .once()
        .withArgs(
          identifierName,
          identifierValue,
          productType,
          apiResponseGroupConfig.getProjectionFields(productType, 'small')
        )
        .resolves([]);
      productV4Service
        .getProductByIdentifier(identifierName, identifierValue, productType)
        .then((products) => {
          expect(products).to.be.an('array');
          expect(products.length).to.equal(0);
          productV4DAOMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          productV4DAOMock.restore();
        });
    });
  });
  describe('getPreArticlesByIdentifier', () => {
    const identifierName = 'submissionId';
    let identifierValues = ['172839139'];
    const productType = 'preArticle';
    it('should return pre-article record when passing valid identifier value and name', (done) => {
      productV4DAOMock
        .expects('getPreArticlesByIdentifier')
        .once()
        .withArgs(
          identifierName,
          identifierValues,
          productType,
          apiResponseGroupConfig.getProjectionFields(productType, 'small')
        )
        .resolves([{ _id: 'some-id', type: 'scholarlyArticle' }]);
      productV4Service
        .getPreArticlesByIdentifier(
          identifierName,
          identifierValues,
          productType
        )
        .then((products) => {
          expect(products).to.be.an('array');
          expect(products.length).to.equal(1);
          productV4DAOMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          productV4DAOMock.restore();
        });
    });

    it('should return pre-article record when passing valid contributorsEmail', (done) => {
      const identifierName = 'contributorsEmail';
      const identifierValues = ['praveenmooli@mailinator.com'];
      productV4DAOMock
        .expects('getPreArticlesByIdentifier')
        .once()
        .withArgs(
          identifierName,
          identifierValues,
          productType,
          apiResponseGroupConfig.getProjectionFields(productType, 'small')
        )
        .resolves([{ _id: 'some-id', type: 'scholarlyArticle' }]);
      productV4Service
        .getPreArticlesByIdentifier(
          identifierName,
          identifierValues,
          productType
        )
        .then((products) => {
          expect(products).to.be.an('array');
          expect(products.length).to.equal(1);
          productV4DAOMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          productV4DAOMock.restore();
        });
    });

    it('should return null when passing invalid identifier value and name', (done) => {
      identifierValues = ['invalid-value'];
      productV4DAOMock
        .expects('getPreArticlesByIdentifier')
        .once()
        .withArgs(
          identifierName,
          identifierValues,
          productType,
          apiResponseGroupConfig.getProjectionFields(productType, 'small')
        )
        .resolves([]);
      productV4Service
        .getPreArticlesByIdentifier(
          identifierName,
          identifierValues,
          productType
        )
        .then((products) => {
          expect(products).to.be.an('array');
          expect(products.length).to.equal(0);
          productV4DAOMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          productV4DAOMock.restore();
        });
    });
  });
  describe('getPreArticleById', () => {
    it('should return valid pre-article small response by passing valid UUID', (done) => {
      const id = 'some-id';
      const preArticle = {
        _createdDate: '2020-02-06T11:38:12.849+00:00',
        _id: 'some-id',
        _modifiedDate: '2020-02-06T11:38:12.849+00:00',
        identifiers: {
          submissionId: 'some-sub-id'
        },
        status: 'Available',
        title: 'some-title',
        type: 'scholarlyArticle',
        version: null
      };
      productV4DAOMock
        .expects('getProduct')
        .once()
        .withArgs(
          'preArticle',
          id,
          apiResponseGroupConfig.getProjectionFields('preArticle', 'small'),
          undefined,
          undefined,
          undefined
        )
        .returns(preArticle);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .never();
      productV4Service
        .getPreArticleById(id)
        .then((retrievedProduct) => {
          expect(retrievedProduct).to.be.an('object');
          testProperties(
            preArticle,
            apiResponseGroupConfig.getProjectionFields('preArticle', 'small')
          );
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
  });
  describe('getManuscriptWorkflowById', () => {
    it('should return valid manuscript-workflow small response by passing valid UUID', (done) => {
      const id = 'some-id';
      const manuscriptWorkflow = {
        _id: 'some-id',
        identifiers: {
          submissionId: 'some-sub-id'
        },
        version: null
      };
      manuscriptV4DAOMock
        .expects('getManuscript')
        .once()
        .withArgs(
          'manuscriptWorkflow',
          id,
          apiResponseGroupConfig.getProjectionFields(
            'manuscriptWorkflow',
            'small'
          ),
          undefined,
          undefined,
          undefined
        )
        .returns(manuscriptWorkflow);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .never();
      productV4Service
        .getManuscriptWorkflowById(id)
        .then((retrievedProduct) => {
          expect(retrievedProduct).to.be.an('object');
          testProperties(
            manuscriptWorkflow,
            apiResponseGroupConfig.getProjectionFields(
              'manuscriptWorkflow',
              'small'
            )
          );
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
  });
});
