import { MongooseSchema, StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import * as mongoose from 'mongoose';

import { Config } from '../../config/config';
import { AppError } from '../../model/AppError';
import Logger from '../../utils/LoggerUtil';

type ProductModelType = StorageModel.Product & mongoose.Document;
const log = Logger.getLogger('CreativeWorkV4DAO');
const docTypeToCollectionMapperV4 = Config.getPropertyValue(
  'docTypeToCollectionMapperV4'
);

class CreativeWorkV4DAO {
  public model: mongoose.Model<ProductModelType>;

  constructor() {
    const collectionName = docTypeToCollectionMapperV4.creativework;
    this.model = mongoose.model(
      'CreativeWorkV4',
      MongooseSchema.CreativeWork,
      collectionName
    );
  }

  public createCreativeWork(
    creativeWork: StorageModel.Product
  ): Promise<StorageModel.Product> {
    log.debug('createCreativeWork:: creativeWork: ', creativeWork);
    return this.model
      .create(creativeWork)
      .then((createdCreativeWork) => {
        return Promise.resolve(createdCreativeWork.toObject());
      })
      .catch((error) => {
        throw new AppError('Error while creating creativeWork', 400, error);
      });
  }

  public async updateCreativeWorkSources(
    id: string
  ): Promise<StorageModel.Product> {
    log.debug('updateCreativeWorkSources', { id });
    const filter = {
      _id: id,
      '_sources.type': { $ne: 'content' }
    };
    const updateQuery = {
      $push: {
        _sources: { source: 'WEBCMS', type: 'content' }
      }
    };
    return this.model
      .findOneAndUpdate(filter, updateQuery, { new: true })
      .lean()
      .exec()
      .catch((error: Error) => {
        return Promise.reject('Error while updating creativeWork');
      });
  }

  public async getCreativeWorkByIds(
    productIds: string[],
    projectionData: string[] = []
  ): Promise<StorageModel.Product[]> {
    log.debug('getCreativeWorkByIds', { productIds, projectionData });
    const query = { _id: { $in: productIds } };
    const projection = {};
    projectionData.forEach((property) => {
      projection[property] = 1;
    });
    return this.model
      .find(query, projection)
      .lean()
      .exec()
      .catch((error: Error) => {
        return Promise.reject('We are unable to find the product.');
      });
  }
}

export const creativeWorkV4Dao = new CreativeWorkV4DAO();
