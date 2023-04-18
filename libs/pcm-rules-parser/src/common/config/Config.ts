export const whiteListedRuleType = ['separator', 'logical', 'criteria'];

/**
 * Add all the NEGATE operators here along with its corresponding operator.
 * Negate-Operator: Any comparsion operator
 * that has "NOT" logical opration inbuilt.
 * example: Not-Equal(NE), Not-In(NI)
 */

export const allOperators = [
  {
    isNegate: true,
    needsArrayOperand: false,
    negateOf: 'EQ',
    value: 'NE'
  },
  {
    isNegate: false,
    needsArrayOperand: false,
    value: 'EQ'
  },
  {
    isNegate: true,
    needsArrayOperand: true,
    negateOf: 'IN',
    value: 'NI'
  },
  {
    isNegate: false,
    needsArrayOperand: true,
    value: 'IN'
  },
  {
    isNegate: false,
    needsArrayOperand: true,
    value: 'ALL'
  },
  {
    isNegate: false,
    needsArrayOperand: false,
    value: 'GT'
  },
  {
    isNegate: false,
    needsArrayOperand: false,
    value: 'LT'
  },
  {
    isNegate: false,
    needsArrayOperand: false,
    value: 'GE'
  },
  {
    isNegate: false,
    needsArrayOperand: false,
    value: 'LE'
  },
  {
    isFullTextSearchOperator: true,
    isNegate: false,
    needsArrayOperand: false,
    value: 'LIKE'
  },
  {
    isNegate: false,
    needsArrayOperand: false,
    value: 'PREFIX'
  }
];

const negateOperators = allOperators.filter((operator) => operator.isNegate);

export const negateRelationshipOperatorsMap = negateOperators.reduce(
  (acc, op) => {
    return { ...acc, [op.value]: op.negateOf };
  },
  {}
);

export const whiteListedCriteriaRelationship = allOperators.map(
  (operator) => operator.value
);

export const fullTextSearchOperators = allOperators
  .filter((o) => o.isFullTextSearchOperator)
  .map((o) => o.value);

export const whiteListedLogicalValue = ['AND', 'OR'];

export const whiteListedSeparatorValue = ['BEGIN', 'END'];

export const whiteListedProduct = [
  'Book',
  'Chapter',
  'Collection',
  'CreativeWork',
  'Set',
  'ScholarlyArticle'
];

export const whiteListedProductsV4 = [
  'book',
  'chapter',
  'collection',
  'creativeWork',
  'scholarlyArticle',
  'set',
  'series',
  'journal',
  'publishingService',
  'entry',
  'entryVersion'
];

export const whiteListedPreProductsV4 = ['preChapter'];
export type APIVersion = '4.0.0' | '4.0.1';
