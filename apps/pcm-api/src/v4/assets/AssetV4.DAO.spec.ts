import { MongooseSchema, StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as sinon from 'sinon';

import { assetsTestData } from '../test/data/AssetsV4';
import { assetDaoV4 } from './AssetV4.DAO';

const mongooseExec = {
  exec: async () => {
    throw new Error('mongoose Error');
  }
};
const mongooseLean = { lean: () => mongooseExec };

describe('AssetV4.DAO', () => {
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
  });
  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should have all the required methods', () => {
    expect(assetDaoV4).to.respondTo('getAssetById');
    expect(assetDaoV4).to.respondTo('createAsset');
    expect(assetDaoV4).to.respondTo('getAssetsByIdentifierNameValues');
    expect(assetDaoV4).to.respondTo('updateAssetSources');
    expect(assetDaoV4).to.respondTo('getAssetByIdentifierNameValue');
  });

  describe('createAsset', () => {
    const sampleAsset: StorageModel.Asset = {
      _id: 'asset_id_12234',
      _sources: [],
      identifier: {
        doi: '10.1224/asset_id_12234'
      },
      type: 'creativeWork'
    } as StorageModel.Asset;
    it('should return the created asset', (done) => {
      const testAsset = JSON.parse(JSON.stringify(sampleAsset));
      assetDaoV4
        .createAsset(testAsset)
        .then((createdAsset) => {
          expect(createdAsset._id).to.be.equal(testAsset._id);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should throw AppError when source key is not present', (done) => {
      const testAsset = JSON.parse(JSON.stringify(sampleAsset));
      delete testAsset.source;
      assetDaoV4
        .createAsset(testAsset)
        .then(() => {
          done(new Error('Expecting error, got success.'));
        })
        .catch((error) => {
          expect(error.code).to.equal(400);
          expect(error.message).to.equal('Error while creating asset');
          expect(error.name).to.equal('AppError');
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
  });
  describe('getAssetById', () => {
    it('should return asset when id is valid', (done) => {
      const id = '9c43274c-92ee-4347-94a0-1c98e5f76986';
      assetDaoV4
        .getAssetById(id)
        .then((asset) => {
          expect(asset).to.be.an('object');
          expect(asset).to.have.property('type');
          expect(asset).to.have.property('_id');
          expect(asset).to.have.property('identifier');
          expect(asset).to.have.property('_sources');
          expect(asset).to.have.property('_createdDate');
          expect(asset).to.have.property('_modifiedDate');
          expect(asset._id).to.be.equal('9c43274c-92ee-4347-94a0-1c98e5f76986');
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return null when id is invalid', (done) => {
      const id = '7857a313-5ada-4038-bf36-invalid';
      assetDaoV4
        .getAssetById(id)
        .then((asset) => {
          expect(asset).to.be.equal(null);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should throw error when model is broken or invalid', (done) => {
      const id = '7857a313-5ada-4038-bf36-invalid';
      const assetDaoV4Mock = sinon.mock(assetDaoV4.model);
      assetDaoV4Mock
        .expects('findOne')
        .once()
        .withArgs({ _id: id })
        .returns(mongooseLean);
      assetDaoV4
        .getAssetById(id)
        .then(() => {
          done(new Error('Expecting error, but got success'));
        })
        .catch((err) => {
          expect(err).to.equal('We are unable to find the asset.');
          assetDaoV4Mock.verify();
          done();
        })
        .finally(() => {
          assetDaoV4Mock.restore();
        });
    });
  });
  describe('getAssetsByIds', () => {
    it('should return assets when ids are valid', (done) => {
      const ids = [
        '9c43274c-92ee-4347-94a0-1c98e5f76986',
        '3325f513-7cea-48b0-a2a5-8cbfbd8ccd76'
      ];
      assetDaoV4
        .getAssetsByIds(ids)
        .then((assets) => {
          expect(assets).to.be.an('array');
          expect(assets.length).to.be.equal(2);
          assets.forEach((asset) => {
            expect(asset).to.be.an('object');
            expect(asset).to.have.property('type');
            expect(asset).to.have.property('_id');
            expect(asset).to.have.property('identifier');
            expect(asset).to.have.property('_sources');
            expect(asset).to.have.property('_createdDate');
            expect(asset).to.have.property('_modifiedDate');
          });
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return only properties that are passed in projection list', (done) => {
      const ids = [
        '9c43274c-92ee-4347-94a0-1c98e5f76986',
        '3325f513-7cea-48b0-a2a5-8cbfbd8ccd76'
      ];
      assetDaoV4
        .getAssetsByIds(ids, ['_id', 'type'])
        .then((assets) => {
          expect(assets).to.be.an('array');
          expect(assets.length).to.be.equal(2);
          assets.forEach((asset) => {
            expect(asset).to.be.an('object');
            expect(asset).to.have.property('type');
            expect(asset).to.have.property('_id');
            expect(asset).to.not.have.property('identifier');
            expect(asset).to.not.have.property('_sources');
            expect(asset).to.not.have.property('_createdDate');
            expect(asset).to.not.have.property('_modifiedDate');
          });
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return empty array when ids are invalid', (done) => {
      const ids = ['7857a313-5ada-4038-bf36-invalid'];
      assetDaoV4
        .getAssetsByIds(ids)
        .then((assets) => {
          expect(assets).to.be.an('array');
          expect(assets.length).to.equal(0);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should throw error when model is broken or invalid', (done) => {
      const ids = ['7857a313-5ada-4038-bf36-invalid'];
      const assetDaoV4Mock = sinon.mock(assetDaoV4.model);
      assetDaoV4Mock
        .expects('find')
        .once()
        .withArgs({ _id: { $in: ids } }, {})
        .returns(mongooseLean);
      assetDaoV4
        .getAssetsByIds(ids)
        .then(() => {
          done(new Error('Expecting error, but got success'));
        })
        .catch((err) => {
          expect(err).to.equal('We are unable to find the assets.');
          assetDaoV4Mock.verify();
          done();
        })
        .finally(() => {
          assetDaoV4Mock.restore();
        });
    });
  });
  describe('getAssetsByIdentifierNameValues', () => {
    it('should return asset when identifierName & identifierValues are valid', (done) => {
      const identifierName = 'isbn';
      const identifierValues = [
        '9781351022187',
        '9781138613508',
        '9780415476232'
      ];
      assetDaoV4
        .getAssetsByIdentifierNameValues(identifierName, identifierValues)
        .then((assets) => {
          expect(assets).to.be.an('array');
          expect(assets.length).to.equal(3);
          assets.forEach((asset) => {
            expect(asset).to.be.an('object');
            expect(asset).to.have.property('type');
            expect(asset).to.have.property('_id');
            expect(asset).to.have.property('identifier');
            expect(asset).to.have.property('_sources');
            expect(asset).to.have.property('_createdDate');
            expect(asset).to.have.property('_modifiedDate');
          });
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return asset when productType is also included', (done) => {
      const identifierName = 'isbn';
      const identifierValues = [
        '9781351022187',
        '9781138613508',
        '9780415476232'
      ];
      const productType = 'book';
      assetDaoV4
        .getAssetsByIdentifierNameValues(
          identifierName,
          identifierValues,
          productType
        )
        .then((assets) => {
          expect(assets).to.be.an('array');
          expect(assets.length).to.equal(3);
          assets.forEach((asset) => {
            expect(asset).to.be.an('object');
            expect(asset).to.have.property('type', 'book');
            expect(asset).to.have.property('_id');
            expect(asset).to.have.property('identifier');
            expect(asset).to.have.property('_sources');
            expect(asset).to.have.property('_createdDate');
            expect(asset).to.have.property('_modifiedDate');
          });
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return empty array when productType is invalid', (done) => {
      const identifierName = 'isbn';
      const identifierValues = [
        '9781351022187',
        '9781138613508',
        '9780415476232'
      ];
      const productType = 'invalid' as any;
      assetDaoV4
        .getAssetsByIdentifierNameValues(
          identifierName,
          identifierValues,
          productType
        )
        .then((assets) => {
          expect(assets).to.be.an('array');
          expect(assets.length).to.equal(0);
          expect(assets).to.deep.equal([]);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    // TODO: need to check when identifierValues = null instead of [null]
    it('should return data that has isbn as null when identifierValues is [null]', (done) => {
      const identifierName = 'isbn';
      const identifierValues = [null];
      assetDaoV4
        .getAssetsByIdentifierNameValues(identifierName, identifierValues)
        .then((assets) => {
          expect(assets).to.be.an('array');
          expect(assets.length).to.equal(6);
          assets.forEach((asset) => {
            expect(asset).to.be.an('object');
            expect(asset).to.have.property('type');
            expect(asset).to.have.property('_id');
            expect(asset).to.have.property('identifier');
            expect(asset).to.have.property('_sources');
            expect(asset).to.have.property('_createdDate');
            expect(asset).to.have.property('_modifiedDate');
          });
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    // TODO: need to check when identifierValues = undefined instead of [null]
    it('should return data that has isbn as null when identifierValues is undefined', (done) => {
      const identifierName = 'isbn';
      const identifierValues = undefined;
      assetDaoV4
        .getAssetsByIdentifierNameValues(identifierName, identifierValues)
        .then((assets) => {
          expect(assets).to.be.an('array');
          expect(assets.length).to.equal(6);
          assets.forEach((asset) => {
            expect(asset).to.be.an('object');
            expect(asset).to.have.property('type');
            expect(asset).to.have.property('_id');
            expect(asset).to.have.property('identifier');
            expect(asset).to.have.property('_sources');
            expect(asset).to.have.property('_createdDate');
            expect(asset).to.have.property('_modifiedDate');
          });
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return empty array when identifierValues is invalid', (done) => {
      const identifierName = 'isbn';
      const identifierValues = 'invalid' as any;
      assetDaoV4
        .getAssetsByIdentifierNameValues(identifierName, identifierValues)
        .then((assets) => {
          expect(assets).to.be.an('array');
          expect(assets.length).to.equal(0);
          expect(assets).to.deep.equal([]);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return empty array when identifierName is invalid', (done) => {
      const identifierName = 'invalid-isbn';
      const identifierValues = [
        '9781351022187',
        '9781138613508',
        '9780415476232'
      ];
      assetDaoV4
        .getAssetsByIdentifierNameValues(identifierName, identifierValues)
        .then((assets) => {
          expect(assets).to.be.an('array');
          expect(assets.length).to.equal(0);
          expect(assets).to.deep.equal([]);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return empty array when identifierName is null', (done) => {
      const identifierName = null;
      const identifierValues = [
        '9781351022187',
        '9781138613508',
        '9780415476232'
      ];
      assetDaoV4
        .getAssetsByIdentifierNameValues(identifierName, identifierValues)
        .then((assets) => {
          expect(assets).to.be.an('array');
          expect(assets.length).to.equal(0);
          expect(assets).to.deep.equal([]);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return empty array when identifierName is undefined', (done) => {
      const identifierName = undefined;
      const identifierValues = [
        '9781351022187',
        '9781138613508',
        '9780415476232'
      ];
      assetDaoV4
        .getAssetsByIdentifierNameValues(identifierName, identifierValues)
        .then((assets) => {
          expect(assets).to.be.an('array');
          expect(assets.length).to.equal(0);
          expect(assets).to.deep.equal([]);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should throw error when model is broken or invalid', (done) => {
      const identifierName = 'isbn';
      const identifierValues = ['9781351022187-invalid'];
      const query = {};
      query[`identifier.${identifierName}`] = { $in: identifierValues };
      const assetDaoV4Mock = sinon.mock(assetDaoV4.model);
      assetDaoV4Mock
        .expects('find')
        .once()
        .withArgs(query, {})
        .returns(mongooseLean);
      assetDaoV4
        .getAssetsByIdentifierNameValues(identifierName, identifierValues)
        .then(() => {
          done(new Error('Expecting error, but got success'));
        })
        .catch((err) => {
          expect(err).to.equal('We are unable to find the assets.');
          assetDaoV4Mock.verify();
          done();
        })
        .finally(() => {
          assetDaoV4Mock.restore();
        });
    });
  });
  describe('updateAssetSources', () => {
    it('should update _sources field of created Product creative work', (done) => {
      assetDaoV4
        .updateAssetSources('b3cc5a0a-5719-4407-acb2-953c551d3377')
        .then((updatedAsset) => {
          expect(updatedAsset._sources).to.have.length(2);
          expect(updatedAsset._sources[1])
            .to.have.property('type')
            .equal('content');
          expect(updatedAsset._sources[1])
            .to.have.property('source')
            .equal('WEBCMS');
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return null when id is invalid', (done) => {
      const id = '7857a313-5ada-4038-bf36-invalid';
      assetDaoV4
        .updateAssetSources(id)
        .then((asset) => {
          expect(asset).to.be.equal(null);
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
      const assetDaoV4Mock = sinon.mock(assetDaoV4.model);
      assetDaoV4Mock
        .expects('findOneAndUpdate')
        .once()
        .withArgs(condition, updateQuery, { new: true })
        .returns(mongooseLean);
      assetDaoV4
        .updateAssetSources(id)
        .then(() => {
          done(new Error('Expecting error, but got success'));
        })
        .catch((err) => {
          expect(err).to.equal('Error while updating asset');
          assetDaoV4Mock.verify();
          done();
        })
        .finally(() => {
          assetDaoV4Mock.restore();
        });
    });
  });
  describe('getAssetsByIdentifierNameValue', () => {
    const identifierName = 'collectionId';
    let identifierValue = 'SDG-1234id';
    it('should return asset when collectinId is valid', (done) => {
      assetDaoV4
        .getAssetByIdentifierNameValue(identifierName, identifierValue, ['_id'])
        .then((asset) => {
          expect(asset).to.be.an('object');
          expect(asset).to.have.property('_id');
          expect(asset._id).to.be.equal('9c43274c-92ee-4347-94a0-1c98e5f76986');
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return null when collectionId is invalid', (done) => {
      identifierValue = 'invalid-id';
      assetDaoV4
        .getAssetByIdentifierNameValue(identifierName, identifierValue, ['_id'])
        .then((asset) => {
          expect(asset).to.be.equal(null);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
  });
});
