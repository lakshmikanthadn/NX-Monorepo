import { assert, expect } from 'chai';
import { Request, Response } from 'express';
import * as mockExpressRequest from 'mock-express-request';
import * as mockExpressResponse from 'mock-express-response';
import * as sinon from 'sinon';

import { ISearchQuery } from '../model/interfaces/SearchResult';
import { countAPIValidator } from '../validator/requestValidator/CountAPIValidator';
import { searchV4Controller } from './SearchV4Controller';
import { searchV4Service } from './SearchV4Service';

function getStubData() {
  const request: Request = new mockExpressRequest();
  const response: Response = new mockExpressResponse();
  const responseMock = sinon.mock(response);
  const searchV4ServiceMock = sinon.mock(searchV4Service);
  const searchQueryParserResult = [
    {
      attributes: ['title', 'identifiers.isbn'],
      rules: {
        bool: {
          filter: [{ terms: { 'identifiers.isbn.keyword': ['some-isbn'] } }]
        }
      },
      type: 'book'
    }
  ];
  const searchServiceResponse = {
    counts: [
      {
        count: 1,
        type: 'book'
      },
      {
        count: 1,
        type: 'Total'
      }
    ],
    isFirstPageReached: true,
    isFromCache: false,
    isLastPageReached: false,
    lastPageCursor: 'last-page-cursor',
    limit: 1,
    nextPageCursor: 'firstPageId:lastPageId:nextPageId_asc',
    offset: 0,
    prevPageCursor: null,
    prices: [
      {
        currency: 'some-currency',
        price: 15,
        priceType: 'some-priceType',
        priceTypeCode: 'some-priceTypeCode',
        productsCount: 1
      }
    ],
    products: [
      {
        availability: [
          {
            errors: ['some-error'],
            name: 'some-channel',
            status: ['some-status']
          }
        ],
        product: {
          _id: 'some-uuid',
          identifiers: {
            isbn: 'some-isbn'
          },
          title: 'some-title'
        }
      }
    ],

    source: 'Elasticsearch',
    type: 'book'
  };
  request.body = {
    action: 'query',
    hasCounts: true,
    hasTotalPrices: true,
    limit: 1,
    offset: 0,
    rulesList: [
      {
        attributes: ['title', 'identifiers.isbn'],
        rules: [
          {
            position: 1,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 4,
            rule: {
              attribute: 'identifiers.isbn',
              relationship: 'IN',
              values: ['some-isbn']
            },
            type: 'criteria'
          },
          {
            position: 5,
            rule: {
              value: 'END'
            },
            type: 'separator'
          }
        ],
        type: 'book'
      }
    ]
  };
  return {
    request,
    response,
    responseMock,
    searchQueryParserResult,
    searchServiceResponse,
    searchV4ServiceMock
  };
}
describe('searchV4Controller', () => {
  it('should have all the methods', () => {
    expect(searchV4Controller).to.respondTo('searchProducts');
    expect(searchV4Controller).to.respondTo('getSearchMetadata');
    expect(searchV4Controller).to.respondTo('parseSearchQuery');
  });
  let stubData;
  beforeEach(() => {
    stubData = getStubData();
  });
  describe('parseSearchQuery', () => {
    it('should throw error when invalid rulesList is sent in request', (done) => {
      const stubData = getStubData();
      stubData.request.body = {
        ...stubData.request.body,
        rulesList: [{ rules: [{ key: 'value' }], type: 'book' }]
      };
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: `Invalid Input: invalid rules type :: undefined`
          }
        });
      stubData.searchV4ServiceMock.expects('searchProducts').never();
      searchV4Controller
        .parseSearchQuery(stubData.request, stubData.response)
        .then(() => {
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.searchV4ServiceMock.restore();
        });
    });
    it('should send parsed query when the ruleslist is valid', (done) => {
      const stubData = getStubData();
      const request = stubData.request;
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once();
      searchV4Controller
        .parseSearchQuery(request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
        });
    });
  });
  describe('handlePostProduct', () => {
    it('should go for valid scenario when action is query', (done) => {
      stubData.request.body = {
        action: 'query',
        apiVersion: '4.0.1'
      };
      const searchProductsSpy = sinon.spy(searchV4Controller, 'searchProducts');
      searchV4Controller
        .handlePostProduct(stubData.request, stubData.response)
        .then(() => {
          assert(searchProductsSpy.calledOnce);
          done();
        })
        .catch(done)
        .finally(() => {
          searchProductsSpy.restore();
        });
    });
    it('should go for valid scenario when action is count', (done) => {
      stubData.request.body = {
        action: 'count',
        apiVersion: '4.0.1'
      };
      const searchProductsSpy = sinon.spy(
        searchV4Controller,
        'getSearchMetadata'
      );
      searchV4Controller
        .handlePostProduct(stubData.request, stubData.response)
        .then(() => {
          assert(searchProductsSpy.calledOnce);
          done();
        })
        .catch(done)
        .finally(() => {
          searchProductsSpy.restore();
        });
    });
    it('should go for valid scenario when action is parseQuery', (done) => {
      stubData.request.body = {
        action: 'parseQuery',
        apiVersion: '4.0.1'
      };
      const searchProductsSpy = sinon.spy(
        searchV4Controller,
        'parseSearchQuery'
      );
      searchV4Controller
        .handlePostProduct(stubData.request, stubData.response)
        .then(() => {
          assert(searchProductsSpy.calledOnce);
          done();
        })
        .catch(done)
        .finally(() => {
          searchProductsSpy.restore();
        });
    });
    it('should throw error when action is not valid', (done) => {
      stubData.request.body = {
        action: 'invalid-action',
        apiVersion: '4.0.1'
      };
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: `Invalid action: ${stubData.request.body.action}`
          }
        });
      searchV4Controller
        .handlePostProduct(stubData.request, stubData.response)
        .then(() => {
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
        });
    });
  });
  describe('searchProducts', () => {
    it('should throw error when invalid rulesList is sent in request', (done) => {
      const stubData = getStubData();
      stubData.request.body = {
        ...stubData.request.body,
        rulesList: [{ rules: [{ key: 'value' }], type: 'book' }]
      };
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: `Invalid Input: invalid rules type :: undefined`
          }
        });
      stubData.searchV4ServiceMock.expects('searchProducts').never();
      searchV4Controller
        .searchProducts(stubData.request, stubData.response)
        .then(() => {
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.searchV4ServiceMock.restore();
        });
    });
    it('should throw 400 error when valid parameters not passed in the request', (done) => {
      const stubData = getStubData();
      stubData.request.body = {
        ...stubData.request.body,
        random: 'some-invalid'
      };
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: `Invalid parameters: random`
          }
        });
      stubData.searchV4ServiceMock.expects('searchProducts').never();
      searchV4Controller
        .searchProducts(stubData.request, stubData.response)
        .then(() => {
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.searchV4ServiceMock.restore();
        });
    });
    it('should throw Products not found when there is no products satisfying the given rules', (done) => {
      const stubData = getStubData();
      const request = stubData.request;
      const searchServiceResponse = stubData.searchServiceResponse;
      request.body.hasCounts = false;
      request.body.hasTotalPrices = false;
      searchServiceResponse.counts = null;
      searchServiceResponse.prices = null;
      searchServiceResponse.products = [];
      stubData.responseMock.expects('status').once().withArgs(404);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: { error: undefined, message: 'Products not found' }
        });

      stubData.searchV4ServiceMock
        .expects('searchProducts')
        .once()
        .withArgs({
          availability: undefined,
          availabilityName: undefined,
          availabilityStatus: undefined,
          cacheId: undefined,
          hasCounts: request.body.hasCounts,
          hasTotalPrices: request.body.hasTotalPrices,
          limit: request.body.limit,
          offset: request.body.offset,
          offsetCursor: undefined,
          productType: request.body.rulesList[0].type,
          projectedFields: request.body.rulesList[0].attributes,
          searchQueryParserResult: stubData.searchQueryParserResult
        })
        .resolves(searchServiceResponse);
      searchV4Controller
        .searchProducts(request, stubData.response)
        .then(() => {
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.searchV4ServiceMock.restore();
        });
    });
    it('should return the list of products satisfying the rule with availability info', (done) => {
      const stubData = getStubData();
      const request = stubData.request;
      request.body.offset = 0;
      const searchServiceResponse = stubData.searchServiceResponse;
      request.body.hasCounts = false;
      request.body.hasTotalPrices = false;
      searchServiceResponse.counts = null;
      searchServiceResponse.prices = null;
      const response = {
        data: searchServiceResponse.products,
        metadata: {
          counts: null,
          isFirstPageReached: true,
          isLastPageReached: false,
          lastPageCursor: 'last-page-cursor',
          limit: 1,
          nextPageCursor: 'firstPageId:lastPageId:nextPageId_asc',
          offset: 0,
          prevPageCursor: null,
          prices: null,
          source: 'Elasticsearch',
          type: 'book'
        }
      };
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(response);
      stubData.searchV4ServiceMock
        .expects('searchProducts')
        .once()
        .withArgs({
          availability: undefined,
          availabilityName: undefined,
          availabilityStatus: undefined,
          cacheId: undefined,
          hasCounts: request.body.hasCounts,
          hasTotalPrices: request.body.hasTotalPrices,
          limit: request.body.limit,
          offset: request.body.offset,
          offsetCursor: undefined,
          productType: request.body.rulesList[0].type,
          projectedFields: request.body.rulesList[0].attributes,
          searchQueryParserResult: stubData.searchQueryParserResult
        })
        .resolves(searchServiceResponse);
      searchV4Controller
        .searchProducts(request, stubData.response)
        .then(() => {
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.searchV4ServiceMock.restore();
        });
    });
    it(`should return the list of products satisfying the rule with availability info when
        availability is an array in request payload`, (done) => {
      const stubData = getStubData();
      const request = stubData.request;
      request.body.offset = 0;
      const searchServiceResponse = stubData.searchServiceResponse;
      request.body.hasCounts = false;
      request.body.hasTotalPrices = false;
      request.body.availability = [
        {
          errors: [],
          name: 'some-channel',
          status: {
            ALL: ['some-status']
          }
        }
      ];
      searchServiceResponse.counts = null;
      searchServiceResponse.prices = null;
      const response = {
        data: searchServiceResponse.products,
        metadata: {
          counts: null,
          isFirstPageReached: true,
          isLastPageReached: false,
          lastPageCursor: 'last-page-cursor',
          limit: 1,
          nextPageCursor: 'firstPageId:lastPageId:nextPageId_asc',
          offset: 0,
          prevPageCursor: null,
          prices: null,
          source: 'Elasticsearch',
          type: 'book'
        }
      };
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(response);
      const processedSearchQueryParserResult = [
        {
          attributes: ['title', 'identifiers.isbn'],
          rules: {
            bool: {
              filter: [
                { terms: { 'identifiers.isbn.keyword': ['some-isbn'] } },
                {
                  nested: {
                    inner_hits: {},
                    path: 'availability',
                    query: {
                      bool: {
                        filter: [
                          {
                            term: {
                              'availability.name.keyword': 'some-channel'
                            }
                          },
                          {
                            terms_set: {
                              'availability.status.keyword': {
                                minimum_should_match_script: {
                                  source: 'params.num_terms'
                                },
                                terms: ['some-status']
                              }
                            }
                          }
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },
          type: 'book'
        }
      ];
      stubData.searchV4ServiceMock
        .expects('searchProducts')
        .once()
        .withArgs({
          availability: request.body.availability,
          availabilityName: undefined,
          availabilityStatus: undefined,
          cacheId: undefined,
          hasCounts: request.body.hasCounts,
          hasTotalPrices: request.body.hasTotalPrices,
          limit: request.body.limit,
          offset: request.body.offset,
          offsetCursor: undefined,
          productType: request.body.rulesList[0].type,
          projectedFields: request.body.rulesList[0].attributes,
          searchQueryParserResult: processedSearchQueryParserResult
        })
        .resolves(searchServiceResponse);
      searchV4Controller
        .searchProducts(request, stubData.response)
        .then(() => {
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.searchV4ServiceMock.restore();
        });
    });
    it(`should return the list of products satisfying the rule with availability object info when
      availability is an object in request payload`, (done) => {
      const stubData = getStubData();
      const request = stubData.request;
      request.body.offset = 0;
      const searchServiceResponse = stubData.searchServiceResponse;
      request.body.hasCounts = false;
      request.body.hasTotalPrices = false;
      request.body.availability = {
        name: 'some-channel',
        status: ['some-status']
      };
      searchServiceResponse.counts = null;
      searchServiceResponse.prices = null;
      const response = {
        data: searchServiceResponse.products,
        metadata: {
          counts: null,
          isFirstPageReached: true,
          isLastPageReached: false,
          lastPageCursor: 'last-page-cursor',
          limit: 1,
          nextPageCursor: 'firstPageId:lastPageId:nextPageId_asc',
          offset: 0,
          prevPageCursor: null,
          prices: null,
          source: 'Elasticsearch',
          type: 'book'
        }
      };
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(response);
      const processedSearchQueryParserResult = [
        {
          attributes: ['title', 'identifiers.isbn'],
          rules: {
            bool: {
              filter: [
                { terms: { 'identifiers.isbn.keyword': ['some-isbn'] } },
                {
                  nested: {
                    inner_hits: {},
                    path: 'availability',
                    query: {
                      bool: {
                        filter: [
                          {
                            term: {
                              'availability.name.keyword': 'some-channel'
                            }
                          },
                          {
                            terms_set: {
                              'availability.status.keyword': {
                                minimum_should_match_script: {
                                  source: 'params.num_terms'
                                },
                                terms: ['some-status']
                              }
                            }
                          }
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },
          type: 'book'
        }
      ];
      stubData.searchV4ServiceMock
        .expects('searchProducts')
        .once()
        .withArgs({
          availability: request.body.availability,
          availabilityName: request.body.availability.name,
          availabilityStatus: request.body.availability.status,
          cacheId: undefined,
          hasCounts: request.body.hasCounts,
          hasTotalPrices: request.body.hasTotalPrices,
          limit: request.body.limit,
          offset: request.body.offset,
          offsetCursor: undefined,
          productType: request.body.rulesList[0].type,
          projectedFields: request.body.rulesList[0].attributes,
          searchQueryParserResult: processedSearchQueryParserResult
        })
        .resolves(searchServiceResponse);
      searchV4Controller
        .searchProducts(request, stubData.response)
        .then(() => {
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.searchV4ServiceMock.restore();
        });
    });
    it(`should return the list of products satisfying the rule with availability info when offset is null
        and offsetCursor value is "last-page-cursor"`, (done) => {
      const stubData = getStubData();
      const request = stubData.request;
      request.body.offset = null;
      request.body.offsetCursor = 'last-page-cursor';
      const searchServiceResponse = stubData.searchServiceResponse;
      request.body.hasCounts = false;
      request.body.hasTotalPrices = false;
      searchServiceResponse.counts = null;
      searchServiceResponse.prices = null;
      searchServiceResponse.nextPageCursor = null;
      searchServiceResponse.lastPageCursor = null;
      searchServiceResponse.prevPageCursor =
        'firstPageId:lastPageId:prevPageId_desc';
      searchServiceResponse.isFirstPageReached = false;
      searchServiceResponse.isLastPageReached = true;
      const response = {
        data: searchServiceResponse.products,
        metadata: {
          counts: null,
          isFirstPageReached: false,
          isLastPageReached: true,
          lastPageCursor: null,
          limit: 1,
          nextPageCursor: null,
          offset: 0,
          prevPageCursor: 'firstPageId:lastPageId:prevPageId_desc',
          prices: null,
          source: 'Elasticsearch',
          type: 'book'
        }
      };
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(response);
      stubData.searchV4ServiceMock
        .expects('searchProducts')
        .once()
        .withArgs({
          availability: undefined,
          availabilityName: undefined,
          availabilityStatus: undefined,
          cacheId: undefined,
          hasCounts: request.body.hasCounts,
          hasTotalPrices: request.body.hasTotalPrices,
          limit: request.body.limit,
          offset: 0,
          offsetCursor: request.body.offsetCursor,
          productType: request.body.rulesList[0].type,
          projectedFields: request.body.rulesList[0].attributes,
          searchQueryParserResult: stubData.searchQueryParserResult
        })
        .resolves(searchServiceResponse);
      searchV4Controller
        .searchProducts(request, stubData.response)
        .then(() => {
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.searchV4ServiceMock.restore();
        });
    });
    it('should return the list of products satisfying the given rule by considering default offset & limit', (done) => {
      const stubData = getStubData();
      const request = stubData.request;
      delete request.body.offset;
      delete request.body.limit;
      delete request.body.availability;
      const searchServiceResponse = stubData.searchServiceResponse;
      searchServiceResponse.products[0].availability = [];
      request.body.hasCounts = false;
      request.body.hasTotalPrices = false;
      searchServiceResponse.counts = null;
      searchServiceResponse.prices = null;
      const response = {
        data: searchServiceResponse.products,
        metadata: {
          counts: searchServiceResponse.counts,
          isFirstPageReached: true,
          isLastPageReached: false,
          lastPageCursor: 'last-page-cursor',
          limit: 30,
          nextPageCursor: 'firstPageId:lastPageId:nextPageId_asc',
          offset: 0,
          prevPageCursor: null,
          prices: searchServiceResponse.prices,
          source: 'Elasticsearch',
          type: 'book'
        }
      };
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(response);
      stubData.searchV4ServiceMock
        .expects('searchProducts')
        .once()
        .withArgs({
          availability: undefined,
          availabilityName: undefined,
          availabilityStatus: undefined,
          cacheId: undefined,
          hasCounts: request.body.hasCounts,
          hasTotalPrices: request.body.hasTotalPrices,
          limit: 30,
          offset: 0,
          offsetCursor: undefined,
          productType: request.body.rulesList[0].type,
          projectedFields: request.body.rulesList[0].attributes,
          searchQueryParserResult: stubData.searchQueryParserResult
        })
        .resolves(searchServiceResponse);
      searchV4Controller
        .searchProducts(request, stubData.response)
        .then(() => {
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.searchV4ServiceMock.restore();
        });
    });
    it('should return the list of products including count info, satisfying the given rule', (done) => {
      const stubData = getStubData();
      const request = stubData.request;
      request.body.hasTotalPrices = false;
      delete request.body.availability;
      const searchServiceResponse = stubData.searchServiceResponse;
      searchServiceResponse.products[0].availability = [];
      searchServiceResponse.prices = null;
      const response = {
        data: searchServiceResponse.products,
        metadata: {
          counts: searchServiceResponse.counts,
          isFirstPageReached: true,
          isLastPageReached: false,
          lastPageCursor: 'last-page-cursor',
          limit: 1,
          nextPageCursor: 'firstPageId:lastPageId:nextPageId_asc',
          offset: 0,
          prevPageCursor: null,
          prices: searchServiceResponse.prices,
          source: 'Elasticsearch',
          type: 'book'
        }
      };
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(response);
      stubData.searchV4ServiceMock
        .expects('searchProducts')
        .once()
        .withArgs({
          availability: undefined,
          availabilityName: undefined,
          availabilityStatus: undefined,
          cacheId: undefined,
          hasCounts: request.body.hasCounts,
          hasTotalPrices: request.body.hasTotalPrices,
          limit: request.body.limit,
          offset: request.body.offset,
          offsetCursor: undefined,
          productType: request.body.rulesList[0].type,
          projectedFields: request.body.rulesList[0].attributes,
          searchQueryParserResult: stubData.searchQueryParserResult
        })
        .resolves(searchServiceResponse);
      searchV4Controller
        .searchProducts(request, stubData.response)
        .then(() => {
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.searchV4ServiceMock.restore();
        });
    });
    it('should return the list of products including prices info, satisfying the given rule', (done) => {
      const stubData = getStubData();
      const request = stubData.request;
      request.body.hasCounts = false;
      delete request.body.availability;
      const searchServiceResponse = stubData.searchServiceResponse;
      searchServiceResponse.products[0].availability = [];
      searchServiceResponse.counts = null;
      const response = {
        data: searchServiceResponse.products,
        metadata: {
          counts: searchServiceResponse.counts,
          isFirstPageReached: true,
          isLastPageReached: false,
          lastPageCursor: 'last-page-cursor',
          limit: 1,
          nextPageCursor: 'firstPageId:lastPageId:nextPageId_asc',
          offset: 0,
          prevPageCursor: null,
          prices: searchServiceResponse.prices,
          source: 'Elasticsearch',
          type: 'book'
        }
      };
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(response);
      stubData.searchV4ServiceMock
        .expects('searchProducts')
        .once()
        .withArgs({
          availability: undefined,
          availabilityName: undefined,
          availabilityStatus: undefined,
          cacheId: undefined,
          hasCounts: request.body.hasCounts,
          hasTotalPrices: request.body.hasTotalPrices,
          limit: request.body.limit,
          offset: request.body.offset,
          offsetCursor: undefined,
          productType: request.body.rulesList[0].type,
          projectedFields: request.body.rulesList[0].attributes,
          searchQueryParserResult: stubData.searchQueryParserResult
        })
        .resolves(searchServiceResponse);
      searchV4Controller
        .searchProducts(request, stubData.response)
        .then(() => {
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.searchV4ServiceMock.restore();
        });
    });
    it('should return the list of products including both count & prices info, satisfying the given rule', (done) => {
      const stubData = getStubData();
      const request = stubData.request;
      delete request.body.availability;
      const searchServiceResponse = stubData.searchServiceResponse;
      searchServiceResponse.products[0].availability = [];
      const response = {
        data: searchServiceResponse.products,
        metadata: {
          counts: searchServiceResponse.counts,
          isFirstPageReached: true,
          isLastPageReached: false,
          lastPageCursor: 'last-page-cursor',
          limit: 1,
          nextPageCursor: 'firstPageId:lastPageId:nextPageId_asc',
          offset: 0,
          prevPageCursor: null,
          prices: searchServiceResponse.prices,
          source: 'Elasticsearch',
          type: 'book'
        }
      };
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock.expects('json').once().withArgs(response);
      stubData.searchV4ServiceMock
        .expects('searchProducts')
        .once()
        .withArgs({
          availability: undefined,
          availabilityName: undefined,
          availabilityStatus: undefined,
          cacheId: undefined,
          hasCounts: request.body.hasCounts,
          hasTotalPrices: request.body.hasTotalPrices,
          limit: request.body.limit,
          offset: request.body.offset,
          offsetCursor: undefined,
          productType: request.body.rulesList[0].type,
          projectedFields: request.body.rulesList[0].attributes,
          searchQueryParserResult: stubData.searchQueryParserResult
        })
        .resolves(searchServiceResponse);
      searchV4Controller
        .searchProducts(request, stubData.response)
        .then(() => {
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          stubData.responseMock.restore();
          stubData.searchV4ServiceMock.restore();
        });
    });
  });
  describe('getSearchMetadata', () => {
    it('should throw error when invalid parameter is sent in request', (done) => {
      const stubData = getStubData();
      const { hasTotalPrices, hasCounts, rulesList, availability } =
        stubData.request.body;
      stubData.request.body = {
        action: 'count',
        availability,
        hasCounts,
        hasTotalPrices,
        random: 'some-invalid',
        rulesList
      };
      const validateCountApiSpy = sinon.spy(
        countAPIValidator,
        'validateCountApi'
      );
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: `Invalid parameters: random`
          }
        });
      stubData.searchV4ServiceMock.expects('getSearchMetadata').never();
      // const res = httpMocks.createResponse();
      searchV4Controller
        .getSearchMetadata(stubData.request, stubData.response)
        .then(() => {
          expect(validateCountApiSpy.calledOnce).to.equal(true);
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          validateCountApiSpy.restore();
          stubData.responseMock.restore();
          stubData.searchV4ServiceMock.restore();
        });
    });
    it('should throw error when invalid rulesList is sent in request', (done) => {
      const stubData = getStubData();
      const reqBody = stubData.request.body;
      delete reqBody.limit;
      delete reqBody.offset;
      delete reqBody.sortBy;
      delete reqBody.sortOrder;
      stubData.request.body = {
        ...reqBody,
        action: 'count',
        rulesList: [{ rules: [{ key: 'value' }], type: 'book' }]
      };
      const validateCountApiSpy = sinon.spy(
        countAPIValidator,
        'validateCountApi'
      );
      stubData.responseMock.expects('status').once().withArgs(400);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            error: undefined,
            message: `Invalid Input: invalid rules type :: undefined`
          }
        });
      stubData.searchV4ServiceMock.expects('getSearchMetadata').never();
      // const res = httpMocks.createResponse();
      searchV4Controller
        .getSearchMetadata(stubData.request, stubData.response)
        .then(() => {
          expect(validateCountApiSpy.calledOnce).to.equal(true);
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          validateCountApiSpy.restore();
          stubData.responseMock.restore();
          stubData.searchV4ServiceMock.restore();
        });
    });
    it('should return metadata when the rulesList are valid', (done) => {
      const stubData = getStubData();
      const { hasTotalPrices, hasCounts, rulesList, availability } =
        stubData.request.body;
      const availabilityName: string = availability
        ? availability.name
        : undefined;
      const availabilityStatus: string[] = availability
        ? availability.status
        : undefined;
      stubData.request.body = {
        action: 'count',
        availability,
        hasCounts,
        hasTotalPrices,
        rulesList
      };
      const validateCountApiSpy = sinon.spy(
        countAPIValidator,
        'validateCountApi'
      );
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            counts: stubData.searchServiceResponse.counts,
            prices: stubData.searchServiceResponse.prices
          }
        });
      const parsedQuery = [
        {
          attributes: ['title', 'identifiers.isbn'],
          rules: {
            bool: {
              filter: [{ terms: { 'identifiers.isbn.keyword': ['some-isbn'] } }]
            }
          },
          type: 'book'
        }
      ];
      stubData.searchV4ServiceMock
        .expects('getSearchMetadata')
        .once()
        .withArgs(parsedQuery, {
          availability,
          availabilityName,
          availabilityStatus,
          hasCounts,
          hasTotalPrices
        })
        .resolves({
          counts: stubData.searchServiceResponse.counts,
          prices: stubData.searchServiceResponse.prices
        });
      // const res = httpMocks.createResponse();
      searchV4Controller
        .getSearchMetadata(stubData.request, stubData.response)
        .then(() => {
          expect(validateCountApiSpy.calledOnce).to.equal(true);
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          validateCountApiSpy.restore();
          stubData.responseMock.restore();
          stubData.searchV4ServiceMock.restore();
        });
    });
    it(`should return metadata when the rulesList are valid and availability is passed as an array
        in request payload`, (done) => {
      const stubData = getStubData();
      const request = stubData.request;
      const { hasTotalPrices, hasCounts, rulesList } = request.body;
      const availabilityName: string = undefined;
      const availabilityStatus: string[] = undefined;
      request.body['availability'] = [
        {
          errors: [],
          name: 'some-channel',
          status: {
            ALL: ['some-status']
          }
        }
      ];
      const availability = request.body['availability'];
      stubData.request.body = {
        action: 'count',
        availability,
        hasCounts,
        hasTotalPrices,
        rulesList
      };
      const validateCountApiSpy = sinon.spy(
        countAPIValidator,
        'validateCountApi'
      );
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            counts: stubData.searchServiceResponse.counts,
            prices: stubData.searchServiceResponse.prices
          }
        });
      const processedSearchQueryParserResult = [
        {
          attributes: ['title', 'identifiers.isbn'],
          rules: {
            bool: {
              filter: [
                { terms: { 'identifiers.isbn.keyword': ['some-isbn'] } },
                {
                  nested: {
                    inner_hits: {},
                    path: 'availability',
                    query: {
                      bool: {
                        filter: [
                          {
                            term: {
                              'availability.name.keyword': 'some-channel'
                            }
                          },
                          {
                            terms_set: {
                              'availability.status.keyword': {
                                minimum_should_match_script: {
                                  source: 'params.num_terms'
                                },
                                terms: ['some-status']
                              }
                            }
                          }
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },
          type: 'book'
        }
      ];
      stubData.searchV4ServiceMock
        .expects('getSearchMetadata')
        .once()
        .withArgs(processedSearchQueryParserResult, {
          availability,
          availabilityName,
          availabilityStatus,
          hasCounts,
          hasTotalPrices
        })
        .resolves({
          counts: stubData.searchServiceResponse.counts,
          prices: stubData.searchServiceResponse.prices
        });
      // const res = httpMocks.createResponse();
      searchV4Controller
        .getSearchMetadata(stubData.request, stubData.response)
        .then(() => {
          expect(validateCountApiSpy.calledOnce).to.equal(true);
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          validateCountApiSpy.restore();
          stubData.responseMock.restore();
          stubData.searchV4ServiceMock.restore();
        });
    });
    it(`should return metadata when the rulesList are valid and availability is passed as an object
        in request payload`, (done) => {
      const stubData = getStubData();
      const request = stubData.request;
      const { hasTotalPrices, hasCounts, rulesList } = request.body;
      const availabilityName = 'some-channel';
      const availabilityStatus: string[] = ['some-status'];
      request.body['availability'] = {
        name: 'some-channel',
        status: ['some-status']
      };
      const availability = request.body['availability'];
      stubData.request.body = {
        action: 'count',
        availability,
        hasCounts,
        hasTotalPrices,
        rulesList
      };
      const validateCountApiSpy = sinon.spy(
        countAPIValidator,
        'validateCountApi'
      );
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            counts: stubData.searchServiceResponse.counts,
            prices: stubData.searchServiceResponse.prices
          }
        });
      const processedSearchQueryParserResult = [
        {
          attributes: ['title', 'identifiers.isbn'],
          rules: {
            bool: {
              filter: [
                { terms: { 'identifiers.isbn.keyword': ['some-isbn'] } },
                {
                  nested: {
                    inner_hits: {},
                    path: 'availability',
                    query: {
                      bool: {
                        filter: [
                          {
                            term: {
                              'availability.name.keyword': 'some-channel'
                            }
                          },
                          {
                            terms_set: {
                              'availability.status.keyword': {
                                minimum_should_match_script: {
                                  source: 'params.num_terms'
                                },
                                terms: ['some-status']
                              }
                            }
                          }
                        ]
                      }
                    }
                  }
                }
              ]
            }
          },
          type: 'book'
        }
      ];
      stubData.searchV4ServiceMock
        .expects('getSearchMetadata')
        .once()
        .withArgs(processedSearchQueryParserResult, {
          availability,
          availabilityName,
          availabilityStatus,
          hasCounts,
          hasTotalPrices
        })
        .resolves({
          counts: stubData.searchServiceResponse.counts,
          prices: stubData.searchServiceResponse.prices
        });
      // const res = httpMocks.createResponse();
      searchV4Controller
        .getSearchMetadata(stubData.request, stubData.response)
        .then(() => {
          expect(validateCountApiSpy.calledOnce).to.equal(true);
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          validateCountApiSpy.restore();
          stubData.responseMock.restore();
          stubData.searchV4ServiceMock.restore();
        });
    });
    it(
      'should NOT map chapter.firstPublishedYear to chapter.firstPublishedYearNumber ' +
        'of query criteria ',
      (done) => {
        const stubData = getStubData();
        const { hasTotalPrices, hasCounts, availability } =
          stubData.request.body;
        const availabilityName: string = availability
          ? availability.name
          : undefined;
        const availabilityStatus: string[] = availability
          ? availability.status
          : undefined;
        const rulesList = [
          {
            attributes: ['title', 'identifiers.isbn'],
            rules: [
              {
                position: 1,
                rule: {
                  value: 'BEGIN'
                },
                type: 'separator'
              },
              {
                position: 4,
                rule: {
                  attribute: 'chapter.firstPublishedYear',
                  relationship: 'IN',
                  values: ['2010']
                },
                type: 'criteria'
              },
              {
                position: 5,
                rule: {
                  value: 'END'
                },
                type: 'separator'
              }
            ],
            type: 'chapter'
          }
        ];
        const expectedQuery = [
          {
            attributes: ['title', 'identifiers.isbn'],
            rules: {
              bool: {
                filter: [{ terms: { 'chapter.firstPublishedYear': [2010] } }]
              }
            },
            type: 'chapter'
          }
        ];
        stubData.request.body = {
          action: 'count',
          availability,
          hasCounts,
          hasTotalPrices,
          rulesList
        };
        stubData.searchV4ServiceMock
          .expects('getSearchMetadata')
          .once()
          .withArgs(expectedQuery, {
            availability,
            availabilityName,
            availabilityStatus,
            hasCounts,
            hasTotalPrices
          })
          .resolves({
            counts: stubData.searchServiceResponse.counts,
            prices: stubData.searchServiceResponse.prices
          });
        // const res = httpMocks.createResponse();
        searchV4Controller
          .getSearchMetadata(stubData.request, stubData.response)
          .then(() => {
            stubData.searchV4ServiceMock.verify();
            stubData.responseMock.verify();
            done();
          })
          .catch(done)
          .finally(() => {
            stubData.responseMock.restore();
            stubData.searchV4ServiceMock.restore();
          });
      }
    );
    it('should not throw error when availability property is missing', (done) => {
      const stubData = getStubData();
      const { hasTotalPrices, hasCounts, rulesList } = stubData.request.body;
      stubData.request.body = {
        action: 'count',
        hasCounts,
        hasTotalPrices,
        rulesList
      };
      const validateCountApiSpy = sinon.spy(
        countAPIValidator,
        'validateCountApi'
      );
      stubData.responseMock.expects('status').once().withArgs(200);
      stubData.responseMock
        .expects('json')
        .once()
        .withArgs({
          data: null,
          metadata: {
            counts: stubData.searchServiceResponse.counts,
            prices: stubData.searchServiceResponse.prices
          }
        });
      const parseQuery = [
        {
          attributes: ['title', 'identifiers.isbn'],
          rules: {
            bool: {
              filter: [{ terms: { 'identifiers.isbn.keyword': ['some-isbn'] } }]
            }
          },
          type: 'book'
        }
      ];
      stubData.searchV4ServiceMock
        .expects('getSearchMetadata')
        .once()
        .withArgs(parseQuery, {
          availability: undefined,
          availabilityName: undefined,
          availabilityStatus: undefined,
          hasCounts,
          hasTotalPrices
        })
        .resolves({
          counts: stubData.searchServiceResponse.counts,
          prices: stubData.searchServiceResponse.prices
        });
      // const res = httpMocks.createResponse();
      searchV4Controller
        .getSearchMetadata(stubData.request, stubData.response)
        .then(() => {
          expect(validateCountApiSpy.calledOnce).to.equal(true);
          stubData.searchV4ServiceMock.verify();
          stubData.responseMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          validateCountApiSpy.restore();
          stubData.responseMock.restore();
          stubData.searchV4ServiceMock.restore();
        });
    });
  });
  describe('mapAndParseSearchQuery', () => {
    it('should throw error when the rules-list in null', (done) => {
      const rulesList: ISearchQuery[] = null;
      try {
        searchV4Controller.mapAndParseSearchQuery(rulesList);
        done(new Error('Expecting error but got success.'));
      } catch (err) {
        done();
      }
    });
    it(
      'should NOT map the firstPublishedYear property of the book to firstPublishedYearNumber ' +
        'in the query',
      () => {
        const rulesList: ISearchQuery[] = [
          {
            attributes: ['title', 'identifiers.isbn'],
            rules: [
              {
                position: 1,
                rule: {
                  value: 'BEGIN'
                },
                type: 'separator'
              },
              {
                position: 4,
                rule: {
                  attribute: 'book.firstPublishedYear',
                  relationship: 'IN',
                  values: ['2010']
                },
                type: 'criteria'
              },
              {
                position: 5,
                rule: {
                  value: 'END'
                },
                type: 'separator'
              }
            ],
            type: 'book'
          }
        ];
        const expectedQuery = [
          {
            attributes: ['title', 'identifiers.isbn'],
            rules: {
              bool: {
                filter: [{ terms: { 'book.firstPublishedYear': [2010] } }]
              }
            },
            type: 'book'
          }
        ];
        const parsedQuery =
          searchV4Controller.mapAndParseSearchQuery(rulesList);
        expect(parsedQuery).to.eql(expectedQuery);
      }
    );
  });
});
