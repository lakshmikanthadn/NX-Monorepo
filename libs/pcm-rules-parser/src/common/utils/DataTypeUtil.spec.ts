import { expect } from 'chai';

import { SchemaMapperV4 } from '@tandfgroup/pcm-schema-mapper-v4';
import { SearchQuery } from '../model/SearchQueryRule';
import { transformSearchQueryBasedOnDataType } from './DataTypeUtil';

describe('DataTypeUtil', () => {
  describe('transformSearchQueryBasedOnDataType', () => {
    it(`should convert value of type string('100') to number(100) as per model v4 schema`, () => {
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
              attribute: 'book.format',
              relationship: 'EQ',
              value: 'e-book'
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
              attribute: 'prices.price',
              relationship: 'EQ',
              value: '100'
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
      const expectedResult: SearchQuery = {
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
              attribute: 'book.format',
              relationship: 'EQ',
              value: 'e-book'
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
              attribute: 'prices.price',
              relationship: 'EQ',
              value: 100
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
      const resultQueryData = transformSearchQueryBasedOnDataType(
        testSearchQuery,
        SchemaMapperV4['book']
      );
      expect(resultQueryData).to.deep.equal(expectedResult);
    });
    it(`should not add .keyword when attribute is _id`, () => {
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
              attribute: '_id',
              relationship: 'EQ',
              value: '123avc'
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
      const expectedResult: SearchQuery = {
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
              attribute: '_id',
              relationship: 'EQ',
              value: '123avc'
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
      const resultQueryData = transformSearchQueryBasedOnDataType(
        testSearchQuery,
        SchemaMapperV4['book'],
        true
      );
      expect(resultQueryData).to.deep.equal(expectedResult);
    });
    it(`should convert value of type string('100') to number(100) as per original schema`, () => {
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
              attribute: 'book.format',
              relationship: 'EQ',
              value: 'e-book'
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
              attribute: 'prices.price',
              relationship: 'EQ',
              value: '100'
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
      const expectedResult: SearchQuery = {
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
              attribute: 'book.format',
              relationship: 'EQ',
              value: 'e-book'
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
              attribute: 'prices.price',
              relationship: 'EQ',
              value: 100
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
      const resultQueryData = transformSearchQueryBasedOnDataType(
        testSearchQuery,
        SchemaMapperV4['book']
      );
      expect(resultQueryData).to.deep.equal(expectedResult);
    });
    it(`should return value as it is when data type is same assuming number`, () => {
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
              attribute: 'prices.price',
              relationship: 'EQ',
              value: 200.95
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
      const expectedResult: SearchQuery = {
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
              attribute: 'prices.price',
              relationship: 'EQ',
              value: 200.95
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
      const resultQueryData = transformSearchQueryBasedOnDataType(
        testSearchQuery,
        SchemaMapperV4['book']
      );
      expect(resultQueryData).to.deep.equal(expectedResult);
    });
    it(`should return Invalid Input: criteriaRule when value of type string('100ABC')
            is converted to number`, (done) => {
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
                attribute: 'prices.price',
                relationship: 'EQ',
                value: '100ABC'
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
        const resultQuery = transformSearchQueryBasedOnDataType(
          testSearchQuery,
          SchemaMapperV4['book']
        );
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal(
          'invalid value, a number value is expected'
        );
        done();
      }
    });
    it(`should convert value of type string('True') to boolean(true)`, () => {
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
              attribute: '_isSellable',
              relationship: 'EQ',
              value: 'True'
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
      const expectedResult: SearchQuery = {
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
              attribute: '_isSellable',
              relationship: 'EQ',
              value: true
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
      const resultQueryData = transformSearchQueryBasedOnDataType(
        testSearchQuery,
        SchemaMapperV4['book']
      );
      expect(resultQueryData).to.deep.equal(expectedResult);
    });
    it(`should convert value of type string('False') to boolean(false)`, () => {
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
              attribute: '_isSellable',
              relationship: 'EQ',
              value: 'False'
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
      const expectedResult: SearchQuery = {
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
              attribute: '_isSellable',
              relationship: 'EQ',
              value: false
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
      const resultQueryData = transformSearchQueryBasedOnDataType(
        testSearchQuery,
        SchemaMapperV4['book']
      );
      expect(resultQueryData).to.deep.equal(expectedResult);
    });
    it(`should return value as it is when data type is same assuming boolean(true)`, () => {
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
              attribute: '_isSellable',
              relationship: 'EQ',
              value: true
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
      const expectedResult: SearchQuery = {
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
              attribute: '_isSellable',
              relationship: 'EQ',
              value: true
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
      const resultQueryData = transformSearchQueryBasedOnDataType(
        testSearchQuery,
        SchemaMapperV4['book']
      );
      expect(resultQueryData).to.deep.equal(expectedResult);
    });
    it(`should return value as it is when data type is same assuming boolean(false)`, () => {
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
              attribute: '_isSellable',
              relationship: 'EQ',
              value: false
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
      const expectedResult: SearchQuery = {
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
              attribute: '_isSellable',
              relationship: 'EQ',
              value: false
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
      const resultQueryData = transformSearchQueryBasedOnDataType(
        testSearchQuery,
        SchemaMapperV4['book']
      );
      expect(resultQueryData).to.deep.equal(expectedResult);
    });
    it(`should return Invalid Input: criteriaRule when value of type string('some-value')
          is converted to boolean`, (done) => {
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
                attribute: '_isSellable',
                relationship: 'EQ',
                value: 'some-value'
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
        const resultQuery = transformSearchQueryBasedOnDataType(
          testSearchQuery,
          SchemaMapperV4['book']
        );
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal(
          'invalid value, a boolean value is expected'
        );
        done();
      }
    });
    it(`should convert value of type number(12345) to string('12345')`, () => {
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
              value: 12345
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
      const expectedResult: SearchQuery = {
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
              value: '12345'
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
      const resultQueryData = transformSearchQueryBasedOnDataType(
        testSearchQuery,
        SchemaMapperV4['book']
      );
      expect(resultQueryData).to.deep.equal(expectedResult);
    });
    it(`should return Invalid Input: criteriaRule when value is of type Array([])`, (done) => {
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
                attribute: 'prices.price',
                relationship: 'EQ',
                value: ['100', '200', '300']
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
        const resultQuery = transformSearchQueryBasedOnDataType(
          testSearchQuery,
          SchemaMapperV4['book']
        );
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Input: criteriaRule');
        done();
      }
    });
    it(`should convert values[data] of type string('100') to number(100)`, () => {
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
              attribute: 'prices.price',
              relationship: 'EQ',
              values: ['100', '200', '300']
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
      const expectedResult: SearchQuery = {
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
              attribute: 'prices.price',
              relationship: 'EQ',
              values: [100, 200, 300]
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
      const resultQueryData = transformSearchQueryBasedOnDataType(
        testSearchQuery,
        SchemaMapperV4['book']
      );
      expect(resultQueryData).to.deep.equal(expectedResult);
    });
    it(`should return values[] as it is when datatype of values[data] are same assuming number`, () => {
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
              attribute: 'prices.price',
              relationship: 'EQ',
              values: [100, 200, 300]
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
      const expectedResult: SearchQuery = {
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
              attribute: 'prices.price',
              relationship: 'EQ',
              values: [100, 200, 300]
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
      const resultQueryData = transformSearchQueryBasedOnDataType(
        testSearchQuery,
        SchemaMapperV4['book']
      );
      expect(resultQueryData).to.deep.equal(expectedResult);
    });
    it(`should work for classifications[type:netbase].code with proper result`, () => {
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
              attribute: 'classifications[type:netbase].code',
              relationship: 'IN',
              values: ['WB038']
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
      const expectedResult: SearchQuery = {
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
              attribute: 'classifications[type:netbase].code',
              relationship: 'IN',
              values: ['WB038']
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
      const resultQueryData = transformSearchQueryBasedOnDataType(
        testSearchQuery,
        SchemaMapperV4['book']
      );
      expect(resultQueryData).to.deep.equal(expectedResult);
    });
    it(`should convert values[data] when type of some data are matching
         while some are not`, () => {
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
              attribute: 'classifications[type:netbase].code',
              relationship: 'IN',
              values: ['WB038', 100, 108]
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
      const expectedResult: SearchQuery = {
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
              attribute: 'classifications[type:netbase].code',
              relationship: 'IN',
              values: ['WB038', '100', '108']
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
      const resultQueryData = transformSearchQueryBasedOnDataType(
        testSearchQuery,
        SchemaMapperV4['book']
      );
      expect(resultQueryData).to.deep.equal(expectedResult);
    });
    it(`should convert values[data] i.e (string) when values[data]
         have multiple types`, () => {
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
              attribute: 'classifications[type:netbase].code',
              relationship: 'IN',
              values: ['WB038', 100, true, false]
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
      const expectedResult: SearchQuery = {
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
              attribute: 'classifications[type:netbase].code',
              relationship: 'IN',
              values: ['WB038', '100', 'true', 'false']
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
      const resultQueryData = transformSearchQueryBasedOnDataType(
        testSearchQuery,
        SchemaMapperV4['book']
      );
      expect(resultQueryData).to.deep.equal(expectedResult);
    });
    it(`should return Invalid Input: criteriaRule when values[data] converting to (boolean)
         and it have multiple types`, (done) => {
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
                attribute: '_isSellable',
                relationship: 'IN',
                values: [100, true, false]
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
        const resultQuery = transformSearchQueryBasedOnDataType(
          testSearchQuery,
          SchemaMapperV4['book']
        );
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal(
          'invalid value, a boolean value is expected'
        );
        done();
      }
    });
    it(`should return Invalid Input: criteriaRule when values[data] converting to (number)
        and it have multiple types`, (done) => {
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
                attribute: 'prices.price',
                relationship: 'EQ',
                values: [100, true, false]
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
        const resultQuery = transformSearchQueryBasedOnDataType(
          testSearchQuery,
          SchemaMapperV4['book']
        );
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal(
          'invalid value, a number value is expected'
        );
        done();
      }
    });
    it(`should return Invalid Input: criteriaRule when values is of type null`, (done) => {
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
                attribute: 'prices.price',
                relationship: 'EQ',
                values: null
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
        const resultQuery = transformSearchQueryBasedOnDataType(
          testSearchQuery,
          SchemaMapperV4['book']
        );
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Input: criteriaRule');
        done();
      }
    });
    it(`should return Invalid Input: criteriaRule when values is of type undefined`, (done) => {
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
                attribute: 'prices.price',
                relationship: 'EQ',
                values: undefined
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
        const resultQuery = transformSearchQueryBasedOnDataType(
          testSearchQuery,
          SchemaMapperV4['book']
        );
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid Input: criteriaRule');
        done();
      }
    });
    it(`should convert value of type string(ISO Date) to Date`, () => {
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
              attribute: '_createdDate',
              relationship: 'EQ',
              value: '2019-06-19T07:42:18.000Z'
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
      const expectedResult: SearchQuery = {
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
              attribute: '_createdDate',
              relationship: 'EQ',
              value: new Date('2019-06-19T07:42:18.000Z')
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
      const resultQueryData = transformSearchQueryBasedOnDataType(
        testSearchQuery,
        SchemaMapperV4['book']
      );
      expect(resultQueryData).to.deep.equal(expectedResult);
    });
    it(`should return Invalid Input: criteriaRule when invalid ISO Date is passed`, (done) => {
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
                attribute: '_createdDate',
                relationship: 'EQ',
                value: '2019'
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
        const resultQuery = transformSearchQueryBasedOnDataType(
          testSearchQuery,
          SchemaMapperV4['book']
        );
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('invalid value, a date value is expected');
        done();
      }
    });
    it(`should return Invalid Input: criteriaRule when invalid attribute is passed`, (done) => {
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
                attribute: 'ISBN',
                relationship: 'EQ',
                value: '12345789'
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
        const resultQuery = transformSearchQueryBasedOnDataType(
          testSearchQuery,
          SchemaMapperV4['book']
        );
        done(new Error('Parse error expected but got success'));
      } catch (err) {
        expect(err.message).to.equal('Invalid attribute name: ISBN');
        done();
      }
    });
    it(`should convert values[string(ISO Date)] to values[Date]`, () => {
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
              attribute: '_createdDate',
              relationship: 'IN',
              values: [
                '2019-06-19T07:42:18.000Z',
                '2019-08-27T07:35:24.135Z',
                '2019-11-09T10:05:13.776Z'
              ]
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
      const expectedResult: SearchQuery = {
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
              attribute: '_createdDate',
              relationship: 'IN',
              values: [
                new Date('2019-06-19T07:42:18.000Z'),
                new Date('2019-08-27T07:35:24.135Z'),
                new Date('2019-11-09T10:05:13.776Z')
              ]
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
      const resultQueryData = transformSearchQueryBasedOnDataType(
        testSearchQuery,
        SchemaMapperV4['book']
      );
      expect(resultQueryData).to.deep.equal(expectedResult);
    });
  });
});
