import { StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import { expect } from 'chai';
import * as sinon from 'sinon';

import { AppError } from '../../model/AppError';
import { simpleQueueService } from '../aws/sqs/SimpleQueue.Service';
import { assetV4Service } from '../assets/AssetV4.Service';
import { associatedMediaV4Service } from '../associatedMedia/AssociatedMediaV4.Service';
import { creativeWorkV4Dao } from './CreativeWorkV4.DAO';
import { creativeWorkV4Service } from './CreativeWorkV4.Service';

function getMockData() {
  const assetV4ServiceMock = sinon.mock(assetV4Service);
  const creativeWorkV4DaoMock = sinon.mock(creativeWorkV4Dao);
  const associatedMediaV4ServiceMock = sinon.mock(associatedMediaV4Service);
  const simpleQueueServiceMock = sinon.mock(simpleQueueService);
  return {
    assetV4ServiceMock,
    associatedMediaV4ServiceMock,
    creativeWorkV4DaoMock,
    simpleQueueServiceMock
  };
}

describe('CreativeWorkV4.Service', () => {
  it('should contain all the methods', () => {
    expect(creativeWorkV4Service).to.respondTo('createCreativeWork');
    expect(creativeWorkV4Service).to.respondTo('getCreativeWorkByIds');
    expect(creativeWorkV4Service).to.respondTo('updateCreativeWorkSources');
  });

  describe('createCreativeWork', () => {
    it('should return created creative work', (done) => {
      const mockData = getMockData();
      const testCreativeWork: StorageModel.Product = {
        _id: 'abc',
        _sources: [{ source: 'WEBCMS', type: 'product' }],
        creativeWork: {},
        identifiers: {},
        type: 'creativeWork'
      } as StorageModel.Product;
      mockData.assetV4ServiceMock.expects('createAsset').once();
      mockData.simpleQueueServiceMock.expects('sendMessage').once();
      mockData.creativeWorkV4DaoMock
        .expects('createCreativeWork')
        .once()
        .withArgs({
          ...testCreativeWork,
          identifiers: { doi: `10.4324/${testCreativeWork._id}` }
        })
        .resolves(testCreativeWork);
      creativeWorkV4Service
        .createCreativeWork(testCreativeWork)
        .then((retriveProduct) => {
          expect(retriveProduct).to.deep.equal({ _id: testCreativeWork._id });
          mockData.assetV4ServiceMock.verify();
          mockData.simpleQueueServiceMock.verify();
          mockData.creativeWorkV4DaoMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          mockData.assetV4ServiceMock.restore();
          mockData.creativeWorkV4DaoMock.restore();
          mockData.simpleQueueServiceMock.restore();
        });
    });
    it('should return created creative work with attributes', (done) => {
      const mockData = getMockData();
      const testCreativeWork: StorageModel.Product = {
        _id: 'abc',
        _sources: [{ source: 'WEBCMS', type: 'product' }],
        creativeWork: {},
        identifiers: {},
        type: 'creativeWork'
      } as StorageModel.Product;
      mockData.assetV4ServiceMock.expects('createAsset').once();
      mockData.simpleQueueServiceMock
        .expects('sendMessage')
        .once()
        .resolves('some-message-id');
      mockData.creativeWorkV4DaoMock
        .expects('createCreativeWork')
        .once()
        .withArgs({
          ...testCreativeWork,
          identifiers: { doi: `10.4324/${testCreativeWork._id}` }
        })
        .resolves(testCreativeWork);
      creativeWorkV4Service
        .createCreativeWork(testCreativeWork)
        .then((retriveProduct) => {
          expect(retriveProduct).to.deep.equal({ _id: testCreativeWork._id });
          mockData.assetV4ServiceMock.verify();
          mockData.simpleQueueServiceMock.verify();
          mockData.creativeWorkV4DaoMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          mockData.assetV4ServiceMock.restore();
          mockData.creativeWorkV4DaoMock.restore();
          mockData.simpleQueueServiceMock.restore();
        });
    });
    it('should throw AppError when dao throws error', (done) => {
      const mockData = getMockData();
      const testCreativeWork: StorageModel.Product = {
        _id: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896',
        _sources: [{ source: 'WEBCMS', type: 'product' }],
        creativeWork: {},
        identifiers: {},
        type: 'creativeWork'
      } as StorageModel.Product;
      mockData.assetV4ServiceMock.expects('createAsset').never();
      mockData.simpleQueueServiceMock.expects('sendMessage').never();
      mockData.creativeWorkV4DaoMock
        .expects('createCreativeWork')
        .once()
        .withArgs({
          ...testCreativeWork,
          identifiers: { doi: `10.4324/${testCreativeWork._id}` }
        })
        .throws(new AppError('Unable to create product', 400));
      creativeWorkV4Service
        .createCreativeWork(testCreativeWork)
        .then(() => {
          done(new Error('Expecting error, got success.'));
        })
        .catch((error) => {
          console.log(error);
          expect(error.code).to.equal(400);
          expect(error.name).to.equal('AppError');
          mockData.assetV4ServiceMock.verify();
          mockData.simpleQueueServiceMock.verify();
          mockData.creativeWorkV4DaoMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          mockData.assetV4ServiceMock.restore();
          mockData.creativeWorkV4DaoMock.restore();
          mockData.simpleQueueServiceMock.restore();
        });
    });
    it('should return created creative work when format is hyperlink', (done) => {
      const mockData = getMockData();
      const testCreativeWork: StorageModel.Product = {
        _id: 'abc',
        associatedMedia: [{ location: 'some-url' }],
        creativeWork: {
          format: 'hyperlink',
          source: 'CMS'
        },
        identifiers: {},
        type: 'creativeWork'
      } as any;
      const testAssociatedMedia = {
        _id: '1234',
        location: 'some-url',
        size: null,
        type: 'hyperlink'
      };
      mockData.associatedMediaV4ServiceMock
        .expects('createAssociatedMedia')
        .once()
        .resolves(testAssociatedMedia);
      mockData.assetV4ServiceMock.expects('createAsset').once();
      mockData.simpleQueueServiceMock.expects('sendMessage').once();
      mockData.creativeWorkV4DaoMock
        .expects('createCreativeWork')
        .once()
        .withArgs({
          ...testCreativeWork,
          identifiers: { doi: `10.4324/${testCreativeWork._id}` }
        })
        .resolves(testCreativeWork);
      creativeWorkV4Service
        .createCreativeWork(testCreativeWork)
        .then((retriveProduct) => {
          expect(retriveProduct).to.deep.equal({ _id: testCreativeWork._id });
          mockData.associatedMediaV4ServiceMock.verify();
          mockData.assetV4ServiceMock.verify();
          mockData.simpleQueueServiceMock.verify();
          mockData.creativeWorkV4DaoMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          mockData.associatedMediaV4ServiceMock.restore();
          mockData.assetV4ServiceMock.restore();
          mockData.creativeWorkV4DaoMock.restore();
          mockData.simpleQueueServiceMock.restore();
        });
    });
    it('should throw AppError when associatedMedia is absent and format is hyperlink', (done) => {
      const mockData = getMockData();
      const testCreativeWork: StorageModel.Product = {
        _id: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896',
        _sources: [{ source: 'WEBCMS', type: 'product' }],
        creativeWork: {
          format: 'hyperlink'
        },
        identifiers: {},
        type: 'creativeWork'
      } as StorageModel.Product;
      mockData.assetV4ServiceMock.expects('createAsset').never();
      mockData.simpleQueueServiceMock.expects('sendMessage').never();
      mockData.creativeWorkV4DaoMock.expects('createCreativeWork').never();
      mockData.associatedMediaV4ServiceMock
        .expects('createAssociatedMedia')
        .never();
      creativeWorkV4Service
        .createCreativeWork(testCreativeWork)
        .then(() => {
          done(new Error('Expecting error, got success.'));
        })
        .catch((error) => {
          console.log(error);
          expect(error.code).to.equal(400);
          expect(error.name).to.equal('AppError');
          expect(error.message).to.equal(
            'associatedMedia with location is required when format is hyperlink'
          );
          mockData.assetV4ServiceMock.verify();
          mockData.simpleQueueServiceMock.verify();
          mockData.creativeWorkV4DaoMock.verify();
          mockData.associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          mockData.assetV4ServiceMock.restore();
          mockData.creativeWorkV4DaoMock.restore();
          mockData.simpleQueueServiceMock.restore();
          mockData.associatedMediaV4ServiceMock.restore();
        });
    });
    it('should throw AppError when associatedMedia is null and format is hyperlink', (done) => {
      const mockData = getMockData();
      const testCreativeWork: StorageModel.Product = {
        _id: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896',
        associatedMedia: null,
        creativeWork: {
          format: 'hyperlink',
          source: 'CMS'
        },
        identifiers: {},
        type: 'creativeWork'
      } as any;
      mockData.assetV4ServiceMock.expects('createAsset').never();
      mockData.simpleQueueServiceMock.expects('sendMessage').never();
      mockData.associatedMediaV4ServiceMock
        .expects('createAssociatedMedia')
        .never();
      mockData.creativeWorkV4DaoMock.expects('createCreativeWork').never();
      creativeWorkV4Service
        .createCreativeWork(testCreativeWork)
        .then(() => {
          done(new Error('Expecting error, got success.'));
        })
        .catch((error) => {
          console.log(error);
          expect(error.code).to.equal(400);
          expect(error.name).to.equal('AppError');
          expect(error.message).to.equal(
            'associatedMedia with location is required when format is hyperlink'
          );
          mockData.assetV4ServiceMock.verify();
          mockData.simpleQueueServiceMock.verify();
          mockData.creativeWorkV4DaoMock.verify();
          mockData.associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          mockData.assetV4ServiceMock.restore();
          mockData.creativeWorkV4DaoMock.restore();
          mockData.simpleQueueServiceMock.restore();
          mockData.associatedMediaV4ServiceMock.restore();
        });
    });
    it('should throw AppError when associatedMedia is [] and format is hyperlink', (done) => {
      const mockData = getMockData();
      const testCreativeWork: StorageModel.Product = {
        _id: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896',
        associatedMedia: [],
        creativeWork: {
          format: 'hyperlink',
          source: 'CMS'
        },
        identifiers: {},
        type: 'creativeWork'
      } as any;
      mockData.assetV4ServiceMock.expects('createAsset').never();
      mockData.simpleQueueServiceMock.expects('sendMessage').never();
      mockData.associatedMediaV4ServiceMock
        .expects('createAssociatedMedia')
        .never();
      mockData.creativeWorkV4DaoMock.expects('createCreativeWork').never();
      creativeWorkV4Service
        .createCreativeWork(testCreativeWork)
        .then(() => {
          done(new Error('Expecting error, got success.'));
        })
        .catch((error) => {
          console.log(error);
          expect(error.code).to.equal(400);
          expect(error.name).to.equal('AppError');
          expect(error.message).to.equal(
            'currently we are supporting only single associatedMedia'
          );
          mockData.assetV4ServiceMock.verify();
          mockData.simpleQueueServiceMock.verify();
          mockData.creativeWorkV4DaoMock.verify();
          mockData.associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          mockData.assetV4ServiceMock.restore();
          mockData.creativeWorkV4DaoMock.restore();
          mockData.simpleQueueServiceMock.restore();
          mockData.associatedMediaV4ServiceMock.restore();
        });
    });
    it('should throw AppError when multiple associatedMedia is present and format is hyperlink', (done) => {
      const mockData = getMockData();
      const testCreativeWork: StorageModel.Product = {
        _id: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896',
        associatedMedia: [
          { location: 'some-url-1' },
          { location: 'some-url-2' }
        ],
        creativeWork: {
          format: 'hyperlink',
          source: 'CMS'
        },
        identifiers: {},
        type: 'creativeWork'
      } as any;
      mockData.assetV4ServiceMock.expects('createAsset').never();
      mockData.simpleQueueServiceMock.expects('sendMessage').never();
      mockData.associatedMediaV4ServiceMock
        .expects('createAssociatedMedia')
        .never();
      mockData.creativeWorkV4DaoMock.expects('createCreativeWork').never();
      creativeWorkV4Service
        .createCreativeWork(testCreativeWork)
        .then(() => {
          done(new Error('Expecting error, got success.'));
        })
        .catch((error) => {
          console.log(error);
          expect(error.code).to.equal(400);
          expect(error.name).to.equal('AppError');
          expect(error.message).to.equal(
            'currently we are supporting only single associatedMedia'
          );
          mockData.assetV4ServiceMock.verify();
          mockData.simpleQueueServiceMock.verify();
          mockData.creativeWorkV4DaoMock.verify();
          mockData.associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          mockData.assetV4ServiceMock.restore();
          mockData.creativeWorkV4DaoMock.restore();
          mockData.simpleQueueServiceMock.restore();
          mockData.associatedMediaV4ServiceMock.restore();
        });
    });
    it('should throw AppError when location is absent and format is hyperlink', (done) => {
      const mockData = getMockData();
      const testCreativeWork: StorageModel.Product = {
        _id: '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896',
        associatedMedia: [{}],
        creativeWork: {
          format: 'hyperlink',
          source: 'CMS'
        },
        identifiers: {},
        type: 'creativeWork'
      } as any;
      mockData.assetV4ServiceMock.expects('createAsset').never();
      mockData.simpleQueueServiceMock.expects('sendMessage').never();
      mockData.associatedMediaV4ServiceMock
        .expects('createAssociatedMedia')
        .never();
      mockData.creativeWorkV4DaoMock.expects('createCreativeWork').never();
      creativeWorkV4Service
        .createCreativeWork(testCreativeWork)
        .then(() => {
          done(new Error('Expecting error, got success.'));
        })
        .catch((error) => {
          console.log(error);
          expect(error.code).to.equal(400);
          expect(error.name).to.equal('AppError');
          expect(error.message).to.equal('location is required');
          mockData.assetV4ServiceMock.verify();
          mockData.simpleQueueServiceMock.verify();
          mockData.creativeWorkV4DaoMock.verify();
          mockData.associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          mockData.assetV4ServiceMock.restore();
          mockData.creativeWorkV4DaoMock.restore();
          mockData.simpleQueueServiceMock.restore();
          mockData.associatedMediaV4ServiceMock.restore();
        });
    });
  });
  describe('getCreativeWorkByIds', () => {
    it('should return list of matching creativeWorks with projection', (done) => {
      const mockData = getMockData();
      const testCreativeWork = {
        _id: '1234',
        creativeWork: {
          format: 'presentation'
        }
      };
      mockData.creativeWorkV4DaoMock
        .expects('getCreativeWorkByIds')
        .once()
        .withArgs(['1234'], ['creativeWork.format'])
        .resolves([testCreativeWork]);
      creativeWorkV4Service
        .getCreativeWorkByIds(['1234'], ['creativeWork.format'])
        .then((retriveProduct) => {
          expect(retriveProduct).to.be.an('array');
          expect(retriveProduct.length).to.equal(1);
          expect(retriveProduct[0]).to.be.an('object');
          expect(retriveProduct[0]).to.have.property('_id', '1234');
          expect(retriveProduct[0]).to.have.property('creativeWork');
          expect(retriveProduct[0].creativeWork).to.be.an('object');
          expect(retriveProduct[0].creativeWork).to.have.property(
            'format',
            'presentation'
          );
          mockData.creativeWorkV4DaoMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          mockData.creativeWorkV4DaoMock.restore();
        });
    });
    it('should return list of matching creativeWorks when projection is not passed', (done) => {
      const mockData = getMockData();
      const testCreativeWork = {
        _id: '1234',
        creativeWork: {
          format: 'presentation'
        }
      };
      mockData.creativeWorkV4DaoMock
        .expects('getCreativeWorkByIds')
        .once()
        .withArgs(['1234'], [])
        .resolves([testCreativeWork]);
      creativeWorkV4Service
        .getCreativeWorkByIds(['1234'])
        .then((retriveProduct) => {
          expect(retriveProduct).to.be.an('array');
          expect(retriveProduct.length).to.equal(1);
          expect(retriveProduct[0]).to.be.an('object');
          expect(retriveProduct[0]).to.have.property('_id', '1234');
          expect(retriveProduct[0]).to.have.property('creativeWork');
          expect(retriveProduct[0].creativeWork).to.be.an('object');
          expect(retriveProduct[0].creativeWork).to.have.property(
            'format',
            'presentation'
          );
          mockData.creativeWorkV4DaoMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          mockData.creativeWorkV4DaoMock.restore();
        });
    });
  });
  describe('updateCreativeWorkSources', () => {
    it('should return updated creative work', (done) => {
      const mockData = getMockData();
      const testCreativeWork: StorageModel.Product = {
        _id: 'abc',
        _sources: [
          { source: 'WEBCMS', type: 'product' },
          { source: 'WEBCMS', type: 'content' }
        ],
        creativeWork: {},
        identifiers: {},
        type: 'creativeWork'
      } as StorageModel.Product;
      mockData.creativeWorkV4DaoMock
        .expects('updateCreativeWorkSources')
        .once()
        .withArgs(testCreativeWork._id)
        .resolves(testCreativeWork);
      creativeWorkV4Service
        .updateCreativeWorkSources(testCreativeWork._id)
        .then((retriveProduct) => {
          expect(retriveProduct).to.deep.equal(testCreativeWork);
          mockData.creativeWorkV4DaoMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          mockData.creativeWorkV4DaoMock.restore();
        });
    });
  });
});
