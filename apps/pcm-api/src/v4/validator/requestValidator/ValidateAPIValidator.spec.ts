import { expect } from 'chai';
import { Request } from 'express';
import * as mockExpressRequest from 'mock-express-request';

import { validateAPIValidator } from './ValidateAPIValidator';

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
  action: 'validate',
  apiVersion: '4.0.1',
  availability: {
    name: 'UBX'
  },
  hasCounts: true,
  rulesList: [
    {
      attributes: [],
      rules: testRules,
      type: 'book'
    }
  ]
};

describe('validateAPIValidator', () => {
  describe('validateValidationApi', () => {
    it('should throw 400 error when "limit" & "offset" parameter is passed in request', (done) => {
      const request: Request = new mockExpressRequest();
      request.body = { ...testQuery, limit: 10, offset: 0 };
      try {
        validateAPIValidator.validateValidationApi(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(`Invalid parameters: limit,offset`);
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw 400 error when "hasTotalPrices" parameter is passed in request', (done) => {
      const request: Request = new mockExpressRequest();
      request.body = { ...testQuery, hasTotalPrices: true };
      try {
        validateAPIValidator.validateValidationApi(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(`Invalid parameters: hasTotalPrices`);
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw 400 error when "sortBy" & "sortOrder" parameter is passed', (done) => {
      const request: Request = new mockExpressRequest();
      request.body = { ...testQuery, sortBy: '_id', sortOrder: 'desc' };
      try {
        validateAPIValidator.validateValidationApi(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(`Invalid parameters: sortBy,sortOrder`);
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw 400 error when "availability.name" parameter is missing', (done) => {
      const request: Request = new mockExpressRequest();
      request.body = { ...testQuery, availability: {} };
      try {
        validateAPIValidator.validateValidationApi(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(`Availability name is mandatory`);
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw 400 error when "availability" parameter is missing', (done) => {
      const request: Request = new mockExpressRequest();
      request.body = { ...testQuery, availability: null };
      try {
        validateAPIValidator.validateValidationApi(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(`Availability name is mandatory`);
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw 400 error when "hasCounts" parameter is invalid', (done) => {
      const request: Request = new mockExpressRequest();
      request.body = { ...testQuery, hasCounts: 'yes' };
      try {
        validateAPIValidator.validateValidationApi(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(`Invalid hasCounts value: yes`);
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw 400 error when "availability.status" parameter is passed', (done) => {
      const request: Request = new mockExpressRequest();
      request.body = {
        ...testQuery,
        availability: { name: 'UBX', status: ['SELLABLE'] }
      };
      try {
        validateAPIValidator.validateValidationApi(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          `Invalid parameters: availability status`
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw 400 error when "type" parameter is passed in request', (done) => {
      const request: Request = new mockExpressRequest();
      request.body = { ...testQuery, type: 'book' };
      try {
        validateAPIValidator.validateValidationApi(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(`Invalid parameters: type`);
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw 400 error when rulesList is undefined', (done) => {
      const request: Request = new mockExpressRequest();
      request.body = { ...testQuery, rulesList: undefined };
      try {
        validateAPIValidator.validateValidationApi(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(`Invalid or missing rulesList.`);
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw 400 error when rulesList is empty', (done) => {
      const request: Request = new mockExpressRequest();
      request.body = { ...testQuery, rulesList: [] };
      try {
        validateAPIValidator.validateValidationApi(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(`Invalid or missing rulesList.`);
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw 400 error when product type is invalid', (done) => {
      const request: Request = new mockExpressRequest();
      const rulesListNoIdentifier = [
        {
          attributes: [],
          rules: [
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
                attribute: 'identifiers.doi',
                relationship: 'IN',
                values: ['1234567890123']
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
          ],
          type: 'Book'
        }
      ];
      request.body = { ...testQuery, rulesList: rulesListNoIdentifier };
      try {
        validateAPIValidator.validateValidationApi(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(`Invalid product type : Book`);
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw 400 error when attributes is not an array', (done) => {
      const request: Request = new mockExpressRequest();
      request.body = {
        ...testQuery,
        rulesList: [{ attributes: '', rules: testRules, type: 'book' }]
      };
      try {
        validateAPIValidator.validateValidationApi(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          `Invalid/Missing attributes in the rulesList of book`
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw 400 error when rulelist does not contain any id in request', (done) => {
      const request: Request = new mockExpressRequest();
      const rulesListNoIdentifier = [
        {
          attributes: [],
          rules: [
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
                value: 'END'
              },
              type: 'separator'
            }
          ],
          type: 'book'
        }
      ];
      request.body = { ...testQuery, rulesList: rulesListNoIdentifier };
      try {
        validateAPIValidator.validateValidationApi(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          `Missing identifier in Query for book, ` +
            `atleast one of _id,identifiers.isbn,identifiers.doi is required.`
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw 400 error when rulelist does not contain whitelisted id', (done) => {
      const request: Request = new mockExpressRequest();
      const rulesListNoIdentifier = [
        {
          attributes: [],
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
                attribute: 'identifiers.dacKey',
                relationship: 'IN',
                values: ['some-isbn']
              },
              type: 'criteria'
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
        }
      ];
      request.body = { ...testQuery, rulesList: rulesListNoIdentifier };
      try {
        validateAPIValidator.validateValidationApi(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          'Missing identifier in Query for book, atleast one of ' +
            '_id,identifiers.isbn,identifiers.doi is required.'
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw 400 error when rulelist has OR logical operator', (done) => {
      const request: Request = new mockExpressRequest();
      const rulesListNoIdentifier = [
        {
          attributes: [],
          rules: [
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
                attribute: 'identifiers.doi',
                relationship: 'IN',
                values: ['1234567890123']
              },
              type: 'criteria'
            },
            {
              position: 3,
              rule: {
                value: 'OR'
              },
              type: 'logical'
            },
            {
              position: 4,
              rule: {
                attribute: 'identifiers.dacKey',
                relationship: 'IN',
                values: ['C2018-12345678']
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
      request.body = { ...testQuery, rulesList: rulesListNoIdentifier };
      try {
        validateAPIValidator.validateValidationApi(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          `Invalid logical operator for book at position 3, only AND is allowed`
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw 400 error when rulelist has invalid criteria realtionship (NE)', (done) => {
      const request: Request = new mockExpressRequest();
      const rulesListNoIdentifier = [
        {
          attributes: [],
          rules: [
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
                attribute: 'identifiers.doi',
                relationship: 'NE',
                values: new Array(65)
              },
              type: 'criteria'
            },
            {
              position: 3,
              rule: {
                value: 'AND'
              },
              type: 'logical'
            },
            {
              position: 4,
              rule: {
                attribute: '_id',
                relationship: 'IN',
                values: new Array(25)
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
      request.body = { ...testQuery, rulesList: rulesListNoIdentifier };
      try {
        validateAPIValidator.validateValidationApi(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          'Restricted Operator in criteria for identifiers.doi ' +
            'at position 2, only IN,EQ are allowed'
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw 400 error when rulelist has more than 100 identifiers', (done) => {
      const request: Request = new mockExpressRequest();
      const rulesListNoIdentifier = [
        {
          attributes: [],
          rules: [
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
                attribute: 'identifiers.doi',
                relationship: 'IN',
                values: new Array(100)
              },
              type: 'criteria'
            },
            {
              position: 3,
              rule: {
                value: 'AND'
              },
              type: 'logical'
            },
            {
              position: 4,
              rule: {
                attribute: '_id',
                relationship: 'EQ',
                value: 'qetasdsah5123456789q'
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
      request.body = { ...testQuery, rulesList: rulesListNoIdentifier };
      try {
        validateAPIValidator.validateValidationApi(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(`Only 100 identifiers are allowed.`);
        expect(error.code).to.equal(400);
        done();
      }
    });
    // This test is not valid anymore as we have put restiction to limt rulesList to 1
    it.skip('should throw 400 error when multiple rules specified for same product type', (done) => {
      const request: Request = new mockExpressRequest();
      const rulesListNoIdentifier = [
        {
          attributes: [],
          rules: [
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
                attribute: '_id',
                relationship: 'IN',
                values: new Array(25)
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
          ],
          type: 'book'
        },
        {
          attributes: [],
          rules: [
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
                values: new Array(25)
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
          ],
          type: 'book'
        }
      ];
      request.body = { ...testQuery, rulesList: rulesListNoIdentifier };
      try {
        validateAPIValidator.validateValidationApi(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(`Multiple rules for same product type`);
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw 400 error more than one rule specified in the rulesList', (done) => {
      const request: Request = new mockExpressRequest();
      const rulesListNoIdentifier = [
        {
          attributes: [],
          rules: [
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
                attribute: '_id',
                relationship: 'IN',
                values: new Array(25)
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
          ],
          type: 'book'
        },
        {
          attributes: [],
          rules: [
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
                values: new Array(25)
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
          ],
          type: 'chapter'
        }
      ];
      request.body = { ...testQuery, rulesList: rulesListNoIdentifier };
      try {
        validateAPIValidator.validateValidationApi(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          'We support only one rule inside the rulesList'
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should not throw error when search query is valid', (done) => {
      const request: Request = new mockExpressRequest();
      const rulesList = [
        {
          attributes: [],
          rules: [
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
                attribute: 'identifiers.dackey',
                relationship: 'NE',
                values: new Array(65)
              },
              type: 'criteria'
            },
            {
              position: 3,
              rule: {
                value: 'AND'
              },
              type: 'logical'
            },
            {
              position: 4,
              rule: {
                attribute: '_id',
                relationship: 'IN',
                values: new Array(25)
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
      request.body = { ...testQuery, rulesList };
      try {
        validateAPIValidator.validateValidationApi(request);
        done();
      } catch (error) {
        done(error);
      }
    });
    it('should not throw error when a rule is missing for each rule type', (done) => {
      const request: Request = new mockExpressRequest();
      const rulesListMissingRule = [
        {
          attributes: [],
          rules: [
            {
              type: 'separator'
            },
            {
              type: 'criteria'
            },
            {
              rule: {
                value: 'AND'
              },
              type: 'logical'
            },
            {
              rule: {
                attribute: '_id',
                relationship: 'IN',
                values: new Array(25)
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        }
      ];
      request.body = { ...testQuery, rulesList: rulesListMissingRule };
      try {
        validateAPIValidator.validateValidationApi(request);
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});
