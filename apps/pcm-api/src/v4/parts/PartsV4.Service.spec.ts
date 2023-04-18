import { StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import { expect } from 'chai';
import * as sinon from 'sinon';

import { assetV4Service } from '../assets/AssetV4.Service';
import { apiResponseGroupConfig } from '../config';
import { creativeWorkV4Service } from '../creativeWork/CreativeWorkV4.Service';
import { APIResponseGroup } from '../model/interfaces/CustomDataTypes';
import { IProductFilterOptions } from '../model/interfaces/ProductFilterOptions';
import { productV4DAO } from '../products/ProductV4.DAO';
import { partsRevisionV4Service } from './PartsRevisionV4.Service';
import { partsV410DAO } from '../../v410/parts/Parts.V410.DAO';

import { partsV4DAO } from './PartsV4.DAO';
import { partsV4Service } from './PartsV4.Service';

describe('PartsV4Service', () => {
  const projections = [
    'parts._id',
    'parts.type',
    'parts.position',
    'parts.isFree'
  ];
  it('should have all the required methods', () => {
    expect(partsV4Service).to.respondTo('getHasPartsCount');
    expect(partsV4Service).to.respondTo('getHasParts');
    expect(partsV4Service).to.respondTo('isAccessibleForFree');
    expect(partsV4Service).to.respondTo('getProductHasParts');
  });
  let partsV4DAOMock;
  let partsV410DAOMock;
  beforeEach(() => {
    partsV4DAOMock = sinon.mock(partsV4DAO);
    partsV410DAOMock = sinon.mock(partsV410DAO);
  });
  describe('getHasPartsCount', () => {
    it('should return total parts count by passing the UUID', (done) => {
      partsV4DAOMock
        .expects('getHasPartsCount')
        .once()
        .withArgs('some-uuid')
        .returns(5);
      partsV4Service
        .getHasPartsCount('some-uuid')
        .then((count) => {
          expect(count).equals(5);
          partsV4DAOMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          partsV4DAOMock.restore();
        });
    });
    it('should return total parts count by passing the UUID and part type', (done) => {
      partsV4DAOMock
        .expects('getHasPartsCount')
        .once()
        .withArgs('some-uuid', 'some-type')
        .returns(3);
      partsV4Service
        .getHasPartsCount('some-uuid', 'some-type')
        .then((count) => {
          expect(count).equals(3);
          partsV4DAOMock.verify();
          done();
        })
        .catch((err) => {
          console.log(err);
          done(err);
        })
        .finally(() => {
          partsV4DAOMock.restore();
        });
    });
    it(
      'should return total parts count by passing the UUID,' +
        'part type and format type',
      (done) => {
        partsV4DAOMock
          .expects('getHasPartsCount')
          .once()
          .withArgs('some-uuid', 'some-type', 'some-format')
          .returns(1);
        partsV4Service
          .getHasPartsCount('some-uuid', 'some-type', 'some-format')
          .then((count) => {
            expect(count).equals(1);
            partsV4DAOMock.verify();
            done();
          })
          .catch((err) => {
            console.log(err);
            done(err);
          })
          .finally(() => {
            partsV4DAOMock.restore();
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
          productId: 'invalid-UUID'
        };
        partsV4DAOMock
          .expects('getHasParts')
          .once()
          .withArgs(request.productId, request.offset, request.limit)
          .returns([]);
        partsV4Service
          .getHasParts(request.productId, request.offset, request.limit)
          .then((retrivedData) => {
            expect(retrivedData).to.be.an('Array');
            expect(retrivedData.length).to.equal(0);
            partsV4DAOMock.verify();
            done();
          })
          .catch((err) => {
            console.log('error: ', err);
          })
          .finally(() => {
            partsV4DAOMock.restore();
          });
      }
    );
    it(
      'should return list of hasparts related to product by passing ' +
        'valid product UUID, offset and limit',
      (done) => {
        const request = {
          limit: 1,
          offset: 0,
          productId: 'some-UUID'
        };
        const hasPart = {
          _id: 'some-hasPartId',
          isFree: false,
          position: 0,
          type: 'some-type'
        };
        const hasParts = [hasPart];
        partsV4DAOMock
          .expects('getHasParts')
          .once()
          .withArgs(
            request.productId,
            request.offset,
            request.limit,
            projections
          )
          .returns(hasParts);
        partsV4Service
          .getHasParts(request.productId, request.offset, request.limit)
          .then((retrivedData) => {
            expect(retrivedData).to.be.an('Array');
            expect(retrivedData.length).to.equal(1);
            partsV4DAOMock.verify();
            done();
          })
          .catch((err) => {
            console.log('error: ', err);
          })
          .finally(() => {
            partsV4DAOMock.restore();
          });
      }
    );
    it(
      'should return list of hasparts related to product by passing ' +
        'valid product UUID, offset, limit & part type',
      (done) => {
        const request = {
          limit: 1,
          offset: 0,
          partType: 'some-type',
          productId: 'some-UUID'
        };
        const hasPart = {
          _id: 'some-hasPartId',
          isFree: false,
          position: 0,
          type: 'some-type'
        };
        const hasParts = [hasPart];
        partsV4DAOMock
          .expects('getHasParts')
          .once()
          .withArgs(
            request.productId,
            request.offset,
            request.limit,
            projections,
            request.partType
          )
          .returns(hasParts);
        partsV4Service
          .getHasParts(
            request.productId,
            request.offset,
            request.limit,
            request.partType
          )
          .then((retrivedData) => {
            expect(retrivedData).to.be.an('Array');
            expect(retrivedData.length).to.equal(1);
            partsV4DAOMock.verify();
            done();
          })
          .catch((err) => {
            console.log('error: ', err);
          })
          .finally(() => {
            partsV4DAOMock.restore();
          });
      }
    );
    it(
      'should return list of hasparts related to product by passing ' +
        'valid product UUID, offset, limit, part type & format type',
      (done) => {
        const request = {
          format: 'some-media',
          limit: 1,
          offset: 0,
          partType: 'some-type',
          productId: 'some-UUID'
        };
        const hasPart = {
          _id: 'some-hasPartId',
          format: 'some-media',
          isFree: false,
          position: 0,
          type: 'some-type'
        };
        const hasParts = [hasPart];
        partsV4DAOMock
          .expects('getHasParts')
          .once()
          .withArgs(
            request.productId,
            request.offset,
            request.limit,
            projections,
            request.partType
          )
          .returns(hasParts);
        partsV4Service
          .getHasParts(
            request.productId,
            request.offset,
            request.limit,
            request.partType,
            request.format
          )
          .then((retrivedData) => {
            expect(retrivedData).to.be.an('Array');
            expect(retrivedData.length).to.equal(1);
            partsV4DAOMock.verify();
            done();
          })
          .catch((err) => {
            console.log('error: ', err);
          })
          .finally(() => {
            partsV4DAOMock.restore();
          });
      }
    );
  });
  describe('getHasPart', () => {
    it(
      'should return empty list' +
        ' by passing invalid product UUID and partId',
      (done) => {
        const request = {
          partId: 'some-id',
          productId: 'invalid-UUID',
          responseGroup: 'small' as APIResponseGroup
        };
        partsV4DAOMock
          .expects('getHasPart')
          .once()
          .withArgs(request.productId, request.partId)
          .returns({});
        partsV4Service
          .getHasPart(request.productId, request.partId)
          .then((retrivedData) => {
            expect(retrivedData).to.deep.equal({});
            partsV4DAOMock.verify();
            done();
          })
          .catch((err) => {
            console.log('error: ', err);
          })
          .finally(() => {
            partsV4DAOMock.restore();
          });
      }
    );
    it(
      'should return list of hasparts related to product by passing ' +
        'valid product UUID and partId',
      (done) => {
        const request = {
          partId: 'some-id',
          productId: 'valid-UUID'
        };
        const hasPart = {
          _id: 'some-id',
          isFree: false,
          level: null,
          pageEnd: null,
          pageStart: null,
          parentId: null,
          position: 0,
          title: null,
          type: 'some-type',
          version: null
        };
        partsV4DAOMock
          .expects('getHasPart')
          .once()
          .withArgs(request.productId, request.partId)
          .returns(hasPart);
        partsV4Service
          .getHasPart(request.productId, request.partId)
          .then((retrivedData) => {
            expect(retrivedData._id).to.equal(request.partId);
            partsV4DAOMock.verify();
            done();
          })
          .catch((err) => {
            console.log('error: ', err);
          })
          .finally(() => {
            partsV4DAOMock.restore();
          });
      }
    );
  });
  describe('isAccessibleForFree', () => {
    it(`should return false when product UUID and parentId both are invalid`, (done) => {
      const request = {
        parentId: 'invalid-parentID',
        productId: 'invalid-UUID'
      };
      partsV4DAOMock
        .expects('getHasPart')
        .once()
        .withArgs(request.parentId, request.productId)
        .resolves(null);
      partsV4Service
        .isAccessibleForFree(request.parentId, request.productId)
        .then((retrivedData) => {
          expect(retrivedData).to.equal(false);
          partsV4DAOMock.verify();
          done();
        })
        .catch((err) => {
          console.log('error: ', err);
        })
        .finally(() => {
          partsV4DAOMock.restore();
        });
    });
    it(`should return false when product UUID is valid but parentId is invalid`, (done) => {
      const request = {
        parentId: 'invalid-parentID',
        productId: 'valid-UUID'
      };
      partsV4DAOMock
        .expects('getHasPart')
        .once()
        .withArgs(request.parentId, request.productId)
        .resolves(null);
      partsV4Service
        .isAccessibleForFree(request.parentId, request.productId)
        .then((retrivedData) => {
          expect(retrivedData).to.equal(false);
          partsV4DAOMock.verify();
          done();
        })
        .catch((err) => {
          console.log('error: ', err);
        })
        .finally(() => {
          partsV4DAOMock.restore();
        });
    });
    it(`should return false when parentId is valid but product UUID is invalid`, (done) => {
      const request = {
        parentId: 'valid-parentID',
        productId: 'invalid-UUID'
      };
      partsV4DAOMock
        .expects('getHasPart')
        .once()
        .withArgs(request.parentId, request.productId)
        .resolves(null);
      partsV4Service
        .isAccessibleForFree(request.parentId, request.productId)
        .then((retrivedData) => {
          expect(retrivedData).to.equal(false);
          partsV4DAOMock.verify();
          done();
        })
        .catch((err) => {
          console.log('error: ', err);
        })
        .finally(() => {
          partsV4DAOMock.restore();
        });
    });
    it(`should return true when parentId and product UUID both are valid`, (done) => {
      const request = {
        parentId: 'valid-parentID',
        productId: 'valid-productId'
      };
      const hasPart: StorageModel.HasPart = {
        _id: 'valid-partId',
        isFree: true
      } as StorageModel.HasPart;
      partsV4DAOMock
        .expects('getHasPart')
        .once()
        .withArgs(request.parentId, request.productId)
        .resolves(hasPart);
      partsV4Service
        .isAccessibleForFree(request.parentId, request.productId)
        .then((retrivedData) => {
          expect(retrivedData).to.equal(true);
          partsV4DAOMock.verify();
          done();
        })
        .catch((err) => {
          console.log('error: ', err);
        })
        .finally(() => {
          partsV4DAOMock.restore();
        });
    });
  });
  describe('getSearchResults', () => {
    it(`should return searchData when partsdata is passed`, (done) => {
      const responseData = {
        partsAdded: [{ _id: '1', type: 'book' }],
        partsRemoved: [{ _id: '1', type: 'book' }],
        partsUpdated: [{ _id: '1', type: 'book' }]
      };
      const responseGroup = 'small';
      partsV410DAOMock
        .expects('getPartsDataByRegion')
        .once()
        .withArgs({
          ids: ['1'],
          limit: 1,
          partTypeToIndex: 'books-dev-searching-alias',
          projections: ['_id', 'type', 'identifiers.doi', 'identifiers.isbn'],
          region: undefined
        })
        .resolves([
          {
            _id: '1',
            _source: {
              identifiers: {
                doi: '123',
                isbn: '456'
              },
              type: 'book'
            }
          }
        ]);
      partsV4Service
        .getSearchResults(responseData.partsAdded, { responseGroup })
        .then((retrivedData) => {
          expect(retrivedData).to.deep.equal(undefined);
          partsV410DAOMock.verify();
          done();
        })
        .catch((err) => {
          console.log('error: ', err);
          done(err);
        })
        .finally(() => {
          partsV410DAOMock.restore();
        });
    });
    it(`should return searchData when partsdata is passed`, (done) => {
      const responseData = {
        partsAdded: [{ _id: '1', type: 'book' }],
        partsRemoved: [{ _id: '1', type: 'book' }],
        partsUpdated: [{ _id: '1', type: 'book' }]
      };
      partsV410DAOMock
        .expects('getPartsDataByRegion')
        .once()
        .withArgs({
          ids: ['1'],
          limit: 1,
          partTypeToIndex: 'books-dev-searching-alias',
          projections: ['_id', 'type', 'identifiers.doi', 'identifiers.isbn'],
          region: undefined
        })
        .resolves([
          {
            _id: '1',
            _source: {
              identifiers: {
                doi: '123',
                isbn: '456'
              },
              type: 'book'
            }
          }
        ]);
      partsV4Service
        .getSearchResults(responseData.partsAdded)
        .then((retrivedData) => {
          expect(retrivedData).to.deep.equal(undefined);
          done();
        })
        .catch((err) => {
          console.log('error: ', err);
          done(err);
        })
        .finally(() => {
          partsV410DAOMock.restore();
        });
    });
  });
  describe('getProductHasParts', () => {
    let assetV4ServiceMock;
    let partsV4ServiceMock;
    let partsRevisionV4ServiceMock;
    let productV4DAOMock;
    let apiResponseGroupConfigMock;
    let creativeWorkV4ServiceMock;
    let productFilterOptions: IProductFilterOptions;
    beforeEach(() => {
      assetV4ServiceMock = sinon.mock(assetV4Service);
      partsV4ServiceMock = sinon.mock(partsV4Service);
      partsRevisionV4ServiceMock = sinon.mock(partsRevisionV4Service);
      productV4DAOMock = sinon.mock(productV4DAO);
      apiResponseGroupConfigMock = sinon.mock(apiResponseGroupConfig);
      creativeWorkV4ServiceMock = sinon.mock(creativeWorkV4Service);
      productFilterOptions = {};
    });
    it('should throw Product (asset) not found. when productId is invalid', (done) => {
      const id = 'invalid-uuid';
      assetV4ServiceMock
        .expects('getValidAssetByIdentifierNameValue')
        .once()
        .withArgs('_id', id)
        .returns({ _id: null });
      partsV4ServiceMock.expects('getHasPartsCount').never();
      partsV4ServiceMock.expects('getHasParts').never();
      partsV4Service
        .getProductHasParts(id, '_id', 0, 1, false)
        .then((err) => {
          done(
            new Error('Expecting Product (asset) not found. but got success')
          );
        })
        .catch((err) => {
          expect(err.message).to.equal('Product (asset) not found.');
          expect(err.code).to.equal(404);
          assetV4ServiceMock.verify();
          partsV4ServiceMock.verify();
          done();
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          partsV4ServiceMock.restore();
        });
    });
    it('should throw Product (asset) not found. when productId is empty string', (done) => {
      const id = '';
      assetV4ServiceMock
        .expects('getValidAssetByIdentifierNameValue')
        .once()
        .withArgs('_id', id)
        .returns({ _id: null });
      partsV4ServiceMock.expects('getHasPartsCount').never();
      partsV4ServiceMock.expects('getHasParts').never();
      partsV4Service
        .getProductHasParts(id, '_id', 0, 1, false)
        .then((err) => {
          done(
            new Error('Expecting Product (asset) not found. but got success')
          );
        })
        .catch((err) => {
          expect(err.message).to.equal('Product (asset) not found.');
          expect(err.code).to.equal(404);
          assetV4ServiceMock.verify();
          partsV4ServiceMock.verify();
          done();
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          partsV4ServiceMock.restore();
        });
    });
    it('should throw Product parts not found. when parts not found', (done) => {
      const id = 'product-uuid';
      assetV4ServiceMock
        .expects('getValidAssetByIdentifierNameValue')
        .once()
        .withArgs('_id', id)
        .returns({ _id: id, type: 'collection' });
      partsV4ServiceMock
        .expects('getHasPartsCount')
        .once()
        .withArgs(id)
        .returns(0);
      partsV4ServiceMock
        .expects('getHasParts')
        .once()
        .withArgs(id, 0, 1)
        .returns([]);
      partsV4Service
        .getProductHasParts(id, '_id', 0, 1, false)
        .then(() => {
          done(new Error('Expecting Product parts not found. but got success'));
        })
        .catch((err) => {
          expect(err.message).to.equal('Product parts not found.');
          expect(err.code).to.equal(404);
          assetV4ServiceMock.verify();
          partsV4ServiceMock.verify();
          done();
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          partsV4ServiceMock.restore();
        });
    });
    it(
      'should throw Offset value is more than the total parts.' +
        'when parts not found',
      (done) => {
        const id = 'product-uuid';
        assetV4ServiceMock
          .expects('getValidAssetByIdentifierNameValue')
          .once()
          .withArgs('_id', id)
          .returns({ _id: id, type: 'collection' });
        partsV4ServiceMock
          .expects('getHasPartsCount')
          .once()
          .withArgs(id)
          .returns(2);
        partsV4ServiceMock
          .expects('getHasParts')
          .once()
          .withArgs(id, 3, 1)
          .returns([]);
        partsV4Service
          .getProductHasParts(id, '_id', 3, 1, false)
          .then((err) => {
            done(
              new Error(
                'Expecting Offset value is more than the total parts. but got success'
              )
            );
          })
          .catch((err) => {
            expect(err.message).to.equal(
              'Offset value is more than the total parts. totalCount: 2'
            );
            expect(err.code).to.equal(400);
            assetV4ServiceMock.verify();
            partsV4ServiceMock.verify();
            done();
          })
          .finally(() => {
            assetV4ServiceMock.restore();
            partsV4ServiceMock.restore();
          });
      }
    );
    it('should return list of parts when valid productId, offset & limit passed', (done) => {
      const request = {
        id: 'valid-UUID',
        limit: 1,
        offset: 0
      };
      assetV4ServiceMock
        .expects('getValidAssetByIdentifierNameValue')
        .once()
        .withArgs('_id', request.id)
        .returns({ _id: 'valid-UUID', type: 'collection' });
      partsV4ServiceMock
        .expects('getHasPartsCount')
        .once()
        .withArgs(request.id)
        .returns(5);
      const parts = {
        _id: 'partId',
        position: 0,
        type: 'chapter'
      };
      partsV4ServiceMock
        .expects('getHasParts')
        .once()
        .withArgs(request.id, 0, 1)
        .returns([parts]);
      partsV4Service
        .getProductHasParts(
          request.id,
          '_id',
          request.offset,
          request.limit,
          false
        )
        .then((retrivedData) => {
          expect(retrivedData).to.be.an('Array');
          expect(retrivedData.length).to.equal(1);
          expect(retrivedData[0]._id).to.equal('partId');
          assetV4ServiceMock.verify();
          partsV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          partsV4ServiceMock.restore();
        });
    });
    it('should return response contains partsCount and partsList when valid productId, offset & limit passed and apiVersion=4.0.2', (done) => {
      const request = {
        id: 'valid-UUID',
        limit: 1,
        offset: 0
      };
      assetV4ServiceMock
        .expects('getValidAssetByIdentifierNameValue')
        .once()
        .withArgs('_id', request.id)
        .returns({ _id: 'valid-UUID', type: 'collection' });
      partsV4ServiceMock
        .expects('getHasPartsCount')
        .once()
        .withArgs(request.id)
        .returns(5);
      const parts = {
        _id: 'partId',
        position: 0,
        type: 'chapter'
      };
      partsV4ServiceMock
        .expects('getHasParts')
        .once()
        .withArgs(request.id, 0, 1)
        .returns([parts]);
      partsV4DAOMock
        .expects('getAllPartsCount')
        .once()
        .withArgs(request.id)
        .returns([
          {
            count: 3,
            type: 'chapter'
          },
          {
            count: 2,
            type: 'other-type'
          }
        ]);
      partsV4Service
        .getProductHasParts(
          request.id,
          '_id',
          request.offset,
          request.limit,
          true,
          undefined,
          undefined,
          'small',
          undefined,
          true
        )
        .then((retrivedData) => {
          expect(retrivedData).to.be.an('object');
          expect(retrivedData.metadata.counts).to.be.an('Array');
          expect(retrivedData.metadata.counts.length).to.equal(3);
          expect(
            retrivedData.metadata.counts.find(
              (partCount) => partCount.type === 'total'
            ).count
          ).to.equal(5);
          expect(retrivedData.data).to.be.an('Array');
          expect(retrivedData.data.length).to.equal(1);
          assetV4ServiceMock.verify();
          partsV4ServiceMock.verify();
          partsV4DAOMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          partsV4ServiceMock.restore();
          partsV4DAOMock.restore();
        });
    });
    it(`should return response contains partsCount and partsList when valid productId, offset &
     limit passed and apiVersion=4.0.2 and depth as 2`, (done) => {
      const request = {
        depth: 2,
        id: 'valid-UUID',
        limit: 1,
        offset: 0
      };
      assetV4ServiceMock
        .expects('getValidAssetByIdentifierNameValue')
        .once()
        .withArgs('_id', request.id)
        .returns({ _id: 'valid-UUID', type: 'collection' });
      partsV4ServiceMock
        .expects('getHasPartsCount')
        .once()
        .withArgs(request.id)
        .returns(5);
      const parts = {
        _id: 'childPartId',
        position: 0,
        type: 'book'
      };
      partsV4ServiceMock
        .expects('getHasParts')
        .once()
        .withArgs(request.id, 0, 1)
        .returns([parts]);
      const childParts = {
        _id: 'grandChildPartId',
        position: 0,
        type: 'chapter'
      };
      partsV4ServiceMock
        .expects('getHasParts')
        .once()
        .withArgs(parts._id, 0, null)
        .returns([childParts]);
      partsV4DAOMock
        .expects('getAllPartsCount')
        .once()
        .withArgs(request.id)
        .returns([
          {
            count: 3,
            formatsCount: [],
            type: 'chapter'
          },
          {
            count: 2,
            formatsCount: [],
            type: 'other-type'
          }
        ]);
      partsV4Service
        .getProductHasParts(
          request.id,
          '_id',
          request.offset,
          request.limit,
          true,
          undefined,
          undefined,
          'small',
          undefined,
          true,
          request.depth
        )
        .then((retrivedData) => {
          expect(retrivedData).to.be.an('object');
          expect(retrivedData.metadata.counts).to.be.an('Array');
          expect(retrivedData.metadata.counts.length).to.equal(3);
          expect(
            retrivedData.metadata.counts.find(
              (partCount) => partCount.type === 'total'
            ).count
          ).to.equal(5);
          expect(retrivedData.data).to.be.an('Array');
          retrivedData.data.forEach((data) => {
            expect(data).to.be.an('object');
            expect(data).to.have.property('_id');
            expect(data).to.have.property('position');
            expect(data).to.have.property('hasParts');
            expect(data.hasParts).to.be.an('Array');
          });
          assetV4ServiceMock.verify();
          partsV4ServiceMock.verify();
          partsV4DAOMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          partsV4ServiceMock.restore();
          partsV4DAOMock.restore();
        });
    });
    it(`should return response contains partsCount as null and partsList when valid productId, offset &
     limit passed and apiVersion=4.0.2 and depth as 2`, (done) => {
      const request = {
        depth: 2,
        id: 'valid-UUID',
        limit: 1,
        offset: 0
      };
      assetV4ServiceMock
        .expects('getValidAssetByIdentifierNameValue')
        .once()
        .withArgs('_id', request.id)
        .returns({ _id: 'valid-UUID', type: 'collection' });
      partsV4ServiceMock
        .expects('getHasPartsCount')
        .once()
        .withArgs(request.id)
        .returns(5);
      const parts = {
        _id: 'childPartId',
        position: 0,
        type: 'book'
      };
      partsV4ServiceMock
        .expects('getHasParts')
        .once()
        .withArgs(request.id, 0, 1)
        .returns([parts]);
      const childParts = {
        _id: 'grandChildPartId',
        position: 0,
        type: 'chapter'
      };
      partsV4ServiceMock
        .expects('getHasParts')
        .once()
        .withArgs(parts._id, 0, null)
        .returns([childParts]);
      partsV4DAOMock
        .expects('getAllPartsCount')
        .once()
        .withArgs(request.id)
        .returns({
          _id: request.id
        });
      partsV4Service
        .getProductHasParts(
          request.id,
          '_id',
          request.offset,
          request.limit,
          true,
          undefined,
          undefined,
          'small',
          undefined,
          true,
          request.depth
        )
        .then((retrivedData) => {
          expect(retrivedData).to.be.an('object');
          expect(retrivedData).to.have.property('metadata');
          expect(retrivedData.metadata).to.be.empty;
          expect(retrivedData.data).to.be.an('Array');
          retrivedData.data.forEach((data) => {
            expect(data).to.be.an('object');
            expect(data).to.have.property('_id');
            expect(data).to.have.property('position');
            expect(data).to.have.property('hasParts');
            expect(data.hasParts).to.be.an('Array');
          });
          assetV4ServiceMock.verify();
          partsV4ServiceMock.verify();
          partsV4DAOMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          partsV4ServiceMock.restore();
          partsV4DAOMock.restore();
        });
    });
    it(
      'should return list of parts when passing productId, offset, limit & ' +
        'responseGroup as medium',
      (done) => {
        const request = {
          id: 'valid-UUID',
          limit: 1,
          offset: 0
        };
        assetV4ServiceMock
          .expects('getValidAssetByIdentifierNameValue')
          .once()
          .withArgs('_id', request.id)
          .returns({ _id: 'valid-UUID', type: 'collection' });
        partsV4ServiceMock
          .expects('getHasPartsCount')
          .once()
          .withArgs(request.id)
          .returns(5);
        const parts = {
          _id: 'partId',
          position: 0,
          type: 'chapter'
        };
        const products = [
          {
            _id: 'partId',
            chapter: {
              publicationDate: '2020-05-10T00:00:00.000Z',
              publisherImprint: 'CRC Press',
              subtitle: null
            },
            contributors: [
              {
                fullName: 'Daniel Choquet',
                roles: ['author']
              }
            ],
            identifiers: {
              doi: 'some-doi'
            },
            permissions: [
              {
                code: 'CTMRFM',
                description: null,
                name: 'rfm',
                text: 'Ready For Market',
                type: 'sales',
                validFrom: null,
                validTo: null
              }
            ],
            prices: [
              {
                currency: 'EUR',
                price: 135,
                priceType: 'BYO Library Price',
                priceTypeCode: 'BYO',
                validFrom: '2020-02-07T00:00:00.000Z'
              }
            ],
            type: 'chapter'
          }
        ];
        const projectionFields = apiResponseGroupConfig.getProjectionFields(
          'chapter',
          'partMedium'
        );
        partsV4ServiceMock
          .expects('getHasParts')
          .once()
          .withArgs(request.id, 0, 1)
          .returns([parts]);
        productV4DAOMock
          .expects('getProductsByIds')
          .once()
          .withArgs('chapter', [parts._id], {
            ...productFilterOptions,
            projectionFields
          })
          .returns(products);
        partsV4Service
          .getProductHasParts(
            request.id,
            '_id',
            request.offset,
            request.limit,
            false,
            undefined,
            undefined,
            'medium'
          )
          .then((retrivedData) => {
            expect(retrivedData).to.be.an('Array');
            expect(retrivedData.length).to.equal(1);
            expect(retrivedData[0]._id).to.equal('partId');
            expect(retrivedData[0].position).to.equal(parts.position);
            expect(retrivedData[0].prices).to.be.an('Array');
            expect(retrivedData[0].permissions).to.be.an('Array');
            assetV4ServiceMock.verify();
            partsV4ServiceMock.verify();
            apiResponseGroupConfigMock.verify();
            productV4DAOMock.verify();
            creativeWorkV4ServiceMock.verify();
            done();
          })
          .catch((err) => {
            done(err);
          })
          .finally(() => {
            assetV4ServiceMock.restore();
            partsV4ServiceMock.restore();
            apiResponseGroupConfigMock.restore();
            productV4DAOMock.restore();
            creativeWorkV4ServiceMock.restore();
          });
      }
    );
    it(
      'should return list of parts when passing productId, offset, limit & ' +
        'responseGroup as medium & type is book',
      (done) => {
        const request = {
          id: 'valid-UUID',
          limit: 2,
          offset: 0
        };
        assetV4ServiceMock
          .expects('getValidAssetByIdentifierNameValue')
          .once()
          .withArgs('_id', request.id)
          .returns({ _id: 'valid-UUID', type: 'collection' });
        partsV4ServiceMock
          .expects('getHasPartsCount')
          .once()
          .withArgs(request.id)
          .returns(5);
        const part1 = {
          _id: 'partId-1',
          position: 0,
          type: 'book'
        };
        const part2 = {
          _id: 'partId-2',
          position: 0,
          type: 'book'
        };
        const product1 = {
          _id: 'partId-1',
          book: {
            publicationDate: '2020-05-10T00:00:00.000Z',
            publisherImprint: 'CRC Press',
            subtitle: null
          },
          contributors: [
            {
              fullName: 'Daniel Choquet',
              roles: ['author']
            }
          ],
          identifiers: {
            doi: 'some-doi'
          },
          type: 'book'
        };
        const product2 = {
          _id: 'partId-2',
          book: {
            publicationDate: '2020-05-10T00:00:00.000Z',
            publisherImprint: 'CRC Press',
            subtitle: null
          },
          contributors: [
            {
              fullName: 'Daniel Choquet-2',
              roles: ['author']
            }
          ],
          identifiers: {
            doi: 'some-doi'
          },
          type: 'book'
        };
        const projectionFields = apiResponseGroupConfig.getProjectionFields(
          'book',
          'partMedium'
        );
        partsV4ServiceMock
          .expects('getHasParts')
          .once()
          .withArgs(request.id, 0, 2)
          .returns([part1, part2]);
        productV4DAOMock
          .expects('getProductsByIds')
          .once()
          .withArgs('book', [part1._id, part2._id], {
            ...productFilterOptions,
            projectionFields
          })
          .returns([product1, product2]);
        partsV4Service
          .getProductHasParts(
            request.id,
            '_id',
            request.offset,
            request.limit,
            false,
            undefined,
            undefined,
            'medium'
          )
          .then((retrivedData) => {
            expect(retrivedData).to.be.an('Array');
            expect(retrivedData.length).to.equal(2);
            expect(retrivedData[0]).to.have.property('contributors');
            expect(retrivedData[0]).to.have.property('book');
            expect(retrivedData[0]).to.have.property('identifiers');
            assetV4ServiceMock.verify();
            partsV4ServiceMock.verify();
            apiResponseGroupConfigMock.verify();
            productV4DAOMock.verify();
            creativeWorkV4ServiceMock.verify();
            done();
          })
          .catch((err) => {
            done(err);
          })
          .finally(() => {
            assetV4ServiceMock.restore();
            partsV4ServiceMock.restore();
            apiResponseGroupConfigMock.restore();
            productV4DAOMock.restore();
            creativeWorkV4ServiceMock.restore();
          });
      }
    );
    it('should go with old partsMedium response when part type is not a product type', (done) => {
      const request = {
        id: 'valid-UUID',
        limit: 2,
        offset: 0
      };
      assetV4ServiceMock
        .expects('getValidAssetByIdentifierNameValue')
        .once()
        .withArgs('_id', request.id)
        .returns({ _id: 'valid-UUID', type: 'collection' });
      partsV4ServiceMock
        .expects('getHasPartsCount')
        .once()
        .withArgs(request.id)
        .returns(5);
      const part1 = {
        _id: 'partId-1',
        position: 0,
        type: 'part'
      };
      const part2 = {
        _id: 'partId-2',
        position: 0,
        type: 'part'
      };
      partsV4ServiceMock
        .expects('getHasParts')
        .once()
        .withArgs(request.id, 0, 2)
        .returns([part1, part2]);
      productV4DAOMock.expects('getProductsByIds').never();
      partsV4Service
        .getProductHasParts(
          request.id,
          '_id',
          request.offset,
          request.limit,
          false,
          undefined,
          undefined,
          'medium'
        )
        .then((retrivedData) => {
          expect(retrivedData).to.be.an('Array');
          expect(retrivedData.length).to.equal(2);
          expect(retrivedData[0]).to.have.property('type', 'part');
          assetV4ServiceMock.verify();
          partsV4ServiceMock.verify();
          apiResponseGroupConfigMock.verify();
          productV4DAOMock.verify();
          creativeWorkV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          partsV4ServiceMock.restore();
          apiResponseGroupConfigMock.restore();
          productV4DAOMock.restore();
          creativeWorkV4ServiceMock.restore();
        });
    });
    it('should have title from products not parts', (done) => {
      const request = {
        id: 'valid-UUID',
        limit: 2,
        offset: 0
      };
      assetV4ServiceMock
        .expects('getValidAssetByIdentifierNameValue')
        .once()
        .withArgs('_id', request.id)
        .returns({ _id: 'valid-UUID', type: 'collection' });
      partsV4ServiceMock
        .expects('getHasPartsCount')
        .once()
        .withArgs(request.id)
        .returns(5);
      const part1 = {
        _id: 'partId-1',
        position: 0,
        title: null,
        type: 'book'
      };
      const part2 = {
        _id: 'partId-2',
        position: 0,
        title: 'The Big Bang theory',
        type: 'book'
      };
      const product1 = {
        _id: 'partId-1',
        book: {
          publicationDate: '2020-05-10T00:00:00.000Z',
          publisherImprint: 'CRC Press',
          subtitle: null
        },
        contributors: [
          {
            fullName: 'Daniel Choquet',
            roles: ['author']
          }
        ],
        identifiers: {
          doi: 'some-doi'
        },
        title: 'Money Heist',
        type: 'book'
      };
      const product2 = {
        _id: 'partId-2',
        book: {
          publicationDate: '2020-05-10T00:00:00.000Z',
          publisherImprint: 'CRC Press',
          subtitle: null
        },
        contributors: [
          {
            fullName: 'Daniel Choquet-2',
            roles: ['author']
          }
        ],
        identifiers: {
          doi: 'some-doi'
        },
        title: 'Friends',
        type: 'book'
      };
      const projectionFields = apiResponseGroupConfig.getProjectionFields(
        'book',
        'partMedium'
      );
      partsV4ServiceMock
        .expects('getHasParts')
        .once()
        .withArgs(request.id, 0, 2)
        .returns([part1, part2]);
      productV4DAOMock
        .expects('getProductsByIds')
        .once()
        .withArgs('book', [part1._id, part2._id], {
          ...productFilterOptions,
          projectionFields
        })
        .returns([product1, product2]);
      partsV4Service
        .getProductHasParts(
          request.id,
          '_id',
          request.offset,
          request.limit,
          false,
          undefined,
          undefined,
          'medium'
        )
        .then((retrivedData) => {
          expect(retrivedData).to.be.an('Array');
          expect(retrivedData.length).to.equal(2);
          expect(retrivedData[0]).to.have.property('contributors');
          expect(retrivedData[0]).to.have.property('book');
          expect(retrivedData[0]).to.have.property('identifiers');
          expect(retrivedData[0]).to.have.property('title', 'Money Heist');
          expect(retrivedData[1]).to.have.property('title', 'Friends');
          assetV4ServiceMock.verify();
          partsV4ServiceMock.verify();
          apiResponseGroupConfigMock.verify();
          productV4DAOMock.verify();
          creativeWorkV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          partsV4ServiceMock.restore();
          apiResponseGroupConfigMock.restore();
          productV4DAOMock.restore();
          creativeWorkV4ServiceMock.restore();
        });
    });
    it('should add format from product if it is not coming from dao layer', (done) => {
      const request = {
        id: 'valid-UUID',
        limit: 2,
        offset: 0
      };
      assetV4ServiceMock
        .expects('getValidAssetByIdentifierNameValue')
        .once()
        .withArgs('_id', request.id)
        .returns({ _id: 'valid-UUID', type: 'collection' });
      partsV4ServiceMock
        .expects('getHasPartsCount')
        .once()
        .withArgs(request.id)
        .returns(5);
      const part1 = {
        _id: 'partId-1',
        format: 'presentation',
        position: 0,
        title: null,
        type: 'book'
      };
      const part2 = {
        _id: 'partId-2',
        position: 0,
        title: 'The Big Bang theory',
        type: 'book'
      };
      const product1 = {
        _id: 'partId-1',
        book: {
          format: 'e-book',
          publicationDate: '2020-05-10T00:00:00.000Z',
          publisherImprint: 'CRC Press',
          subtitle: null
        },
        contributors: [
          {
            fullName: 'Daniel Choquet',
            roles: ['author']
          }
        ],
        identifiers: {
          doi: 'some-doi'
        },
        title: 'Money Heist',
        type: 'book'
      };
      const product2 = {
        _id: 'partId-2',
        book: {
          format: 'e-book',
          publicationDate: '2020-05-10T00:00:00.000Z',
          publisherImprint: 'CRC Press',
          subtitle: null
        },
        contributors: [
          {
            fullName: 'Daniel Choquet-2',
            roles: ['author']
          }
        ],
        identifiers: {
          doi: 'some-doi'
        },
        title: 'The Big Bang theory',
        type: 'book'
      };
      partsV4ServiceMock
        .expects('getHasParts')
        .once()
        .withArgs(request.id, 0, 2)
        .returns([part1, part2]);
      const projectionFields = apiResponseGroupConfig.getProjectionFields(
        'book',
        'partMedium'
      );
      productV4DAOMock
        .expects('getProductsByIds')
        .once()
        .withArgs('book', [part1._id, part2._id], {
          ...productFilterOptions,
          projectionFields
        })
        .returns([product1, product2]);
      partsV4Service
        .getProductHasParts(
          request.id,
          '_id',
          request.offset,
          request.limit,
          false,
          undefined,
          undefined,
          'medium'
        )
        .then((retrivedData) => {
          expect(retrivedData).to.be.an('Array');
          expect(retrivedData.length).to.equal(2);
          expect(retrivedData[0]).to.have.property('contributors');
          expect(retrivedData[0]).to.have.property('book');
          expect(retrivedData[0]).to.have.property('identifiers');
          expect(retrivedData[0].book).to.have.property('format', 'e-book');
          expect(retrivedData[1].book).to.have.property('format', 'e-book');
          assetV4ServiceMock.verify();
          partsV4ServiceMock.verify();
          apiResponseGroupConfigMock.verify();
          productV4DAOMock.verify();
          creativeWorkV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          partsV4ServiceMock.restore();
          apiResponseGroupConfigMock.restore();
          productV4DAOMock.restore();
          creativeWorkV4ServiceMock.restore();
        });
    });
    it(
      'should return list of parts when passing productId, offset, limit & ' +
        'responseGroup as medium where response has creativeWork',
      (done) => {
        const request = {
          id: 'valid-UUID',
          limit: 1,
          offset: 0
        };
        assetV4ServiceMock
          .expects('getValidAssetByIdentifierNameValue')
          .once()
          .withArgs('_id', request.id)
          .returns({ _id: 'valid-UUID', type: 'collection' });
        partsV4ServiceMock
          .expects('getHasPartsCount')
          .once()
          .withArgs(request.id)
          .returns(5);
        const parts = {
          _id: 'partId',
          position: 0,
          type: 'creativeWork'
        };
        const products = [
          {
            _id: 'partId',
            contributors: [
              {
                fullName: 'Daniel Choquet',
                roles: ['author']
              }
            ],
            creativeWork: {
              format: 'presentation',
              publicationDate: '2020-05-10T00:00:00.000Z',
              publisherImprint: 'CRC Press',
              subtitle: null
            },
            identifiers: {
              doi: 'some-doi'
            },
            type: 'creativeWork'
          }
        ];
        const projectionFields = apiResponseGroupConfig.getProjectionFields(
          'creativeWork',
          'partMedium'
        );
        partsV4ServiceMock
          .expects('getHasParts')
          .once()
          .withArgs(request.id, 0, 1)
          .returns([parts]);
        productV4DAOMock
          .expects('getProductsByIds')
          .once()
          .withArgs('creativeWork', [parts._id], {
            ...productFilterOptions,
            projectionFields
          })
          .returns(products);
        partsV4Service
          .getProductHasParts(
            request.id,
            '_id',
            request.offset,
            request.limit,
            false,
            undefined,
            undefined,
            'medium'
          )
          .then((retrivedData) => {
            expect(retrivedData).to.be.an('Array');
            expect(retrivedData.length).to.equal(1);
            expect(retrivedData[0]._id).to.equal('partId');
            expect(retrivedData[0].position).to.equal(parts.position);
            expect(retrivedData[0].creativeWork).to.have.property(
              'format',
              'presentation'
            );
            assetV4ServiceMock.verify();
            partsV4ServiceMock.verify();
            apiResponseGroupConfigMock.verify();
            productV4DAOMock.verify();
            creativeWorkV4ServiceMock.verify();
            done();
          })
          .catch((err) => {
            done(err);
          })
          .finally(() => {
            assetV4ServiceMock.restore();
            partsV4ServiceMock.restore();
            apiResponseGroupConfigMock.restore();
            productV4DAOMock.restore();
            creativeWorkV4ServiceMock.restore();
          });
      }
    );
    it.skip(`should return list of parts when passing productId, offset, limit, availabilityName &
          responseGroup as medium`, (done) => {
      const request = {
        availabilityName: 'UBX',
        id: 'valid-UUID',
        limit: 1,
        offset: 0
      };
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(request.id)
        .returns({ _id: 'valid-UUID', type: 'collection' });
      partsV4ServiceMock
        .expects('getHasPartsCount')
        .once()
        .withArgs(request.id)
        .returns(5);
      const parts = {
        _id: 'partId',
        position: 0,
        type: 'chapter'
      };
      partsV4ServiceMock
        .expects('getHasParts')
        .once()
        .withArgs(request.id, 0, 1)
        .returns([parts]);
      apiResponseGroupConfigMock
        .expects('getProjectionFields')
        .once()
        .withArgs(parts.type, 'hasPartMedium')
        .returns(['_id', 'type']);
      productV4DAOMock
        .expects('getProduct')
        .once()
        .withArgs(
          parts.type,
          parts._id,
          ['_id', 'type'],
          request.availabilityName
        )
        .resolves({ _id: parts._id, type: parts.type });
      // partsV4Service.getProductHasParts(request.id, request.offset, request.limit,
      //   request.availabilityName, undefined, undefined, undefined, 'medium')
      partsV4Service
        .getProductHasParts(
          request.id,
          '_id',
          request.offset,
          request.limit,
          false,
          undefined,
          undefined,
          'medium'
        )
        .then((retrivedData) => {
          expect(retrivedData).to.be.an('Array');
          expect(retrivedData.length).to.equal(1);
          expect(retrivedData[0]._id).to.equal('partId');
          expect(retrivedData[0].position).to.equal(parts.position);
          assetV4ServiceMock.verify();
          partsV4ServiceMock.verify();
          apiResponseGroupConfigMock.verify();
          productV4DAOMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          partsV4ServiceMock.restore();
          apiResponseGroupConfigMock.restore();
          productV4DAOMock.restore();
        });
    });
    it.skip(`should return parts revision when productId, productVersion is passed & asset
            type is collection`, (done) => {
      const request = {
        id: 'valid-UUID',
        limit: 1,
        offset: 0,
        productVersion: '1.0.0'
      };
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(request.id)
        .returns({ _id: 'valid-UUID', type: 'collection' });
      partsRevisionV4ServiceMock
        .expects('getHasPartsCount')
        .once()
        .withArgs(request.id, request.productVersion)
        .returns(5);
      const parts = {
        _id: 'partId',
        position: 0,
        type: 'chapter'
      };
      partsRevisionV4ServiceMock
        .expects('getHasParts')
        .once()
        .withArgs(request.id, request.productVersion, 0, 1)
        .returns([parts]);
      partsV4ServiceMock.expects('getHasPartsCount').never();
      partsV4ServiceMock.expects('getHasParts').never();
      partsV4Service
        .getProductHasParts(
          request.id,
          '_id',
          request.offset,
          request.limit,
          false,
          undefined,
          undefined,
          'small',
          request.productVersion
        )
        .then((retrivedData) => {
          expect(retrivedData).to.be.an('Array');
          expect(retrivedData.length).to.equal(1);
          expect(retrivedData[0]._id).to.equal('partId');
          assetV4ServiceMock.verify();
          partsV4ServiceMock.verify();
          partsRevisionV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          partsV4ServiceMock.restore();
          partsRevisionV4ServiceMock.restore();
        });
    });
    it.skip(`should go with normal flow when productId, productVersion is passed but asset
        type is not collection`, (done) => {
      const request = {
        id: 'valid-UUID',
        limit: 1,
        offset: 0,
        productVersion: '1.0.0'
      };
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(request.id)
        .returns({ _id: 'valid-UUID', type: 'book' });
      partsV4ServiceMock
        .expects('getHasPartsCount')
        .once()
        .withArgs(request.id)
        .returns(5);
      const parts = {
        _id: 'partId',
        position: 0,
        type: 'chapter'
      };
      partsV4ServiceMock
        .expects('getHasParts')
        .once()
        .withArgs(request.id, 0, 1)
        .returns([parts]);
      partsRevisionV4ServiceMock.expects('getHasPartsCount').never();
      partsRevisionV4ServiceMock.expects('getHasParts').never();
      partsV4Service
        .getProductHasParts(
          request.id,
          '_id',
          request.offset,
          request.limit,
          false,
          undefined,
          undefined,
          'small',
          request.productVersion
        )
        .then((retrivedData) => {
          expect(retrivedData).to.be.an('Array');
          expect(retrivedData.length).to.equal(1);
          expect(retrivedData[0]._id).to.equal('partId');
          assetV4ServiceMock.verify();
          partsV4ServiceMock.verify();
          partsRevisionV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          partsV4ServiceMock.restore();
          partsRevisionV4ServiceMock.restore();
        });
    });
  });
  describe('getProductHasPart', () => {
    let assetV4ServiceMock;
    let partsV4ServiceMock;
    let productV4DAOMock;
    let apiResponseGroupConfigMock;
    let creativeWorkV4ServiceMock;
    let productFilterOptions: IProductFilterOptions;
    beforeEach(() => {
      assetV4ServiceMock = sinon.mock(assetV4Service);
      partsV4ServiceMock = sinon.mock(partsV4Service);
      productV4DAOMock = sinon.mock(productV4DAO);
      apiResponseGroupConfigMock = sinon.mock(apiResponseGroupConfig);
      creativeWorkV4ServiceMock = sinon.mock(creativeWorkV4Service);
      productFilterOptions = {};
    });

    it('should throw Product (asset) not found. when productId is invalid', (done) => {
      const id = 'invalid-uuid';
      const partId = 'some-id';
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id)
        .returns(null);
      partsV4ServiceMock.expects('getHasPart').never();
      partsV4Service
        .getProductHasPart(id, partId, 'small')
        .then((err) => {
          done(
            new Error('Expecting Product (asset) not found. but got success')
          );
        })
        .catch((err) => {
          expect(err.message).to.equal('Product (asset) not found.');
          expect(err.code).to.equal(404);
          assetV4ServiceMock.verify();
          partsV4ServiceMock.verify();
          done();
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          partsV4ServiceMock.restore();
        });
    });
    it('should throw Product (asset) not found. when productId is null', (done) => {
      const id = null;
      const partId = 'some-id';
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id)
        .returns(null);
      partsV4ServiceMock.expects('getHasPart').never();
      partsV4Service
        .getProductHasPart(id, partId, 'small')
        .then((err) => {
          done(
            new Error('Expecting Product (asset) not found. but got success')
          );
        })
        .catch((err) => {
          expect(err.message).to.equal('Product (asset) not found.');
          expect(err.code).to.equal(404);
          assetV4ServiceMock.verify();
          partsV4ServiceMock.verify();
          done();
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          partsV4ServiceMock.restore();
        });
    });
    it('should throw Product parts not found. when parts not found', (done) => {
      const id = 'product-uuid';
      const partId = 'some-id';
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id)
        .returns({ id, type: 'collection' });
      partsV4ServiceMock
        .expects('getHasPart')
        .once()
        .withArgs(id, partId)
        .returns(null);
      partsV4Service
        .getProductHasPart(id, partId, 'small')
        .then(() => {
          done(new Error('Expecting Product parts not found. but got success'));
        })
        .catch((err) => {
          expect(err.message).to.equal('Product parts not found.');
          expect(err.code).to.equal(404);
          assetV4ServiceMock.verify();
          partsV4ServiceMock.verify();
          done();
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          partsV4ServiceMock.restore();
        });
    });
    it('should return list of parts when valid productId & partId is given', (done) => {
      const request = {
        id: 'valid-UUID',
        partId: 'some-id'
      };
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(request.id)
        .returns({ _id: 'valid-UUID', type: 'collection' });
      const parts = {
        _id: 'some-id',
        isFree: false,
        position: 0,
        type: 'chapter'
      };
      partsV4ServiceMock
        .expects('getHasPart')
        .once()
        .withArgs(request.id, request.partId)
        .returns(parts);
      partsV4Service
        .getProductHasPart(request.id, request.partId, undefined)
        .then((retrivedData) => {
          expect(retrivedData._id).to.equal(request.partId);
          assetV4ServiceMock.verify();
          partsV4ServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          partsV4ServiceMock.restore();
        });
    });
    it(
      'should return list of parts when passing productId, partId &' +
        'responseGroup as medium',
      (done) => {
        const request = {
          id: 'valid-UUID',
          partId: 'partId'
        };
        assetV4ServiceMock
          .expects('getAssetById')
          .once()
          .withArgs(request.id)
          .returns({ _id: 'valid-UUID', type: 'collection' });
        const parts = {
          _id: 'partId',
          isFree: false,
          position: 0,
          type: 'chapter'
        };
        const products = [
          {
            _id: 'partId',
            chapter: {
              publicationDate: '2020-05-10T00:00:00.000Z',
              publisherImprint: 'CRC Press',
              subtitle: null
            },
            contributors: [
              {
                fullName: 'Daniel Choquet',
                roles: ['author']
              }
            ],
            identifiers: {
              doi: 'some-doi'
            },
            permissions: [
              {
                code: 'CTMRFM',
                description: null,
                name: 'rfm',
                text: 'Ready For Market',
                type: 'sales',
                validFrom: null,
                validTo: null
              }
            ],
            prices: [
              {
                currency: 'EUR',
                price: 135,
                priceType: 'BYO Library Price',
                priceTypeCode: 'BYO',
                validFrom: '2020-02-07T00:00:00.000Z'
              }
            ],
            type: 'chapter'
          }
        ];
        const projectionFields = apiResponseGroupConfig.getProjectionFields(
          'chapter',
          'partMedium'
        );
        partsV4ServiceMock
          .expects('getHasPart')
          .once()
          .withArgs(request.id, request.partId)
          .returns(parts);
        productV4DAOMock
          .expects('getProductsByIds')
          .once()
          .withArgs('chapter', [parts._id], {
            ...productFilterOptions,
            projectionFields
          })
          .returns(products);
        partsV4Service
          .getProductHasPart(request.id, request.partId, 'medium')
          .then((retrivedData) => {
            expect(retrivedData._id).to.equal('partId');
            expect(retrivedData.prices).to.be.an('Array');
            expect(retrivedData.permissions).to.be.an('Array');
            expect(retrivedData.position).to.equal(parts.position);
            assetV4ServiceMock.verify();
            partsV4ServiceMock.verify();
            apiResponseGroupConfigMock.verify();
            productV4DAOMock.verify();
            creativeWorkV4ServiceMock.verify();
            done();
          })
          .catch((err) => {
            done(err);
          })
          .finally(() => {
            assetV4ServiceMock.restore();
            partsV4ServiceMock.restore();
            apiResponseGroupConfigMock.restore();
            productV4DAOMock.restore();
            creativeWorkV4ServiceMock.restore();
          });
      }
    );
    it(
      'should return list of parts when passing productId, offset, limit & ' +
        'responseGroup as medium & type is book',
      (done) => {
        const request = {
          id: 'valid-UUID',
          limit: 2,
          offset: 0
        };
        assetV4ServiceMock
          .expects('getValidAssetByIdentifierNameValue')
          .once()
          .withArgs('_id', request.id)
          .returns({ _id: 'valid-UUID', type: 'collection' });
        partsV4ServiceMock
          .expects('getHasPartsCount')
          .once()
          .withArgs(request.id)
          .returns(5);
        const part1 = {
          _id: 'partId-1',
          position: 0,
          type: 'book'
        };
        const part2 = {
          _id: 'partId-2',
          position: 0,
          type: 'book'
        };
        const product1 = {
          _id: 'partId-1',
          book: {
            publicationDate: '2020-05-10T00:00:00.000Z',
            publisherImprint: 'CRC Press',
            subtitle: null
          },
          contributors: [
            {
              fullName: 'Daniel Choquet',
              roles: ['author']
            }
          ],
          identifiers: {
            doi: 'some-doi'
          },
          type: 'book'
        };
        const product2 = {
          _id: 'partId-2',
          book: {
            publicationDate: '2020-05-10T00:00:00.000Z',
            publisherImprint: 'CRC Press',
            subtitle: null
          },
          contributors: [
            {
              fullName: 'Daniel Choquet-2',
              roles: ['author']
            }
          ],
          identifiers: {
            doi: 'some-doi'
          },
          type: 'book'
        };
        const projectionFields = apiResponseGroupConfig.getProjectionFields(
          'book',
          'partMedium'
        );
        partsV4ServiceMock
          .expects('getHasParts')
          .once()
          .withArgs(request.id, 0, 2)
          .returns([part1, part2]);
        productV4DAOMock
          .expects('getProductsByIds')
          .once()
          .withArgs('book', [part1._id, part2._id], {
            ...productFilterOptions,
            projectionFields
          })
          .returns([product1, product2]);
        partsV4Service
          .getProductHasParts(
            request.id,
            '_id',
            request.offset,
            request.limit,
            false,
            undefined,
            undefined,
            'medium'
          )
          .then((retrivedData) => {
            expect(retrivedData).to.be.an('Array');
            expect(retrivedData.length).to.equal(2);
            expect(retrivedData[0]).to.have.property('contributors');
            expect(retrivedData[0]).to.have.property('book');
            expect(retrivedData[0]).to.have.property('identifiers');
            assetV4ServiceMock.verify();
            partsV4ServiceMock.verify();
            apiResponseGroupConfigMock.verify();
            productV4DAOMock.verify();
            creativeWorkV4ServiceMock.verify();
            done();
          })
          .catch((err) => {
            done(err);
          })
          .finally(() => {
            assetV4ServiceMock.restore();
            partsV4ServiceMock.restore();
            apiResponseGroupConfigMock.restore();
            productV4DAOMock.restore();
            creativeWorkV4ServiceMock.restore();
          });
      }
    );
  });
});
