import { expect } from 'chai';
import { contentV410ReqValidator } from './Content.V410.ReqValidator';

describe('ContentV410Controller', () => {
  describe('validate', () => {
    it('it should NOT throw any error when the request is valid', (done) => {
      const query = {
        apiVersion: '4.1.0',
        filenamePrefix: '12345_web',
        parentId: 'some-id',

        render: 'true',
        // Query parameters will always be string
        type: 'webpdf'
      };
      try {
        contentV410ReqValidator.validateQueryParams(query);
        done();
      } catch (e) {
        console.log(e);
        done(e);
      }
    });

    it('it should throw error when ther is a un expected query parameter called identifierName', (done) => {
      const query = {
        apiVersion: '4.1.0',
        filenamePrefix: 'length_less_than_50',
        identifierName: '1234',

        parentId: 'some-id',

        render: 'true',
        // Query parameters will always be string
        type: 'webpdf'
      };
      try {
        const valid = contentV410ReqValidator.validateQueryParams(query);
        expect(valid, 'Expecting validation failure').to.equal(false);
      } catch (error) {
        expect(error.code).to.equal(400);
        expect(error.message).to.equal(`Request validation error.`);
        expect(error.name).to.equal('AppError');
        expect(error.info).to.be.an('array');
        expect(error.info.length).to.equal(1);
        expect(error.info[0].message).to.equal(
          'should NOT have additional properties'
        );
        done();
      }
    });

    const testCases = [
      {
        name: 'it should throw error when the render is not true/false (string)',
        propertyUnderTest: 'render',
        propertyValue: 'yes'
      },
      {
        name: 'it should throw error when the apiVersion is not 4.1.0',
        propertyUnderTest: 'apiVersion',
        propertyValue: '4.0.0'
      },
      {
        name: 'it should throw error when the parentId is not string',
        propertyUnderTest: 'parentId',
        propertyValue: 1234
      },
      {
        name: 'it should throw error when filenamePrefix string length is greater than 50',
        propertyUnderTest: 'filenamePrefix',
        propertyValue:
          'string_length_greater_than_50_string_length_greater_than_50'
      }
    ];

    testCases.forEach((testCase) => {
      it(testCase.name, (done) => {
        const query = {
          apiVersion: '4.1.0',
          filenamePrefix: 'length_less_than_50',
          parentId: 'some-id',

          render: 'true',
          // Query parameters will always be string
          type: 'webpdf'
        };
        query[testCase.propertyUnderTest] = testCase.propertyValue;
        try {
          const valid = contentV410ReqValidator.validateQueryParams(query);
          expect(valid, 'Expecting validation failure').to.equal(false);
        } catch (error) {
          expect(error.code).to.equal(400);
          expect(error.message).to.equal(`Request validation error.`);
          expect(error.name).to.equal('AppError');
          expect(error.info).to.be.an('array');
          expect(error.info.length).to.equal(1);
          expect(error.info[0].dataPath).to.equal(
            '.' + testCase.propertyUnderTest
          );
          done();
        }
      });
    });
  });
});
