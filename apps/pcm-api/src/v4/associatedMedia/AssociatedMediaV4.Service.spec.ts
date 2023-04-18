import { StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import { expect } from 'chai';
import * as sinon from 'sinon';

import { associatedMediaTestData } from '../test/data/AssociatedMediaV4';
import { associatedMediaV4Dao } from './AssociatedMediaV4.DAO';
import { associatedMediaV4Service } from './AssociatedMediaV4.Service';

function getStubData() {
  const associatedMediaV4DaoMock = sinon.mock(associatedMediaV4Dao);
  return {
    associatedMediaV4DaoMock
  };
}

describe('AssociatedMediaV4.Service', () => {
  it('should have all the methods', () => {
    expect(associatedMediaV4Service).to.respondTo(
      'getContentMetaDataByParentid'
    );
    expect(associatedMediaV4Service).to.respondTo('getAsstMediasByParentIds');
    expect(associatedMediaV4Service).to.respondTo(
      'getAsstMediaByParentIdAndFilename'
    );
    expect(associatedMediaV4Service).to.respondTo('createAssociatedMedia');
  });

  describe('getContentMetaDataByParentid', () => {
    it('should return all the associatdMedia of the product when parentId is valid', (done) => {
      const stubData = getStubData();
      const parentId = '6798f38a-bd4b-4b68-a5ab-c79f39513932';
      const associatedMediaTestDataCopy = JSON.parse(
        JSON.stringify(associatedMediaTestData)
      );
      stubData.associatedMediaV4DaoMock
        .expects('getAssociatedMediaByParentId')
        .once()
        .withArgs(parentId, ['location', 'type', 'size', '_id', 'versionType'])
        .resolves(
          associatedMediaTestDataCopy.filter(
            (asstmedia) => asstmedia.parentId === parentId
          )
        );
      associatedMediaV4Service
        .getContentMetaDataByParentid(parentId)
        .then((contentMeta) => {
          expect(contentMeta).to.be.an('array');
          contentMeta.forEach((cMeta) => {
            expect(cMeta).to.have.property('type');
            expect(cMeta).to.have.property('_id');
            expect(cMeta).to.have.property('size');
            expect(cMeta).to.have.property('location');
          });
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          stubData.associatedMediaV4DaoMock.restore();
        });
    });
    it('should return associatdMedia with valid location when includeLocationForAll = true', (done) => {
      const stubData = getStubData();
      const includeLocationForAll = true;
      const associatedMediaTestDataCopy = JSON.parse(
        JSON.stringify(associatedMediaTestData)
      );
      const parentId = '6798f38a-bd4b-4b68-a5ab-c79f39513932';
      stubData.associatedMediaV4DaoMock
        .expects('getAssociatedMediaByParentId')
        .once()
        .withArgs(parentId, ['location', 'type', 'size', '_id', 'versionType'])
        .resolves(
          associatedMediaTestDataCopy.filter(
            (asstmedia) => asstmedia.parentId === parentId
          )
        );
      associatedMediaV4Service
        .getContentMetaDataByParentid(parentId, includeLocationForAll)
        .then((contentMeta) => {
          expect(contentMeta).to.be.an('array');
          contentMeta.forEach((cMeta) => {
            expect(cMeta).to.have.property('location');
            // tslint:disable-next-line: no-unused-expression
            expect(cMeta.location).to.be.not.null;
          });
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          stubData.associatedMediaV4DaoMock.restore();
        });
    });
    it('should return valid location only for coverimage when includeLocationForAll = false', (done) => {
      const stubData = getStubData();
      const includeLocationForAll = false;
      const associatedMediaTestDataCopy = JSON.parse(
        JSON.stringify(associatedMediaTestData)
      );
      const parentId = '6798f38a-bd4b-4b68-a5ab-c79f39513932';
      stubData.associatedMediaV4DaoMock
        .expects('getAssociatedMediaByParentId')
        .once()
        .withArgs(parentId, ['location', 'type', 'size', '_id', 'versionType'])
        .resolves(
          associatedMediaTestDataCopy.filter(
            (asstmedia) => asstmedia.parentId === parentId
          )
        );
      associatedMediaV4Service
        .getContentMetaDataByParentid(parentId, includeLocationForAll)
        .then((contentMeta) => {
          expect(contentMeta).to.be.an('array');
          contentMeta.forEach((cMeta) => {
            expect(cMeta).to.have.property('location');
            if (cMeta.type === 'coverimage') {
              // tslint:disable-next-line: no-unused-expression
              expect(cMeta.location).to.be.not.null;
            } else {
              // tslint:disable-next-line: no-unused-expression
              expect(cMeta.location).to.be.null;
            }
          });
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          stubData.associatedMediaV4DaoMock.restore();
        });
    });
    it('should return valid location only for coverimage & banner image when includeLocationForAll = false', (done) => {
      const stubData = getStubData();
      const includeLocationForAll = false;
      const associatedMediaTestDataCopy = JSON.parse(
        JSON.stringify(associatedMediaTestData)
      );
      const parentId = 'some-collection-id';
      stubData.associatedMediaV4DaoMock
        .expects('getAssociatedMediaByParentId')
        .once()
        .withArgs(parentId, ['location', 'type', 'size', '_id', 'versionType'])
        .resolves(
          associatedMediaTestDataCopy.filter(
            (asstmedia) => asstmedia.parentId === parentId
          )
        );
      associatedMediaV4Service
        .getContentMetaDataByParentid(parentId, includeLocationForAll)
        .then((contentMeta) => {
          expect(contentMeta).to.be.an('array');
          expect(contentMeta.length).to.be.eqls(2);
          const mediaTypes = contentMeta.map((c) => c.type);
          expect(mediaTypes).to.include.members(['coverimage', 'bannerimage']);
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          stubData.associatedMediaV4DaoMock.restore();
        });
    });
  });
  describe('getAsstMediasByParentIds', () => {
    it('should return all the associatdMedia of the product when parentIds are valid', (done) => {
      const stubData = getStubData();
      const associatedMediaTestDataCopy = JSON.parse(
        JSON.stringify(associatedMediaTestData)
      );
      const parentIds = ['6798f38a-bd4b-4b68-a5ab-c79f39513932'];
      parentIds.forEach((parentId) => {
        associatedMediaTestDataCopy.filter(
          (asstmedia) => asstmedia.parentId === parentId
        );
      });
      stubData.associatedMediaV4DaoMock
        .expects('getAsstMediasByParentIds')
        .once()
        .withArgs(parentIds, [
          'location',
          'type',
          'size',
          '_id',
          'parentId',
          'versionType'
        ])
        .resolves(associatedMediaTestDataCopy);
      associatedMediaV4Service
        .getAsstMediasByParentIds(parentIds)
        .then((contentMeta) => {
          expect(contentMeta).to.be.an('array');
          contentMeta.forEach((cMeta) => {
            expect(cMeta).to.have.property('type');
            expect(cMeta).to.have.property('_id');
            expect(cMeta).to.have.property('size');
            expect(cMeta).to.have.property('location');
            expect(cMeta).to.have.property('parentId');
          });
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          stubData.associatedMediaV4DaoMock.restore();
        });
    });
    it('should return associatdMedia with valid location when includeLocationForAll = true', (done) => {
      const stubData = getStubData();
      const includeLocationForAll = true;
      const associatedMediaTestDataCopy = JSON.parse(
        JSON.stringify(associatedMediaTestData)
      );
      const parentIds = ['6798f38a-bd4b-4b68-a5ab-c79f39513932'];
      parentIds.forEach((parentId) => {
        associatedMediaTestDataCopy.filter(
          (asstmedia) => asstmedia.parentId === parentId
        );
      });
      stubData.associatedMediaV4DaoMock
        .expects('getAsstMediasByParentIds')
        .once()
        .withArgs(parentIds, [
          'location',
          'type',
          'size',
          '_id',
          'parentId',
          'versionType'
        ])
        .resolves(associatedMediaTestDataCopy);
      associatedMediaV4Service
        .getAsstMediasByParentIds(parentIds, includeLocationForAll)
        .then((contentMeta) => {
          expect(contentMeta).to.be.an('array');
          contentMeta.forEach((cMeta) => {
            expect(cMeta).to.have.property('location');
            // tslint:disable-next-line: no-unused-expression
            expect(cMeta.location).to.be.not.null;
          });
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          stubData.associatedMediaV4DaoMock.restore();
        });
    });
    it('should return valid location only for coverimage when includeLocationForAll = false', (done) => {
      const stubData = getStubData();
      const includeLocationForAll = false;
      const associatedMediaTestDataCopy = JSON.parse(
        JSON.stringify(associatedMediaTestData)
      );
      const parentId = '6798f38a-bd4b-4b68-a5ab-c79f39513932';
      stubData.associatedMediaV4DaoMock
        .expects('getAsstMediasByParentIds')
        .once()
        .withArgs(
          [parentId],
          ['location', 'type', 'size', '_id', 'parentId', 'versionType']
        )
        .resolves(
          associatedMediaTestDataCopy.filter(
            (asstmedia) => asstmedia.parentId === parentId
          )
        );
      associatedMediaV4Service
        .getAsstMediasByParentIds([parentId], includeLocationForAll)
        .then((contentMeta) => {
          expect(contentMeta).to.be.an('array');
          contentMeta.forEach((cMeta) => {
            expect(cMeta).to.have.property('location');
            if (cMeta.type === 'coverimage') {
              // tslint:disable-next-line: no-unused-expression
              expect(cMeta.location).to.be.not.null;
            } else {
              // tslint:disable-next-line: no-unused-expression
              expect(cMeta.location).to.be.null;
            }
          });
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          stubData.associatedMediaV4DaoMock.restore();
        });
    });
  });
  describe('getAsstMediaByParentIdAndFilename', () => {
    it('should return associatdMedia of the product when parentId and filename is valid', (done) => {
      const stubData = getStubData();
      const parentId = '47b1dbf8-30ea-4d13-8d12-00d883d82754';
      const fileName =
        'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/creativework/47b1dbf8-30ea-4d13-8d12-00d883d82754/content.pdf';
      const associatedMediaTestDataCopy = JSON.parse(
        JSON.stringify(associatedMediaTestData)
      );
      stubData.associatedMediaV4DaoMock
        .expects('getByParentIdAndLocation')
        .once()
        .withArgs(parentId, fileName, ['_id'])
        .resolves(
          associatedMediaTestDataCopy.find(
            (asstmedia) =>
              asstmedia.parentId === parentId && asstmedia.location === fileName
          )
        );
      associatedMediaV4Service
        .getAsstMediaByParentIdAndFilename(parentId, fileName)
        .then((contentMeta) => {
          expect(contentMeta).to.be.an('object');
          expect(contentMeta).to.have.property('type');
          expect(contentMeta).to.have.property('_id');
          expect(contentMeta).to.have.property('size');
          expect(contentMeta).to.have.property('location');
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          stubData.associatedMediaV4DaoMock.restore();
        });
    });
  });
  describe('createAssociatedMedia', () => {
    it('should return Saved successfully when a valid associatedMedia is created', (done) => {
      const stubData = getStubData();
      const content: StorageModel.AssociatedMedia = {
        _id: '1234-1234-1234-1234',
        location: 'content.pdf',
        parentId: '6c9f9801-3519-425d-be31-8829cae4bac2',
        parentType: 'creativeWork',
        size: 1234,
        type: 'portableDocument',
        versionType: 'FINAL'
      };
      stubData.associatedMediaV4DaoMock
        .expects('createAssociatedMedia')
        .once()
        .withArgs(content)
        .resolves(content);
      associatedMediaV4Service
        .createAssociatedMedia(content)
        .then((contentMeta) => {
          expect(contentMeta).to.be.an('object');
          expect(contentMeta).to.have.property('_id', content._id);
          expect(contentMeta).to.have.property('location', content.location);
          expect(contentMeta).to.have.property('type', content.type);
          expect(contentMeta).to.have.property('size', content.size);
          expect(contentMeta).to.have.property('parentId', content.parentId);
          expect(contentMeta).to.have.property(
            'parentType',
            content.parentType
          );
          expect(contentMeta).to.have.property(
            'versionType',
            content.versionType
          );
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          stubData.associatedMediaV4DaoMock.restore();
        });
    });
  });
});
