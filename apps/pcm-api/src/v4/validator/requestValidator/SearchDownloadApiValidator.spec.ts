import { expect } from 'chai';

import { searchDownloadValidator } from './SearchDownloadApiValidator';

describe('searchDownloadValidator', () => {
  describe('validateSearchDownloadRequest', () => {
    let searchRequest;
    beforeEach(() => {
      searchRequest = {
        _id: 'UUID',
        action: 'download',
        apiVersion: '4.0.1',
        availability: {
          name: 'UBX',
          status: ['SELLABLE']
        },
        fileName: 'HSS-Frontlist-2020-10-22_16_48.csv',
        recipients: {
          cc: ['cc@abc.com'],
          to: ['test@xyz.com']
        },
        rulesList: [
          {
            attributes: ['title', 'identifiers.doi', 'contributors.fullName'],
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
                  attribute: 'book.publicationDate',
                  relationship: 'GT',
                  value: '2020-01-20T00:00:00.000Z'
                },
                type: 'criteria'
              },
              {
                position: 0,
                rule: {
                  value: 'END'
                },
                type: 'separator'
              }
            ],
            type: 'book'
          }
        ]
      };
    });
    it(`should pass validation when search request is valid`, (done) => {
      try {
        const errors =
          searchDownloadValidator.validateSearchDownloadRequest(searchRequest);
        // tslint:disable-next-line:no-unused-expression
        expect(errors).to.be.true;
        done();
      } catch (error) {
        done(error);
      }
    });
    it(`should return error when recipients is missing `, (done) => {
      searchRequest.recipients = null;
      try {
        searchDownloadValidator.validateSearchDownloadRequest(searchRequest);
      } catch (error) {
        expect(error.message).to.equal('Validation error');
        expect(error.info[0].description).to.equal(
          'Missing field recipients in request payload'
        );
        done();
      }
    });
    it(`should return error when fileName is missing `, (done) => {
      searchRequest.fileName = '';
      try {
        searchDownloadValidator.validateSearchDownloadRequest(searchRequest);
      } catch (error) {
        expect(error.message).to.equal('Validation error');
        expect(error.info[0].description).to.equal(
          'Missing field fileName in request payload'
        );
        done();
      }
    });
    it(`should return error when invalid parameter present in request payload`, (done) => {
      searchRequest.randomParam = 'garbageValue';
      try {
        searchDownloadValidator.validateSearchDownloadRequest(searchRequest);
      } catch (error) {
        expect(error.message).to.equal('Validation error');
        expect(error.info[0].description).to.equal(
          'Invalid parameters: randomParam'
        );
        done();
      }
    });
    it(`should return error when availability name is missing `, (done) => {
      searchRequest.availability = {
        status: ['SELLABLE']
      };
      try {
        searchDownloadValidator.validateSearchDownloadRequest(searchRequest);
      } catch (error) {
        expect(error.message).to.equal('Validation error');
        expect(error.info[0].description).to.equal(
          'Missing availability.name in the request parameters.'
        );
        done();
      }
    });
    it(`should return error when availability contain invalid parameter `, (done) => {
      searchRequest.availability = {
        garbage: 'garbageValue',
        name: 'UBX',
        status: ['SELLABLE']
      };
      try {
        searchDownloadValidator.validateSearchDownloadRequest(searchRequest);
      } catch (error) {
        expect(error.message).to.equal('Validation error');
        expect(error.info[0].description).to.equal(
          'Invalid parameters: availability garbage'
        );
        done();
      }
    });
    it(`should return error when recipients is invalid `, (done) => {
      searchRequest.recipients.to = null;
      try {
        searchDownloadValidator.validateSearchDownloadRequest(searchRequest);
      } catch (error) {
        expect(error.message).to.equal('Validation error');
        expect(error.info[0].description).to.equal('Invalid recipients');
        done();
      }
    });
    it(`should return error when email field is missing `, (done) => {
      searchRequest.recipients.to = [];
      try {
        searchDownloadValidator.validateSearchDownloadRequest(searchRequest);
      } catch (error) {
        expect(error.message).to.equal('Validation error');
        expect(error.info[0].description).to.equal(
          'At least one email is required for recipients'
        );
        done();
      }
    });
    it(`should return error when recipientsTO parameter is invalid `, (done) => {
      searchRequest.recipients.to = ['abcd'];
      try {
        searchDownloadValidator.validateSearchDownloadRequest(searchRequest);
      } catch (error) {
        expect(error.message).to.equal('Validation error');
        expect(error.info[0].description).to.equal('Invalid email abcd');
        done();
      }
    });
    it(`should return error when recipientsCC parameter is invalid `, (done) => {
      searchRequest.recipients.to = ['abcd@gmail.com'];
      searchRequest.recipients.cc = ['abcd'];
      try {
        searchDownloadValidator.validateSearchDownloadRequest(searchRequest);
      } catch (error) {
        expect(error.message).to.equal('Validation error');
        expect(error.info[0].description).to.equal('Invalid email abcd');
        done();
      }
    });
    it(`should return error when rulesList has more than one array item `, (done) => {
      searchRequest.rulesList = undefined;
      try {
        searchDownloadValidator.validateSearchDownloadRequest(searchRequest);
      } catch (error) {
        expect(error.message).to.equal('Validation error');
        expect(error.info[0].description).to.equal('Invalid rulesList');
        done();
      }
    });
  });
});
