import { MongooseSchema, StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as sinon from 'sinon';

import { creativeWorkTestData } from '../test/data/creativeWorkV4';
import { creativeWorkV4Dao } from './CreativeWorkV4.DAO';

const mongooseExec = {
  exec: async () => {
    throw new Error('mongoose Error');
  }
};
const mongooseLean = { lean: () => mongooseExec };

describe('CreativeWorkV4.DAO', () => {
  let mongoServer;
  before(async () => {
    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getConnectionString();
    // tslint:disable-next-line: max-line-length
    await mongoose
      .connect(mongoUri, {
        useFindAndModify: false,
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
      .then(() => {
        console.log('Connection to MongoDB is success.');
      })
      .catch((err) => {
        console.log('Connection to MongoDB is failed.', err);
      });
    const TestCreativeWork = mongoose.model(
      'TestCreativeWorkV4',
      MongooseSchema.CreativeWork,
      'creativework-4.0.1'
    );
    await TestCreativeWork.create(creativeWorkTestData[1]);
  });
  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  const testCreativeWork = JSON.parse(JSON.stringify(creativeWorkTestData[0]));
  testCreativeWork._id = 'uuid_12345';
  testCreativeWork._sources = [{ source: 'WEBCMS', type: 'product' }];
  (testCreativeWork.creativeWork.format = 'video'),
    (testCreativeWork.creativeWork.mediaType = 'video/mp4');
  testCreativeWork.identifiers = {
    doi: '10.1204/990130652012'
  };
  testCreativeWork.title = 'Sample creative work';
  testCreativeWork.type = 'creativeWork';

  it('should contain all functions', () => {
    expect(creativeWorkV4Dao).to.respondTo('createCreativeWork');
    expect(creativeWorkV4Dao).to.respondTo('getCreativeWorkByIds');
    expect(creativeWorkV4Dao).to.respondTo('updateCreativeWorkSources');
  });
  describe('createCreativeWork', () => {
    it('should return the created Product creative work', (done) => {
      creativeWorkV4Dao
        .createCreativeWork(testCreativeWork)
        .then((createdProduct) => {
          expect(createdProduct._id).to.be.equal(testCreativeWork._id);
          expect(createdProduct)
            .to.have.property('type')
            .equal(testCreativeWork.type);
          expect(createdProduct)
            .to.have.property('title')
            .equal(testCreativeWork.title);
          expect(createdProduct).to.have.property('identifiers');
          expect(createdProduct.identifiers)
            .to.have.property('doi')
            .equal(testCreativeWork.identifiers.doi);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return the created Product creative work full', (done) => {
      const testCreativeWorkData = creativeWorkTestData[0];
      creativeWorkV4Dao
        .createCreativeWork(testCreativeWorkData)
        .then((createdProduct) => {
          expect(createdProduct._id).to.be.equal(testCreativeWorkData._id);
          expect(createdProduct)
            .to.have.property('type')
            .equal(testCreativeWorkData.type);
          expect(createdProduct)
            .to.have.property('version')
            .equal(testCreativeWorkData.version);
          expect(createdProduct)
            .to.have.property('title')
            .equal(testCreativeWorkData.title);
          expect(createdProduct).to.have.property('categories');
          expect(createdProduct).to.have.property('classifications');
          expect(createdProduct).to.have.property('keywords');
          expect(createdProduct).to.have.property('contributors');
          expect(createdProduct).to.have.property('isPartOf');
          expect(createdProduct).to.have.property('prices');
          expect(createdProduct).to.have.property('permissions');
          expect(createdProduct).to.have.property('rights');
          expect(createdProduct).to.have.property('audience');
          expect(createdProduct).to.have.property('discountGroups');
          expect(createdProduct).to.have.property('creativeWork');
          expect(createdProduct).to.have.property('identifiers');
          expect(createdProduct).to.have.property('availability');
          delete createdProduct._createdDate;
          delete createdProduct._modifiedDate;
          expect(createdProduct).to.deep.equal(testCreativeWorkData);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should throw AppError when creativeWork key is not present', (done) => {
      const fakeCreativeWork = {
        _id: 'creativeWork_missing_doc',
        identifiers: {
          doi: '10.1204/990130652012'
        },
        title: 'Sample creative work',
        type: 'creativeWork'
      } as StorageModel.Product;
      creativeWorkV4Dao
        .createCreativeWork(fakeCreativeWork)
        .then(() => {
          done(new Error('Expecting error, got success.'));
        })
        .catch((error) => {
          expect(error.code).to.equal(400);
          expect(error.message).to.equal('Error while creating creativeWork');
          expect(error.name).to.equal('AppError');
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should throw AppError when title is not present', (done) => {
      const fakeCreativeWork = {
        _id: 'title_missing_doc',
        _sources: [{ source: 'WEBCMS', type: 'product' }],
        identifiers: {
          doi: '10.1204/990130652012'
        },
        type: 'creativeWork'
      } as StorageModel.Product;
      creativeWorkV4Dao
        .createCreativeWork(fakeCreativeWork)
        .then(() => {
          done(new Error('Expecting error, got success.'));
        })
        .catch((error) => {
          expect(error.code).to.equal(400);
          expect(error.message).to.equal('Error while creating creativeWork');
          expect(error.name).to.equal('AppError');
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should throw AppError when identifiers is not present', (done) => {
      const fakeCreativeWork = {
        _id: 'identifier_missing_doc',
        _sources: [{ source: 'WEBCMS', type: 'product' }],
        title: 'Sample creative work',
        type: 'creativeWork'
      } as StorageModel.Product;
      creativeWorkV4Dao
        .createCreativeWork(fakeCreativeWork)
        .then(() => {
          done(new Error('Expecting error, got success.'));
        })
        .catch((error) => {
          expect(error.code).to.equal(400);
          expect(error.message).to.equal('Error while creating creativeWork');
          expect(error.name).to.equal('AppError');
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
  });
  describe('getCreativeWorkByIds', () => {
    it('should return list of matching creativeWorks', (done) => {
      creativeWorkV4Dao
        .getCreativeWorkByIds(['id5678'], ['creativeWork.format'])
        .then((retriveProduct) => {
          expect(retriveProduct).to.be.an('array');
          expect(retriveProduct.length).to.equal(1);
          expect(retriveProduct[0]).to.be.an('object');
          expect(retriveProduct[0]).to.have.property('_id', 'id5678');
          expect(retriveProduct[0]).to.have.property('creativeWork');
          expect(retriveProduct[0].creativeWork).to.be.an('object');
          expect(retriveProduct[0].creativeWork).to.have.property(
            'format',
            'presentation'
          );
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return empty array when ids are invalid', (done) => {
      creativeWorkV4Dao
        .getCreativeWorkByIds(['invalid'])
        .then((retriveProduct) => {
          expect(retriveProduct).to.be.an('array');
          expect(retriveProduct.length).to.equal(0);
          expect(retriveProduct).to.deep.equal([]);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should throw error when model is broken or invalid', (done) => {
      const productIds = ['7857a313-5ada-4038-bf36-invalid'];
      const creativeWorkV4DaoMock = sinon.mock(creativeWorkV4Dao.model);
      creativeWorkV4DaoMock
        .expects('find')
        .once()
        .withArgs({ _id: { $in: productIds } }, { 'creativeWork.format': 1 })
        .returns(mongooseLean);
      creativeWorkV4Dao
        .getCreativeWorkByIds(productIds, ['creativeWork.format'])
        .then(() => {
          done(new Error('Expecting error, but got success'));
        })
        .catch((err) => {
          expect(err).to.equal('We are unable to find the product.');
          creativeWorkV4DaoMock.verify();
          done();
        })
        .finally(() => {
          creativeWorkV4DaoMock.restore();
        });
    });
  });
  describe('updateCreativeWorkSources', () => {
    it('should update _sources field of created Product creative work', (done) => {
      creativeWorkV4Dao
        .updateCreativeWorkSources('id5678')
        .then((updatedProduct) => {
          expect(updatedProduct).to.have.property('_sources');
          expect(updatedProduct._sources).to.have.length(2);
          expect(updatedProduct._sources[1])
            .to.have.property('type')
            .equal('content');
          expect(updatedProduct._sources[1])
            .to.have.property('source')
            .equal('WEBCMS');
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should throw error when model is broken or invalid', (done) => {
      const id = '7857a313-5ada-4038-bf36-invalid';
      const condition = { _id: id, '_sources.type': { $ne: 'content' } };
      const updateQuery = {
        $push: { _sources: { source: 'WEBCMS', type: 'content' } }
      };
      const creativeWorkV4DaoMock = sinon.mock(creativeWorkV4Dao.model);
      creativeWorkV4DaoMock
        .expects('findOneAndUpdate')
        .once()
        .withArgs(condition, updateQuery, { new: true })
        .returns(mongooseLean);
      creativeWorkV4Dao
        .updateCreativeWorkSources(id)
        .then(() => {
          done(new Error('Expecting error, but got success'));
        })
        .catch((err) => {
          expect(err).to.equal('Error while updating creativeWork');
          creativeWorkV4DaoMock.verify();
          done();
        })
        .finally(() => {
          creativeWorkV4DaoMock.restore();
        });
    });
  });
});
