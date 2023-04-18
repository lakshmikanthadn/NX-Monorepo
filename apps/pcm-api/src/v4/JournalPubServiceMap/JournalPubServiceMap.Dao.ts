import { MongooseSchema, StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import * as mongoose from 'mongoose';

import { Config } from '../../config/config';
import Logger from '../../utils/LoggerUtil';
import { IJournalProductServiceMapWithoutId } from '../model/interfaces/JournalPublishingServiceMapWrapper';

type JournalPublishingServiceMapModelType =
  StorageModel.JournalPublishingServiceMap & mongoose.Document;
const log = Logger.getLogger('JournalPublishingServiceMapV4Dao');
const docTypeToCollectionMapperV4 = Config.getPropertyValue(
  'docTypeToCollectionMapperV4'
);

export class JournalPublishingServiceMapV4DAO {
  public model: mongoose.Model<JournalPublishingServiceMapModelType>;

  constructor() {
    const collectionName =
      docTypeToCollectionMapperV4.journalpublishingservicemap;
    this.model = mongoose.model(
      'JournalPublishingServiceMapV4',
      MongooseSchema.Part,
      collectionName
    );
  }

  /**
   * This method finds the journalPublishingServiceMap by id from the mongoDB.
   * @param id
   */
  public async getJournalPublishingServiceMapById(
    id: string,
    responseGroup = 'medium',
    classificationName?: string,
    classificationType?: string
  ): Promise<IJournalProductServiceMapWithoutId[]> {
    log.debug(`getJournalPublishingServiceMapById:: id: ${id}`);
    return this.getJournalPublishingServiceMap(
      id,
      classificationName,
      classificationType
    );
  }

  private async getJournalPublishingServiceMap(
    id: string,
    classificationName?: string,
    classificationType?: string
  ): Promise<IJournalProductServiceMapWithoutId[]> {
    log.debug(
      `getJournalPublishingServiceMap::, id: ${JSON.stringify({
        classificationName,
        classificationType,
        id
      })}`
    );
    const aggQuery = this.prepareJournalPublishingMapQuery(
      id,
      classificationName,
      classificationType
    );
    return this.model.aggregate(aggQuery).exec();
  }

  private prepareJournalPublishingMapQuery(
    id: string,
    classificationName?: string,
    classificationType?: string
  ): any {
    const aggregateQuery = [];
    aggregateQuery.push({
      $match: { _id: id }
    });
    const projections = {
      _id: 0
    };

    if (classificationName || classificationType) {
      projections['publishingServices'] = {
        $filter: this.preparePublishingServiceFilter(
          classificationName,
          classificationType
        )
      };
    } else {
      projections['publishingServices'] = 1;
    }

    aggregateQuery.push({
      $project: projections
    });
    return aggregateQuery;
  }

  private preparePublishingServiceFilter(
    classificationName: string,
    classificationType: string
  ): any {
    if (classificationName && classificationType) {
      return {
        as: 'publishingService',
        cond: {
          $and: [
            {
              $eq: [
                '$$publishingService.classification.type',
                classificationType
              ]
            },
            {
              $eq: [
                '$$publishingService.classification.name',
                classificationName
              ]
            }
          ]
        },
        input: '$publishingServices'
      };
    } else if (classificationName) {
      return {
        as: 'publishingService',
        cond: {
          $eq: ['$$publishingService.classification.name', classificationName]
        },
        input: '$publishingServices'
      };
    } else {
      return {
        as: 'publishingService',
        cond: {
          $eq: ['$$publishingService.classification.type', classificationType]
        },
        input: '$publishingServices'
      };
    }
  }
}

// This module exports only one instance of the AssetDAO instead of exporting the class.
export const journalPublishingServiceMapV4DAO =
  new JournalPublishingServiceMapV4DAO();
