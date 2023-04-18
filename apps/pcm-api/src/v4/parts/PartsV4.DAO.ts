import { MongooseSchema, StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import * as mongoose from 'mongoose';
import { Config } from '../../config/config';
import Logger from '../../utils/LoggerUtil';

const log = Logger.getLogger('PartsV4DAO');
type PartType = StorageModel.Parts & mongoose.Document;
const docTypeToCollectionMapperV4 = Config.getPropertyValue(
  'docTypeToCollectionMapperV4'
);

class PartsV4DAO {
  public model: mongoose.Model<PartType>;

  constructor() {
    const collectionName = docTypeToCollectionMapperV4.part;
    this.model = mongoose.model('PartsV4', MongooseSchema.Part, collectionName);
  }

  public async getHasPart(
    parentId: string,
    hasPartId: string,
    isFree?: boolean
  ): Promise<StorageModel.HasPart> {
    log.debug(`getHasPart:: `, { hasPartId, parentId });
    const elemMatchObj = { _id: hasPartId };
    if (isFree) {
      elemMatchObj['isFree'] = true;
    }
    const query = { _id: parentId, parts: { $elemMatch: elemMatchObj } };
    const projections = {
      parts: { $elemMatch: { _id: hasPartId } }
    };
    log.debug(`getHasPart:: query: ${JSON.stringify(query)},
         projections: ${JSON.stringify(projections)}`);
    return this.model
      .findOne(query, projections)
      .lean()
      .exec()
      .then((part: StorageModel.Parts) => {
        log.debug(`getHasPart:: part: ${JSON.stringify(part)}`);
        let hasPart: StorageModel.HasPart;
        /* istanbul ignore else */
        if (part && part.parts && part.parts.length === 1) {
          hasPart = part.parts[0];
        }
        return Promise.resolve(hasPart);
      })
      .catch((error: Error) => {
        return Promise.reject('We are unable to find the part.');
      });
  }

  /**
   * This method finds part and then slices only few has-parts(offset-limit) returns them.
   * @param  {string} productId uuid of the part (product uuid).
   * @param  {number} offset Index of the parts array  to slice from: part.parts[offset].
   * @param  {number} limit Index of parts array to slice upto: part.parts[limit]
   * @param  {ProductType} partType? Type of the part(product) this can be any of the ProductType
   * @param  {string} format? This is Creative work format type.
   * @returns {StorageModel.HasPart[]} HasPart
   */
  public async getHasParts(
    productId: string,
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
      projectionFields
    });
    const aggregationQuery = this.getAggregationQueryForParts(
      productId,
      offset,
      limit,
      partType,
      format
    );
    const projections = this.prepareMongoProjections(projectionFields);
    // adds projections
    aggregationQuery.push({ $project: projections });
    const modelQuery = this.model.aggregate(aggregationQuery);
    return this.executeQuery(modelQuery, false);
  }

  public async getHasPartsCount(
    productId: string,
    partType?: StorageModel.ProductType,
    format?: string
  ): Promise<number> {
    log.debug(`getHasPartsCount:: `, { format, partType, productId });
    const isWithFilters = partType || format;
    log.debug(`getHasPartsCount:: `, { isWithFilters });
    let modelQuery;
    if (isWithFilters) {
      const aggregationQuery = this.getAggregationQueryForParts(
        productId,
        null,
        null,
        partType,
        format
      );
      modelQuery = this.model.aggregate(aggregationQuery);
    } else {
      modelQuery = this.model.find({ _id: productId }).lean();
    }
    return this.executeQuery(modelQuery, true);
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
   * @param  {number} offset Index of the parts array  to slice from: part.parts[offset].
   * @param  {number} limit Index of parts array to slice upto: part.parts[limit]
   * @param  {ProductType} partType? Type of the part(product) this can be any of the ProductType
   * @param  {string} format? This is Creative work media type.
   */
  public getAggregationQueryForParts(
    productId: string,
    offset: number,
    limit: number,
    partType?: string,
    format?: string
  ): any[] {
    const aggregationQuery = [];
    const idQuery = { _id: productId };
    aggregationQuery.push({ $match: idQuery });
    aggregationQuery.push({ $unwind: '$parts' });
    // Push the part type filter here to aggregate query.
    if (partType && partType === 'creativeWork') {
      const lookupFilter = {
        as: 'productFormat',
        foreignField: '_id',
        from: docTypeToCollectionMapperV4[partType.toLowerCase()],
        localField: 'parts._id'
      };
      // join parts and productMeta as format is inside productMeta
      aggregationQuery.push({ $lookup: lookupFilter });
      aggregationQuery.push({ $unwind: '$productFormat' });
      // add format inside parts
      const partsformat = {
        'parts.format': `$productFormat.${partType}.format`
      };
      aggregationQuery.push({ $addFields: partsformat });
    } else if (partType) {
      const caseInsensitiveRegexQuery =
        this.getCaseInsensitiveRegexQuery(partType);
      const matchFilter = { 'parts.type': caseInsensitiveRegexQuery };
      aggregationQuery.push({ $match: matchFilter });
    }
    // Push the part format-type filter here to aggregate query.
    if (format) {
      // additional filter based on input format
      const matchFilter = {
        'parts.format': format
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

  public getAggregationQueryForAllPartsCount(productId: string): any[] {
    const aggregationQuery = [];
    const idQuery = { _id: productId };
    aggregationQuery.push({ $match: idQuery });
    aggregationQuery.push({ $unwind: '$parts' });
    // Push the group query so that it will return individual parts count.
    const groupQuery = {
      $group: {
        _id: '$parts.type',
        count: { $sum: 1 }
      }
    };
    aggregationQuery.push(groupQuery);
    return aggregationQuery;
  }

  public getAllPartsCount(productId: string): Promise<any> {
    log.debug(`getAllPartsCount:: `, {
      productId
    });
    const aggregationQuery =
      this.getAggregationQueryForAllPartsCount(productId);
    const modelQuery = this.model.aggregate(aggregationQuery).exec();
    return modelQuery;
  }

  public async executeQuery(modelQuery, isHasPartsCountMethod: boolean) {
    return modelQuery
      .exec()
      .then((part: StorageModel.Parts[]) => {
        let hasParts: StorageModel.HasPart[];
        if (part && part[0]) {
          hasParts = part[0].parts;
        }
        if (isHasPartsCountMethod) {
          const count = hasParts ? hasParts.length : 0;
          return Promise.resolve(count);
        } else {
          return Promise.resolve(hasParts);
        }
      })
      .catch((error: Error) => {
        return Promise.reject('We are unable to find the parts.');
      });
  }
  /**
   * This method prepares a case insentive text search query for mongo db.
   * @param  {string} stringValue
   * @returns {regexQuery}
   */
  public getCaseInsensitiveRegexQuery(stringValue: string): any {
    const caseInsensitiveType = '^' + stringValue + '$';
    return { $options: 'i', $regex: caseInsensitiveType };
  }
  public prepareMongoProjections(projectionFileds: string[]): any {
    const projections = {};
    projectionFileds.forEach((property) => {
      projections[property] = 1;
    });
    return projections;
  }
}
export const partsV4DAO = new PartsV4DAO();
