import { MongooseSchema } from '@tandfgroup/pcm-entity-model-v4';
import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as sinon from 'sinon';
import { taxonomyMasterTestData } from '../test/data/TaxonomyMaster';
import { taxonomyTestData } from '../test/data/TaxonomyV4';
import { taxonomyV4DAO as taxonomyV4DAO } from './TaxonomyV4.DAO';

const mongooseExec = {
  exec: async () => {
    throw new Error('mongoose Error');
  }
};
const mongooseLean = { lean: () => mongooseExec };

describe('TaxonomyV4.DAO', () => {
  let mongoServer;
  const projectionFields: string[] = [
    '_id',
    'name',
    'level',
    'code',
    'parentId'
  ];
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
    const TestTaxonomyV4 = mongoose.model(
      'TaxonomyV4',
      MongooseSchema.Taxonomy,
      'taxonomy-4.0.1'
    );
    const TestTaxonomyMaster = mongoose.model(
      'taxonomy-master',
      MongooseSchema.ClassificationSchema,
      'taxonomy-master'
    );
    await TestTaxonomyMaster.insertMany(taxonomyMasterTestData);
    await TestTaxonomyV4.insertMany(taxonomyTestData);
  });
  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should contain all functions', () => {
    expect(taxonomyV4DAO).to.respondTo('getTaxonomy');
    expect(taxonomyV4DAO).to.respondTo('getTaxonomyClassifications');
  });
  describe('getTaxonomy', () => {
    it('should return all taxonomy with matching `assetType` and `type`', (done) => {
      const assetType = 'book';
      const taxonomyType = 'subject';
      const taxonomyFilter = {
        code: undefined,
        extendLevel: false,
        isCodePrefix: false,
        level: undefined,
        name: undefined
      };
      taxonomyV4DAO
        .getTaxonomy(assetType, taxonomyType, taxonomyFilter, projectionFields)
        .then((taxonomies) => {
          expect(taxonomies).to.be.an('array');
          expect(taxonomies.length).to.equal(4);
          expect(taxonomies[0]).to.have.property('_id', 'AG');
          expect(taxonomies[0]).to.have.property('code', 'SCAG');
          done();
        })
        .catch((error) => {
          console.log(error);
          done(error);
        });
    });
    it('should return taxonomy with matching `name` query only', (done) => {
      const assetType = null;
      const taxonomyType = undefined;
      const taxonomyFilter = {
        code: undefined,
        extendLevel: false,
        isCodePrefix: false,
        level: undefined,
        name: 'Forestry'
      };
      taxonomyV4DAO
        .getTaxonomy(assetType, taxonomyType, taxonomyFilter, projectionFields)
        .then((taxonomies) => {
          expect(taxonomies).to.be.an('array');
          expect(taxonomies.length).to.equal(1);
          taxonomies.forEach((taxonomy) => {
            expect(taxonomy).to.have.property('name', 'Forestry');
            expect(taxonomy).to.have.property('code', 'SCAG0515');
          });
          done();
        })
        .catch((error) => {
          console.log(error);
          done(error);
        });
    });
    it('should return taxonomy with matching `code` and `level`', (done) => {
      const assetType = 'book';
      const taxonomyType = 'subject';
      const taxonomyFilter = {
        code: 'SCAG',
        extendLevel: false,
        isCodePrefix: false,
        level: 1,
        name: undefined
      };
      taxonomyV4DAO
        .getTaxonomy(assetType, taxonomyType, taxonomyFilter, projectionFields)
        .then((taxonomies) => {
          expect(taxonomies).to.be.an('array');
          expect(taxonomies.length).to.equal(1);
          taxonomies.forEach((taxonomy) => {
            expect(taxonomy).to.have.property('_id', 'AG');
            expect(taxonomy).to.have.property('code', 'SCAG');
          });
          done();
        })
        .catch((error) => {
          console.log(error);
          done(error);
        });
    });
    it('should return taxonomy with matching `code` and `level` with isCodePrefix=true', (done) => {
      const assetType = 'book';
      const taxonomyType = 'subject';
      const taxonomyFilter = {
        code: 'SCAG',
        extendLevel: false,
        isCodePrefix: true,
        level: 1,
        name: undefined
      };
      taxonomyV4DAO
        .getTaxonomy(assetType, taxonomyType, taxonomyFilter, projectionFields)
        .then((taxonomies) => {
          expect(taxonomies).to.be.an('array');
          expect(taxonomies.length).to.equal(1);
          taxonomies.forEach((taxonomy) => {
            expect(taxonomy).to.have.property('_id', 'AG');
            expect(taxonomy).to.have.property('code', 'SCAG');
          });
          done();
        })
        .catch((error) => {
          console.log(error);
          done(error);
        });
    });
    it('should return taxonomy with matching `code` and `level` with isCodePrefix=true and extendLevel=true', (done) => {
      const assetType = 'book';
      const taxonomyType = 'subject';
      const taxonomyFilter = {
        code: 'SCAG',
        extendLevel: true,
        isCodePrefix: true,
        level: 2,
        name: undefined
      };
      taxonomyV4DAO
        .getTaxonomy(assetType, taxonomyType, taxonomyFilter, projectionFields)
        .then((taxonomies) => {
          expect(taxonomies).to.be.an('array');
          expect(taxonomies.length).to.equal(3);
          expect(taxonomies[0]).to.have.property('_id', 'AG05');
          expect(taxonomies[0]).to.have.property('code', 'SCAG05');
          done();
        })
        .catch((error) => {
          console.log(error);
          done(error);
        });
    });
    it('should return taxonomies with matching `code` and `level` with isCodePrefix=false and extendLevel=true', (done) => {
      const assetType = 'book';
      const taxonomyType = 'subject';
      const taxonomyFilter = {
        code: 'SCAG',
        extendLevel: true,
        isCodePrefix: false,
        level: 1,
        name: undefined
      };
      taxonomyV4DAO
        .getTaxonomy(assetType, taxonomyType, taxonomyFilter, projectionFields)
        .then((taxonomies) => {
          expect(taxonomies).to.be.an('array');
          expect(taxonomies.length).to.equal(1);
          taxonomies.forEach((taxonomy) => {
            expect(taxonomy).to.have.property('_id', 'AG');
            expect(taxonomy).to.have.property('code', 'SCAG');
          });
          done();
        })
        .catch((error) => {
          console.log(error);
          done(error);
        });
    });
    it('should throw error Invalid projections. when projections are invalid', (done) => {
      const assetType = 'book';
      const taxonomyType = 'subject';
      const taxonomyFilter = {
        code: undefined,
        extendLevel: false,
        isCodePrefix: false,
        level: undefined,
        name: undefined
      };
      taxonomyV4DAO
        .getTaxonomy(assetType, taxonomyType, taxonomyFilter, 'invalid' as any)
        .then(() => {
          done(new Error('Expecting error, but got success'));
        })
        .catch((err) => {
          expect(err.message).to.equal('Invalid projections.');
          done();
        })
        .catch(done);
    });
    it('should return error when model throws error', (done) => {
      const taxonomyV4ModelMock = sinon.mock(taxonomyV4DAO.model);
      const assetType = 'book';
      const taxonomyType = 'subject';
      const taxonomyFilter = {
        code: undefined,
        extendLevel: false,
        isCodePrefix: false,
        level: undefined,
        name: undefined
      };
      const query = {
        assetType: 'book',
        status: 'active',
        type: 'subject'
      };
      taxonomyV4ModelMock
        .expects('find')
        .once()
        .withArgs(query)
        .returns(mongooseLean);
      taxonomyV4DAO
        .getTaxonomy(assetType, taxonomyType, taxonomyFilter, projectionFields)
        .then(() => {
          done(new Error('Expecting error, but got success'));
        })
        .catch((err) => {
          expect(err).to.equal('We are unable to find the Taxonomy.');
          taxonomyV4ModelMock.verify();
          taxonomyV4ModelMock.restore();
          done();
        });
    });
  });
  describe('getTaxonomyClassifications', () => {
    it('should return exact match rom classification for the given code', (done) => {
      const taxonomyMasterFilter = {
        classificationFamily: 'rom',
        classificationType: undefined,
        code: 'sub_1',
        includeChildren: false,
        level: undefined
      };
      taxonomyV4DAO
        .getTaxonomyClassifications(taxonomyMasterFilter, projectionFields)
        .then((result) => {
          expect(result).to.be.an('array');
          expect(result.length).to.equal(1);
          expect(result[0]).to.have.property('_id', 1);
          expect(result[0]).to.have.property('code', 'sub_1');
          expect(result[0]).to.have.property('level', 1);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return exact match hobs classification for the given code', (done) => {
      const taxonomyMasterFilter = {
        classificationFamily: 'hobs',
        classificationType: undefined,
        code: 'sub_1',
        includeChildren: false,
        level: undefined
      };
      taxonomyV4DAO
        .getTaxonomyClassifications(taxonomyMasterFilter, projectionFields)
        .then((result) => {
          expect(result).to.be.an('array');
          expect(result.length).to.equal(1);
          expect(result[0]).to.have.property('_id', 745);
          expect(result[0]).to.have.property('code', 'sub_1');
          expect(result[0]).to.have.property('level', 1);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return classification & its children for the given code', (done) => {
      const taxonomyMasterFilter = {
        classificationFamily: 'rom',
        classificationType: 'subject',
        code: 'sub_1',
        includeChildren: true,
        level: 3
      };
      taxonomyV4DAO
        .getTaxonomyClassifications(taxonomyMasterFilter, projectionFields)
        .then((result) => {
          expect(result).to.be.an('array');
          expect(result.length).to.equal(4);
          expect(result[0]).to.eqls({
            _id: 10,
            code: 'sub_1_8_1',
            level: 3,
            name: 'IT Environment',
            parentId: 9
          });
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should return classifications in the same level ', (done) => {
      const taxonomyMasterFilter = {
        classificationFamily: 'rom',
        classificationType: 'subject',
        code: undefined,
        includeChildren: false,
        level: 3
      };
      taxonomyV4DAO
        .getTaxonomyClassifications(taxonomyMasterFilter, projectionFields)
        .then((result) => {
          expect(result).to.be.an('array');
          expect(result.length).to.equal(2);
          expect(result[0]).to.eqls({
            _id: 10,
            code: 'sub_1_8_1',
            level: 3,
            name: 'IT Environment',
            parentId: 9
          });
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        });
    });
    it('should throw error Invalid projections. when projections are invalid', (done) => {
      const taxonomyMasterFilter = {
        classificationFamily: 'rom',
        classificationType: 'subject',
        code: 'sub_1',
        includeChildren: false,
        level: 3
      };
      taxonomyV4DAO
        .getTaxonomyClassifications(taxonomyMasterFilter, 'invalid' as any)
        .then(() => {
          done(new Error('Expecting error, but got success'));
        })
        .catch((err) => {
          expect(err.message).to.equal('Invalid projections.');
          done();
        })
        .catch(done);
    });
    it('should return error when model throws error', (done) => {
      const taxonomyMasterFilter = {
        classificationFamily: 'rom',
        classificationType: 'subject',
        code: 'sub_1',
        includeChildren: false,
        level: undefined
      };
      const taxonomyMasterModelMock = sinon.mock(taxonomyV4DAO.TaxonomyMaster);
      const query = {
        classificationFamily: 'rom',
        classificationType: 'subject',
        code: 'sub_1',
        status: 'active'
      };
      taxonomyMasterModelMock
        .expects('find')
        .once()
        .withArgs(query)
        .returns(mongooseLean);
      taxonomyV4DAO
        .getTaxonomyClassifications(taxonomyMasterFilter, projectionFields)
        .then((res) => {
          done(new Error('Expecting error, but got success'));
        })
        .catch((err) => {
          expect(err).to.equal('We are unable to find the Taxonomy.');
          taxonomyMasterModelMock.verify();
          taxonomyMasterModelMock.restore();
          done();
        });
    });
  });
});
