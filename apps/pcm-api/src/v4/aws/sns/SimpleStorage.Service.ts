import * as AWS from 'aws-sdk';

import Logger from '../../../utils/LoggerUtil';

const log = Logger.getLogger('SimpleStorageService');

class SimpleStorageService {
  public async upload(
    hostName: string,
    path: string,
    filename: string,
    data: string
  ): Promise<string> {
    const s3 = new AWS.S3();
    const params: AWS.S3.PutObjectRequest = {
      Body: data,
      Bucket: `${hostName}${path}`,
      // pass your bucket name
      Key: filename
    };
    return new Promise((resolve, reject) => {
      s3.upload(params, (s3Err, uploadedInfo) => {
        if (s3Err) {
          reject(s3Err);
        } else {
          log.info(`File uploaded successfully at ${uploadedInfo.Location}`);
          resolve(uploadedInfo.Location);
        }
      });
    });
  }
}

export const simpleStorageService = new SimpleStorageService();
