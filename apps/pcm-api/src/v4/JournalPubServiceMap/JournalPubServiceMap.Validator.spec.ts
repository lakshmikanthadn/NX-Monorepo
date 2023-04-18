import { expect } from 'chai';
import { cloneDeep } from 'lodash';
import { journalPublishingServiceMap } from './JournalPubServiceMap.TestData';
import { journalPubServiceMapValidator } from './JournalPubServiceMap.Validator';

describe('JournalPubServiceValidator', () => {
  let mappingTestData;
  beforeEach(() => {
    mappingTestData = cloneDeep(journalPublishingServiceMap);
  });

  describe('validate', () => {
    it('should return true when mapping data is valid', () => {
      const isValid = journalPubServiceMapValidator.validate(mappingTestData);
      expect(isValid).to.equal(true);
    });

    it('should throw error when there are duplicated entries in the mapping', () => {
      mappingTestData.publishingServices.push(
        mappingTestData.publishingServices[0]
      );
      try {
        journalPubServiceMapValidator.validate(mappingTestData);
        throw new Error('Expecting error, got success');
      } catch (error) {
        expect(error.code).to.equal(400);
        expect(error.name).to.equal(`AppError`);
        expect(error.message).to.equal(
          `Duplicate entries in the mapping data.`
        );
        expect(error.info).to.be.an('array');
        expect(error.info.length).to.equal(1);
        expect(error.info[0].dataPath).to.equal('/publishingServices/3');
        expect(error.info[0].description).to.equal(
          'should NOT have duplicate entry'
        );
      }
    });
  });
});
