import { expect } from 'chai';
import { Request } from 'express';
import * as mockExpressRequest from 'mock-express-request';

import { journalProductRequest } from './Journal.TestData';
import { journalValidator } from './JournalValidator';

describe('JournalValidator', () => {
  describe('validate', () => {
    it('should validate without any error when input journal is valid', async () => {
      const request: Request = new mockExpressRequest();
      request.body = { product: journalProductRequest };
      request.query.productIdentifierName = 'journalAcronym';
      const isValid = journalValidator.validate(request);
      // tslint:disable-next-line: no-unused-expression
      expect(isValid).to.be.true;
    });
    it('should throw error when productIdentifierName is not journalAcronym.', (done) => {
      const request: Request = new mockExpressRequest();
      request.body = { product: journalProductRequest };
      request.query.productIdentifierName = 'garbage';
      try {
        journalValidator.validate(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          `Product-identifier ${request.query.productIdentifierName} is not allowed.`
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
    it(`should throw error when both open select and open-access permission
      set at a time.`, (done) => {
      const request: Request = new mockExpressRequest();
      const permissions = [
        {
          code: 'OA',
          description: null,
          name: 'open-access',
          text: 'some-text',
          type: 'access',
          validFrom: null,
          validTo: null
        },
        {
          code: 'OS',
          description: null,
          name: 'open-select',
          text: 'some-text',
          type: 'access',
          validFrom: null,
          validTo: null
        }
      ];
      const corruptedJournalProductRequest = {
        ...journalProductRequest,
        permissions
      };
      request.body = { product: corruptedJournalProductRequest };
      request.query.productIdentifierName = 'journalAcronym';
      try {
        journalValidator.validate(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          `Both OA and OS permission is not allowed at a time.`
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
  });
});
