import { SchemaMapperV4 } from '@tandfgroup/pcm-schema-mapper-v4';
import { expect } from 'chai';
import {
  findCommonPath,
  getCommonRootAttribute,
  handleGroupedQueries
} from './GroupedQueries';

describe('GroupedQueries', () => {
  describe('handleGroupedQueries', () => {
    it(`should use normal logicalBuilder() when $elemMatch condition
         is not required with "&" operation`, () => {
      const testMiddleChunk = '0&1';
      const testCriteriaRuleHolder = [
        { type: { $eq: 'book' } },
        { format: { $eq: 'EBK' } }
      ];
      const query = {
        $and: [{ type: { $eq: 'book' } }, { format: { $eq: 'EBK' } }]
      };
      const resultData = handleGroupedQueries(
        '&',
        testMiddleChunk,
        testCriteriaRuleHolder,
        SchemaMapperV4['book']
      );
      expect(resultData).to.deep.equal(query);
    });
    it(`should use $elemMatch when $elemMatch condition found with "&" operation`, () => {
      const testMiddleChunk = '1&2';
      const testCriteriaRuleHolder = [
        { type: { $eq: 'book' } },
        { 'prices.price': { $eq: 100 } },
        { 'prices.currency': { $eq: 'GBP' } }
      ];
      const query = {
        prices: {
          $elemMatch: {
            $and: [{ price: { $eq: 100 } }, { currency: { $eq: 'GBP' } }]
          }
        }
      };
      const resultData = handleGroupedQueries(
        '&',
        testMiddleChunk,
        testCriteriaRuleHolder,
        SchemaMapperV4['book']
      );
      expect(resultData).to.deep.equal(query);
    });
    it('should return Invalid Query string when "&" or "|" is not available in middle', (done) => {
      try {
        const testMiddleChunk = '01';
        const testCriteriaRuleHolder = [
          { 'prices.price': { $eq: 100 } },
          { 'prices.currency': { $eq: 'GBP' } }
        ];
        const resultData = handleGroupedQueries(
          '',
          testMiddleChunk,
          testCriteriaRuleHolder,
          SchemaMapperV4['book']
        );
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Query string');
        done();
      }
    });
    it(`should use normal logicalBuilder() when $elemMatch condition
         is not required with "|" operation`, () => {
      const testMiddleChunk = '0|1';
      const testCriteriaRuleHolder = [
        { type: { $eq: 'book' } },
        { format: { $eq: 'EBK' } }
      ];
      const query = {
        $or: [{ type: { $eq: 'book' } }, { format: { $eq: 'EBK' } }]
      };
      const resultData = handleGroupedQueries(
        '|',
        testMiddleChunk,
        testCriteriaRuleHolder,
        SchemaMapperV4['book']
      );
      expect(resultData).to.deep.equal(query);
    });
    it(`should use $elemMatch when $elemMatch condition found with "|" operation`, () => {
      const testMiddleChunk = '1|2';
      const testCriteriaRuleHolder = [
        { type: { $eq: 'book' } },
        { 'prices.price': { $eq: 100 } },
        { 'prices.currency': { $eq: 'GBP' } }
      ];
      const query = {
        prices: {
          $elemMatch: {
            $or: [{ price: { $eq: 100 } }, { currency: { $eq: 'GBP' } }]
          }
        }
      };
      const resultData = handleGroupedQueries(
        '|',
        testMiddleChunk,
        testCriteriaRuleHolder,
        SchemaMapperV4['book']
      );
      expect(resultData).to.deep.equal(query);
    });
    it(`should not go for $elemMatch when keys are same with dot notation`, () => {
      const testMiddleChunk = '0|1';
      const testCriteriaRuleHolder = [
        { 'rights.drm': { $in: [true] } },
        { 'rights.drm': { $in: [false] } }
      ];

      const query = {
        $or: [
          { 'rights.drm': { $in: [true] } },
          { 'rights.drm': { $in: [false] } }
        ]
      };
      const resultData = handleGroupedQueries(
        '|',
        testMiddleChunk,
        testCriteriaRuleHolder,
        SchemaMapperV4['book']
      );
      expect(resultData).to.deep.equal(query);
    });
    it(`should use $elemMatch when $elemMatch condition found with "&" operation`, () => {
      const testMiddleChunk = '1&2&3';
      const testCriteriaRuleHolder = [
        { type: { $eq: 'book' } },
        { 'prices.price': { $eq: 100 } },
        { 'prices.currency': { $eq: 'GBP' } },
        { 'prices.priceTypeCode': { $in: ['BYO'] } }
      ];
      const query = {
        prices: {
          $elemMatch: {
            $and: [
              { price: { $eq: 100 } },
              { currency: { $eq: 'GBP' } },
              { priceTypeCode: { $in: ['BYO'] } }
            ]
          }
        }
      };
      const resultData = handleGroupedQueries(
        '&',
        testMiddleChunk,
        testCriteriaRuleHolder,
        SchemaMapperV4['book']
      );
      expect(resultData).to.deep.equal(query);
    });
  });
  describe('getCommonRootAttribute', () => {
    it(`should return root element`, () => {
      const queries = [
        { 'rights.drm': { $eq: true } },
        { 'rights.abc': { $eq: false } }
      ];
      const resultRoot = 'rights';
      const resultData = getCommonRootAttribute(queries);
      expect(resultData).to.deep.equal(resultRoot);
    });
    it(`should return '' when root is not found`, () => {
      const queries = [{ drm: { $eq: true } }, { abc: { $eq: false } }];
      const resultRoot = '';
      const resultData = getCommonRootAttribute(queries);
      expect(resultData).to.deep.equal(resultRoot);
    });
    it(`should return '' when 2 key appears that it has root but not exactly`, () => {
      const queries = [
        { rights: { $eq: true } },
        { 'rights.abc': { $eq: false } }
      ];
      const resultRoot = '';
      const resultData = getCommonRootAttribute(queries);
      expect(resultData).to.deep.equal(resultRoot);
    });
    it(`should return '' when root is same as the key`, () => {
      const queries = [
        { 'rights.drm': { $eq: true } },
        { 'rights.drm': { $eq: false } }
      ];
      const resultRoot = '';
      const resultData = getCommonRootAttribute(queries);
      expect(resultData).to.deep.equal(resultRoot);
    });
    it(`should return root element as 'prices'`, () => {
      const queries = [
        { 'prices.price': { $gte: 1500 } },
        { 'prices.priceTypeCode': { $in: ['BYO'] } },
        { 'prices.currency': { $in: ['GBP'] } }
      ];
      const resultRoot = 'prices';
      const resultData = getCommonRootAttribute(queries);
      expect(resultData).to.deep.equal(resultRoot);
    });

    it(`return common element i.e level 1 when 2 strings level 1 are same`, () => {
      const first = 'rights.drm';
      const second = 'rights.abc';
      const result = 'rights';
      const resultData = findCommonPath([first, second]);
      expect(resultData).to.deep.equal(result);
    });
    it(`return '' empty string when 2 strings level 1 are not same`, () => {
      const first = 'drm';
      const second = 'abc';
      const result = '';
      const resultData = findCommonPath([first, second]);
      expect(resultData).to.deep.equal(result);
    });
    it(`return common element when string 1 looks same as string 2 but not exactly`, () => {
      const first = 'rights';
      const second = 'rights.abc';
      const result = 'rights';
      const resultData = findCommonPath([first, second]);
      expect(resultData).to.deep.equal(result);
    });
    it(`return common element when both strings are same`, () => {
      const first = 'rights.abc';
      const second = 'rights.abc';
      const result = 'rights.abc';
      const resultData = findCommonPath([first, second]);
      expect(resultData).to.deep.equal(result);
    });
  });
});
