import { expect } from 'chai';
import { Request } from 'express';

import { queryAPIValidator } from './QueryAPIValidator';

describe('QueryAPIValidator', () => {
  describe('validateSearch', () => {
    let request;
    beforeEach(() => {
      request = {
        body: {
          hasCounts: false,
          hasTotalPrices: false,
          limit: 30,
          offset: 0,
          rulesList: [
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
                    values: [
                      '9780203357644',
                      '9780367438944',
                      '9781351022187',
                      '9780415529969',
                      '9783161484100',
                      '9781351271486'
                    ]
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
          ]
        }
      };
      // adds availability
      request.body.availability = {
        name: 'some-channel',
        status: ['some-status', 'some-status1']
      };
    });
    it('should pass validation when the request is valid', (done) => {
      try {
        const isValid = queryAPIValidator.validateSearch(request);
        expect(isValid).to.equal(true);
        done();
      } catch (error) {
        done(error);
      }
    });
    it(`should pass validation when request has offsetCursor as last-page-cursor and
        offset=null`, (done) => {
      request.body.offsetCursor = 'last-page-cursor';
      request.body.offset = 0;
      try {
        queryAPIValidator.validateSearch(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.code).to.be.equal(400);
        expect(error.message).to.be.equal(
          'Offset parameter is not supported when using the offsetCursor parameter.'
        );
        done();
      }
    });
    it(`should throw Invalid offset value used in search query
        and offset=30`, (done) => {
      request.body.offset = 30;
      try {
        queryAPIValidator.validateSearch(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.code).to.be.equal(400);
        expect(error.message).to.be.equal('Only Offset with value 0 allowed.');
        done();
      }
    });
    it(`should throw Invalid offset in search query when request has offsetCursor as invalid value and offset=0`, (done) => {
      request.body.offsetCursor = '12345678';
      request.body.offset = 0;
      try {
        queryAPIValidator.validateSearch(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.code).to.be.equal(400);
        expect(error.message).to.be.equal(
          'Offset parameter is not supported when using the offsetCursor parameter. and Invalid offsetCursor : 12345678'
        );
        done();
      }
    });
    it(`should throw Invalid offset in search query when request has offsetCursor as valid value and offset=0`, (done) => {
      request.body.offsetCursor =
        '6d4fb6ac-55f9-4a7a-9cfb-81085a8a6896:6d4fb6ac-55f9-4a7a-9cfb-81085a8a6898:0_6d4fb6ac-55f9-4a7a-9cfb-81085a8a6898_desc';
      request.body.offset = 0;
      try {
        queryAPIValidator.validateSearch(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.code).to.be.equal(400);
        expect(error.message).to.be.equal(
          'Offset parameter is not supported when using the offsetCursor parameter.'
        );
        done();
      }
    });
    it('should throw Invalid parameters in search query when request is invalid', (done) => {
      try {
        queryAPIValidator.validateSearch({} as Request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.code).to.be.equal(400);
        expect(error.message).to.be.equal('Invalid parameters in search query');
        done();
      }
    });
    it('should throw Invalid hasTotalPrices value when requested hasTotalPrices is invalid', (done) => {
      request.body.hasTotalPrices = 'invalid';
      try {
        queryAPIValidator.validateSearch(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.code).to.be.equal(400);
        expect(error.message).to.be.equal(
          `Invalid hasTotalPrices value: ${request.body.hasTotalPrices}`
        );
        done();
      }
    });
    it('should throw Invalid hasCounts value when requested hasCounts is invalid', (done) => {
      request.body.hasCounts = 'invalid';
      try {
        queryAPIValidator.validateSearch(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.code).to.be.equal(400);
        expect(error.message).to.be.equal(
          `Invalid hasCounts value: ${request.body.hasCounts}`
        );
        done();
      }
    });
    it('should throw Invalid or missing search rules when rules not passed', (done) => {
      request.body.rulesList = undefined;
      try {
        queryAPIValidator.validateSearch(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.code).to.be.equal(400);
        expect(error.message).to.be.equal(`Invalid or missing search rules.`);
        done();
      }
    });

    it('should throw Invalid or missing search rules error when rulesList is an empty array', (done) => {
      request.body.rulesList = [];
      try {
        queryAPIValidator.validateSearch(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.code).to.be.equal(400);
        expect(error.message).to.be.equal(`Invalid or missing search rules.`);
        done();
      }
    });
    it('should throw 400 error when does not have type property', (done) => {
      request.body.rulesList = [{}];
      try {
        queryAPIValidator.validateSearch(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.code).to.be.equal(400);
        expect(error.message).to.be.equal(`Invalid product type : undefined`);
        done();
      }
    });
    it('should throw Invalid rulesList. when multiple rules passed in the request', (done) => {
      request.body.rulesList.push({
        attributes: [
          {
            name: 'title',
            position: 1
          },
          {
            name: 'identifiers.doi',
            position: 2
          }
        ],
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
              attribute: 'identifiers.doi',
              relationship: 'IN',
              values: ['some-doi']
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
        type: 'chapter'
      });
      try {
        queryAPIValidator.validateSearch(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.code).to.be.equal(400);
        expect(error.message).to.be.equal(
          `Invalid rulesList: only one rule is allowed.`
        );
        done();
      }
    });

    it('should throw Invalid attribute parameters, when given attributes is not array', (done) => {
      delete request.body.rulesList[0].attributes;
      request.body.rulesList[0].attributes = 'invalid-type';
      try {
        queryAPIValidator.validateSearch(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.code).to.be.equal(400);
        expect(error.message).to.be.equal(
          `Invalid attribute parameters in the rules.`
        );
        done();
      }
    });
    it(
      'should throw Missing `availability.name` in the request parameters,' +
        'when `availability.status` given without passing `availability.name`',
      (done) => {
        delete request.body.availability.name;
        try {
          queryAPIValidator.validateSearch(request);
          done(new Error('Expecting error, but got success'));
        } catch (error) {
          expect(error.code).to.be.equal(400);
          expect(error.message).to.be.equal(
            `Missing availability.name in the request parameters.`
          );
          done();
        }
      }
    );
    it('should throw 400 error when "availability.error" parameter is passed in request', (done) => {
      request.body.availability.errors = ['NO_CONTENT'];
      try {
        queryAPIValidator.validateSearch(request);
        delete request.body.availability.errors;
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.code).to.be.equal(400);
        expect(error.message).to.be.equal(
          `Invalid parameters: availability errors`
        );
        delete request.body.availability.errors;
        done();
      }
    });
    it('should throw 400 error when "type" parameter is passed in request', (done) => {
      request.body.type = 'book';
      try {
        queryAPIValidator.validateSearch(request);
        delete request.body.availability.error;
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.code).to.be.equal(400);
        expect(error.message).to.be.equal(`Invalid parameters: type`);
        delete request.body.availability.error;
        done();
      }
    });
    it(
      'should throw 400 error when "sortBy and sortOrder" parameters' +
        'are passed',
      (done) => {
        request.body.sortBy = '_id';
        request.body.sortOrder = 'asc';
        try {
          queryAPIValidator.validateSearch(request);
          delete request.body.availability.error;
          done(new Error('Expecting error, but got success'));
        } catch (error) {
          expect(error.code).to.be.equal(400);
          expect(error.message).to.be.equal(
            `Invalid parameters: sortBy,sortOrder`
          );
          delete request.body.availability.error;
          done();
        }
      }
    );
  });
});
