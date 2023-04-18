import { partsrevisionV4Service } from './PartsRevisionV4.Service';
import { assetV4Service } from '../assets/AssetV4.Service';
import { partsUtil } from '../../utils/parts/Parts.Util';
import { partsV4Service } from '../parts/PartsV4.Service';
import { partsRevisionV4DAO } from '../parts/PartsRevisionV4.DAO';
import { associatedMediaV4Dao } from '../associatedMedia/AssociatedMediaV4.DAO';
import * as sinon from 'sinon';
import { expect } from 'chai';
describe('PartsRevisionV4.Service', () => {
  describe('getProductPartsDelta', () => {
    let testData: any;
    let responseData: any;
    let finalData: any;
    let assetV4ServiceMock;
    let partsrevisionServiceMock;
    let partsUtilV4Mock;
    let partsServiceMock;
    let partsRevisiondaoMock;
    let associatedMediaV4DaoMock;
    let midData: any;
    beforeEach(() => {
      testData = {
        channel: 'DS',
        fromdate: '22/12/22',
        id: '123',
        include: ['partsAdded', 'partsRemoved', 'partsUpdated'],
        todate: '24/12/22'
      };
      responseData = {
        partsAdded: [{ _id: '1', type: 'book' }],
        partsRemoved: [{ _id: '1', type: 'book' }],
        partsUpdated: [{ _id: '1', type: 'book' }]
      };
      midData = {
        addedPartsDataFromSearchResult: [
          {
            identifiers: {
              doi: '123',
              isbn: '456'
            }
          }
        ],
        removedPartsDataFromSearchResult: [
          {
            identifiers: {
              doi: '123',
              isbn: '456'
            }
          }
        ],
        updatedPartsDataFromSearchResult: [
          {
            identifiers: {
              doi: '123',
              isbn: '456'
            }
          }
        ]
      };
      finalData = {
        partsAdded: [
          {
            _id: '1',
            identifiers: {
              doi: '123',
              isbn: '456'
            },
            title: 'abc',
            type: 'book'
          }
        ],
        partsRemoved: [
          {
            _id: '1',
            identifiers: {
              doi: '123',
              isbn: '456'
            },
            title: 'abc',
            type: 'book'
          }
        ],
        partsUpdated: [
          {
            _id: '1',
            identifiers: {
              doi: '123',
              isbn: '456'
            },
            title: 'abc',
            type: 'book'
          }
        ]
      };
      assetV4ServiceMock = sinon.mock(assetV4Service);
      partsrevisionServiceMock = sinon.mock(partsrevisionV4Service);
      partsUtilV4Mock = sinon.mock(partsUtil);
      partsServiceMock = sinon.mock(partsV4Service);
      partsRevisiondaoMock = sinon.mock(partsRevisionV4DAO);
      associatedMediaV4DaoMock = sinon.mock(associatedMediaV4Dao);
    });
    it(' should return parts data when the valid collection id is passed', (done) => {
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(testData.id, ['type'])
        .resolves({ id: 'some valid-id', type: 'collection' });
      partsRevisiondaoMock
        .expects('getPartsRevisionDataByDate')
        .once()
        .withArgs(testData.id, testData.fromdate, testData.todate)
        .resolves([
          {
            id: 'some-valid-id',
            parts: [{ _id: '1', type: 'book' }],
            partsAdded: [{ _id: '1', type: 'book' }],
            partsRemoved: [{ _id: '1', type: 'book' }],
            partsUpdated: [{ _id: '1', type: 'book' }]
          }
        ]);
      partsrevisionServiceMock
        .expects('handleDateFilterOfPartsData')
        .once()
        .withArgs(
          responseData.partsAdded,
          responseData.partsRemoved,
          responseData.partsUpdated
        )
        .resolves({
          addedPartsDataFromSearchResult: [
            {
              identifiers: {
                doi: '123',
                isbn: '456'
              }
            }
          ],
          removedPartsDataFromSearchResult: [
            {
              identifiers: {
                doi: '123',
                isbn: '456'
              }
            }
          ],
          updatedPartsDataFromSearchResult: [
            {
              identifiers: {
                doi: '123',
                isbn: '456'
              }
            }
          ]
        });
      partsUtilV4Mock
        .expects('mergePartsAndProductPartsData')
        .once()
        .withArgs(
          responseData.partsAdded,
          midData.addedPartsDataFromSearchResult
        )
        .returns(finalData.partsAdded);
      partsUtilV4Mock
        .expects('mergePartsAndProductPartsData')
        .once()
        .withArgs(
          responseData.partsRemoved,
          midData.removedPartsDataFromSearchResult
        )
        .returns(finalData.partsRemoved);
      partsUtilV4Mock
        .expects('mergePartsAndProductPartsData')
        .once()
        .withArgs(
          responseData.partsUpdated,
          midData.updatedPartsDataFromSearchResult
        )
        .returns(finalData.partsUpdated);
      partsrevisionV4Service
        .getProductPartsDelta(
          testData.id,
          testData.fromdate,
          testData.todate,
          testData.include
        )
        .then((partsdata) => {
          expect(partsdata).to.deep.equal(finalData);
          assetV4ServiceMock.verify(), partsrevisionServiceMock.verify();
          partsUtilV4Mock.verify();
          partsRevisiondaoMock.verify();

          done();
        })
        .catch((err) => {
          console.log('error: ', err);
          done(err);
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          partsrevisionServiceMock.restore();
          partsUtilV4Mock.restore();
          partsRevisiondaoMock.restore();
        });
    });
    it(' should return parts data when the valid collection id and channel is passed', (done) => {
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(testData.id, ['type'])
        .resolves({ id: 'some valid-id', type: 'collection' });
      partsRevisiondaoMock
        .expects('getPartsRevisionDataByDate')
        .once()
        .withArgs(testData.id, testData.fromdate, testData.todate)
        .resolves([
          {
            id: 'some-valid-id',
            parts: [{ _id: '1', type: 'book' }],
            partsAdded: [{ _id: '1', type: 'book' }],
            partsRemoved: [{ _id: '1', type: 'book' }],
            partsUpdated: [{ _id: '1', type: 'book' }]
          }
        ]);
      partsrevisionServiceMock
        .expects('handleDateFilterOfPartsData')
        .once()
        .withArgs(
          responseData.partsAdded,
          responseData.partsRemoved,
          responseData.partsUpdated
        )
        .resolves({
          addedPartsDataFromSearchResult: [
            {
              identifiers: {
                doi: '123',
                isbn: '456'
              }
            }
          ],
          removedPartsDataFromSearchResult: [
            {
              identifiers: {
                doi: '123',
                isbn: '456'
              }
            }
          ],
          updatedPartsDataFromSearchResult: [
            {
              identifiers: {
                doi: '123',
                isbn: '456'
              }
            }
          ]
        });
      partsUtilV4Mock
        .expects('mergePartsAndProductPartsData')
        .once()
        .withArgs(
          responseData.partsAdded,
          midData.addedPartsDataFromSearchResult
        )
        .returns(finalData.partsAdded);
      partsUtilV4Mock
        .expects('mergePartsAndProductPartsData')
        .once()
        .withArgs(
          responseData.partsRemoved,
          midData.removedPartsDataFromSearchResult
        )
        .returns(finalData.partsRemoved);
      partsUtilV4Mock
        .expects('mergePartsAndProductPartsData')
        .once()
        .withArgs(
          responseData.partsUpdated,
          midData.updatedPartsDataFromSearchResult
        )
        .returns(finalData.partsUpdated);
      partsrevisionServiceMock
        .expects('filterNoContent')
        .once()
        .withArgs(finalData.partsAdded)
        .returns(finalData.partsAdded);
      partsrevisionV4Service
        .getProductPartsDelta(
          testData.id,
          testData.fromdate,
          testData.todate,
          testData.include,
          testData.channel
        )
        .then((partsdata) => {
          expect(partsdata).to.deep.equal(finalData);
          assetV4ServiceMock.verify(), partsrevisionServiceMock.verify();
          partsUtilV4Mock.verify();
          partsRevisiondaoMock.verify();
          done();
        })
        .catch((err) => {
          console.log('error: ', err);
          done(err);
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          partsrevisionServiceMock.restore();
          partsUtilV4Mock.restore();
          partsRevisiondaoMock.restore();
        });
    });
    it(' should return parts data when the valid collection id and channel is passed', (done) => {
      const partsAdded = [
        { _id: '1', type: 'book' },
        { _id: '2', type: 'chapter' }
      ];
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(testData.id, ['type'])
        .resolves({ id: 'some valid-id', type: 'collection' });
      partsRevisiondaoMock
        .expects('getPartsRevisionDataByDate')
        .once()
        .withArgs(testData.id, testData.fromdate, testData.todate)
        .resolves([
          {
            id: 'some-valid-id',
            parts: [{ _id: '1', type: 'book' }],
            partsAdded: [{ _id: '1', type: 'book' }],
            partsRemoved: [{ _id: '1', type: 'book' }],
            partsUpdated: [{ _id: '1', type: 'book' }]
          }
        ]);
      partsrevisionServiceMock
        .expects('handleDateFilterOfPartsData')
        .once()
        .withArgs(
          responseData.partsAdded,
          responseData.partsRemoved,
          responseData.partsUpdated
        )
        .resolves({
          addedPartsDataFromSearchResult: [
            {
              identifiers: {
                doi: '123',
                isbn: '456'
              }
            }
          ],
          removedPartsDataFromSearchResult: [
            {
              identifiers: {
                doi: '123',
                isbn: '456'
              }
            }
          ],
          updatedPartsDataFromSearchResult: [
            {
              identifiers: {
                doi: '123',
                isbn: '456'
              }
            }
          ]
        });
      partsUtilV4Mock
        .expects('mergePartsAndProductPartsData')
        .once()
        .withArgs(
          responseData.partsAdded,
          midData.addedPartsDataFromSearchResult
        )
        .returns(finalData.partsAdded);
      partsUtilV4Mock
        .expects('mergePartsAndProductPartsData')
        .once()
        .withArgs(
          responseData.partsRemoved,
          midData.removedPartsDataFromSearchResult
        )
        .returns(finalData.partsRemoved);
      partsUtilV4Mock
        .expects('mergePartsAndProductPartsData')
        .once()
        .withArgs(
          responseData.partsUpdated,
          midData.updatedPartsDataFromSearchResult
        )
        .returns(finalData.partsUpdated);
      associatedMediaV4DaoMock
        .expects('isContentExists')
        .once()
        .withArgs(finalData.partsAdded, ['parentId'])
        .resolves(['1']);
      partsrevisionV4Service
        .getProductPartsDelta(
          testData.id,
          testData.fromdate,
          testData.todate,
          testData.include,
          testData.channel
        )
        .then((partsdata) => {
          expect(partsdata).to.deep.equal(finalData);
          assetV4ServiceMock.verify(), partsrevisionServiceMock.verify();
          partsUtilV4Mock.verify();
          partsRevisiondaoMock.verify();
          done();
        })
        .catch((err) => {
          console.log('error: ', err);
          done(err);
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          partsrevisionServiceMock.restore();
          partsUtilV4Mock.restore();
          partsRevisiondaoMock.restore();
        });
    });
    it(' should return parts data when the valid collection id is passed', (done) => {
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(testData.id, ['type'])
        .resolves({ id: 'some valid-id', type: 'collection' });
      partsrevisionServiceMock
        .expects('getPartsRevisionDataByDate')
        .once()
        .withArgs(testData.id, testData.fromdate, testData.todate)
        .resolves([
          {
            id: 'some-valid-id',
            parts: [{ _id: '1', type: 'book' }],
            partsAdded: [{ _id: '1', type: 'book' }],
            partsRemoved: [{ _id: '1', type: 'book' }],
            partsUpdated: [{ _id: '1', type: 'book' }]
          }
        ]);
      partsrevisionServiceMock
        .expects('handleDateFilterOfPartsData')
        .once()
        .withArgs(
          responseData.partsAdded,
          responseData.partsRemoved,
          responseData.partsUpdated
        )
        .resolves({
          addedPartsDataFromSearchResult: [
            {
              identifiers: {
                doi: '123',
                isbn: '456'
              }
            }
          ],
          removedPartsDataFromSearchResult: [
            {
              identifiers: {
                doi: '123',
                isbn: '456'
              }
            }
          ],
          updatedPartsDataFromSearchResult: [
            {
              identifiers: {
                doi: '123',
                isbn: '456'
              }
            }
          ]
        });
      partsUtilV4Mock
        .expects('mergePartsAndProductPartsData')
        .once()
        .withArgs(
          responseData.partsAdded,
          midData.addedPartsDataFromSearchResult
        )
        .returns(finalData.partsAdded);
      partsUtilV4Mock
        .expects('mergePartsAndProductPartsData')
        .once()
        .withArgs(
          responseData.partsRemoved,
          midData.removedPartsDataFromSearchResult
        )
        .returns(finalData.partsRemoved);
      partsUtilV4Mock
        .expects('mergePartsAndProductPartsData')
        .once()
        .withArgs(
          responseData.partsUpdated,
          midData.updatedPartsDataFromSearchResult
        )
        .returns(finalData.partsUpdated);
      partsrevisionV4Service
        .getProductPartsDelta(
          testData.id,
          testData.fromdate,
          testData.todate,
          testData.include
        )
        .then((partsdata) => {
          expect(partsdata).to.deep.equal(finalData);
          assetV4ServiceMock.verify(), partsrevisionServiceMock.verify();
          partsUtilV4Mock.verify();

          done();
        })
        .catch((err) => {
          console.log('error: ', err);
          done(err);
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          partsrevisionServiceMock.restore();
          partsUtilV4Mock.restore();
        });
    });
    it(' should return parts data when the valid collection id is passed', (done) => {
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(testData.id, ['type'])
        .resolves({ id: 'some valid-id', type: 'collection' });
      partsrevisionServiceMock
        .expects('getPartsRevisionDataByDate')
        .once()
        .withArgs(testData.id, testData.fromdate, testData.todate)
        .resolves([
          {
            id: 'some-valid-id',
            parts: [{ _id: '1', type: 'book' }]
          }
        ]);
      partsrevisionServiceMock
        .expects('handleDateFilterOfPartsData')
        .once()
        .withArgs()
        .resolves({
          addedPartsDataFromSearchResult: [],
          removedPartsDataFromSearchResult: [],
          updatedPartsDataFromSearchResult: []
        });
      partsrevisionV4Service
        .getProductPartsDelta(
          testData.id,
          testData.fromdate,
          testData.todate,
          testData.include
        )
        .then((partsdata) => {
          expect(partsdata).to.deep.equal({
            partsAdded: [],
            partsRemoved: [],
            partsUpdated: []
          });
          assetV4ServiceMock.verify(), partsrevisionServiceMock.verify();
          partsUtilV4Mock.verify();

          done();
        })
        .catch((err) => {
          console.log('error: ', err);
          done(err);
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          partsrevisionServiceMock.restore();
          partsUtilV4Mock.restore();
        });
    });
    it(' should return error when the  collection id is invalid', (done) => {
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(testData.id, ['type'])
        .resolves(null);
      partsrevisionServiceMock.expects('getPartsRevisionDataByDate').never();
      partsrevisionServiceMock.expects('handleDateFilterOfPartsData').never();
      partsUtilV4Mock.expects('mergePartsAndProductPartsData').never();
      partsrevisionV4Service
        .getProductPartsDelta(
          testData.id,
          testData.fromdate,
          testData.todate,
          testData.include
        )
        .then((err) => {
          done(new Error('Expecting Part data not found. but got success'));
        })
        .catch((err) => {
          expect(err.message).to.equal('No such collection (product) found');
          expect(err.code).to.equal(404);
          assetV4ServiceMock.verify();
          partsrevisionServiceMock.verify();
          partsUtilV4Mock.verify();
          done();
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          partsrevisionServiceMock.restore();
          partsUtilV4Mock.restore();
        });
    });
    it(' should return error when fromDate is greater than todate', (done) => {
      const fromDate = '2020-07-22';
      const toDate = '2020-07-20';
      assetV4ServiceMock.expects('getAssetById').never();
      partsrevisionServiceMock.expects('getPartsRevisionDataByDate').never();
      partsrevisionServiceMock.expects('handleDateFilterOfPartsData').never();
      partsUtilV4Mock.expects('mergePartsAndProductPartsData').never();
      partsrevisionV4Service
        .getProductPartsDelta(testData.id, fromDate, toDate, testData.include)
        .then((err) => {
          done(new Error('Expecting Part data not found. but got success'));
        })
        .catch((err) => {
          expect(err.message).to.equal(
            'fromDate should be less than or equal to todate'
          );
          expect(err.code).to.equal(400);
          assetV4ServiceMock.verify();
          partsrevisionServiceMock.verify();
          partsUtilV4Mock.verify();
          done();
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          partsrevisionServiceMock.restore();
          partsUtilV4Mock.restore();
        });
    });
    it(' should return empty array when empty partsRevision is passed', (done) => {
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(testData.id, ['type'])
        .resolves({ id: 'some valid-id', type: 'collection' });
      partsrevisionServiceMock
        .expects('getPartsRevisionDataByDate')
        .once()
        .withArgs(testData.id, testData.fromdate, testData.todate)
        .resolves([
          {
            id: 'some-valid-id',
            parts: [{ _id: '1', type: 'book' }]
          }
        ]);
      // partsServiceMock
      //   .expects('getSearchResults')
      //   .once()
      //   .withArgs()
      //   .resolves([]);
      // partsServiceMock
      //   .expects('getSearchResults')
      //   .once()
      //   .withArgs()
      //   .resolves([]);
      // partsServiceMock
      //   .expects('getSearchResults')
      //   .once()
      //   .withArgs()
      //   .resolves([]);
      partsrevisionV4Service
        .getProductPartsDelta(
          testData.id,
          testData.fromdate,
          testData.todate,
          testData.include
        )
        .then((partsdata) => {
          expect(partsdata).to.deep.equal({
            partsAdded: [],
            partsRemoved: [],
            partsUpdated: []
          });
          assetV4ServiceMock.verify(), partsrevisionServiceMock.verify();
          partsUtilV4Mock.verify();
          partsServiceMock.verify();
          done();
        })
        .catch((err) => {
          console.log('error: ', err);
          done(err);
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          partsrevisionServiceMock.restore();
          partsUtilV4Mock.restore();
          partsServiceMock.restore();
        });
    });
    it(' should return partsdata array when  partsRevision is passed', (done) => {
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(testData.id, ['type'])
        .resolves({ id: 'some valid-id', type: 'collection' });
      partsrevisionServiceMock
        .expects('getPartsRevisionDataByDate')
        .once()
        .withArgs(testData.id, testData.fromdate, testData.todate)
        .resolves([
          {
            id: 'some-valid-id',
            parts: [{ _id: '1', type: 'book' }],
            partsAdded: [{ _id: '1', type: 'book' }],
            partsRemoved: [{ _id: '1', type: 'book' }],
            partsUpdated: [{ _id: '1', type: 'book' }]
          }
        ]);
      partsServiceMock
        .expects('getSearchResults')
        .once()
        .withArgs(responseData.partsAdded)
        .resolves([
          {
            _id: '1',
            _source: {
              identifiers: {
                doi: '123',
                isbn: '456'
              },
              title: 'abc',
              type: 'book'
            }
          }
        ]);
      partsServiceMock
        .expects('getSearchResults')
        .once()
        .withArgs(responseData.partsRemoved)
        .resolves([
          {
            _id: '1',
            _source: {
              identifiers: {
                doi: '123',
                isbn: '456'
              },
              title: 'abc',
              type: 'book'
            }
          }
        ]);
      partsServiceMock
        .expects('getSearchResults')
        .once()
        .withArgs(responseData.partsUpdated)
        .resolves([
          {
            _id: '1',
            _source: {
              identifiers: {
                doi: '123',
                isbn: '456'
              },
              title: 'abc',
              type: 'book'
            }
          }
        ]);
      partsrevisionV4Service
        .getProductPartsDelta(
          testData.id,
          testData.fromdate,
          testData.todate,
          testData.include
        )
        .then((partsdata) => {
          expect(partsdata).to.deep.equal(finalData);
          assetV4ServiceMock.verify(), partsrevisionServiceMock.verify();
          partsUtilV4Mock.verify();
          partsServiceMock.verify();
          done();
        })
        .catch((err) => {
          console.log('error: ', err);
          done(err);
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          partsrevisionServiceMock.restore();
          partsUtilV4Mock.restore();
          partsServiceMock.restore();
        });
    });
    it(' should return error when parts data not found for given id', (done) => {
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(testData.id, ['type'])
        .resolves({ id: 'some valid-id', type: 'collection' });
      partsrevisionServiceMock
        .expects('getPartsRevisionDataByDate')
        .once()
        .withArgs(testData.id, testData.fromdate, testData.todate)
        .resolves(null);
      partsrevisionServiceMock.expects('handleDateFilterOfPartsData').never();
      partsUtilV4Mock.expects('mergePartsAndProductPartsData').never();
      partsrevisionV4Service
        .getProductPartsDelta(
          testData.id,
          testData.fromdate,
          testData.todate,
          testData.include
        )
        .then((err) => {
          done(new Error('Expecting Part data not found. but got success'));
        })
        .catch((err) => {
          expect(err.message).to.equal(
            'Parts data not found for this product.'
          );
          expect(err.code).to.equal(404);
          assetV4ServiceMock.verify();
          partsrevisionServiceMock.verify();
          partsUtilV4Mock.verify();
          done();
        })
        .finally(() => {
          assetV4ServiceMock.restore();
          partsrevisionServiceMock.restore();
          partsUtilV4Mock.restore();
        });
    });
  });
});
