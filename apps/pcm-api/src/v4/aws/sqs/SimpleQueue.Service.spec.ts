import * as AWS from 'aws-sdk';
import * as AWSMock from 'aws-sdk-mock';
import { expect } from 'chai';

import { simpleQueueService } from './SimpleQueue.Service';

describe('SimpleQueueService', () => {
  describe('sendMessage', () => {
    beforeEach(() => {
      AWSMock.setSDKInstance(AWS);
    });
    afterEach(() => {
      AWSMock.restore();
    });

    it('it should return the sqs message-id once the message is sent', async () => {
      AWSMock.mock(
        'SQS',
        'sendMessage',
        (sqsData: AWS.SQS.SendMessageRequest, callback) => {
          callback(null, {
            MessageId: `${sqsData.QueueUrl} ${sqsData.MessageGroupId} ${sqsData.MessageBody}`
          });
        }
      );
      const messageId = await simpleQueueService.sendMessage(
        { isFifoQueue: true, url: 'someQueueURL' },
        'hello',
        'messageGroupId123'
      );
      expect(messageId).to.equal('someQueueURL messageGroupId123 hello');
    });

    it('it should throw error if AWS SQS SDK throws an error', async () => {
      AWSMock.mock(
        'SQS',
        'sendMessage',
        (sqsData: AWS.SQS.SendMessageRequest, callback) => {
          callback(
            new Error(
              `something is broken for ` +
                `${sqsData.QueueUrl} ${sqsData.MessageGroupId} ${sqsData.MessageBody}`
            ),
            null
          );
        }
      );
      try {
        await simpleQueueService.sendMessage(
          { isFifoQueue: true, url: 'someQueueURL' },
          'hello',
          'messageGroupId123'
        );
        throw new Error('Expecting an error but got success.');
      } catch (error) {
        expect(error.message).to.equal(
          'something is broken for someQueueURL messageGroupId123 hello'
        );
      }
    });
    it('it should return the sqs message-id once the message is sent to standard sqs without groupId', async () => {
      AWSMock.mock(
        'SQS',
        'sendMessage',
        (sqsData: AWS.SQS.SendMessageRequest, callback) => {
          callback(null, {
            MessageId: `${sqsData.QueueUrl} ${sqsData.MessageBody}`
          });
        }
      );
      const messageId = await simpleQueueService.sendMessage(
        { isFifoQueue: false, url: 'someQueueURL' },
        'hello'
      );
      expect(messageId).to.equal('someQueueURL hello');
    });
    it('it should return the sqs message-id once the message is sent to fifo sqs without groupId', async () => {
      AWSMock.mock(
        'SQS',
        'sendMessage',
        (sqsData: AWS.SQS.SendMessageRequest, callback) => {
          callback(null, {
            MessageId: `${sqsData.QueueUrl} ${sqsData.MessageBody}`
          });
        }
      );
      const messageId = await simpleQueueService.sendMessage(
        { isFifoQueue: true, url: 'someQueueURL' },
        'hello'
      );
      expect(messageId).to.equal('someQueueURL hello');
    });
  });
});
