import { ResponseModel, StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import * as _ from 'lodash';
import * as rTracer from 'cls-rtracer';
import { AppConstants } from '../../config/constant';
import { Config } from '../../config/config';
import { AppError } from '../../model/AppError';
import Logger from '../../utils/LoggerUtil';
import { partsUtil } from '../../utils/parts/Parts.Util';
import { assetV4Service } from '../assets/AssetV4.Service';
import { collectionRevisionV4Service } from '../collection/CollectionRevisionV4.Service';
import { partsRevisionV4Service } from './PartsRevisionV4.Service';
import { apiResponseGroupConfig } from '../config';
import { APIResponseGroup } from '../model/interfaces/CustomDataTypes';
import { IPartMediumResponse } from '../model/interfaces/Parts';
import { productV4DAO } from '../products/ProductV4.DAO';
import { partsV4DAO } from './PartsV4.DAO';
import { partsV410DAO } from '../../v410/parts/Parts.V410.DAO';

const log = Logger.getLogger('PartsV4Service');
type PartsChangedInfoList = ResponseModel.PartsRevision['partsAdded'];
const docTypeToESIndexMapperV4 = Config.getPropertyValue(
  'docTypeToESIndexMapperV4'
);

class PartsV4Service {
  public async getHasPartsCount(
    identifier: string,
    partType?: any,
    format?: string
  ): Promise<number> {
    log.debug(`getHasPartsCount:: `, { format, identifier, partType });
    return partsV4DAO.getHasPartsCount(identifier, partType, format);
  }
  public async getHasParts(
    productId: string,
    offset: number,
    limit: number,
    partType?: string,
    format?: string,
    responseGroup: APIResponseGroup = 'small'
  ): Promise<StorageModel.HasPart[]> {
    log.debug(`getHasParts:: `, {
      format,
      limit,
      offset,
      partType,
      productId,
      responseGroup
    });
    const projectionFields = apiResponseGroupConfig.getProjectionFields(
      'part',
      responseGroup
    );
    return partsV4DAO.getHasParts(
      productId,
      offset,
      limit,
      projectionFields,
      partType,
      format
    );
  }

  public async getHasPart(
    productId: string,
    partId: string
  ): Promise<StorageModel.HasPart> {
    log.debug(`getHasPart:: `, { partId, productId });
    return partsV4DAO.getHasPart(productId, partId);
  }

  public async isAccessibleForFree(
    parentId: string,
    productId: string
  ): Promise<boolean> {
    log.debug(`isAccessibleForFree:: `, { parentId, productId });
    const isFree = true;
    return partsV4DAO.getHasPart(parentId, productId, isFree).then((part) => {
      return part ? part.isFree : false;
    });
  }

  public async getProductHasParts(
    identifierValue: string,
    identifierName: string,
    offset: number,
    limit: number,
    includeCounts: boolean,
    partType?: string,
    format?: string,
    responseGroup: APIResponseGroup = 'small',
    productVersion?: string,
    isNewVersion?: boolean,
    depth?: number
  ): Promise<ResponseModel.PartsMedium[] | any> {
    log.debug('getProductHasParts:: ', {
      format,
      identifierName,
      identifierValue,
      includeCounts,
      limit,
      offset,
      partType,
      productVersion,
      responseGroup
    });
    const { _id: assetId } =
      await assetV4Service.getValidAssetByIdentifierNameValue(
        identifierName,
        identifierValue
      );
    if (!assetId) {
      throw new AppError('Product (asset) not found.', 404);
    }
    const productsByType = {};
    const productsResultByType = {};
    const partsData = await this.getPartsMeta(
      assetId,
      offset,
      limit,
      partType,
      format,
      responseGroup
    );
    const partsCount: number = partsData.partsCount;
    const productHasParts: ResponseModel.PartsMedium[] =
      partsData.productHasParts;
    if (!partsCount && (!productHasParts || productHasParts.length === 0)) {
      throw new AppError('Product parts not found.', 404);
    } else if (offset > partsCount - 1) {
      throw new AppError(
        `Offset value is more than the total parts. totalCount: ${partsCount}`,
        400
      );
    }
    // when responseGroup is medium we have to add couple of attributes
    if (responseGroup === 'medium') {
      // here we are creating product type and its corresponding list of parts id mapper
      productHasParts.forEach((prod) => {
        if (AppConstants.ProductTypesV4.includes(prod.type)) {
          productsByType[prod.type] = Object.prototype.hasOwnProperty.call(
            productsByType,
            prod.type
          )
            ? productsByType[prod.type]
            : [];
          productsByType[prod.type].push(prod._id);
        }
      });

      // based on unique product type present in parts response here we are fetching
      // product details of all the products by sending product ids in one go
      const productDataPromiser = Object.keys(productsByType).map(
        (productType: StorageModel.ProductType) =>
          this.getPartsMediumMeta(
            productsByType[productType],
            productType,
            productVersion
          )
      );
      const productTypePartsData = await Promise.all(productDataPromiser);

      // here we are creating product type and its corresponding list of products response mapper
      productTypePartsData.forEach((prod) => {
        productsResultByType[Object.keys(prod)[0]] = prod[Object.keys(prod)[0]];
      });

      // stiching product details on corresponding parts.
      productHasParts.forEach((part: ResponseModel.PartsMedium) => {
        // finding index of product from respective product type mapper
        if (AppConstants.ProductTypesV4.includes(part.type)) {
          const finalProductIndex = productsResultByType[part.type].findIndex(
            (prod) => prod._id === part._id
          );
          /* istanbul ignore else */
          if (finalProductIndex !== -1) {
            // whether we have to fetch title from product or parts?
            const productForCurrentPart =
              productsResultByType[part.type][finalProductIndex];
            part.identifiers = productForCurrentPart.identifiers;
            part.contributors = productForCurrentPart.contributors;
            part.prices = productForCurrentPart.prices;
            part.permissions = productForCurrentPart.permissions;
            part[part.type] = _.get(
              productForCurrentPart,
              part.type,
              undefined
            );
            part.title = productForCurrentPart.title;
            delete part['format'];
            // deleting once product is stiched with corresponding part to increase performance
            productsResultByType[part.type].splice(finalProductIndex, 1);
          }
        }
      });
    }
    const partsLength = productHasParts && productHasParts.length;
    if (includeCounts && partsLength > 0) {
      const allCount: { type: string; count: number }[] = [];
      const individualPartsCount = await partsV4DAO.getAllPartsCount(assetId);
      const isCountMissing = !(
        individualPartsCount && individualPartsCount.length > 0
      );

      if (!isCountMissing) {
        let totalCount = 0;
        individualPartsCount.forEach((partCount) => {
          totalCount += partCount.count;
          allCount.push({ count: partCount.count, type: partCount._id });
        });
        allCount.push({
          count: totalCount,
          type: 'total'
        });
      }
      let hasParts;
      if (isNewVersion && depth && depth == 2) {
        for (const prod of productHasParts) {
          hasParts = await this.getHasParts(
            prod['_id'],
            0,
            null,
            null,
            null,
            responseGroup
          );
          prod['hasParts'] = hasParts;
        }
      }
      if (isCountMissing) {
        return Promise.resolve({
          data: productHasParts,
          metadata: {}
        });
      } else {
        return Promise.resolve({
          data: productHasParts,
          metadata: {
            counts: allCount
          }
        });
      }
    }
    return Promise.resolve(productHasParts);
  }

  public async getProductHasPart(
    id: string,
    partId: string,
    responseGroup: APIResponseGroup = 'small'
  ): Promise<ResponseModel.PartsMedium> {
    log.debug('getProductHasPart:: ', {
      id,
      partId,
      responseGroup
    });
    const asset: ResponseModel.Asset = await assetV4Service.getAssetById(id, [
      'type'
    ]);
    if (!asset) {
      throw new AppError('Product (asset) not found.', 404);
    }

    const productHasPart: ResponseModel.PartsMedium = await this.getPartMeta(
      id,
      responseGroup,
      partId
    );
    if (
      Object.keys(productHasPart).length === 0 &&
      productHasPart.constructor === Object
    ) {
      throw new AppError('Product parts not found.', 404);
    }
    // when responseGroup is medium we have to add couple of attributes
    let partMedium;
    const productType = productHasPart.type as StorageModel.ProductType;
    if (responseGroup === 'medium') {
      partMedium = await this.getPartsMediumMeta([partId], productType);
      partMedium[productType].forEach((item) => {
        productHasPart['contributors'] = item.contributors;
        productHasPart['title'] = item.title;
        productHasPart['identifiers'] = item.identifiers;
        productHasPart['prices'] = item.prices;
        productHasPart['permissions'] = item.permissions;
        productHasPart[productType] = item[productType];
      });
    }
    return Promise.resolve(productHasPart);
  }

  public async getProductPartsDelta(
    id: string,
    v1: string,
    v2: string,
    region?: string,
    responseGroup: APIResponseGroup = 'small'
  ) {
    log.debug(
      'getProductPartsDelta:: ',
      JSON.stringify({
        id,
        region,
        responseGroup,
        v1,
        v2
      })
    );
    const asset: ResponseModel.Asset = await assetV4Service.getAssetById(id, [
      'type'
    ]);
    if (!asset || asset.type !== 'collection') {
      throw new AppError('No such collection (product) found', 404);
    }
    const collectionRevisionData =
      await collectionRevisionV4Service.getCollectionRevisionData(
        id,
        [v1, v2],
        ['_id', 'version']
      );
    if (!collectionRevisionData || collectionRevisionData.length !== 2) {
      throw new AppError(
        'Data for one or both versions of this product not found.',
        404
      );
    }
    const collectionRevisionIds = collectionRevisionData.map(
      (data: { _id: string; version: string }) => data._id
    );
    const { _id: collectionV1Id } =
      collectionRevisionData.find(
        (collectionRev: { _id: string; version: string }) =>
          collectionRev.version === v1
      ) || {};
    const { _id: collectionV2Id } =
      collectionRevisionData.find(
        (collectionRev: { _id: string; version: string }) =>
          collectionRev.version === v2
      ) || {};
    const partsRevisionData =
      await partsRevisionV4Service.getPartsRevisionDataByIds(
        collectionRevisionIds,
        responseGroup
      );
    if (!partsRevisionData || partsRevisionData.length !== 2) {
      throw new AppError(
        'Parts data not found for one or both versions of this product.',
        404
      );
    }
    const partsDataV2: ResponseModel.PartsCombined[] = partsRevisionData.find(
      (partRevisionData) => partRevisionData._id === collectionV2Id
    ).parts;
    const partsDataV1: ResponseModel.PartsCombined[] = partsRevisionData.find(
      (partRevisionData) => partRevisionData._id === collectionV1Id
    ).parts;
    const partsAdded: ResponseModel.PartsCombined[] = partsUtil.getPartsDiff(
      partsDataV1,
      partsDataV2
    );
    const partsRemoved: ResponseModel.PartsCombined[] = partsUtil.getPartsDiff(
      partsDataV2,
      partsDataV1
    );
    let finalPartsAdded = [];
    let finalPartsRemoved = [];
    if (region) {
      const {
        addedPartsDataFromSearchResult,
        removedPartsDataFromSearchResult
      } = await this.handleRegionFilterOfPartsData(
        partsAdded,
        partsRemoved,
        region,
        responseGroup
      );
      finalPartsAdded = partsUtil.mergePartsAndProductPartsData(
        partsAdded,
        addedPartsDataFromSearchResult
      );
      finalPartsRemoved = partsUtil.mergePartsAndProductPartsData(
        partsRemoved,
        removedPartsDataFromSearchResult
      );
    } else {
      finalPartsAdded = partsAdded;
      finalPartsRemoved = partsRemoved;
    }
    return {
      data: {
        partsAdded: finalPartsAdded,
        partsRemoved: finalPartsRemoved
      },
      metadata: {
        transactionId: rTracer.id()
      }
    };
  }

  private async handleRegionFilterOfPartsData(
    partsAdded: ResponseModel.PartsCombined[],
    partsRemoved: ResponseModel.PartsCombined[],
    region: string,
    responseGroup: APIResponseGroup = 'small'
  ) {
    const searchDataForAddedParts =
      partsAdded.length > 0
        ? await this.getSearchResults(partsAdded, { region, responseGroup })
        : [];
    const searchDataForRemovedParts =
      partsRemoved.length > 0
        ? await this.getSearchResults(partsRemoved, { region, responseGroup })
        : [];
    const addedPartsDataFromSearchResult =
      searchDataForAddedParts.length > 0
        ? partsUtil.getPartsDataFromSearchResult(searchDataForAddedParts)
        : [];
    const removedPartsDataFromSearchResult =
      searchDataForRemovedParts.length > 0
        ? partsUtil.getPartsDataFromSearchResult(searchDataForRemovedParts)
        : [];
    return { addedPartsDataFromSearchResult, removedPartsDataFromSearchResult };
  }

  public async getSearchResults(
    partsData: ResponseModel.PartsCombined[] | PartsChangedInfoList,
    options?: {
      region?: string;
      responseGroup?: APIResponseGroup;
    }
  ) {
    const region = options?.region;
    const responseGroup = options?.responseGroup || 'small';
    const partsTypeToIndex = partsUtil.getUniquePartTypesToIndex(partsData);
    const idsToIndex = partsUtil.getIdsFromParts(partsData);
    const projections =
      partsUtil.getProjectionsBasedOnResponseGroup(responseGroup);
    const limit = partsData.length;
    const { searchData } = await partsV410DAO.getPartsDataByRegion({
      ids: idsToIndex,
      limit,
      partTypeToIndex: partsTypeToIndex.toString(),
      projections,
      region
    });
    return searchData;
  }

  private async getPartsMeta(
    id: string,
    offset: number,
    limit: number,
    partType: string,
    format: string,
    responseGroup: APIResponseGroup
  ): Promise<{ partsCount: number; productHasParts: StorageModel.HasPart[] }> {
    const partsCount = await this.getHasPartsCount(id, partType, format);
    const productHasParts = await this.getHasParts(
      id,
      offset,
      limit,
      partType,
      format,
      responseGroup
    );
    return { partsCount, productHasParts };
  }

  private async getPartMeta(
    id: string,
    responseGroup: APIResponseGroup,
    partId: string
  ): Promise<StorageModel.HasPart> {
    const projectionFields = apiResponseGroupConfig.getProjectionFields(
      'part',
      responseGroup
    );
    const filterPartfields = projectionFields.map((item) => item.split('.')[1]);
    const productHasPart = await this.getHasPart(id, partId);
    return _.pick(productHasPart, filterPartfields) as any;
  }

  private async getPartsMediumMeta(
    productsIds: string[],
    productType: StorageModel.ProductType,
    productVersion?: string
  ): Promise<IPartMediumResponse> {
    // fetching all the projections based on partMedium for different product type
    const projectionFields = apiResponseGroupConfig.getProjectionFields(
      productType,
      'partMedium'
    );
    const productMediumData = await productV4DAO.getProductsByIds(
      productType,
      productsIds,
      { projectionFields }
    );
    const productMediumResponse = {};
    productMediumResponse[productType] = productMediumData;
    return productMediumResponse;
  }
}
export const partsV4Service = new PartsV4Service();
