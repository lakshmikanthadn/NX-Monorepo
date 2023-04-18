import { StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import { expect } from 'chai';
import * as sinon from 'sinon';

import { assetDaoV4 } from './AssetV4.DAO';
import { assetV4Service } from './AssetV4.Service';

describe('AssetV4Service', () => {
  it('should have all the required methods', () => {
    expect(assetV4Service).to.respondTo('getAssetById');
    expect(assetV4Service).to.respondTo('getAssetsByIdentifierNameValues');
    expect(assetV4Service).to.respondTo('createAsset');
    expect(assetV4Service).to.respondTo('updateAssetSources');
    expect(assetV4Service).to.respondTo('getProductByIdentifier');
  });
  let assetDaoMock;
  beforeEach(() => {
    assetDaoMock = sinon.mock(assetDaoV4);
  });
  describe('getAssetById', () => {
    it('should return asset record by passing valid assetId', (done) => {
      const id = 's9c43274c-92ee-4347-94a0-1c98e5f76986ome-id';
      assetDaoMock
        .expects('getAssetById')
        .once()
        .withArgs(id)
        .resolves({ _id: id, type: 'book' });
      assetV4Service
        .getAssetById(id)
        .then((asset) => {
          expect(asset).to.be.an('object');
          expect(asset._id).to.be.equal(id);
          assetDaoMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          assetDaoMock.restore();
        });
    });
    it('should return undefined passing invalid assetId if DAO', (done) => {
      const id = 's9c43274c-92ee-4347-94a0-1c98e5f76986ome-id';
      assetDaoMock
        .expects('getAssetById')
        .once()
        .withArgs(id)
        .resolves(undefined);
      assetV4Service
        .getAssetById(id)
        .then((asset) => {
          expect(asset).to.be.equal(undefined);
          assetDaoMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          assetDaoMock.restore();
        });
    });
    it('should return asset record by passing valid assetId', (done) => {
      const id = 'some-id';
      const asset = {
        _id: 'some-id'
      };
      assetDaoMock.expects('getAssetById').once().withArgs(id).resolves(asset);
      assetV4Service
        .getAssetById(id)
        .then((rertivedProduct) => {
          expect(rertivedProduct).to.an('object');
          expect(rertivedProduct._id).to.equal('some-id');
          assetDaoMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          assetDaoMock.restore();
        });
    });
    it('should return null when asset is null', (done) => {
      const id = null;
      assetDaoMock.expects('getAssetById').once().withArgs(id).resolves(null);
      assetV4Service
        .getAssetById(id)
        .then((rertivedProduct) => {
          expect(rertivedProduct).to.equal(null);
          assetDaoMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          assetDaoMock.restore();
        });
    });
    it('should return undefined when asset is undefined', (done) => {
      const id = undefined;
      assetDaoMock.expects('getAssetById').once().withArgs(id).resolves(null);
      assetV4Service
        .getAssetById(id)
        .then((rertivedProduct) => {
          expect(rertivedProduct).to.equal(null);
          assetDaoMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          assetDaoMock.restore();
        });
    });
    it('should return error when Product (asset) not found.', (done) => {
      const id = undefined;
      assetDaoMock
        .expects('getAssetById')
        .once()
        .withArgs(id)
        .rejects(new Error('Product (asset) not found.'));
      assetV4Service
        .getAssetById(id)
        .then(() => {
          done(new Error('Expecting error, but got success'));
        })
        .catch((err) => {
          expect(err.message).to.equal('Product (asset) not found.');
          assetDaoMock.verify();
          done();
        })
        .finally(() => {
          assetDaoMock.restore();
        });
    });
  });
  describe('getAssetsByIds', () => {
    it('should return asset record by passing valid assetId', (done) => {
      const ids = [
        's9c43274c-92ee-4347-94a0-1c98e5f76986ome-id',
        'another_uuid'
      ];
      const daoResp = [
        { _id: ids[0], type: 'book' },
        { _id: ids[1], type: 'book' }
      ];
      assetDaoMock
        .expects('getAssetsByIds')
        .once()
        .withArgs(ids)
        .resolves(daoResp);
      assetV4Service
        .getAssetsByIds(ids)
        .then((assets) => {
          expect(assets).to.be.eql(daoResp);
          expect(assets).to.be.an('array');
          assetDaoMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          assetDaoMock.restore();
        });
    });
    it('should throw error when DAO throws error.', (done) => {
      const ids = [
        's9c43274c-92ee-4347-94a0-1c98e5f76986ome-id',
        'another_uuid'
      ];
      assetDaoMock
        .expects('getAssetsByIds')
        .once()
        .withArgs(ids)
        .rejects(new Error('Product (asset) not found.'));
      assetV4Service
        .getAssetsByIds(ids)
        .then(() => {
          done(new Error('Expecting error, but got success'));
        })
        .catch((err) => {
          expect(err.message).to.equal('Product (asset) not found.');
          assetDaoMock.verify();
          done();
        })
        .finally(() => {
          assetDaoMock.restore();
        });
    });
  });
  describe('createAsset', () => {
    it('should return created asset', (done) => {
      const fakeAsset = {
        _id: 'abc',
        createdDate: 'abc',
        identifier: {
          doi: 'abc'
        },
        modifiedDate: 'abc',
        source: 'abc',
        type: 'creativeWork'
      } as any;
      assetDaoMock
        .expects('createAsset')
        .once()
        .withArgs(fakeAsset)
        .resolves(fakeAsset);
      assetV4Service
        .createAsset(fakeAsset)
        .then((asset) => {
          expect(asset).to.be.equal(fakeAsset);
          assetDaoMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          assetDaoMock.restore();
        });
    });
  });
  describe('getAssetsByIdentifierNameValues', () => {
    it('should return assets by passing valid identifierName and identifiervalues', (done) => {
      const keyname = 'doi';
      const keyvalues = ['12345-1', '12345-2'];
      const assets = [
        {
          _id: 'some-id-1',
          type: 'Chapter'
        },
        {
          _id: 'some-id-2',
          type: 'Chapter'
        }
      ];
      assetDaoMock
        .expects('getAssetsByIdentifierNameValues')
        .once()
        .withArgs(keyname, keyvalues)
        .resolves(assets);
      assetV4Service
        .getAssetsByIdentifierNameValues(keyname, keyvalues)
        .then((rertivedProduct) => {
          expect(rertivedProduct).to.an('array');
          expect(rertivedProduct.length).to.equal(2);
          assetDaoMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          assetDaoMock.restore();
        });
    });
    it('should return error when Product (asset) not found.', (done) => {
      const keyname = 'doi';
      const keyvalues = ['12345-1', '12345-2'];
      assetDaoMock
        .expects('getAssetsByIdentifierNameValues')
        .once()
        .withArgs(keyname, keyvalues)
        .rejects(new Error('Product (asset) not found.'));
      assetV4Service
        .getAssetsByIdentifierNameValues(keyname, keyvalues)
        .then(() => {
          done(new Error('Expecting error, but got success'));
        })
        .catch((err) => {
          expect(err.message).to.equal('Product (asset) not found.');
          assetDaoMock.verify();
          done();
        })
        .finally(() => {
          assetDaoMock.restore();
        });
    });
  });
  describe('updateAssetSources', () => {
    it('should return updated creative work', (done) => {
      const testAsset: StorageModel.Asset = {
        _id: 'abc',
        _sources: [
          { source: 'WEBCMS', type: 'product' },
          { source: 'WEBCMS', type: 'content' }
        ],
        createdDate: 'abc',
        identifier: {
          doi: 'abc'
        },
        modifiedDate: 'abc',
        type: 'creativeWork'
      } as StorageModel.Asset;
      assetDaoMock
        .expects('updateAssetSources')
        .once()
        .withArgs(testAsset._id)
        .resolves(testAsset);
      assetV4Service
        .updateAssetSources(testAsset._id)
        .then((retriveProduct) => {
          expect(retriveProduct).to.deep.equal(testAsset);
          assetDaoMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          assetDaoMock.restore();
        });
    });
  });
  describe('getProductByIdentifier', () => {
    const identifierName = 'collectionId';
    let identifierValue = 'SDG-1c98e5f76986ome-id';
    it('should return asset record by passing valid collectionId', (done) => {
      assetDaoMock
        .expects('getAssetByIdentifierNameValue')
        .once()
        .withArgs(identifierName, identifierValue, [])
        .resolves({ _id: 'some-id' });
      assetV4Service
        .getProductByIdentifier(identifierName, identifierValue)
        .then((asset) => {
          expect(asset).to.be.an('object');
          expect(asset._id).to.be.equal('some-id');
          assetDaoMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          assetDaoMock.restore();
        });
    });
    it('should return null when passing invalid collectionId in DAO', (done) => {
      identifierValue = 'invalid-id';
      assetDaoMock
        .expects('getAssetByIdentifierNameValue')
        .once()
        .withArgs(identifierName, identifierValue, [])
        .resolves(null);
      assetV4Service
        .getProductByIdentifier(identifierName, identifierValue)
        .then((asset) => {
          expect(asset).to.be.equal(null);
          assetDaoMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          assetDaoMock.restore();
        });
    });
  });
});
