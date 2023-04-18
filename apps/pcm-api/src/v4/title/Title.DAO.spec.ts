import { MongooseSchema } from '@tandfgroup/pcm-entity-model-v4';
import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';

import * as titlesData from '../../../test/data/titles.json';
import { Config } from '../../config/config';
import { titleDao } from './Title.DAO';
import { IFetchVariantFilters } from './Title.Model';

const docTypeToCollectionMapping = Config.getPropertyValue(
  'docTypeToCollectionMapping'
);

describe('TitleDAO', () => {
  let mongoServer;
  before(async () => {
    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getConnectionString();
    await mongoose
      .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => {
        console.log('Connection to Test MongoDB is success.');
      })
      .catch((err) => {
        console.log('Connection to Test MongoDB is failed.', err);
      });
    const TestTitles = mongoose.model(
      'TestTitles',
      MongooseSchema.Title,
      docTypeToCollectionMapping.title
    );
    await TestTitles.insertMany(titlesData);
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  describe('getProductVariantsByIds', () => {
    it('should throw error when products are not available for given isbn', (done) => {
      const idName = 'isbn';
      const idValues = ['123'];
      titleDao
        .getProductVariantsByIds(idName, idValues, {} as IFetchVariantFilters)
        .then(() => {
          done(new Error('Expecting error, got success.'));
        })
        .catch((error) => {
          expect(error.message).to.equal(`Variants not found.`);
          expect(error.code).to.equal(404);
          done();
        });
    });
    it('should return products when products are avaiable for given isbn', (done) => {
      const idName = 'isbn';
      const idValues = ['97815254180'];
      const includeEditions = true;
      titleDao
        .getProductVariantsByIds(idName, idValues, {
          includeEditions
        } as IFetchVariantFilters)
        .then((titleVariants) => {
          expect(titleVariants).to.be.an('array');
          expect(titleVariants.length).to.equal(1);
          expect(titleVariants[0]).to.have.property('variants');
          expect(titleVariants[0]).to.have.property('identifier');
          expect(titleVariants[0].variants).to.be.an('array');
          expect(titleVariants[0].variants.length).to.equal(8);
          done();
        })
        .catch(done);
    });

    it(
      'should return products of edition 2 when includeEditions = false and ' +
        'the input isbn belongs to edition 2',
      (done) => {
        const idName = 'isbn';
        const idValues = ['97815254180'];
        const includeEditions = false;
        titleDao
          .getProductVariantsByIds(idName, idValues, {
            includeEditions
          } as IFetchVariantFilters)
          .then((titleVariants) => {
            expect(titleVariants).to.be.an('array');
            expect(titleVariants.length).to.equal(1);
            expect(idValues).to.include(titleVariants[0].identifier.value);
            expect(titleVariants[0]).to.have.property('variants');
            expect(titleVariants[0]).to.have.property('identifier');
            expect(titleVariants[0].variants).to.be.an('array');
            expect(titleVariants[0].variants.length).to.equal(4);
            const allIsbns = [];
            titleVariants[0].variants.forEach((variant) => {
              expect(variant.book).to.have.property('edition').to.equal('2');
              allIsbns.push(variant.identifiers.isbn);
            });
            expect(allIsbns).to.include(idValues[0]);
            done();
          })
          .catch(done);
      }
    );
    it(
      'should return only two variants for the given isbn when includeEditions = false and' +
        'formats = ["e-Book", "mobi"]',
      (done) => {
        const idName = 'isbn';
        const idValues = ['97815254180'];
        const includeEditions = false;
        const formats = ['e-Book', 'mobi'];
        titleDao
          .getProductVariantsByIds(idName, idValues, {
            formats,
            includeEditions
          } as IFetchVariantFilters)
          .then((titleVariants) => {
            expect(titleVariants).to.be.an('array');
            expect(titleVariants.length).to.equal(1);
            expect(idValues).to.include(titleVariants[0].identifier.value);
            expect(titleVariants[0]).to.have.property('variants');
            expect(titleVariants[0]).to.have.property('identifier');
            expect(titleVariants[0].variants).to.be.an('array');
            expect(titleVariants[0].variants.length).to.equal(2);
            titleVariants[0].variants.forEach((variant) => {
              expect(variant).to.have.property('book');
              expect(variant.book).to.have.property('edition').to.equal('2');
              expect(formats).to.include(variant.book.format);
            });
            done();
          })
          .catch(done);
      }
    );

    it('should return titles for two products when two identifiers are passed', (done) => {
      const idName = 'isbn';
      const idValues = ['97815254180', '9781136535062'];
      const includeEditions = true;
      const formats = ['e-Book', 'mobi', 'webpdf', 'epub'];
      titleDao
        .getProductVariantsByIds(idName, idValues, {
          formats,
          includeEditions
        } as IFetchVariantFilters)
        .then((titleVariants) => {
          expect(titleVariants).to.be.an('array');
          expect(titleVariants.length).to.equal(2);
          titleVariants.forEach((titleVariant) => {
            expect(idValues).to.include(titleVariant.identifier.value);
            expect(titleVariant).to.have.property('variants');
            expect(titleVariant).to.have.property('identifier');
            expect(titleVariant.variants).to.be.an('array');
            expect(titleVariant.variants.length).to.equal(8);
            titleVariant.variants.forEach((variant) => {
              expect(variant).to.have.property('book');
            });
          });
          done();
        })
        .catch(done);
    });

    it('should have all the properties for each product variant', (done) => {
      const idName = 'isbn';
      const idValues = ['97815254180', '9781136535062'];
      const includeEditions = true;
      const formats = ['e-Book', 'mobi', 'webpdf', 'epub'];
      titleDao
        .getProductVariantsByIds(idName, idValues, {
          formats,
          includeEditions
        } as IFetchVariantFilters)
        .then((titleVariants) => {
          expect(titleVariants).to.be.an('array');
          expect(titleVariants.length).to.equal(2);
          titleVariants.forEach((titleVariant) => {
            expect(idValues).to.include(titleVariant.identifier.value);
            expect(titleVariant).to.have.property('variants');
            expect(titleVariant).to.have.property('identifier');
            expect(titleVariant.variants).to.be.an('array');
            expect(titleVariant.variants.length).to.equal(8);
            titleVariant.variants.forEach((variant) => {
              expect(variant, '_id property check').to.have.property('_id');
              expect(variant, 'title property check').to.have.property('title');
              expect(variant, 'book property check').to.have.property('book');
              expect(variant.book, 'edition property check').to.have.property(
                'edition'
              );
              expect(variant.book, 'format property check').to.have.property(
                'format'
              );
              expect(
                variant.book,
                'publisherImprint property check'
              ).to.have.property('publisherImprint');
              expect(variant.book, 'status property check').to.have.property(
                'status'
              );
              expect(variant, 'identifiers property check').to.have.property(
                'identifiers'
              );
              expect(
                variant.identifiers,
                'dacKey property check'
              ).to.have.property('dacKey');
              expect(
                variant.identifiers,
                'doi property check'
              ).to.have.property('doi');
              expect(
                variant.identifiers,
                'isbn property check'
              ).to.have.property('isbn');
              expect(
                variant.identifiers,
                'isbn10 property check'
              ).to.have.property('isbn10');
              expect(variant, 'version property check').to.have.property(
                'version'
              );
              expect(variant).to.have.property('book');
            });
          });
          done();
        })
        .catch(done);
    });
    it(
      'should return variants to corresponding isbns when two isbns are matching ' +
        'same title but different editions and includeEdition is false',
      (done) => {
        const idName = 'isbn';
        const isbnOfEditionOne = '9781136535048';
        const isbnOfEditionTwo = '9781315754116';
        const idValues = [isbnOfEditionOne, isbnOfEditionTwo, '97851933278'];
        const includeEditions = false;
        const formats = ['e-Book', 'mobi', 'webpdf', 'epub'];
        titleDao
          .getProductVariantsByIds(idName, idValues, {
            formats,
            includeEditions
          } as IFetchVariantFilters)
          .then((titleVariants) => {
            expect(titleVariants).to.be.an('array');
            expect(titleVariants.length).to.equal(3);
            const variantsOfIsbn1 = titleVariants.find(
              (tV) => tV.identifier.value === isbnOfEditionOne
            );
            const variantsOfIsbn2 = titleVariants.find(
              (tV) => tV.identifier.value === isbnOfEditionTwo
            );
            expect(variantsOfIsbn1.variants.length).to.equal(4);
            expect(variantsOfIsbn2.variants.length).to.equal(4);
            variantsOfIsbn1.variants.forEach((variant) => {
              expect(variant.book.edition).to.equal('1');
            });
            variantsOfIsbn2.variants.forEach((variant) => {
              expect(variant.book.edition).to.equal('2');
            });
            done();
          })
          .catch(done);
      }
    );

    it(
      'should return all the variants of a title when two isbns are matching ' +
        'same title but different editions and includeEdition is true',
      (done) => {
        const idName = 'isbn';
        const isbnOfEditionOne = '9781136535048';
        const isbnOfEditionTwo = '9781315754116';
        const idValues = [isbnOfEditionOne, isbnOfEditionTwo, '97851933278'];
        const includeEditions = true;
        const formats = ['e-Book', 'mobi', 'webpdf', 'epub'];
        titleDao
          .getProductVariantsByIds(idName, idValues, {
            formats,
            includeEditions
          } as IFetchVariantFilters)
          .then((titleVariants) => {
            expect(titleVariants).to.be.an('array');
            expect(titleVariants.length).to.equal(3);
            const variantsOfIsbn1 = titleVariants.find(
              (tV) => tV.identifier.value === isbnOfEditionOne
            );
            const variantsOfIsbn2 = titleVariants.find(
              (tV) => tV.identifier.value === isbnOfEditionTwo
            );
            expect(variantsOfIsbn1.variants.length).to.equal(8);
            expect(variantsOfIsbn2.variants.length).to.equal(8);
            done();
          })
          .catch(done);
      }
    );
    it(
      'should return all the variants of a title when two isbns are matching ' +
        'same title and same editions and includeEdition is true',
      (done) => {
        const idName = 'isbn';
        const isbn1OfEditionOne = '9781136535048';
        const isbn2OfEditionOne = '9781136535062';
        const idValues = [isbn1OfEditionOne, isbn2OfEditionOne, '97851933278'];
        const includeEditions = true;
        const formats = ['e-Book', 'webpdf'];
        titleDao
          .getProductVariantsByIds(idName, idValues, {
            formats,
            includeEditions
          } as IFetchVariantFilters)
          .then((titleVariants) => {
            expect(titleVariants).to.be.an('array');
            expect(titleVariants.length).to.equal(3);
            const variantsOfIsbn1 = titleVariants.find(
              (tV) => tV.identifier.value === isbn1OfEditionOne
            );
            const variantsOfIsbn2 = titleVariants.find(
              (tV) => tV.identifier.value === isbn2OfEditionOne
            );
            expect(variantsOfIsbn1.variants.length).to.equal(4);
            expect(variantsOfIsbn2.variants.length).to.equal(4);
            expect(variantsOfIsbn1.variants).to.deep.equal(
              variantsOfIsbn2.variants
            );
            done();
          })
          .catch(done);
      }
    );
    it(
      'should return all the variants of a title when two isbns are matching ' +
        'same title and same editions and includeEdition is false',
      (done) => {
        const idName = 'isbn';
        const isbn1OfEditionOne = '9781136535048';
        const isbn2OfEditionOne = '9781136535062';
        const idValues = [isbn1OfEditionOne, isbn2OfEditionOne, '97851933278'];
        const includeEditions = false;
        const formats = ['e-Book', 'webpdf'];
        titleDao
          .getProductVariantsByIds(idName, idValues, {
            formats,
            includeEditions
          } as IFetchVariantFilters)
          .then((titleVariants) => {
            expect(titleVariants).to.be.an('array');
            expect(titleVariants.length).to.equal(3);
            const variantsOfIsbn1 = titleVariants.find(
              (tV) => tV.identifier.value === isbn1OfEditionOne
            );
            const variantsOfIsbn2 = titleVariants.find(
              (tV) => tV.identifier.value === isbn2OfEditionOne
            );
            expect(variantsOfIsbn1.variants.length).to.equal(2);
            expect(variantsOfIsbn2.variants.length).to.equal(2);
            expect(variantsOfIsbn1.variants).to.deep.equal(
              variantsOfIsbn2.variants
            );
            variantsOfIsbn1.variants.forEach((variant) => {
              expect(variant.book.edition).to.equal('1');
            });
            variantsOfIsbn2.variants.forEach((variant) => {
              expect(variant.book.edition).to.equal('1');
            });
            done();
          })
          .catch(done);
      }
    );
  });
});
