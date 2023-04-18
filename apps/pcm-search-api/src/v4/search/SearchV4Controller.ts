import { StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import { Request, Response } from 'express';
import * as newrelic from 'newrelic';

import Logger from '../../utils/LoggerUtil';
import { Config } from '../../config/config';
import { AppError } from '../../model/AppError';
import { APIResponse } from '../../utils/APIResponse';
import { esQueryParser } from '../../utils/QueryParser';
import {
  IAvailabilityArray,
  IAvailability,
  ISearchQuery,
  AvailabilityStatus,
  ISearchRespMetadata,
  ISearchProductResp
} from '../model/interfaces/SearchResult';
import { countAPIValidator } from '../validator/requestValidator/CountAPIValidator';
import { queryAPIValidator } from '../validator/requestValidator/QueryAPIValidator';
import { searchV4Service } from './SearchV4Service';

const log = Logger.getLogger('SearchV4Controller');

class SearchV4Controller {
  public async handlePostProduct(req: Request, res: Response): Promise<void> {
    try {
      const requestPayload = req.body;
      const action = requestPayload.action;
      newrelic.setTransactionName(`products#action=${action}`);
      switch (action) {
        case 'query':
          this.searchProducts(req, res);
          break;
        case 'count':
          this.getSearchMetadata(req, res);
          break;
        // This is for internal usage only. Do not add to swagger/confluence/contract-doc
        case 'parseQuery':
          searchV4Controller.parseSearchQuery(req, res);
          break;
        default:
          throw new AppError(`Invalid action: ${action}`, 400);
      }
    } catch (error) {
      APIResponse.failure(res, error);
    }
  }

  /**
   * Developed for internal usage only
   * This method is to just parse rulesList
   * and send the parsed ruleList in response
   * @param request
   * @param response
   */
  public async parseSearchQuery(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const availability: IAvailability | IAvailabilityArray =
        request.body.availability;
      let availabilityName: string;
      let availabilityStatus: AvailabilityStatus;
      if (availability && !Array.isArray(availability)) {
        const { name, status } = availability;
        availabilityName = name;
        availabilityStatus = status;
      }
      let searchQueryParserResult = this.mapAndParseSearchQuery(
        request.body.rulesList
      );
      // TODO handle root level availability
      if (availability) {
        searchQueryParserResult = searchV4Service._getQueryWithAvailability(
          searchQueryParserResult,
          availabilityName,
          availabilityStatus,
          availability
        );
      }
      APIResponse.success(response, searchQueryParserResult);
    } catch (parserError) {
      Logger.handleErrorLog(log, 'parseSearchQuery: ', parserError);
      APIResponse.failure(response, new AppError(parserError.message, 400));
    }
  }

  /**
   * @swagger
   * /products/search#action=query:
   *   post:
   *     tags:
   *     - Miscellaneous
   *     summary: To query products based on rules
   *     description: |
   *      This endpoint is used to query the products Based the rules.
   *        - Response is paginated.
   *        - Use limit parameter(in-body) to limit the number of products.
   *        - Use attributes parameter(in-body) to project only required fields.
   *        - By default returns only _id for each product.
   *        - Each nested filter has to be enclosed within a BEGIN and END separator.
   *     requestBody:
   *       required: true
   *       content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/requestBodies/ActionQuery'
   *     responses:
   *       200:
   *        description: Response object of metadata and data blocks based on rules provided
   *        content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/QueryRespBody'
   *       404:
   *         $ref: '#/components/responses/NotFoundBasic'
   *       400:
   *         $ref: '#/components/responses/BadRequestBasic'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedBasic'
   *       403:
   *         $ref: '#/components/responses/ForbiddenBasic'
   */
  public async searchProducts(
    request: Request,
    response: Response
  ): Promise<void> {
    const searchPayload = request.body;
    try {
      queryAPIValidator.validateSearch(request);
      const offset: number = parseInt(searchPayload.offset, 10)
        ? parseInt(searchPayload.offset, 10)
        : 0;
      const limit: number = parseInt(searchPayload.limit, 10)
        ? parseInt(searchPayload.limit, 10)
        : Config.getPropertyValue('defaultBatchSizeV4');
      const offsetCursor: string = searchPayload.offsetCursor;
      const hasTotalPrices: boolean = searchPayload.hasTotalPrices;
      const hasCounts: boolean = searchPayload.hasCounts;
      const productType: StorageModel.ProductType =
        searchPayload.rulesList[0].type;
      const projectedFields = searchPayload.rulesList[0].attributes;
      const searchQuery: ISearchQuery[] = searchPayload.rulesList;
      const cacheId: string = searchPayload['@id'];
      // add validation for sortBy and order
      const sortBy: string = searchPayload.sortBy;
      const sortOrder: string = searchPayload.sortOrder;
      // add validation for availability as well
      const availability: IAvailability | IAvailabilityArray =
        searchPayload.availability;
      let availabilityName: string;
      let availabilityStatus: AvailabilityStatus;
      if (availability && !Array.isArray(availability)) {
        const { name, status } = availability;
        availabilityName = name;
        availabilityStatus = status;
      }
      log.debug('searchProducts: ', {
        hasCounts,
        hasTotalPrices,
        limit,
        offset,
        productType,
        sortBy,
        sortOrder
      });

      let searchQueryParserResult: ISearchQuery[] = [];
      try {
        searchQueryParserResult = this.mapAndParseSearchQuery(searchQuery);
      } catch (parserError) {
        throw new AppError(parserError.message, 400);
      }

      // TODO handle root level availability
      if (availability) {
        searchQueryParserResult = searchV4Service._getQueryWithAvailability(
          searchQueryParserResult,
          availabilityName,
          availabilityStatus,
          availability
        );
      }
      log.debug(
        'searchQueryParserResult::',
        JSON.stringify(searchQueryParserResult)
      );
      return searchV4Service
        .searchProducts({
          availability,
          availabilityName,
          availabilityStatus,
          cacheId,
          hasCounts,
          hasTotalPrices,
          limit,
          offset,
          offsetCursor,
          productType,
          projectedFields,
          searchQueryParserResult
        })
        .then((searchResult: ISearchProductResp) => {
          log.debug('searchProducts Results:::', JSON.stringify(searchResult));
          const products = searchResult.products;
          if (!(products && products.length > 0)) {
            throw new AppError('Products not found', 404);
          }
          // This to trim the price values to max two decimal numbers.
          if (searchResult && searchResult.prices) {
            searchResult.prices = searchResult.prices.map(
              (searchResultPrice) => {
                searchResultPrice.price = parseFloat(
                  searchResultPrice.price.toFixed(2)
                );
                return searchResultPrice;
              }
            );
          }
          const respMetadata = {
            counts: searchResult.counts,
            isFirstPageReached: searchResult.isFirstPageReached,
            isLastPageReached: searchResult.isLastPageReached,
            lastPageCursor: searchResult.lastPageCursor,
            limit,
            nextPageCursor: searchResult.nextPageCursor,
            offset,
            prevPageCursor: searchResult.prevPageCursor,
            prices: searchResult.prices,
            source: 'Elasticsearch',
            type: productType
          };
          const responseOb = { data: products, metadata: respMetadata };

          APIResponse.success(response, responseOb);
        })
        .catch((error) => {
          Logger.handleErrorLog(log, 'searchProducts: ', error);
          APIResponse.failure(response, error);
        });
    } catch (error) {
      Logger.handleErrorLog(log, 'searchProducts: ', error);
      APIResponse.failure(response, error);
    }
  }

  /**
   * @swagger
   * /products/search#action=count:
   *   post:
   *     tags:
   *     - Miscellaneous
   *     summary: To count products with a given set of criteria.
   *     description: To count specifically products and prices.
   *     requestBody:
   *       required: true
   *       content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/requestBodies/ActionCount'
   *     responses:
   *       200:
   *        description: Response object of only metadata block
   *        content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CountRespBody'
   *       404:
   *         $ref: '#/components/responses/NotFoundBasic'
   *       400:
   *         $ref: '#/components/responses/BadRequestBasic'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedBasic'
   *       403:
   *         $ref: '#/components/responses/ForbiddenBasic'
   */
  public async getSearchMetadata(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      countAPIValidator.validateCountApi(request);
      const { hasTotalPrices, hasCounts, availability } = request.body;
      let availabilityName: string;
      let availabilityStatus: AvailabilityStatus;
      if (availability && !Array.isArray(availability)) {
        const { name, status } = availability;
        availabilityName = name;
        availabilityStatus = status;
      }
      let searchQueryParserResult: ISearchQuery[];
      try {
        searchQueryParserResult = this.mapAndParseSearchQuery(
          request.body.rulesList
        );
      } catch (parserError) {
        Logger.handleErrorLog(log, 'getSearchMetadata: ', parserError);
        throw new AppError(parserError.message, 400);
      }
      if (availability) {
        searchQueryParserResult = searchV4Service._getQueryWithAvailability(
          searchQueryParserResult,
          availabilityName,
          availabilityStatus,
          availability
        );
      }
      return searchV4Service
        .getSearchMetadata(searchQueryParserResult, {
          availability,
          availabilityName,
          availabilityStatus,
          hasCounts,
          hasTotalPrices
        })
        .then((searchMetaData: ISearchRespMetadata) => {
          if (searchMetaData && searchMetaData.prices) {
            searchMetaData.prices = searchMetaData.prices.map(
              (searchResultPrice) => {
                searchResultPrice.price = parseFloat(
                  searchResultPrice.price.toFixed(2)
                );
                return searchResultPrice;
              }
            );
          }
          const respMetadata = {
            counts: searchMetaData.counts,
            prices: searchMetaData.prices
          };
          const responseOb = { data: null, metadata: respMetadata };
          APIResponse.success(response, responseOb);
        })
        .catch((error) => {
          Logger.handleErrorLog(log, 'getSearchMetadata', error);
          APIResponse.failure(response, error);
        });
    } catch (error) {
      Logger.handleErrorLog(log, 'getSearchMetadata', error);
      APIResponse.failure(response, error);
    }
  }

  public mapAndParseSearchQuery(searchQueries: ISearchQuery[]): ISearchQuery[] {
    const parsedQueries = esQueryParser.parse(searchQueries);
    return parsedQueries.map((query, index) => {
      return { ...searchQueries[index], rules: query };
    });
  }
}

export const searchV4Controller = new SearchV4Controller();
