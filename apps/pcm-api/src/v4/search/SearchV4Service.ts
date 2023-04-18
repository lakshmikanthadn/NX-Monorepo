import { StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import * as _ from 'lodash';
import Logger from '../../utils/LoggerUtil';

import { AppError } from '../../model/AppError';
import { associatedMediaV4Service } from '../associatedMedia/AssociatedMediaV4.Service';
import { IProductsTotalPrice } from '../model/interfaces/ProductsTotalPrice';
import { IProductWrapper } from '../model/interfaces/ProductWrapper';
import {
  AvailabilityStatus,
  IAvailability,
  IAvailabilityArray,
  IResultCount,
  ISearchProductResp,
  ISearchQuery,
  ISearchQueryMetaDataParams,
  ISearchQueryParams,
  ISearchRespMetadata
} from '../model/interfaces/SearchResult';
import { productV4DAO } from '../products/ProductV4.DAO';
import { productTransform } from '../transform/ProductTransform';

import { IProductsRuleRequest } from '../model/interfaces/productRequest';

const log = Logger.getLogger('SearchV4Service');
class SearchV4Service {
  public async searchProducts(
    searchQueryParams: ISearchQueryParams
  ): Promise<ISearchProductResp> {
    log.debug('searchProducts:: ');
    const {
      productType,
      offset,
      hasTotalPrices,
      hasCounts,
      availabilityName,
      availabilityStatus,
      availability,
      offsetCursor
    } = searchQueryParams;
    let limit = searchQueryParams.limit;
    let searchQueryParserResult = searchQueryParams.searchQueryParserResult;
    // Find the products then return them.

    if (!searchQueryParserResult || searchQueryParserResult.length <= 0) {
      throw new AppError('Invalid search query', 400, {
        searchQueryParserResult
      });
    }
    searchQueryParserResult.forEach((sQuery) => {
      if (!(sQuery.type && sQuery.rules)) {
        throw new AppError(`Invalid rule. ${JSON.stringify(sQuery)}`, 400);
      }
    });

    searchQueryParserResult = this._getQueryWithAvailability(
      searchQueryParserResult,
      availabilityName,
      availabilityStatus,
      availability
    );
    const offsetCursorVal =
      offsetCursor === 'last-page-cursor' ? null : offsetCursor;
    let countResp = [];
    let count;
    if (offsetCursor === 'last-page-cursor') {
      countResp = await this.getSearchResultCount(searchQueryParserResult);
      count = countResp[1].count;
      limit = count % limit || limit;
    }
    const queryWithOffsetCursor = this._getQueryWithOffsetCursor(
      _.cloneDeep(searchQueryParserResult),
      offsetCursorVal
    );
    const searchResultDataPromiser = [
      this.getSearchResults(
        queryWithOffsetCursor,
        offset,
        offsetCursor,
        limit,
        productType,
        availabilityName,
        availability
      )
    ];
    if (hasTotalPrices === true) {
      searchResultDataPromiser.push(
        this.getSearchResultPrices(searchQueryParserResult)
      );
    }
    if (hasCounts === true) {
      if (offsetCursor === 'last-page-cursor') {
        searchResultDataPromiser.push(Promise.resolve(countResp));
      } else {
        searchResultDataPromiser.push(
          this.getSearchResultCount(searchQueryParserResult)
        );
      }
    }

    // Call it only 1 time for getting last page _id. Later use it in every request
    if (typeof offset === 'number' && offset === 0 && !offsetCursor) {
      const _offsetCursor = 'last-page-cursor';
      searchQueryParserResult = searchQueryParserResult.map((sqpr) => {
        sqpr.attributes = [];
        return sqpr;
      });
      searchResultDataPromiser.push(
        this.getSearchResults(
          searchQueryParserResult,
          null,
          _offsetCursor,
          1,
          productType,
          availabilityName,
          availability
        )
      );
    }

    // Call it only 1 time to get first page _id when starting from end. Later use it in every request
    if (offsetCursor === 'last-page-cursor') {
      searchQueryParserResult = searchQueryParserResult.map((sqpr) => {
        sqpr.attributes = [];
        return sqpr;
      });
      searchResultDataPromiser.push(
        this.getSearchResults(
          searchQueryParserResult,
          0,
          null,
          1,
          productType,
          availabilityName,
          availability
        )
      );
    }

    const productsDataFromQuery = await Promise.all(searchResultDataPromiser);
    const productsWrapper = this._prepareProductWrapperData(
      productsDataFromQuery[0]
    );
    const transformedProducts = productsWrapper.map((productWrapper) => {
      productWrapper.product = productTransform.transform(
        productWrapper.product
      );
      return productWrapper;
    });
    let counts = null;
    if (hasCounts) {
      counts = hasTotalPrices
        ? productsDataFromQuery[2]
        : productsDataFromQuery[1];
    }
    let nextPageCursor = null;
    let prevPageCursor = null;
    if (productsDataFromQuery[0].length !== 0) {
      // prepare first time and later use it in forthcoming request
      const { firstPageId, lastPageId } = this.getFirstPageAndLastPageId(
        offsetCursor,
        productsDataFromQuery
      );
      nextPageCursor = this._getNextPageCursor(
        productsWrapper,
        firstPageId,
        lastPageId
      );
      prevPageCursor = this._getPrevPageCursor(
        productsWrapper,
        firstPageId,
        lastPageId
      );
    }
    return {
      counts,
      isFirstPageReached: prevPageCursor === null ? true : false,
      isFromCache: false,
      isLastPageReached: nextPageCursor === null ? true : false,
      lastPageCursor:
        offsetCursor === 'last-page-cursor' ? null : 'last-page-cursor',
      nextPageCursor,
      prevPageCursor: !offset && !offsetCursor ? null : prevPageCursor,
      prices: hasTotalPrices === true ? productsDataFromQuery[1] : null,
      products: transformedProducts
    };
  }

  /**
   * This method returns only the metadata for the SearchQuery/RulesList
   * @param parsedSearchQuery Parsed Search query
   * @param options will have hasCounts. hasTotalPrice and availabilityName and availabilityStatus
   * @returns metadata { counts, prices }
   */
  public async getSearchMetadata(
    parsedSearchQuery: ISearchQuery[],
    options: ISearchQueryMetaDataParams
  ): Promise<ISearchRespMetadata> {
    const parsedQueryWithAvailability = this._getQueryWithAvailability(
      parsedSearchQuery,
      options.availabilityName,
      options.availabilityStatus,
      options.availability
    );
    // searchMetadataPromiser holds two promise to resolve
    // first one for Counts and totalPrices both are initialized with the null promiser.
    // Irrespective of hasCounts true or false we need to make getSearchResultCount
    // to handle 404 error
    const searchMetadataPromiser = [
      this.getSearchResultCount(parsedQueryWithAvailability),
      Promise.resolve(null) // Place holder for TotalPrice promiser
    ];
    // Replace TotalPrice placeholder with getSearchResultPrices if the hasTotalPrices true
    if (options.hasTotalPrices === true) {
      searchMetadataPromiser[1] = this.getSearchResultPrices(
        parsedQueryWithAvailability
      );
    }
    const searchMetadata = await Promise.all(searchMetadataPromiser);
    const totalCount = searchMetadata[0].find(
      (count) => count.type === 'Total'
    );
    if (totalCount.count === 0) {
      throw new AppError('Products not found.', 404);
    }
    return {
      counts: options.hasCounts ? searchMetadata[0] : null,
      prices: searchMetadata[1]
    };
  }
  public _getQueryWithAvailability(
    searchQueryParserResult: ISearchQuery[],
    availabilityName?: string,
    availabilityStatus?: AvailabilityStatus,
    availability?: IAvailability | IAvailabilityArray[]
  ): ISearchQuery[] {
    log.debug('_getQueryWithAvailability:: ');
    let availabilityQuery = null;
    if (Array.isArray(availability)) {
      const availabilitySubQuery = [];
      availability.forEach((avFilter) => {
        availabilitySubQuery.push({
          $elemMatch: {
            name: avFilter.name,
            status: _.has(avFilter, 'status.ALL')
              ? { $all: avFilter.status.ALL }
              : { $in: avFilter.status.IN }
          }
        });
      });

      availabilityQuery = {
        availability: {
          $all: availabilitySubQuery
        }
      };
    } else if (availabilityName && availabilityStatus) {
      availabilityQuery = {
        availability: {
          $elemMatch: {
            name: availabilityName,
            status: { $all: availabilityStatus }
          }
        }
      };
    } else if (availabilityName) {
      availabilityQuery = { 'availability.name': availabilityName };
    }
    if (availabilityQuery) {
      searchQueryParserResult = searchQueryParserResult.map((res) => {
        res.rules = { $and: [res.rules, availabilityQuery] };
        return res;
      });
    }
    return searchQueryParserResult;
  }

  private getFirstPageAndLastPageId(
    offsetCursor: string,
    productsDataFromQuery
  ): { firstPageId: string; lastPageId: string } {
    let lastPageId = null;
    let firstPageId = null;
    if (!offsetCursor || offsetCursor === 'last-page-cursor') {
      if (!offsetCursor) {
        lastPageId =
          productsDataFromQuery[productsDataFromQuery.length - 1][0]._id;
        firstPageId = productsDataFromQuery[0][0]._id;
      } else {
        firstPageId =
          productsDataFromQuery[productsDataFromQuery.length - 1][0]._id;
        lastPageId = productsDataFromQuery[0].slice(-1)[0]._id;
      }
    } else {
      firstPageId = offsetCursor.split(':')[0];
      lastPageId = offsetCursor.split(':')[1];
    }
    return { firstPageId, lastPageId };
  }

  private _prepareProductWrapperData(
    products: StorageModel.Product[]
  ): IProductWrapper[] {
    return products.map((product) => {
      const availability = product.availability ? product.availability : [];
      delete product['availability'];
      return {
        availability,
        product
      };
    });
  }

  private _getNextPageCursor(
    products: Array<{ product: StorageModel.Product }>,
    fpId,
    lpId
  ): string {
    if (products && products.length > 0) {
      const textToAppend = 'asc';
      let cursor = _.get(products[products.length - 1], 'product._id', null);
      if (cursor === lpId) cursor = null;
      return `${fpId}:${lpId}:${cursor}_${textToAppend}`;
    }
    return null;
  }

  private _getPrevPageCursor(
    products: Array<{ product: StorageModel.Product }>,
    fpId,
    lpId
  ): string {
    if (products && products.length > 0) {
      const textToAppend = 'desc';
      const cursor = _.get(products[0], 'product._id', null);
      if (cursor === fpId) return null;
      else return `${fpId}:${lpId}:${cursor}_${textToAppend}`;
    }
    return null;
  }

  private _getQueryWithOffsetCursor(
    searchQueryParserResult: ISearchQuery[],
    offsetCursorValue: string
  ): ISearchQuery[] {
    log.debug('_getQueryWithOffsetCursor:: ');
    let sortOperator = '$gt';
    if (offsetCursorValue) {
      const offsetCursorArrForColon = offsetCursorValue.split(':');
      const offsetCursorArr =
        offsetCursorArrForColon[offsetCursorArrForColon.length - 1].split('_');
      sortOperator = offsetCursorArr[1] === 'asc' ? '$gt' : '$lt';
      offsetCursorValue = offsetCursorArr[0];
      const offsetCursorQuery = {
        _id: { [`${sortOperator}`]: offsetCursorValue }
      };
      searchQueryParserResult = searchQueryParserResult.map((res) => {
        res.rules = { $and: [res.rules, offsetCursorQuery] };
        return res;
      });
    }
    return searchQueryParserResult;
  }

  private _calculateTotalProductPrices(
    productsPrices: IProductsTotalPrice[][]
  ): IProductsTotalPrice[] {
    return productsPrices.reduce(
      (
        totalPrices: IProductsTotalPrice[],
        productPrices: IProductsTotalPrice[]
      ) => {
        productPrices.forEach((productPrice: IProductsTotalPrice) => {
          const matchingTotalPriceIndex = totalPrices.findIndex(
            (totalPrice) => {
              return (
                totalPrice.currency === productPrice.currency &&
                totalPrice.priceTypeCode === productPrice.priceTypeCode
              );
            }
          );
          if (matchingTotalPriceIndex > -1) {
            totalPrices[matchingTotalPriceIndex].price += productPrice.price;
            totalPrices[matchingTotalPriceIndex].productsCount +=
              productPrice.productsCount;
          } else {
            totalPrices.push(productPrice);
          }
        });
        return totalPrices;
      },
      []
    );
  }
  private async getSearchResults(
    searchQueryParserResult: ISearchQuery[],
    offset: number,
    offsetCursor: string,
    limit: number,
    productType: StorageModel.ProductType,
    availabilityName: string = null,
    availability?: any
  ): Promise<any[]> {
    log.debug(
      'getSearchResults:: Fetching data from DB',
      JSON.stringify({ limit, offset, productType })
    );

    const filteredSearchQuery = searchQueryParserResult.find(
      (sQuery) => sQuery.type === productType
    );
    // get the projections if not use ['_id'] as default
    const projections: string[] =
      Object.prototype.hasOwnProperty.call(filteredSearchQuery, 'attributes') &&
      filteredSearchQuery.attributes.length > 0
        ? filteredSearchQuery.attributes
        : ['_id'];
    let sortOrder = 'asc';
    // Default sort order 'asc'. If offsetCursor is 'last-page-cursor'
    // change sort order to desc as it is the last page.
    const cursorAndSortOrderResult =
      offsetCursor && this.getCursorAndSortOrder(offsetCursor, sortOrder);
    if (cursorAndSortOrderResult) {
      sortOrder = cursorAndSortOrderResult.sortOrder;
      offsetCursor = cursorAndSortOrderResult.offsetCursor;
    }
    const productsRuleRequest: IProductsRuleRequest = {
      availability,
      availabilityName,
      limit,
      offset,
      offsetCursor,
      productType: filteredSearchQuery.type,
      projections,
      rules: filteredSearchQuery.rules,
      sortOrder
    };
    const products = await productV4DAO.getProductsByRule(productsRuleRequest);
    if (offsetCursor && offsetCursor === 'last-page-cursor') {
      // reverse original products
      // this is only done for specific case when offset cursor is last-page-cursor
      products.reverse();
    }
    const asstMediaProjections = projections.filter((field) => {
      if (!field.includes('associatedMedia')) {
        return false;
      }
      const splitedFields = field.split('.');
      splitedFields.shift();
      return (
        field === 'associatedMedia' ||
        associatedMediaV4Service.responseModelProjections.includes(
          splitedFields.join()
        )
      );
    });

    // need to add associatedMedia fields for projections
    if (asstMediaProjections.length > 0) {
      // fetch the associatedMedia products here.
      const productsIdData = products.map((product) => product._id);
      const asstMedias =
        await associatedMediaV4Service.getAsstMediasByParentIds(productsIdData);
      products.forEach((product) => {
        product['associatedMedia'] = asstMedias
          .filter((asstMedia) => asstMedia.parentId === product._id)
          .map((asstMedia) => {
            delete asstMedia.parentId;
            if (asstMediaProjections.includes('associatedMedia')) {
              return asstMedia;
            }
            const newAsstMedia = {};
            asstMediaProjections.forEach((projection) => {
              const asstMediaProperty = projection.split('.')[1];
              newAsstMedia[asstMediaProperty] = _.get(
                asstMedia,
                asstMediaProperty
              );
            });
            return newAsstMedia;
          });
      });
      log.warn(`getSearchResults Query Api looking for associatedMedia.`);
    }
    return products;
  }
  private async getSearchResultPrices(
    searchQueryParserResult: ISearchQuery[]
  ): Promise<IProductsTotalPrice[]> {
    const productsPricesPromiser = searchQueryParserResult.map(
      (sQuery): Promise<IProductsTotalPrice[]> => {
        return productV4DAO.getProductsPriceByRules(sQuery.type, sQuery.rules);
      }
    );
    const productsPrices: IProductsTotalPrice[][] = await Promise.all(
      productsPricesPromiser
    );
    return this._calculateTotalProductPrices(productsPrices);
  }

  private getCursorAndSortOrder(
    offsetCursor: string,
    sortOrder: string
  ): {
    offsetCursor: string;
    sortOrder: string;
  } {
    if (offsetCursor !== 'last-page-cursor') {
      const offsetCursorArrForColon = offsetCursor.split(':');
      const offsetCursorArr =
        offsetCursorArrForColon[offsetCursorArrForColon.length - 1].split('_');
      sortOrder = offsetCursorArr[1];
      offsetCursor = offsetCursorArr[0];
    } else {
      sortOrder = 'desc';
    }
    return { offsetCursor, sortOrder };
  }

  private async getSearchResultCount(
    searchQueryParserResult: ISearchQuery[]
  ): Promise<IResultCount[]> {
    const productsCountPromiser = searchQueryParserResult.map(
      (sQuery): Promise<number> => {
        return productV4DAO.getProductsCountByRule(sQuery.type, sQuery.rules);
      }
    );
    return Promise.all(productsCountPromiser).then((counts) => {
      const totalCount: IResultCount = {
        count: 0,
        type: 'Total'
      };
      const productsCount = counts.map((count: number, index: number) => {
        totalCount.count += count;
        const type = searchQueryParserResult[index]
          .type as IResultCount['type'];
        return { count, type };
      });
      productsCount.push(totalCount);
      return Promise.resolve(productsCount);
    });
  }
}
export const searchV4Service = new SearchV4Service();
