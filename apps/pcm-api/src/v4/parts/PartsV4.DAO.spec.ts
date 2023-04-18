import { MongooseSchema } from '@tandfgroup/pcm-entity-model-v4';
import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';

// import * as partsData from '../../../test/data/parts.json';
import * as sinon from 'sinon';
import { Config } from '../../config/config';
import { creativeWorkTestData } from '../test/data/creativeWorkV4';
import { partsTestData } from '../test/data/PartsV4';
import { partsV4DAO } from './PartsV4.DAO';

const mongooseExec = {
  exec: async () => {
    throw new Error('mongoose Error');
  }
};
const mongooseLean = { lean: () => mongooseExec };

const docTypeToCollectionMapperV4 = Config.getPropertyValue(
  'docTypeToCollectionMapperV4'
);

describe('partsV4DAO', () => {
  let mongoServer;
  let TestPart;
  let TestCreativeWork;
  const projections = ['parts._id', 'parts.type', 'parts.position'];
  before(async () => {
    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getConnectionString();
    await mongoose
      .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => {
        console.log('Connection to MongoDB is success.');
      })
      .catch((err) => {
        console.log('Connection to MongoDB is failed.', err);
      });
    TestPart = mongoose.model(
      'test',
      MongooseSchema.Part,
      docTypeToCollectionMapperV4.part
    );
    await TestPart.insertMany(partsTestData);
    TestCreativeWork = mongoose.model(
      'TestCreativeWorkV4',
      MongooseSchema.CreativeWork,
      'creativework-4.0.1'
    );
    await TestCreativeWork.insertMany(creativeWorkTestData);
  });
  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  it('should have all required methods', () => {
    expect(partsV4DAO).to.respondTo('getHasParts');
    expect(partsV4DAO).to.respondTo('getHasPartsCount');
    expect(partsV4DAO).to.respondTo('getHasPart');
  });
  describe('getHasParts', () => {
    it('should return list of hasParts when offset is 0 and limit 4', (done) => {
      const productId = '9c43274c-92ee-4347-94a0-1c98e5f76986';
      const offset = 0;
      const limit = 4;
      partsV4DAO
        .getHasParts(productId, offset, limit, projections)
        .then((retriveProduct) => {
          expect(retriveProduct).to.be.an('Array');
          expect(retriveProduct.length).to.equal(4);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return one hasPart when limit is 1', (done) => {
      const productId = '9c43274c-92ee-4347-94a0-1c98e5f76986';
      const offset = 0;
      const limit = 1;
      partsV4DAO
        .getHasParts(productId, offset, limit, projections)
        .then((retriveProduct) => {
          expect(retriveProduct).to.be.an('Array');
          expect(retriveProduct.length).to.equal(1);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should skip the first hasPart when the offset is 1', (done) => {
      const productId = '9c43274c-92ee-4347-94a0-1c98e5f76986';
      partsV4DAO
        .getHasParts(productId, 0, 3, projections)
        .then((testHasParts) => {
          const offset = 1;
          const limit = 2;
          partsV4DAO
            .getHasParts(productId, offset, limit, projections)
            .then((retriveProduct) => {
              expect(retriveProduct.length).to.equal(2);
              expect(retriveProduct[0]._id).to.not.equal(testHasParts[0]._id);
              expect(retriveProduct[0]._id).to.equal(testHasParts[1]._id);
              done();
            })
            .catch((err) => {
              console.log(err);
              done(err);
            });
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it(`should return list of hasParts when passed valid productId, offset, limit,
        partType`, (done) => {
      const productId = '5355eddd-e849-4cc3-89dc-e43ab19f79f8';
      const offset = 0;
      const limit = 4;
      const partType = 'creativeWork';
      partsV4DAO
        .getHasParts(productId, offset, limit, projections, partType)
        .then((retriveProduct) => {
          expect(retriveProduct).to.be.an('Array');
          expect(retriveProduct.length).to.equal(2);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it(`should return list of hasParts when passed valid productId, offset, limit,
         partType & format`, (done) => {
      const productId = '5355eddd-e849-4cc3-89dc-e43ab19f79f8';
      const offset = 0;
      const limit = 4;
      const partType = 'creativeWork';
      const format = 'document';
      partsV4DAO
        .getHasParts(productId, offset, limit, projections, partType, format)
        .then((retriveProduct) => {
          expect(retriveProduct).to.be.an('Array');
          expect(retriveProduct.length).to.equal(1);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it(`should return list of hasParts when passed valid productId, offset, limit,
         partType`, (done) => {
      const productId = 'some-book-id';
      const offset = 0;
      const limit = 2;
      const partType = 'part';
      partsV4DAO
        .getHasParts(productId, offset, limit, projections, partType)
        .then((retriveProduct) => {
          expect(retriveProduct).to.be.an('Array');
          expect(retriveProduct.length).to.equal(2);
          expect(retriveProduct[0].type).to.equal('part');
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
  });
  describe('getHasPartsCount', () => {
    it('should return total count of hasParts when productId ', (done) => {
      const productId = '9c43274c-92ee-4347-94a0-1c98e5f76986';
      partsV4DAO
        .getHasPartsCount(productId)
        .then((retriveProduct) => {
          expect(retriveProduct).to.equal(8);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return total count of hasParts when productId & partType passed ', (done) => {
      const productId = '9c43274c-92ee-4347-94a0-1c98e5f76986';
      partsV4DAO
        .getHasPartsCount(productId, 'chapter')
        .then((retriveProduct) => {
          expect(retriveProduct).to.equal(8);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return 0 count for invalid identifier ', (done) => {
      const productId = '11111222233333';
      partsV4DAO
        .getHasPartsCount(productId, 'chapter')
        .then((retriveProduct) => {
          expect(retriveProduct).to.be.equal(0);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should throw error when model is broken or invalid', (done) => {
      const productId = '9c43274c-92ee-4347-94a0-1c98e5f76986-inValid';
      const partsV4DAOMock = sinon.mock(partsV4DAO.model);
      partsV4DAOMock
        .expects('find')
        .once()
        .withArgs({ _id: productId })
        .returns(mongooseLean);

      partsV4DAO
        .getHasPartsCount(productId)
        .then((val) => {
          done(new Error('Expecting error, but got success'));
        })
        .catch((err) => {
          console.log(err);
          expect(err).to.equal('We are unable to find the parts.');
          partsV4DAOMock.verify();
          done();
        })
        .finally(() => {
          partsV4DAOMock.restore();
        });
    });
  });
  describe('getHasPart', () => {
    it('should return hasPart when hasPartId, parentId and isFree is true', (done) => {
      const hasPartId = '28c399f0-5f63-403d-8f8f-4017f65ec0e3';
      const parentId = '9c43274c-92ee-4347-94a0-1c98e5f76986';
      partsV4DAO
        .getHasPart(parentId, hasPartId)
        .then((retriveProduct) => {
          expect(retriveProduct).to.be.an('Object');
          expect(retriveProduct).to.have.property('isFree', true);
          expect(retriveProduct._id).to.be.equal(hasPartId);
          expect(retriveProduct.type).to.be.equal('chapter');
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return hasPart when hasPartId & parentId is valid but isFree is false', (done) => {
      const hasPartId = '1f6fd6dd-85e1-4b1a-885c-cebf60f6fe75';
      const parentId = '9c43274c-92ee-4347-94a0-1c98e5f76986';
      partsV4DAO
        .getHasPart(parentId, hasPartId, false)
        .then((retriveProduct) => {
          expect(retriveProduct._id).to.be.equal(hasPartId);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return undefined when hasPartId is invalid but parentId is valid', (done) => {
      const hasPartId = '1f6fd6dd-85e1-4b1a-885c-cebf60f6fe75-invalid';
      const parentId = '9c43274c-92ee-4347-94a0-1c98e5f76986';
      partsV4DAO
        .getHasPart(parentId, hasPartId)
        .then((retriveProduct) => {
          expect(retriveProduct).to.be.equal(undefined);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return undefined when hasPartId is valid but parentId is invalid', (done) => {
      const hasPartId = '1f6fd6dd-85e1-4b1a-885c-cebf60f6fe75';
      const parentId = '9c43274c-92ee-4347-94a0-1c98e5f76986-invalid';
      partsV4DAO
        .getHasPart(parentId, hasPartId)
        .then((retriveProduct) => {
          expect(retriveProduct).to.be.equal(undefined);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should throw error when model is broken or invalid', (done) => {
      const hasPartId = '9c43274c-92ee-4347-94a0-1c98e5f76986-inValid';
      const parentId = '9c43274c-92ee-4347-94a0-1c98e5f76986';
      const isFree = true;
      const query = {
        _id: parentId,
        parts: { $elemMatch: { _id: hasPartId, isFree: true } }
      };
      const projection = {
        parts: { $elemMatch: { _id: hasPartId } }
      };
      const partsV4DAOMock = sinon.mock(partsV4DAO.model);
      partsV4DAOMock
        .expects('findOne')
        .once()
        .withArgs(query, projection)
        .returns(mongooseLean);
      partsV4DAO
        .getHasPart(parentId, hasPartId, isFree)
        .then((val) => {
          done(new Error('Expecting error, but got success'));
        })
        .catch((err) => {
          console.log(err);
          expect(err).to.equal('We are unable to find the part.');
          partsV4DAOMock.verify();
          done();
        })
        .finally(() => {
          partsV4DAOMock.restore();
        });
    });
  });
  describe('getAggregationQueryForAllPartsCount', () => {
    it('should return correct aggregation query for a given product id', () => {
      const productId = '12345';
      const expectedAggregationQuery = [
        { $match: { _id: productId } },
        { $unwind: '$parts' },
        {
          $group: {
            _id: '$parts.type',
            count: { $sum: 1 }
          }
        }
      ];
      const aggregationQuery =
        partsV4DAO.getAggregationQueryForAllPartsCount(productId);
      expect(aggregationQuery).to.deep.equal(expectedAggregationQuery);
    });
  });
  describe('getAllPartsCount', () => {
    it('should call model.aggregate with correct aggregation query for a given product id', (done) => {
      const productId = '5355eddd-e849-4cc3-89dc-e43ab19f79f8';
      const daoResp = [
        { _id: 'creativeWork', count: 2 },
        { _id: 'chapter', count: 3 }
      ];
      partsV4DAO
        .getAllPartsCount(productId)
        .then((parts) => {
          expect(parts).to.be.an('Array');
          expect(parts.length).to.equal(2);
          parts.forEach((part) => {
            expect(part).to.be.an('object');
            expect(part).to.have.property('count');
            expect(part).to.have.property('_id');
          });
          expect(parts).to.be.eql(daoResp);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
  });
});
