import { expect } from 'chai';
import { Request } from 'express';
import * as mockExpressRequest from 'mock-express-request';

import { countAPIValidator } from './CountAPIValidator';
const testRules = [
  {
    position: 1,
    rule: {
      value: 'BEGIN'
    },
    type: 'separator'
  },
  {
    position: 2,
    rule: {
      attribute: 'identifiers.isbn',
      relationship: 'IN',
      values: ['some-isbn']
    },
    type: 'criteria'
  },
  {
    position: 3,
    rule: {
      value: 'END'
    },
    type: 'separator'
  }
];
const testQuery = {
  action: 'count',
  apiVersion: '4.0.1',
  availability: {
    name: 'UBX'
  },
  hasCounts: true,
  hasTotalPrices: true,
  rulesList: [
    {
      attributes: [],
      rules: testRules,
      type: 'book'
    }
  ]
};

describe('CountAPIValidator', () => {
  describe('validateCountApi', () => {
    it('should throw error when the hasTotalPrices is invalid', (done) => {
      try {
        const request: Request = new mockExpressRequest();
        request.body = { ...testQuery, hasTotalPrices: 'yes' };
        countAPIValidator.validateCountApi(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.code).to.be.equal(400);
        expect(error.message).to.be.equal('Invalid hasTotalPrices value: yes');
        done();
      }
    });
    it('should throw error when the hasCounts is invalid', (done) => {
      try {
        const request: Request = new mockExpressRequest();
        request.body = { ...testQuery, hasCounts: 'yes' };
        countAPIValidator.validateCountApi(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.code).to.be.equal(400);
        expect(error.message).to.be.equal('Invalid hasCounts value: yes');
        done();
      }
    });
    it('should throw error when the rulesList is invalid', (done) => {
      try {
        const request: Request = new mockExpressRequest();
        request.body = { ...testQuery, rulesList: {} };
        countAPIValidator.validateCountApi(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.code).to.be.equal(400);
        expect(error.message).to.be.equal('Invalid or missing search rules.');
        done();
      }
    });
    it('should throw error when the request has invalid parameter', (done) => {
      try {
        const request: Request = new mockExpressRequest();
        request.body = { ...testQuery, random: 'random' };
        countAPIValidator.validateCountApi(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.code).to.be.equal(400);
        expect(error.message).to.be.equal('Invalid parameters: random');
        done();
      }
    });
    it('should throw error when the availability info has invalid param', (done) => {
      try {
        const request: Request = new mockExpressRequest();
        request.body = { ...testQuery, availability: { errors: 'random' } };
        countAPIValidator.validateCountApi(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.code).to.be.equal(400);
        expect(error.message).to.be.equal(
          'Invalid parameters: availability errors'
        );
        done();
      }
    });
  });
});
