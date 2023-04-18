import { MongooseSchema, StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import * as mongoose from 'mongoose';

import { Config } from '../../config/config';
import { AppConstants } from '../../config/constant';
import { AppError } from '../../model/AppError';
import Logger from '../../utils/LoggerUtil';

type AssetModelType = StorageModel.Asset & mongoose.Document;
const log = Logger.getLogger('AssetV4DAO');
const docTypeToCollectionMapperV4 = Config.getPropertyValue(
  'docTypeToCollectionMapperV4'
);

export class AssetV4DAO {
  public model: mongoose.Model<AssetModelType>;

  constructor() {
    const collectionName = docTypeToCollectionMapperV4.asset;
    this.model = mongoose.model(
      'AssetV4',
      MongooseSchema.Asset,
      collectionName
    );
  }

  /**
   * This method finds the asset by id from the mongoDB.
   * @param id
   */
  public async getAssetById(
    id: string,
    projectionProperties: string[] = []
  ): Promise<StorageModel.Asset> {
    log.debug(`getAssetById:: id: ${id}`);
    const projection = {};
    if (projectionProperties.length > 0) {
      projectionProperties.forEach(
        (propertyName) => (projection[propertyName] = 1)
      );
    }
    const query = { _id: id };
    return this.getAsset(query, projection);
  }

  public async getAssetsByIds(
    ids: string[],
    projectionProperties: string[] = []
  ): Promise<StorageModel.Asset[]> {
    log.debug(`getAssetsByIds:: ids: ${ids.join()}`);
    const projection = {};
    if (projectionProperties.length > 0) {
      projectionProperties.forEach(
        (propertyName) => (projection[propertyName] = 1)
      );
    }
    const query = { _id: { $in: ids } };
    return this.getAssets(query, projection);
  }

  public async getAssetByIdentifierNameValue(
    identifierName: string,
    identifierValue: string,
    projectionProperties: string[]
  ): Promise<StorageModel.Asset> {
    log.debug('getAssetByIdentifierNameValue:: ', {
      identifierName,
      identifierValue
    });
    const keyNameMapper = AppConstants.AssetIdentifiersNameMappingV4;
    const query = {};
    const projection = {};
    projectionProperties.forEach(
      (propertyName) => (projection[propertyName] = 1)
    );
    query[keyNameMapper[identifierName]] = { $eq: identifierValue };
    return this.getAsset(query, projection);
  }

  public async updateAssetSources(
    parentId: string
  ): Promise<StorageModel.Asset> {
    log.debug('updateAssetSources', { parentId });
    const condition = { _id: parentId, '_sources.type': { $ne: 'content' } };
    const updateQuery = {
      $push: { _sources: { source: 'WEBCMS', type: 'content' } }
    };
    return this.model
      .findOneAndUpdate(condition, updateQuery, { new: true })
      .lean()
      .exec()
      .catch((error: Error) => {
        return Promise.reject('Error while updating asset');
      });
  }

  public async createAsset(
    asset: StorageModel.Asset
  ): Promise<StorageModel.Asset> {
    log.debug('createAsset:: asset: ', asset);
    return this.model
      .create(asset)
      .then((createdAsset) => {
        return Promise.resolve(createdAsset.toObject());
      })
      .catch((error) => {
        throw new AppError('Error while creating asset', 400, error);
      });
  }

  public async getAssetsByIdentifierNameValues(
    keyname: string,
    keyvalues: string[],
    productType?: StorageModel.ProductType
  ): Promise<StorageModel.Asset[]> {
    log.debug('getAssetsByIdentifierNameValues:: ', {
      keyname,
      keyvalues,
      productType
    });
    const keyNameMapper = AppConstants.AssetIdentifiersNameMappingV4;
    const query = {};
    query[keyNameMapper[keyname]] = { $in: keyvalues };
    if (productType) {
      query['type'] = productType;
    }
    return this.getAssets(query, {});
  }

  private async getAsset(
    query: any,
    projections: any
  ): Promise<StorageModel.Asset> {
    log.debug(`getAsset::, query: ${JSON.stringify(query)}`);
    return this.model
      .findOne(query, projections)
      .lean()
      .exec()
      .catch((error: Error) => {
        return Promise.reject('We are unable to find the asset.');
      });
  }

  private async getAssets(
    query: any,
    projections: any
  ): Promise<StorageModel.Asset[]> {
    log.debug(`getAssets::, query: ${JSON.stringify(query)}`);
    return this.model
      .find(query, projections)
      .lean()
      .exec()
      .catch((error: Error) => {
        return Promise.reject('We are unable to find the assets.');
      });
  }
}

// This module exports only one instance of the AssetDAO instead of exporting the class.
export const assetDaoV4 = new AssetV4DAO();
