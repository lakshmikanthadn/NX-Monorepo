import { StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import { expect } from 'chai';
import { productTransform } from './ProductTransform';

describe('ProductTransform', () => {
  describe('productTransform', () => {
    it('should throw error when the product is null', () => {
      const product: StorageModel.Product = null as StorageModel.Product;
      try {
        productTransform.transform(product);
        throw new Error('Expecting error, but got success');
      } catch (err) {
        expect(err.message).to.equal('Invalid product.');
      }
    });
    it('should remove the private properties of the product', () => {
      const product = {
        _id: 'some-id',
        _source: {
          _createdDate: new Date('2020-02-06T11:38:12.849+00:00'),
          _isSellable: true,
          _modifiedDate: new Date('2020-02-06T11:38:12.849+00:00'),
          _schemaVersion: '4.0.1',
          _sources: [],
          identifiers: {
            isbn: 'some-isbn'
          },
          title: 'some-title',
          type: 'book',
          version: null
        },
        sort: [0, 'some-id']
      };
      const transformedProductProperties = [
        '_id',
        'searchAfterParams',
        'identifiers',
        'title',
        'type',
        'version'
      ];
      const transformedProduct = productTransform.transform(product);
      expect(transformedProduct).to.be.an('object');
      expect(Object.keys(transformedProduct)).to.eql(
        transformedProductProperties
      );
    });
    it('should NOT transform firstPublishedYearNumber property of the book', () => {
      const product = {
        _id: 'some-id',
        _source: {
          _createdDate: new Date('2020-02-06T11:38:12.849+00:00'),
          _isSellable: true,
          _modifiedDate: new Date('2020-02-06T11:38:12.849+00:00'),
          _schemaVersion: '4.0.1',
          _sources: [],
          book: {
            firstPublishedYear: 2020,
            firstPublishedYearNumber: 2010
          },
          identifiers: {
            isbn: 'some-isbn'
          },
          title: 'some-title',
          version: null
        },
        sort: [0, 'some-id']
      };
      const transformedProductProperties = [
        '_id',
        'searchAfterParams',
        'book',
        'identifiers',
        'title',
        'version'
      ];
      const transformedProduct = productTransform.transform(product);
      expect(transformedProduct).to.be.an('object');
      expect(Object.keys(transformedProduct)).to.eql(
        transformedProductProperties
      );
      expect(transformedProduct.book.firstPublishedYear).to.equal('2020');
    });

    it('should NOT transform firstPublishedYearNumber property of creativeWork', () => {
      const product = {
        _id: 'some-id',
        _source: {
          _createdDate: new Date('2020-02-06T11:38:12.849+00:00'),
          _id: 'some-id',
          _modifiedDate: new Date('2020-02-06T11:38:12.849+00:00'),
          _schemaVersion: '4.0.1',
          _sources: [],
          creativeWork: {
            firstPublishedYear: 2020
          },
          identifiers: {
            isbn: 'some-isbn'
          },
          title: 'some-title',
          version: null
        },
        sort: [0, 'some-id']
      };
      const transformedProductProperties = [
        '_id',
        'searchAfterParams',
        'creativeWork',
        'identifiers',
        'title',
        'version'
      ];
      const transformedProduct = productTransform.transform(product);
      expect(transformedProduct).to.be.an('object');
      expect(Object.keys(transformedProduct)).to.eql(
        transformedProductProperties
      );
      expect(transformedProduct.creativeWork.firstPublishedYear).to.equal(2020);
    });
  });
});
