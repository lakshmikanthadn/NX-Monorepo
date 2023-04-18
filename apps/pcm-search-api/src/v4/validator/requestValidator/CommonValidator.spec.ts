import { GroupedSearchQuery } from '@tandfgroup/pcm-rules-parser';
import { expect } from 'chai';

import { commonValidator } from './CommonValidator';

describe('CommonValidator', () => {
  describe('validateOffsetLimit', () => {
    it(`should pass validation when offset = '0' & limit = '1' `, (done) => {
      const offset = '0';
      const limit = '1';
      try {
        const errors = commonValidator.validateOffsetLimit(offset, limit);
        expect(errors.length, JSON.stringify(errors)).to.equal(0);
        done();
      } catch (error) {
        done(error);
      }
    });
    it(`should return error when limit is invalid `, (done) => {
      const offset = '0';
      const limit = 'limit';
      const errors = commonValidator.validateOffsetLimit(offset, limit);
      expect(errors.length, JSON.stringify(errors)).to.equal(1);
      expect(errors[0]).to.equal('Invalid query parameter: limit');
      done();
    });
    it(`should return error when offset is invalid `, (done) => {
      const offset = 'offset';
      const limit = '1';
      const errors = commonValidator.validateOffsetLimit(offset, limit);
      expect(errors.length, JSON.stringify(errors)).to.equal(1);
      expect(errors[0]).to.equal('Invalid query parameter: offset');
      done();
    });
    it(`should return error when limit < 0 i.e negative limit `, (done) => {
      const offset = '0';
      const limit = '-5';
      const errors = commonValidator.validateOffsetLimit(offset, limit);
      expect(errors.length, JSON.stringify(errors)).to.equal(1);
      expect(errors[0]).to.equal('limit should be between 1 - 50');
      done();
    });
    it(`should return error when limit > default limit(50) `, (done) => {
      const offset = '0';
      const limit = '55';
      const errors = commonValidator.validateOffsetLimit(offset, limit);
      expect(errors.length, JSON.stringify(errors)).to.equal(1);
      expect(errors[0]).to.equal('limit should be between 1 - 50');
      done();
    });
  });

  describe('validateSearchQuery', () => {
    let rulesList: GroupedSearchQuery[] = [];
    beforeEach(() => {
      rulesList = [
        {
          attributes: ['title', 'identifiers.isbn'],
          rules: [
            {
              position: 1,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 4,
              rule: {
                attribute: 'identifiers.isbn',
                relationship: 'IN',
                values: ['9780203357644']
              },
              type: 'criteria'
            },
            {
              position: 5,
              rule: {
                value: 'END'
              },
              type: 'separator'
            }
          ],
          type: 'book'
        }
      ];
    });
    it('should return when rulesList is undefined', () => {
      const errors = commonValidator.validateSearchQuery(undefined, 'book');
      expect(errors.length, JSON.stringify(errors)).to.equal(1);
      expect(errors[0]).to.equal('Invalid or missing search rules.');
    });
    it('should return when requested ProductType is not available in search query', () => {
      const errors = commonValidator.validateSearchQuery(rulesList, 'chapter');
      expect(errors.length, JSON.stringify(errors)).to.equal(1);
      expect(errors[0]).to.equal(
        'Requested Product type is not available in search query.'
      );
    });
    it('should return when attributes in rulesList is not array', () => {
      rulesList[0].attributes = {} as any;
      const errors = commonValidator.validateSearchQuery(rulesList);
      expect(errors.length, JSON.stringify(errors)).to.equal(1);
      expect(errors[0]).to.equal('Invalid attribute parameters in the rules.');
    });
    it(`should return invalid availability filter when root level
      availability is passed`, () => {
      rulesList = [
        {
          rules: [
            {
              name: 'product',
              rules: [
                {
                  rule: {
                    value: 'BEGIN'
                  },
                  type: 'separator'
                },
                {
                  rule: {
                    value: 'BEGIN'
                  },
                  type: 'separator'
                },
                {
                  rule: {
                    attribute: 'book.firstPublishedYear',
                    relationship: 'GE',
                    value: '2000'
                  },
                  type: 'criteria'
                },
                {
                  rule: {
                    value: 'END'
                  },
                  type: 'separator'
                },
                {
                  rule: {
                    value: 'END'
                  },
                  type: 'separator'
                }
              ],
              type: 'group'
            }
          ],
          rulesString: '',
          type: 'book'
        }
      ];
      const availability = {
        name: '',
        status: []
      };
      const errors = commonValidator.validateSearchQuery(
        rulesList,
        'book',
        availability
      );
      expect(errors.length, JSON.stringify(errors)).to.equal(1);
      expect(errors[0]).to.equal(
        'Invalid availability filter, Grouped-SearchQuery ' +
          'will not support root level availability filter'
      );
    });
    it('should return when rulesList has duplicate rules in it', () => {
      rulesList[1] = rulesList[0];
      const errors = commonValidator.validateSearchQuery(rulesList, 'book');
      expect(errors.length, JSON.stringify(errors)).to.equal(1);
      expect(errors[0]).to.equal(
        'Invalid search query: duplicate rules for same type.'
      );
    });
    it('should return empty error object when rulesList is valid', () => {
      const errors = commonValidator.validateSearchQuery(rulesList, 'book');
      expect(errors.length, JSON.stringify(errors)).to.equal(0);
    });
  });

  describe('validateAvailability', () => {
    it(`should pass validation when availability is valid`, (done) => {
      const availability = [
        {
          name: 'UBX',
          status: {
            ALL: ['SELLABLE', 'CAN_HOST']
          }
        },
        {
          name: 'SALESFORCE',
          status: {
            IN: ['SELLABLE', 'CAN_HOST']
          }
        }
      ];
      try {
        const errors = commonValidator.validateAvailability(availability);
        expect(errors.length, JSON.stringify(errors)).to.equal(0);
        done();
      } catch (error) {
        done(error);
      }
    });
    it(`should return error when availability filter has more than one operator `, (done) => {
      const availability = [
        {
          name: 'UBX',
          status: {
            ALL: ['SELLABLE', 'CAN_HOST'],
            ANY: ['SELLABLE', 'CAN_HOST']
          }
        }
      ];
      const errors = commonValidator.validateAvailability(availability);
      expect(errors.length, JSON.stringify(errors)).to.equal(1);
      expect(errors[0]).to.equal(
        'Invalid availability filter, only one operator is allowed for status'
      );
      done();
    });
    it(`should return error when availability filter operator has value other
        than "ALL and IN"`, (done) => {
      const availability = [
        {
          name: 'UBX',
          status: {
            ANY: ['SELLABLE', 'CAN_HOST']
          }
        }
      ];
      const errors = commonValidator.validateAvailability(availability);
      expect(errors.length, JSON.stringify(errors)).to.equal(1);
      expect(errors[0]).to.equal(
        'Invalid operator ANY in the availability filter.'
      );
      done();
    });
    it(`should return error when limit is invalid `, (done) => {
      const availability = [];
      const errors = commonValidator.validateAvailability(availability);
      expect(errors.length, JSON.stringify(errors)).to.equal(1);
      expect(errors[0]).to.equal(
        'At least one filter is required for each of the availability ' +
          'channel mentioned in the query'
      );
      done();
    });
    it(`should return error when status field is missing in availability`, (done) => {
      const availability = [
        {
          name: 'UBX'
        }
      ];
      const errors = commonValidator.validateAvailability(availability);
      expect(errors.length, JSON.stringify(errors)).to.equal(1);
      expect(errors[0]).to.equal(
        'Missing availability.status in the request parameters.'
      );
      done();
    });
  });

  describe('validateOffsetCursor', () => {
    it(`should pass validation when offsetCursor is valid`, (done) => {
      const offsetCursor =
        '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896:6d4fb6ac-55f9-4a7a-9cfb-81085a8a6898:0_6d4fb6ac-55f9-4a7a-9cfb-81085a8a6898_desc';
      const errors = commonValidator.validateOffsetCursor(offsetCursor);
      expect(errors.length, JSON.stringify(errors)).to.equal(0);
      done();
    });
    it(`should pass validation when value of offsetCursor is last-page-cursor`, (done) => {
      const offsetCursor = 'last-page-cursor';
      const errors = commonValidator.validateOffsetCursor(offsetCursor);
      expect(errors.length, JSON.stringify(errors)).to.equal(0);
      done();
    });
    it(`should return error when value of offsetCursor is random invalid string`, (done) => {
      const offsetCursor = 'abcd';
      const errors = commonValidator.validateOffsetCursor(offsetCursor);
      expect(errors.length, JSON.stringify(errors)).to.equal(1);
      expect(errors[0]).to.equal(`Invalid offsetCursor : ${offsetCursor}`);
      done();
    });
    it(`should return error when value of offsetCursor string has invalid UUID`, (done) => {
      const offsetCursor =
        'x:6d4fb6ac-55f9-4a7a-9cfb-81085a8a6898:0_6d4fb6ac-55f9-4a7a-9cfb-81085a8a6898_asc';
      const errors = commonValidator.validateOffsetCursor(offsetCursor);
      expect(errors.length, JSON.stringify(errors)).to.equal(1);
      expect(errors[0]).to.equal(`Invalid offsetCursor : ${offsetCursor}`);
      done();
    });
    it(`should return error when type of offsetCursor is not string`, (done) => {
      const offsetCursor = 300;
      const errors = commonValidator.validateOffsetCursor(offsetCursor as any);
      expect(errors.length, JSON.stringify(errors)).to.equal(1);
      expect(errors[0]).to.equal(`Invalid offsetCursor : ${offsetCursor}`);
      done();
    });
  });
});
