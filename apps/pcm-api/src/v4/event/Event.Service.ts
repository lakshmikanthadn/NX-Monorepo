import { Config } from '../../config/config';
import Logger from '../../utils/LoggerUtil';
import { simpleStorageService } from '../aws/sns/SimpleStorage.Service';
import { simpleQueueService } from '../aws/sqs/SimpleQueue.Service';
import { ISQSQueueUrlData } from '../model/interfaces/SQSQueueUrlData';

const log = Logger.getLogger('EventService');

interface ISendEventOptions {
  productId?: string;
  productType?: string;
}
export interface ISendSQSMessage {
  application: string;
  assetType?: string;
  messageTimestamp: number;
  publishingItemId?: string;
  sourceFileUrl: string;
  status: string;
}

class EventService {
  private eventsStoreBucket = Config.getPropertyValue('eventStoreBucket');

  public async sendProductEvent(
    product: any,
    destinationQueueData: ISQSQueueUrlData,
    source: string,
    options: ISendEventOptions = {}
  ): Promise<string> {
    const productId = options.productId || product._id;
    const productType = options.productType || product.type;
    log.debug(
      `sendProductEvent:: ` +
        `${JSON.stringify({
          destinationQueueData,
          product,
          productId,
          productType,
          source
        })}`
    );
    const storagePath = `/${source}/inbound${
      productType ? '/' + productType : ''
    }`;
    const payload = { data: product };
    const location = await simpleStorageService.upload(
      this.eventsStoreBucket,
      storagePath,
      this.getFileName(productId),
      JSON.stringify(payload)
    );
    return simpleQueueService.sendMessage(
      destinationQueueData,
      JSON.stringify(
        this.getEventMessageBody(productId, productType, location)
      ),
      productId
    );
  }
  /**
   * getProductEvent
   */
  private getEventMessageBody(id: string, assetType: string, location: string) {
    const sqsMessage: ISendSQSMessage = {
      application: 'PAC API',
      messageTimestamp: Date.now(),
      sourceFileUrl: location,
      status: 'success'
    };
    if (assetType) {
      sqsMessage.assetType = assetType;
    }
    if (id) {
      sqsMessage.publishingItemId = id;
    }
    return sqsMessage;
  }

  private getFileName(productId, extension = '.json'): string {
    return `${productId ? productId + '_' : ''}${Date.now()}${extension}`;
  }
}

export const eventService = new EventService();
