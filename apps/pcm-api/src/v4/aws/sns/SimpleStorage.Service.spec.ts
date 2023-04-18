import * as AWS from 'aws-sdk';
import * as AWSMock from 'aws-sdk-mock';
import { PutObjectRequest } from 'aws-sdk/clients/s3';

import { expect } from 'chai';
import { simpleStorageService } from './SimpleStorage.Service';

describe('SimpleStorageService', () => {
  describe('upload', () => {
    beforeEach(() => {
      AWSMock.setSDKInstance(AWS);
    });
    afterEach(() => {
      AWSMock.restore();
    });

    it('it should return the Location once the data is uploaded to s3', async () => {
      AWSMock.mock('S3', 'upload', (params: PutObjectRequest, callback) => {
        console.log('S3', 'upload', 'mock called');
        callback(null, { Location: `${params.Bucket}/${params.Key}` });
      });
      const location = await simpleStorageService.upload(
        's3-test-location',
        '/product',
        'abc.json',
        'data'
      );
      expect(location).to.equal('s3-test-location/product/abc.json');
    });

    it('it should throw error if AWS S3 SDK throws an error', async () => {
      AWSMock.mock('S3', 'upload', (params: PutObjectRequest, callback) => {
        callback(
          new Error(
            `something is broken while uploading to ` +
              `${params.Bucket}/${params.Key}`
          ),
          null
        );
      });
      try {
        await simpleStorageService.upload(
          's3-test-location',
          '/product',
          'abc.json',
          'data'
        );
        throw new Error('Expecting an error but got success.');
      } catch (error) {
        expect(error.message).to.equal(
          'something is broken while uploading to s3-test-location/product/abc.json'
        );
      }
    });
  });
});
