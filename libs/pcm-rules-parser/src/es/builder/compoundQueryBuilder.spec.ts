import { expect } from 'chai';
import { ESCompoundQuery } from '../../common/model/ESCompoundQuery';
import { ESLeafQuery } from '../../common/model/ESLeafQuery';

import { buildESCompoundQuery } from './compoundQueryBuilder';

describe('buildESCompoundQuery', () => {
  const rawESQuery = [
    {
      bool: {
        must: [
          {
            term: {
              'book.format': 'e-Book'
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
                  'availability.status': {
                    minimum_should_match_script: {
                      source: 'params.num_terms'
                    },
                    terms: ['SELLABLE', 'CAN_HOST']
                  }
                }
              },
              {
                bool: {
                  must_not: [
                    {
                      terms: {
                        'availability.status': ['DRM_PROTECTED']
                      }
                    }
                  ]
                }
              },
              {
                term: {
                  'availability.name': 'UBX'
                }
              }
            ]
          }
        }
      }
    }
  ] as Array<ESCompoundQuery | ESLeafQuery>;
  // operators
  ['AND', 'OR', 'NOT'].forEach((operator) => {
    it(`should return processed esQuery when valid rawESQuery passed with operator ${operator}
    with filter context as false`, async () => {
      const keyValue = {
        AND: 'must',
        NOT: 'must_not',
        OR: 'should'
      };
      const key = keyValue[operator];
      const processedESQuery = {
        bool: {
          [key]: [
            {
              bool: {
                must: [
                  {
                    term: {
                      'book.format': 'e-Book'
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
                          'availability.status': {
                            minimum_should_match_script: {
                              source: 'params.num_terms'
                            },
                            terms: ['SELLABLE', 'CAN_HOST']
                          }
                        }
                      },
                      {
                        bool: {
                          must_not: [
                            {
                              terms: {
                                'availability.status': ['DRM_PROTECTED']
                              }
                            }
                          ]
                        }
                      },
                      {
                        term: {
                          'availability.name': 'UBX'
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
      const needRelevanceScore = true;
      const resultQuery = buildESCompoundQuery(
        operator,
        rawESQuery,
        needRelevanceScore
      );
      expect(resultQuery).to.deep.equal(processedESQuery);
    });
  });
  it(`should return processed esQuery when valid rawESQuery passed with AND operator 
      with filter context as true`, async () => {
    const processedESQuery = {
      bool: {
        filter: [
          {
            bool: {
              must: [
                {
                  term: {
                    'book.format': 'e-Book'
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
                        'availability.status': {
                          minimum_should_match_script: {
                            source: 'params.num_terms'
                          },
                          terms: ['SELLABLE', 'CAN_HOST']
                        }
                      }
                    },
                    {
                      bool: {
                        must_not: [
                          {
                            terms: {
                              'availability.status': ['DRM_PROTECTED']
                            }
                          }
                        ]
                      }
                    },
                    {
                      term: {
                        'availability.name': 'UBX'
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
    const needRelevanceScore = false;
    const resultQuery = buildESCompoundQuery(
      'AND',
      rawESQuery,
      needRelevanceScore
    );
    expect(resultQuery).to.deep.equal(processedESQuery);
  });
  it(`should throw error when operator is other than AND, OR, NE `, async () => {
    try {
      const needRelevanceScore = false;
      buildESCompoundQuery('XYZ', rawESQuery, needRelevanceScore);
    } catch (err) {
      expect(err.message).to.equal('Invalid operator XYZ');
    }
  });
});
