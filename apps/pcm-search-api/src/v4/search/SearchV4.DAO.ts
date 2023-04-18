import { StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import Logger from '../../utils/LoggerUtil';

import esClient from '../utils/ESConnectionUtils';
import { Config } from '../../config/config';
import { IProductsRuleRequest } from '../model/interfaces/productRequest';

const log = Logger.getLogger('SearchV4DAO');

class SearchV4DAO {
  public async getProductsCountByRule(
    productType: string,
    rule: any
  ): Promise<number> {
    log.debug(`getProductsCount:: `, JSON.stringify({ productType, rule }));
    const { body, statusCode } = await esClient.count({
      body: {
        query: rule
      },
      index: this.getIndexByProductType(productType)
    });
    return body.count;
  }

  public async getProductsByRule(
    productsRuleRequest: IProductsRuleRequest
  ): Promise<StorageModel.Product[]> {
    return this.prepareProductsRulesQuery(productsRuleRequest);
  }

  public async getProductsPriceByRules(
    productType: string,
    rules: any
  ): Promise<any> {
    log.debug(
      `getProductsPriceByRules:: `,
      JSON.stringify({ productType, rules })
    );
    return this._getProductsPriceByRules(rules, productType);
  }

  private async prepareProductsRulesQuery(
    productsRuleRequest: IProductsRuleRequest
  ): Promise<any> {
    const {
      productType,
      rules,
      projections,
      availabilityName,
      offset,
      offsetCursor,
      limit,
      sortOrder
    } = productsRuleRequest;
    log.debug(
      `getProducts:: `,
      JSON.stringify({
        availabilityName,
        limit,
        offset,
        offsetCursor,
        projections,
        rules,
        sortOrder
      })
    );
    log.info(`getProducts:: inputQuery`, JSON.stringify({ rules }));
    const clientReqBody = {
      _source: projections,
      body: {
        query: productsRuleRequest.rules,
        sort: [
          {
            _score: sortOrder,
            'tieBreakerId.keyword': sortOrder
          }
        ]
      },

      index: this.getIndexByProductType(productType),
      size: limit
    };
    const searchAfterParams =
      offsetCursor &&
      offsetCursor !== 'last-page-cursor' &&
      offsetCursor.split('_');
    if (offsetCursor && offsetCursor !== 'last-page-cursor') {
      clientReqBody.body['search_after'] = searchAfterParams;
    }
    const { body, statusCode } = await esClient.search(clientReqBody);
    return body.hits.hits;
  }

  private async _getProductsPriceByRules(
    productsRuleRequest: any,
    productType: string
  ): Promise<any> {
    const priceFilter = {
      aggs: {
        prices: {
          aggs: {
            filter_price: {
              aggs: {
                priceType: {
                  aggs: {
                    priceTypeCode: {
                      aggs: {
                        currency: {
                          aggs: {
                            price: {
                              sum: {
                                field: 'prices.price'
                              }
                            }
                          },
                          terms: {
                            field: 'prices.currency.keyword'
                          }
                        }
                      },
                      terms: {
                        field: 'prices.priceTypeCode.keyword'
                      }
                    }
                  },
                  terms: {
                    field: 'prices.priceType.keyword'
                  }
                }
              },
              filter: {
                bool: {
                  filter: [
                    {
                      term: {
                        'prices.priceTypeCode.keyword': 'BYO'
                      }
                    },
                    {
                      terms: {
                        'prices.currency.keyword': ['GBP', 'USD']
                      }
                    }
                  ]
                }
              }
            }
          },
          nested: {
            path: 'prices'
          }
        }
      },
      size: 0
    };
    const { body, statusCode } = await esClient.search({
      body: {
        query: productsRuleRequest,
        ...priceFilter
      },
      index: this.getIndexByProductType(productType)
    });
    return body.aggregations.prices;
  }

  private getIndexByProductType(type: string): string {
    return Config.getPropertyValue(`${type}Index`);
  }
}

export const searchV4DAO = new SearchV4DAO();
