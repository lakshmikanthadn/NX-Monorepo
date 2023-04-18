import { expect } from 'chai';
import * as sinon from 'sinon';
import { taxonomyV4DAO } from './TaxonomyV4.DAO';
import { taxonomyV4Service } from './TaxonomyV4.Service';

describe('TaxonomyV4Service', () => {
  it('should have all the required methods', () => {
    expect(taxonomyV4Service).to.respondTo('getTaxonomy');
    expect(taxonomyV4Service).to.respondTo('getTaxonomyClassifications');
  });
  describe('getTaxonomy', () => {
    it('should return taxonomy', (done) => {
      const taxonomyV4DAOMock = sinon.mock(taxonomyV4DAO);
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
      taxonomyV4DAOMock
        .expects('getTaxonomy')
        .once()
        .withArgs(assetType, taxonomyType, testTaxonomyFilter)
        .resolves(testTaxonomy);
      taxonomyV4Service
        .getTaxonomy(assetType, taxonomyType, testTaxonomyFilter)
        .then((taxonomys) => {
          expect(taxonomys).to.be.an('array');
          expect(taxonomys.length).to.equal(1);
          taxonomys.forEach((taxonomy) => {
            expect(taxonomy).to.have.property('assetType', assetType);
            expect(taxonomy).to.have.property('type', taxonomyType);
          });
          taxonomyV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          taxonomyV4DAOMock.restore();
        });
    });
  });
  describe('getTaxonomyClassifications', () => {
    it('should return ubx classifications', (done) => {
      const taxonomyV4DAOMock = sinon.mock(taxonomyV4DAO);
      const taxonomyMasterFilter = {
        classificationFamily: 'ubx',
        classificationType: 'subject',
        code: 'SCAG',
        includeChildren: false,
        level: 1
      };
      const testTaxonomy = [
        {
          _id: 'AG',
          code: 'SCAG',
          level: 1,
          name: 'Environment & Agriculture',
          parentId: 'some-parent',
          type: 'subject'
        }
      ];
      taxonomyV4DAOMock
        .expects('getTaxonomy')
        .once()
        .withArgs(null, 'subject', {
          code: 'SCAG',
          extendLevel: false,
          isCodePrefix: true,
          level: 1
        })
        .resolves(testTaxonomy);
      taxonomyV4DAOMock.expects('getTaxonomyClassifications').never();
      taxonomyV4Service
        .getTaxonomyClassifications(taxonomyMasterFilter)
        .then((taxonomy) => {
          expect(taxonomy).to.be.an('array');
          expect(taxonomy.length).to.equal(1);
          taxonomy.forEach((classification) => {
            expect(classification).to.have.property('code', 'SCAG');
            expect(classification).to.have.property(
              'classificationType',
              'subject'
            );
          });
          taxonomyV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          taxonomyV4DAOMock.restore();
        });
    });
    it('should return ubx classifications for the given code', (done) => {
      const taxonomyV4DAOMock = sinon.mock(taxonomyV4DAO);
      const taxonomyMasterFilter = {
        classificationFamily: 'ubx',
        classificationType: 'subject',
        code: 'SCAG',
        includeChildren: false,
        level: undefined
      };
      const testTaxonomy = [
        {
          _id: 'AG',
          code: 'SCAG',
          level: 1,
          name: 'Environment & Agriculture',
          parentId: 'some-parent',
          type: 'subject'
        }
      ];
      taxonomyV4DAOMock
        .expects('getTaxonomy')
        .once()
        .withArgs(null, 'subject', {
          code: 'SCAG',
          extendLevel: false,
          isCodePrefix: false,
          level: undefined
        })
        .resolves(testTaxonomy);
      taxonomyV4DAOMock.expects('getTaxonomyClassifications').never();
      taxonomyV4Service
        .getTaxonomyClassifications(taxonomyMasterFilter)
        .then((taxonomy) => {
          expect(taxonomy).to.be.an('array');
          expect(taxonomy.length).to.equal(1);
          taxonomy.forEach((classification) => {
            expect(classification).to.have.property('code', 'SCAG');
            expect(classification).to.have.property(
              'classificationType',
              'subject'
            );
          });
          taxonomyV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          taxonomyV4DAOMock.restore();
        });
    });
    it('should return rom classifications', (done) => {
      const taxonomyV4DAOMock = sinon.mock(taxonomyV4DAO);
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
      taxonomyV4DAOMock
        .expects('getTaxonomyClassifications')
        .once()
        .withArgs(taxonomyMasterFilter)
        .resolves(testTaxonomy);
      taxonomyV4DAOMock.expects('getTaxonomy').never();
      taxonomyV4Service
        .getTaxonomyClassifications(taxonomyMasterFilter)
        .then((taxonomy) => {
          expect(taxonomy).to.be.an('array');
          expect(taxonomy.length).to.equal(1);
          taxonomy.forEach((classification) => {
            expect(classification).to.have.property('code', 'sub_1');
            expect(classification).to.have.property(
              'classificationType',
              'subject'
            );
          });
          taxonomyV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          taxonomyV4DAOMock.restore();
        });
    });
    it('should return empty array if no valid classifications exists', (done) => {
      const taxonomyV4DAOMock = sinon.mock(taxonomyV4DAO);
      const taxonomyMasterFilter = {
        classificationFamily: 'rom',
        classificationType: 'subject',
        code: 'sub_1',
        includeChildren: false,
        level: undefined
      };
      const testTaxonomy = [];
      taxonomyV4DAOMock
        .expects('getTaxonomyClassifications')
        .once()
        .withArgs(taxonomyMasterFilter)
        .resolves(testTaxonomy);
      taxonomyV4DAOMock.expects('getTaxonomy').never();
      taxonomyV4Service
        .getTaxonomyClassifications(taxonomyMasterFilter)
        .then((taxonomy) => {
          expect(taxonomy).to.be.an('array');
          expect(taxonomy.length).to.equal(0);
          taxonomyV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          taxonomyV4DAOMock.restore();
        });
    });
    it('should return hobs classifications', (done) => {
      const taxonomyV4DAOMock = sinon.mock(taxonomyV4DAO);
      const taxonomyMasterFilter = {
        classificationFamily: 'hobs',
        classificationType: 'subject',
        code: 'sub_1_1',
        includeChildren: false,
        level: undefined
      };
      const testTaxonomy = [
        {
          _id: '1',
          classificationType: 'subject',
          code: 'sub_1_1',
          level: 1,
          name: 'Environment & Agriculture',
          parentId: null
        }
      ];
      taxonomyV4DAOMock
        .expects('getTaxonomyClassifications')
        .once()
        .withArgs(taxonomyMasterFilter)
        .resolves(testTaxonomy);
      taxonomyV4DAOMock.expects('getTaxonomy').never();
      taxonomyV4Service
        .getTaxonomyClassifications(taxonomyMasterFilter)
        .then((taxonomy) => {
          expect(taxonomy).to.be.an('array');
          expect(taxonomy.length).to.equal(1);
          taxonomy.forEach((classification) => {
            expect(classification).to.have.property('code', 'sub_1_1');
            expect(classification).to.have.property(
              'classificationType',
              'subject'
            );
          });
          taxonomyV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          taxonomyV4DAOMock.restore();
        });
    });
  });
});
