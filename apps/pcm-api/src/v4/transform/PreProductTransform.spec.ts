import { StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import { expect } from 'chai';
import { preProductTransform } from './PreProductTransform';

describe('PreProductTransform', () => {
  describe('preProductTransform', () => {
    it('should throw error when the product is null', () => {
      const product: StorageModel.Product = null as StorageModel.Product;
      try {
        preProductTransform.transform(product);
        throw new Error('Expecting error, but got success');
      } catch (err) {
        expect(err.message).to.equal('Invalid preProduct.');
      }
    });
    it('should remove the private properties of the product', () => {
      const product: StorageModel.Product = {
        _createdDate: new Date('2020-02-06T11:38:12.849+00:00'),
        _id: 'some-id',
        _isSellable: true,
        _modifiedDate: new Date('2020-02-06T11:38:12.849+00:00'),
        _schemaVersion: '4.0.1',
        _sources: [],
        _status: '',
        categories: [],
        contributors: [],
        identifiers: {
          isbn: 'some-isbn'
        },
        permissions: [],
        title: 'some-title',
        type: 'book',
        version: ''
      } as StorageModel.Product;
      const transformedProductProperties = [
        '_id',
        '_status',
        'categories',
        'contributors',
        'identifiers',
        'permissions',
        'title',
        'type',
        'version'
      ];
      const transformedProduct = preProductTransform.transform(product);
      expect(transformedProduct).to.be.an('object');
      expect(Object.keys(transformedProduct)).to.eql(
        transformedProductProperties
      );
    });
  });
});
