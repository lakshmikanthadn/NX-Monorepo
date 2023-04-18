import { StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import * as mongoose from 'mongoose';
import Logger from '../../utils/LoggerUtil';
import { AppConstants } from '../../config/constant';
import { Config } from '../../config/config';
import { AppError } from '../../model/AppError';
import { GenricSchema } from '../../model/GenricSchema';
import { IProductFilterOptions } from '../model/interfaces/ProductFilterOptions';
import { IProductsRuleRequest } from '../model/interfaces/productRequest';
import { IProductsTotalPrice } from '../model/interfaces/ProductsTotalPrice';

const docTypeToCollectionMapperV4 = Config.getPropertyValue(
  'docTypeToCollectionMapperV4'
);
const validProductTypes = Object.keys(docTypeToCollectionMapperV4);
const log = Logger.getLogger('ProductV4DAO');

class ProductV4DAO {
  private productModelsHolder = {};

  public async getProduct(
    productType: StorageModel.ProductType,
    id: string,
    projectionFields: string[],
    availabilityName?: string,
    availabilityStatus?: string[],
    productVersion?: string,
    region?: string
  ): Promise<StorageModel.Product> {
    log.debug('getProduct:: ', {
      availabilityName,
      availabilityStatus,
      id,
      productType,
      productVersion,
      projectionFields,
      region
    });
    const model = this.getProductModel(productType);
    const query = { _id: id };
    if (productVersion) {
      query['version'] = productVersion;
    }
    if (region) {
      query['rights.iso3'] = { $ne: region };
    }
    const projections = this.prepareMongoProjections(projectionFields);
    log.debug('getProduct:: ', { projections, query });
    return model.findOne(query, projections).lean().exec();
  }

  /**
   * This method finds the all the product with status as active from the mongoDB.
   * @param productType
   * @param ids array of uuid
   */
  public async getActiveProductByIds(
    productType: StorageModel.ProductType,
    ids: string[]
  ): Promise<Array<{ _id: string }>> {
    log.debug('getActiveProductByIds:: ', {
      ids,
      productType
    });
    const model = this.getProductModel(productType);
    const query = {
      $and: [
        { _id: { $in: ids } },
        {
          [`${productType}.lifetime.active`]: true
        }
      ]
    };
    const projections = this.prepareMongoProjections(['_id']);
    log.debug('getActiveProductByIds:: ', { projections, query });
    return model.find(query, projections).lean().exec();
  }

  public async getProductsByIds(
    productType: StorageModel.ProductType,
    ids: string[],
    productFilterOptions: IProductFilterOptions
  ): Promise<StorageModel.Product[]> {
    log.debug('getProductsByIds:: ', {
      ids,
      productFilterOptions,
      productType
    });
    const { projectionFields = [], productVersion } = productFilterOptions;
    const model = this.getProductModel(productType);
    const query = { _id: { $in: ids } };
    if (productVersion) {
      query['version'] = productVersion;
    }
    const projections = this.prepareMongoProjections(projectionFields);
    log.debug('getProductsByIds:: ', { projections, query });
    return model.find(query, projections).lean().exec();
  }

  public async getProductsWithType(
    productType: string,
    offset: number,
    limit: number,
    filedsForProjections: string[],
    availabilityName?: string,
    availabilityStatus?: string[],
    productVersion?: string
  ): Promise<any> {
    log.debug('getProductsWithType:: ', {
      availabilityName,
      filedsForProjections,
      limit,
      offset,
      productType,
      productVersion
    });
    const model = this.getProductModel(productType);
    const query = {};
    if (productVersion) {
      query['version'] = productVersion;
    }
    const projections = this.prepareMongoProjections(filedsForProjections);
    log.debug('getProductsWithType:: ', { query });
    return model
      .find(query, projections)
      .sort({ _id: 1 })
      .skip(offset)
      .limit(limit)
      .lean()
      .exec();
  }

  public async getProductByTitle(
    title: string,
    productType: string,
    fieldsForProjections: string[]
  ): Promise<any> {
    log.debug('getProductByTitle:: ', {
      fieldsForProjections,
      productType,
      title
    });
    const model = this.getProductModel(productType);
    const query = { title };
    const projections = this.prepareMongoProjections(fieldsForProjections);
    log.debug('getProductByTitle:: ', { query });
    return model.findOne(query, projections).lean().exec();
  }

  public async getProductByIdentifier(
    identifierName: string,
    identifierValue: string,
    productType: StorageModel.ProductType,
    fieldsForProjections: string[]
  ): Promise<any> {
    log.debug('getProductByIdentifier:: ', {
      fieldsForProjections,
      identifierName,
      identifierValue,
      productType
    });
    const model = this.getProductModel(productType);
    const query = {};
    query[identifierName] = identifierValue;
    const projections = this.prepareMongoProjections(fieldsForProjections);
    log.debug('getProductByIdentifier:: ', { query });
    return model.find(query, projections).lean().exec();
  }

  public async getPreArticlesByIdentifier(
    identifierName: string,
    identifierValues: string[],
    productType: StorageModel.ProductType,
    fieldsForProjections: string[]
  ): Promise<any> {
    log.debug('getPreArticlesByIdentifier:: ', {
      fieldsForProjections,
      identifierName,
      identifierValues,
      productType
    });
    const keyNameMapper = AppConstants.PreArticleIdentifiersNameMappingV4;
    const model = this.getProductModel(productType);
    const query = {};
    const caseInsensitiveValues = identifierValues.map(
      (item) => new RegExp(item, 'i')
    );
    query[keyNameMapper[identifierName]] = { $in: caseInsensitiveValues };
    const projections = this.prepareMongoProjections(fieldsForProjections);
    log.debug('getPreArticlesByIdentifier:: ', { query });
    return model.find(query, projections).lean().exec();
  }

  public async getProductsCountByRule(
    productType: string,
    rule: any
  ): Promise<number> {
    log.debug(`getProductsCount:: `, JSON.stringify({ productType, rule }));
    const model = this.getProductModel(productType);
    return model.count(rule).exec();
  }

  public async getProductsByRule(
    productsRuleRequest: IProductsRuleRequest
  ): Promise<StorageModel.Product[]> {
    const { productType, availability } = productsRuleRequest;
    if (Array.isArray(availability) && availability.length > 0) {
      const model = this.getProductModel(productType);
      const aggQuery = this.prepareProductsRulesQuery(productsRuleRequest);
      return model.aggregate(aggQuery).exec();
    } else {
      return this.prepareProductsRulesQuery(productsRuleRequest).lean().exec();
    }
  }
  public async getProductsPriceByRules(
    productType: string,
    rules: any
  ): Promise<IProductsTotalPrice[]> {
    log.debug(
      `getProductsPriceByRules:: `,
      JSON.stringify({ productType, rules })
    );
    const model = this.getProductModel(productType);
    const aggQuery = this._generateAggQueryForPrice(rules);
    return model.aggregate(aggQuery).exec();
  }

  private prepareProductsRulesQuery(
    productsRuleRequest: IProductsRuleRequest
  ): any {
    const {
      productType,
      rules,
      projections,
      availabilityName,
      offset,
      limit,
      availability,
      sortOrder
    } = productsRuleRequest;
    log.debug(
      `getProducts:: `,
      JSON.stringify({
        availabilityName,
        limit,
        offset,
        projections,
        rules
      })
    );
    log.info(`getProducts:: inputQuery`, JSON.stringify({ rules }));
    const model = this.getProductModel(productType);
    const mongoProjections = this.prepareMongoProjections(projections);
    const sortQuery = {
      _id: sortOrder === 'asc' ? 1 : -1
    };
    if (Array.isArray(availability) && availability.length > 0) {
      const channelNames = availability.map((av) => av.name);
      mongoProjections['availability'] =
        this.getProjectionFilterForAvailability(channelNames);
      const aggregateQuery: any[] = [
        { $match: rules },
        { $project: mongoProjections },
        { $sort: sortQuery }
      ];
      if (offset) {
        aggregateQuery.push({ $skip: offset });
      }
      if (limit) {
        aggregateQuery.push({ $limit: limit });
      }
      return aggregateQuery;
    } else {
      // adds availability into projections if it's given in the request
      if (availabilityName) {
        mongoProjections['availability'] = {
          $elemMatch: {
            name: availabilityName
          }
        };
      }
      const mongoQuery = model.find(rules, mongoProjections);
      mongoQuery.sort(sortQuery);
      if (offset) {
        mongoQuery.skip(offset);
      }
      if (limit) {
        mongoQuery.limit(limit);
      }
      return mongoQuery;
    }
  }
  private _generateAggQueryForPrice(mQuery: string) {
    const priceFilter = {
      as: 'price',
      cond: {
        $and: [
          { $eq: ['$$price.priceTypeCode', 'BYO'] },
          { $in: ['$$price.currency', ['GBP', 'USD']] }
        ]
      },
      input: '$prices'
    };
    const priceGrouper = {
      _id: {
        currency: '$prices.currency',
        priceTypeCode: '$prices.priceTypeCode'
      },
      price: { $sum: '$prices.price' },
      priceType: { $first: '$prices.priceType' },
      productsCount: { $sum: 1 }
    };
    return [
      { $match: mQuery },
      {
        $project: {
          prices: { $filter: priceFilter }
        }
      },
      { $unwind: '$prices' },
      {
        $group: priceGrouper
      },
      {
        $project: {
          _id: 0,
          currency: '$_id.currency',
          price: 1,
          priceType: 1,
          priceTypeCode: '$_id.priceTypeCode',
          productsCount: 1
        }
      }
    ];
  }

  private getProductModel(productType: string): mongoose.Model<any> {
    const productTypeLowerCase = productType.toLowerCase();
    if (!validProductTypes.includes(productTypeLowerCase)) {
      throw new Error('Invalid Product type.');
    }

    if (this.productModelsHolder[productTypeLowerCase]) {
      return this.productModelsHolder[productTypeLowerCase];
    } else {
      const newProductModel = mongoose.model<any>(
        productType,
        GenricSchema,
        docTypeToCollectionMapperV4[productTypeLowerCase]
      );
      this.productModelsHolder[productTypeLowerCase] = newProductModel;
      return newProductModel;
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

  private getProjectionFilterForAvailability(channelNames: string[]) {
    if (!channelNames || channelNames.length === 0) {
      return 1;
    }
    return {
      $filter: {
        as: 'av',
        cond: { $in: ['$$av.name', channelNames] },
        input: '$availability'
      }
    };
  }
}

export const productV4DAO = new ProductV4DAO();
