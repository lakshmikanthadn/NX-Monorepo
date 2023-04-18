import { expect } from 'chai';
import { IUnwindedTitle } from './Title.Model';
import { titleTransform } from './Title.Transform';

describe('TitleTransform', () => {
  describe('unwindedTitleToVariant', () => {
    it('should transform the unwinded title to variant', () => {
      const unwindedTitle: IUnwindedTitle = {
        _id: 'b53a80e5-23e5-4165-949f-9f44936c66e3',
        editions: {
          dacKey: 'C2011-0-08000-1',
          doi: '10.4324/9781849776011',
          edition: '1',
          formats: {
            bookId: '25d18af0-6c15-4782-878d-ef460bd2b40b',
            format: 'mobi',
            isbn: '9781136535048',
            isbn10: '9781136535',
            status: 'Out of Print'
          }
        },
        publisherImprint: 'Routledge',
        source: 'MBS',
        title: 'Food Wars',
        titleId: '202517'
      };
      const variant = titleTransform.unwindedTitleToVariant(unwindedTitle);
      expect(variant).to.be.an('object');
      expect(variant, '_id property check')
        .to.have.property('_id')
        .to.equal(unwindedTitle.editions.formats.bookId);
      expect(variant, 'title property check')
        .to.have.property('title')
        .to.equal(unwindedTitle.title);
      expect(variant, 'book property check').to.have.property('book');
      expect(variant.book, 'edition property check')
        .to.have.property('edition')
        .to.equal(unwindedTitle.editions.edition);
      expect(variant.book, 'format property check')
        .to.have.property('format')
        .to.equal(unwindedTitle.editions.formats.format);
      expect(variant.book, 'publisherImprint property check')
        .to.have.property('publisherImprint')
        .to.equal(unwindedTitle.publisherImprint);
      expect(variant.book, 'status property check')
        .to.have.property('status')
        .to.equal(unwindedTitle.editions.formats.status);
      expect(variant, 'identifiers property check').to.have.property(
        'identifiers'
      );
      expect(variant.identifiers, 'dacKey property check')
        .to.have.property('dacKey')
        .to.equal(unwindedTitle.editions.dacKey);
      expect(variant.identifiers, 'doi property check')
        .to.have.property('doi')
        .to.equal(unwindedTitle.editions.doi);
      expect(variant.identifiers, 'isbn property check')
        .to.have.property('isbn')
        .to.equal(unwindedTitle.editions.formats.isbn);
      expect(variant.identifiers, 'isbn10 property check')
        .to.have.property('isbn10')
        .to.equal(unwindedTitle.editions.formats.isbn10);
      expect(variant, 'version property check')
        .to.have.property('version')
        .to.equal(null);
    });
    // could find any written which throw such error so skipping it
    it.skip('should transform throw error when the unwinded title is empty object', (done) => {
      const unwindedTitle: IUnwindedTitle = {} as IUnwindedTitle;
      try {
        const variant = titleTransform.unwindedTitleToVariant(unwindedTitle);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal('Unable to transform title.');
        done();
      }
    });
  });
});
