// import { SearchQueryV4 } from '@tandfgroup/pcm-rules-parser';
// import { expect } from 'chai';

// import { searchQueryUtil } from './SearchQueryUtil';

// const testRulesV4 = [
//   {
//     position: 0,
//     rule: {
//       value: 'BEGIN'
//     },
//     type: 'separator'
//   },
//   {
//     position: 1,
//     rule: {
//       attribute: 'type',
//       relationship: 'EQ',
//       value: 'chapter'
//     },
//     type: 'criteria'
//   },
//   {
//     position: 2,
//     rule: {
//       value: 'END'
//     },
//     type: 'separator'
//   }
// ];

// describe('SearchQueryUtils', () => {
//   describe('getQueryForRulesWithProductsQuery', () => {
//     it('should add products query to rules-query when productType=Book', () => {
//       const rules = JSON.parse(JSON.stringify(testRulesV4));
//       rules[1].rule.attribute = 'type';
//       rules[1].rule.value = 'book';
//       const query = searchQueryUtil.getQueryForRulesProductsQuery(
//         'book',
//         rules
//       );
//       expect(query).to.be.deep.equals({ type: { $eq: 'book' } });
//     });

//     it('should throw error when the rules are invalid', () => {
//       const query = searchQueryUtil.getQueryForRulesProductsQuery(
//         'chapter',
//         []
//       );
//       expect(query).to.deep.equal({});
//     });
//   });
//   describe('getRulesStringFromSearchQuery', () => {
//     it('should set the rules string for the all the rules', () => {
//       const testBookRules = JSON.parse(JSON.stringify(testRulesV4));
//       testBookRules[1].rule.attribute = 'type';
//       testBookRules[1].rule.value = 'book';
//       const testChapterRules = JSON.parse(JSON.stringify(testRulesV4));
//       testChapterRules[1].rule.attribute = 'type';
//       testChapterRules[1].rule.value = 'chapter';
//       const testSetRules = JSON.parse(JSON.stringify(testRulesV4));
//       testSetRules[1].rule.attribute = 'type';
//       testSetRules[1].rule.value = 'set';
//       const attributes = [];
//       const rulesString = '';
//       const modifiedSearchQuery = searchQueryUtil.getRulesStringFromSearchQuery(
//         [
//           { attributes, rules: testBookRules, rulesString, type: 'book' },
//           { attributes, rules: testChapterRules, rulesString, type: 'chapter' },
//           { attributes, rules: testSetRules, rulesString, type: 'set' }
//         ] as SearchQueryV4[]
//       );
//       expect(modifiedSearchQuery).to.be.an('array');
//       expect(modifiedSearchQuery.length).to.equal(3);
//       expect(modifiedSearchQuery[0]).to.have.property('rulesString');
//       expect(modifiedSearchQuery[1]).to.have.property('rulesString');
//       expect(modifiedSearchQuery[2]).to.have.property('rulesString');
//       const testBookRulesString = JSON.parse(
//         modifiedSearchQuery[0].rulesString
//       );
//       expect(testBookRulesString).to.deep.equals({ type: { $eq: 'book' } });
//     });
//     it(
//       'should set the rulesString for all rules having planned ' +
//         'publicationDate',
//       () => {
//         const attributes = [];
//         const rulesString = '';
//         testRulesV4[1].rule.attribute = 'book.publicationDate';
//         testRulesV4[1].rule.value = '2000-12-01T10:17:59.000Z';
//         const modifiedSearchQuery =
//           searchQueryUtil.getRulesStringFromSearchQuery([
//             { attributes, rules: testRulesV4, rulesString, type: 'book' }
//           ] as SearchQueryV4[]);
//         expect(modifiedSearchQuery).to.be.an('array');
//         expect(modifiedSearchQuery.length).to.equal(1);
//         expect(modifiedSearchQuery[0]).to.have.property('rulesString');
//         const parsedRulesString =
//           '{"book.publicationDate":{"$eq":ISODate("2000-12-01T10:17:59.000Z")}}';
//         expect(modifiedSearchQuery[0].rulesString).to.deep.equals(
//           parsedRulesString
//         );
//       }
//     );
//     it('should throw error when productType is invalid in rules ', () => {
//       const attributes = [];
//       const rulesString = '';
//       try {
//         searchQueryUtil.getRulesStringFromSearchQuery([
//           { attributes, rules: testRulesV4, rulesString, type: 'Book' }
//         ] as SearchQueryV4[]);
//       } catch (e) {
//         expect(e.message).to.equal('schemaMapper not found :: undefined');
//       }
//     });
//   });
// });
