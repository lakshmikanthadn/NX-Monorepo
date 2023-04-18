import { expect } from 'chai';

import { buildESLeafQuery } from './leafQueryBuilder';

describe('buildESLeafQuery', () => {
  it(`should throw error when invalid operator passed`, async () => {
    const prefixQuery = {
      attribute: 'availability.name',
      operator: 'XYZ',
      type: 'separator',
      value: 'UBX',
      values: null
    };

    try {
      buildESLeafQuery(prefixQuery);
    } catch (err) {
      expect(err.message).to.equal('Invalid Criteria Rule: XYZ');
    }
  });
  it(`should return processed esQuery for EQ scenario`, async () => {
    const prefixQuery = {
      attribute: 'availability.name',
      operator: 'EQ',
      type: 'criteria',
      value: 'UBX',
      values: null
    };
    const processedESQuery = {
      term: {
        [prefixQuery.attribute]: prefixQuery.value
      }
    };
    const result = buildESLeafQuery(prefixQuery);
    expect(result).to.deep.equal(processedESQuery);
  });
  it(`should return processed esQuery for NE scenario`, async () => {
    const prefixQuery = {
      attribute: 'availability.name',
      operator: 'NE',
      type: 'criteria',
      value: 'UBX',
      values: null
    };
    try {
      buildESLeafQuery(prefixQuery);
    } catch (err) {
      expect(err.message).to.equal('Invalid Criteria Rule: NE');
    }
  });
  it(`should return processed esQuery for LIKE scenario`, async () => {
    const prefixQuery = {
      attribute: 'title',
      operator: 'LIKE',
      type: 'criteria',
      value: 'health',
      values: null
    };
    const processedESQuery = {
      match: {
        title: 'health'
      }
    };
    const result = buildESLeafQuery(prefixQuery);
    expect(result).to.deep.equal(processedESQuery);
  });
  ['GT', 'LT', 'LE', 'GE'].forEach((operator) => {
    it(`should return processed esQuery for ${operator} scenario`, async () => {
      const prefixQuery = {
        attribute: 'book.firstPublishedYear',
        operator: operator,
        type: 'criteria',
        value: '2000',
        values: null
      };
      if (operator === 'GT' || operator === 'LT')
        operator = operator.toLocaleLowerCase();
      if (operator === 'GE') operator = 'gte';
      if (operator === 'LE') operator = 'lte';
      const processedESQuery = {
        range: {
          'book.firstPublishedYear': {
            [operator]: prefixQuery.value
          }
        }
      };
      const result = buildESLeafQuery(prefixQuery);
      expect(result).to.deep.equal(processedESQuery);
    });
  });
  it(`should return processed esQuery for IN scenario`, async () => {
    const prefixQuery = {
      attribute: 'availability.name',
      operator: 'IN',
      type: 'criteria',
      value: null,
      values: ['UBX']
    };
    const processedESQuery = {
      terms: {
        'availability.name': prefixQuery.values
      }
    };
    const result = buildESLeafQuery(prefixQuery);
    expect(result).to.deep.equal(processedESQuery);
  });
  it(`should return processed esQuery for NI scenario`, async () => {
    const prefixQuery = {
      attribute: 'availability.name',
      operator: 'NI',
      type: 'criteria',
      value: null,
      values: ['UBX']
    };
    try {
      buildESLeafQuery(prefixQuery);
    } catch (err) {
      expect(err.message).to.equal('Invalid Criteria Rule: NI');
    }
  });
  it(`should return processed esQuery for ALL scenario`, async () => {
    const prefixQuery = {
      attribute: 'availability.name',
      operator: 'ALL',
      type: 'criteria',
      value: null,
      values: ['ALL']
    };
    const processedESQuery = {
      terms_set: {
        'availability.name': {
          minimum_should_match_script: {
            source: 'params.num_terms'
          },
          terms: prefixQuery.values
        }
      }
    };
    const result = buildESLeafQuery(prefixQuery);
    expect(result).to.deep.equal(processedESQuery);
  });
  it(`should return processed esQuery for PREFIX scenario`, async () => {
    const prefixQuery = {
      attribute: 'classifications.code',
      operator: 'PREFIX',
      type: 'criteria',
      value: 'SUB001',
      values: null
    };
    const processedESQuery = {
      prefix: {
        [prefixQuery.attribute]: prefixQuery.value
      }
    };
    const result = buildESLeafQuery(prefixQuery);
    expect(result).to.deep.equal(processedESQuery);
  });
});
