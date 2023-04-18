import { expect } from 'chai';

import { SchemaMapperV4 } from '@tandfgroup/pcm-schema-mapper-v4';
import { RelationshipTypes } from '../model/CriteriaRule';
import { SearchQuery } from '../model/SearchQueryRule';
import { Validator } from './ValidateSearchQuery';

describe('ValidateSearchQuery', () => {
  describe('Validator', () => {
    describe('validateSearchQuery', () => {
      it(`should return true if input searchQuery is valid`, () => {
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
        const resultSearchQuery = Validator.validateSearchQuery(
          testSearchQuery,
          SchemaMapperV4['book']
        );
        expect(resultSearchQuery).to.equal(true);
      });
      it(`should return Invalid Input: searchQuery :: null when null searchQuery is passed`, (done) => {
        const testSearchQuery: SearchQuery = null;
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal('Invalid Input: searchQuery :: null');
          done();
        }
      });
      it(`should return Invalid Input: searchQuery :: undefined when undefined searchQuery
             is passed`, (done) => {
        const testSearchQuery: SearchQuery = undefined;
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(
            'Invalid Input: searchQuery :: undefined'
          );
          done();
        }
      });
      it(`should return Invalid Input: searchQuery type :: Some when some searchQuery type
                is passed`, (done) => {
        const testSearchQuery: SearchQuery = {
          type: 'Some'
        } as SearchQuery;
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['Some']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(
            'Invalid Input: searchQuery type :: Some'
          );
          done();
        }
      });
      it(`should return Invalid Input: searchQuery type :: null when searchQuery type=null`, (done) => {
        const testSearchQuery: SearchQuery = {
          type: null
        } as SearchQuery;
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(
            'Invalid Input: searchQuery type :: null'
          );
          done();
        }
      });
      it(`should return Invalid Input: searchQuery rules :: null when searchQuery
                rules=null`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: null,
          type: 'book'
        } as SearchQuery;
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(
            'Invalid Input: searchQuery rules :: null'
          );
          done();
        }
      });
      it(`should return Invalid Input: searchQuery rules when searchQuery rules is empty []`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [],
          type: 'book'
        } as SearchQuery;
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(
            'Invalid Input: searchQuery rules :: []'
          );
          done();
        }
      });
      it(`should return Invalid Input: invalid rules type when rules type is null`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: null
            }
          ],
          type: 'book'
        } as SearchQuery;
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(
            'Invalid Input: invalid rules type :: null'
          );
          done();
        }
      });
      it(`should return Invalid Input: invalid rules type when rules type is not separator,
            logical or criteria`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: 'some-rules-type'
            }
          ],
          type: 'book'
        } as SearchQuery;
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(
            'Invalid Input: invalid rules type :: ' +
              testSearchQuery.rules[0].type
          );
          done();
        }
      });
      it(`should return Invalid Input: invalid Separator Rule when separator rule is null`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: null,
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
        } as SearchQuery;
        const errMessage = 'Invalid Input: invalid Separator Rule :: null';
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid Separator Rule when separator rule
                value is null`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                value: null
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
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid Separator Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid Separator Rule when invalid separator
            rule value is passed`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                value: 'begin'
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
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid Separator Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid Logical Rule when logical rule is null`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: null,
              type: 'logical'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid Logical Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid Logical Rule when logical rule value is null`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                value: null
              },
              type: 'logical'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid Logical Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid Logical Rule when logical rule value is not
            AND, OR`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                value: 'and'
              },
              type: 'logical'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid Logical Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid Criteria Rule when criteria rule is null`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: null,
              type: 'criteria'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid Criteria Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid value or values in Criteria Rule when criteria
                rule value is null`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                attribute: 'type',
                relationship: 'EQ',
                value: null
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid value or values in Criteria Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid value or values in Criteria Rule when criteria
                rule value is array`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                attribute: 'type',
                relationship: 'EQ',
                value: ['WB101']
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid value or values in Criteria Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return true when criteria rule value is true`, () => {
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
        } as SearchQuery;
        const resultSearchQuery = Validator.validateSearchQuery(
          testSearchQuery,
          SchemaMapperV4['book']
        );
        expect(resultSearchQuery).to.equal(true);
      });
      it(`should return true when criteria rule value is false`, () => {
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
        } as SearchQuery;
        const resultSearchQuery = Validator.validateSearchQuery(
          testSearchQuery,
          SchemaMapperV4['book']
        );
        expect(resultSearchQuery).to.equal(true);
      });
      it(`should return true when criteria rule value is number 100`, () => {
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
                value: 100
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
        } as SearchQuery;
        const resultSearchQuery = Validator.validateSearchQuery(
          testSearchQuery,
          SchemaMapperV4['book']
        );
        expect(resultSearchQuery).to.equal(true);
      });
      it(`should return true when criteria rule value is Date`, () => {
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
                value: new Date()
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
        } as SearchQuery;
        const resultSearchQuery = Validator.validateSearchQuery(
          testSearchQuery,
          SchemaMapperV4['book']
        );
        expect(resultSearchQuery).to.equal(true);
      });
      it(`should return Invalid Input: invalid value or values in Criteria Rule when criteria
                rule value is []`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                attribute: 'type',
                relationship: 'EQ',
                value: []
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid value or values in Criteria Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid value or values in Criteria Rule when criteria
                rule value is undefined`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                attribute: 'type',
                relationship: 'EQ',
                value: undefined
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid value or values in Criteria Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid value or values in Criteria Rule when criteria
                rule values is null`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                attribute: 'type',
                relationship: 'EQ',
                values: null
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid value or values in Criteria Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid value or values in Criteria Rule when criteria
                rule values is string`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                attribute: 'type',
                relationship: 'EQ',
                values: 'WB101' as any
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid value or values in Criteria Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid value or values in Criteria Rule when criteria
                rule values is true`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                attribute: 'type',
                relationship: 'EQ',
                values: true as any
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid value or values in Criteria Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid value or values in Criteria Rule when criteria
                rule values is false`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                attribute: 'type',
                relationship: 'EQ',
                values: false as any
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid value or values in Criteria Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid value or values in Criteria Rule when criteria
                rule values is number 100`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                attribute: 'type',
                relationship: 'EQ',
                values: 100 as any
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid value or values in Criteria Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid value or values in Criteria Rule when criteria
                rule value is Date`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                attribute: 'type',
                relationship: 'EQ',
                values: new Date() as any
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid value or values in Criteria Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid value or values in Criteria Rule when criteria
                rule values is []`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                attribute: 'type',
                relationship: 'EQ',
                values: []
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid value or values in Criteria Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid value or values in Criteria Rule when criteria
                rule values is undefined`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                attribute: 'type',
                relationship: 'EQ',
                values: undefined
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid value or values in Criteria Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid value or values in Criteria Rule when IN or NI
            relationship is passed with value assuming IN`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                attribute: 'type',
                relationship: 'IN',
                value: 'book'
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid value or values in Criteria Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid value or values in Criteria Rule when IN or NI
            relationship is passed with value assuming IN`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                attribute: 'type',
                relationship: 'NI',
                value: 'book'
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid value or values in Criteria Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid value or values in Criteria Rule when EQ
            relationship is passed with values`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                attribute: 'type',
                relationship: 'EQ',
                values: ['book', 'chapter']
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid value or values in Criteria Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid value or values in Criteria Rule when NE
            relationship is passed with values`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                attribute: 'type',
                relationship: 'NE',
                values: ['book', 'chapter']
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid value or values in Criteria Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid value or values in Criteria Rule when GT
            relationship is passed with values`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                attribute: 'type',
                relationship: 'GT',
                values: ['book', 'chapter']
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid value or values in Criteria Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid value or values in Criteria Rule when LT
            relationship is passed with values`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                attribute: 'type',
                relationship: 'LT',
                values: ['book', 'chapter']
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid value or values in Criteria Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid value or values in Criteria Rule when GE
            relationship is passed with values`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                attribute: 'type',
                relationship: 'GE',
                values: ['book', 'chapter']
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid value or values in Criteria Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid value or values in Criteria Rule when LE
            relationship is passed with values`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                attribute: 'type',
                relationship: 'LE',
                values: ['book', 'chapter']
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid value or values in Criteria Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid relationship in Criteria Rule when criteria rule
            relationship is not 'EQ' | 'NE' | 'GT' | 'GE' | 'LT' | 'LE' | 'IN' | 'NI'`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                attribute: 'type',
                relationship: 'eq' as RelationshipTypes,
                value: 'book'
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid relationship in Criteria Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid relationship in Criteria Rule when criteria rule
            relationship is null`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                attribute: 'type',
                relationship: null as RelationshipTypes,
                value: 'book'
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid relationship in Criteria Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid attribute name in Criteria Rule when criteria
                rule attribute is null`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                attribute: null,
                relationship: 'EQ',
                value: 'book'
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid attribute name in Criteria Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid attribute name in Criteria Rule when criteria
                rule attribute is not proper`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                attribute: 'ISBN',
                relationship: 'EQ',
                value: '998123456'
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid attribute name in Criteria Rule :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid value, a number value is expected when criteria
            rule value is not proper`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                attribute: 'prices.price',
                relationship: 'EQ',
                value: 'abcd'
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid value, a number value is expected :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid value, a boolean value is expected when criteria
            rule value is not proper`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                attribute: '_isSellable',
                relationship: 'EQ',
                value: 'abcd'
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid value, a boolean value is expected :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: invalid value, a date value is expected when criteria
            rule value is not proper`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                attribute: '_createdDate',
                relationship: 'EQ',
                value: 'abcd'
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage =
          'Invalid Input: invalid value, a date value is expected :: ' +
          JSON.stringify(testSearchQuery.rules[0].rule);
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: rules are not in proper order when only
                BEGIN separator is passed`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage = 'Invalid Input: rules are not in proper order';
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return Invalid Input: rules are not in proper order when only
                END separator is passed`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                value: 'END'
              },
              type: 'separator'
            }
          ],
          type: 'book'
        } as SearchQuery;
        const errMessage = 'Invalid Input: rules are not in proper order';
        try {
          const resultSearchQuery = Validator.validateSearchQuery(
            testSearchQuery,
            SchemaMapperV4['book']
          );
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should return true when attribute is classifications[type:netbase].enteries.code`, () => {
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
                values: ['WB01', 'WB02', 'WB03']
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
        } as SearchQuery;
        const resultSearchQuery = Validator.validateSearchQuery(
          testSearchQuery,
          SchemaMapperV4['book']
        );
        expect(resultSearchQuery).to.equal(true);
      });
    });
    describe('validateSearchQueries', () => {
      it(`should return true if input searchQueries are valid`, () => {
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
                  value: 'e-book'
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
          },
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
            type: 'set'
          }
        ];
        const resultSearchQueries = Validator.validateSearchQueries(
          testSearchQueries,
          SchemaMapperV4
        );
        expect(resultSearchQueries).to.equal(true);
      });
      it(`should return Invalid Input: searchQueries :: null when null searchQueries is passed`, (done) => {
        const testSearchQueries: SearchQuery[] = null;
        try {
          Validator.validateSearchQueries(testSearchQueries, SchemaMapperV4);
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal('Invalid Input: searchQueries :: null');
          done();
        }
      });
      it(`should return Invalid Input: searchQueries :: [] when searchQueries=[] empty`, (done) => {
        const testSearchQueries: SearchQuery[] = [];
        try {
          Validator.validateSearchQueries(testSearchQueries, SchemaMapperV4);
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal('Invalid Input: searchQueries :: []');
          done();
        }
      });
      it(`should return Invalid Input: searchQueries :: undefined when searchQueries=undefined`, (done) => {
        const testSearchQueries: SearchQuery[] = undefined;
        try {
          Validator.validateSearchQueries(testSearchQueries, SchemaMapperV4);
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(
            'Invalid Input: searchQueries :: undefined'
          );
          done();
        }
      });
      it(`should return Invalid Input: searchQueries when searchQuery is passed
             instead of searchQueries`, (done) => {
        const testSearchQueries: SearchQuery[] = {
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
                value: 'e-book'
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
        } as any;
        try {
          Validator.validateSearchQueries(testSearchQueries, SchemaMapperV4);
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(
            'Invalid Input: searchQueries :: ' +
              JSON.stringify(testSearchQueries)
          );
          done();
        }
      });
    });
    describe('isSearchQueriesValid', () => {
      it(`should return true if input searchQueries is valid`, () => {
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
                  value: 'e-book'
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
          },
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
            type: 'set'
          }
        ];
        const resultSearchQueries =
          Validator.isSearchQueriesValid(testSearchQueries);
        expect(resultSearchQueries).to.equal(true);
      });
      it(`should return Invalid Input: searchQueries :: null when null searchQueries is passed`, (done) => {
        const testSearchQueries: SearchQuery[] = null;
        try {
          Validator.isSearchQueriesValid(testSearchQueries);
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal('Invalid Input: searchQueries :: null');
          done();
        }
      });
      it(`should return Invalid Input: searchQueries :: [] when searchQueries=[] empty`, (done) => {
        const testSearchQueries: SearchQuery[] = [];
        try {
          Validator.isSearchQueriesValid(testSearchQueries);
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal('Invalid Input: searchQueries :: []');
          done();
        }
      });
      it(`should return Invalid Input: searchQueries :: undefined when searchQueries=undefined`, (done) => {
        const testSearchQueries: SearchQuery[] = undefined;
        try {
          Validator.isSearchQueriesValid(testSearchQueries);
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(
            'Invalid Input: searchQueries :: undefined'
          );
          done();
        }
      });
      it(`should return Invalid Input: searchQueries when searchQuery is passed
             instead of searchQueries`, (done) => {
        const testSearchQueries: SearchQuery[] = {
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
                value: 'e-book'
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
        } as any;
        try {
          Validator.isSearchQueriesValid(testSearchQueries);
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(
            'Invalid Input: searchQueries :: ' +
              JSON.stringify(testSearchQueries)
          );
          done();
        }
      });
    });
    describe('validateRuleOrder', () => {
      it(`should return true as no. of '(' = ')'`, () => {
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
        const resultQuery = Validator.validateRuleOrder(testSearchQuery);
        expect(resultQuery).to.equal(true);
      });
      it(`should return true as no. of '(' = ')'`, () => {
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
                attribute: 'type',
                relationship: 'EQ',
                value: 'Article'
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
                attribute: 'book.format',
                relationship: 'EQ',
                value: 'EBK'
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
        };
        const resultQuery = Validator.validateRuleOrder(testSearchQuery);
        expect(resultQuery).to.equal(true);
      });
      it(`should throw invalid rule error as no. of '(' < ')'`, (done) => {
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
                attribute: 'type',
                relationship: 'EQ',
                value: 'Article'
              },
              type: 'criteria'
            },
            {
              position: 7,
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
          const resultSearchQuery =
            Validator.validateRuleOrder(testSearchQuery);
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should throw invalid rule error as no. of '(' < ')'`, (done) => {
        const testSearchQuery: SearchQuery = {
          rules: [
            {
              position: 0,
              rule: {
                value: 'END'
              },
              type: 'separator'
            },
            {
              position: 1,
              rule: {
                value: 'AND'
              },
              type: 'logical'
            },
            {
              position: 2,
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
        const errMessage = 'Invalid Input: rules are not in proper order';
        try {
          const resultSearchQuery =
            Validator.validateRuleOrder(testSearchQuery);
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should throw invalid rule error as no. of '(' > ')'`, (done) => {
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
                attribute: 'type',
                relationship: 'EQ',
                value: 'Article'
              },
              type: 'criteria'
            }
          ],
          type: 'book'
        };
        const resultSearchQuery = Validator.validateRuleOrder(testSearchQuery);
        expect(resultSearchQuery).to.equal(false);
        done();
      });
      it(`should throw invalid rule error as no. of '(' > ')'`, (done) => {
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
                value: 'OR'
              },
              type: 'logical'
            },
            {
              position: 6,
              rule: {
                attribute: 'type',
                relationship: 'EQ',
                value: 'Article'
              },
              type: 'criteria'
            },
            {
              position: 7,
              rule: {
                value: 'END'
              },
              type: 'separator'
            }
          ],
          type: 'book'
        };
        const resultSearchQuery = Validator.validateRuleOrder(testSearchQuery);
        expect(resultSearchQuery).to.equal(false);
        done();
      });
      it(`should return true if input searchQuery is of format (A&B)`, () => {
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
                value: '12345789'
              },
              type: 'criteria'
            },
            {
              position: 5,
              rule: {
                value: 'AND'
              },
              type: 'logical'
            },
            {
              position: 3,
              rule: {
                attribute: 'categories.name',
                relationship: 'EQ',
                value: 'edited'
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
        const resultSearchQuery = Validator.validateRuleOrder(testSearchQuery);
        expect(resultSearchQuery).to.equal(true);
      });
      it(`should return true if input searchQuery is of format ((A&B)&(C&D))`, () => {
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
                attribute: 'identifiers.isbn',
                relationship: 'EQ',
                value: '12345789'
              },
              type: 'criteria'
            },
            {
              position: 5,
              rule: {
                value: 'AND'
              },
              type: 'logical'
            },
            {
              position: 3,
              rule: {
                attribute: 'categories.name',
                relationship: 'EQ',
                value: 'edited'
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
              position: 5,
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
                attribute: 'identifiers.isbn',
                relationship: 'EQ',
                value: '12345789'
              },
              type: 'criteria'
            },
            {
              position: 5,
              rule: {
                value: 'AND'
              },
              type: 'logical'
            },
            {
              position: 3,
              rule: {
                attribute: 'categories.name',
                relationship: 'EQ',
                value: 'edited'
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
        const resultSearchQuery = Validator.validateRuleOrder(testSearchQuery);
        expect(resultSearchQuery).to.equal(true);
      });
      it(`should throw invalid rule error as input searchQuery has BEGIN rule right after criteria rule`, (done) => {
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
                value: '12345789'
              },
              type: 'criteria'
            },
            {
              position: 0,
              rule: {
                value: 'BEGIN'
              },
              type: 'separator'
            },
            {
              position: 2,
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
              position: 3,
              rule: {
                attribute: 'categories.name',
                relationship: 'EQ',
                value: 'edited'
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
        const errMessage = 'Invalid Input: rules are not in proper order';
        try {
          const resultSearchQuery =
            Validator.validateRuleOrder(testSearchQuery);
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should throw invalid rule error as input searchQuery has 2 consecutive criteria rules`, (done) => {
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
                value: '12345789'
              },
              type: 'criteria'
            },
            {
              position: 3,
              rule: {
                attribute: 'categories.name',
                relationship: 'EQ',
                value: 'edited'
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
        const errMessage = 'Invalid Input: rules are not in proper order';
        try {
          const resultSearchQuery =
            Validator.validateRuleOrder(testSearchQuery);
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
      it(`should throw invalid rule error if rule type is invalid`, (done) => {
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
                value: '12345789'
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
        const errMessage = 'Invalid Input: rule type is invalid';
        try {
          const resultSearchQuery =
            Validator.validateRuleOrder(testSearchQuery);
          done(new Error('Parse error expected but got success'));
        } catch (err) {
          expect(err.message).to.equal(errMessage);
          done();
        }
      });
    });
  });
});
