import * as _ from 'lodash';
import * as Logger from 'log4js';

import { prepareQueryByRelation } from './builder';
import { ParserTemplateDataHolder } from '../common/model/ParserTemplateDataHolder';
import {
  GroupedSearchQuery,
  SearchQuery
} from '../common/model/SearchQueryRule';
import { transformSearchQueryBasedOnDataType } from '../common/utils/DataTypeUtil';
import { handleGroupedQueries } from '../common/utils/GroupedQueries';
import { prepareOriginalQuery } from '../common/utils/BaseQuery';
import { Validator } from '../common/utils/ValidateSearchQuery';

const log = Logger.getLogger('Parser');

export class MongoQueryParser {
  private schemaMapper: object;

  constructor(schemaMapper: object) {
    this.schemaMapper = schemaMapper;
  }

  public parse(inputSearchQuery: GroupedSearchQuery[]): GroupedSearchQuery[] {
    const inputSearchQueries = prepareOriginalQuery(inputSearchQuery);
    return inputSearchQueries.map((searchQuery: SearchQuery) => {
      return this.parseSearchQuery(searchQuery);
    });
  }

  /**
   * This method parses the SearchQuery rules and results in mongo db query.
   * It works on two stages.
   * Stage 1: Converts rules json based on 'type' whether Separator, Logical and Criteria
   *          by using prepareQueryByRelation() method.
   *          At this stage:
   *          Separator type i.e Begin and END replaced by '(' and ')'.
   *          Logical type i.e AND and OR replaced by '&' and '|'.
   *          Criteria type gets converted to query expression based on relationship.
   * Stage 2: Takes the query string prepared by Stage 1 as input and omits '(', ')', '&', '|' and
   *          replaces with proper query expression.
   * @param inputSearchQuery
   */
  public parseSearchQuery(inputSearchQuery: SearchQuery): SearchQuery {
    // layer 1: handle all the validations of SearchQuery
    if (!(inputSearchQuery && !Array.isArray(inputSearchQuery))) {
      throw new Error(
        'Invalid Input: searchQuery :: ' + JSON.stringify(inputSearchQuery)
      );
    }
    const searchQuery = _.cloneDeep(inputSearchQuery);
    if (!searchQuery.type) {
      throw new Error('Invalid Input: searchQuery type :: ' + searchQuery.type);
    }
    if (searchQuery['availability']) {
      throw Error(
        'Invalid availability filter, product ' +
          'level availability filter is not allowed in rulesList'
      );
    }
    const isRulesEmpty =
      Array.isArray(searchQuery.rules) && searchQuery.rules.length === 0;
    if (!searchQuery.rules || isRulesEmpty) {
      searchQuery.rules = {} as any;
      return searchQuery;
    } else {
      searchQuery.rules = this.processSearchQueryRule(searchQuery) as any;
    }

    return searchQuery;
  }

  public processSearchQueryRule(searchQuery: SearchQuery): object {
    const productType = searchQuery.type;
    // passing input searchQuery and product specific schema based on type
    Validator.validateSearchQuery(searchQuery, this.schemaMapper[productType]);
    // layer 2: searchQuery criteria rules conversion based on original schema data type.
    searchQuery = transformSearchQueryBasedOnDataType(
      searchQuery,
      this.schemaMapper[productType]
    );
    // Stage1
    const parserTemplateDataHolder: ParserTemplateDataHolder =
      prepareQueryByRelation(searchQuery);
    let searchQueryTemplate = parserTemplateDataHolder.searchQueryTemplate;
    const criteriaRuleHolder = parserTemplateDataHolder.criteriaRuleHolder;
    while (searchQueryTemplate.includes('(')) {
      // Finding the smallest piece of Begin '(' and End ')'
      let openBraceIndex = searchQueryTemplate.lastIndexOf('(');
      const closeBraceIndex = searchQueryTemplate.indexOf(')');
      while (openBraceIndex > closeBraceIndex) {
        openBraceIndex = searchQueryTemplate.lastIndexOf(
          '(',
          openBraceIndex - 1
        );
      }

      // Omitting parenthesis from smallest piece by splitting in 3 parts
      // here selectedQueryTemplate part is our smallest piece of parenthesis.
      const prefix = searchQueryTemplate.substring(0, openBraceIndex);
      const selectedQueryTemplate = searchQueryTemplate.substring(
        openBraceIndex + 1,
        closeBraceIndex
      );
      const suffix = searchQueryTemplate.substring(closeBraceIndex + 1);
      const includesAndOperator = selectedQueryTemplate.includes('&');
      const includesOrOperator = selectedQueryTemplate.includes('|');
      const operator = includesAndOperator ? '&' : '|';
      // Applying logicalBuilder operation on selectedQueryTemplate part and
      // replacing old selectedQueryTemplate part with new operated
      // selectedQueryTemplate part
      if (includesAndOperator && includesOrOperator) {
        log.error(`Invalid Input:: ERROR: ${selectedQueryTemplate}`);
        throw new Error(
          `Invalid Input: Cannot use different logical operators within one separator pair`
        );
      } else if (includesAndOperator || includesOrOperator) {
        const preparedQuery = handleGroupedQueries(
          operator,
          selectedQueryTemplate,
          criteriaRuleHolder,
          this.schemaMapper[productType]
        );
        const minIndexOfSelectedQueryTmp = Number(
          selectedQueryTemplate.split(operator)[0]
        );
        // updating the criteria holder by resolving the selected query template
        criteriaRuleHolder[minIndexOfSelectedQueryTmp] = preparedQuery;
        searchQueryTemplate = prefix + minIndexOfSelectedQueryTmp + suffix;
      } else {
        searchQueryTemplate = prefix + selectedQueryTemplate + suffix;
      }
    }
    // Stage2
    return this.prepareFinalTemplate(
      searchQueryTemplate,
      criteriaRuleHolder,
      searchQuery
    );
  }

  public prepareFinalTemplate(
    searchQueryTemplate: string,
    criteriaRuleHolder: any[],
    searchQuery: SearchQuery
  ) {
    let finalTmpl = {};
    // handles when searchQuery has no logical in between 2 criterias
    if (searchQueryTemplate === '0' && criteriaRuleHolder.length >= 1) {
      finalTmpl = criteriaRuleHolder[searchQueryTemplate];
    } else if (searchQueryTemplate === '' && criteriaRuleHolder.length === 0) {
      finalTmpl = {};
    } else {
      throw new Error(
        'Invalid Input: searchQuery :: ' + JSON.stringify(searchQuery)
      );
    }
    return finalTmpl;
  }
}
