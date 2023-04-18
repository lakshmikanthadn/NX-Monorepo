import { MongooseSchema } from '@tandfgroup/pcm-entity-model-v4';
import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';

// import * as partsData from '../../../test/data/parts.json';
import * as sinon from 'sinon';
import { Config } from '../../config/config';
import { partsRevisionTestData } from '../test/data/PartsRevisionV4';
import { partsRevisionV4DAO } from './PartsRevisionV4.DAO';

const mongooseExec = {
  exec: async () => {
    throw new Error('mongoose Error');
  }
};
const mongooseLean = { lean: () => mongooseExec };

const docTypeToCollectionMapperV4 = Config.getPropertyValue(
  'docTypeToCollectionMapperV4'
);

describe('partsRevisionV4DAO', () => {
  let mongoServer;
  let TestPart;
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
      'PartsRevision',
      MongooseSchema.PartRevision,
      docTypeToCollectionMapperV4.partrevision
    );
    await TestPart.insertMany(partsRevisionTestData);
  });
  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  it('should have all required methods', () => {
    expect(partsRevisionV4DAO).to.respondTo('getHasParts');
    expect(partsRevisionV4DAO).to.respondTo('getHasPartsCount');
  });
  describe('getHasParts', () => {
    it('should return list of hasParts when offset is 0 and limit 4', (done) => {
      const productId = '9c43274c-92ee-4347-94a0-1c98e5f76986';
      const offset = 0;
      const limit = 4;
      const productVersion = '1.0.0';
      partsRevisionV4DAO
        .getHasParts(productId, productVersion, offset, limit, projections)
        .then((retriveProduct) => {
          expect(retriveProduct.length).to.equal(4);
          expect(retriveProduct).to.be.an('Array');
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
      const productVersion = '1.0.0';
      partsRevisionV4DAO
        .getHasParts(productId, productVersion, offset, limit, projections)
        .then((retriveProduct) => {
          expect(retriveProduct.length).to.equal(1);
          expect(retriveProduct).to.be.an('Array');
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should skip the first hasPart when the offset is 1', (done) => {
      const productId = '9c43274c-92ee-4347-94a0-1c98e5f76986';
      const productVersion = '1.0.0';
      partsRevisionV4DAO
        .getHasParts(productId, productVersion, 0, 3, projections)
        .then((testHasParts) => {
          const offset = 1;
          const limit = 2;
          partsRevisionV4DAO
            .getHasParts(productId, productVersion, offset, limit, projections)
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
      const productVersion = '1.0.0';
      partsRevisionV4DAO
        .getHasParts(
          productId,
          productVersion,
          offset,
          limit,
          projections,
          partType
        )
        .then((retriveProduct) => {
          expect(retriveProduct.length).to.equal(2);
          expect(retriveProduct).to.be.an('Array');
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
      const productVersion = '1.0.0';
      partsRevisionV4DAO
        .getHasParts(
          productId,
          productVersion,
          offset,
          limit,
          projections,
          partType,
          format
        )
        .then((retriveProduct) => {
          expect(retriveProduct.length).to.equal(1);
          expect(retriveProduct).to.be.an('Array');
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
  });
  describe('getPartsRevisionDataByDate', () => {
    it('should return list of parts data when valid parentid is passed', (done) => {
      const id = '5355eddd-e849-4cc3-89dc-e43ab19f79f8';
      const fromDate = '2020-02-10';
      const toDate = '2020-02-12';
      partsRevisionV4DAO
        .getPartsRevisionDataByDate(id, fromDate, toDate)
        .then((retriveProduct) => {
          expect(retriveProduct).to.deep.equal([partsRevisionTestData[0]]);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return error when invalid parentid is passed', (done) => {
      const id = '5355eddd-e849-4cc3-89dc-e43ab19f79f-invalid';
      const fromDate = '2020-02-10';
      const toDate = '2020-02-12';
      const endDate = new Date(toDate);
      endDate.setUTCHours(23, 59, 59, 999);
      const query = {
        _createdDate: {
          $gte: new Date(fromDate),
          $lt: new Date(endDate)
        },
        parentId: { $eq: id }
      };
      const projection = {
        'partsAdded.isFree': 0,
        'partsRemoved.isFree': 0,
        'partsUpdated.isFree': 0
      };
      const partsRevisionV4DAOMock = sinon.mock(partsRevisionV4DAO.model);
      partsRevisionV4DAOMock
        .expects('find')
        .once()
        .withArgs(query, projection)
        .returns(mongooseLean);
      partsRevisionV4DAO
        .getPartsRevisionDataByDate(id, fromDate, toDate)
        .then((retriveProduct) => {
          done(new Error('Expecting error, but got success'));
        })
        .catch((err) => {
          console.log(err);
          expect(err).to.equal(
            'We are unable to find parts revision data for this product.'
          );
          partsRevisionV4DAOMock.verify();
          done();
        })
        .finally(() => {
          partsRevisionV4DAOMock.restore();
        });
    });
    it('should return error when invalid parentid is passed and todate is not passed', (done) => {
      const id = '5355eddd-e849-4cc3-89dc-e43ab19f79f-invalid';
      const fromDate = '2020-02-10';
      const query = {
        _createdDate: {
          $gte: new Date(fromDate)
        },
        parentId: { $eq: id }
      };
      const projection = {
        'partsAdded.isFree': 0,
        'partsRemoved.isFree': 0,
        'partsUpdated.isFree': 0
      };
      const partsRevisionV4DAOMock = sinon.mock(partsRevisionV4DAO.model);
      partsRevisionV4DAOMock
        .expects('find')
        .once()
        .withArgs(query, projection)
        .returns(mongooseLean);
      partsRevisionV4DAO
        .getPartsRevisionDataByDate(id, fromDate)
        .then((retriveProduct) => {
          done(new Error('Expecting error, but got success'));
        })
        .catch((err) => {
          console.log(err);
          expect(err).to.equal(
            'We are unable to find parts revision data for this product.'
          );
          partsRevisionV4DAOMock.verify();
          done();
        })
        .finally(() => {
          partsRevisionV4DAOMock.restore();
        });
    });
  });

  describe('getHasPartsCount', () => {
    it('should return total count of hasParts when productId ', (done) => {
      const productId = '9c43274c-92ee-4347-94a0-1c98e5f76986';
      const productVersion = '1.0.0';
      partsRevisionV4DAO
        .getHasPartsCount(productId, productVersion)
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
      const productVersion = '1.0.0';
      partsRevisionV4DAO
        .getHasPartsCount(productId, productVersion, 'chapter')
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
      const productVersion = '1.0.0';
      partsRevisionV4DAO
        .getHasPartsCount(productId, productVersion, 'chapter')
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
      const productVersion = '1.0.0';
      const partsV4DAOMock = sinon.mock(partsRevisionV4DAO.model);
      partsV4DAOMock
        .expects('find')
        .once()
        .withArgs({ parentId: productId, version: productVersion })
        .returns(mongooseLean);

      partsRevisionV4DAO
        .getHasPartsCount(productId, productVersion)
        .then((val) => {
          console.log('val:::', val);
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
});
