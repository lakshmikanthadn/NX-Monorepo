import { expect } from 'chai';
import { Request } from 'express';
import * as mockExpressRequest from 'mock-express-request';

import { titleValidator } from './Title.Validator';

describe('TitleValidator', () => {
  describe('fetchVariantRequestValidator', () => {
    it('should throw 400 error when request body is empty', (done) => {
      const request: Request = new mockExpressRequest();
      request.body = {};
      try {
        titleValidator.fetchVariantRequestValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(`invalid/missing identifiers`);
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw 400 error when request body has invalid parameter', (done) => {
      const request: Request = new mockExpressRequest();
      request.body = {
        identifiers: [{ name: 'isbn', values: ['9876543212345'] }],
        limit: 0
      };
      try {
        titleValidator.fetchVariantRequestValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(`unexpected parameters: limit`);
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw 400 error when identifiers = "" in the request body', (done) => {
      const request: Request = new mockExpressRequest();
      request.body = { identifiers: '' };
      try {
        titleValidator.fetchVariantRequestValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(`invalid/missing identifiers`);
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw 400 error when identifiers = [] in the request body', (done) => {
      const request: Request = new mockExpressRequest();
      request.body = { identifiers: [] };
      try {
        titleValidator.fetchVariantRequestValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(`invalid/missing identifiers`);
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw 400 error when identifier name invalid', (done) => {
      const request: Request = new mockExpressRequest();
      request.body = { identifiers: [{ name: '', values: ['9876123456789'] }] };
      try {
        titleValidator.fetchVariantRequestValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(`invalid/missing identifier name`);
        expect(error.code).to.equal(400);
        done();
      }
    });

    it('should throw 400 error when identifier values are mising', (done) => {
      const request: Request = new mockExpressRequest();
      request.body = { identifiers: [{ name: 'isbn' }] };
      try {
        titleValidator.fetchVariantRequestValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(`invalid/missing identifier values`);
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw 400 error when identifier has more than 100 ids', (done) => {
      const request: Request = new mockExpressRequest();
      request.body = {
        identifiers: [{ name: 'isbn', values: new Array(101) }]
      };
      try {
        titleValidator.fetchVariantRequestValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          `request should have min 1 and max 100 identifiers`
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw 400 error when identifiers are more than one', (done) => {
      const request: Request = new mockExpressRequest();
      request.body = {
        identifiers: [
          { name: 'isbn', values: ['9234563456789'] },
          { name: 'isbn', values: ['9876123444556'] }
        ]
      };
      try {
        titleValidator.fetchVariantRequestValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          `currently we support one identifier(object) in identifiers`
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw 400 error when formats filter is empty array', (done) => {
      const request: Request = new mockExpressRequest();
      request.body = {
        formats: [],
        identifiers: [{ name: 'isbn', values: ['9876123456789'] }]
      };
      try {
        titleValidator.fetchVariantRequestValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(`invalid "formats" filter`);
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw 400 error when includeEditions is not boolean', (done) => {
      const request: Request = new mockExpressRequest();
      request.body = {
        formats: ['e-Book'],
        identifiers: [{ name: 'isbn', values: ['9876123456789'] }],
        includeEditions: 'yes'
      };
      try {
        titleValidator.fetchVariantRequestValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(`invalid "includeEditions" filter`);
        expect(error.code).to.equal(400);
        done();
      }
    });
  });
});
