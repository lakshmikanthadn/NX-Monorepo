import { StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import { ISQSQueueUrlData } from '../../v4/model/interfaces/SQSQueueUrlData';

import { Config } from '../../config/config';
import { AppError } from '../../model/AppError';
import Logger from '../../utils/LoggerUtil';
import { assetV4Service } from '../assets/AssetV4.Service';
import { associatedMediaV4Service } from '../associatedMedia/AssociatedMediaV4.Service';
import { simpleQueueService } from '../aws/sqs/SimpleQueue.Service';
import { productV4Service } from '../products/ProductV4.Service';
import { creativeWorkV4Dao } from './CreativeWorkV4.DAO';

const log = Logger.getLogger('CreativeWorkV4Service');

export class CreativeWorkV4Service {
  private creativeWorkFIFOQueue: ISQSQueueUrlData = Config.getPropertyValue(
    'creativeWorkFIFOQueue'
  );

  public async getCreativeWorkByIds(
    productIds: string[],
    projectionData: string[] = []
  ): Promise<any> {
    return creativeWorkV4Dao.getCreativeWorkByIds(productIds, projectionData);
  }

  public async updateCreativeWorkSources(
    parentId: string
  ): Promise<StorageModel.Product> {
    return creativeWorkV4Dao.updateCreativeWorkSources(parentId);
  }

  public async createCreativeWork(
    creativeWork: StorageModel.Product
  ): Promise<any> {
    log.debug(`createCreativeWork`);
    creativeWork.identifiers.doi = `10.4324/${creativeWork._id}`;
    const isHyperLinkProduct = creativeWork.creativeWork.format === 'hyperlink';
    if (
      isHyperLinkProduct &&
      !(
        creativeWork['associatedMedia'] &&
        Array.isArray(creativeWork['associatedMedia'])
      )
    ) {
      throw new AppError(
        'associatedMedia with location is required when format is hyperlink',
        400
      );
    }
    if (isHyperLinkProduct && creativeWork['associatedMedia'].length !== 1) {
      throw new AppError(
        'currently we are supporting only single associatedMedia',
        400
      );
    }
    if (isHyperLinkProduct && !creativeWork['associatedMedia'][0].location) {
      throw new AppError('location is required', 400);
    }
    const createdCreativeWorkData = await creativeWorkV4Dao.createCreativeWork(
      creativeWork
    );
    if (isHyperLinkProduct) {
      await associatedMediaV4Service.createAssociatedMedia(
        this.prepareHyperlinkAsstMedia(creativeWork)
      );
    }
    await assetV4Service.createAsset(
      this.prepareNewAssetForCreativeWork(creativeWork)
    );
    const notification = this.prepareNotificationV4(creativeWork);
    await simpleQueueService.sendMessage(
      this.creativeWorkFIFOQueue,
      JSON.stringify(notification),
      createdCreativeWorkData._id
    );
    return { _id: createdCreativeWorkData._id };
  }

  private prepareNotificationV4(creativeWork: StorageModel.Product) {
    return {
      application: 'PAC API',
      assetType: 'CREATIVEWORK',
      eventType: 'AGGREGATION4',
      messageTimestamp: new Date(),
      messageType: 'CREATE',
      productType: 'CREATIVEWORK',
      publishingItemId: creativeWork._id,
      sourceFileUrl: '',
      status: 'SUCCESS'
    };
  }

  private prepareNewAssetForCreativeWork(
    creativeWork: StorageModel.Product
  ): StorageModel.Asset {
    return {
      _id: creativeWork._id,
      _sources: creativeWork._sources,
      identifier: {
        doi: creativeWork.identifiers.doi,
        editionId: creativeWork.identifiers.editionId || null,
        orderNumber: creativeWork.identifiers.orderNumber || null,
        productId: creativeWork.identifiers.productId || null
      },
      type: creativeWork.type
    };
  }

  private prepareHyperlinkAsstMedia(
    creativeWork: StorageModel.Product
  ): StorageModel.AssociatedMedia {
    return {
      _id: productV4Service.getNewId(),
      location: creativeWork['associatedMedia'][0].location,
      parentId: creativeWork._id,
      parentType: creativeWork.type,
      size: null,
      type: 'hyperlink',
      versionType: 'FINAL'
    };
  }
}

// This module exports only one instance of the CreativeWorkV4Service instead of exporting the class
export const creativeWorkV4Service = new CreativeWorkV4Service();
