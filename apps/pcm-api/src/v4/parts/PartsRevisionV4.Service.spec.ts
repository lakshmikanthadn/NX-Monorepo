import { expect } from 'chai';
import * as sinon from 'sinon';

import { partsRevisionV4DAO } from './PartsRevisionV4.DAO';
import { partsRevisionV4Service } from './PartsRevisionV4.Service';

describe('PartsRevisionV4Service', () => {
  const projections = ['parts._id', 'parts.type', 'parts.position'];
  it('should have all the required methods', () => {
    expect(partsRevisionV4Service).to.respondTo('getHasPartsCount');
    expect(partsRevisionV4Service).to.respondTo('getHasParts');
  });
  let partsRevisionV4DAOMock;
  beforeEach(() => {
    partsRevisionV4DAOMock = sinon.mock(partsRevisionV4DAO);
  });
  describe('getHasPartsCount', () => {
    it('should return total parts count by passing the UUID', (done) => {
      const productVersion = '1.0.0';
      partsRevisionV4DAOMock
        .expects('getHasPartsCount')
        .once()
        .withArgs('some-uuid', productVersion)
        .returns(5);
      partsRevisionV4Service
        .getHasPartsCount('some-uuid', productVersion)
        .then((count) => {
          expect(count).equals(5);
          partsRevisionV4DAOMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          partsRevisionV4DAOMock.restore();
        });
    });
    it('should return total parts count by passing the UUID and part type', (done) => {
      const productVersion = '1.0.0';
      partsRevisionV4DAOMock
        .expects('getHasPartsCount')
        .once()
        .withArgs('some-uuid', productVersion, 'some-type')
        .returns(3);
      partsRevisionV4Service
        .getHasPartsCount('some-uuid', productVersion, 'some-type')
        .then((count) => {
          expect(count).equals(3);
          partsRevisionV4DAOMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          partsRevisionV4DAOMock.restore();
        });
    });
    it(
      'should return total parts count by passing the UUID,' +
        'part type and format type',
      (done) => {
        const productVersion = '1.0.0';
        partsRevisionV4DAOMock
          .expects('getHasPartsCount')
          .once()
          .withArgs('some-uuid', productVersion, 'some-type', 'some-format')
          .returns(1);
        partsRevisionV4Service
          .getHasPartsCount(
            'some-uuid',
            productVersion,
            'some-type',
            'some-format'
          )
          .then((count) => {
            expect(count).equals(1);
            partsRevisionV4DAOMock.verify();
            done();
          })
          .catch((err) => {
            console.log(err);
            done(err);
          })
          .finally(() => {
            partsRevisionV4DAOMock.restore();
          });
      }
    );
  });
  describe('getHasParts', () => {
    it(
      'should return empty list' +
        ' by passing invalid product UUID, offset and limit',
      (done) => {
        const request = {
          limit: 1,
          offset: 0,
          productId: 'invalid-UUID',
          productVersion: '1.0.0'
        };
        partsRevisionV4DAOMock
          .expects('getHasParts')
          .once()
          .withArgs(
            request.productId,
            request.productVersion,
            request.offset,
            request.limit
          )
          .returns([]);
        partsRevisionV4Service
          .getHasParts(
            request.productId,
            request.productVersion,
            request.offset,
            request.limit
          )
          .then((retrivedData) => {
            expect(retrivedData).to.be.an('Array');
            expect(retrivedData.length).to.equal(0);
            partsRevisionV4DAOMock.verify();
            done();
          })
          .catch((err) => {
            console.log('error: ', err);
          })
          .finally(() => {
            partsRevisionV4DAOMock.restore();
          });
      }
    );
    it.skip(
      'should return list of hasparts related to product by passing ' +
        'valid product UUID, offset and limit',
      (done) => {
        const request = {
          limit: 1,
          offset: 0,
          productId: 'some-UUID',
          productVersion: '1.0.0'
        };
        const hasPart = {
          _id: 'some-hasPartId',
          position: 0,
          type: 'some-type'
        };
        const hasParts = [hasPart];
        partsRevisionV4DAOMock
          .expects('getHasParts')
          .once()
          .withArgs(
            request.productId,
            request.productVersion,
            request.offset,
            request.limit,
            projections
          )
          .returns(hasParts);
        partsRevisionV4Service
          .getHasParts(
            request.productId,
            request.productVersion,
            request.offset,
            request.limit
          )
          .then((retrivedData) => {
            expect(retrivedData).to.be.an('Array');
            expect(retrivedData.length).to.equal(1);
            partsRevisionV4DAOMock.verify();
            done();
          })
          .catch((err) => {
            console.log('error: ', err);
          })
          .finally(() => {
            partsRevisionV4DAOMock.restore();
          });
      }
    );
    it.skip(
      'should return list of hasparts related to product by passing ' +
        'valid product UUID, offset, limit & part type',
      (done) => {
        const request = {
          limit: 1,
          offset: 0,
          partType: 'some-type',
          productId: 'some-UUID',
          productVersion: '1.0.0'
        };
        const hasPart = {
          _id: 'some-hasPartId',
          position: 0,
          type: 'some-type'
        };
        const hasParts = [hasPart];
        partsRevisionV4DAOMock
          .expects('getHasParts')
          .once()
          .withArgs(
            request.productId,
            request.productVersion,
            request.offset,
            request.limit,
            projections,
            request.partType
          )
          .returns(hasParts);
        partsRevisionV4Service
          .getHasParts(
            request.productId,
            request.productVersion,
            request.offset,
            request.limit,
            request.partType
          )
          .then((retrivedData) => {
            expect(retrivedData).to.be.an('Array');
            expect(retrivedData.length).to.equal(1);
            partsRevisionV4DAOMock.verify();
            done();
          })
          .catch((err) => {
            console.log('error: ', err);
          })
          .finally(() => {
            partsRevisionV4DAOMock.restore();
          });
      }
    );
    it.skip(
      'should return list of hasparts related to product by passing ' +
        'valid product UUID, offset, limit, part type & format type',
      (done) => {
        const request = {
          format: 'some-media',
          limit: 1,
          offset: 0,
          partType: 'some-type',
          productId: 'some-UUID',
          productVersion: '1.0.0'
        };
        const hasPart = {
          _id: 'some-hasPartId',
          format: 'some-media',
          position: 0,
          type: 'some-type'
        };
        const hasParts = [hasPart];
        partsRevisionV4DAOMock
          .expects('getHasParts')
          .once()
          .withArgs(
            request.productId,
            request.productVersion,
            request.offset,
            request.limit,
            projections,
            request.partType
          )
          .returns(hasParts);
        partsRevisionV4Service
          .getHasParts(
            request.productId,
            request.productVersion,
            request.offset,
            request.limit,
            request.partType,
            request.format
          )
          .then((retrivedData) => {
            expect(retrivedData).to.be.an('Array');
            expect(retrivedData.length).to.equal(1);
            partsRevisionV4DAOMock.verify();
            done();
          })
          .catch((err) => {
            console.log('error: ', err);
          })
          .finally(() => {
            partsRevisionV4DAOMock.restore();
          });
      }
    );
  });
});
