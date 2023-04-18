import { SchemaMapperV4 } from '@tandfgroup/pcm-schema-mapper-v4';
import { expect } from 'chai';

import { ESQueryParser } from './esQueryParser';
import {
  GroupedSearchQuery,
  SearchQuery
} from '../common/model/SearchQueryRule';
import * as rulesTestHelper from '../test/rulesTestHelper';

const eSQueryParser = new ESQueryParser(SchemaMapperV4);

describe('eSQueryParser', () => {
  describe('parseSearchQuery', () => {
    it(`should return proper output es query when valid searchQuery passed`, async () => {
      const testSearchQuery: SearchQuery = {
        rules: [
          rulesTestHelper.BEGIN,
          rulesTestHelper.BEGIN,
          {
            rule: {
              attribute: 'book.format',
              relationship: 'EQ',
              value: 'e-Book'
            },
            type: 'criteria'
          },
          rulesTestHelper.END,
          rulesTestHelper.AND,
          rulesTestHelper.BEGIN,
          {
            rule: {
              attribute: 'availability.status',
              relationship: 'ALL',
              values: ['SELLABLE', 'CAN_HOST']
            },
            type: 'criteria'
          },
          rulesTestHelper.AND,
          {
            rule: {
              attribute: 'availability.status',
              relationship: 'NI',
              values: ['DRM_PROTECTED']
            },
            type: 'criteria'
          },
          rulesTestHelper.AND,
          {
            rule: {
              attribute: 'availability.name',
              relationship: 'EQ',
              value: 'UBX'
            },
            type: 'criteria'
          },
          rulesTestHelper.END,
          rulesTestHelper.END
        ],
        type: 'book'
      };
      const expectedResult = {
        bool: {
          filter: [
            {
              bool: {
                filter: [
                  {
                    term: {
                      'book.format.keyword': 'e-Book'
                    }
                  }
                ]
              }
            },
            {
              bool: {
                filter: [
                  {
                    nested: {
                      path: 'availability',
                      query: {
                        bool: {
                          filter: [
                            {
                              terms_set: {
                                'availability.status.keyword': {
                                  minimum_should_match_script: {
                                    source: 'params.num_terms'
                                  },
                                  terms: ['SELLABLE', 'CAN_HOST']
                                }
                              }
                            },
                            {
                              term: {
                                'availability.name.keyword': 'UBX'
                              }
                            }
                          ]
                        }
                      }
                    }
                  },
                  {
                    bool: {
                      must_not: [
                        {
                          nested: {
                            path: 'availability',
                            query: {
                              bool: {
                                filter: [
                                  {
                                    term: {
                                      'availability.name.keyword': 'UBX'
                                    }
                                  },
                                  {
                                    terms: {
                                      'availability.status.keyword': [
                                        'DRM_PROTECTED'
                                      ]
                                    }
                                  }
                                ]
                              }
                            }
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ]
        }
      };
      const resultQuery = eSQueryParser.parseSearchQuery(testSearchQuery);
      expect(resultQuery).to.deep.equal(expectedResult);
      expect(resultQuery).to.be.an('object');
      expect(resultQuery).to.have.property('bool');
    });
    it(`should not add .keyword when attribute is _id`, async () => {
      const testSearchQuery: SearchQuery = {
        rules: [
          rulesTestHelper.BEGIN,
          {
            rule: {
              attribute: '_id',
              relationship: 'EQ',
              value: '123abc'
            },
            type: 'criteria'
          },
          rulesTestHelper.END
        ],
        type: 'book'
      };
      const expectedResult = {
        bool: {
          filter: [
            {
              term: {
                _id: '123abc'
              }
            }
          ]
        }
      };
      const resultQuery = eSQueryParser.parseSearchQuery(testSearchQuery);
      expect(resultQuery).to.deep.equal(expectedResult);
      expect(resultQuery).to.be.an('object');
      expect(resultQuery).to.have.property('bool');
    });
    it(`should return es query with must clause when valid searchQuery passed with LIKE operator`, async () => {
      const testSearchQuery: SearchQuery = {
        rules: [
          rulesTestHelper.BEGIN,
          rulesTestHelper.BEGIN,
          {
            rule: {
              attribute: 'book.format',
              relationship: 'EQ',
              value: 'e-Book'
            },
            type: 'criteria'
          },
          rulesTestHelper.AND,
          {
            rule: {
              attribute: 'title',
              relationship: 'LIKE',
              value: 'health'
            },
            type: 'criteria'
          },
          rulesTestHelper.END,
          rulesTestHelper.AND,
          rulesTestHelper.BEGIN,
          {
            rule: {
              attribute: 'availability.status',
              relationship: 'ALL',
              values: ['SELLABLE', 'CAN_HOST']
            },
            type: 'criteria'
          },
          rulesTestHelper.AND,
          {
            rule: {
              attribute: 'availability.name',
              relationship: 'EQ',
              value: 'UBX'
            },
            type: 'criteria'
          },
          rulesTestHelper.END,
          rulesTestHelper.END
        ],
        type: 'book'
      };

      const expectedResult = {
        bool: {
          must: [
            {
              bool: {
                must: [
                  {
                    term: {
                      'book.format.keyword': 'e-Book'
                    }
                  },
                  {
                    match: {
                      title: 'health'
                    }
                  }
                ]
              }
            },
            {
              nested: {
                path: 'availability',
                query: {
                  bool: {
                    must: [
                      {
                        terms_set: {
                          'availability.status.keyword': {
                            minimum_should_match_script: {
                              source: 'params.num_terms'
                            },
                            terms: ['SELLABLE', 'CAN_HOST']
                          }
                        }
                      },
                      {
                        term: {
                          'availability.name.keyword': 'UBX'
                        }
                      }
                    ]
                  }
                }
              }
            }
          ]
        }
      };
      const resultQuery = eSQueryParser.parseSearchQuery(testSearchQuery);
      expect(resultQuery).to.deep.equal(expectedResult);
      expect(resultQuery).to.be.an('object');
      expect(resultQuery).to.have.property('bool');
    });
  });
  describe('getESQuery', () => {
    it(`should throw error when invalid searchQuery passed`, async () => {
      const prefixQuery = {
        attribute: 'availability.name',
        operator: 'EQ',
        type: 'separator',
        value: 'UBX',
        values: null
      };

      try {
        eSQueryParser.getESQuery(prefixQuery, 'book', {
          needRelevanceScore: false
        });
      } catch (err) {
        expect(err.message).to.equal('Invalid Query type: separator');
      }
    });
  });
  describe('parse', () => {
    it(`should return proper output es query when valid searchQuery passed
      containing group rule with object`, async () => {
      const testSearchQuery: GroupedSearchQuery[] = [
        {
          attributes: ['_id'],
          rules: [
            {
              name: 'availability',
              rules: [
                rulesTestHelper.BEGIN,
                rulesTestHelper.BEGIN,
                {
                  rule: {
                    attribute: 'availability.name',
                    relationship: 'EQ',
                    value: 'UBX'
                  },
                  type: 'criteria'
                },
                rulesTestHelper.AND,
                {
                  rule: {
                    attribute: 'availability.status',
                    relationship: 'ALL',
                    values: ['SELLABLE']
                  },
                  type: 'criteria'
                },
                rulesTestHelper.END,
                rulesTestHelper.AND,
                rulesTestHelper.BEGIN,
                {
                  rule: {
                    attribute: 'availability.name',
                    relationship: 'EQ',
                    value: 'AGG'
                  },
                  type: 'criteria'
                },
                rulesTestHelper.AND,
                {
                  rule: {
                    attribute: 'availability.status',
                    relationship: 'ALL',
                    values: ['CAN_SEND_TO_AGG', 'SHOULD_NOTIFY']
                  },
                  type: 'criteria'
                },
                rulesTestHelper.END,
                rulesTestHelper.END
              ],
              type: 'group'
            }
          ],
          type: 'book'
        }
      ];
      const expectedResult = [
        {
          bool: {
            filter: [
              {
                bool: {
                  filter: [
                    {
                      nested: {
                        path: 'availability',
                        query: {
                          bool: {
                            filter: [
                              {
                                term: {
                                  'availability.name.keyword': 'UBX'
                                }
                              },
                              {
                                terms_set: {
                                  'availability.status.keyword': {
                                    minimum_should_match_script: {
                                      source: 'params.num_terms'
                                    },
                                    terms: ['SELLABLE']
                                  }
                                }
                              }
                            ]
                          }
                        }
                      }
                    },
                    {
                      nested: {
                        path: 'availability',
                        query: {
                          bool: {
                            filter: [
                              {
                                term: {
                                  'availability.name.keyword': 'AGG'
                                }
                              },
                              {
                                terms_set: {
                                  'availability.status.keyword': {
                                    minimum_should_match_script: {
                                      source: 'params.num_terms'
                                    },
                                    terms: ['CAN_SEND_TO_AGG', 'SHOULD_NOTIFY']
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
              }
            ]
          }
        }
      ];
      const resultQuery = eSQueryParser.parse(testSearchQuery);
      expect(resultQuery).to.deep.equal(expectedResult);
    });
  });

  describe('_extractNestedPath', () => {
    it(`should return proper nested path when valid searchQuery passed`, () => {
      const path = eSQueryParser._extractNestedPath('categories.name', 'book');
      expect(path).to.equal('categories');
    });
  });
});
