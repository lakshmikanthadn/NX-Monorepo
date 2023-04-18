import { StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import * as _ from 'lodash';
import Logger from '../../utils/LoggerUtil';

import { AppError } from '../../model/AppError';
import { IProductsTotalPrice } from '../model/interfaces/ProductsTotalPrice';
import { IProductWrapper } from '../model/interfaces/ProductWrapper';
import {
  IResultCount,
  ISearchProductResp,
  IAvailability,
  IAvailabilityArray,
  AvailabilityStatus,
  ISearchQueryParams,
  ISearchQueryMetaDataParams,
  ISearchQuery
} from '../model/interfaces/SearchResult';
import { searchV4DAO } from './SearchV4.DAO';
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
      availability,
      offsetCursor,
      projectedFields
    } = searchQueryParams;
    let limit = searchQueryParams.limit;
    const searchQueryParserResult: ISearchQuery[] =
      searchQueryParams.searchQueryParserResult;

    if (!searchQueryParserResult || searchQueryParserResult.length <= 0) {
      throw new AppError('Invalid search query', 400, {
        searchQueryParserResult
      });
    }
    let countResp = [];
    let count;
    if (offsetCursor === 'last-page-cursor') {
      countResp = await this.getSearchResultCount(searchQueryParserResult);
      count = countResp[1].count;
      limit = count % limit || limit;
    }
    const searchResultDataPromiser = [
      this.getSearchResults(
        searchQueryParserResult,
        offset,
        offsetCursor,
        limit,
        productType,
        availabilityName,
        projectedFields,
        availability
      )
    ];
    if (hasTotalPrices === true) {
      searchResultDataPromiser.push(
        this.getSearchResultPrices(searchQueryParserResult)
      );
    }
    if (hasCounts === true) {
      searchResultDataPromiser.push(
        this.getSearchResultCount(searchQueryParserResult)
      );
    }

    // Call it for first time for getting last page _id. Later use it in every request
    if (typeof offset === 'number' && offset === 0 && !offsetCursor) {
      const offsetCursor = 'last-page-cursor';
      searchResultDataPromiser.push(
        this.getSearchResults(
          searchQueryParserResult,
          null,
          offsetCursor,
          1,
          productType,
          null,
          ['tieBreakerId']
        )
      );
    }
    // Call it to get first page _id when starting from opposite. Later use it in every request
    if (offsetCursor === 'last-page-cursor') {
      searchResultDataPromiser.push(
        this.getSearchResults(
          searchQueryParserResult,
          0,
          null,
          1,
          productType,
          null,
          ['tieBreakerId']
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

    let lastPageId = null;
    let firstPageId = null;
    // prepare first time and later use it in forthcoming request
    if (!offsetCursor || offsetCursor === 'last-page-cursor') {
      if (!offsetCursor) {
        lastPageId =
          productsDataFromQuery[productsDataFromQuery.length - 1][0]._source
            .tieBreakerId;
        firstPageId = productsDataFromQuery[0][0]._id;
      } else {
        firstPageId =
          productsDataFromQuery[productsDataFromQuery.length - 1][0]._source
            .tieBreakerId;
        lastPageId = productsDataFromQuery[0].slice(-1)[0]._id;
      }
    } else {
      firstPageId = offsetCursor.split(':')[0];
      lastPageId = offsetCursor.split(':')[1];
    }
    const nextPageCursor = this._getNextPageCursor(
      productsWrapper,
      firstPageId,
      lastPageId
    );
    const prevPageCursor = this._getPrevPageCursor(
      productsWrapper,
      firstPageId,
      lastPageId
    );
    // delete searchAfterParams once next/prev cursor is prepared
    transformedProducts.forEach((transformedProduct) => {
      delete transformedProduct.product['searchAfterParams'];
    });
    return {
      counts,
      isFirstPageReached: prevPageCursor === null ? true : false,
      isFromCache: false,
      isLastPageReached: nextPageCursor === null ? true : false,
      lastPageCursor:
        offsetCursor === 'last-page-cursor' ? null : 'last-page-cursor',
      nextPageCursor:
        offsetCursor === 'last-page-cursor' ? null : nextPageCursor,
      prevPageCursor: !offset && !offsetCursor ? null : prevPageCursor,
      prices: hasTotalPrices === true ? productsDataFromQuery[1] : null,
      products: transformedProducts
    };
  }

  // /**
  //  * This method returns only the metadata for the SearchQuery/RulesList
  //  * @param parsedSearchQuery Parsed Search query
  //  * @param options will have hasCounts. hasTotalPrice and availabilityName and availabilityStatus
  //  * @returns metadata { counts, prices }
  //  */
  public async getSearchMetadata(
    parsedSearchQuery: ISearchQuery[],
    options: ISearchQueryMetaDataParams
  ): Promise<any> {
    // searchMetadataPromiser holds two promise to resolve
    // first one for Counts and totalPrices both are initialized with the null promiser.
    // Irrespective of hasCounts true or false we need to make getSearchResultCount
    // to handle 404 error
    const searchMetadataPromiser = [
      this.getSearchResultCount(parsedSearchQuery),
      Promise.resolve(null) // Place holder for TotalPrice promiser
    ];
    // Replace TotalPrice placeholder with getSearchResultPrices if the hasTotalPrices true
    if (options.hasTotalPrices === true) {
      searchMetadataPromiser[1] = this.getSearchResultPrices(parsedSearchQuery);
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
    availability?: IAvailability | IAvailabilityArray
  ): any[] {
    log.debug('_getQueryWithAvailability:: ');
    let availabilityQuery = null;
    if (Array.isArray(availability)) {
      const availabilitySubQuery = [];
      availability.forEach((avFilter) => {
        availabilitySubQuery.push({
          term: {
            'availability.name.keyword': avFilter.name
          }
        });
        if (_.has(avFilter, 'status.ALL')) {
          availabilitySubQuery.push({
            terms_set: {
              'availability.status.keyword': {
                minimum_should_match_script: {
                  source: 'params.num_terms'
                },
                terms: avFilter.status.ALL
              }
            }
          });
        } else {
          availabilitySubQuery.push({
            terms: { 'availability.status.keyword': avFilter.status.IN }
          });
        }
      });
      availabilityQuery = {
        nested: {
          inner_hits: {},
          path: 'availability',
          query: {
            bool: {
              filter: availabilitySubQuery
            }
          }
        }
      };
    } else if (availabilityName && availabilityStatus) {
      const availabilitySubQuery = [];
      availabilitySubQuery.push(
        {
          term: {
            'availability.name.keyword': availabilityName
          }
        },
        {
          terms_set: {
            'availability.status.keyword': {
              minimum_should_match_script: {
                source: 'params.num_terms'
              },
              terms: availabilityStatus
            }
          }
        }
      );
      availabilityQuery = {
        nested: {
          inner_hits: {},
          path: 'availability',
          query: {
            bool: {
              filter: availabilitySubQuery
            }
          }
        }
      };
    } else if (availabilityName) {
      const availabilitySubQuery = [];
      availabilitySubQuery.push({
        term: {
          'availability.name.keyword': availabilityName
        }
      });
      availabilityQuery = {
        nested: {
          inner_hits: {},
          path: 'availability',
          query: {
            bool: {
              filter: availabilitySubQuery
            }
          }
        }
      };
    }
    if (availabilityQuery) {
      searchQueryParserResult = searchQueryParserResult.map((res) => {
        const finalQueryWithAvailability = {};
        if (res.rules.bool && res.rules.bool.filter) {
          res.rules.bool.filter.push(availabilityQuery);
        } else if (res.rules.bool && !res.rules.bool.filter) {
          res.rules.bool['filter'] = [availabilityQuery];
        } else {
          finalQueryWithAvailability['bool'] = {
            filter: [availabilityQuery, res.rules]
          };
          res.rules = finalQueryWithAvailability;
        }
        return res;
      });
    }
    return searchQueryParserResult;
  }

  private _prepareProductWrapperData(products: any[]): IProductWrapper[] {
    return products.map((product) => {
      const isAvailabilityFiltered =
        product.inner_hits && product.inner_hits.availability;
      let availability;
      if (isAvailabilityFiltered) {
        availability = product.inner_hits.availability.hits.hits[0]._source
          ? [product.inner_hits.availability.hits.hits[0]._source]
          : [];
      } else {
        availability = product['_source']['availability']
          ? product['_source']['availability']
          : [];
      }
      delete product['_source']['availability'];
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
      const textToAppend = 'desc';
      const searchAfterParams = _.get(
        products[products.length - 1],
        'product.searchAfterParams',
        null
      );
      const cursor = searchAfterParams[1];
      if (cursor === lpId) return null;
      else {
        const nextPageCursor = searchAfterParams.join('_');
        return `${fpId}:${lpId}:${nextPageCursor}_${textToAppend}`;
      }
    }
    return null;
  }

  private _getPrevPageCursor(
    products: Array<{ product: StorageModel.Product }>,
    fpId,
    lpId
  ): string {
    if (products && products.length > 0) {
      const textToAppend = 'asc';
      const searchAfterParams = _.get(
        products[0],
        'product.searchAfterParams',
        null
      );
      const cursor = searchAfterParams[1];
      if (cursor === fpId) return null;
      else {
        const prevPageCursor = searchAfterParams.join('_');
        return `${fpId}:${lpId}:${prevPageCursor}_${textToAppend}`;
      }
    }
    return null;
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
    projectionFields: string[],
    availability?: IAvailability | IAvailabilityArray
  ): Promise<any[]> {
    log.debug(
      'getSearchResults:: Fetching data from DB',
      JSON.stringify({ limit, offset, productType })
    );

    // Get the projections if nothing is there, use ['_id'] as default
    const projections: string[] =
      projectionFields && projectionFields.length > 0
        ? projectionFields
        : ['_id'];
    projectionFields &&
      projectionFields.filter((field) => {
        if (field.includes('associatedMedia')) {
          throw new AppError('Invalid attribute associatedMedia', 400);
        }
      });
    let sortOrder = 'desc';
    // change default sort order 'asc' if custom offsetCursor present
    // if offsetCursor is 'last-page-cursor' change sort order
    // to desc as it is the last page
    if (offsetCursor) {
      if (offsetCursor !== 'last-page-cursor') {
        const offsetCursorArrForColon = offsetCursor.split(':');
        const offsetCursorArr =
          offsetCursorArrForColon[offsetCursorArrForColon.length - 1].split(
            '_'
          );
        sortOrder = offsetCursorArr[2];
        offsetCursor = offsetCursorArr[0].concat('_', offsetCursorArr[1]);
      } else {
        sortOrder = 'asc';
      }
    }
    const productsRuleRequest: IProductsRuleRequest = {
      availability,
      availabilityName,
      limit,
      offset,
      offsetCursor,
      productType: searchQueryParserResult[0].type,
      projections: projections,
      rules: searchQueryParserResult[0].rules,
      sortOrder
    };
    const products = await searchV4DAO.getProductsByRule(productsRuleRequest);
    if (Array.isArray(products) && products.length !== 0) {
      if (
        offsetCursor &&
        (offsetCursor === 'last-page-cursor' || sortOrder === 'asc')
      ) {
        // reverse original products
        // this is only done for specific case when offset cursor is last-page-cursor
        products.reverse();
      }
      return products;
    } else {
      throw new AppError('Product not found.', 404);
    }
  }

  private async getSearchResultPrices(
    searchQueryParserResult: ISearchQuery[]
  ): Promise<IProductsTotalPrice[]> {
    const productsPricesPromiser = searchQueryParserResult.map(
      async (sQuery): Promise<any> => {
        const rawPrice = await searchV4DAO.getProductsPriceByRules(
          sQuery.type,
          sQuery.rules
        );
        return this.formatPrice(rawPrice);
      }
    );
    const productsPrices: IProductsTotalPrice[][] = await Promise.all(
      productsPricesPromiser
    );
    return this._calculateTotalProductPrices(productsPrices);
  }

  private formatPrice(prices) {
    const filter_price = prices.filter_price;
    const priceBucket = filter_price.priceType.buckets;
    if (priceBucket && Array.isArray(priceBucket) && priceBucket.length === 0)
      return [];
    const priceType = filter_price.priceType.buckets[0].key;
    const priceTypeCode =
      filter_price.priceType.buckets[0].priceTypeCode.buckets[0].key;
    return filter_price.priceType.buckets[0].priceTypeCode.buckets[0].currency.buckets.map(
      (curr) => {
        return {
          currency: curr.key,
          price: curr.price.value,
          priceType: priceType,
          priceTypeCode: priceTypeCode,
          productsCount: curr.doc_count
        };
      }
    );
  }

  private async getSearchResultCount(
    searchQueryParserResult: ISearchQuery[]
  ): Promise<IResultCount[]> {
    const productsCountPromiser = searchQueryParserResult.map(
      (sQuery): Promise<number> => {
        return searchV4DAO.getProductsCountByRule(sQuery.type, sQuery.rules);
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
