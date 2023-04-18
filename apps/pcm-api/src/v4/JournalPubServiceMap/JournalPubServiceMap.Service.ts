import { RequestModel, StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import { difference, uniq } from 'lodash';
import { ISQSQueueUrlData } from '../../v4/model/interfaces/SQSQueueUrlData';

import { Config } from '../../config/config';
import { AppError } from '../../model/AppError';
import { assetV4Service } from '../assets/AssetV4.Service';
import { eventService } from '../event/Event.Service';
import {
  IJournalProductServiceMapWithoutId,
  IJournalProductServiceMapWrapper
} from '../model/interfaces/JournalPublishingServiceMapWrapper';
import { publishingServiceProductService } from '../publishingService/PublishingService.Service';
import { journalPublishingServiceMapV4DAO } from './JournalPubServiceMap.Dao';
import { journalPubServiceMapValidator } from './JournalPubServiceMap.Validator';

type HasPublishingService = StorageModel.HasPublishingService;

class JournalPublishingServiceMapService {
  private journalPublishingServiceMapEventQueue: ISQSQueueUrlData =
    Config.getPropertyValue('journalPublishingServiceMapEventQueue');
  private journalPublishingServiceSource = 'SALESFORCE';

  /**
   * Will initiate the Journal to Service-Product Mapping Process by sending an event.
   * @param productIdentifier Only the acronym of the journal product is allowed.
   * @param productIdentifierName only journalAcronym value is allowed.
   * @param serviceProduct Mapping data to initiate the update Process.
   * @returns returns the the message id.
   */
  public async updateJournalPublishingServiceMap(
    productIdentifier: string,
    productIdentifierName: string,
    mappingData: RequestModel.JournalPublishingServiceMap
  ): Promise<string> {
    if (productIdentifierName !== 'journalAcronym') {
      throw new AppError(
        `Product-identifier ${productIdentifierName} is not allowed.`,
        400
      );
    }
    journalPubServiceMapValidator.validate(mappingData);
    const asset = await assetV4Service.getProductByIdentifier(
      productIdentifierName,
      productIdentifier
    );
    if (!asset) {
      throw new AppError(
        `A Journal must exist with ${productIdentifierName}` +
          ` ${productIdentifier}`,
        404
      );
    }
    await this.validatePubServiceIds(
      mappingData.publishingServices.map((ps) => ps._id)
    );
    return eventService.sendProductEvent(
      { _id: productIdentifier, ...mappingData },
      this.journalPublishingServiceMapEventQueue,
      this.journalPublishingServiceSource,
      {
        productId: productIdentifier,
        productType: 'journalPublishingServiceMapping'
      }
    );
  }

  public async getJournalPublishingServiceMap(
    productIdentifier: string,
    productIdentifierName: string,
    classificationName?: string,
    classificationType?: string,
    responseGroup?: string
  ): Promise<IJournalProductServiceMapWrapper[]> {
    const asset: StorageModel.Asset =
      await assetV4Service.getProductByIdentifier(
        productIdentifierName,
        productIdentifier
      );
    if (!asset) {
      throw new AppError(
        `A Journal must exist with ${productIdentifierName}` +
          ` ${productIdentifier}`,
        404
      );
    }
    const publishingServiceMaps: IJournalProductServiceMapWithoutId[] =
      await journalPublishingServiceMapV4DAO.getJournalPublishingServiceMapById(
        asset.identifier.journalAcronym,
        responseGroup,
        classificationName,
        classificationType
      );
    if (!Array.isArray(publishingServiceMaps)) {
      throw new AppError('Product Mapping not found.', 404);
    }
    const publishingServices: HasPublishingService[] = [];
    publishingServiceMaps.forEach((publishingServiceMap) => {
      publishingServices.push(...publishingServiceMap.publishingServices);
    });
    if (publishingServices.length === 0) {
      throw new AppError('Products not found.', 404);
    }
    const promises = publishingServices.map(
      async (publishingServiceData: HasPublishingService) => {
        const publishingServiceMeta =
          await publishingServiceProductService.getPublishingServiceById(
            publishingServiceData._id
          );
        const { prices = null, subType = null } = publishingServiceMeta || {};
        return { ...publishingServiceData, prices, subType };
      }
    );
    return Promise.all(promises);
  }
  /**
   * Validates if all IDs are publishing service products
   * if any one id is missing
   * or is not a publishingService
   * then throws error
   * @param pubServiceIds Publishing service ids
   * @returns {boolean} true or throws errors
   */
  private async validatePubServiceIds(
    pubServiceIds: string[]
  ): Promise<boolean> {
    const uniqPubServiceIds = uniq(pubServiceIds);
    const pubServiceAssets = await assetV4Service.getAssetsByIds(
      uniqPubServiceIds,
      ['_id', 'type']
    );
    if (
      !pubServiceAssets ||
      pubServiceAssets.length !== uniqPubServiceIds.length
    ) {
      const missingPubServiceAssets = difference(
        uniqPubServiceIds,
        pubServiceAssets.map((psa) => psa._id)
      );
      throw new AppError(
        'Invalid Publishing Service IDs in the Mapping.',
        400,
        { ids: missingPubServiceAssets }
      );
    }
    const nonPubServiceAssets = pubServiceAssets.filter(
      (psa) => psa.type !== 'publishingService'
    );
    if (nonPubServiceAssets.length > 0) {
      throw new AppError(
        'Only Publishing Service IDs are allowed for Mapping.',
        400,
        { assets: nonPubServiceAssets }
      );
    }
    return true;
  }
}

export const journalPublishingServiceMapService =
  new JournalPublishingServiceMapService();
