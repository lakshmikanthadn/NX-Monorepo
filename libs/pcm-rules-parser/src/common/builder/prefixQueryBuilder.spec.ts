import { expect } from 'chai';

import { PrefixQueryBuilder } from './prefixQueryBuilder';
import { SearchQuery } from '../../common/model/SearchQueryRule';

const prefixQueryBuilder = new PrefixQueryBuilder();

describe('PrefixQueryBuilder', () => {
  describe('build', () => {
    it(`should return prefixed query when valid searchQuery passed`, async () => {
      const testSearchQuery: SearchQuery = {
        rules: [
          {
            position: 0,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 0,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 1,
            rule: {
              attribute: 'book.format',
              relationship: 'EQ',
              value: 'e-Book'
            },
            type: 'criteria'
          },
          {
            position: 0,
            rule: {
              value: 'END'
            },
            type: 'separator'
          },
          {
            position: 2,
            rule: {
              value: 'AND'
            },
            type: 'logical'
          },
          {
            position: 0,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 1,
            rule: {
              attribute: 'availability.status',
              relationship: 'ALL',
              values: ['SELLABLE', 'CAN_HOST']
            },
            type: 'criteria'
          },
          {
            position: 2,
            rule: {
              value: 'AND'
            },
            type: 'logical'
          },
          {
            position: 1,
            rule: {
              attribute: 'availability.status',
              relationship: 'NI',
              values: ['DRM_PROTECTED']
            },
            type: 'criteria'
          },
          {
            position: 2,
            rule: {
              value: 'AND'
            },
            type: 'logical'
          },
          {
            position: 1,
            rule: {
              attribute: 'availability.name',
              relationship: 'EQ',
              value: 'UBX'
            },
            type: 'criteria'
          },
          {
            position: 2,
            rule: {
              value: 'END'
            },
            type: 'separator'
          },
          {
            position: 2,
            rule: {
              value: 'END'
            },
            type: 'separator'
          }
        ],
        type: 'book'
      };
      const resultQuery = prefixQueryBuilder.build(testSearchQuery);
      expect(resultQuery).to.be.an('object');
      expect(resultQuery).to.have.property('type');
      expect(resultQuery).to.have.property('operator');
      expect(resultQuery).to.have.property('children');
    });
    it(`should throw error when separator is invalid`, async () => {
      const testSearchQuery = {
        rules: [
          {
            position: 0,
            rule: {
              value: 'XYZ'
            },
            type: 'separator'
          },
          {
            position: 1,
            rule: {
              attribute: 'book.format',
              relationship: 'EQ',
              value: 'e-Book'
            },
            type: 'criteria'
          },
          {
            position: 0,
            rule: {
              value: 'END'
            },
            type: 'separator'
          }
        ],
        type: 'book'
      } as SearchQuery;
      try {
        prefixQueryBuilder.build(testSearchQuery);
      } catch (err) {
        expect(err.message).to.equal('Invalid Separator at 0');
      }
    });
  });
});
