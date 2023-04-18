import { MongooseSchema, StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import * as mongoose from 'mongoose';
import Logger from '../../utils/LoggerUtil';

import { Config } from '../../config/config';
import { partsV4DAO } from './PartsV4.DAO';

const log = Logger.getLogger('PartRevisionDAO');
type PartType = StorageModel.Parts & mongoose.Document;
const docTypeToCollectionMapperV4 = Config.getPropertyValue(
  'docTypeToCollectionMapperV4'
);

class PartsRevisionV4DAO {
  public model: mongoose.Model<PartType>;

  constructor() {
    const collectionName = docTypeToCollectionMapperV4.partrevision;
    this.model = mongoose.model(
      'PartsRevisionV4',
      MongooseSchema.PartRevision,
      collectionName
    );
  }
  /**
   * This method finds part and then slices only few has-parts(offset-limit) returns them.
   * @param  {string} productId uuid of the part (product uuid).
   * @param  {string} productVersion version of the part (product version).
   * @param  {number} offset Index of the parts array  to slice from: part.parts[offset].
   * @param  {number} limit Index of parts array to slice upto: part.parts[limit]
   * @param  {ProductType} partType? Type of the part(product) this can be any of the ProductType
   * @param  {string} format? This is Creative work format type.
   * @returns {StorageModel.HasPart[]} HasPart
   */
  public async getHasParts(
    productId: string,
    productVersion: string,
    offset: number,
    limit: number,
    projectionFields: string[],
    partType?: any,
    format?: string
  ): Promise<StorageModel.HasPart[]> {
    log.debug(`getHasParts:: `, {
      format,
      limit,
      offset,
      partType,
      productId,
      productVersion,
      projectionFields
    });
    const aggregationQuery = this.getAggregationQueryForPartsRevision(
      productId,
      productVersion,
      offset,
      limit,
      partType,
      format
    );
    const projections = partsV4DAO.prepareMongoProjections(projectionFields);
    // adds projections
    aggregationQuery.push({ $project: projections });
    const modelQuery = this.model.aggregate(aggregationQuery);
    return partsV4DAO.executeQuery(modelQuery, false);
  }

  public async getHasPartsCount(
    productId: string,
    productVersion: string,
    partType?: StorageModel.ProductType,
    format?: string
  ): Promise<number> {
    log.debug(`getHasPartsCount:: `, {
      format,
      partType,
      productId,
      productVersion
    });
    const isWithFilters = partType || format;
    log.debug(`getHasPartsCount:: `, { isWithFilters });
    let modelQuery;
    if (isWithFilters) {
      const aggregationQuery = this.getAggregationQueryForPartsRevision(
        productId,
        productVersion,
        null,
        null,
        partType,
        format
      );
      modelQuery = this.model.aggregate(aggregationQuery);
    } else {
      modelQuery = this.model
        .find({ parentId: productId, version: productVersion })
        .lean();
    }
    return partsV4DAO.executeQuery(modelQuery, true);
  }
  /**
   * This method prepares an aggregate query to
   * - find product part by id
   * - then unwind all the parts before slicing
   * this is becuase there could be multiple parts for same product, if the part count is > 10000
   * - then add query to filter docs by product type (if required)
   * - then add query to filter docs by media type (valid for CreativeWork) (if required)
   * - then limit and skip to slice only few has-parts(offset-limit)
   * - then combine them to form a single part/entity with all the parts..
   * @param  {string} productId uuid of the part (product uuid).
   * @param  {string} productVersion version of the part (product version).
   * @param  {number} offset Index of the parts array  to slice from: part.parts[offset].
   * @param  {number} limit Index of parts array to slice upto: part.parts[limit]
   * @param  {ProductType} partType? Type of the part(product) this can be any of the ProductType
   * @param  {string} format? This is Creative work media type.
   */
  private getAggregationQueryForPartsRevision(
    productId: string,
    productVersion: string,
    offset: number,
    limit: number,
    partType?: string,
    format?: string
  ): any[] {
    const aggregationQuery = [];
    const idQuery = { parentId: productId, version: productVersion };
    aggregationQuery.push({ $match: idQuery });
    aggregationQuery.push({ $unwind: '$parts' });
    // Push the part type filter here to aggregate query.
    if (partType) {
      const caseInsensitiveRegexQuery =
        partsV4DAO.getCaseInsensitiveRegexQuery(partType);
      const matchFilter = { 'parts.type': caseInsensitiveRegexQuery };
      aggregationQuery.push({ $match: matchFilter });
    }
    // Push the part format-type filter here to aggregate query.l
    if (format) {
      const caseInsensitiveRegexQuery =
        partsV4DAO.getCaseInsensitiveRegexQuery(format);
      const matchFilter = {
        'parts.format': caseInsensitiveRegexQuery
      };
      aggregationQuery.push({ $match: matchFilter });
    }
    // Push limit and skip values to aggreagte query.
    if (offset) {
      aggregationQuery.push({ $skip: offset });
    }
    if (limit) {
      aggregationQuery.push({ $limit: limit });
    }
    // Push the group query so that it will merge the unwinded parts back to parts field.
    aggregationQuery.push({
      $group: {
        _id: null,
        parts: { $push: '$parts' }
      }
    });
    return aggregationQuery;
  }
  public async getPartsRevisionDataByIds(
    ids: string[],
    projectionFields: string[]
  ): Promise<any> {
    log.debug(`getPartsRevisionDataByIds:: `, {
      ids,
      projectionFields
    });
    const query = { _id: { $in: ids } };
    const projection = {};
    projectionFields.forEach((property) => {
      projection[property] = 1;
    });
    return this.model
      .find(query, projection)
      .lean()
      .exec()
      .catch((_error: Error) => {
        return Promise.reject(
          'We are unable to find parts revision data for this product.'
        );
      });
  }
  public async getPartsRevisionDataByDate(
    id: string,
    fromDate: string,
    toDate?: string
  ): Promise<Array<StorageModel.PartsRevision>> {
    log.debug(`getPartsRevisionDataByDate:: `, {
      id
    });
    const createdDateQuery = {
      $gte: new Date(fromDate)
    };
    if (toDate) {
      const endDate = new Date(toDate);
      endDate.setUTCHours(23, 59, 59, 999);
      createdDateQuery['$lt'] = new Date(endDate);
    }
    const query = {
      _createdDate: createdDateQuery,
      parentId: { $eq: id }
    };
    // We are removing the isFree from the Model itself.
    // Currently we have decided to  explicity remove in the projection.
    const projection = {
      'partsAdded.isFree': 0,
      'partsRemoved.isFree': 0,
      'partsUpdated.isFree': 0
    };
    return this.model
      .find(query, projection)
      .lean()
      .exec()
      .catch((_error: Error) => {
        return Promise.reject(
          'We are unable to find parts revision data for this product.'
        );
      });
  }
}
export const partsRevisionV4DAO = new PartsRevisionV4DAO();
