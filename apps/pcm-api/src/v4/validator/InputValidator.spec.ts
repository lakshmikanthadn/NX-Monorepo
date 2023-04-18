import { expect } from 'chai';
import { Request } from 'express';
import * as mockExpressRequest from 'mock-express-request';

import { APIResponseGroup } from '../model/interfaces/CustomDataTypes';
import { inputValidator } from './InputValidator';

describe('InputValidator', () => {
  describe('validateAPIVersionResponseGroup', () => {
    it('should pass validation when APIVersion = 4.0.1 & responseGroup = small ', (done) => {
      const apiVersion = '4.0.1';
      const responseGroup = 'small';
      try {
        const isValid = inputValidator.validateAPIVersionResponseGroup(
          apiVersion,
          responseGroup
        );
        expect(isValid).to.equal(true);
        done();
      } catch (error) {
        done(error);
      }
    });
    it('should throw error when apiVersion = 4.0.0 & responseGroup = small', (done) => {
      const apiVersion = '4.0.0';
      const responseGroup = 'small';
      try {
        inputValidator.validateAPIVersionResponseGroup(
          apiVersion,
          responseGroup
        );
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          'This API Version does not support response group.'
        );
        expect(error.code).to.equal(404);
        done();
      }
    });
    it('should throw error when APIVersion = 4.0.1 & responseGroup = invalid', (done) => {
      const apiVersion = '4.0.1';
      const responseGroup = 'invalid';
      try {
        inputValidator.validateAPIVersionResponseGroup(
          apiVersion,
          responseGroup as APIResponseGroup
        );
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal('Invalid Response group');
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should pass validation when APIVersion = 4.0.2 & responseGroup = small ', (done) => {
      const apiVersion = '4.0.2';
      const responseGroup = 'small';
      try {
        const isValid = inputValidator.validateAPIVersionResponseGroup(
          apiVersion,
          responseGroup
        );
        expect(isValid).to.equal(true);
        done();
      } catch (error) {
        done(error);
      }
    });
    it('should throw error when APIVersion = 4.0.2 & responseGroup = invalid', (done) => {
      const apiVersion = '4.0.2';
      const responseGroup = 'invalid';
      try {
        inputValidator.validateAPIVersionResponseGroup(
          apiVersion,
          responseGroup as APIResponseGroup
        );
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal('Invalid Response group');
        expect(error.code).to.equal(400);
        done();
      }
    });
  });
  describe('validateOffsetLimit', () => {
    it(`should pass validation when offset = '0' & limit = '1' `, (done) => {
      const offset = '0';
      const limit = '1';
      try {
        const isValid = inputValidator.validateOffsetLimit(offset, limit);
        expect(isValid).to.equal(true);
        done();
      } catch (error) {
        done(error);
      }
    });
    it(`should throw error when limit is invalid `, (done) => {
      const offset = '0';
      const limit = 'limit';
      try {
        inputValidator.validateOffsetLimit(offset, limit);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal('Invalid query parameter: limit');
        expect(error.code).to.equal(400);
        done();
      }
    });
    it(`should throw error when offset is invalid `, (done) => {
      const offset = 'offset';
      const limit = '1';
      try {
        inputValidator.validateOffsetLimit(offset, limit);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal('Invalid query parameter: offset');
        expect(error.code).to.equal(400);
        done();
      }
    });
    it(`should throw error when limit < 0 i.e negative limit `, (done) => {
      const offset = '0';
      const limit = '-5';
      try {
        inputValidator.validateOffsetLimit(offset, limit);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal('limit should be between 1 - 50');
        expect(error.code).to.equal(400);
        done();
      }
    });
    it(`should throw error when limit > default limit(50) `, (done) => {
      const offset = '0';
      const limit = '55';
      try {
        inputValidator.validateOffsetLimit(offset, limit);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal('limit should be between 1 - 50');
        expect(error.code).to.equal(400);
        done();
      }
    });
  });
  describe('validateIdNameAndIdValues', () => {
    it(`should pass validation when identifierName & identifierValues are valid `, (done) => {
      const identifierName = 'isbn';
      const identifierValues = '123456789';
      const responseGroup = 'small';
      const productType = 'book';
      try {
        const isValid = inputValidator.validateIdNameAndIdValues(
          identifierName,
          identifierValues,
          responseGroup,
          productType
        );
        expect(isValid).to.equal(true);
        done();
      } catch (error) {
        done(error);
      }
    });
    it(`should throw error when identifierName is undefined `, (done) => {
      const identifierName = undefined;
      const identifierValues = '123456789';
      const responseGroup = 'small';
      const productType = 'book';
      try {
        inputValidator.validateIdNameAndIdValues(
          identifierName,
          identifierValues,
          responseGroup,
          productType
        );
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          'Missing query parameter: identifierName'
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
    it(`should throw error when identifierValues is undefined `, (done) => {
      const identifierName = 'isbn';
      const identifierValues = undefined;
      const responseGroup = 'small';
      const productType = 'book';
      try {
        inputValidator.validateIdNameAndIdValues(
          identifierName,
          identifierValues,
          responseGroup,
          productType
        );
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          'Missing query parameter: identifierValues'
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
    it(`should throw error when identifierName is invalid `, (done) => {
      const identifierName = 'invalid';
      const identifierValues = '123456789';
      const responseGroup = 'small';
      const productType = 'book';
      try {
        inputValidator.validateIdNameAndIdValues(
          identifierName,
          identifierValues,
          responseGroup,
          productType
        );
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          `Invalid identifier-name: ${identifierName}`
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
    it(`should throw error when identifierName is title but type is not provided `, (done) => {
      const identifierName = 'title';
      const identifierValues = 'some-title';
      const responseGroup = 'small';
      const productType = undefined;
      try {
        inputValidator.validateIdNameAndIdValues(
          identifierName,
          identifierValues,
          responseGroup,
          productType
        );
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          `Missing query parameter: type when identifierName is ${identifierName}`
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
    describe('Validation based on identifierName and id identifierValues', () => {
      const testScenarios = [
        {
          identifierName: 'isbn',
          maxIdentifierValuesCount: 100,
          responseGroup: 'small'
        },
        {
          identifierName: 'isbn',
          maxIdentifierValuesCount: 100,
          responseGroup: 'medium'
        },
        {
          identifierName: 'isbn',
          maxIdentifierValuesCount: 50,
          responseGroup: 'large'
        },
        {
          identifierName: 'journalAcronym',
          maxIdentifierValuesCount: 100,
          responseGroup: 'small'
        },
        {
          identifierName: 'journalAcronym',
          maxIdentifierValuesCount: 100,
          responseGroup: 'medium'
        },
        {
          identifierName: 'journalAcronym',
          maxIdentifierValuesCount: 50,
          responseGroup: 'large'
        },
        {
          identifierName: 'doi',
          maxIdentifierValuesCount: 30,
          responseGroup: 'small'
        },
        {
          identifierName: 'doi',
          maxIdentifierValuesCount: 30,
          responseGroup: 'medium'
        },
        {
          identifierName: 'doi',
          maxIdentifierValuesCount: 30,
          responseGroup: 'large'
        },
        {
          identifierName: '_id',
          maxIdentifierValuesCount: 100,
          responseGroup: 'small'
        },
        {
          identifierName: '_id',
          maxIdentifierValuesCount: 100,
          responseGroup: 'medium'
        },
        {
          identifierName: '_id',
          maxIdentifierValuesCount: 50,
          responseGroup: 'large'
        },
        {
          identifierName: 'dacKey',
          maxIdentifierValuesCount: 30,
          responseGroup: 'small'
        },
        {
          identifierName: 'dacKey',
          maxIdentifierValuesCount: 30,
          responseGroup: 'medium'
        },
        {
          identifierName: 'dacKey',
          maxIdentifierValuesCount: 30,
          responseGroup: 'large'
        }
      ];
      testScenarios.forEach((ts) => {
        const idName = ts.identifierName;
        const responseGroup = ts.responseGroup as APIResponseGroup;
        it(
          `should pass validation when identifierValues = ${ts.maxIdentifierValuesCount}` +
            ` & responseGroup=${responseGroup} & identifierName=${idName}`,
          (done) => {
            let inputIdsCount = ts.maxIdentifierValuesCount;
            const idValues = [];
            while (inputIdsCount--) {
              idValues.push('dummyId');
            }
            try {
              const isValid = inputValidator.validateIdNameAndIdValues(
                idName,
                idValues.join(','),
                responseGroup,
                'book'
              );
              expect(isValid).to.equal(true);
              done();
            } catch (error) {
              done(error);
            }
          }
        );
        it(
          `should throw error when identifierValues > ${
            ts.maxIdentifierValuesCount + 1
          }` + ` & responseGroup=${responseGroup} & identifierName=${idName} `,
          (done) => {
            const errMsg = `identifierValues should contain min 1 and max ${ts.maxIdentifierValuesCount} values for ${idName}`;
            let inputIdsCount = ts.maxIdentifierValuesCount;
            const idValues = [];
            while (inputIdsCount--) {
              idValues.push('dummyId');
            }
            // Push one more id to make the validation fail.
            idValues.push('dummyId');
            try {
              inputValidator.validateIdNameAndIdValues(
                idName,
                idValues.join(','),
                responseGroup,
                'book'
              );
              done(new Error('Expecting error, but got success'));
            } catch (error) {
              expect(error.message).to.equal(errMsg);
              expect(error.code).to.equal(400);
              done();
            }
          }
        );
      });
    });
  });
  describe('validatePreArticleIdNameAndIdValues', () => {
    it(`should pass validation when identifierName & identifierValues are valid `, (done) => {
      const identifierName = 'submissionId';
      const identifierValues = '123456789';
      const responseGroup = 'small';
      try {
        const isValid = inputValidator.validatePreArticleIdNameAndIdValues(
          identifierName,
          identifierValues,
          responseGroup
        );
        expect(isValid).to.equal(true);
        done();
      } catch (error) {
        done(error);
      }
    });
    it(`should throw error when identifierName is undefined`, (done) => {
      const identifierName = undefined;
      const identifierValues = '123456789';
      const responseGroup = 'small';
      try {
        inputValidator.validatePreArticleIdNameAndIdValues(
          identifierName,
          identifierValues,
          responseGroup
        );
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          'Missing query parameter: identifierName'
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
    it(`should throw error when identifierValues is undefined`, (done) => {
      const identifierName = 'submissionId';
      const identifierValues = undefined;
      const responseGroup = 'small';
      try {
        inputValidator.validatePreArticleIdNameAndIdValues(
          identifierName,
          identifierValues,
          responseGroup
        );
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          'Missing query parameter: identifierValues'
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
    it(`should throw error when identifierName is invalid`, (done) => {
      const identifierName = 'invalid';
      const identifierValues = '123456789';
      const responseGroup = 'small';
      try {
        inputValidator.validatePreArticleIdNameAndIdValues(
          identifierName,
          identifierValues,
          responseGroup
        );
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          `Invalid identifier-name: ${identifierName}`
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
    describe('Validation based on identifierName and id identifierValues', () => {
      const testScenarios = [
        {
          identifierName: 'submissionId',
          maxIdentifierValuesCount: 30,
          responseGroup: 'small'
        }
      ];
      testScenarios.forEach((ts) => {
        const idName = ts.identifierName;
        const responseGroup = ts.responseGroup as APIResponseGroup;
        it(
          `should pass validation when identifierValues = ${ts.maxIdentifierValuesCount}` +
            ` & responseGroup=${responseGroup} & identifierName=${idName}`,
          (done) => {
            let inputIdsCount = ts.maxIdentifierValuesCount;
            const idValues = [];
            while (inputIdsCount--) {
              idValues.push('dummyId');
            }
            try {
              const isValid =
                inputValidator.validatePreArticleIdNameAndIdValues(
                  idName,
                  idValues.join(','),
                  responseGroup
                );
              expect(isValid).to.equal(true);
              done();
            } catch (error) {
              done(error);
            }
          }
        );
        it(
          `should throw error when identifierValues > ${
            ts.maxIdentifierValuesCount + 1
          }` + ` & responseGroup=${responseGroup} & identifierName=${idName} `,
          (done) => {
            const errMsg = `identifierValues should contain min 1 and max ${ts.maxIdentifierValuesCount} values for ${idName}`;
            let inputIdsCount = ts.maxIdentifierValuesCount;
            const idValues = [];
            while (inputIdsCount--) {
              idValues.push('dummyId');
            }
            // Push one more id to make the validation fail.
            idValues.push('dummyId');
            try {
              inputValidator.validatePreArticleIdNameAndIdValues(
                idName,
                idValues.join(','),
                responseGroup
              );
              done(new Error('Expecting error, but got success'));
            } catch (error) {
              expect(error.message).to.equal(errMsg);
              expect(error.code).to.equal(400);
              done();
            }
          }
        );
      });
    });
  });
  describe('validateProductType', () => {
    it(`should pass validation when productType is valid `, (done) => {
      const productType = 'book';
      try {
        const isValid = inputValidator.validateProductType(productType);
        expect(isValid).to.equal(true);
        done();
      } catch (error) {
        done(error);
      }
    });
    it(`should throw error when productType is invalid `, (done) => {
      const productType = 'invalid';
      try {
        inputValidator.validateProductType(productType as any);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal('Invalid product type : invalid');
        expect(error.code).to.equal(400);
        done();
      }
    });
  });
  describe('validateFormatType', () => {
    it('should pass validation when format is valid', (done) => {
      const format = 'document';
      try {
        const isValid = inputValidator.validateFormatType(format);
        expect(isValid).to.equal(true);
        done();
      } catch (error) {
        done(error);
      }
    });
    it('should throw error when format is invalid', (done) => {
      const format = 'invalid-format';
      try {
        inputValidator.validateFormatType(format);
        done(new Error('Expecting error, but got success'));
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal('Invalid format: invalid-format');
        done();
      }
    });
  });
  describe('productHasPartsValidator', () => {
    it('should pass validation when the request is valid', (done) => {
      const request = {
        query: {
          limit: 1,
          offset: 0,
          partType: 'chapter'
        }
      };
      try {
        const isValid = inputValidator.productHasPartsValidator(request);
        expect(isValid).to.equal(true);
        done();
      } catch (error) {
        done(error);
      }
    });
    it('should throw error when the request contains expanded param is invalid', (done) => {
      const request = {
        query: {
          expanded: 'true',
          limit: 1,
          offset: 0,
          partType: 'chapter'
        }
      };
      try {
        inputValidator.productHasPartsValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal('Invalid query parameter: expanded');
        done();
      }
    });
    it('should throw error when the request contains productVersion param', (done) => {
      const request = {
        query: {
          limit: 1,
          offset: 0,
          partType: 'chapter',
          productVersion: '1.0.0'
        }
      };
      try {
        inputValidator.productHasPartsValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          'currently we are not supporting productVersion'
        );
        done();
      }
    });
    it('should throw error when format is passed without type', (done) => {
      const request = {
        query: {
          format: 'presentation',
          limit: 1,
          offset: 0
        }
      };
      try {
        inputValidator.productHasPartsValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          'format is only supported with type creativeWork'
        );
        done();
      }
    });
    it('should throw error when format is passed and type is not creativeWork', (done) => {
      const request = {
        query: {
          format: 'presentation',
          limit: 1,
          offset: 0,
          type: 'chapter'
        }
      };
      try {
        inputValidator.productHasPartsValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          'format is only supported with type creativeWork'
        );
        done();
      }
    });
    it('should throw error when the  responseGroup is large invalid', (done) => {
      const request = {
        query: {
          limit: 1,
          offset: 0,
          responseGroup: 'large'
        }
      };
      try {
        inputValidator.productHasPartsValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          `Invalid Response group: ${request.query.responseGroup}`
        );
        done();
      }
    });
    it(`should throw error when the depth passed with apiVersion=4.0.1 and responseGroup is 
      small`, (done) => {
      const request = {
        query: {
          apiVersion: '4.0.1',
          depth: 1,
          limit: 1,
          offset: 0,
          responseGroup: 'small'
        }
      };
      try {
        inputValidator.productHasPartsValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          `depth is not supported for apiVersion ${request.query.apiVersion}`
        );
        done();
      }
    });
    it(`should throw error when the  apiVersion=4.0.2, depth=2 and  responseGroup is 
     not small`, (done) => {
      const request = {
        query: {
          apiVersion: '4.0.2',
          depth: 2,
          limit: 1,
          offset: 0,
          responseGroup: 'medium'
        }
      };
      try {
        inputValidator.productHasPartsValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          `apiVersion ${request.query.apiVersion} does not support responseGroup ${request.query.responseGroup}`
        );
        done();
      }
    });
    it(`should throw error when the  apiVersion=4.0.2, depth =0 and  responseGroup is 
     small`, (done) => {
      const request = {
        query: {
          apiVersion: '4.0.2',
          depth: 0,
          limit: 1,
          offset: 0,
          responseGroup: 'small'
        }
      };
      try {
        inputValidator.productHasPartsValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(`Invalid depth: ${request.query.depth}`);
        done();
      }
    });
    it(`should throw error when the  apiVersion=4.0.2, depth =garbage and  responseGroup is 
     small`, (done) => {
      const request = {
        query: {
          apiVersion: '4.0.2',
          depth: 'garbage',
          limit: 1,
          offset: 0,
          responseGroup: 'small'
        }
      };
      try {
        inputValidator.productHasPartsValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          `Invalid query parameter: depth with value ${request.query.depth}`
        );
        done();
      }
    });
    it(`should validate without error when the  apiVersion=4.0.2, depth =2 and  responseGroup is 
     small`, (done) => {
      const request = {
        query: {
          apiVersion: '4.0.2',
          depth: 2,
          limit: 1,
          offset: 0,
          responseGroup: 'small'
        }
      };
      const result = inputValidator.productHasPartsValidator(request);
      expect(result).to.equal(true);
      done();
    });
    it(`should validate without error when the  apiVersion=4.0.2, depth =null and  responseGroup is 
     small`, (done) => {
      const request = {
        query: {
          apiVersion: '4.0.2',
          depth: null,
          limit: 1,
          offset: 0,
          responseGroup: 'small'
        }
      };
      const result = inputValidator.productHasPartsValidator(request);
      expect(result).to.equal(true);
      done();
    });
    it('should throw error when the request contains invalid identifer type', (done) => {
      const request = {
        query: {
          identifierType: 'invalid-identifier'
        }
      };
      try {
        inputValidator.productHasPartsValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          'Invalid identifier type: invalid-identifier'
        );
        done();
      }
    });
    it('should throw error when the the value for includeCounts req parameter is invalid', (done) => {
      const request = {
        query: {
          includeCounts: 'invalid-value'
        }
      };
      try {
        inputValidator.productHasPartsValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          'Invalid includeCounts value: invalid-value'
        );
        done();
      }
    });
  });
  describe('productv410HasPartsValidator', () => {
    const request: Request = new mockExpressRequest();
    beforeEach(() => {
      request.query = {
        apiVersion: '4.0.1',
        appName: 'SF',
        limit: 1,
        offsetCursor: '',
        q: 'some-text-to-search',
        region: 'some-region',
        responseGroup: 'small',
        version: 'some-version'
      };
    });
    it('should pass validation when the request is valid', (done) => {
      try {
        const isValid = inputValidator.productv410HasPartsValidator(request);
        expect(isValid).to.equal(true);
        done();
      } catch (error) {
        done(error);
      }
    });
    it('should throw error when the request contains additionalParam which is invalid', (done) => {
      request.query.additionalParam = 'some-extra-param';
      try {
        inputValidator.productv410HasPartsValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal('Invalid parameter: additionalParam');
        done();
      }
    });
    it('should throw error when the request contains appName and it is not SF', (done) => {
      request.query.appName = 'some-invalid-app-name';
      try {
        inputValidator.productv410HasPartsValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          `Invalid app name ${request.query.appName}`
        );
        done();
      }
    });
    it('should throw error when q is passed without appName', (done) => {
      request.query.appName = null;
      try {
        inputValidator.productv410HasPartsValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          'Missing parameter appName if q is present'
        );
        done();
      }
    });
    it('should throw error when limit is passed but not as a number', (done) => {
      request.query.limit = 'some-string';
      try {
        inputValidator.productv410HasPartsValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal('Invalid query parameter: limit');
        done();
      }
    });
    it('should throw error when limit is passed and as a number but < 0', (done) => {
      request.query.limit = -1;
      try {
        inputValidator.productv410HasPartsValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal('limit should not be less than 0');
        done();
      }
    });
    it('should throw error when the responseGroup is large which is invalid', (done) => {
      request.query.responseGroup = 'large';
      try {
        inputValidator.productv410HasPartsValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          `Invalid Response group: ${request.query.responseGroup}. Currently we are only supporting small and medium.`
        );
        done();
      }
    });
    it('should throw error when the invalid offsetCursor is passed', (done) => {
      request.query.offsetCursor = 'xyz';
      try {
        inputValidator.productv410HasPartsValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          `Invalid offsetCursor : ${request.query.offsetCursor}`
        );
        done();
      }
    });
  });
  describe('validateContentAttributes', () => {
    it(`should pass validation when all attributes of content are perfect `, (done) => {
      const content = {
        fileName: 'content3.mp4',
        parentId: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'video'
      } as any;
      try {
        const isValid = inputValidator.validateContentAttributes(content);
        expect(isValid).to.equal(true);
        done();
      } catch (error) {
        done(error);
      }
    });
    it(`should throw error when parentId is missing`, (done) => {
      const content = {
        fileName: 'content3.mp4',
        type: 'video'
      };
      try {
        inputValidator.validateContentAttributes(content as any);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          `Invalid input content : ${JSON.stringify(content)}`
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
    it(`should throw error when type is missing`, (done) => {
      const content = {
        fileName: 'content3.mp4',
        parentId: '6c9f9801-3519-425d-be31-8829cae4bac4'
      };
      try {
        inputValidator.validateContentAttributes(content as any);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          `Invalid input content : ${JSON.stringify(content)}`
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
    it(`should throw error when fileName is missing`, (done) => {
      const content = {
        parentId: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'video'
      };
      try {
        inputValidator.validateContentAttributes(content as any);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          `Invalid input content : ${JSON.stringify(content)}`
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
  });
  describe('productPartsDeltaValidator', () => {
    const request: Request = new mockExpressRequest();
    beforeEach(() => {
      request.query = {
        apiVersion: '4.0.1',
        region: 'some-region',
        responseGroup: 'small',
        v1: 'some-collection-version1',
        v2: 'some-collection-version2'
      };
    });
    it('should pass validation when the request is valid', (done) => {
      try {
        const isValid = inputValidator.productPartsDeltaValidator(request);
        expect(isValid).to.equal(true);
        done();
      } catch (error) {
        done(error);
      }
    });
    it('should throw error when v1 is not passed', (done) => {
      request.query.v1 = null;
      try {
        inputValidator.productPartsDeltaValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal('Missing collection version parameter v1');
        done();
      }
    });
    it('should throw error when v2 is not passed', (done) => {
      request.query.v2 = null;
      try {
        inputValidator.productPartsDeltaValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal('Missing collection version parameter v2');
        done();
      }
    });
    it('should throw error when v1 and v2 are the same', (done) => {
      request.query.v2 = 'some-collection-version1';
      try {
        inputValidator.productPartsDeltaValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          'Delta cannot be found between same product version'
        );
        done();
      }
    });
    it('should throw error when the responseGroup is large which is invalid', (done) => {
      request.query.responseGroup = 'large';
      try {
        inputValidator.productPartsDeltaValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          `Invalid Response group: ${request.query.responseGroup}. Currently we are only supporting small.`
        );
        done();
      }
    });
    it('should throw error when the responseGroup is medium which is invalid', (done) => {
      request.query.responseGroup = 'medium';
      try {
        inputValidator.productPartsDeltaValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal(
          `Invalid Response group: ${request.query.responseGroup}. Currently we are only supporting small.`
        );
        done();
      }
    });
    it('should throw error when the request contains additionalParam which is invalid', (done) => {
      request.query.additionalParam = 'some-extra-param';
      try {
        inputValidator.productPartsDeltaValidator(request);
        done(new Error('Expecting error, but got success'));
      } catch (err) {
        expect(err.code).to.equal(400);
        expect(err.message).to.equal('Invalid parameter: additionalParam');
        done();
      }
    });
  });
  describe('validateAssociatedMedia', () => {
    it(`should pass validation when content is valid `, (done) => {
      const request = {
        body: {
          fileName: 'content3.mp4',
          parentId: '6c9f9801-3519-425d-be31-8829cae4bac4',
          type: 'video'
        }
      } as any;
      try {
        const isValid = inputValidator.validateAssociatedMedia(request);
        expect(isValid).to.equal(true);
        done();
      } catch (error) {
        done(error);
      }
    });
    it(`should throw error when content-type for given filename is not found`, (done) => {
      const request = {
        body: {
          fileName: 'content3.db',
          parentId: '6c9f9801-3519-425d-be31-8829cae4bac4',
          type: 'video'
        }
      } as any;
      try {
        inputValidator.validateAssociatedMedia(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal('Invalid content-type');
        expect(error.code).to.equal(400);
        done();
      }
    });
    it(`should pass validation when type is database with whatever fileName `, (done) => {
      const request = {
        body: {
          fileName: 'content3.mp4',
          parentId: '6c9f9801-3519-425d-be31-8829cae4bac4',
          type: 'database'
        }
      } as any;
      try {
        const isValid = inputValidator.validateAssociatedMedia(request);
        expect(isValid).to.equal(true);
        done();
      } catch (error) {
        done(error);
      }
    });
    it(`should throw error when type is hyperlink as hyperlink is not supported`, (done) => {
      const request = {
        body: {
          fileName: 'content3.mp4',
          parentId: '6c9f9801-3519-425d-be31-8829cae4bac4',

          type: 'hyperlink'
        }
      } as any;
      try {
        inputValidator.validateAssociatedMedia(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          'hyperlink is no more supported using this api'
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
  });
  describe('validateTaxonomyQueryFilters', () => {
    it('should throw error when the classification level is not numeric', (done) => {
      const request: Request = new mockExpressRequest();
      request.query.level = 'one';
      try {
        inputValidator.validateTaxonomyQueryFilters(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          'Query-param `level` value is not Numeric'
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw error when extendLevel flag is true and level is missing', (done) => {
      const request: Request = new mockExpressRequest();
      request.query.extendLevel = 'true';
      try {
        inputValidator.validateTaxonomyQueryFilters(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          'Query-param `level` is mandatory when `extendLevel` is passed'
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw error when isCodePrefix flag is true and code is missing.', (done) => {
      const request: Request = new mockExpressRequest();
      request.query.isCodePrefix = 'true';
      try {
        inputValidator.validateTaxonomyQueryFilters(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          'Query-param `code` is mandatory when `isCodePrefix` is passed'
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw error when isCodePrefix flag is not boolean', (done) => {
      const request: Request = new mockExpressRequest();
      request.query.code = 'SCAG01';
      request.query.isCodePrefix = 'yes';
      try {
        inputValidator.validateTaxonomyQueryFilters(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          'Query-param `isCodePrefix` value is not Boolean'
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw error when extendLevel flag is not boolean', (done) => {
      const request: Request = new mockExpressRequest();
      request.query.level = '2';
      request.query.extendLevel = 'one';
      try {
        inputValidator.validateTaxonomyQueryFilters(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          'Query-param `extendLevel` value is not Boolean'
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should return true when there are no query params', (done) => {
      const request: Request = new mockExpressRequest();
      try {
        inputValidator.validateTaxonomyQueryFilters(request);
        done();
      } catch (error) {
        done(error);
      }
    });
    it('should return true when all the query params are valid', (done) => {
      const request: Request = new mockExpressRequest();
      request.query.level = '1';
      request.query.extendLevel = 'false';
      request.query.code = 'SCAG01';
      request.query.isCodePrefix = 'false';
      try {
        inputValidator.validateTaxonomyQueryFilters(request);
        done();
      } catch (error) {
        done(error);
      }
    });
    it('should return true when isCodePrefix and  extendLevel are string true', (done) => {
      const request: Request = new mockExpressRequest();
      request.query.level = '1';
      request.query.extendLevel = 'true';
      request.query.code = 'SCAG01';
      request.query.isCodePrefix = 'true';
      try {
        inputValidator.validateTaxonomyQueryFilters(request);
        done();
      } catch (error) {
        done(error);
      }
    });
  });
  describe('validateTaxonomyClassificationFilters', () => {
    it('should throw error when classificationFamily not provided', (done) => {
      const request: Request = new mockExpressRequest();
      request.query = {
        level: '1'
      };
      try {
        inputValidator.validateTaxonomyClassificationFilters(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          'Query-param `classificationFamily` is mandatory'
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw error when classificationFamily invalid', (done) => {
      const request: Request = new mockExpressRequest();
      request.query = {
        classificationFamily: 'invalid'
      };
      try {
        inputValidator.validateTaxonomyClassificationFilters(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          'Query-param `classificationFamily` value is invalid'
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw error when the classification level is not numeric', (done) => {
      const request: Request = new mockExpressRequest();
      request.query = {
        classificationFamily: 'rom',
        level: 'one'
      };
      try {
        inputValidator.validateTaxonomyClassificationFilters(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          'Query-param `level` value is not Numeric'
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
    it('should throw error when  includeChildren is not boolean', (done) => {
      const request: Request = new mockExpressRequest();
      request.query = {
        classificationFamily: 'rom',
        includeChildren: 'not-boolean',
        level: '1'
      };
      try {
        inputValidator.validateTaxonomyClassificationFilters(request);
        done(new Error('Expecting error, but got success'));
      } catch (error) {
        expect(error.message).to.equal(
          'Query-param `includeChildren` value is not Boolean'
        );
        expect(error.code).to.equal(400);
        done();
      }
    });
  });
});
