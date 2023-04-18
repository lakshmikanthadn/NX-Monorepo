import { expect } from 'chai';
import * as sinon from 'sinon';

import { titleDao } from './Title.DAO';
import { titleService } from './Title.Service';

describe('TitleService', () => {
  describe('getProductVariantsByIds', () => {
    it('should invoke tilte DAO when service is called with valid parameters', (done) => {
      const titleDaoMock = sinon.mock(titleDao);
      const idName = 'isbn';
      const idValues = ['9781317623144'];
      const formats = ['e-Book', 'mobi'];
      const includeEditions = true;
      const testVariantsInfo = [
        {
          identifier: { name: 'isbn', value: '9781317623144' },
          variants: [
            {
              _id: 'aa3bc35d-4ff0-4ccc-bd83-57ba91a03e56',
              book: {
                edition: '2',
                format: 'e-Book',
                publisherImprint: 'Routledge',
                status: 'Available'
              },
              identifiers: {
                dacKey: 'C2013-0-21702-X',
                doi: '10.4324/9781315754116',
                isbn: '9781315754116',
                isbn10: '1315754118'
              },
              title: 'Food Wars',
              type: 'book',
              version: null
            }
          ]
        }
      ];
      titleDaoMock
        .expects('getProductVariantsByIds')
        .once()
        .withArgs(idName, idValues, { formats, includeEditions })
        .resolves(testVariantsInfo);
      titleService
        .getProductVariantsByIds(idName, idValues, { formats, includeEditions })
        .then((variantsInfo) => {
          expect(variantsInfo).to.be.an('array');
          expect(variantsInfo.length).to.equal(1);
          expect(variantsInfo).to.deep.equal(testVariantsInfo);
          titleDaoMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          titleDaoMock.restore();
        });
    });
    it(`should invoke tilte DAO when service is called with valid parameters
       containing isbn10`, (done) => {
      const titleDaoMock = sinon.mock(titleDao);
      const idName = 'isbn10';
      const idValues = ['1315754118'];
      const formats = ['e-Book', 'mobi'];
      const includeEditions = true;
      const testVariantsInfo = [
        {
          identifier: { name: 'isbn10', value: '1315754118' },
          variants: [
            {
              _id: 'aa3bc35d-4ff0-4ccc-bd83-57ba91a03e56',
              book: {
                edition: '2',
                format: 'e-Book',
                publisherImprint: 'Routledge',
                status: 'Available'
              },
              identifiers: {
                dacKey: 'C2013-0-21702-X',
                doi: '10.4324/9781315754116',
                isbn: '9781315754116',
                isbn10: '1315754118'
              },
              title: 'Food Wars',
              type: 'book',
              version: null
            }
          ]
        }
      ];
      titleDaoMock
        .expects('getProductVariantsByIds')
        .once()
        .withArgs(idName, idValues, { formats, includeEditions })
        .resolves(testVariantsInfo);
      titleService
        .getProductVariantsByIds(idName, idValues, { formats, includeEditions })
        .then((variantsInfo) => {
          expect(variantsInfo).to.be.an('array');
          expect(variantsInfo.length).to.equal(1);
          expect(variantsInfo).to.deep.equal(testVariantsInfo);
          titleDaoMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          titleDaoMock.restore();
        });
    });
    it('should return a empty variant product when product is not present in store', (done) => {
      const titleDaoMock = sinon.mock(titleDao);
      const idName = 'isbn';
      const validId = '9781317623144';
      const invalidId = '97813157XXX';
      const idValues = [validId, invalidId];
      const formats = ['e-Book', 'mobi'];
      const includeEditions = true;
      const testVariantsInfo = [
        {
          identifier: { name: 'isbn', value: '9781317623144' },
          variants: [
            {
              _id: 'aa3bc35d-4ff0-4ccc-bd83-57ba91a03e56',
              book: {
                edition: '2',
                format: 'e-Book',
                publisherImprint: 'Routledge',
                status: 'Available'
              },
              identifiers: {
                dacKey: 'C2013-0-21702-X',
                doi: '10.4324/9781315754116',
                isbn: '9781315754116',
                isbn10: '1315754118'
              },
              title: 'Food Wars',
              type: 'book',
              version: null
            }
          ]
        }
      ];
      titleDaoMock
        .expects('getProductVariantsByIds')
        .once()
        .withArgs(idName, idValues, { formats, includeEditions })
        .resolves(testVariantsInfo);
      titleService
        .getProductVariantsByIds(idName, idValues, { formats, includeEditions })
        .then((variantsInfo) => {
          expect(variantsInfo).to.be.an('array');
          expect(variantsInfo.length).to.equal(2);
          const idWithMissingVariants = variantsInfo.find(
            (v) => v.identifier.value === invalidId
          );
          const idWithValidVariants = variantsInfo.find(
            (v) => v.identifier.value === validId
          );
          expect(idWithValidVariants).to.deep.equal(testVariantsInfo[0]);
          expect(idWithMissingVariants).to.be.an('object');
          expect(idWithMissingVariants).to.have.property('variants');
          expect(idWithMissingVariants.variants.length).to.equal(0);
          titleDaoMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          titleDaoMock.restore();
        });
    });
    it(`should return a empty variant product when product is not present in store and
      request parameter contain isbn10`, (done) => {
      const titleDaoMock = sinon.mock(titleDao);
      const idName = 'isbn10';
      const validId = '1315754118';
      const invalidId = '97813157XXX';
      const idValues = [validId, invalidId];
      const formats = ['e-Book', 'mobi'];
      const includeEditions = true;
      const testVariantsInfo = [
        {
          identifier: { name: 'isbn10', value: '1315754118' },
          variants: [
            {
              _id: 'aa3bc35d-4ff0-4ccc-bd83-57ba91a03e56',
              book: {
                edition: '2',
                format: 'e-Book',
                publisherImprint: 'Routledge',
                status: 'Available'
              },
              identifiers: {
                dacKey: 'C2013-0-21702-X',
                doi: '10.4324/9781315754116',
                isbn: '9781315754116',
                isbn10: '1315754118'
              },
              title: 'Food Wars',
              type: 'book',
              version: null
            }
          ]
        }
      ];
      titleDaoMock
        .expects('getProductVariantsByIds')
        .once()
        .withArgs(idName, idValues, { formats, includeEditions })
        .resolves(testVariantsInfo);
      titleService
        .getProductVariantsByIds(idName, idValues, { formats, includeEditions })
        .then((variantsInfo) => {
          expect(variantsInfo).to.be.an('array');
          expect(variantsInfo.length).to.equal(2);
          const idWithMissingVariants = variantsInfo.find(
            (v) => v.identifier.value === invalidId
          );
          const idWithValidVariants = variantsInfo.find(
            (v) => v.identifier.value === validId
          );
          expect(idWithValidVariants).to.deep.equal(testVariantsInfo[0]);
          expect(idWithMissingVariants).to.be.an('object');
          expect(idWithMissingVariants).to.have.property('variants');
          expect(idWithMissingVariants.variants.length).to.equal(0);
          titleDaoMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          titleDaoMock.restore();
        });
    });
    it('should return same variants info for both isbns when two isbns are same', (done) => {
      const titleDaoMock = sinon.mock(titleDao);
      const idName = 'isbn';
      const validId = '9781317623144';
      const idValues = [validId, validId];
      const formats = ['e-Book', 'mobi'];
      const includeEditions = true;
      const testVariantsInfo = [
        {
          identifier: { name: 'isbn', value: '9781317623144' },
          variants: [
            {
              _id: 'aa3bc35d-4ff0-4ccc-bd83-57ba91a03e56',
              book: {
                edition: '2',
                format: 'e-Book',
                publisherImprint: 'Routledge',
                status: 'Available'
              },
              identifiers: {
                dacKey: 'C2013-0-21702-X',
                doi: '10.4324/9781315754116',
                isbn: '9781315754116',
                isbn10: '1315754118'
              },
              title: 'Food Wars',
              type: 'book',
              version: null
            }
          ]
        }
      ];
      titleDaoMock
        .expects('getProductVariantsByIds')
        .once()
        .withArgs(idName, idValues, { formats, includeEditions })
        .resolves(testVariantsInfo);
      titleService
        .getProductVariantsByIds(idName, idValues, { formats, includeEditions })
        .then((variantsInfo) => {
          expect(variantsInfo).to.be.an('array');
          expect(variantsInfo.length).to.equal(2);
          expect(variantsInfo[0]).to.deep.equal(testVariantsInfo[0]);
          expect(variantsInfo[0]).to.deep.equal(variantsInfo[1]);
          titleDaoMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          titleDaoMock.restore();
        });
    });
  });
});
