import { MongooseSchema, StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as sinon from 'sinon';

import { associatedMediaTestData } from '../test/data/AssociatedMediaV4';
import { associatedMediaV4Dao } from './AssociatedMediaV4.DAO';

const mongooseExec = {
  exec: async () => {
    throw new Error('mongoose Error');
  }
};
const mongooseLean = { lean: () => mongooseExec };

describe('AssociatedMediaV4.DAO', () => {
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
    const TestAssociatedMedia = mongoose.model(
      'TestAssociatedMediaV4',
      MongooseSchema.AssociatedMedia,
      'associatedmedia-4.0.1'
    );
    await TestAssociatedMedia.insertMany(associatedMediaTestData);
  });
  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  it('should have all the methods', () => {
    expect(associatedMediaV4Dao).to.respondTo('getAssociatedMediaByParentId');
    expect(associatedMediaV4Dao).to.respondTo('getAsstMediasByParentIds');
    expect(associatedMediaV4Dao).to.respondTo('getByParentIdAndLocation');
    expect(associatedMediaV4Dao).to.respondTo('createAssociatedMedia');
  });

  describe('getAssociatedMediaByParentId', () => {
    it('should return associatedMedia array with all properties when parent-id is valid', (done) => {
      const parentId = '6798f38a-bd4b-4b68-a5ab-c79f39513932';
      associatedMediaV4Dao
        .getAssociatedMediaByParentId(parentId)
        .then((associatedMedias) => {
          expect(associatedMedias).to.be.an('array');
          associatedMedias.forEach((associatedMedia) => {
            expect(associatedMedia).to.be.a('object');
            expect(Object.keys(associatedMedia).length).to.equal(9);
            expect(associatedMedia).to.have.property('_id');
            expect(associatedMedia).to.have.property('size');
            expect(associatedMedia).to.have.property('location');
            expect(associatedMedia).to.have.property('type');
            expect(associatedMedia).to.have.property('parentId');
            expect(associatedMedia).to.have.property('parentType');
            expect(associatedMedia).to.have.property('versionType');
            expect(associatedMedia).to.have.property('_createdDate');
            expect(associatedMedia).to.have.property('_modifiedDate');
            expect(associatedMedia.location).to.match(/^https/);
            expect(associatedMedia.type).to.be.a('string');
          });
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it(`should return filtered associatedMedia array with all properties when parent-id is valid`, (done) => {
      const parentId = '6798f38a-bd4b-4b68-a5ab-c79f39513932';
      const versionType = 'FINAL';
      associatedMediaV4Dao
        .getAssociatedMediaByParentId(parentId, [], versionType)
        .then((associatedMedias) => {
          expect(associatedMedias).to.be.an('array');
          expect(associatedMedias.length).to.equal(1);
          associatedMedias.forEach((associatedMedia) => {
            expect(associatedMedia).to.be.a('object');
            expect(Object.keys(associatedMedia).length).to.equal(9);
            expect(associatedMedia).to.have.property('_id');
            expect(associatedMedia).to.have.property('size');
            expect(associatedMedia).to.have.property('location');
            expect(associatedMedia).to.have.property('type');
            expect(associatedMedia).to.have.property('parentId');
            expect(associatedMedia).to.have.property('parentType');
            expect(associatedMedia).to.have.property('versionType', 'FINAL');
            expect(associatedMedia).to.have.property('_createdDate');
            expect(associatedMedia).to.have.property('_modifiedDate');
            expect(associatedMedia.location).to.match(/^https/);
            expect(associatedMedia.type).to.be.a('string');
          });
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return associatedMedia with only expected projection', (done) => {
      const parentId = '6798f38a-bd4b-4b68-a5ab-c79f39513932';
      const projectionData = ['location', 'type', '_id', 'size'];
      associatedMediaV4Dao
        .getAssociatedMediaByParentId(parentId, projectionData)
        .then((associatedMedias) => {
          expect(associatedMedias).to.be.an('array');
          associatedMedias.forEach((associatedMedia) => {
            expect(associatedMedia).to.be.a('object');
            expect(Object.keys(associatedMedia).length).to.equal(4);
            expect(associatedMedia).to.have.property('_id');
            expect(associatedMedia).to.have.property('size');
            expect(associatedMedia).to.have.property('location');
            expect(associatedMedia).to.have.property('type');
            expect(associatedMedia.location).to.match(/^https/);
            expect(associatedMedia.type).to.be.a('string');
          });
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return empty array when parent id is invalid', (done) => {
      const parentId = 'some-id';
      const projectionData = ['location', 'type'];
      associatedMediaV4Dao
        .getAssociatedMediaByParentId(parentId, projectionData)
        .then((retriveProduct) => {
          expect(retriveProduct).to.deep.equal([]);
          expect(retriveProduct.length).to.equal(0);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should throw error when model is broken or invalid', (done) => {
      const parentId = '6798f38a-bd4b-4b68-a5ab-c79f39513932';
      const projectionData = ['location', 'type', '_id'];
      const projections = { _id: 1, location: 1, type: 1 };
      const associatedMediaV4ModelMock = sinon.mock(associatedMediaV4Dao.model);
      associatedMediaV4ModelMock
        .expects('find')
        .once()
        .withArgs({ parentId }, projections)
        .returns(mongooseLean);
      associatedMediaV4Dao
        .getAssociatedMediaByParentId(parentId, projectionData)
        .then(() => {
          done(new Error('Expecting error, but got success'));
        })
        .catch((err) => {
          expect(err).to.equal('We are unable to find the AssociatedMedia.');
          associatedMediaV4ModelMock.verify();
          associatedMediaV4ModelMock.restore();
          done();
        });
    });
    it('should throw error when model is broken or invalid', (done) => {
      const parentId = '6798f38a-bd4b-4b68-a5ab-c79f39513932';
      const projectionData = ['location', 'type', '_id'];
      const currentVersion = 'FINAL';
      const projections = { _id: 1, location: 1, type: 1 };
      const associatedMediaV4ModelMock = sinon.mock(associatedMediaV4Dao.model);
      associatedMediaV4ModelMock
        .expects('find')
        .once()
        .withArgs({ parentId, versionType: currentVersion }, projections)
        .returns(mongooseLean);
      associatedMediaV4Dao
        .getAssociatedMediaByParentId(parentId, projectionData, currentVersion)
        .then(() => {
          done(new Error('Expecting error, but got success'));
        })
        .catch((err) => {
          expect(err).to.equal('We are unable to find the AssociatedMedia.');
          associatedMediaV4ModelMock.verify();
          associatedMediaV4ModelMock.restore();
          done();
        });
    });
  });
  describe('getAsstMediasByParentIds', () => {
    it('should return associatedMedia array with all properties when parent-ids are valid', (done) => {
      const parentIds = ['6798f38a-bd4b-4b68-a5ab-c79f39513932'];
      associatedMediaV4Dao
        .getAsstMediasByParentIds(parentIds)
        .then((associatedMedias) => {
          expect(associatedMedias).to.be.an('array');
          associatedMedias.forEach((associatedMedia) => {
            expect(associatedMedia).to.be.a('object');
            expect(Object.keys(associatedMedia).length).to.equal(9);
            expect(associatedMedia).to.have.property('_id');
            expect(associatedMedia).to.have.property('size');
            expect(associatedMedia).to.have.property('location');
            expect(associatedMedia).to.have.property('type');
            expect(associatedMedia).to.have.property('parentId');
            expect(associatedMedia).to.have.property('parentType');
            expect(associatedMedia).to.have.property('versionType');
            expect(associatedMedia).to.have.property('_createdDate');
            expect(associatedMedia).to.have.property('_modifiedDate');
            expect(associatedMedia.location).to.match(/^https/);
            expect(associatedMedia.type).to.be.a('string');
          });
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return associatedMedias with only expected projection', (done) => {
      const parentIds = ['6798f38a-bd4b-4b68-a5ab-c79f39513932'];
      const projectionData = ['location', 'type', '_id', 'size', 'parentId'];
      associatedMediaV4Dao
        .getAsstMediasByParentIds(parentIds, projectionData)
        .then((associatedMedias) => {
          expect(associatedMedias).to.be.an('array');
          associatedMedias.forEach((associatedMedia) => {
            expect(associatedMedia).to.be.a('object');
            expect(Object.keys(associatedMedia).length).to.equal(5);
            expect(associatedMedia).to.have.property('_id');
            expect(associatedMedia).to.have.property('size');
            expect(associatedMedia).to.have.property('location');
            expect(associatedMedia).to.have.property('type');
            expect(associatedMedia).to.have.property('parentId');
            expect(associatedMedia.location).to.match(/^https/);
            expect(associatedMedia.type).to.be.a('string');
          });
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return empty array when parent id is invalid', (done) => {
      const parentIds = ['some-id'];
      const projectionData = ['location', 'type'];
      associatedMediaV4Dao
        .getAsstMediasByParentIds(parentIds, projectionData)
        .then((retriveProduct) => {
          expect(retriveProduct).to.deep.equal([]);
          expect(retriveProduct.length).to.equal(0);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should throw error when model is broken or invalid', (done) => {
      const parentIds = ['6798f38a-bd4b-4b68-a5ab-c79f39513932'];
      const projectionData = ['location', 'type', '_id'];
      const projections = { _id: 1, location: 1, type: 1 };
      const associatedMediaV4ModelMock = sinon.mock(associatedMediaV4Dao.model);
      associatedMediaV4ModelMock
        .expects('find')
        .once()
        .withArgs({ parentId: { $in: parentIds } }, projections)
        .returns(mongooseLean);
      associatedMediaV4Dao
        .getAsstMediasByParentIds(parentIds, projectionData)
        .then(() => {
          done(new Error('Expecting error, but got success'));
        })
        .catch((err) => {
          expect(err).to.equal('We are unable to find the AssociatedMedia.');
          associatedMediaV4ModelMock.verify();
          associatedMediaV4ModelMock.restore();
          done();
        });
    });
  });
  describe('getByParentIdAndLocation', () => {
    it('should return associatedMedia with all properties when parentId and location is valid', (done) => {
      const parentId = '47b1dbf8-30ea-4d13-8d12-00d883d82754';
      const location =
        'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/creativework/47b1dbf8-30ea-4d13-8d12-00d883d82754/content.pdf';
      associatedMediaV4Dao
        .getByParentIdAndLocation(parentId, location)
        .then((associatedMedia) => {
          expect(associatedMedia).to.be.a('object');
          expect(Object.keys(associatedMedia).length).to.equal(9);
          expect(associatedMedia).to.have.property('_id');
          expect(associatedMedia).to.have.property('size');
          expect(associatedMedia).to.have.property('location');
          expect(associatedMedia).to.have.property('type');
          expect(associatedMedia).to.have.property('parentId');
          expect(associatedMedia).to.have.property('parentType');
          expect(associatedMedia).to.have.property('versionType');
          expect(associatedMedia).to.have.property('_createdDate');
          expect(associatedMedia).to.have.property('_modifiedDate');
          expect(associatedMedia).to.have.property('versionType');
          expect(associatedMedia.location).to.match(/^https/);
          expect(associatedMedia.type).to.be.a('string');
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return associatedMedia with only expected projection', (done) => {
      const parentId = '47b1dbf8-30ea-4d13-8d12-00d883d82754';
      const location =
        'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/creativework/47b1dbf8-30ea-4d13-8d12-00d883d82754/content.pdf';
      const projectionData = ['_id'];
      associatedMediaV4Dao
        .getByParentIdAndLocation(parentId, location, projectionData)
        .then((associatedMedia) => {
          expect(associatedMedia).to.be.a('object');
          expect(Object.keys(associatedMedia).length).to.equal(1);
          expect(associatedMedia).to.have.property('_id');
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return null when parent id is invalid', (done) => {
      const parentId = 'some-id';
      const location =
        'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/creativework/47b1dbf8-30ea-4d13-8d12-00d883d82754/content.pdf';
      const projectionData = ['location', 'type'];
      associatedMediaV4Dao
        .getByParentIdAndLocation(parentId, location, projectionData)
        .then((retriveProduct) => {
          expect(retriveProduct).to.deep.equal(null);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return null when location is invalid', (done) => {
      const parentId = '47b1dbf8-30ea-4d13-8d12-00d883d82754';
      const location = 'invalid-location';
      const projectionData = ['location', 'type'];
      associatedMediaV4Dao
        .getByParentIdAndLocation(parentId, location, projectionData)
        .then((retriveProduct) => {
          expect(retriveProduct).to.deep.equal(null);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should throw error when model is broken or invalid', (done) => {
      const parentId = '47b1dbf8-30ea-4d13-8d12-00d883d82754';
      const location =
        'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/creativework/47b1dbf8-30ea-4d13-8d12-00d883d82754/content.pdf';
      const projectionData = ['location', 'type', '_id'];
      const projections = { _id: 1, location: 1, type: 1 };
      const associatedMediaV4ModelMock = sinon.mock(associatedMediaV4Dao.model);
      associatedMediaV4ModelMock
        .expects('findOne')
        .once()
        .withArgs({ location, parentId }, projections)
        .returns(mongooseLean);
      associatedMediaV4Dao
        .getByParentIdAndLocation(parentId, location, projectionData)
        .then(() => {
          done(new Error('Expecting error, but got success'));
        })
        .catch((err) => {
          expect(err).to.equal('We are unable to find the AssociatedMedia.');
          associatedMediaV4ModelMock.verify();
          associatedMediaV4ModelMock.restore();
          done();
        });
    });
  });
  describe('isContentExists', () => {
    let partsAdded;
    let ids;
    let projection;
    let allIds;
    let pdfData;
    let xmlData;
    beforeEach(() => {
      partsAdded = [
        {
          _id: '1',
          type: 'book'
        },
        {
          _id: '2',
          type: 'chapter'
        },
        {
          _id: '3',
          type: 'creativeWork'
        }
      ];
      ids = ['1', '2'];
      allIds = ['3', '1', '2'];
      pdfData = [
        {
          _id: 'some',
          parentId: '1'
        },
        {
          _id: 'some',
          parentId: '2'
        }
      ];
      xmlData = [
        {
          _id: 'some',
          parentId: '1'
        },
        {
          _id: 'some',
          parentId: '2'
        }
      ];

      projection = ['parentId'];
    });
    it('should return valid parentId when pdf and dbitsxml exists', (done) => {
      const associatedMediaV4DaoMock = sinon.mock(associatedMediaV4Dao);
      associatedMediaV4DaoMock
        .expects('isPdfExists')
        .once()
        .withArgs(ids, projection)
        .resolves(pdfData);
      associatedMediaV4DaoMock
        .expects('isXmlExists')
        .once()
        .withArgs(ids, projection)
        .resolves(xmlData);
      associatedMediaV4Dao
        .isContentExists(partsAdded, projection)
        .then((id) => {
          expect(id).to.deep.equal(allIds);
          associatedMediaV4DaoMock.verify();
          done();
        })
        .catch((err) => {
          console.log('error: ', err);
          done(err);
        })
        .finally(() => {
          associatedMediaV4DaoMock.restore();
        });
    });
  });
  describe('isPdfExists', () => {
    it('should return id and parentid of products that has type pdf', (done) => {
      const ids = ['47b1dbf8-30ea-4d13-8d12-00d883d82755'];
      const projectionData = ['parentId'];
      associatedMediaV4Dao
        .isPdfExists(ids, projectionData)
        .then((associatedMedia) => {
          expect(associatedMedia).to.be.a('array');
          expect(associatedMedia).to.deep.equal([
            {
              _id: associatedMediaTestData[8]['_id'],
              parentId: associatedMediaTestData[8]['parentId']
            }
          ]);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return error when invalid parentid is passed', (done) => {
      const ids = ['5355eddd-e849-4cc3-89dc-e43ab19f79f-invalid'];
      const projectionData = ['parentId'];
      const query = {
        parentId: { $in: ids },
        type: { $in: ['webpdf', 'chapterpdf'] }
      };
      const projection = {};
      projectionData.forEach((property) => {
        projection[property] = 1;
      });
      const associatedMediaV4DAOMock = sinon.mock(associatedMediaV4Dao.model);
      associatedMediaV4DAOMock
        .expects('find')
        .once()
        .withArgs(query, projection)
        .returns(mongooseLean);
      associatedMediaV4Dao
        .isPdfExists(ids, projectionData)
        .then((retriveProduct) => {
          done(new Error('Expecting error, but got success'));
        })
        .catch((err) => {
          console.log(err);
          expect(err).to.equal(
            'We are unable to find pdf for this AssociatedMedia.'
          );
          associatedMediaV4DAOMock.verify();
          done();
        })
        .finally(() => {
          associatedMediaV4DAOMock.restore();
        });
    });
  });
  describe('isXmlExists', () => {
    it('should return id and parentid of products that has type dbitsxml', (done) => {
      const ids = ['47b1dbf8-30ea-4d13-8d12-00d883d82755'];
      const projectionData = ['parentId'];
      associatedMediaV4Dao
        .isXmlExists(ids, projectionData)
        .then((associatedMedia) => {
          expect(associatedMedia).to.be.a('array');
          expect(associatedMedia).to.deep.equal([
            {
              _id: associatedMediaTestData[9]['_id'],
              parentId: associatedMediaTestData[9]['parentId']
            }
          ]);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return error when invalid parentid is passed', (done) => {
      const ids = ['5355eddd-e849-4cc3-89dc-e43ab19f79f-invalid'];
      const projectionData = ['parentId'];
      const query = {
        parentId: { $in: ids },
        type: { $eq: 'dbitsxml' }
      };
      const projection = {};
      projectionData.forEach((property) => {
        projection[property] = 1;
      });
      const associatedMediaV4DAOMock = sinon.mock(associatedMediaV4Dao.model);
      associatedMediaV4DAOMock
        .expects('find')
        .once()
        .withArgs(query, projection)
        .returns(mongooseLean);
      associatedMediaV4Dao
        .isXmlExists(ids, projectionData)
        .then((retriveProduct) => {
          done(new Error('Expecting error, but got success'));
        })
        .catch((err) => {
          console.log(err);
          expect(err).to.equal(
            'We are unable to find dbitsxml for the AssociatedMedia.'
          );
          associatedMediaV4DAOMock.verify();
          done();
        })
        .finally(() => {
          associatedMediaV4DAOMock.restore();
        });
    });
  });
  describe('createAssociatedMedia', () => {
    it('should return same content when a valid content is created', (done) => {
      const content: StorageModel.AssociatedMedia = {
        _id: '1234-1234-1234-1234',
        location:
          'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/creativework/47b1dbf8-30ea-4d13-8d12-00d883d82754/content.pdf',
        parentId: '6c9f9801-3519-425d-be31-8829cae4bac2',
        parentType: 'creativeWork',
        size: 1234,
        type: 'portableDocument'
      } as StorageModel.AssociatedMedia;
      associatedMediaV4Dao
        .createAssociatedMedia(content)
        .then((associatedMedia) => {
          expect(associatedMedia).to.be.a('object');
          expect(associatedMedia).to.have.property('_id');
          expect(associatedMedia).to.have.property('size');
          expect(associatedMedia).to.have.property('location');
          expect(associatedMedia).to.have.property('type');
          expect(associatedMedia).to.have.property('parentId');
          expect(associatedMedia).to.have.property('parentType');
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should throw error when model is broken or invalid', (done) => {
      const content: StorageModel.AssociatedMedia = {
        _id: '1234-1234-1234-1234',
        location:
          'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/creativework/47b1dbf8-30ea-4d13-8d12-00d883d82754/content.pdf',
        parentId: '6c9f9801-3519-425d-be31-8829cae4bac2',
        parentType: 'creativeWork',
        size: 1234,
        type: 'portableDocument'
      } as StorageModel.AssociatedMedia;
      const associatedMediaV4ModelMock = sinon.mock(associatedMediaV4Dao.model);
      associatedMediaV4ModelMock
        .expects('create')
        .once()
        .withArgs(content)
        .rejects();
      associatedMediaV4Dao
        .createAssociatedMedia(content)
        .then(() => {
          done(new Error('Expecting error, but got success'));
        })
        .catch((err) => {
          expect(err.message).to.equal('Error while creating content');
          expect(err.name).to.equal('AppError');
          expect(err.code).to.equal(400);
          associatedMediaV4ModelMock.verify();
          associatedMediaV4ModelMock.restore();
          done();
        });
    });
  });
});
