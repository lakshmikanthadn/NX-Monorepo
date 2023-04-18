import { expect } from 'chai';
import { logicalBuilder } from './LogicalBuilder';

describe('LogicalBuilder', () => {
  describe('logicalBuilder', () => {
    it(`should return "mongo" query when only relation andcoperandsArray is passed`, () => {
      const testOperandsArray = ['0', '1'];
      const testCriteriaRuleHolder = [
        { type: { $eq: 'Book' } },
        { format: { $eq: 'EBK' } }
      ];
      const query = {
        $and: [{ type: { $eq: 'Book' } }, { format: { $eq: 'EBK' } }]
      };
      const resultQueryData = logicalBuilder(
        '&',
        testOperandsArray,
        testCriteriaRuleHolder
      );
      expect(resultQueryData).to.deep.equal(query);
    });
    it('should convert operands based on AND operation in mongo', () => {
      const testOperandsArray = ['0', '1'];
      const testCriteriaRuleHolder = [
        { type: { $eq: 'Book' } },
        { format: { $eq: 'EBK' } }
      ];
      const query = {
        $and: [{ type: { $eq: 'Book' } }, { format: { $eq: 'EBK' } }]
      };
      const resultQueryData = logicalBuilder(
        '&',
        testOperandsArray,
        testCriteriaRuleHolder
      );
      expect(resultQueryData).to.deep.equal(query);
    });
    it('should convert operands based on OR operation in mongo', () => {
      const testOperandsArray = ['0', '1'];
      const testCriteriaRuleHolder = [
        { type: { $eq: 'Book' } },
        { format: { $eq: 'EBK' } }
      ];
      const query = {
        $or: [{ type: { $eq: 'Book' } }, { format: { $eq: 'EBK' } }]
      };
      const resultQueryData = logicalBuilder(
        '|',
        testOperandsArray,
        testCriteriaRuleHolder
      );
      expect(resultQueryData).to.deep.equal(query);
    });
    it('should return Invalid Query string when "|" apply to single operand', (done) => {
      try {
        const testOperandsArray = ['0'];
        const testCriteriaRuleHolder = [{ type: { $eq: 'Book' } }];
        const resultQuery = logicalBuilder(
          '|',
          testOperandsArray,
          testCriteriaRuleHolder
        );
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Query string');
        done();
      }
    });
    it('should return Invalid Query string when "&" apply to single operand', (done) => {
      try {
        const testOperandsArray = ['0'];
        const testCriteriaRuleHolder = [{ type: { $eq: 'Book' } }];
        const resultQuery = logicalBuilder(
          '&',
          testOperandsArray,
          testCriteriaRuleHolder
        );
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Query string');
        done();
      }
    });
    it('should return Invalid logical parameter when relation is null', (done) => {
      try {
        const testOperandsArray = ['0'];
        const testCriteriaRuleHolder = [{ type: { $eq: 'Book' } }];
        const resultQuery = logicalBuilder(
          null,
          testOperandsArray,
          testCriteriaRuleHolder
        );
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid logical parameter');
        done();
      }
    });
    it('should return Invalid logical parameter when relation is undefined', (done) => {
      try {
        const testOperandsArray = ['0'];
        const testCriteriaRuleHolder = [{ type: { $eq: 'Book' } }];
        const resultQuery = logicalBuilder(
          undefined,
          testOperandsArray,
          testCriteriaRuleHolder
        );
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid logical parameter');
        done();
      }
    });
    it('should return Invalid logical parameter when operandsArray is null', (done) => {
      try {
        const testOperandsArray = ['0'];
        const testCriteriaRuleHolder = [{ type: { $eq: 'Book' } }];
        const resultQuery = logicalBuilder('|', null, testCriteriaRuleHolder);
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid logical parameter');
        done();
      }
    });
    it('should return Invalid logical parameter when operandsArray is undefined', (done) => {
      try {
        const testOperandsArray = ['0'];
        const testCriteriaRuleHolder = [{ type: { $eq: 'Book' } }];
        const resultQuery = logicalBuilder(
          '&',
          undefined,
          testCriteriaRuleHolder
        );
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid logical parameter');
        done();
      }
    });
    it('should return Invalid logical parameter when both parameters are null', (done) => {
      try {
        const testOperandsArray = ['0'];
        const testCriteriaRuleHolder = [{ type: { $eq: 'Book' } }];
        const resultQuery = logicalBuilder(null, null, testCriteriaRuleHolder);
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid logical parameter');
        done();
      }
    });
    it('should return Invalid logical parameter when both parameters are undefined', (done) => {
      try {
        const testOperandsArray = ['0'];
        const testCriteriaRuleHolder = [{ type: { $eq: 'Book' } }];
        const resultQuery = logicalBuilder(
          undefined,
          undefined,
          testCriteriaRuleHolder
        );
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid logical parameter');
        done();
      }
    });
  });
});
