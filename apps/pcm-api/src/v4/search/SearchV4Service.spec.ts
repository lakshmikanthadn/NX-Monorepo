import { expect } from 'chai';
import * as sinon from 'sinon';
import { associatedMediaV4Service } from '../associatedMedia/AssociatedMediaV4.Service';
import { IProductsRuleRequest } from '../model/interfaces/productRequest';
import {
  IAvailabilityArray,
  ISearchQuery,
  ISearchQueryParams
} from '../model/interfaces/SearchResult';
import { productV4DAO } from '../products/ProductV4.DAO';
import { searchV4Service } from './SearchV4Service';

describe('SearchV4Service', () => {
  let productV4DAOMock;
  let associatedMediaV4ServiceMock;
  let searchQueryParams: ISearchQueryParams;
  beforeEach(() => {
    productV4DAOMock = sinon.mock(productV4DAO);
    associatedMediaV4ServiceMock = sinon.mock(associatedMediaV4Service);
  });
  const serchResult = {
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
    isFromCache: false,
    prices: [
      {
        currency: 'some-currency',
        price: 15,
        priceType: 'some-priceType',
        priceTypeCode: 'some-priceTypeCode',
        productsCount: 2
      }
    ],
    products: [
      {
        availability: [
          {
            errors: ['err'],
            name: 'some-channel',
            success: ['some-rule', 'some-status']
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
    ]
  };
  it('should have all the methods', () => {
    expect(searchV4Service).to.respondTo('searchProducts');
    expect(searchV4Service).to.respondTo('getSearchMetadata');
    expect(searchV4Service).to.respondTo('_calculateTotalProductPrices');
    expect(searchV4Service).to.respondTo('getSearchResults');
    expect(searchV4Service).to.respondTo('getSearchResultPrices');
    expect(searchV4Service).to.respondTo('getSearchResultCount');
  });
  describe('searchProducts', () => {
    beforeEach(() => {
      searchQueryParams = {
        availabilityName: 'some-channel',
        availabilityStatus: ['some-rule', 'some-status'],
        hasCounts: true,
        hasTotalPrices: true,
        limit: 1,
        offset: 0,
        productType: 'book',
        searchQueryParserResult: [
          {
            attributes: ['_id'],
            rules: {
              'identifiers.isbn': {
                $in: ['some-isbn']
              }
            },
            type: 'book'
          }
        ],
        sortOrder: 'asc'
      };
    });
    it('should throw Invalid search query when searchQueryParserResult not passed', (done) => {
      searchQueryParams.searchQueryParserResult = undefined;
      productV4DAOMock.expects('getProductsByRule').never();
      productV4DAOMock.expects('getProductsCountByRule').never();
      productV4DAOMock.expects('getProductsPriceByRules').never();
      searchV4Service
        .searchProducts(searchQueryParams)
        .then(() => {
          done(new Error('Expecting Invalid search query. but got success'));
        })
        .catch((err) => {
          expect(err.message).to.equal('Invalid search query');
          expect(err.code).to.equal(400);
          productV4DAOMock.verify();
          done();
        })
        .finally(() => {
          productV4DAOMock.restore();
        });
    });
    it('should throw Invalid search query when searchQueryParserResult passed as empty array', (done) => {
      searchQueryParams.searchQueryParserResult = [];
      productV4DAOMock.expects('getProductsByRule').never();
      productV4DAOMock.expects('getProductsCountByRule').never();
      productV4DAOMock.expects('getProductsPriceByRules').never();
      searchV4Service
        .searchProducts(searchQueryParams)
        .then(() => {
          done(new Error('Expecting Invalid search query. but got success'));
        })
        .catch((err) => {
          expect(err.message).to.equal('Invalid search query');
          expect(err.code).to.equal(400);
          productV4DAOMock.verify();
          done();
        })
        .finally(() => {
          productV4DAOMock.restore();
        });
    });
    it('should throw Invalid rule. when wrong rule passed', (done) => {
      searchQueryParams.searchQueryParserResult[0].type = undefined;
      searchQueryParams.searchQueryParserResult[0].rules = undefined;
      productV4DAOMock.expects('getProductsByRule').never();
      productV4DAOMock.expects('getProductsCountByRule').never();
      productV4DAOMock.expects('getProductsPriceByRules').never();
      searchV4Service
        .searchProducts(searchQueryParams)
        .then(() => {
          done(new Error('Invalid search query. but got success'));
        })
        .catch((err) => {
          expect(err.message).to.equal('Invalid rule. {"attributes":["_id"]}');
          expect(err.code).to.equal(400);
          productV4DAOMock.verify();
          done();
        })
        .finally(() => {
          productV4DAOMock.restore();
        });
    });
    it(
      'should return products without price and counts info with default projection (only _id)' +
        ' when attributes passed as an empty array and include availability as empty array in the response',
      (done) => {
        searchQueryParams.hasCounts = false;
        searchQueryParams.hasTotalPrices = false;
        searchQueryParams.searchQueryParserResult[0].attributes = [];
        delete searchQueryParams.availabilityName;
        delete searchQueryParams.availabilityStatus;
        const products = [{ _id: 'some-uuid' }];
        const lastProducts = [{ _id: 'last-page-id' }];
        const firstPageRequest: IProductsRuleRequest = {
          availability: undefined,
          availabilityName: null,
          limit: searchQueryParams.limit,
          offset: searchQueryParams.offset,
          offsetCursor: searchQueryParams.offsetCursor,
          productType: searchQueryParams.searchQueryParserResult[0].type,
          projections: ['_id'],
          rules: searchQueryParams.searchQueryParserResult[0].rules,
          sortOrder: 'asc'
        };
        const lastPageRequest: IProductsRuleRequest = {
          ...firstPageRequest,
          offset: null,
          offsetCursor: 'last-page-cursor',
          sortOrder: 'desc'
        };
        productV4DAOMock
          .expects('getProductsByRule')
          .once()
          .withArgs(firstPageRequest)
          .resolves(products);
        productV4DAOMock
          .expects('getProductsByRule')
          .once()
          .withArgs(lastPageRequest)
          .resolves(lastProducts);
        productV4DAOMock.expects('getProductsCountByRule').never();
        productV4DAOMock.expects('getProductsPriceByRules').never();
        searchV4Service
          .searchProducts(searchQueryParams)
          .then((result) => {
            expect(result).to.be.an('object');
            expect(result.counts).to.eql(null);
            expect(result.prices).to.eql(null);
            expect(result.products.length).to.eql(1);
            expect(result.products[0].availability).to.eql([]);
            productV4DAOMock.verify();
            done();
          })
          .catch(done)
          .finally(() => {
            productV4DAOMock.restore();
          });
      }
    );
    it('should return the products with counts info', (done) => {
      searchQueryParams.hasTotalPrices = false;
      delete searchQueryParams.availabilityName;
      delete searchQueryParams.availabilityStatus;
      const products = [{ _id: 'some-uuid' }];
      const lastProducts = [{ _id: 'last-page-id' }];
      const firstPageRequest: IProductsRuleRequest = {
        availability: undefined,
        availabilityName: null,
        limit: searchQueryParams.limit,
        offset: searchQueryParams.offset,
        offsetCursor: searchQueryParams.offsetCursor,
        productType: searchQueryParams.searchQueryParserResult[0].type,
        projections: ['_id'],
        rules: searchQueryParams.searchQueryParserResult[0].rules,
        sortOrder: 'asc'
      };
      const lastPageRequest: IProductsRuleRequest = {
        ...firstPageRequest,
        offset: null,
        offsetCursor: 'last-page-cursor',
        sortOrder: 'desc'
      };
      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(firstPageRequest)
        .resolves(products);
      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(lastPageRequest)
        .resolves(lastProducts);

      productV4DAOMock
        .expects('getProductsCountByRule')
        .once()
        .withArgs(
          searchQueryParams.searchQueryParserResult[0].type,
          searchQueryParams.searchQueryParserResult[0].rules
        )
        .resolves(1);
      productV4DAOMock.expects('getProductsPriceByRules').never();
      searchV4Service
        .searchProducts(searchQueryParams)
        .then((result) => {
          expect(result).to.be.an('object');
          expect(result.counts).to.eql(serchResult.counts);
          expect(result.prices).to.be.equal(null);
          expect(result.products.length).to.eql(1);
          productV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          productV4DAOMock.restore();
        });
    });
    it('should return the products with prices info', (done) => {
      searchQueryParams.hasCounts = false;
      delete searchQueryParams.availabilityName;
      delete searchQueryParams.availabilityStatus;
      const prices = [
        {
          currency: 'some-currency',
          price: 5,
          priceType: 'some-priceType',
          priceTypeCode: 'some-priceTypeCode',
          productsCount: 1
        },
        {
          currency: 'some-currency',
          price: 10,
          priceType: 'some-priceType',
          priceTypeCode: 'some-priceTypeCode',
          productsCount: 1
        }
      ];
      const products = [{ _id: 'some-uuid' }];
      const lastProducts = [{ _id: 'last-page-id' }];
      const firstPageRequest: IProductsRuleRequest = {
        availability: undefined,
        availabilityName: null,
        limit: searchQueryParams.limit,
        offset: searchQueryParams.offset,
        offsetCursor: searchQueryParams.offsetCursor,
        productType: searchQueryParams.searchQueryParserResult[0].type,
        projections: ['_id'],
        rules: searchQueryParams.searchQueryParserResult[0].rules,
        sortOrder: 'asc'
      };
      const lastPageRequest: IProductsRuleRequest = {
        ...firstPageRequest,
        offset: null,
        offsetCursor: 'last-page-cursor',
        sortOrder: 'desc'
      };
      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(firstPageRequest)
        .resolves(products);
      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(lastPageRequest)
        .resolves(lastProducts);

      productV4DAOMock.expects('getProductsCountByRule').never();
      productV4DAOMock
        .expects('getProductsPriceByRules')
        .once()
        .withArgs(
          searchQueryParams.searchQueryParserResult[0].type,
          searchQueryParams.searchQueryParserResult[0].rules
        )
        .resolves(prices);
      searchV4Service
        .searchProducts(searchQueryParams)
        .then((result) => {
          expect(result).to.be.an('object');
          expect(result.counts).to.eql(null);
          expect(result.prices.length).to.be.equal(1);
          expect(result.prices).to.eql(serchResult.prices);
          expect(result.products.length).to.eql(1);
          productV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          productV4DAOMock.restore();
        });
    });
    it('should return the products with counts and prices info', (done) => {
      delete searchQueryParams.availabilityName;
      delete searchQueryParams.availabilityStatus;
      const prices = [
        {
          currency: 'some-currency',
          price: 5,
          priceType: 'some-priceType',
          priceTypeCode: 'some-priceTypeCode',
          productsCount: 1
        },
        {
          currency: 'some-currency',
          price: 10,
          priceType: 'some-priceType',
          priceTypeCode: 'some-priceTypeCode',
          productsCount: 1
        }
      ];
      const products = [{ _id: 'some-uuid' }];
      const lastProducts = [{ _id: 'last-page-id' }];
      const firstPageRequest: IProductsRuleRequest = {
        availability: undefined,
        availabilityName: null,
        limit: searchQueryParams.limit,
        offset: searchQueryParams.offset,
        offsetCursor: searchQueryParams.offsetCursor,
        productType: searchQueryParams.searchQueryParserResult[0].type,
        projections: ['_id'],
        rules: searchQueryParams.searchQueryParserResult[0].rules,
        sortOrder: 'asc'
      };
      const lastPageRequest: IProductsRuleRequest = {
        ...firstPageRequest,
        offset: null,
        offsetCursor: 'last-page-cursor',
        sortOrder: 'desc'
      };
      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(firstPageRequest)
        .resolves(products);
      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(lastPageRequest)
        .resolves(lastProducts);

      productV4DAOMock
        .expects('getProductsCountByRule')
        .once()
        .withArgs(
          searchQueryParams.searchQueryParserResult[0].type,
          searchQueryParams.searchQueryParserResult[0].rules
        )
        .resolves(1);
      productV4DAOMock
        .expects('getProductsPriceByRules')
        .once()
        .withArgs(
          searchQueryParams.searchQueryParserResult[0].type,
          searchQueryParams.searchQueryParserResult[0].rules
        )
        .resolves(prices);
      searchV4Service
        .searchProducts(searchQueryParams)
        .then((result) => {
          expect(result).to.be.an('object');
          expect(result.counts).to.eql(serchResult.counts);
          expect(result.prices.length).to.be.equal(1);
          expect(result.prices).to.eql(serchResult.prices);
          expect(result.products.length).to.eql(1);
          productV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          productV4DAOMock.restore();
        });
    });
    it(
      'should return the products along with availability info ' +
        'when availability name and status passed in the request',
      (done) => {
        searchQueryParams.hasCounts = false;
        searchQueryParams.hasTotalPrices = false;
        const availabilityName = searchQueryParams.availabilityName;
        const availabilityStatus = searchQueryParams.availabilityStatus;
        const ruleWithAvailabilityInfo = {
          $and: [
            searchQueryParams.searchQueryParserResult[0].rules,
            {
              availability: {
                $elemMatch: {
                  name: availabilityName,
                  status: { $all: availabilityStatus }
                }
              }
            }
          ]
        };
        delete searchQueryParams.searchQueryParserResult[0].attributes;
        const products = [
          {
            _id: 'some-uuid',
            availability: serchResult.products[0].availability
          }
        ];
        searchQueryParams.availability = {
          name: 'some-channel',
          status: ['some-rule', 'some-status']
        };

        const lastProducts = [{ _id: 'last-page-id' }];
        const firstPageRequest: IProductsRuleRequest = {
          availability: searchQueryParams.availability,
          availabilityName,
          limit: searchQueryParams.limit,
          offset: searchQueryParams.offset,
          offsetCursor: searchQueryParams.offsetCursor,
          productType: searchQueryParams.searchQueryParserResult[0].type,
          projections: ['_id'],
          rules: ruleWithAvailabilityInfo,
          sortOrder: 'asc'
        };
        const lastPageRequest: IProductsRuleRequest = {
          ...firstPageRequest,
          offset: null,
          offsetCursor: 'last-page-cursor',
          sortOrder: 'desc'
        };
        productV4DAOMock
          .expects('getProductsByRule')
          .once()
          .withArgs(firstPageRequest)
          .resolves(products);
        productV4DAOMock
          .expects('getProductsByRule')
          .once()
          .withArgs(lastPageRequest)
          .resolves(lastProducts);

        productV4DAOMock.expects('getProductsCountByRule').never();
        productV4DAOMock.expects('getProductsPriceByRules').never();
        searchV4Service
          .searchProducts(searchQueryParams)
          .then((result) => {
            expect(result).to.be.an('object');
            expect(result.counts).to.eql(null);
            expect(result.prices).to.eql(null);
            expect(result.products.length).to.eql(1);
            expect(result.products[0].availability).to.eql(
              serchResult.products[0].availability
            );
            productV4DAOMock.verify();
            done();
          })
          .catch(done)
          .finally(() => {
            productV4DAOMock.restore();
          });
      }
    );
    it('should return the empty products when no match is found', (done) => {
      searchQueryParams.hasCounts = false;
      searchQueryParams.hasTotalPrices = false;
      delete searchQueryParams.availabilityName;
      delete searchQueryParams.availabilityStatus;

      delete searchQueryParams.searchQueryParserResult[0].attributes;
      const firstPageRequest: IProductsRuleRequest = {
        availability: undefined,
        availabilityName: null,
        limit: searchQueryParams.limit,
        offset: searchQueryParams.offset,
        offsetCursor: searchQueryParams.offsetCursor,
        productType: searchQueryParams.searchQueryParserResult[0].type,
        projections: ['_id'],
        rules: searchQueryParams.searchQueryParserResult[0].rules,
        sortOrder: 'asc'
      };
      const lastPageRequest: IProductsRuleRequest = {
        ...firstPageRequest,
        offset: null,
        offsetCursor: 'last-page-cursor',
        sortOrder: 'desc'
      };
      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(firstPageRequest)
        .resolves([]);
      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(lastPageRequest)
        .resolves([]);

      productV4DAOMock.expects('getProductsCountByRule').never();
      productV4DAOMock.expects('getProductsPriceByRules').never();
      searchV4Service
        .searchProducts(searchQueryParams)
        .then((result) => {
          expect(result).to.be.an('object');
          expect(result.counts).to.eql(null);
          expect(result.prices).to.eql(null);
          expect(result.products.length).to.eql(0);
          productV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          productV4DAOMock.restore();
        });
    });
    it(
      'should return the products along with availability info ' +
        'when availability is passed as array in the request',
      (done) => {
        searchQueryParams.hasCounts = false;
        searchQueryParams.hasTotalPrices = false;
        searchQueryParams.availability = [
          {
            name: 'UBX',
            status: {
              ALL: ['SELLABLE', 'CAN_HOST']
            }
          },
          {
            name: 'SALESFORCE',
            status: {
              IN: ['SELLABLE', 'CAN_HOST']
            }
          }
        ];
        const availability = searchQueryParams.availability;
        const ruleWithAvailabilityInfo = {
          $and: [
            { 'identifiers.isbn': { $in: ['some-isbn'] } },
            {
              availability: {
                $all: [
                  {
                    $elemMatch: {
                      name: 'UBX',
                      status: { $all: ['SELLABLE', 'CAN_HOST'] }
                    }
                  },
                  {
                    $elemMatch: {
                      name: 'SALESFORCE',
                      status: { $in: ['SELLABLE', 'CAN_HOST'] }
                    }
                  }
                ]
              }
            }
          ]
        };
        delete searchQueryParams.searchQueryParserResult[0].attributes;
        const products = [
          {
            _id: 'some-uuid',
            availability: [
              {
                errors: [],
                name: 'UBX',
                status: ['SELLABLE', 'CAN_HOST', 'PUBLISHED']
              },
              {
                errors: [],
                name: 'SALESFORCE',
                status: ['SELLABLE', 'CAN_HOST']
              }
            ]
          }
        ];
        const lastProducts = [{ _id: 'last-page-id' }];
        const firstPageRequest: IProductsRuleRequest = {
          availability,
          availabilityName: searchQueryParams.availabilityName,
          limit: searchQueryParams.limit,
          offset: searchQueryParams.offset,
          offsetCursor: searchQueryParams.offsetCursor,
          productType: searchQueryParams.searchQueryParserResult[0].type,
          projections: ['_id'],
          rules: ruleWithAvailabilityInfo,
          sortOrder: 'asc'
        };
        const lastPageRequest: IProductsRuleRequest = {
          ...firstPageRequest,
          offset: null,
          offsetCursor: 'last-page-cursor',
          sortOrder: 'desc'
        };
        productV4DAOMock
          .expects('getProductsByRule')
          .once()
          .withArgs(firstPageRequest)
          .resolves(products);
        productV4DAOMock
          .expects('getProductsByRule')
          .once()
          .withArgs(lastPageRequest)
          .resolves(lastProducts);

        productV4DAOMock.expects('getProductsCountByRule').never();
        productV4DAOMock.expects('getProductsPriceByRules').never();
        searchV4Service
          .searchProducts(searchQueryParams)
          .then((result) => {
            expect(result).to.be.an('object');
            expect(result.counts).to.eql(null);
            expect(result.prices).to.eql(null);
            expect(result.products.length).to.eql(1);
            expect(result.products[0].availability[0]).to.have.property(
              'name',
              'UBX'
            );
            productV4DAOMock.verify();
            done();
          })
          .catch(done)
          .finally(() => {
            productV4DAOMock.restore();
          });
      }
    );
    it('should add offsetCursor in to search query when offsetCursor is in the request', (done) => {
      searchQueryParams.hasCounts = true;
      searchQueryParams.hasTotalPrices = true;
      searchQueryParams.offsetCursor = 'xyz:pqr:12345678_asc';
      const availabilityName = searchQueryParams.availabilityName;
      const availabilityStatus = searchQueryParams.availabilityStatus;
      searchQueryParams.availability = {
        name: 'some-channel',
        status: ['some-rule', 'some-status']
      };
      const ruleWithAvailabilityInfo = {
        $and: [
          searchQueryParams.searchQueryParserResult[0].rules,
          {
            availability: {
              $elemMatch: {
                name: availabilityName,
                status: { $all: availabilityStatus }
              }
            }
          }
        ]
      };
      const rulesQueryWithOffsetCursor = {
        $and: [ruleWithAvailabilityInfo, { _id: { $gt: '12345678' } }]
      };
      delete searchQueryParams.searchQueryParserResult[0].attributes;
      const firstPageRequest: IProductsRuleRequest = {
        availability: searchQueryParams.availability,
        availabilityName: searchQueryParams.availabilityName,
        limit: searchQueryParams.limit,
        offset: searchQueryParams.offset,
        offsetCursor: '12345678',
        productType: searchQueryParams.searchQueryParserResult[0].type,
        projections: ['_id'],
        rules: rulesQueryWithOffsetCursor,
        sortOrder: 'asc'
      };
      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(firstPageRequest)
        .resolves([]);
      productV4DAOMock
        .expects('getProductsCountByRule')
        .once()
        .withArgs(
          searchQueryParams.searchQueryParserResult[0].type,
          ruleWithAvailabilityInfo
        )
        .resolves(1);
      productV4DAOMock
        .expects('getProductsPriceByRules')
        .once()
        .withArgs(
          searchQueryParams.searchQueryParserResult[0].type,
          ruleWithAvailabilityInfo
        )
        .resolves([]);
      searchV4Service
        .searchProducts(searchQueryParams)
        .then(() => {
          productV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          productV4DAOMock.restore();
        });
    });
    it(`should add offsetCursor for reverse order in to search query when offsetCursor
     is in the request`, (done) => {
      searchQueryParams.hasCounts = true;
      searchQueryParams.hasTotalPrices = true;
      searchQueryParams.offsetCursor = 'xyz:pqr:12345678_desc';
      const availabilityName = searchQueryParams.availabilityName;
      const availabilityStatus = searchQueryParams.availabilityStatus;
      searchQueryParams.availability = {
        name: 'some-channel',
        status: ['some-rule', 'some-status']
      };
      const ruleWithAvailabilityInfo = {
        $and: [
          searchQueryParams.searchQueryParserResult[0].rules,
          {
            availability: {
              $elemMatch: {
                name: availabilityName,
                status: { $all: availabilityStatus }
              }
            }
          }
        ]
      };
      const rulesQueryWithOffsetCursor = {
        $and: [ruleWithAvailabilityInfo, { _id: { $lt: '12345678' } }]
      };
      delete searchQueryParams.searchQueryParserResult[0].attributes;
      const firstPageRequest: IProductsRuleRequest = {
        availability: searchQueryParams.availability,
        availabilityName: searchQueryParams.availabilityName,
        limit: searchQueryParams.limit,
        offset: searchQueryParams.offset,
        offsetCursor: '12345678',
        productType: searchQueryParams.searchQueryParserResult[0].type,
        projections: ['_id'],
        rules: rulesQueryWithOffsetCursor,
        sortOrder: 'desc'
      };
      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(firstPageRequest)
        .resolves([]);
      productV4DAOMock
        .expects('getProductsCountByRule')
        .once()
        .withArgs(
          searchQueryParams.searchQueryParserResult[0].type,
          ruleWithAvailabilityInfo
        )
        .resolves(1);
      productV4DAOMock
        .expects('getProductsPriceByRules')
        .once()
        .withArgs(
          searchQueryParams.searchQueryParserResult[0].type,
          ruleWithAvailabilityInfo
        )
        .resolves([]);
      searchV4Service
        .searchProducts(searchQueryParams)
        .then(() => {
          productV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          productV4DAOMock.restore();
        });
    });
    it('should not add offsetCursor in to search query when offsetCursor is "last-page-cursor" in the request', (done) => {
      searchQueryParams.hasCounts = true;
      searchQueryParams.hasTotalPrices = true;
      searchQueryParams.offsetCursor = 'last-page-cursor';
      searchQueryParams.limit = 2;
      const availabilityName = searchQueryParams.availabilityName;
      const availabilityStatus = searchQueryParams.availabilityStatus;
      searchQueryParams.availability = {
        name: 'some-channel',
        status: ['some-rule', 'some-status']
      };
      const ruleWithAvailabilityInfo = {
        $and: [
          searchQueryParams.searchQueryParserResult[0].rules,
          {
            availability: {
              $elemMatch: {
                name: availabilityName,
                status: { $all: availabilityStatus }
              }
            }
          }
        ]
      };
      const count = 5;
      const rulesQueryWithOffsetCursor = ruleWithAvailabilityInfo;
      delete searchQueryParams.searchQueryParserResult[0].attributes;
      productV4DAOMock
        .expects('getProductsCountByRule')
        .once()
        .withArgs(
          searchQueryParams.searchQueryParserResult[0].type,
          ruleWithAvailabilityInfo
        )
        .resolves(count);
      const limitToProcess =
        count % searchQueryParams.limit || searchQueryParams.limit;

      const lastPageRequest: IProductsRuleRequest = {
        availability: searchQueryParams.availability,
        availabilityName: searchQueryParams.availabilityName,
        limit: limitToProcess,
        offset: searchQueryParams.offset,
        offsetCursor: searchQueryParams.offsetCursor,
        productType: searchQueryParams.searchQueryParserResult[0].type,
        projections: ['_id'],
        rules: rulesQueryWithOffsetCursor,
        sortOrder: 'desc'
      };
      const firstPageRequest: IProductsRuleRequest = {
        ...lastPageRequest,
        offsetCursor: null,
        sortOrder: 'asc'
      };
      const products = [{ _id: 'some-uuid' }];
      const lastProducts = [{ _id: 'last-page-id' }];

      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(lastPageRequest)
        .resolves(lastProducts);

      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(firstPageRequest)
        .resolves(products);

      productV4DAOMock
        .expects('getProductsPriceByRules')
        .once()
        .withArgs(
          searchQueryParams.searchQueryParserResult[0].type,
          ruleWithAvailabilityInfo
        )
        .resolves([]);
      searchV4Service
        .searchProducts(searchQueryParams)
        .then(() => {
          productV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          productV4DAOMock.restore();
        });
    });
    it(`should keep limit as it is in search query when offsetCursor is "last-page-cursor" in the request
        and modulus operation on count result is 0`, (done) => {
      searchQueryParams.hasCounts = true;
      searchQueryParams.hasTotalPrices = true;
      searchQueryParams.offsetCursor = 'last-page-cursor';
      searchQueryParams.limit = 2;
      const availabilityName = searchQueryParams.availabilityName;
      const availabilityStatus = searchQueryParams.availabilityStatus;
      searchQueryParams.availability = {
        name: 'some-channel',
        status: ['some-rule', 'some-status']
      };
      const ruleWithAvailabilityInfo = {
        $and: [
          searchQueryParams.searchQueryParserResult[0].rules,
          {
            availability: {
              $elemMatch: {
                name: availabilityName,
                status: { $all: availabilityStatus }
              }
            }
          }
        ]
      };
      const count = 6;
      const rulesQueryWithOffsetCursor = ruleWithAvailabilityInfo;
      delete searchQueryParams.searchQueryParserResult[0].attributes;
      productV4DAOMock
        .expects('getProductsCountByRule')
        .once()
        .withArgs(
          searchQueryParams.searchQueryParserResult[0].type,
          ruleWithAvailabilityInfo
        )
        .resolves(count);
      const limitToProcess =
        count % searchQueryParams.limit || searchQueryParams.limit;

      const lastPageRequest: IProductsRuleRequest = {
        availability: searchQueryParams.availability,
        availabilityName: searchQueryParams.availabilityName,
        limit: limitToProcess,
        offset: searchQueryParams.offset,
        offsetCursor: searchQueryParams.offsetCursor,
        productType: searchQueryParams.searchQueryParserResult[0].type,
        projections: ['_id'],
        rules: rulesQueryWithOffsetCursor,
        sortOrder: 'desc'
      };
      const firstPageRequest: IProductsRuleRequest = {
        ...lastPageRequest,
        limit: 1,
        offsetCursor: null,
        sortOrder: 'asc'
      };
      const products = [{ _id: 'some-uuid' }];
      const lastProducts = [{ _id: 'last-page-id' }];

      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(lastPageRequest)
        .resolves(lastProducts);

      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(firstPageRequest)
        .resolves(products);

      productV4DAOMock
        .expects('getProductsPriceByRules')
        .once()
        .withArgs(
          searchQueryParams.searchQueryParserResult[0].type,
          ruleWithAvailabilityInfo
        )
        .resolves([]);
      searchV4Service
        .searchProducts(searchQueryParams)
        .then(() => {
          productV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          productV4DAOMock.restore();
        });
    });
    it(`should update limit in search query when offsetCursor is "last-page-cursor" in the request
      and modulus operation on count result is non zero`, (done) => {
      searchQueryParams.hasCounts = true;
      searchQueryParams.hasTotalPrices = true;
      searchQueryParams.offsetCursor = 'last-page-cursor';
      searchQueryParams.limit = 2;
      const availabilityName = searchQueryParams.availabilityName;
      const availabilityStatus = searchQueryParams.availabilityStatus;
      searchQueryParams.availability = {
        name: 'some-channel',
        status: ['some-rule', 'some-status']
      };
      const ruleWithAvaliabilityInfo = {
        $and: [
          searchQueryParams.searchQueryParserResult[0].rules,
          {
            availability: {
              $elemMatch: {
                name: availabilityName,
                status: { $all: availabilityStatus }
              }
            }
          }
        ]
      };
      const count = 5;
      const rulesQueryWithOffsetCursor = ruleWithAvaliabilityInfo;
      delete searchQueryParams.searchQueryParserResult[0].attributes;
      productV4DAOMock
        .expects('getProductsCountByRule')
        .once()
        .withArgs(
          searchQueryParams.searchQueryParserResult[0].type,
          ruleWithAvaliabilityInfo
        )
        .resolves(count);
      const limitToProcess =
        count % searchQueryParams.limit || searchQueryParams.limit;
      const lastPageRequest: IProductsRuleRequest = {
        availability: searchQueryParams.availability,
        availabilityName: searchQueryParams.availabilityName,
        limit: limitToProcess,
        offset: searchQueryParams.offset,
        offsetCursor: searchQueryParams.offsetCursor,
        productType: searchQueryParams.searchQueryParserResult[0].type,
        projections: ['_id'],
        rules: rulesQueryWithOffsetCursor,
        sortOrder: 'desc'
      };
      const firstPageRequest: IProductsRuleRequest = {
        ...lastPageRequest,
        offsetCursor: null,
        sortOrder: 'asc'
      };
      const products = [{ _id: 'some-uuid' }];
      const lastProducts = [{ _id: 'last-page-id' }];

      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(lastPageRequest)
        .resolves(lastProducts);

      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(firstPageRequest)
        .resolves(products);

      productV4DAOMock
        .expects('getProductsPriceByRules')
        .once()
        .withArgs(
          searchQueryParams.searchQueryParserResult[0].type,
          ruleWithAvaliabilityInfo
        )
        .resolves([]);
      searchV4Service
        .searchProducts(searchQueryParams)
        .then(() => {
          productV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          productV4DAOMock.restore();
        });
    });
    it('should reverse products received from dao layer when offsetCursor is "last-page-cursor" in the request', (done) => {
      searchQueryParams.hasCounts = true;
      searchQueryParams.hasTotalPrices = true;
      searchQueryParams.offsetCursor = 'last-page-cursor';
      searchQueryParams.limit = 2;
      const availabilityName = searchQueryParams.availabilityName;
      const availabilityStatus = searchQueryParams.availabilityStatus;
      searchQueryParams.availability = {
        name: 'some-channel',
        status: ['some-rule', 'some-status']
      };
      const ruleWithAvaliabilityInfo = {
        $and: [
          searchQueryParams.searchQueryParserResult[0].rules,
          {
            availability: {
              $elemMatch: {
                name: availabilityName,
                status: { $all: availabilityStatus }
              }
            }
          }
        ]
      };
      const count = 5;
      const rulesQueryWithOffsetCursor = ruleWithAvaliabilityInfo;
      delete searchQueryParams.searchQueryParserResult[0].attributes;
      const products = [
        {
          _id: 'dc3dbba1-ef70-4d63-ab6c-89400b5f5b4a',
          categories: [
            {
              code: 'SA',
              name: 'Linguistics UK',
              type: 'flexcat'
            },
            {
              code: 'WB021',
              name: 'MATHnetBASE',
              type: 'netBASE'
            },
            {
              name: 'sdgo goal 1',
              type: 'sdgo'
            },
            {
              name: 'monograph',
              type: 'book-type'
            },
            {
              name: 'presentation',
              type: 'media-type'
            }
          ],
          contributors: [
            {
              fullName: 'Fiona Whelan'
            }
          ],
          title: 'presentation on SDGO Goal 6',
          type: 'creativeWork'
        },
        {
          _id: '74d636ab-d207-414d-9e16-b54e9267da56',
          categories: [
            {
              code: 'SA',
              name: 'Linguistics UK',
              type: 'flexcat'
            },
            {
              code: 'WB021',
              name: 'MATHnetBASE',
              type: 'netBASE'
            },
            {
              name: 'sdgo goal 1',
              type: 'sdgo'
            },
            {
              name: 'monograph',
              type: 'book-type'
            },
            {
              name: 'presentation',
              type: 'media-type'
            }
          ],
          contributors: [
            {
              fullName: 'Fiona Whelan'
            }
          ],
          title: 'presentation on SDGO Goal 5',
          type: 'creativeWork'
        },
        {
          _id: '650cd63a-8d6a-46ed-be97-b6bd64d82d30',
          categories: [
            {
              code: 'SA',
              name: 'Linguistics UK',
              type: 'flexcat'
            },
            {
              code: 'WB021',
              name: 'MATHnetBASE',
              type: 'netBASE'
            },
            {
              name: 'sdgo goal 1',
              type: 'sdgo'
            },
            {
              name: 'monograph',
              type: 'book-type'
            },
            {
              name: 'presentation',
              type: 'media-type'
            }
          ],
          contributors: [
            {
              fullName: 'Fiona Whelan'
            }
          ],
          title: 'presentation on SDGO Goal 3',
          type: 'creativeWork'
        }
      ];
      productV4DAOMock
        .expects('getProductsCountByRule')
        .once()
        .withArgs(
          searchQueryParams.searchQueryParserResult[0].type,
          ruleWithAvaliabilityInfo
        )
        .resolves(count);
      const limitToProcess =
        count % searchQueryParams.limit || searchQueryParams.limit;
      const lastPageRequest: IProductsRuleRequest = {
        availability: searchQueryParams.availability,
        availabilityName: searchQueryParams.availabilityName,
        limit: limitToProcess,
        offset: searchQueryParams.offset,
        offsetCursor: searchQueryParams.offsetCursor,
        productType: searchQueryParams.searchQueryParserResult[0].type,
        projections: ['_id'],
        rules: rulesQueryWithOffsetCursor,
        sortOrder: 'desc'
      };
      const firstPageRequest: IProductsRuleRequest = {
        ...lastPageRequest,
        limit: 1,
        offsetCursor: null,
        sortOrder: 'asc'
      };
      const lastProducts = [{ _id: '650cd63a-8d6a-46ed-be97-b6bd64d82d30' }];

      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(lastPageRequest)
        .resolves(products);

      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(firstPageRequest)
        .resolves(lastProducts);

      productV4DAOMock
        .expects('getProductsPriceByRules')
        .once()
        .withArgs(
          searchQueryParams.searchQueryParserResult[0].type,
          ruleWithAvaliabilityInfo
        )
        .resolves([]);
      searchV4Service
        .searchProducts(searchQueryParams)
        .then((response) => {
          const revProducts = response.products;
          expect(revProducts[0].product._id).to.equal(
            '650cd63a-8d6a-46ed-be97-b6bd64d82d30'
          );
          expect(revProducts[1].product._id).to.equal(
            '74d636ab-d207-414d-9e16-b54e9267da56'
          );
          productV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          productV4DAOMock.restore();
        });
    });
    it('should return _id of the last product as nextPageCursor for the given search query', (done) => {
      searchQueryParams.hasCounts = false;
      searchQueryParams.hasTotalPrices = false;
      searchQueryParams.offsetCursor = 'xyz:pqr:12345678_asc';
      searchQueryParams.availabilityName = null;
      searchQueryParams.availabilityStatus = undefined;
      const ruleWithAvaliabilityInfo =
        searchQueryParams.searchQueryParserResult[0].rules;
      const rulesQueryWithOffsetCursor = {
        $and: [ruleWithAvaliabilityInfo, { _id: { $gt: '12345678' } }]
      };
      const products = [
        {
          _id: 'product_uuid1'
        },
        {
          _id: 'product_uuid2'
        },
        {
          _id: 'product_uuid3'
        }
      ];
      delete searchQueryParams.searchQueryParserResult[0].attributes;
      const firstPageRequest: IProductsRuleRequest = {
        availability: undefined,
        availabilityName: searchQueryParams.availabilityName,
        limit: searchQueryParams.limit,
        offset: searchQueryParams.offset,
        offsetCursor: '12345678',
        productType: searchQueryParams.searchQueryParserResult[0].type,
        projections: ['_id'],
        rules: rulesQueryWithOffsetCursor,
        sortOrder: 'asc'
      };
      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(firstPageRequest)
        .resolves(products);
      productV4DAOMock.expects('getProductsCountByRule').never();
      productV4DAOMock.expects('getProductsPriceByRules').never();
      searchV4Service
        .searchProducts(searchQueryParams)
        .then((result) => {
          expect(result).to.be.an('object');
          expect(result.products.length).to.eql(3);
          expect(result.nextPageCursor).to.equal('xyz:pqr:product_uuid3_asc');
          productV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          productV4DAOMock.restore();
        });
    });
    it(
      'should return the products along with availability info ' +
        'when availability name, projections passed in the request',
      (done) => {
        searchQueryParams.hasCounts = false;
        searchQueryParams.hasTotalPrices = false;
        const availabilityName = searchQueryParams.availabilityName;
        searchQueryParams.availability = {
          name: 'some-channel',
          status: ['some-rule', 'some-status']
        };
        delete searchQueryParams.availabilityStatus;
        const ruleWithAvaliabilityInfo = {
          $and: [
            searchQueryParams.searchQueryParserResult[0].rules,
            { 'availability.name': availabilityName }
          ]
        };
        const products = [
          {
            _id: 'some-uuid',
            availability: serchResult.products[0].availability,
            identifiers: {
              isbn: 'some-isbn'
            },
            title: 'some-title'
          }
        ];
        const lastProducts = [{ _id: 'last-page-id' }];
        const firstPageRequest: IProductsRuleRequest = {
          availability: searchQueryParams.availability,
          availabilityName: searchQueryParams.availabilityName,
          limit: searchQueryParams.limit,
          offset: searchQueryParams.offset,
          offsetCursor: searchQueryParams.offsetCursor,
          productType: searchQueryParams.searchQueryParserResult[0].type,
          projections: ['_id'],
          rules: ruleWithAvaliabilityInfo,
          sortOrder: 'asc'
        };
        const lastPageRequest: IProductsRuleRequest = {
          ...firstPageRequest,
          offset: null,
          offsetCursor: 'last-page-cursor',
          sortOrder: 'desc'
        };
        productV4DAOMock
          .expects('getProductsByRule')
          .once()
          .withArgs(firstPageRequest)
          .resolves(products);
        productV4DAOMock
          .expects('getProductsByRule')
          .once()
          .withArgs(lastPageRequest)
          .resolves(lastProducts);

        productV4DAOMock.expects('getProductsCountByRule').never();
        productV4DAOMock.expects('getProductsPriceByRules').never();
        searchV4Service
          .searchProducts(searchQueryParams)
          .then((result) => {
            expect(result).to.be.an('object');
            expect(result.counts).to.eql(null);
            expect(result.prices).to.eql(null);
            expect(result.products.length).to.eql(1);
            expect(result.products).to.eql(serchResult.products);
            productV4DAOMock.verify();
            done();
          })
          .catch(done)
          .finally(() => {
            productV4DAOMock.restore();
          });
      }
    );
    it(`should return the products without associatedMedia info when
        associatedMedia.parentId projections passed in the request`, (done) => {
      searchQueryParams.hasCounts = false;
      searchQueryParams.hasTotalPrices = false;
      const availabilityName = searchQueryParams.availabilityName;
      searchQueryParams.availability = {
        name: 'some-channel',
        status: ['some-rule', 'some-status']
      };
      delete searchQueryParams.availabilityStatus;
      searchQueryParams.searchQueryParserResult[0].attributes.push(
        'associatedMedia.parentId'
      );
      const ruleWithAvaliabilityInfo = {
        $and: [
          searchQueryParams.searchQueryParserResult[0].rules,
          { 'availability.name': availabilityName }
        ]
      };
      const products = [
        {
          _id: 'some-uuid',
          availability: serchResult.products[0].availability,
          identifiers: {
            isbn: 'some-isbn'
          },
          title: 'some-title'
        }
      ];
      const lastProducts = [{ _id: 'last-page-id' }];
      const firstPageRequest: IProductsRuleRequest = {
        availability: searchQueryParams.availability,
        availabilityName: searchQueryParams.availabilityName,
        limit: searchQueryParams.limit,
        offset: searchQueryParams.offset,
        offsetCursor: searchQueryParams.offsetCursor,
        productType: searchQueryParams.searchQueryParserResult[0].type,
        projections: searchQueryParams.searchQueryParserResult[0].attributes,
        rules: ruleWithAvaliabilityInfo,
        sortOrder: 'asc'
      };
      const lastPageRequest: IProductsRuleRequest = {
        ...firstPageRequest,
        offset: null,
        offsetCursor: 'last-page-cursor',
        projections: ['_id'],
        sortOrder: 'desc'
      };
      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(firstPageRequest)
        .resolves(products);
      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(lastPageRequest)
        .resolves(lastProducts);

      associatedMediaV4ServiceMock.expects('getAsstMediasByParentIds').never();
      productV4DAOMock.expects('getProductsCountByRule').never();
      productV4DAOMock.expects('getProductsPriceByRules').never();
      searchV4Service
        .searchProducts(searchQueryParams)
        .then((result) => {
          expect(result).to.be.an('object');
          expect(result.counts).to.eql(null);
          expect(result.prices).to.eql(null);
          expect(result.products.length).to.eql(1);
          expect(result.products).to.eql(serchResult.products);
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
    it(`should return the products along with availability info when availability name and
        associatedMedia (type & location) projections passed in the request`, (done) => {
      searchQueryParams.hasCounts = false;
      searchQueryParams.hasTotalPrices = false;
      const availabilityName = searchQueryParams.availabilityName;
      searchQueryParams.availability = {
        name: 'some-channel',
        status: ['some-rule', 'some-status']
      };
      delete searchQueryParams.availabilityStatus;
      searchQueryParams.searchQueryParserResult[0].attributes.push(
        'associatedMedia.type'
      );
      searchQueryParams.searchQueryParserResult[0].attributes.push(
        'associatedMedia.location'
      );
      const ruleWithAvaliabilityInfo = {
        $and: [
          searchQueryParams.searchQueryParserResult[0].rules,
          { 'availability.name': availabilityName }
        ]
      };
      const products = [
        {
          _id: 'some-uuid',
          availability: serchResult.products[0].availability,
          identifiers: {
            isbn: 'some-isbn'
          },
          title: 'some-title'
        }
      ];
      const associatedMedia = [
        {
          _id: 'some-id',
          location: 'image-url',
          parentId: 'some-uuid',
          size: 0,
          type: 'coverimage'
        }
      ];
      const testProductIds = ['some-uuid'];
      serchResult.products[0].product['associatedMedia'] = [
        {
          location: associatedMedia[0].location,
          type: associatedMedia[0].type
        }
      ];
      const lastProducts = [{ _id: 'some-uuid' }];
      const firstPageRequest: IProductsRuleRequest = {
        availability: searchQueryParams.availability,
        availabilityName: searchQueryParams.availabilityName,
        limit: searchQueryParams.limit,
        offset: searchQueryParams.offset,
        offsetCursor: searchQueryParams.offsetCursor,
        productType: searchQueryParams.searchQueryParserResult[0].type,
        projections: searchQueryParams.searchQueryParserResult[0].attributes,
        rules: ruleWithAvaliabilityInfo,
        sortOrder: 'asc'
      };
      const lastPageRequest: IProductsRuleRequest = {
        ...firstPageRequest,
        offset: null,
        offsetCursor: 'last-page-cursor',
        projections: ['_id'],
        sortOrder: 'desc'
      };
      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(firstPageRequest)
        .resolves(products);
      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(lastPageRequest)
        .resolves(lastProducts);

      associatedMediaV4ServiceMock
        .expects('getAsstMediasByParentIds')
        .once()
        .withArgs(testProductIds)
        .returns(associatedMedia);
      productV4DAOMock.expects('getProductsCountByRule').never();
      productV4DAOMock.expects('getProductsPriceByRules').never();
      searchV4Service
        .searchProducts(searchQueryParams)
        .then((result) => {
          expect(result).to.be.an('object');
          expect(result.counts).to.eql(null);
          expect(result.prices).to.eql(null);
          expect(result.products.length).to.eql(1);
          expect(result.products).to.eql(serchResult.products);
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
    it(`should return the products along with availability info when availability name and
        associatedMedia.type projections passed in the request`, (done) => {
      searchQueryParams.hasCounts = false;
      searchQueryParams.hasTotalPrices = false;
      const availabilityName = searchQueryParams.availabilityName;
      searchQueryParams.availability = {
        name: 'some-channel',
        status: ['some-rule', 'some-status']
      };
      delete searchQueryParams.availabilityStatus;
      searchQueryParams.searchQueryParserResult[0].attributes.push(
        'associatedMedia.type'
      );
      const ruleWithAvaliabilityInfo = {
        $and: [
          searchQueryParams.searchQueryParserResult[0].rules,
          { 'availability.name': availabilityName }
        ]
      };
      const products = [
        {
          _id: 'some-uuid',
          availability: serchResult.products[0].availability,
          identifiers: {
            isbn: 'some-isbn'
          },
          title: 'some-title'
        }
      ];
      const associatedMedia = [
        {
          _id: 'some-id',
          location: 'image-url',
          parentId: 'some-uuid',
          size: 0,
          type: 'coverimage'
        }
      ];
      const testProductIds = ['some-uuid'];
      serchResult.products[0].product['associatedMedia'] = [
        {
          type: associatedMedia[0].type
        }
      ];
      const lastProducts = [{ _id: 'some-uuid' }];
      const firstPageRequest: IProductsRuleRequest = {
        availability: searchQueryParams.availability,
        availabilityName: searchQueryParams.availabilityName,
        limit: searchQueryParams.limit,
        offset: searchQueryParams.offset,
        offsetCursor: searchQueryParams.offsetCursor,
        productType: searchQueryParams.searchQueryParserResult[0].type,
        projections: searchQueryParams.searchQueryParserResult[0].attributes,
        rules: ruleWithAvaliabilityInfo,
        sortOrder: 'asc'
      };
      const lastPageRequest: IProductsRuleRequest = {
        ...firstPageRequest,
        offset: null,
        offsetCursor: 'last-page-cursor',
        projections: ['_id'],
        sortOrder: 'desc'
      };
      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(firstPageRequest)
        .resolves(products);
      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(lastPageRequest)
        .resolves(lastProducts);
      associatedMediaV4ServiceMock
        .expects('getAsstMediasByParentIds')
        .once()
        .withArgs(testProductIds)
        .returns(associatedMedia);
      productV4DAOMock.expects('getProductsCountByRule').never();
      productV4DAOMock.expects('getProductsPriceByRules').never();
      searchV4Service
        .searchProducts(searchQueryParams)
        .then((result) => {
          expect(result).to.be.an('object');
          expect(result.counts).to.eql(null);
          expect(result.prices).to.eql(null);
          expect(result.products.length).to.eql(1);
          expect(result.products).to.eql(serchResult.products);
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
    it(`should return the products along with availability info when availability name and
        associatedMedia.location projections passed in the request`, (done) => {
      searchQueryParams.hasCounts = false;
      searchQueryParams.hasTotalPrices = false;
      const availabilityName = searchQueryParams.availabilityName;
      searchQueryParams.availability = {
        name: 'some-channel',
        status: ['some-rule', 'some-status']
      };
      delete searchQueryParams.availabilityStatus;
      searchQueryParams.searchQueryParserResult[0].attributes.push(
        'associatedMedia.location'
      );
      const ruleWithAvaliabilityInfo = {
        $and: [
          searchQueryParams.searchQueryParserResult[0].rules,
          { 'availability.name': availabilityName }
        ]
      };
      const products = [
        {
          _id: 'some-uuid',
          availability: serchResult.products[0].availability,
          identifiers: {
            isbn: 'some-isbn'
          },
          title: 'some-title'
        }
      ];
      const associatedMedia = [
        {
          _id: 'some-id',
          location: 'image-url',
          parentId: 'some-uuid',
          size: 0,
          type: 'coverimage'
        }
      ];
      const testProductIds = ['some-uuid'];
      serchResult.products[0].product['associatedMedia'] = [
        {
          location: associatedMedia[0].location
        }
      ];
      const lastProducts = [{ _id: 'some-uuid' }];
      const firstPageRequest: IProductsRuleRequest = {
        availability: searchQueryParams.availability,
        availabilityName: searchQueryParams.availabilityName,
        limit: searchQueryParams.limit,
        offset: searchQueryParams.offset,
        offsetCursor: searchQueryParams.offsetCursor,
        productType: searchQueryParams.searchQueryParserResult[0].type,
        projections: searchQueryParams.searchQueryParserResult[0].attributes,
        rules: ruleWithAvaliabilityInfo,
        sortOrder: 'asc'
      };
      const lastPageRequest: IProductsRuleRequest = {
        ...firstPageRequest,
        offset: null,
        offsetCursor: 'last-page-cursor',
        projections: ['_id'],
        sortOrder: 'desc'
      };
      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(firstPageRequest)
        .resolves(products);
      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(lastPageRequest)
        .resolves(lastProducts);
      associatedMediaV4ServiceMock
        .expects('getAsstMediasByParentIds')
        .once()
        .withArgs(testProductIds)
        .returns(associatedMedia);
      productV4DAOMock.expects('getProductsCountByRule').never();
      productV4DAOMock.expects('getProductsPriceByRules').never();
      searchV4Service
        .searchProducts(searchQueryParams)
        .then((result) => {
          expect(result).to.be.an('object');
          expect(result.counts).to.eql(null);
          expect(result.prices).to.eql(null);
          expect(result.products.length).to.eql(1);
          expect(result.products).to.eql(serchResult.products);
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
    it(`should return the products along with availability info when availability name and
        associatedMedia (_id, type, size, location) projections passed in the request`, (done) => {
      searchQueryParams.hasCounts = false;
      searchQueryParams.hasTotalPrices = false;
      const availabilityName = searchQueryParams.availabilityName;
      searchQueryParams.availability = {
        name: 'some-channel',
        status: ['some-rule', 'some-status']
      };
      delete searchQueryParams.availabilityStatus;
      searchQueryParams.searchQueryParserResult[0].attributes.push(
        'associatedMedia'
      );
      const ruleWithAvaliabilityInfo = {
        $and: [
          searchQueryParams.searchQueryParserResult[0].rules,
          { 'availability.name': availabilityName }
        ]
      };
      const products = [
        {
          _id: 'some-uuid',
          availability: serchResult.products[0].availability,
          identifiers: {
            isbn: 'some-isbn'
          },
          title: 'some-title'
        }
      ];
      const associatedMedia = [
        {
          _id: 'some-id',
          location: 'image-url',
          parentId: 'some-uuid',
          size: 0,
          type: 'coverimage'
        }
      ];
      const testProductIds = ['some-uuid'];
      serchResult.products[0].product['associatedMedia'] = [
        {
          _id: associatedMedia[0]._id,
          location: associatedMedia[0].location,
          size: associatedMedia[0].size,
          type: associatedMedia[0].type
        }
      ];
      const lastProducts = [{ _id: 'some-uuid' }];
      const firstPageRequest: IProductsRuleRequest = {
        availability: searchQueryParams.availability,
        availabilityName: searchQueryParams.availabilityName,
        limit: searchQueryParams.limit,
        offset: searchQueryParams.offset,
        offsetCursor: searchQueryParams.offsetCursor,
        productType: searchQueryParams.searchQueryParserResult[0].type,
        projections: searchQueryParams.searchQueryParserResult[0].attributes,
        rules: ruleWithAvaliabilityInfo,
        sortOrder: 'asc'
      };
      const lastPageRequest: IProductsRuleRequest = {
        ...firstPageRequest,
        offset: null,
        offsetCursor: 'last-page-cursor',
        projections: ['_id'],
        sortOrder: 'desc'
      };
      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(firstPageRequest)
        .resolves(products);
      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(lastPageRequest)
        .resolves(lastProducts);
      associatedMediaV4ServiceMock
        .expects('getAsstMediasByParentIds')
        .once()
        .withArgs(testProductIds)
        .returns(associatedMedia);
      productV4DAOMock.expects('getProductsCountByRule').never();
      productV4DAOMock.expects('getProductsPriceByRules').never();
      searchV4Service
        .searchProducts(searchQueryParams)
        .then((result) => {
          expect(result).to.be.an('object');
          expect(result.counts).to.eql(null);
          expect(result.prices).to.eql(null);
          expect(result.products.length).to.eql(1);
          expect(result.products).to.eql(serchResult.products);
          productV4DAOMock.verify();
          associatedMediaV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          productV4DAOMock.restore();
          associatedMediaV4ServiceMock.restore();
        });
    });
    it('should NOT add book.firstPublishedYearNumber to attributes of searchQuery', (done) => {
      searchQueryParams.hasCounts = false;
      searchQueryParams.hasTotalPrices = false;
      searchQueryParams.searchQueryParserResult[0].attributes = [
        '_id',
        'book.firstPublishedYear'
      ];
      delete searchQueryParams.availabilityName;
      delete searchQueryParams.availabilityStatus;
      const products = [
        {
          _id: 'some-uuid',
          type: 'book'
        }
      ];
      const lastProducts = [{ _id: 'some-uuid' }];
      const firstPageRequest: IProductsRuleRequest = {
        availability: undefined,
        availabilityName: null,
        limit: searchQueryParams.limit,
        offset: searchQueryParams.offset,
        offsetCursor: searchQueryParams.offsetCursor,
        productType: searchQueryParams.searchQueryParserResult[0].type,
        projections: searchQueryParams.searchQueryParserResult[0].attributes,
        rules: searchQueryParams.searchQueryParserResult[0].rules,
        sortOrder: 'asc'
      };
      const lastPageRequest: IProductsRuleRequest = {
        ...firstPageRequest,
        offset: null,
        offsetCursor: 'last-page-cursor',
        projections: ['_id'],
        sortOrder: 'desc'
      };
      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(firstPageRequest)
        .resolves(products);
      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(lastPageRequest)
        .resolves(lastProducts);
      productV4DAOMock.expects('getProductsCountByRule').never();
      productV4DAOMock.expects('getProductsPriceByRules').never();
      searchV4Service
        .searchProducts(searchQueryParams)
        .then((result) => {
          expect(result).to.be.an('object');
          productV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          productV4DAOMock.restore();
        });
    });
    it('should NOT rename firstPublishedYearNumber and should return firstPublishedYear = 2010 (string)', (done) => {
      searchQueryParams.hasCounts = false;
      searchQueryParams.hasTotalPrices = false;
      searchQueryParams.searchQueryParserResult[0].attributes = [
        '_id',
        'book.firstPublishedYear'
      ];
      delete searchQueryParams.availabilityName;
      delete searchQueryParams.availabilityStatus;
      const products = [
        {
          _id: 'some-uuid',
          book: {
            firstPublishedYear: 2010,
            firstPublishedYearNumber: 2020
          },
          type: 'book'
        }
      ];
      const lastProducts = [{ _id: 'some-uuid' }];
      const firstPageRequest: IProductsRuleRequest = {
        availability: undefined,
        availabilityName: null,
        limit: searchQueryParams.limit,
        offset: searchQueryParams.offset,
        offsetCursor: searchQueryParams.offsetCursor,
        productType: searchQueryParams.searchQueryParserResult[0].type,
        projections: searchQueryParams.searchQueryParserResult[0].attributes,
        rules: searchQueryParams.searchQueryParserResult[0].rules,
        sortOrder: 'asc'
      };
      const lastPageRequest: IProductsRuleRequest = {
        ...firstPageRequest,
        offset: null,
        offsetCursor: 'last-page-cursor',
        projections: ['_id'],
        sortOrder: 'desc'
      };
      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(firstPageRequest)
        .resolves(products);
      productV4DAOMock
        .expects('getProductsByRule')
        .once()
        .withArgs(lastPageRequest)
        .resolves(lastProducts);
      productV4DAOMock.expects('getProductsCountByRule').never();
      productV4DAOMock.expects('getProductsPriceByRules').never();
      searchV4Service
        .searchProducts(searchQueryParams)
        .then((result) => {
          expect(result).to.be.an('object');
          expect(result.products[0].product.book.firstPublishedYear).to.eql(
            '2010'
          );
          productV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          productV4DAOMock.restore();
        });
    });
  });
  describe('getSearchMetadata', () => {
    let searchQueryParserResult = [];
    let prices = [];
    beforeEach(() => {
      prices = [
        {
          currency: 'EUR',
          price: 264,
          priceType: 'BYO Library Price',
          priceTypeCode: 'BYO',
          productsCount: 10
        },
        {
          currency: 'GBP',
          price: 120,
          priceType: 'BYO Library Price',
          priceTypeCode: 'BYO',
          productsCount: 5
        }
      ];
      searchQueryParserResult = [
        {
          rules: {},
          type: 'book'
        },
        {
          rules: {},
          type: 'collection'
        }
      ];
    });
    it('should return data for counts & prices when hasCounts & hasTotalPrices is true ', (done) => {
      productV4DAOMock.expects('getProductsByRule').never();
      productV4DAOMock.expects('getProductsCountByRule').twice().resolves(1);
      productV4DAOMock
        .expects('getProductsPriceByRules')
        .twice()
        .resolves(prices);
      searchV4Service
        .getSearchMetadata(searchQueryParserResult, {
          hasCounts: true,
          hasTotalPrices: true
        })
        .then((result) => {
          expect(result).to.be.an('object');
          expect(result.counts.length).to.eql(3);
          expect(result.counts).to.deep.equal([
            {
              count: 1,
              type: 'book'
            },
            {
              count: 1,
              type: 'collection'
            },
            {
              count: 2,
              type: 'Total'
            }
          ]);
          expect(result.prices.length).to.be.equal(2);
          expect(result.prices).to.deep.equal([
            {
              currency: 'EUR',
              price: 264 * 2,
              priceType: 'BYO Library Price',
              priceTypeCode: 'BYO',
              productsCount: 10 * 2
            },
            {
              currency: 'GBP',
              price: 120 * 2,
              priceType: 'BYO Library Price',
              priceTypeCode: 'BYO',
              productsCount: 5 * 2
            }
          ]);
          productV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          productV4DAOMock.restore();
        });
    });
    it('should return data for counts when hasCounts is true', (done) => {
      productV4DAOMock.expects('getProductsByRule').never();
      productV4DAOMock.expects('getProductsCountByRule').twice().resolves(1);
      productV4DAOMock.expects('getProductsPriceByRules').never();
      searchV4Service
        .getSearchMetadata(searchQueryParserResult, {
          hasCounts: true,
          hasTotalPrices: false
        })
        .then((result) => {
          expect(result).to.be.an('object');
          expect(result.counts.length).to.eql(3);
          expect(result.counts).to.deep.equal([
            {
              count: 1,
              type: 'book'
            },
            {
              count: 1,
              type: 'collection'
            },
            {
              count: 2,
              type: 'Total'
            }
          ]);
          expect(result.prices).to.be.equal(null);
          productV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          productV4DAOMock.restore();
        });
    });
    it('should return data for prices when hasTotalPrices is true', (done) => {
      productV4DAOMock.expects('getProductsByRule').never();
      productV4DAOMock.expects('getProductsCountByRule').twice().resolves(1);
      productV4DAOMock
        .expects('getProductsPriceByRules')
        .twice()
        .resolves(prices);
      searchV4Service
        .getSearchMetadata(searchQueryParserResult, {
          hasCounts: false,
          hasTotalPrices: true
        })
        .then((result) => {
          expect(result).to.be.an('object');
          expect(result.counts).to.eql(null);
          expect(result.prices.length).to.be.equal(2);
          expect(result.prices).to.deep.equal([
            {
              currency: 'EUR',
              price: 264 * 2,
              priceType: 'BYO Library Price',
              priceTypeCode: 'BYO',
              productsCount: 10 * 2
            },
            {
              currency: 'GBP',
              price: 120 * 2,
              priceType: 'BYO Library Price',
              priceTypeCode: 'BYO',
              productsCount: 5 * 2
            }
          ]);
          productV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          productV4DAOMock.restore();
        });
    });
    it('should return null for counts & prices when hasCounts & hasTotalPrices is false', (done) => {
      productV4DAOMock.expects('getProductsByRule').never();
      productV4DAOMock.expects('getProductsCountByRule').twice().resolves(1);
      productV4DAOMock.expects('getProductsPriceByRules').never();
      searchV4Service
        .getSearchMetadata(searchQueryParserResult, {
          hasCounts: false,
          hasTotalPrices: false
        })
        .then((result) => {
          expect(result).to.be.an('object');
          expect(result.counts).to.eql(null);
          expect(result.prices).to.eql(null);
          productV4DAOMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          productV4DAOMock.restore();
        });
    });
    it('should throw error 404 when no products found.', (done) => {
      productV4DAOMock.expects('getProductsByRule').never();
      productV4DAOMock.expects('getProductsCountByRule').twice().resolves(0);
      productV4DAOMock.expects('getProductsPriceByRules').twice().resolves([]);
      searchV4Service
        .getSearchMetadata(searchQueryParserResult, {
          hasCounts: true,
          hasTotalPrices: true
        })
        .then((result) => {
          done(new Error('Expecting error, but got success'));
        })
        .catch((error) => {
          expect(error.code).to.be.equal(404);
          expect(error.message).to.be.equal('Products not found.');
          productV4DAOMock.verify();
          done();
        })
        .finally(() => {
          productV4DAOMock.restore();
        });
    });
  });
  describe('_getQueryWithAvailability', () => {
    const searchQueryParserResult: ISearchQuery[] = [
      {
        attributes: ['title', 'type', 'contributors.fullName', 'categories'],
        rules: {
          $and: [
            {
              'creativeWork.format': {
                $eq: 'video'
              }
            },
            {
              availability: {
                $all: [
                  {
                    $elemMatch: {
                      name: 'AGG',
                      status: {
                        $all: ['SELLABLE']
                      }
                    }
                  }
                ]
              }
            }
          ]
        },
        type: 'creativeWork'
      }
    ];
    const availability: IAvailabilityArray[] = [
      {
        name: 'UBX',
        status: {
          ALL: ['SELLABLE']
        }
      }
    ];
    it(`should use product level availability in query when availability is present
        at both level`, () => {
      const res = searchV4Service._getQueryWithAvailability(
        searchQueryParserResult,
        null,
        null,
        availability
      );
      expect(res).to.deep.equal(searchQueryParserResult);
    });
    it(`should use root level availability in query when availability is
             only at root level`, () => {
      searchQueryParserResult[0] = {
        attributes: ['title', 'type', 'contributors.fullName', 'categories'],
        rules: {
          $and: [
            {
              'book.format': {
                $eq: 'pdf'
              }
            },
            {
              availability: {
                $all: [
                  {
                    $elemMatch: {
                      name: 'UBX',
                      status: {
                        $all: ['SELLABLE']
                      }
                    }
                  }
                ]
              }
            }
          ]
        },
        type: 'book'
      };
      const res = searchV4Service._getQueryWithAvailability(
        searchQueryParserResult,
        null,
        null,
        availability
      );
      expect(res).to.deep.equal(searchQueryParserResult);
    });
  });
});
