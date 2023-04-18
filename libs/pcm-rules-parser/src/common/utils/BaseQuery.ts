import * as _ from 'lodash';

import {
  GroupedSearchQuery,
  GroupRule,
  SearchQuery
} from '../model/SearchQueryRule';
import { Validator } from './ValidateSearchQuery';

export function ungroupSearchQueryRules(
  groupedSearchQuery: GroupedSearchQuery
): SearchQuery {
  const beginSeparator = { rule: { value: 'BEGIN' }, type: 'separator' };
  const logicalAnd = { rule: { value: 'AND' }, type: 'logical' };
  const endSeparator = { rule: { value: 'END' }, type: 'separator' };

  const unGroupedRules = groupedSearchQuery.rules.reduce(
    (unGroupedRule, groupedRule: GroupRule, index: number) => {
      if (index !== 0) {
        unGroupedRule.push(logicalAnd);
      }
      return unGroupedRule.concat(groupedRule.rules);
    },
    []
  );
  unGroupedRules.push(endSeparator);
  unGroupedRules.unshift(beginSeparator);
  groupedSearchQuery.rules = unGroupedRules;
  return groupedSearchQuery as SearchQuery;
}

/**
 * The original Search Query was added at the beginning of the SEARCH QUERY Design.
 * Now the Search Query is modified to handle the group queries.
 * The Group queries specially handle the availability filter as of now.
 *
 */
export function prepareOriginalQuery(
  inputSearchQuery: GroupedSearchQuery[]
): SearchQuery[] {
  if (!inputSearchQuery || !Array.isArray(inputSearchQuery)) {
    throw new Error(
      'Invalid Input: searchQueries :: ' + JSON.stringify(inputSearchQuery)
    );
  }
  const groupedSearchQueries = _.cloneDeep(inputSearchQuery);
  const unGroupedSearchQueries = groupedSearchQueries.map(
    (groupedSearchQuery) => {
      return getUngroupedSearchQuery(groupedSearchQuery);
    }
  );
  Validator.isSearchQueriesValid(unGroupedSearchQueries);
  return unGroupedSearchQueries;
}

export function getUngroupedSearchQuery(
  groupedSearchQuery: GroupedSearchQuery
): SearchQuery {
  const rules = groupedSearchQuery?.rules;
  if (!rules || !Array.isArray(rules) || rules.length === 0) {
    return groupedSearchQuery as SearchQuery;
  }
  const isGroupedSearchQuery = groupedSearchQuery.rules.every((rule) => {
    return rule.type === 'group';
  });
  // add test case for hybrid
  // Required for validation if a search query has a hybrid query
  const isNormalQuery = groupedSearchQuery.rules.every((rule) => {
    return rule.type !== 'group';
  });
  if (isGroupedSearchQuery) {
    return ungroupSearchQueryRules(groupedSearchQuery);
  } else if (isNormalQuery) {
    return groupedSearchQuery as SearchQuery;
  } else {
    // hybrid query
    throw Error(
      'Invalid Group query, all the root level "type" should be "group"'
    );
  }
}
