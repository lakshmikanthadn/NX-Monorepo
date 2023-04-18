import * as AmazonS3URI from 'amazon-s3-uri';
import * as AWS from 'aws-sdk';
import * as mime from 'mime-types';
import * as path from 'path';
import * as util from 'util';

import { Config } from '../../config/config';
import Logger from '../../utils/LoggerUtil';
import { getAPISecretValues } from './SecretMangerUtils';

const log = Logger.getLogger('S3UtilsV4');
const s3 = new AWS.S3({ region: Config.getPropertyValue('defaultAwsRegion') });

const s3LinkExpiryForUpload = 10 * 60; // seconds. (Set for 10 minutes)
const defaultS3LinkExpiryTime = 10; // seconds. (10 seconds)
const s3LinkExpiryTimeOfVideos = defaultS3LinkExpiryTime; // seconds (30 minutes)
const s3LinkExpirySecondsForBot = 2 * 24 * 60 * 60; // seconds (Set for 2 days)
export class S3UtilsV4 {
  public static async getPresignedUrlToUpload(
    filePath: string,
    fileName: string
  ): Promise<string> {
    log.debug(
      'getPresignedUrlToUpload::,',
      `path: ${filePath}, fileName: ${fileName}`
    );
    const bucketName = Config.getPropertyValue('contentS3Bucket');
    const myBucket = `${bucketName}/${filePath}`;
    const contentType = mime.lookup(fileName);
    const params: any = {
      Bucket: myBucket,
      ContentType: contentType,
      Expires: s3LinkExpiryForUpload,
      Key: fileName
    };
    return S3UtilsV4.sign(new AWS.S3(), 'putObject', params);
  }
  /**
   * Deprecate this method
   */
  public static async uploadToS3(collectionData, id: string): Promise<string> {
    log.debug('uploadToS3::,', `id: ${id}, collectionData: ${collectionData}`);
    const bucketName = Config.getPropertyValue('contentS3Bucket');
    const date = new Date();
    const partialTime = date.toISOString().substr(11, 8); // hh:mm:ss
    const partialDate = date.toISOString().substring(0, 10); // yyyy-mm-dd
    const dateParts: string[] = partialDate.split('-');
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];
    const myBucket = `${bucketName}/collections/source/${year}/${month}/${day}`;
    const key = `${id}_${partialTime}.json`;

    const params = {
      Body: JSON.stringify(collectionData),
      Bucket: myBucket,
      // pass your bucket name
      Key: key
    };
    return new Promise((resolve, reject) => {
      s3.upload(params, (s3Err, data) => {
        if (s3Err) {
          log.error('ERROR:: Unable to upload data.', s3Err);
          resolve(null);
          return;
        }
        log.info(`uploadToS3:: File uploaded successfully at ${data.Location}`);
        resolve(data.Location);
      });
    });
  }
  public static async headObjects(
    bucket: string,
    key: string
  ): Promise<boolean> {
    const params = {
      Bucket: bucket,
      Key: key
    };
    return new Promise((resolve, reject) => {
      s3.headObject(params, (err, metadata) => {
        if (err && err.code === 'NotFound') {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
  public static async getPresignedUrlToRead(
    s3Url: string,
    toRender = false,
    isPdf = false,
    filenamePrefix?: string,
    mediaType?: string,
    isBot?: boolean
  ): Promise<string> {
    log.debug(
      'getPresignedUrlToRead::,',
      `s3Url: ${s3Url}, toRender: ${toRender}, isPdf: ${isPdf}, isBot: ${isBot}`
    );
    let params: any;
    const secretData = await getAPISecretValues();
    const s3InstForBot = new AWS.S3({
      accessKeyId: secretData.accessKeyId,
      region: Config.getPropertyValue('defaultAwsRegion'),
      secretAccessKey: secretData.secretAccessKey,
      signatureVersion: 'v4'
    });
    const myBucket = AmazonS3URI(s3Url).bucket;
    const strippedKey = AmazonS3URI(s3Url).key;
    const expires = S3UtilsV4.getExpiration(isBot, mediaType);
    if (toRender) {
      params = {
        Bucket: myBucket,
        Expires: expires,
        Key: strippedKey
      };
      if (isPdf) {
        params.ResponseContentType = 'application/pdf';
      }
    } else {
      const strippedKeys: string[] = path.basename(strippedKey).split('.');
      const fileExtension = strippedKeys[strippedKeys.length - 1];
      let filename = path.basename(strippedKey);
      if (filenamePrefix) {
        filename = `${filenamePrefix}_${mediaType}.${fileExtension}`;
      }
      params = {
        Bucket: myBucket,
        Expires: expires,
        Key: strippedKey,
        ResponseContentDisposition: `attachment; filename="${filename}"`
      };
    }
    return S3UtilsV4.sign(isBot ? s3InstForBot : s3, 'getObject', params);
  }
  private static sign(
    s3Inst: AWS.S3,
    operation: string,
    params: any
  ): Promise<string> {
    log.debug(
      'sign:: ',
      `operation: ${operation}; params: ${JSON.stringify(params)}`
    );
    return new Promise((resolve, reject) => {
      s3Inst.getSignedUrl(operation, params, (err, url) => {
        if (err) {
          log.debug('ERROR:: Unable to sign the URL.');
          resolve(null);
          return;
        }
        resolve(url);
      });
    });
  }

  private static getExpiration(isBot: boolean, mediaType): number {
    if (isBot) {
      return s3LinkExpirySecondsForBot;
    } else if (mediaType === 'video') {
      return s3LinkExpiryTimeOfVideos;
    } else {
      return defaultS3LinkExpiryTime;
    }
  }
}

util.deprecate(
  S3UtilsV4.uploadToS3,
  'This method is deprecated use a Simple Storage Service instead',
  'DEP0001'
);
