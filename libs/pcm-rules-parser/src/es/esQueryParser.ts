import * as _ from 'lodash';

import {
  GroupedSearchQuery,
  SearchQuery
} from '../common/model/SearchQueryRule';
import { buildESLeafQuery as LeafQuery } from './builder/leafQueryBuilder';
import { buildESCompoundQuery as CompoundQuery } from './builder/compoundQueryBuilder';
import prefixQueryBuilder from '../common/builder/prefixQueryBuilder';
import { CriteriaQueryNode } from '../common/model/entity/CriteriaQueryNode';
import { LogicalQueryNode } from '../common/model/entity/LogicalQueryNode';
import { CriteriaRule, Validator } from '..';
import { transformSearchQueryBasedOnDataType } from '../common/utils/DataTypeUtil';
import { findCommonPath } from '../common/utils/GroupedQueries';
import { prepareOriginalQuery } from '../common/utils/BaseQuery';
import { buildESNestedQuery as NestedQuery } from './builder/nestedQueryBuilder';
import { PrefixQuery } from '../common/model/PrefixQuery';
import { ESCompoundQuery } from '../common/model/ESCompoundQuery';
import { ESLeafQuery } from '../common/model/ESLeafQuery';
import {
  negateRelationshipOperatorsMap,
  fullTextSearchOperators
} from '../common/config/Config';

const negateRelationshipOperators = Object.keys(negateRelationshipOperatorsMap);

export class ESQueryParser {
  /**
   * This is an Object that holds mapping data of all the indexes.
   * Each entity name is a "key" at the root level.
   * And each key will have the mapping information and its data type.
   */
  private esIndexMappingData;
  constructor(esIndexMappingData: object) {
    this.esIndexMappingData = esIndexMappingData;
  }

  public parse(inputSearchQuery: GroupedSearchQuery[]) {
    const inputSearchQueries = prepareOriginalQuery(inputSearchQuery);
    return inputSearchQueries.map((searchQuery: SearchQuery) => {
      return this.parseSearchQuery(searchQuery);
    });
  }

  /**
   * This method takes the incoming search query.
   * then Validates the query,
   * then transforms the query value based on the data type.
   * then Build an a Prefix Query
   * then converts the prefixQuery in to Elastic Search Query.
   *
   * @param searchQuery
   * @returns ElasticSearchQuery
   */
  public parseSearchQuery(searchQuery: SearchQuery): any {
    const productType = searchQuery.type;
    Validator.validateSearchQuery(
      searchQuery,
      this.esIndexMappingData[productType]
    );
    searchQuery = transformSearchQueryBasedOnDataType(
      searchQuery,
      this.esIndexMappingData[productType],
      true // forEsQuery
    );
    const needRelevanceScore = searchQuery.rules.some((r) => {
      if (r.type === 'criteria') {
        const rule = r.rule as CriteriaRule;
        return fullTextSearchOperators.includes(rule.relationship);
      } else {
        return false;
      }
    });
    const prefixQuery = prefixQueryBuilder.build(searchQuery);
    return this.getESQuery(prefixQuery, productType, { needRelevanceScore });
  }

  /**
   * This is a Recurrsive method to get ES query for the given Prefix Query.
   * @param prefixQuery
   * @param productType
   * @returns
   */
  public getESQuery(
    prefixQuery: PrefixQuery,
    productType: string,
    options: { needRelevanceScore: boolean }
  ): ESCompoundQuery | ESLeafQuery {
    if (prefixQuery.type === 'criteria') {
      return this.prepareNestedLeafQuery(
        prefixQuery as CriteriaQueryNode,
        productType,
        options
      );
    } else if (prefixQuery.type === 'logical') {
      const logicalQueryNode = prefixQuery as LogicalQueryNode;
      const children = logicalQueryNode.children;
      const allChildrenAreCriteria = children.every(
        (child) => child.type === 'criteria'
      );
      /**
       * If
       * all childrens are criteria and has more than one criteria.
       * then we will create a COMBINED NESTED COMPOUND query.
       * else
       * we recurrsively build the ES Query for all childrens
       * and then combine them to build the COMPOUND query.
       *
       */
      if (allChildrenAreCriteria && children.length > 1) {
        return this.prepareCombinedNestedCompoundQuery(
          logicalQueryNode,
          productType,
          options
        );
      } else {
        const esQueries = children.map((cq) =>
          this.getESQuery(cq as PrefixQuery, productType, options)
        );
        return CompoundQuery(
          prefixQuery.operator,
          esQueries,
          options.needRelevanceScore
        );
      }
    } else {
      throw new Error(`Invalid Query type: ${prefixQuery.type}`);
    }
  }

  /**
   * This Method handle the Nested Leaf Query along with the NEGATE-operator.
   * Step 1: Check if the operator is NEGATE operator.
   * Step 2: If the operator is NEGATE-operator,
   *  Replace the negate-operator with its corresposing comparison operator in th CriteriaQuery.
   * Step 3: Build the ES-LEAF-QUERY with updated CriteriaQuery.
   * Step 4: Find the Nested Path If we need to build a nested Query.
   * Step 5: If Nested Path exists Build the Nested Query.
   * Step 6: If We had removed NEGATE logic in step 2. Now its time to add it back
   *  (if the operator is NEGATE-operator.)
   *  We add this NOT logic by wrapping the generated query within "NOT" compound query.
   * @param criteriaQuery
   * @param productType
   * @returns
   */

  private prepareNestedLeafQuery(
    criteriaQuery: CriteriaQueryNode,
    productType: string,
    options: { needRelevanceScore: boolean }
  ): ESLeafQuery | ESCompoundQuery {
    const isNegateOperator = negateRelationshipOperators.includes(
      criteriaQuery.operator
    );
    if (isNegateOperator) {
      // Replace the negate operator filter
      criteriaQuery.operator =
        negateRelationshipOperatorsMap[criteriaQuery.operator];
    }
    const nestedPath = this._extractNestedPath(
      criteriaQuery.attribute,
      productType
    );
    let query: ESLeafQuery | ESCompoundQuery = LeafQuery(criteriaQuery);
    if (nestedPath) {
      query = NestedQuery(nestedPath, query);
    }
    if (isNegateOperator) {
      query = CompoundQuery('NOT', [query], options.needRelevanceScore);
    }
    return query;
  }

  private prepareCombinedNestedCompoundQuery(
    logicalQuery: LogicalQueryNode,
    productType: string,
    options: { needRelevanceScore: boolean }
  ): ESCompoundQuery {
    const criteriaQueries = logicalQuery.children as CriteriaQueryNode[];
    const commonPath = findCommonPath(
      criteriaQueries.map((cq) => cq.attribute || '')
    );
    const isThereAnyNegateOperator = criteriaQueries.some((cq) =>
      negateRelationshipOperators.includes(cq.operator)
    );
    const commonNestedPath = this._extractNestedPath(commonPath, productType);
    if (isThereAnyNegateOperator && commonNestedPath) {
      const negateCriteriaQueries = [];
      const remainingCriteriaQueries = [];
      criteriaQueries.forEach((cq) => {
        if (negateRelationshipOperators.includes(cq.operator)) {
          negateCriteriaQueries.push(cq);
        } else {
          remainingCriteriaQueries.push(cq);
        }
      });
      const nestedCompoundQueries = NestedQuery(
        commonNestedPath,
        CompoundQuery(
          logicalQuery.operator,
          remainingCriteriaQueries.map(LeafQuery),
          options.needRelevanceScore
        )
      );
      const nestedCompoundQueriesToNegate = negateCriteriaQueries.map((ncq) => {
        const remainingCriteriaQueriestoMarry = remainingCriteriaQueries.filter(
          (rcq) => rcq.attribute !== ncq.attribute
        );
        ncq.operator = negateRelationshipOperatorsMap[ncq.operator];
        const marriedCriteriaQueries = [].concat(
          remainingCriteriaQueriestoMarry,
          ncq
        );
        return NestedQuery(
          commonNestedPath,
          CompoundQuery(
            logicalQuery.operator,
            marriedCriteriaQueries.map(LeafQuery),
            options.needRelevanceScore
          )
        );
      });
      const negatedNestedCompoundQueries = CompoundQuery(
        'NOT',
        nestedCompoundQueriesToNegate,
        options.needRelevanceScore
      );
      return CompoundQuery(
        logicalQuery.operator,
        [nestedCompoundQueries, negatedNestedCompoundQueries],
        options.needRelevanceScore
      );
    } else if (!isThereAnyNegateOperator && commonNestedPath) {
      const leafQueries = criteriaQueries.map(LeafQuery);
      const esCompoundQuery = CompoundQuery(
        logicalQuery.operator,
        leafQueries,
        options.needRelevanceScore
      );
      return NestedQuery(commonNestedPath, esCompoundQuery);
    } else {
      const nestedLeafQueries = criteriaQueries.map((cq) => {
        return this.prepareNestedLeafQuery(cq, productType, options);
      });
      return CompoundQuery(
        logicalQuery.operator,
        nestedLeafQueries,
        options.needRelevanceScore
      );
    }
  }

  /**
   * The method will return the path for the nested query.
   * This path will be the common path of all the criteria query clauses.
   *
   * @param children
   * @param productType
   * @returns
   */
  public _extractNestedPath(path: string, productType): string {
    let pathDataType = _.get(
      this.esIndexMappingData[productType],
      `${path}._jsDataType`,
      undefined
    );
    // todo add example for understanding
    while (pathDataType !== 'array' && path !== '') {
      const pathArr = path.split('.');
      pathArr.pop();
      path = pathArr.join('.');
      pathDataType = _.get(
        this.esIndexMappingData[productType],
        `${path}._jsDataType`,
        undefined
      );
    }
    return path;
  }
}
