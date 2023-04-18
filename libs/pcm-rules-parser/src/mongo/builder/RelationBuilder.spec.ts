import { expect } from 'chai';
import { CriteriaRule } from '../../common/model/CriteriaRule';
import { relationBuilder } from './RelationBuilder';

describe('RelationBuilder', () => {
  describe('relationBuilder', () => {
    it('should return "mongo" query when only criteria is passed', () => {
      const testCriteria: CriteriaRule = {
        attribute: 'type',
        relationship: 'EQ',
        value: 'Book'
      };
      const resultQuery = relationBuilder(testCriteria);
      expect(resultQuery).to.deep.equal({ type: { $eq: 'Book' } });
    });
    it('should convert criteria based on relationship "EQ"', () => {
      const testCriteria: CriteriaRule = {
        attribute: 'type',
        relationship: 'EQ',
        value: 'Book'
      };
      const resultQuery = relationBuilder(testCriteria);
      expect(resultQuery).to.deep.equal({ type: { $eq: 'Book' } });
    });
    it('should convert criteria based on relationship "NE"', () => {
      const testCriteria: CriteriaRule = {
        attribute: 'type',
        relationship: 'NE',
        value: 'Book'
      };
      const resultQuery = relationBuilder(testCriteria);
      expect(resultQuery).to.deep.equal({ type: { $ne: 'Book' } });
    });
    it('should convert criteria based on relationship "GT"', () => {
      const testCriteria: CriteriaRule = {
        attribute: 'type',
        relationship: 'GT',
        value: 'Book'
      };
      const resultQuery = relationBuilder(testCriteria);
      expect(resultQuery).to.deep.equal({ type: { $gt: 'Book' } });
    });
    it('should convert criteria based on relationship "LT"', () => {
      const testCriteria: CriteriaRule = {
        attribute: 'type',
        relationship: 'LT',
        value: 'Book'
      };
      const resultQuery = relationBuilder(testCriteria);
      expect(resultQuery).to.deep.equal({ type: { $lt: 'Book' } });
    });
    it('should convert criteria based on relationship "GE"', () => {
      const testCriteria: CriteriaRule = {
        attribute: 'type',
        relationship: 'GE',
        value: 'Book'
      };
      const resultQuery = relationBuilder(testCriteria);
      expect(resultQuery).to.deep.equal({ type: { $gte: 'Book' } });
    });
    it('should convert criteria based on relationship "LE"', () => {
      const testCriteria: CriteriaRule = {
        attribute: 'type',
        relationship: 'LE',
        value: 'Book'
      };
      const resultQuery = relationBuilder(testCriteria);
      expect(resultQuery).to.deep.equal({ type: { $lte: 'Book' } });
    });
    it('should convert criteria based on relationship "IN"', () => {
      const testCriteria: CriteriaRule = {
        attribute: 'type',
        relationship: 'IN',
        values: ['Book', 'Chapter', 'Article']
      };
      const resultQuery = relationBuilder(testCriteria);
      expect(resultQuery).to.deep.equal({
        type: { $in: ['Book', 'Chapter', 'Article'] }
      });
    });
    it('should convert criteria based on relationship "NI"', () => {
      const testCriteria: CriteriaRule = {
        attribute: 'type',
        relationship: 'NI',
        values: ['Book', 'Chapter', 'Article']
      };
      const resultQuery = relationBuilder(testCriteria);
      expect(resultQuery).to.deep.equal({
        type: { $nin: ['Book', 'Chapter', 'Article'] }
      });
    });
    it('should throw ERROR Invalid relation parameter when criteria is null', (done) => {
      try {
        const resultQuery = relationBuilder(null);
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid relation parameter');
        done();
      }
    });
    it('should throw ERROR Invalid relation parameter when criteria is undefined', (done) => {
      try {
        const resultQuery = relationBuilder(undefined);
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid relation parameter');
        done();
      }
    });
    it(`should return boolean(false) when value is boolean(false) and
         relationship is "EQ"`, () => {
      const testCriteria: CriteriaRule = {
        attribute: 'type',
        relationship: 'EQ',
        value: false
      };
      const resultQuery = relationBuilder(testCriteria);
      expect(resultQuery).to.deep.equal({ type: { $eq: false } });
    });
    it(`should return boolean(true) when value is boolean(true) and
         relationship is "EQ"`, () => {
      const testCriteria: CriteriaRule = {
        attribute: 'type',
        relationship: 'EQ',
        value: true
      };
      const resultQuery = relationBuilder(testCriteria);
      expect(resultQuery).to.deep.equal({ type: { $eq: true } });
    });
    it(`should return boolean(true) when value is boolean(true) and
         relationship is "NE"`, () => {
      const testCriteria: CriteriaRule = {
        attribute: 'type',
        relationship: 'NE',
        value: true
      };
      const resultQuery = relationBuilder(testCriteria);
      expect(resultQuery).to.deep.equal({ type: { $ne: true } });
    });
    it(`should return string(true) when value is string(true) and
         relationship is "GE"`, () => {
      const testCriteria: CriteriaRule = {
        attribute: 'type',
        relationship: 'GE',
        value: 'true'
      };
      const resultQuery = relationBuilder(testCriteria);
      expect(resultQuery).to.deep.equal({ type: { $gte: 'true' } });
    });
    it(`should return string(false) when value is string(false) and
         relationship is "LE"`, () => {
      const testCriteria: CriteriaRule = {
        attribute: 'type',
        relationship: 'LE',
        value: 'false'
      };
      const resultQuery = relationBuilder(testCriteria);
      expect(resultQuery).to.deep.equal({ type: { $lte: 'false' } });
    });
    it(`should return integer value when value is integer type and
         relationship is "LT"`, () => {
      const testCriteria: CriteriaRule = {
        attribute: 'type',
        relationship: 'LT',
        value: 100
      };
      const resultQuery = relationBuilder(testCriteria);
      expect(resultQuery).to.deep.equal({ type: { $lt: 100 } });
    });
    it(`should return integer value when value is integer type and
         relationship is "GT"`, () => {
      const testCriteria: CriteriaRule = {
        attribute: 'type',
        relationship: 'GT',
        value: 100
      };
      const resultQuery = relationBuilder(testCriteria);
      expect(resultQuery).to.deep.equal({ type: { $gt: 100 } });
    });
    it(`should return string value when value is string type`, () => {
      const testCriteria: CriteriaRule = {
        attribute: 'type',
        relationship: 'LT',
        value: '100'
      };
      const resultQuery = relationBuilder(testCriteria);
      expect(resultQuery).to.deep.equal({ type: { $lt: '100' } });
    });
  });
});
