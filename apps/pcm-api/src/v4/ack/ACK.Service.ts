import { RequestModel } from '@tandfgroup/pcm-entity-model-v4';
import { cloneDeep } from 'lodash';
import { isUUID } from 'validator';
import { simpleQueueService } from '../aws/sqs/SimpleQueue.Service';

import { Config } from '../../config/config';
import { AppError } from '../../model/AppError';
import { assetV4Service } from '../assets/AssetV4.Service';
import { schemaValidator } from '../validator/SchemaValidator';
import { ISQSQueueUrlData } from '../../v4/model/interfaces/SQSQueueUrlData';

class ACKService {
  private ackEventQueue: ISQSQueueUrlData = Config.getPropertyValue(
    'productAckEventQueue'
  );
  private schemaId = 'OpenApiSchema#/definitions/ProductAcknowledgement';
  public async ackAssetDistribution(
    assetId: string,
    ack: RequestModel.ProductAcknowledgement
  ): Promise<string> {
    if (!isUUID(assetId, 4)) {
      throw new AppError('Invalid UUID(v4) in the path parameter.', 400, {
        assetId
      });
    }
    schemaValidator.validate(this.schemaId, cloneDeep(ack));
    const asset = await assetV4Service.getAssetById(assetId, ['_id']);
    if (!asset) {
      throw new AppError(`Product does NOT exists with id ${assetId}.`, 404);
    }
    return simpleQueueService.sendMessage(
      this.ackEventQueue,
      JSON.stringify(this.buildAckEvent(assetId, ack)),
      assetId
    );
  }

  private buildAckEvent(
    assetId: string,
    ack: RequestModel.ProductAcknowledgement
  ) {
    return {
      ...ack,
      _id: assetId,
      stage: 'ACK',
      transferDate: new Date(),
      type: 'product'
    };
  }
}

export const ackService = new ACKService();
