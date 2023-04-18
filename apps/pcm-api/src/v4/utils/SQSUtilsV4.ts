import * as AWS from 'aws-sdk';
import * as uuidV4 from 'uuid/v4';
import Logger from '../../utils/LoggerUtil';
import { ISearchReqDownload } from '../model/interfaces/SearchResult';

import { IOAUpdateWrapper } from 'v4/model/interfaces/OAUpdateWrapper';
import { Config } from '../../config/config';
import { ISQSQueueUrlData } from 'v4/model/interfaces/SQSQueueUrlData';
const log = Logger.getLogger('SQSUtilsV4');

// Create an SQS service object
const sqs = new AWS.SQS({ apiVersion: '2012-11-05', region: 'eu-west-1' });
const collectionFIFOQueue: ISQSQueueUrlData = Config.getPropertyValue(
  'collectionFIFOQueue'
);
const searchResultQueue: ISQSQueueUrlData = Config.getPropertyValue(
  'searchResultDownloadQueue'
);
const oaUpdateQueue: ISQSQueueUrlData =
  Config.getPropertyValue('oaUpdateQueue');
export class SQSUtilsV4 {
  public static async sendMessage(
    id: string,
    location: string,
    action: string,
    collectionType: string
  ): Promise<string> {
    log.debug(
      'sendMessage::,',
      `id: ${id}, location: ${location}, action: ${action},
            collectionType: ${collectionType}`
    );
    const date = new Date();
    const dateInMillisecond = date.getTime();
    const messageBody = {
      application: 'PAC API',
      assetType: 'collection',
      eventType: 'AGGREGATION4',
      messageTimestamp: dateInMillisecond,
      messageType: action,
      // create/update
      productType: collectionType,
      publishingItemId: id,
      sourceFileUrl: location,
      status: 'success'
    };
    const sqsData = {
      MessageBody: JSON.stringify(messageBody),
      /*
              The message deduplication ID is the token used for deduplication
              of sent messages. If a message with a particular message deduplication
              ID is sent successfully, any messages sent with the same message
              deduplication ID are accepted successfully but aren't delivered
              during the 5-minute deduplication interval
            */
      MessageDeduplicationId: uuidV4(),
      /*
              The message group ID is the tag that specifies that a
              message belongs to a specific message group. Messages
              that belong to the same message group are always processed one by one,
              in a strict order relative to the message group
            */
      MessageGroupId: id,
      QueueUrl: collectionFIFOQueue.url
    };

    // Send the data to the SQS queue
    return new Promise((resolve, reject) => {
      sqs.sendMessage(sqsData, (SQSErr, data) => {
        if (SQSErr) {
          log.error(`ERROR: ${SQSErr}`);
          resolve(null);
          return;
        }
        log.info(`Message sent successfully with message id ${data.MessageId}`);
        resolve(data.MessageId);
      });
    });
  }

  public static async sendSearchRequestMessage(
    searchRequestData: ISearchReqDownload
  ): Promise<string> {
    log.debug('sendSearchRequestMessage::,', `id: ${searchRequestData._id}`);
    const date = new Date();
    const isoDate = date.toISOString();
    const messageHeader = {
      application: 'sales-force',
      id: searchRequestData._id,
      source: 'PCM',
      status: 'success',
      statusDescription: '',
      timestamp: isoDate,
      version: '4.0.1'
    };
    const completeMsg = {
      body: searchRequestData,
      header: messageHeader
    };

    const messageBody = JSON.stringify(completeMsg);
    const sqsData = {
      MessageBody: messageBody,
      QueueUrl: searchResultQueue.url
    };
    // Send the data to the SQS queue
    return new Promise((resolve, reject) => {
      sqs.sendMessage(sqsData, (SQSErr, data) => {
        if (SQSErr) {
          log.error(`ERROR: ${SQSErr}`);
          resolve(null);
          return;
        }
        log.info(`Message sent successfully with message id ${data.MessageId}`);
        resolve(data.MessageId);
      });
    });
    // return Promise.resolve('some-id');
  }

  public static async sendOAUpdateMessage(
    oaUpdateInfo: IOAUpdateWrapper
  ): Promise<string> {
    log.debug(
      'sendOAUpdateMessage::,',
      `oaUpdateInfo: ${JSON.stringify(oaUpdateInfo)}`
    );
    const sqsData = {
      MessageBody: JSON.stringify(oaUpdateInfo),
      QueueUrl: oaUpdateQueue.url
    };
    // Send the data to the SQS queue
    return new Promise((resolve, reject) => {
      sqs.sendMessage(sqsData, (SQSErr, data) => {
        if (SQSErr) {
          log.error(`sendMessage:: ERROR: ${SQSErr}`);
          resolve(null);
          return;
        }
        log.info(`Message sent successfully with message id ${data.MessageId}`);
        resolve(data.MessageId);
      });
    });
  }
}
