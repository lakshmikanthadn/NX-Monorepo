import { MongooseSchema, ResponseModel } from '@tandfgroup/pcm-entity-model-v4';
import * as mongoose from 'mongoose';
import Logger from '../../utils/LoggerUtil';
import {
  ITaxonomyFilter,
  ITaxonomyMasterFilter
} from '../model/interfaces/TaxonomyFilter';

import { Config } from '../../config/config';
import { AppError } from '../../model/AppError';

type ProductModelType = ResponseModel.Taxonomy & mongoose.Document;
const log = Logger.getLogger('TaxonomyV4DAO');
const docTypeToCollectionMapperV4 = Config.getPropertyValue(
  'docTypeToCollectionMapperV4'
);

class TaxonomyV4DAO {
  public model: mongoose.Model<ProductModelType>;
  public TaxonomyMaster: mongoose.Model<
    ResponseModel.TaxonomyMaster & mongoose.Document
  >;

  constructor() {
    const collectionName = docTypeToCollectionMapperV4.taxonomy;
    this.model = mongoose.model(
      'TaxonomyV4',
      MongooseSchema.Taxonomy,
      collectionName
    );
    this.TaxonomyMaster = mongoose.model(
      'TaxonomyMaster',
      MongooseSchema.ClassificationSchema,
      docTypeToCollectionMapperV4.taxonomyMaster
    );
  }

  public async getTaxonomy(
    assetType: string,
    taxonomyType: string,
    taxonomyFilter: ITaxonomyFilter,
    projectionFields?: string[]
  ): Promise<ResponseModel.Taxonomy[]> {
    log.debug('getTaxonomy:: ', { assetType, taxonomyFilter, taxonomyType });
    const query = {
      status: 'active'
    };
    if (taxonomyType) {
      query['type'] = taxonomyType;
    }
    if (assetType) {
      query['assetType'] = assetType;
    }
    if (taxonomyFilter.name) {
      query['name'] = taxonomyFilter.name;
    }

    if (taxonomyFilter.code) {
      query['code'] = taxonomyFilter.isCodePrefix
        ? { $regex: `^${taxonomyFilter.code}` }
        : taxonomyFilter.code;
    }
    if (taxonomyFilter.level) {
      query['level'] = taxonomyFilter.extendLevel
        ? { $gte: taxonomyFilter.level }
        : taxonomyFilter.level;
    }
    log.debug('getTaxonomy:: ', { query });
    const projections = this.prepareMongoProjections(projectionFields);
    return this.model
      .find(query, projections)
      .lean()
      .exec()
      .catch((error: Error) => {
        return Promise.reject('We are unable to find the Taxonomy.');
      });
  }
  public async getTaxonomyClassifications(
    taxonomyFilter: ITaxonomyMasterFilter,
    projectionFields?: string[]
  ): Promise<ResponseModel.TaxonomyMaster[]> {
    log.debug('getTaxonomyClassifications:: ', { taxonomyFilter });
    const query = {
      classificationFamily: taxonomyFilter.classificationFamily,
      status: 'active'
    };
    if (taxonomyFilter.classificationType) {
      query['classificationType'] = taxonomyFilter.classificationType;
    }
    if (taxonomyFilter.code) {
      query['code'] =
        taxonomyFilter.level || taxonomyFilter.includeChildren
          ? { $regex: `^${taxonomyFilter.code}` }
          : taxonomyFilter.code;
    }
    if (taxonomyFilter.level) {
      query['level'] = taxonomyFilter.includeChildren
        ? { $gte: taxonomyFilter.level }
        : taxonomyFilter.level;
    }
    log.debug('getTaxonomyClassifications:: ', { query });
    const projections = this.prepareMongoProjections(projectionFields);
    try {
      return this.TaxonomyMaster.find(query, projections)
        .sort({ _id: 1 })
        .lean()
        .exec();
    } catch (error) {
      return Promise.reject('We are unable to find the Taxonomy.');
    }
  }
  private prepareMongoProjections(projectionFields: string[]): any {
    if (Array.isArray(projectionFields)) {
      const projections = {};
      projectionFields.forEach((property) => {
        projections[property] = 1;
      });
      return projections;
    } else {
      throw new AppError('Invalid projections.', 400);
    }
  }
}

export const taxonomyV4DAO = new TaxonomyV4DAO();
