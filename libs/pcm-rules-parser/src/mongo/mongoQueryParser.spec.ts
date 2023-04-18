import { MongooseSchema } from '@tandfgroup/pcm-entity-model-v4';
import { SchemaMapperV4 } from '@tandfgroup/pcm-schema-mapper-v4';
import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';

import {
  GroupedSearchQuery,
  SearchQuery
} from '../common/model/SearchQueryRule';
import { MongoQueryParser as QueryParser } from './mongoQueryParser';
import { booksTestData } from '../mock/bookV4';

describe('QueryParser', () => {
  describe('parse', () => {
    let mongoServer;
    let TestBooksV4;
    before(async () => {
      mongoServer = new MongoMemoryServer();
      const mongoUri = await mongoServer.getConnectionString();
      await mongoose
        .connect(mongoUri)
        .then(() => {
          console.log('Connection to Test MongoDB is success.');
        })
        .catch((err) => {
          console.log('Connection to Test MongoDB is failed.', err);
        });
      TestBooksV4 = mongoose.model(
        'TestBooksV4',
        MongooseSchema.Book,
        'books-4.0.1'
      );
      await TestBooksV4.insertMany(booksTestData);
    });
    after(async () => {
      await mongoose.disconnect();
      await mongoServer.stop();
    });
    it(`should not modify the inputSearchQuery object`, () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery[] = [
        {
          rules: [
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 1,
              rule: {
                attribute: 'type',
                relationship: 'EQ',
                value: 'book'
              },
              type: 'criteria'
            },
            {
              position: 2,
              rule: {
                value: 'AND'
              },
              type: 'logical'
            },
            {
              position: 3,
              rule: {
                attribute: 'book.format',
                relationship: 'EQ',
                value: 'EBK'
              },
              type: 'criteria'
            },
            {
              position: 4,
              rule: {
                value: 'END'
              },
              type: 'separator'
            }
          ],
          type: 'book'
        }
      ];
      const expectedResult = [
        {
          rules: {
            $and: [
              {
                type: {
                  $eq: 'book'
                }
              },
              {
                'book.format': {
                  $eq: 'EBK'
                }
              }
            ]
          },
          type: 'book'
        }
      ];
      const copyOftestSearchQuery = JSON.parse(JSON.stringify(testSearchQuery));
      const resultQuery = parse.parse(testSearchQuery);
      expect(resultQuery).to.be.an('array');
      expect(resultQuery).to.deep.equal(expectedResult);
      expect(testSearchQuery).to.deep.equal(copyOftestSearchQuery);
      resultQuery.forEach((result) => {
        expect(result).to.be.an('object');
        expect(result).to.have.property('rules');
        expect(result).to.have.property('type');
      });
    });
    it(`should return Invalid Input: rules are not in proper order
        when separator END is missing`, (done) => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery[] = [
        {
          rules: [
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 1,
              rule: {
                attribute: 'type',
                relationship: 'EQ',
                value: 'book'
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        }
      ];
      try {
        const resultQuery = parse.parse(testSearchQuery);
        done(new Error('QueryParser error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal(
          'Invalid Input: rules are not in proper order'
        );
        done();
      }
    });
    it(`should return proper output mongo query when valid searchQuery
            is passed`, () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery[] = [
        {
          rules: [
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 1,
              rule: {
                attribute: 'type',
                relationship: 'EQ',
                value: 'book'
              },
              type: 'criteria'
            },
            {
              position: 2,
              rule: {
                value: 'AND'
              },
              type: 'logical'
            },
            {
              position: 3,
              rule: {
                attribute: 'book.format',
                relationship: 'EQ',
                value: 'EBK'
              },
              type: 'criteria'
            },
            {
              position: 4,
              rule: {
                value: 'END'
              },
              type: 'separator'
            }
          ],
          type: 'book'
        }
      ];
      const expectedResult = [
        {
          rules: {
            $and: [
              {
                type: {
                  $eq: 'book'
                }
              },
              {
                'book.format': {
                  $eq: 'EBK'
                }
              }
            ]
          },
          type: 'book'
        }
      ];
      const resultQuery = parse.parse(testSearchQuery);
      expect(resultQuery).to.be.an('array');
      expect(resultQuery).to.deep.equal(expectedResult);
      resultQuery.forEach((result) => {
        expect(result).to.be.an('object');
        expect(result).to.have.property('rules');
        expect(result).to.have.property('type');
      });
    });
    // Unit test for product level availability
    // group search query
    it(`should return proper output mongo query when valid searchQuery passed
            containing group rule with object`, async () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: GroupedSearchQuery[] = [
        {
          attributes: ['_id'],
          rules: [
            {
              name: 'product',
              rules: [
                {
                  rule: {
                    value: 'BEGIN'
                  },
                  type: 'separator'
                },
                {
                  rule: {
                    value: 'BEGIN'
                  },
                  type: 'separator'
                },
                {
                  rule: {
                    attribute: 'book.format',
                    relationship: 'EQ',
                    value: 'e-Book'
                  },
                  type: 'criteria'
                },
                {
                  rule: {
                    value: 'END'
                  },
                  type: 'separator'
                },
                {
                  rule: {
                    value: 'END'
                  },
                  type: 'separator'
                }
              ],
              type: 'group'
            },
            {
              name: 'availability',
              rules: [
                {
                  rule: {
                    value: 'BEGIN'
                  },
                  type: 'separator'
                },
                {
                  rule: {
                    value: 'BEGIN'
                  },
                  type: 'separator'
                },
                {
                  rule: {
                    attribute: 'availability.name',
                    relationship: 'EQ',
                    value: 'UBX'
                  },
                  type: 'criteria'
                },
                {
                  rule: {
                    value: 'AND'
                  },
                  type: 'logical'
                },
                {
                  rule: {
                    attribute: 'availability.status',
                    relationship: 'ALL',
                    values: ['SELLABLE']
                  },
                  type: 'criteria'
                },
                {
                  rule: {
                    value: 'END'
                  },
                  type: 'separator'
                },
                {
                  rule: {
                    value: 'AND'
                  },
                  type: 'logical'
                },
                {
                  rule: {
                    value: 'BEGIN'
                  },
                  type: 'separator'
                },
                {
                  rule: {
                    attribute: 'availability.name',
                    relationship: 'EQ',
                    value: 'AGG'
                  },
                  type: 'criteria'
                },
                {
                  rule: {
                    value: 'AND'
                  },
                  type: 'logical'
                },
                {
                  rule: {
                    attribute: 'availability.status',
                    relationship: 'ALL',
                    values: ['CAN_SEND_TO_AGG', 'SHOULD_NOTIFY', 'SF-INACTIVE']
                  },
                  type: 'criteria'
                },
                {
                  rule: {
                    value: 'END'
                  },
                  type: 'separator'
                },
                {
                  rule: {
                    value: 'END'
                  },
                  type: 'separator'
                }
              ],
              type: 'group'
            }
          ],
          type: 'book'
        }
      ];
      const expectedResult = [
        {
          attributes: ['_id'],
          rules: {
            $and: [
              {
                'book.format': {
                  $eq: 'e-Book'
                }
              },
              {
                $and: [
                  {
                    availability: {
                      $elemMatch: {
                        $and: [
                          {
                            name: {
                              $eq: 'UBX'
                            }
                          },
                          {
                            status: {
                              $all: ['SELLABLE']
                            }
                          }
                        ]
                      }
                    }
                  },
                  {
                    availability: {
                      $elemMatch: {
                        $and: [
                          {
                            name: {
                              $eq: 'AGG'
                            }
                          },
                          {
                            status: {
                              $all: [
                                'CAN_SEND_TO_AGG',
                                'SHOULD_NOTIFY',
                                'SF-INACTIVE'
                              ]
                            }
                          }
                        ]
                      }
                    }
                  }
                ]
              }
            ]
          },
          type: 'book'
        }
      ];
      const resultQuery = parse.parse(testSearchQuery);
      expect(resultQuery).to.be.an('array');
      expect(resultQuery).to.deep.equal(expectedResult);
      resultQuery.forEach((result) => {
        expect(result).to.be.an('object');
        expect(result).to.have.property('rules');
        expect(result).to.have.property('type');
      });
      const bookData = await TestBooksV4.find(resultQuery[0].rules).exec();
      expect(bookData).to.be.an('array');
      expect(bookData.length).to.equal(1);
    });
    // group search query along with normal rule
    it(`should throw error when searchQuery passed containing group rule
            with normal rule`, (done) => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: GroupedSearchQuery[] = [
        {
          attributes: ['_id'],
          rules: [
            {
              name: 'product',
              rules: [
                {
                  rule: {
                    value: 'BEGIN'
                  },
                  type: 'separator'
                },
                {
                  rule: {
                    value: 'BEGIN'
                  },
                  type: 'separator'
                },
                {
                  rule: {
                    attribute: 'book.format',
                    relationship: 'EQ',
                    value: 'e-Book'
                  },
                  type: 'criteria'
                },
                {
                  rule: {
                    value: 'END'
                  },
                  type: 'separator'
                },
                {
                  rule: {
                    value: 'END'
                  },
                  type: 'separator'
                }
              ],
              type: 'group'
            },
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 1,
              rule: {
                attribute: 'categories.code',
                relationship: 'EQ',
                value: 'WB010'
              },
              type: 'criteria'
            },
            {
              position: 4,
              rule: {
                value: 'END'
              },
              type: 'separator'
            }
          ],
          type: 'book'
        }
      ];
      try {
        parse.parse(testSearchQuery);
        done(new Error('QueryParser error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal(
          'Invalid Group query, all the root level "type" should be "group"'
        );
        done();
      }
    });
    // group search query with just availability
    it(`should return proper output mongo query when valid searchQuery passed
            containing group rule with only availability`, async () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: GroupedSearchQuery[] = [
        {
          attributes: ['_id'],
          rules: [
            {
              name: 'availability',
              rules: [
                {
                  rule: {
                    value: 'BEGIN'
                  },
                  type: 'separator'
                },
                {
                  rule: {
                    value: 'BEGIN'
                  },
                  type: 'separator'
                },
                {
                  rule: {
                    attribute: 'availability.name',
                    relationship: 'EQ',
                    value: 'UBX'
                  },
                  type: 'criteria'
                },
                {
                  rule: {
                    value: 'AND'
                  },
                  type: 'logical'
                },
                {
                  rule: {
                    attribute: 'availability.status',
                    relationship: 'ALL',
                    values: ['SELLABLE']
                  },
                  type: 'criteria'
                },
                {
                  rule: {
                    value: 'END'
                  },
                  type: 'separator'
                },
                {
                  rule: {
                    value: 'AND'
                  },
                  type: 'logical'
                },
                {
                  rule: {
                    value: 'BEGIN'
                  },
                  type: 'separator'
                },
                {
                  rule: {
                    attribute: 'availability.name',
                    relationship: 'EQ',
                    value: 'AGG'
                  },
                  type: 'criteria'
                },
                {
                  rule: {
                    value: 'AND'
                  },
                  type: 'logical'
                },
                {
                  rule: {
                    attribute: 'availability.status',
                    relationship: 'ALL',
                    values: ['CAN_SEND_TO_AGG', 'SHOULD_NOTIFY']
                  },
                  type: 'criteria'
                },
                {
                  rule: {
                    value: 'END'
                  },
                  type: 'separator'
                },
                {
                  rule: {
                    value: 'END'
                  },
                  type: 'separator'
                }
              ],
              type: 'group'
            }
          ],
          type: 'book'
        }
      ];
      const expectedResult = [
        {
          attributes: ['_id'],
          rules: {
            $and: [
              {
                availability: {
                  $elemMatch: {
                    $and: [
                      {
                        name: {
                          $eq: 'UBX'
                        }
                      },
                      {
                        status: {
                          $all: ['SELLABLE']
                        }
                      }
                    ]
                  }
                }
              },
              {
                availability: {
                  $elemMatch: {
                    $and: [
                      {
                        name: {
                          $eq: 'AGG'
                        }
                      },
                      {
                        status: {
                          $all: ['CAN_SEND_TO_AGG', 'SHOULD_NOTIFY']
                        }
                      }
                    ]
                  }
                }
              }
            ]
          },
          type: 'book'
        }
      ];
      const resultQuery = parse.parse(testSearchQuery);
      expect(resultQuery).to.be.an('array');
      expect(resultQuery).to.deep.equal(expectedResult);
      resultQuery.forEach((result) => {
        expect(result).to.be.an('object');
        expect(result).to.have.property('rules');
        expect(result).to.have.property('type');
      });
      const bookData = await TestBooksV4.find(resultQuery[0].rules).exec();
      expect(bookData).to.be.an('array');
      expect(bookData.length).to.equal(4);
    });
    it(`should return proper output mongo query when valid searchQuery along with elemMatch
            is passed`, () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery[] = [
        {
          rules: [
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 1,
              rule: {
                attribute: 'type',
                relationship: 'EQ',
                value: 'book'
              },
              type: 'criteria'
            },
            {
              position: 2,
              rule: {
                value: 'AND'
              },
              type: 'logical'
            },
            {
              position: 3,
              rule: {
                attribute: 'classifications[type:netbase].code',
                relationship: 'IN',
                values: ['WB001', 'WB002', 'WB003']
              },
              type: 'criteria'
            },
            {
              position: 4,
              rule: {
                value: 'END'
              },
              type: 'separator'
            }
          ],
          type: 'book'
        }
      ];
      const expectedResult = [
        {
          rules: {
            $and: [
              {
                type: {
                  $eq: 'book'
                }
              },
              {
                classifications: {
                  $elemMatch: {
                    code: {
                      $in: ['WB001', 'WB002', 'WB003']
                    },
                    type: 'netbase'
                  }
                }
              }
            ]
          },
          type: 'book'
        }
      ];
      const resultQuery = parse.parse(testSearchQuery);
      expect(resultQuery).to.be.an('array');
      expect(resultQuery).to.deep.equal(expectedResult);
      resultQuery.forEach((result) => {
        expect(result).to.be.an('object');
        expect(result).to.have.property('rules');
        expect(result).to.have.property('type');
      });
    });
    it(`should return 'mongo' query when only searchQuery is passed
        with AND operation`, () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery[] = [
        {
          rules: [
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 1,
              rule: {
                attribute: 'type',
                relationship: 'EQ',
                value: 'book'
              },
              type: 'criteria'
            },
            {
              position: 2,
              rule: {
                value: 'AND'
              },
              type: 'logical'
            },
            {
              position: 3,
              rule: {
                attribute: 'book.format',
                relationship: 'EQ',
                value: 'EBK'
              },
              type: 'criteria'
            },
            {
              position: 4,
              rule: {
                value: 'END'
              },
              type: 'separator'
            }
          ],
          type: 'book'
        }
      ];
      const expectedResult = [
        {
          rules: {
            $and: [
              {
                type: {
                  $eq: 'book'
                }
              },
              {
                'book.format': {
                  $eq: 'EBK'
                }
              }
            ]
          },
          type: 'book'
        }
      ];
      const resultQuery = parse.parse(testSearchQuery);
      expect(resultQuery).to.be.an('array');
      expect(resultQuery).to.deep.equal(expectedResult);
      resultQuery.forEach((result) => {
        expect(result).to.be.an('object');
        expect(result).to.have.property('rules');
        expect(result).to.have.property('type');
      });
    });
    it(`should return 'mongo' query when only searchQuery is passed
        with OR operation`, () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery[] = [
        {
          rules: [
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 1,
              rule: {
                attribute: 'type',
                relationship: 'EQ',
                value: 'book'
              },
              type: 'criteria'
            },
            {
              position: 2,
              rule: {
                value: 'OR'
              },
              type: 'logical'
            },
            {
              position: 3,
              rule: {
                attribute: 'book.format',
                relationship: 'EQ',
                value: 'EBK'
              },
              type: 'criteria'
            },
            {
              position: 4,
              rule: {
                value: 'END'
              },
              type: 'separator'
            }
          ],
          type: 'book'
        }
      ];
      const expectedResult = [
        {
          rules: {
            $or: [
              {
                type: {
                  $eq: 'book'
                }
              },
              {
                'book.format': {
                  $eq: 'EBK'
                }
              }
            ]
          },
          type: 'book'
        }
      ];
      const resultQuery = parse.parse(testSearchQuery);
      expect(resultQuery).to.be.an('array');
      expect(resultQuery).to.deep.equal(expectedResult);
      resultQuery.forEach((result) => {
        expect(result).to.be.an('object');
        expect(result).to.have.property('rules');
        expect(result).to.have.property('type');
      });
    });
    it(`should return Invalid Input: searchQueries :: null when null is passed`, (done) => {
      const parse = new QueryParser(SchemaMapperV4);
      try {
        const resultQuery = parse.parse(null);
        done(new Error('QueryParser error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Input: searchQueries :: null');
        done();
      }
    });
    it(`should return Invalid Input: searchQueries :: [] when [] is passed`, (done) => {
      const parse = new QueryParser(SchemaMapperV4);
      try {
        const resultQuery = parse.parse([]);
        done(new Error('QueryParser error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Input: searchQueries :: []');
        done();
      }
    });
    it(`should return Invalid Input: searchQueries :: undefined when undefined
        is passed`, (done) => {
      const parse = new QueryParser(SchemaMapperV4);
      try {
        const resultQuery = parse.parse(undefined);
        done(new Error('QueryParser error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal(
          'Invalid Input: searchQueries :: undefined'
        );
        done();
      }
    });
    it(`should return Invalid Input: searchQuery when SearchQuery is null`, (done) => {
      try {
        const parse = new QueryParser(SchemaMapperV4);
        const testSearchQuery: SearchQuery[] = [null];
        const resultQuery = parse.parse(testSearchQuery);
        done(new Error('QueryParser error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Input: searchQuery :: null');
        done();
      }
    });
    it(`should return Invalid Input: Cannot use different logical operators within one separator pair
        when within one bracket both '&' and '|' exists`, (done) => {
      const expectedError = `Invalid Input: Cannot use different logical operators within one separator pair`;
      try {
        const parse = new QueryParser(SchemaMapperV4);
        const testSearchQuery: SearchQuery[] = [
          {
            rules: [
              {
                position: 0,
                rule: {
                  value: 'BEGIN'
                },
                type: 'separator'
              },
              {
                position: 1,
                rule: {
                  attribute: 'type',
                  relationship: 'EQ',
                  value: 'book'
                },
                type: 'criteria'
              },
              {
                position: 2,
                rule: {
                  value: 'AND'
                },
                type: 'logical'
              },
              {
                position: 3,
                rule: {
                  attribute: 'book.format',
                  relationship: 'EQ',
                  value: 'EBK'
                },
                type: 'criteria'
              },
              {
                position: 4,
                rule: {
                  value: 'OR'
                },
                type: 'logical'
              },
              {
                position: 5,
                rule: {
                  attribute: 'type',
                  relationship: 'EQ',
                  value: 'chapter'
                },
                type: 'criteria'
              },
              {
                position: 6,
                rule: {
                  value: 'END'
                },
                type: 'separator'
              }
            ],
            type: 'book'
          }
        ];
        const resultQuery = parse.parse(testSearchQuery);
        done(new Error('QueryParser error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal(expectedError);
        done();
      }
    });
    it(`should have proper mapping of BEGIN and END e.g: ((a&b)|(c&d))`, () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery[] = [
        {
          rules: [
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 1,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 2,
              rule: {
                attribute: 'type',
                relationship: 'EQ',
                value: 'book'
              },
              type: 'criteria'
            },
            {
              position: 3,
              rule: {
                value: 'AND'
              },
              type: 'logical'
            },
            {
              position: 4,
              rule: {
                attribute: 'book.format',
                relationship: 'EQ',
                value: 'EBK'
              },
              type: 'criteria'
            },
            {
              position: 5,
              rule: {
                value: 'END'
              },
              type: 'separator'
            },
            {
              position: 6,
              rule: {
                value: 'OR'
              },
              type: 'logical'
            },
            {
              position: 7,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 8,
              rule: {
                attribute: 'identifiers.isbn',
                relationship: 'EQ',
                value: '123456789'
              },
              type: 'criteria'
            },
            {
              position: 9,
              rule: {
                value: 'AND'
              },
              type: 'logical'
            },
            {
              position: 10,
              rule: {
                attribute: 'prices.price',
                relationship: 'EQ',
                value: '100'
              },
              type: 'criteria'
            },
            {
              position: 11,
              rule: {
                value: 'END'
              },
              type: 'separator'
            },
            {
              position: 12,
              rule: {
                value: 'END'
              },
              type: 'separator'
            }
          ],
          type: 'book'
        }
      ];
      const expectedResult = [
        {
          rules: {
            $or: [
              {
                $and: [
                  {
                    type: {
                      $eq: 'book'
                    }
                  },
                  {
                    'book.format': {
                      $eq: 'EBK'
                    }
                  }
                ]
              },
              {
                $and: [
                  {
                    'identifiers.isbn': {
                      $eq: '123456789'
                    }
                  },
                  {
                    'prices.price': {
                      $eq: 100
                    }
                  }
                ]
              }
            ]
          },
          type: 'book'
        }
      ];
      const copyOftestSearchQuery = JSON.parse(JSON.stringify(testSearchQuery));
      const resultQuery = parse.parse(testSearchQuery);
      expect(resultQuery).to.be.an('array');
      expect(resultQuery).to.deep.equal(expectedResult);
      expect(testSearchQuery).to.deep.equal(copyOftestSearchQuery);
      resultQuery.forEach((result) => {
        expect(result).to.be.an('object');
        expect(result).to.have.property('rules');
        expect(result).to.have.property('type');
      });
    });
    it(`should return {} when only 1 BEGIN and 1 END is passed`, () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery[] = [
        {
          rules: [
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 1,
              rule: {
                value: 'END'
              },
              type: 'separator'
            }
          ],
          type: 'book'
        }
      ];
      const expectedResult = [
        {
          rules: {},
          type: 'book'
        }
      ];
      const copyOftestSearchQuery = JSON.parse(JSON.stringify(testSearchQuery));
      const resultQuery = parse.parse(testSearchQuery);
      expect(resultQuery).to.be.an('array');
      expect(resultQuery).to.deep.equal(expectedResult);
      expect(testSearchQuery).to.deep.equal(copyOftestSearchQuery);
      resultQuery.forEach((result) => {
        expect(result).to.be.an('object');
        expect(result).to.have.property('rules');
        expect(result).to.have.property('type');
      });
    });
    it(`should check isbn in Collection`, () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery[] = [
        {
          rules: [
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 1,
              rule: {
                attribute: 'identifiers.isbn',
                relationship: 'IN',
                values: ['9780003020090', '9780043011867']
              },
              type: 'criteria'
            },
            {
              position: 2,
              rule: {
                value: 'END'
              },
              type: 'separator'
            }
          ],
          type: 'collection'
        }
      ];
      const expectedResult = [
        {
          rules: {
            'identifiers.isbn': {
              $in: ['9780003020090', '9780043011867']
            }
          },
          type: 'collection'
        }
      ];
      const copyOftestSearchQuery = JSON.parse(JSON.stringify(testSearchQuery));
      const resultQuery = parse.parse(testSearchQuery);
      expect(resultQuery).to.be.an('array');
      expect(resultQuery).to.deep.equal(expectedResult);
      expect(testSearchQuery).to.deep.equal(copyOftestSearchQuery);
      resultQuery.forEach((result) => {
        expect(result).to.be.an('object');
        expect(result).to.have.property('rules');
        expect(result).to.have.property('type');
      });
    });
    it(`should check doi in CreativeWork`, () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery[] = [
        {
          rules: [
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 1,
              rule: {
                attribute: 'identifiers.doi',
                relationship: 'EQ',
                value: '10.4324/9781351022187'
              },
              type: 'criteria'
            },
            {
              position: 2,
              rule: {
                value: 'END'
              },
              type: 'separator'
            }
          ],
          type: 'creativeWork'
        }
      ];
      const expectedResult = [
        {
          rules: {
            'identifiers.doi': {
              $eq: '10.4324/9781351022187'
            }
          },
          type: 'creativeWork'
        }
      ];
      const copyOftestSearchQuery = JSON.parse(JSON.stringify(testSearchQuery));
      const resultQuery = parse.parse(testSearchQuery);
      expect(resultQuery).to.be.an('array');
      expect(resultQuery).to.deep.equal(expectedResult);
      expect(testSearchQuery).to.deep.equal(copyOftestSearchQuery);
      resultQuery.forEach((result) => {
        expect(result).to.be.an('object');
        expect(result).to.have.property('rules');
        expect(result).to.have.property('type');
      });
    });
    it(`should check doi in ScholarlyArticle`, () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery[] = [
        {
          rules: [
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 1,
              rule: {
                attribute: 'identifiers.doi',
                relationship: 'EQ',
                value: '10.4324/9781351022187'
              },
              type: 'criteria'
            },
            {
              position: 2,
              rule: {
                value: 'END'
              },
              type: 'separator'
            }
          ],
          type: 'scholarlyArticle'
        }
      ];
      const expectedResult = [
        {
          rules: {
            'identifiers.doi': {
              $eq: '10.4324/9781351022187'
            }
          },
          type: 'scholarlyArticle'
        }
      ];
      const copyOftestSearchQuery = JSON.parse(JSON.stringify(testSearchQuery));
      const resultQuery = parse.parse(testSearchQuery);
      expect(resultQuery).to.be.an('array');
      expect(resultQuery).to.deep.equal(expectedResult);
      expect(testSearchQuery).to.deep.equal(copyOftestSearchQuery);
      resultQuery.forEach((result) => {
        expect(result).to.be.an('object');
        expect(result).to.have.property('rules');
        expect(result).to.have.property('type');
      });
    });
    it(`should check doi in Chapter`, () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery[] = [
        {
          rules: [
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 1,
              rule: {
                attribute: 'identifiers.doi',
                relationship: 'EQ',
                value: '10.4324/9781351022187'
              },
              type: 'criteria'
            },
            {
              position: 2,
              rule: {
                value: 'END'
              },
              type: 'separator'
            }
          ],
          type: 'chapter'
        }
      ];
      const expectedResult = [
        {
          rules: {
            'identifiers.doi': {
              $eq: '10.4324/9781351022187'
            }
          },
          type: 'chapter'
        }
      ];
      const copyOftestSearchQuery = JSON.parse(JSON.stringify(testSearchQuery));
      const resultQuery = parse.parse(testSearchQuery);
      expect(resultQuery).to.be.an('array');
      expect(resultQuery).to.deep.equal(expectedResult);
      expect(testSearchQuery).to.deep.equal(copyOftestSearchQuery);
      resultQuery.forEach((result) => {
        expect(result).to.be.an('object');
        expect(result).to.have.property('rules');
        expect(result).to.have.property('type');
      });
    });
    it(`should check doi in collection`, () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery[] = [
        {
          rules: [
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 1,
              rule: {
                attribute: 'identifiers.doi',
                relationship: 'EQ',
                value: '10.4324/9781351022187'
              },
              type: 'criteria'
            },
            {
              position: 2,
              rule: {
                value: 'END'
              },
              type: 'separator'
            }
          ],
          type: 'collection'
        }
      ];
      const expectedResult = [
        {
          rules: {
            'identifiers.doi': {
              $eq: '10.4324/9781351022187'
            }
          },
          type: 'collection'
        }
      ];
      const copyOftestSearchQuery = JSON.parse(JSON.stringify(testSearchQuery));
      const resultQuery = parse.parse(testSearchQuery);
      expect(resultQuery).to.be.an('array');
      expect(resultQuery).to.deep.equal(expectedResult);
      expect(testSearchQuery).to.deep.equal(copyOftestSearchQuery);
      resultQuery.forEach((result) => {
        expect(result).to.be.an('object');
        expect(result).to.have.property('rules');
        expect(result).to.have.property('type');
      });
    });
    // All is no more supported
    it(`should return invalid searchQuery type for product All`, (done) => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery[] = [
        {
          rules: [
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 1,
              rule: {
                attribute: 'identifiers.isbn',
                relationship: 'EQ',
                value: '123456789'
              },
              type: 'criteria'
            },
            {
              position: 2,
              rule: {
                value: 'OR'
              },
              type: 'logical'
            },
            {
              position: 3,
              rule: {
                attribute: 'identifiers.doi',
                relationship: 'EQ',
                value: '123456789.001'
              },
              type: 'criteria'
            },
            {
              position: 4,
              rule: {
                value: 'END'
              },
              type: 'separator'
            }
          ],
          type: 'All'
        }
      ];
      try {
        const copyOftestSearchQuery = JSON.parse(
          JSON.stringify(testSearchQuery)
        );
        const resultQuery = parse.parse(copyOftestSearchQuery);
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Input: searchQuery type :: All');
        done();
      }
    });
    it(`should have parse as an instance of QueryParser with property schemaMapper`, () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery[] = [
        {
          rules: [
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 1,
              rule: {
                attribute: 'identifiers.doi',
                relationship: 'EQ',
                value: '10.4324/9781351022187'
              },
              type: 'criteria'
            },
            {
              position: 2,
              rule: {
                value: 'END'
              },
              type: 'separator'
            }
          ],
          type: 'collection'
        }
      ];
      const expectedResult = [
        {
          rules: {
            'identifiers.doi': {
              $eq: '10.4324/9781351022187'
            }
          },
          type: 'collection'
        }
      ];
      const copyOftestSearchQuery = JSON.parse(JSON.stringify(testSearchQuery));
      const resultQuery = parse.parse(testSearchQuery);
      expect(parse).to.be.instanceOf(QueryParser);
      expect(parse).to.have.property('schemaMapper', SchemaMapperV4);
      expect(resultQuery).to.be.an('array');
      expect(resultQuery).to.deep.equal(expectedResult);
      expect(testSearchQuery).to.deep.equal(copyOftestSearchQuery);
      resultQuery.forEach((result) => {
        expect(result).to.be.an('object');
        expect(result).to.have.property('rules');
        expect(result).to.have.property('type');
      });
    });
    it(`should not modify the inputSearchQueries object deep cloning`, () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQueries: SearchQuery[] = [
        {
          rules: [
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 1,
              rule: {
                attribute: 'type',
                relationship: 'EQ',
                value: 'book'
              },
              type: 'criteria'
            },
            {
              position: 2,
              rule: {
                value: 'AND'
              },
              type: 'logical'
            },
            {
              position: 3,
              rule: {
                attribute: 'book.format',
                relationship: 'EQ',
                value: 'EBK'
              },
              type: 'criteria'
            },
            {
              position: 4,
              rule: {
                value: 'END'
              },
              type: 'separator'
            }
          ],
          type: 'book'
        }
      ];
      const expectedResult = [
        {
          rules: {
            $and: [
              {
                type: {
                  $eq: 'book'
                }
              },
              {
                'book.format': {
                  $eq: 'EBK'
                }
              }
            ]
          },
          type: 'book'
        }
      ];
      const copyOftestSearchQueries = JSON.parse(
        JSON.stringify(testSearchQueries)
      );
      const resultQueries = parse.parse(testSearchQueries);
      expect(resultQueries).to.be.an('array');
      expect(resultQueries).to.deep.equal(expectedResult);
      expect(testSearchQueries).to.deep.equal(copyOftestSearchQueries);
      resultQueries.forEach((result) => {
        expect(result).to.be.an('object');
        expect(result).to.have.property('rules');
        expect(result).to.have.property('type');
      });
    });
  });
  describe('parseSearchQuery', () => {
    it(`should not go for $elematch condition when attributes are same in one chunk with |`, () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery = {
        rules: [
          {
            position: 1,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 2,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 3,
            rule: {
              attribute: 'book.doiRegistrationStatus',
              relationship: 'IN',
              values: ['true']
            },
            type: 'criteria'
          },
          {
            position: 4,
            rule: {
              value: 'END'
            },
            type: 'separator'
          },
          {
            position: 5,
            rule: {
              value: 'OR'
            },
            type: 'logical'
          },
          {
            position: 6,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 7,
            rule: {
              attribute: 'book.doiRegistrationStatus',
              relationship: 'IN',
              values: ['false']
            },
            type: 'criteria'
          },
          {
            position: 8,
            rule: {
              value: 'END'
            },
            type: 'separator'
          },
          {
            position: 9,
            rule: {
              value: 'END'
            },
            type: 'separator'
          }
        ],
        type: 'book'
      };
      const expectedResult = {
        rules: {
          $or: [
            {
              'book.doiRegistrationStatus': {
                $in: [true]
              }
            },
            {
              'book.doiRegistrationStatus': {
                $in: [false]
              }
            }
          ]
        },
        type: 'book'
      };
      const copyOftestSearchQuery = JSON.parse(JSON.stringify(testSearchQuery));
      const resultQuery = parse.parseSearchQuery(testSearchQuery);
      expect(resultQuery).to.be.an('object');
      expect(resultQuery).to.have.property('rules');
      expect(resultQuery).to.have.property('type');
      expect(resultQuery).to.deep.equal(expectedResult);
      expect(testSearchQuery).to.deep.equal(copyOftestSearchQuery);
    });
    it.skip(`should not go for $elematch condition when attributes belong to an object`, () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery = {
        rules: [
          {
            position: 1,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 2,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 3,
            rule: {
              attribute: 'book.copyright.holder',
              relationship: 'EQ',
              value: 'Taylor & Francis'
            },
            type: 'criteria'
          },
          {
            position: 4,
            rule: {
              value: 'END'
            },
            type: 'separator'
          },
          {
            position: 5,
            rule: {
              value: 'OR'
            },
            type: 'logical'
          },
          {
            position: 6,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 7,
            rule: {
              attribute: 'book.copyright.year',
              relationship: 'EQ',
              value: '2019'
            },
            type: 'criteria'
          },
          {
            position: 8,
            rule: {
              value: 'END'
            },
            type: 'separator'
          },
          {
            position: 9,
            rule: {
              value: 'END'
            },
            type: 'separator'
          }
        ],
        type: 'book'
      };
      const expectedResult = {
        rules: {
          $or: [
            {
              'book.copyright.holder': {
                $eq: 'Taylor & Francis'
              }
            },
            {
              'book.copyright.year': {
                $eq: '2019'
              }
            }
          ]
        },
        type: 'book'
      };
      const copyOftestSearchQuery = JSON.parse(JSON.stringify(testSearchQuery));
      const resultQuery = parse.parseSearchQuery(testSearchQuery);
      expect(resultQuery).to.be.an('object');
      expect(resultQuery).to.have.property('rules');
      expect(resultQuery).to.have.property('type');
      expect(resultQuery).to.deep.equal(expectedResult);
      expect(testSearchQuery).to.deep.equal(copyOftestSearchQuery);
    });
    it(`should go for $elematch condition till data type is array when array holds an object`, () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery = {
        rules: [
          {
            position: 1,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 2,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 3,
            rule: {
              attribute: 'contributors.affiliations.address.city',
              relationship: 'EQ',
              value: 'Bangalore'
            },
            type: 'criteria'
          },
          {
            position: 4,
            rule: {
              value: 'END'
            },
            type: 'separator'
          },
          {
            position: 5,
            rule: {
              value: 'OR'
            },
            type: 'logical'
          },
          {
            position: 6,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 7,
            rule: {
              attribute: 'contributors.affiliations.address.country',
              relationship: 'EQ',
              value: 'India'
            },
            type: 'criteria'
          },
          {
            position: 8,
            rule: {
              value: 'END'
            },
            type: 'separator'
          },
          {
            position: 9,
            rule: {
              value: 'END'
            },
            type: 'separator'
          }
        ],
        type: 'book'
      };
      const expectedResult = {
        rules: {
          'contributors.affiliations': {
            $elemMatch: {
              $or: [
                {
                  'address.city': {
                    $eq: 'Bangalore'
                  }
                },
                {
                  'address.country': {
                    $eq: 'India'
                  }
                }
              ]
            }
          }
        },
        type: 'book'
      };
      const copyOftestSearchQuery = JSON.parse(JSON.stringify(testSearchQuery));
      const resultQuery = parse.parseSearchQuery(testSearchQuery);
      expect(resultQuery).to.be.an('object');
      expect(resultQuery).to.have.property('rules');
      expect(resultQuery).to.have.property('type');
      expect(resultQuery).to.deep.equal(expectedResult);
      expect(testSearchQuery).to.deep.equal(copyOftestSearchQuery);
    });
    it(`should generate proper mongo query for enum e.g (mediaType)`, () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery = {
        rules: [
          {
            position: 1,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 2,
            rule: {
              attribute: 'creativeWork.format',
              relationship: 'EQ',
              value: 'audio'
            },
            type: 'criteria'
          },
          {
            position: 3,
            rule: {
              value: 'END'
            },
            type: 'separator'
          }
        ],
        type: 'creativeWork'
      };
      const expectedResult = {
        rules: {
          'creativeWork.format': { $eq: 'audio' }
        },
        type: 'creativeWork'
      };
      const copyOftestSearchQuery = JSON.parse(JSON.stringify(testSearchQuery));
      const resultQuery = parse.parseSearchQuery(testSearchQuery);
      expect(resultQuery).to.be.an('object');
      expect(resultQuery).to.have.property('rules');
      expect(resultQuery).to.have.property('type');
      expect(resultQuery).to.deep.equal(expectedResult);
      expect(testSearchQuery).to.deep.equal(copyOftestSearchQuery);
    });
    it(`should generate proper mongo query for string array e.g (contributors.roles)`, () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery = {
        rules: [
          {
            position: 1,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 2,
            rule: {
              attribute: 'contributors.roles',
              relationship: 'EQ',
              value: 'author'
            },
            type: 'criteria'
          },
          {
            position: 3,
            rule: {
              value: 'END'
            },
            type: 'separator'
          }
        ],
        type: 'book'
      };
      const expectedResult = {
        rules: {
          'contributors.roles': { $eq: 'author' }
        },
        type: 'book'
      };
      const copyOftestSearchQuery = JSON.parse(JSON.stringify(testSearchQuery));
      const resultQuery = parse.parseSearchQuery(testSearchQuery);
      expect(resultQuery).to.be.an('object');
      expect(resultQuery).to.have.property('rules');
      expect(resultQuery).to.have.property('type');
      expect(resultQuery).to.deep.equal(expectedResult);
      expect(testSearchQuery).to.deep.equal(copyOftestSearchQuery);
    });
    it(`should not go for $elematch condition when attributes are same in one chunk with &`, () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery = {
        rules: [
          {
            position: 1,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 2,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 3,
            rule: {
              attribute: 'book.doiRegistrationStatus',
              relationship: 'IN',
              values: ['true']
            },
            type: 'criteria'
          },
          {
            position: 4,
            rule: {
              value: 'END'
            },
            type: 'separator'
          },
          {
            position: 5,
            rule: {
              value: 'AND'
            },
            type: 'logical'
          },
          {
            position: 6,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 7,
            rule: {
              attribute: 'book.doiRegistrationStatus',
              relationship: 'IN',
              values: ['false']
            },
            type: 'criteria'
          },
          {
            position: 8,
            rule: {
              value: 'END'
            },
            type: 'separator'
          },
          {
            position: 9,
            rule: {
              value: 'END'
            },
            type: 'separator'
          }
        ],
        type: 'book'
      };
      const expectedResult = {
        rules: {
          $and: [
            {
              'book.doiRegistrationStatus': {
                $in: [true]
              }
            },
            {
              'book.doiRegistrationStatus': {
                $in: [false]
              }
            }
          ]
        },
        type: 'book'
      };
      const copyOftestSearchQuery = JSON.parse(JSON.stringify(testSearchQuery));
      const resultQuery = parse.parseSearchQuery(testSearchQuery);
      expect(resultQuery).to.be.an('object');
      expect(resultQuery).to.have.property('rules');
      expect(resultQuery).to.have.property('type');
      expect(resultQuery).to.deep.equal(expectedResult);
      expect(testSearchQuery).to.deep.equal(copyOftestSearchQuery);
    });
    it(`should not modify the inputSearchQuery object deep cloning`, () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery = {
        rules: [
          {
            position: 0,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 1,
            rule: {
              attribute: 'type',
              relationship: 'EQ',
              value: 'book'
            },
            type: 'criteria'
          },
          {
            position: 2,
            rule: {
              value: 'AND'
            },
            type: 'logical'
          },
          {
            position: 3,
            rule: {
              attribute: 'book.format',
              relationship: 'EQ',
              value: 'EBK'
            },
            type: 'criteria'
          },
          {
            position: 4,
            rule: {
              value: 'END'
            },
            type: 'separator'
          }
        ],
        type: 'book'
      };
      const expectedResult = {
        rules: {
          $and: [
            {
              type: {
                $eq: 'book'
              }
            },
            {
              'book.format': {
                $eq: 'EBK'
              }
            }
          ]
        },
        type: 'book'
      };
      const copyOftestSearchQuery = JSON.parse(JSON.stringify(testSearchQuery));
      const resultQuery = parse.parseSearchQuery(testSearchQuery);
      expect(resultQuery).to.be.an('object');
      expect(resultQuery).to.have.property('rules');
      expect(resultQuery).to.have.property('type');
      expect(resultQuery).to.deep.equal(expectedResult);
      expect(testSearchQuery).to.deep.equal(copyOftestSearchQuery);
    });
    it(`should return Invalid Input: rules are not in proper order
        when separator END is missing`, (done) => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery = {
        rules: [
          {
            position: 0,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 1,
            rule: {
              attribute: 'type',
              relationship: 'EQ',
              value: 'book'
            },
            type: 'criteria'
          }
        ],
        type: 'book'
      };
      try {
        const resultQuery = parse.parseSearchQuery(testSearchQuery);
        done(new Error('QueryParser error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal(
          'Invalid Input: rules are not in proper order'
        );
        done();
      }
    });
    it(`should return Invalid Input: searchQuery :: null when null is passed`, (done) => {
      try {
        const parse = new QueryParser(SchemaMapperV4);
        const resultQuery = parse.parseSearchQuery(null);
        done(new Error('QueryParser error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Input: searchQuery :: null');
        done();
      }
    });
    it(`should throw error if input searchQueries contain availabilty at
            product level`, (done) => {
      try {
        const parse = new QueryParser(SchemaMapperV4);
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 1,
              rule: {
                attribute: 'identifiers.isbn',
                relationship: 'EQ',
                value: '123456789'
              },
              type: 'criteria'
            },
            {
              position: 2,
              rule: {
                value: 'END'
              },
              type: 'separator'
            }
          ],
          type: 'series'
        };
        testSearchQuery['availability'] = [];
        parse.parseSearchQuery(testSearchQuery);
        done(new Error('QueryParser error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal(
          'Invalid availability filter, product ' +
            'level availability filter is not allowed in rulesList'
        );
        done();
      }
    });
    it(`should return Invalid Input: searchQuery :: [] when [] is passed`, (done) => {
      try {
        const parse = new QueryParser(SchemaMapperV4);
        const resultQuery = parse.parseSearchQuery([] as any);
        done(new Error('QueryParser error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Input: searchQuery :: []');
        done();
      }
    });
    it(`should return Invalid Input: searchQuery :: undefined when undefined
        is passed`, (done) => {
      try {
        const parse = new QueryParser(SchemaMapperV4);
        const resultQuery = parse.parseSearchQuery(undefined);
        done(new Error('QueryParser error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Input: searchQuery :: undefined');
        done();
      }
    });
    it(`should return Invalid Input: searchQuery type :: null when null is passed`, (done) => {
      try {
        const parse = new QueryParser(SchemaMapperV4);
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 1,
              rule: {
                attribute: 'type',
                relationship: 'EQ',
                value: 'book'
              },
              type: 'criteria'
            },
            {
              position: 2,
              rule: {
                value: 'END'
              },
              type: 'separator'
            }
          ],
          type: null
        };
        const resultQuery = parse.parseSearchQuery(testSearchQuery);
        done(new Error('QueryParser error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Input: searchQuery type :: null');
        done();
      }
    });
    it(`should return Invalid Input: searchQuery type when some-type is passed`, (done) => {
      const parse = new QueryParser(SchemaMapperV4);
      try {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 1,
              rule: {
                attribute: 'type',
                relationship: 'EQ',
                value: 'book'
              },
              type: 'criteria'
            },
            {
              position: 2,
              rule: {
                value: 'END'
              },
              type: 'separator'
            }
          ],
          type: 'some-type'
        };
        const resultQuery = parse.parseSearchQuery(testSearchQuery);
        done(new Error('QueryParser error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal(
          'Invalid Input: searchQuery type :: some-type'
        );
        done();
      }
    });
    it(`should return {} when rules=null is passed`, () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery = {
        rules: null,
        type: 'book'
      };
      const expectedResult = {
        rules: {},
        type: 'book'
      };
      const resultQuery = parse.parseSearchQuery(testSearchQuery);
      expect(resultQuery).to.be.an('object');
      expect(resultQuery).to.have.property('rules');
      expect(resultQuery).to.have.property('type');
      expect(resultQuery).to.deep.equal(expectedResult);
    });
    it(`should return {} when rules=undefined is passed`, () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery = {
        rules: undefined,
        type: 'book'
      };
      const expectedResult = {
        rules: {},
        type: 'book'
      };
      const resultQuery = parse.parseSearchQuery(testSearchQuery);
      expect(resultQuery).to.be.an('object');
      expect(resultQuery).to.have.property('rules');
      expect(resultQuery).to.have.property('type');
      expect(resultQuery).to.deep.equal(expectedResult);
    });
    it(`should return {} when rules=[] empty array is passed`, () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery = {
        rules: [],
        type: 'book'
      };
      const expectedResult = {
        rules: {},
        type: 'book'
      };
      const resultQuery = parse.parseSearchQuery(testSearchQuery);
      expect(resultQuery).to.be.an('object');
      expect(resultQuery).to.have.property('rules');
      expect(resultQuery).to.have.property('type');
      expect(resultQuery).to.deep.equal(expectedResult);
    });
    it(`should return {} when rules is not passed`, () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery = {
        type: 'book'
      } as any;
      const expectedResult = {
        rules: {},
        type: 'book'
      };
      const resultQuery = parse.parseSearchQuery(testSearchQuery);
      expect(resultQuery).to.be.an('object');
      expect(resultQuery).to.have.property('rules');
      expect(resultQuery).to.have.property('type');
      expect(resultQuery).to.deep.equal(expectedResult);
    });
    it(`should return Invalid Input: searchQuery rules :: some-rule when rules=some-rule`, (done) => {
      try {
        const parse = new QueryParser(SchemaMapperV4);
        const testSearchQuery: SearchQuery = {
          rules: 'some-rule' as any,
          type: 'book'
        };
        const resultQuery = parse.parseSearchQuery(testSearchQuery);
        done(new Error('QueryParser error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal(
          'Invalid Input: searchQuery rules :: "some-rule"'
        );
        done();
      }
    });
    it(`should return Invalid Input: invalid rules type when some-type is passed`, (done) => {
      try {
        const parse = new QueryParser(SchemaMapperV4);
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 1,
              rule: {
                attribute: 'type',
                relationship: 'EQ',
                value: 'book'
              },
              type: 'some-type'
            },
            {
              position: 2,
              rule: {
                value: 'END'
              },
              type: 'separator'
            }
          ],
          type: 'book'
        };
        const resultQuery = parse.parseSearchQuery(testSearchQuery);
        done(new Error('QueryParser error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal(
          'Invalid Input: invalid rules type :: some-type'
        );
        done();
      }
    });
    it(`should return Invalid Input: invalid Separator Rule when invalid separator is passed`, (done) => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery = {
        rules: [
          {
            position: 0,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 1,
            rule: {
              attribute: 'type',
              relationship: 'EQ',
              value: 'book'
            },
            type: 'criteria'
          },
          {
            position: 2,
            rule: {
              value: 'end'
            } as any,
            type: 'separator'
          }
        ],
        type: 'book'
      };
      const errRule = testSearchQuery.rules[2].rule;
      try {
        const resultQuery = parse.parseSearchQuery(testSearchQuery);
        done(new Error('QueryParser error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal(
          'Invalid Input: invalid Separator Rule :: ' + JSON.stringify(errRule)
        );
        done();
      }
    });
    it(`should return Invalid Input: invalid Logical Rule when invalid logical is passed`, (done) => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery = {
        rules: [
          {
            position: 0,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 1,
            rule: {
              value: 'and'
            },
            type: 'logical'
          },
          {
            position: 2,
            rule: {
              value: 'END'
            } as any,
            type: 'separator'
          }
        ],
        type: 'book'
      };
      const errRule = testSearchQuery.rules[1].rule;
      try {
        const resultQuery = parse.parseSearchQuery(testSearchQuery);
        done(new Error('QueryParser error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal(
          'Invalid Input: invalid Logical Rule :: ' + JSON.stringify(errRule)
        );
        done();
      }
    });
    it(`should return Invalid Input: invalid Criteria Rule when invalid criteria is passed`, (done) => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery = {
        rules: [
          {
            position: 0,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 1,
            rule: [] as any,
            type: 'criteria'
          },
          {
            position: 2,
            rule: {
              value: 'END'
            } as any,
            type: 'separator'
          }
        ],
        type: 'book'
      };
      const errRule = testSearchQuery.rules[1].rule;
      try {
        const resultQuery = parse.parseSearchQuery(testSearchQuery);
        done(new Error('QueryParser error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal(
          'Invalid Input: invalid Criteria Rule :: ' + JSON.stringify(errRule)
        );
        done();
      }
    });
    it(`should return Invalid Input: rules are not in proper order when invalid searchQuery is passed
        here, logical is removed`, (done) => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery = {
        rules: [
          {
            position: 0,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 1,
            rule: {
              attribute: 'type',
              relationship: 'EQ',
              value: 'book'
            },
            type: 'criteria'
          },
          {
            position: 3,
            rule: {
              attribute: 'book.format',
              relationship: 'EQ',
              value: 'EBK'
            },
            type: 'criteria'
          },
          {
            position: 4,
            rule: {
              value: 'END'
            },
            type: 'separator'
          }
        ],
        type: 'book'
      };
      const errMessage = 'Invalid Input: rules are not in proper order';
      try {
        const resultQuery = parse.parseSearchQuery(testSearchQuery);
        done(new Error('QueryParser error expected but got success'));
      } catch (err) {
        expect(err.message).to.deep.equal(errMessage);
        done();
      }
    });
    it(`should return Invalid Input: rules are not in proper order when invalid searchQuery is passed
        here, 2nd criteria is in another bracket i.e (0(1))`, (done) => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery = {
        rules: [
          {
            position: 0,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 1,
            rule: {
              attribute: 'type',
              relationship: 'EQ',
              value: 'book'
            },
            type: 'criteria'
          },
          {
            position: 2,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 3,
            rule: {
              attribute: 'book.format',
              relationship: 'EQ',
              value: 'EBK'
            },
            type: 'criteria'
          },
          {
            position: 4,
            rule: {
              value: 'END'
            },
            type: 'separator'
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
      };
      const errMessage = 'Invalid Input: rules are not in proper order';
      try {
        const resultQuery = parse.parseSearchQuery(testSearchQuery);
        done(new Error('QueryParser error expected but got success'));
      } catch (err) {
        expect(err.message).to.deep.equal(errMessage);
        done();
      }
    });
    it(`should return Invalid Query string :: Logical operation needs minimum 2 criteria when
        minimum 2 criteria is not provided for any logical operation((0&1)|())`, (done) => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery = {
        rules: [
          {
            position: 0,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 1,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 2,
            rule: {
              attribute: 'prices.price',
              relationship: 'GE',
              value: '1500'
            },
            type: 'criteria'
          },
          {
            position: 3,
            rule: {
              value: 'AND'
            },
            type: 'logical'
          },
          {
            position: 4,
            rule: {
              attribute: 'prices.priceTypeCode',
              relationship: 'IN',
              values: ['BYO']
            },
            type: 'criteria'
          },
          {
            position: 5,
            rule: {
              value: 'END'
            },
            type: 'separator'
          },
          {
            position: 6,
            rule: {
              value: 'OR'
            },
            type: 'logical'
          },
          {
            position: 7,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 8,
            rule: {
              value: 'END'
            },
            type: 'separator'
          },
          {
            position: 9,
            rule: {
              value: 'END'
            },
            type: 'separator'
          }
        ],
        type: 'book'
      };
      const errMessage =
        'Invalid Query string :: Logical operation needs minimum 2 criteria';
      try {
        const resultQuery = parse.parseSearchQuery(testSearchQuery);
        done(new Error('QueryParser error expected but got success'));
      } catch (err) {
        expect(err.message).to.deep.equal(errMessage);
        done();
      }
    });
    it(`should return Invalid Query string :: Logical operation needs minimum 2 criteria when
            minimum 2 criteria is not provided for any logical operation(()|())`, (done) => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery = {
        rules: [
          {
            position: 0,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 1,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 5,
            rule: {
              value: 'END'
            },
            type: 'separator'
          },
          {
            position: 6,
            rule: {
              value: 'OR'
            },
            type: 'logical'
          },
          {
            position: 7,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 8,
            rule: {
              value: 'END'
            },
            type: 'separator'
          },
          {
            position: 9,
            rule: {
              value: 'END'
            },
            type: 'separator'
          }
        ],
        type: 'book'
      };
      const errMessage =
        'Invalid Query string :: Logical operation needs minimum 2 criteria';
      try {
        const resultQuery = parse.parseSearchQuery(testSearchQuery);
        done(new Error('QueryParser error expected but got success'));
      } catch (err) {
        expect(err.message).to.deep.equal(errMessage);
        done();
      }
    });
    it(`should return Invalid Query string :: Logical operation needs minimum 2 criteria when
            minimum 2 criteria is not provided for any logical operation((0&1)|(2&3)|())`, (done) => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery = {
        rules: [
          {
            position: 0,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 1,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 2,
            rule: {
              attribute: 'prices.price',
              relationship: 'GE',
              value: '1500'
            },
            type: 'criteria'
          },
          {
            position: 3,
            rule: {
              value: 'AND'
            },
            type: 'logical'
          },
          {
            position: 4,
            rule: {
              attribute: 'prices.priceTypeCode',
              relationship: 'IN',
              values: ['BYO']
            },
            type: 'criteria'
          },
          {
            position: 5,
            rule: {
              value: 'END'
            },
            type: 'separator'
          },
          {
            position: 6,
            rule: {
              value: 'OR'
            },
            type: 'logical'
          },
          {
            position: 7,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 8,
            rule: {
              attribute: 'prices.price',
              relationship: 'GE',
              value: '1500'
            },
            type: 'criteria'
          },
          {
            position: 9,
            rule: {
              value: 'AND'
            },
            type: 'logical'
          },
          {
            position: 10,
            rule: {
              attribute: 'prices.priceTypeCode',
              relationship: 'IN',
              values: ['BYO']
            },
            type: 'criteria'
          },
          {
            position: 11,
            rule: {
              value: 'END'
            },
            type: 'separator'
          },
          {
            position: 12,
            rule: {
              value: 'OR'
            },
            type: 'logical'
          },
          {
            position: 13,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 14,
            rule: {
              value: 'END'
            },
            type: 'separator'
          },
          {
            position: 15,
            rule: {
              value: 'END'
            },
            type: 'separator'
          }
        ],
        type: 'book'
      };
      const errMessage =
        'Invalid Query string :: Logical operation needs minimum 2 criteria';
      try {
        const resultQuery = parse.parseSearchQuery(testSearchQuery);
        done(new Error('QueryParser error expected but got success'));
      } catch (err) {
        expect(err.message).to.deep.equal(errMessage);
        done();
      }
    });
    it(`should return proper output mongo query when valid searchQuery
            is passed having product type as series`, () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery = {
        rules: [
          {
            position: 0,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 1,
            rule: {
              attribute: 'identifiers.isbn',
              relationship: 'EQ',
              value: '123456789'
            },
            type: 'criteria'
          },
          {
            position: 2,
            rule: {
              value: 'END'
            },
            type: 'separator'
          }
        ],
        type: 'series'
      };
      const expectedResult = {
        rules: {
          'identifiers.isbn': {
            $eq: '123456789'
          }
        },
        type: 'series'
      };
      const copyOftestSearchQuery = JSON.parse(JSON.stringify(testSearchQuery));
      const resultQuery = parse.parseSearchQuery(testSearchQuery);
      expect(resultQuery).to.be.an('object');
      expect(resultQuery).to.have.property('rules');
      expect(resultQuery).to.have.property('type');
      expect(resultQuery).to.deep.equal(expectedResult);
    });
    it(`should have parse as an instance of QueryParser with property schemaMapper
            having vaue as undefined`, (done) => {
      const schemaMapper = 'undefined';
      const parse = new QueryParser(schemaMapper as any);
      const testSearchQuery: SearchQuery = {
        rules: [
          {
            position: 0,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 1,
            rule: {
              attribute: 'type',
              relationship: 'EQ',
              value: 'book'
            },
            type: 'criteria'
          },
          {
            position: 2,
            rule: {
              value: 'END'
            },
            type: 'separator'
          }
        ],
        type: 'book'
      };
      try {
        const resultQuery = parse.parseSearchQuery(testSearchQuery);
        done(new Error('QueryParser error expected but got success'));
      } catch (err) {
        expect(parse).to.be.instanceOf(QueryParser);
        expect(parse).to.have.property('schemaMapper', schemaMapper);
        expect(err.message).to.equal(
          'schemaMapper not found :: ' + schemaMapper
        );
        done();
      }
    });
    it(`should throw error schemaMapper not found when schemaMapper is passed as null`, (done) => {
      const schemaMapper = 'undefined';
      const parse = new QueryParser(schemaMapper as any);
      const testSearchQuery: SearchQuery = {
        rules: [
          {
            position: 0,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 1,
            rule: {
              attribute: 'type',
              relationship: 'EQ',
              value: 'book'
            },
            type: 'criteria'
          },
          {
            position: 2,
            rule: {
              value: 'END'
            },
            type: 'separator'
          }
        ],
        type: 'book'
      };
      try {
        const resultQuery = parse.parseSearchQuery(testSearchQuery);
        done(new Error('QueryParser error expected but got success'));
      } catch (err) {
        expect(parse).to.be.instanceOf(QueryParser);
        expect(parse).to.have.property('schemaMapper', schemaMapper);
        expect(err.message).to.equal(
          'schemaMapper not found :: ' + schemaMapper
        );
        done();
      }
    });
    it('should accept "ALL" operator for criteria rule', () => {
      const parse = new QueryParser(SchemaMapperV4);
      const testSearchQuery: SearchQuery = {
        rules: [
          {
            position: 0,
            rule: {
              value: 'BEGIN'
            },
            type: 'separator'
          },
          {
            position: 1,
            rule: {
              attribute: 'availability.status',
              relationship: 'ALL',
              values: ['SELLABLE', 'CAN_HOST']
            },
            type: 'criteria'
          },
          {
            position: 2,
            rule: {
              value: 'END'
            },
            type: 'separator'
          }
        ],
        type: 'book'
      };
      const expectedResult = {
        rules: {
          'availability.status': {
            $all: ['SELLABLE', 'CAN_HOST']
          }
        },
        type: 'book'
      };
      const resultQuery = parse.parseSearchQuery(testSearchQuery);
      expect(resultQuery).to.be.an('object');
      expect(resultQuery).to.have.property('rules');
      expect(resultQuery).to.have.property('type');
      expect(resultQuery).to.deep.equal(expectedResult);
    });
    it(
      'should return a valid mongo query for availability status ' +
        'inclusion and exclusion filters with $elemMatch in the query',
      () => {
        const parse = new QueryParser(SchemaMapperV4);
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 1,
              rule: {
                attribute: 'book.format',
                relationship: 'EQ',
                value: 'e-Book'
              },
              type: 'criteria'
            },
            {
              position: 0,
              rule: {
                value: 'END'
              },
              type: 'separator'
            },
            {
              position: 2,
              rule: {
                value: 'AND'
              },
              type: 'logical'
            },
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 1,
              rule: {
                attribute: 'availability.status',
                relationship: 'ALL',
                values: ['SELLABLE', 'CAN_HOST']
              },
              type: 'criteria'
            },
            {
              position: 2,
              rule: {
                value: 'AND'
              },
              type: 'logical'
            },
            {
              position: 1,
              rule: {
                attribute: 'availability.status',
                relationship: 'NI',
                values: ['DRM_PROTECTED']
              },
              type: 'criteria'
            },
            {
              position: 2,
              rule: {
                value: 'AND'
              },
              type: 'logical'
            },
            {
              position: 1,
              rule: {
                attribute: 'availability.name',
                relationship: 'EQ',
                value: 'UBX'
              },
              type: 'criteria'
            },
            {
              position: 2,
              rule: {
                value: 'END'
              },
              type: 'separator'
            },
            {
              position: 2,
              rule: {
                value: 'END'
              },
              type: 'separator'
            }
          ],
          type: 'book'
        };
        const expectedResult = {
          rules: {
            $and: [
              {
                'book.format': { $eq: 'e-Book' }
              },
              {
                availability: {
                  $elemMatch: {
                    $and: [
                      { status: { $all: ['SELLABLE', 'CAN_HOST'] } },
                      { status: { $nin: ['DRM_PROTECTED'] } },
                      { name: { $eq: 'UBX' } }
                    ]
                  }
                }
              }
            ]
          },
          type: 'book'
        };
        const resultQuery = parse.parseSearchQuery(testSearchQuery);
        expect(resultQuery).to.be.an('object');
        expect(resultQuery).to.have.property('rules');
        expect(resultQuery).to.have.property('type');
        expect(resultQuery).to.deep.equal(expectedResult);
      }
    );
  });
});
