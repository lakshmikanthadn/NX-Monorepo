import { expect } from 'chai';

import { getUngroupedSearchQuery } from './BaseQuery';
import { GroupedSearchQuery } from '../../common/model/SearchQueryRule';

describe('getUngroupedSearchQuery', () => {
  it(`should return proper output mongo query when valid searchQuery
          is passed having product type as series`, () => {
    const testSearchQuery: GroupedSearchQuery = {
      rules: [],
      type: 'series'
    };

    const resultQuery = getUngroupedSearchQuery(testSearchQuery);
    expect(resultQuery).to.deep.equal(testSearchQuery);
  });
});
