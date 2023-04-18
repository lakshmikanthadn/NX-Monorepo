import * as AWS from 'aws-sdk';
import * as uuidV4 from 'uuid/v4';
import { ISQSQueueUrlData } from 'v4/model/interfaces/SQSQueueUrlData';

import Logger from '../../../utils/LoggerUtil';

const log = Logger.getLogger('SimpleQueueService');
export class SimpleQueueService {
  public async sendMessage(
    destinationQueueData: ISQSQueueUrlData,
    message: string,
    messageGroupId?: string
  ): Promise<string> {
    log.debug(
      'sendMessage::,',
      `messageGroupId: ${messageGroupId}, ` +
        `destinationQueueData: ${destinationQueueData}, message: ${message}`
    );
    const sqs = new AWS.SQS({ apiVersion: '2012-11-05', region: 'eu-west-1' });
    const sqsData: AWS.SQS.SendMessageRequest = {
      MessageBody: message,
      QueueUrl: destinationQueueData.url
    };
    if (destinationQueueData.isFifoQueue) {
      sqsData.MessageDeduplicationId = uuidV4();
      if (messageGroupId) {
        sqsData.MessageGroupId = messageGroupId;
      }
    }
    // Send the data to the SQS queue
    return new Promise((resolve, reject) => {
      sqs.sendMessage(sqsData, (SQSErr, data) => {
        if (SQSErr) {
          reject(SQSErr);
        } else {
          log.info(`Message sent successfully to ${JSON.stringify(sqsData)}`);
          resolve(data.MessageId);
        }
      });
    });
  }
}

export const simpleQueueService = new SimpleQueueService();
