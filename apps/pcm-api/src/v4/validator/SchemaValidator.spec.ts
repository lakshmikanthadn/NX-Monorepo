import { RequestModel } from '@tandfgroup/pcm-entity-model-v4';
import { expect } from 'chai';
import * as _ from 'lodash';

import { collectionProductRequest } from '../collection/collection.TestData';
import { journalProductRequest } from '../journal/Journal.TestData';
import { publishingServiceProductRequest } from '../publishingService/PublishingService.TestData';
import { schemaValidator } from './SchemaValidator';

describe('SchemaValidator', () => {
  const collectionSchemaId =
    'OpenApiSchema#/definitions/CollectionProductRequest';
  const publishingServiceSchemaId =
    'OpenApiSchema#/definitions/PublishingServiceProductRequest';
  const JournalSchemaId = 'OpenApiSchema#/definitions/JournalProductRequest';
  // PublishingServices test case
  it(`should validate without any error when publishingService request is
          valid`, () => {
    const productDataCopy = _.cloneDeep(publishingServiceProductRequest);
    const isValid = schemaValidator.validate(
      publishingServiceSchemaId,
      productDataCopy
    );
    expect(isValid).to.equal(true);
  });
  it(`should throw error when publishingService request has subType as null
    `, () => {
    const productDataCopy = _.cloneDeep(publishingServiceProductRequest);
    productDataCopy.subType = null;
    try {
      schemaValidator.validate(publishingServiceSchemaId, productDataCopy);
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.info[0].description).to.equal(
        "should have required property 'subType'"
      );
    }
  });
  it(`should throw error when publishingService request has subType as garbage
    `, () => {
    const productDataCopy = _.cloneDeep(publishingServiceProductRequest);
    productDataCopy.subType = 'XYZ' as any;
    try {
      schemaValidator.validate(publishingServiceSchemaId, productDataCopy);
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.info[0].description).to.equal(
        'should be equal to one of the allowed values'
      );
    }
  });

  // Collection test case
  it(`should validate without any error when static collection request is
      valid case 2`, () => {
    const productDataCopy = _.cloneDeep(collectionProductRequest[1]);
    const isValid = schemaValidator.validate(
      collectionSchemaId,
      productDataCopy
    );
    expect(isValid).to.equal(true);
  });
  it(`should validate without any error when dynamic collection request is
      valid case 1`, () => {
    const productDataCopy = _.cloneDeep(collectionProductRequest[2]);
    const isValid = schemaValidator.validate(
      collectionSchemaId,
      productDataCopy
    );
    expect(isValid).to.equal(true);
  });
  it(`should validate without any error when dynamic collection request is
    valid case 2`, () => {
    const productDataCopy = _.cloneDeep(collectionProductRequest[3]);
    const isValid = schemaValidator.validate(
      collectionSchemaId,
      productDataCopy
    );
    expect(isValid).to.equal(true);
  });
  it('should return error when mandatory field is missing', () => {
    const productDataCopy = _.cloneDeep(collectionProductRequest);
    productDataCopy[0]._source = null;
    try {
      schemaValidator.validate(collectionSchemaId, productDataCopy[0]);
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.info[0].description).to.equal(
        "should have required property '_source'"
      );
    }
  });
  it('should return error when autoRollover mandatory field is missing', () => {
    const productDataCopy = _.cloneDeep(collectionProductRequest);
    productDataCopy[0].collection.autoRollover = null;
    try {
      schemaValidator.validate(collectionSchemaId, productDataCopy[0]);
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.info[0].description).to.equal(
        "should have required property 'autoRollover'"
      );
    }
  });
  it('should return error when taxType field is invalid', () => {
    const productDataCopy = _.cloneDeep(collectionProductRequest);
    productDataCopy[0].collection.taxType = 'Garbage' as any;
    try {
      schemaValidator.validate(collectionSchemaId, productDataCopy[0]);
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.info[0].description).to.equal(
        'should be equal to one of the allowed values'
      );
    }
  });
  it('should return error when subjectAreaCode field is invalid', () => {
    const productDataCopy = _.cloneDeep(collectionProductRequest);
    productDataCopy[0].collection.subjectAreaCode = 'Garbage' as any;
    try {
      schemaValidator.validate(collectionSchemaId, productDataCopy[0]);
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.info[0].description).to.equal(
        'should be equal to one of the allowed values'
      );
    }
  });

  // Journal test case
  it(`should validate without any error when journal request is
      valid`, () => {
    const productDataCopy: RequestModel.Journal = _.cloneDeep(
      journalProductRequest
    );
    const isValid = schemaValidator.validate(JournalSchemaId, productDataCopy);
    expect(isValid).to.equal(true);
  });
  it('should throw error when contributors email is missing.', () => {
    const productDataCopy: RequestModel.Journal = _.cloneDeep(
      journalProductRequest
    );
    delete productDataCopy.contributors[0].email;
    try {
      schemaValidator.validate(JournalSchemaId, productDataCopy);
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.info[0].description).to.equal(
        "should have required property 'email'"
      );
    }
  });
  it('should return error when contributor email field is invalid', () => {
    const productDataCopy: RequestModel.Journal = _.cloneDeep(
      journalProductRequest
    );
    productDataCopy.contributors[0].email = 'Garbage';
    try {
      schemaValidator.validate(JournalSchemaId, productDataCopy);
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.info[0].description).to.equal('should match format "email"');
    }
  });
  it('should return error when contributor email field is empty', () => {
    const productDataCopy: RequestModel.Journal = _.cloneDeep(
      journalProductRequest
    );
    productDataCopy.contributors[0].email = '';
    try {
      schemaValidator.validate(JournalSchemaId, productDataCopy);
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.info[0].description).to.equal('should match format "email"');
    }
  });
  it('should return error when contributor email field has invalid domain name', () => {
    const productDataCopy: RequestModel.Journal = _.cloneDeep(
      journalProductRequest
    );
    productDataCopy.contributors[0].email = 'abc@xyz';
    try {
      schemaValidator.validate(JournalSchemaId, productDataCopy);
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.info[0].description).to.equal('should match format "email"');
    }
  });
  it('should return error when journal legalOwner is invalid', () => {
    const productDataCopy: RequestModel.Journal = _.cloneDeep(
      journalProductRequest
    );
    productDataCopy.journal.legalOwner = 'EU' as any;
    try {
      schemaValidator.validate(JournalSchemaId, productDataCopy);
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.info[0].description).to.equal(
        'should be equal to one of the allowed values'
      );
    }
  });
  it('should return error when contributor role field is invalid', () => {
    const productDataCopy: RequestModel.Journal = _.cloneDeep(
      journalProductRequest
    );
    productDataCopy.contributors[0].roles = ['Garbage'] as any;
    try {
      schemaValidator.validate(JournalSchemaId, productDataCopy);
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.info[0].description).to.equal(
        'should be equal to one of the allowed values'
      );
    }
  });
  it('should validate without any when contributors field is empty', () => {
    const productDataCopy: RequestModel.Journal = _.cloneDeep(
      journalProductRequest
    );
    productDataCopy.contributors = [];
    const isValid = schemaValidator.validate(JournalSchemaId, productDataCopy);
    expect(isValid).to.equal(true);
  });
  it('should throw error when group name is apc but type is invalid.', () => {
    const productDataCopy: RequestModel.Journal = _.cloneDeep(
      journalProductRequest
    );
    productDataCopy.classifications[0].type = 'garbage';
    try {
      schemaValidator.validate(JournalSchemaId, productDataCopy);
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.info[0].description).to.equal(
        'should be equal to one of the allowed values'
      );
    }
  });
  it('should throw error when classification name is missing.', () => {
    const productDataCopy: RequestModel.Journal = _.cloneDeep(
      journalProductRequest
    );
    delete productDataCopy.classifications[0].name;
    try {
      schemaValidator.validate(JournalSchemaId, productDataCopy);
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.info[0].description).to.equal(
        "should have required property 'name'"
      );
    }
  });

  it('should throw error when permission name is invalid.', () => {
    const productDataCopy: RequestModel.Journal = _.cloneDeep(
      journalProductRequest
    );
    productDataCopy.permissions[0].name = 'garbage' as any;
    try {
      schemaValidator.validate(JournalSchemaId, productDataCopy);
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.info[0].description).to.equal(
        'should be equal to one of the allowed values'
      );
    }
  });
  it('should throw error when permission code is invalid.', () => {
    const productDataCopy: RequestModel.Journal = _.cloneDeep(
      journalProductRequest
    );
    productDataCopy.permissions[0].code = 'garbage' as any;
    try {
      schemaValidator.validate(JournalSchemaId, productDataCopy);
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.info[0].description).to.equal(
        'should be equal to one of the allowed values'
      );
    }
  });
  it('should throw error when permission type is invalid.', () => {
    const productDataCopy: RequestModel.Journal = _.cloneDeep(
      journalProductRequest
    );
    productDataCopy.permissions[0].type = 'garbage' as any;
    try {
      schemaValidator.validate(JournalSchemaId, productDataCopy);
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.info[0].description).to.equal(
        'should be equal to one of the allowed values'
      );
    }
  });
  it('should validate without any when permission field is empty', () => {
    const productDataCopy: RequestModel.Journal = _.cloneDeep(
      journalProductRequest
    );
    productDataCopy.contributors = [];
    const isValid = schemaValidator.validate(JournalSchemaId, productDataCopy);
    expect(isValid).to.equal(true);
  });
});
