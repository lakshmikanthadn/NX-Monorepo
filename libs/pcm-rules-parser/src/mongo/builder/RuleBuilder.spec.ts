import { expect } from 'chai';
import { CriteriaRule } from '../../common/model/CriteriaRule';
import { LogicalRule } from '../../common/model/LogicalRule';
import { SearchQuery } from '../../common/model/SearchQueryRule';
import { SeparatorRule } from '../../common/model/SeparatorRule';
import {
  getCriteria,
  getLogical,
  getSeparator,
  handleCriteria,
  prepareQueryByRelation
} from './RuleBuilder';

describe('RuleBuilder', () => {
  it('Should have all the methods', () => {
    expect('prepareQueryByRelation');
    expect('getSeparator');
    expect('getLogical');
    expect('getCriteria');
    expect('handleCriteria');
  });
  describe('prepareQueryByRelation', () => {
    it('should convert operands based on AND operation in mongo', () => {
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
            position: 1,
            rule: {
              attribute: 'type',
              relationship: 'EQ',
              value: 'Book'
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
            position: 3,
            rule: {
              attribute: 'format',
              relationship: 'EQ',
              value: 'EBK'
            },
            type: 'criteria'
          },
          {
            position: 4,
            rule: {
              value: 'END'
            },
            type: 'separator'
          }
        ],
        type: 'Book'
      };
      const testCriteriaRuleHolder = [
        { type: { $eq: 'Book' } },
        { format: { $eq: 'EBK' } }
      ];
      const resultQueryData = prepareQueryByRelation(testSearchQuery);
      const resultCriteriaRuleHolder = resultQueryData.criteriaRuleHolder;
      const resultSearchQueryTemplate = resultQueryData.searchQueryTemplate;
      expect(resultSearchQueryTemplate).to.equal('(0&1)');
      expect(resultCriteriaRuleHolder.length).to.equal(2);
      expect(resultCriteriaRuleHolder).to.deep.equal(testCriteriaRuleHolder);
    });
    it('should convert operands based on OR operation in mongo', () => {
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
            position: 1,
            rule: {
              attribute: 'type',
              relationship: 'EQ',
              value: 'Book'
            },
            type: 'criteria'
          },
          {
            position: 2,
            rule: {
              value: 'OR'
            },
            type: 'logical'
          },
          {
            position: 3,
            rule: {
              attribute: 'format',
              relationship: 'EQ',
              value: 'EBK'
            },
            type: 'criteria'
          },
          {
            position: 4,
            rule: {
              value: 'END'
            },
            type: 'separator'
          }
        ],
        type: 'Book'
      };
      const testCriteriaRuleHolder = [
        { type: { $eq: 'Book' } },
        { format: { $eq: 'EBK' } }
      ];
      const resultQueryData = prepareQueryByRelation(testSearchQuery);
      const resultCriteriaRuleHolder = resultQueryData.criteriaRuleHolder;
      const resultSearchQueryTemplate = resultQueryData.searchQueryTemplate;
      expect(resultSearchQueryTemplate).to.equal('(0|1)');
      expect(resultCriteriaRuleHolder.length).to.equal(2);
      expect(resultCriteriaRuleHolder).to.deep.equal(testCriteriaRuleHolder);
    });
    it(`should return Invalid Rules: searchQuery.rules when searchQuery.rules
         is null`, (done) => {
      try {
        const testSearchQuery = {
          rules: null,
          type: 'Book'
        };
        const resultQuery = prepareQueryByRelation(testSearchQuery);
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Rules: searchQuery.rules');
        done();
      }
    });
    it(`should return Invalid Rules: searchQuery.rules when searchQuery.rules
         is undefined`, (done) => {
      try {
        const testSearchQuery = {
          rules: undefined,
          type: 'Book'
        };
        const resultQuery = prepareQueryByRelation(testSearchQuery);
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Rules: searchQuery.rules');
        done();
      }
    });
    it(`should return Invalid Rules: productRule when rules[0].type is not in 'separator',
         'logical' or 'criteria'`, (done) => {
      try {
        const testSearchQuery = {
          rules: [
            {
              position: 0,
              rule: null,
              type: 'some-type'
            }
          ],
          type: 'Book'
        };
        const resultQuery = prepareQueryByRelation(testSearchQuery);
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Rules: productRule');
        done();
      }
    });
    it('should return Invalid Rules: productRule when rules[0].rule is null', (done) => {
      try {
        const testSearchQuery = {
          rules: [
            {
              position: 0,
              rule: null,
              type: 'separator'
            }
          ],
          type: 'Book'
        };
        const resultQuery = prepareQueryByRelation(testSearchQuery);
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Rules: productRule');
        done();
      }
    });
    it('should return Invalid Rules: productRule when rules[0].rule is undefined', (done) => {
      try {
        const testSearchQuery = {
          rules: [
            {
              position: 0,
              rule: undefined,
              type: 'separator'
            }
          ],
          type: 'Book'
        };
        const resultQuery = prepareQueryByRelation(testSearchQuery);
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Rules: productRule');
        done();
      }
    });
    it('should return Invalid Rules: productRule when rules[0].type is null', (done) => {
      try {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: null
            }
          ],
          type: 'Book'
        };
        const resultQuery = prepareQueryByRelation(testSearchQuery);
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Rules: productRule');
        done();
      }
    });
    it('should return Invalid Rules: productRule when rules[0].type is undefined', (done) => {
      try {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: undefined
            }
          ],
          type: 'Book'
        };
        const resultQuery = prepareQueryByRelation(testSearchQuery);
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Rules: productRule');
        done();
      }
    });
  });
  describe('getSeparator', () => {
    it('should convert "BEGIN" into "("', () => {
      const testRule: SeparatorRule = {
        value: 'BEGIN'
      };
      const resultQuery = getSeparator(testRule);
      expect(resultQuery).to.equal('(');
    });
    it('should convert "END" into ")"', () => {
      const testRule: SeparatorRule = {
        value: 'END'
      };
      const resultQuery = getSeparator(testRule);
      expect(resultQuery).to.equal(')');
    });
    it('should return Invalid Separator Rule when rule.value is null', (done) => {
      try {
        const testRule: SeparatorRule = {
          value: null
        };
        const resultQuery = getSeparator(testRule);
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Separator Rule');
        done();
      }
    });
    it('should return Invalid Separator Rule when rule.value is undefined', (done) => {
      try {
        const testRule: SeparatorRule = {
          value: undefined
        };
        const resultQuery = getSeparator(testRule);
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Separator Rule');
        done();
      }
    });
  });
  describe('getLogical', () => {
    it('should convert "AND" into "&"', () => {
      const testRule: LogicalRule = {
        value: 'AND'
      };
      const resultQuery = getLogical(testRule);
      expect(resultQuery).to.equal('&');
    });
    it('should convert "OR" into "|"', () => {
      const testRule: LogicalRule = {
        value: 'OR'
      };
      const resultQuery = getLogical(testRule);
      expect(resultQuery).to.equal('|');
    });
    it('should return Invalid Logical Rule when rule.value is null', (done) => {
      try {
        const testRule: LogicalRule = {
          value: null
        };
        const resultQuery = getLogical(testRule);
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Logical Rule');
        done();
      }
    });
    it('should return Invalid Logical Rule when rule.value is undefined', (done) => {
      try {
        const testRule: LogicalRule = {
          value: undefined
        };
        const resultQuery = getLogical(testRule);
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Logical Rule');
        done();
      }
    });
  });
  describe('getCriteria', () => {
    it('should convert criteria into "mongo" query', () => {
      const testRule: CriteriaRule = {
        attribute: 'type',
        relationship: 'EQ',
        value: 'Book'
      };
      const resultQuery = getCriteria(testRule);
      expect(resultQuery).to.deep.equal({ type: { $eq: 'Book' } });
    });
    it('should convert criteria into query when value is string(true)', () => {
      const testRule: CriteriaRule = {
        attribute: 'type',
        relationship: 'EQ',
        value: 'true'
      };
      const resultQuery = getCriteria(testRule);
      expect(resultQuery).to.deep.equal({ type: { $eq: 'true' } });
    });
    it('should convert criteria into query when value is string(false)', () => {
      const testRule: CriteriaRule = {
        attribute: 'type',
        relationship: 'EQ',
        value: 'false'
      };
      const resultQuery = getCriteria(testRule);
      expect(resultQuery).to.deep.equal({ type: { $eq: 'false' } });
    });
    it('should convert criteria into query when value is boolean(true)', () => {
      const testRule: CriteriaRule = {
        attribute: 'type',
        relationship: 'EQ',
        value: true
      };
      const resultQuery = getCriteria(testRule);
      expect(resultQuery).to.deep.equal({ type: { $eq: true } });
    });
    it('should convert criteria into query when value is boolean(false)', () => {
      const testRule: CriteriaRule = {
        attribute: 'type',
        relationship: 'EQ',
        value: false
      };
      const resultQuery = getCriteria(testRule);
      expect(resultQuery).to.deep.equal({ type: { $eq: false } });
    });
    it('should convert criteria into query when value is number(0)', () => {
      const testRule: CriteriaRule = {
        attribute: 'type',
        relationship: 'EQ',
        value: 0
      };
      const resultQuery = getCriteria(testRule);
      expect(resultQuery).to.deep.equal({ type: { $eq: 0 } });
    });
    it('should convert criteria into query when value is float(0.0)', () => {
      const testRule: CriteriaRule = {
        attribute: 'type',
        relationship: 'EQ',
        value: 0.0
      };
      const resultQuery = getCriteria(testRule);
      expect(resultQuery).to.deep.equal({ type: { $eq: 0 } });
    });
    it('should convert criteria into query when value is float(-57.5)', () => {
      const testRule: CriteriaRule = {
        attribute: 'type',
        relationship: 'EQ',
        value: -57.5
      };
      const resultQuery = getCriteria(testRule);
      expect(resultQuery).to.deep.equal({ type: { $eq: -57.5 } });
    });
    it('should convert criteria into query when value is empty string("")', () => {
      const testRule: CriteriaRule = {
        attribute: 'type',
        relationship: 'EQ',
        value: ''
      };
      const resultQuery = getCriteria(testRule);
      expect(resultQuery).to.deep.equal({ type: { $eq: '' } });
    });
    it('should convert criteria into query uses values and "IN" relation', () => {
      const testRule: CriteriaRule = {
        attribute: 'type',
        relationship: 'IN',
        values: ['Book', 'Chapter', 'Article']
      };
      const resultQuery = getCriteria(testRule);
      expect(resultQuery).to.deep.equal({
        type: { $in: ['Book', 'Chapter', 'Article'] }
      });
    });
    it('should return "mongo" query when only criteria is passed', () => {
      const testRule: CriteriaRule = {
        attribute: 'type',
        relationship: 'EQ',
        value: 'Book'
      };
      const resultQuery = getCriteria(testRule);
      expect(resultQuery).to.deep.equal({ type: { $eq: 'Book' } });
    });
    it('should return Invalid Criteria Rule when rule.value is null', (done) => {
      try {
        const testRule: CriteriaRule = {
          attribute: 'type',
          relationship: 'EQ',
          value: null
        };
        const resultQuery = getCriteria(testRule);
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Criteria Rule');
        done();
      }
    });
    it('should return Invalid Criteria Rule when rule.value is array', (done) => {
      try {
        const testRule: CriteriaRule = {
          attribute: 'type',
          relationship: 'EQ',
          value: ['Book', 'Chapter', 'Article']
        };
        const resultQuery = getCriteria(testRule);
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Criteria Rule');
        done();
      }
    });
    it('should return Invalid Criteria Rule when rule.values is null', (done) => {
      try {
        const testRule: CriteriaRule = {
          attribute: 'type',
          relationship: 'EQ',
          values: null
        };
        const resultQuery = getCriteria(testRule);
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Criteria Rule');
        done();
      }
    });
    it('should return Invalid Criteria Rule when rule.value is undefined', (done) => {
      try {
        const testRule: CriteriaRule = {
          attribute: 'type',
          relationship: 'EQ',
          value: undefined
        };
        const resultQuery = getCriteria(testRule);
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Criteria Rule');
        done();
      }
    });
    it('should return Invalid Criteria Rule when rule.attribute is null', (done) => {
      try {
        const testRule: CriteriaRule = {
          attribute: null,
          relationship: 'EQ',
          value: 'Book'
        };
        const resultQuery = getCriteria(testRule);
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Criteria Rule');
        done();
      }
    });
    it('should return Invalid Criteria Rule when rule.attribute is undefined', (done) => {
      try {
        const testRule: CriteriaRule = {
          attribute: undefined,
          relationship: 'EQ',
          value: 'Book'
        };
        const resultQuery = getCriteria(testRule);
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Criteria Rule');
        done();
      }
    });
    it('should return Invalid Criteria Rule when rule.relationship is null', (done) => {
      try {
        const testRule: CriteriaRule = {
          attribute: 'type',
          relationship: null,
          value: 'Book'
        };
        const resultQuery = getCriteria(testRule);
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Criteria Rule');
        done();
      }
    });
    it('should return Invalid Criteria Rule when rule.relationship is undefined', (done) => {
      try {
        const testRule: CriteriaRule = {
          attribute: 'type',
          relationship: undefined,
          value: 'Book'
        };
        const resultQuery = getCriteria(testRule);
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Criteria Rule');
        done();
      }
    });
  });
  describe('handleCriteria', () => {
    it('should check for elemMatch condition for Criteria and go with relationBuilder', () => {
      const testRule: CriteriaRule = {
        attribute: 'type',
        relationship: 'EQ',
        value: 'Book'
      };
      const resultQuery = handleCriteria(testRule);
      expect(resultQuery).to.deep.equal({ type: { $eq: 'Book' } });
    });
    it(`should check for elemMatch condition for Criteria and go with
         elemMatch 'IN' condition`, () => {
      const testRule: CriteriaRule = {
        attribute: 'classifications[type:netbase].entries.code',
        relationship: 'IN',
        values: ['WB001', 'WB002', 'WB003']
      };
      const response = {
        classifications: {
          $elemMatch: {
            'entries.code': { $in: ['WB001', 'WB002', 'WB003'] },
            type: 'netbase'
          }
        }
      };
      const resultQuery = handleCriteria(testRule);
      expect(resultQuery).to.deep.equal(response);
    });
    it(`should check for elemMatch condition for Criteria and go with
         elemMatch 'NI' condition`, () => {
      const testRule: CriteriaRule = {
        attribute: 'classifications[type:netbase].entries.code',
        relationship: 'NI',
        values: ['WB001', 'WB002', 'WB003']
      };
      const response = {
        classifications: {
          $elemMatch: {
            'entries.code': { $nin: ['WB001', 'WB002', 'WB003'] },
            type: 'netbase'
          }
        }
      };
      const resultQuery = handleCriteria(testRule);
      expect(resultQuery).to.deep.equal(response);
    });
    it(`should check for elemMatch condition for Criteria and go with
         elemMatch 'EQ' condition`, () => {
      const testRule: CriteriaRule = {
        attribute: 'classifications[type:netbase].entries.code',
        relationship: 'EQ',
        value: 'Book'
      };
      const response = {
        classifications: {
          $elemMatch: {
            'entries.code': { $eq: 'Book' },
            type: 'netbase'
          }
        }
      };
      const resultQuery = handleCriteria(testRule);
      expect(resultQuery).to.deep.equal(response);
    });
    it(`should check for elemMatch condition for Criteria and go with
        elemMatch 'NE' condition`, () => {
      const testRule: CriteriaRule = {
        attribute: 'classifications[type:netbase].entries.code',
        relationship: 'NE',
        value: 'Book'
      };
      const response = {
        classifications: {
          $elemMatch: {
            'entries.code': { $ne: 'Book' },
            type: 'netbase'
          }
        }
      };
      const resultQuery = handleCriteria(testRule);
      expect(resultQuery).to.deep.equal(response);
    });
    it(`should check for elemMatch condition for Criteria and go with
       elemMatch 'LT' condition`, () => {
      const testRule: CriteriaRule = {
        attribute: 'classifications[type:netbase].entries.code',
        relationship: 'LT',
        value: 'Book'
      };
      const response = {
        classifications: {
          $elemMatch: {
            'entries.code': { $lt: 'Book' },
            type: 'netbase'
          }
        }
      };
      const resultQuery = handleCriteria(testRule);
      expect(resultQuery).to.deep.equal(response);
    });
    it(`should check for elemMatch condition for Criteria and go with
      elemMatch 'GT' condition`, () => {
      const testRule: CriteriaRule = {
        attribute: 'classifications[type:netbase].entries.code',
        relationship: 'GT',
        value: 'Book'
      };
      const response = {
        classifications: {
          $elemMatch: {
            'entries.code': { $gt: 'Book' },
            type: 'netbase'
          }
        }
      };
      const resultQuery = handleCriteria(testRule);
      expect(resultQuery).to.deep.equal(response);
    });
    it(`should check for elemMatch condition for Criteria and go with
        elemMatch 'GE' condition`, () => {
      const testRule: CriteriaRule = {
        attribute: 'classifications[type:netbase].entries.code',
        relationship: 'GE',
        value: 'Book'
      };
      const response = {
        classifications: {
          $elemMatch: {
            'entries.code': { $gte: 'Book' },
            type: 'netbase'
          }
        }
      };
      const resultQuery = handleCriteria(testRule);
      expect(resultQuery).to.deep.equal(response);
    });
    it(`should check for elemMatch condition for Criteria and go with
       elemMatch 'LE' condition`, () => {
      const testRule: CriteriaRule = {
        attribute: 'classifications[type:netbase].entries.code',
        relationship: 'LE',
        value: 'Book'
      };
      const response = {
        classifications: {
          $elemMatch: {
            'entries.code': { $lte: 'Book' },
            type: 'netbase'
          }
        }
      };
      const resultQuery = handleCriteria(testRule);
      expect(resultQuery).to.deep.equal(response);
    });
    it(`should check for elemMatch condition for Criteria and go with
        relationBuilder 'IN' condition`, () => {
      const testRule: CriteriaRule = {
        attribute: 'classifications',
        relationship: 'IN',
        values: ['WB001', 'WB002', 'WB003']
      };
      const response = {
        classifications: {
          $in: ['WB001', 'WB002', 'WB003']
        }
      };
      const resultQuery = handleCriteria(testRule);
      expect(resultQuery).to.deep.equal(response);
    });
    it(`should check for elemMatch condition for Criteria and go with
        relationBuilder 'NI' condition`, () => {
      const testRule: CriteriaRule = {
        attribute: 'classifications',
        relationship: 'NI',
        values: ['WB001', 'WB002', 'WB003']
      };
      const response = {
        classifications: {
          $nin: ['WB001', 'WB002', 'WB003']
        }
      };
      const resultQuery = handleCriteria(testRule);
      expect(resultQuery).to.deep.equal(response);
    });
  });
});
