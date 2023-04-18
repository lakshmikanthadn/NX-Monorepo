import * as _ from 'lodash';
import { CriteriaRule, LogicalRule, SeparatorRule } from '../..';

import { SearchQuery } from '../model/SearchQueryRule';
import { CriteriaQueryNode } from '../model/entity/CriteriaQueryNode';
import { LogicalQueryNode } from '../model/entity/LogicalQueryNode';
import { PrefixQuery } from '../model/PrefixQuery';

/**
 * This Builder is to convert the SearchQuery which is in the form of infix-Notation
 * into PrefixQuery which will be in the form of prefix-Notation (with few modifications).
 * This idea of infix-notation and prefix-notation is adopted from the expression-tree-parser.
 */
export class PrefixQueryBuilder {
  build(searchQuery: SearchQuery): PrefixQuery {
    const compoundQuery: LogicalQueryNode[] = [];
    const currentNodePointerStack = [];
    searchQuery.rules.forEach((ruleObj, index) => {
      const currNodePointerStr = currentNodePointerStack.join('');
      switch (ruleObj.type) {
        case 'separator': {
          const separatorRule = ruleObj.rule as SeparatorRule;
          if (separatorRule.value === 'BEGIN') {
            /**
             * If the separatorRule is a BEGIN separator, then we need to create a new LogicalQueryNode
             *
             * - if it is the beginning of the searchQuery
             * then push it to the root of compoundQuery
             * nd move the cursor to point to this new node.
             * (index-inside-the-compoundQuery-array) of-course it will always be 0.
             *
             * - else push it to the children of current node,
             * and move the cursor downwards to point to this new node.
             * i.e (current + children + index-inside-the-children-array )
             *
             */
            const newNode = new LogicalQueryNode(null, []);
            if (compoundQuery.length === 0) {
              // Push method returns the length of the updated array, so length-1 returns the new position of the new node.
              const newNodePointer = compoundQuery.push(newNode) - 1;
              currentNodePointerStack.push(`[${newNodePointer}]`);
            } else {
              const newNodeToBePushedAt = currNodePointerStr + '.children';
              // Push method returns the length of the array, so length-1 returns the new position of the new node.
              const newNodePosition =
                _.get(compoundQuery, newNodeToBePushedAt).push(newNode) - 1;
              currentNodePointerStack.push(`.children[${newNodePosition}]`);
            }
          } else if (separatorRule.value === 'END') {
            /**
             * If the separatorRule is END Separator, then we need to remove an entry in the currentNodePointerStack.
             * so that it points to the parent of the current node. (Moving Backwards).
             */
            const currentOperator = _.get(
              compoundQuery,
              currNodePointerStr + '.operator'
            );
            if (currentOperator === null) {
              _.set(compoundQuery, currNodePointerStr + '.operator', 'AND');
            }
            currentNodePointerStack.pop();
          } else {
            throw new Error('Invalid Separator at ' + index);
          }
          break;
        }
        case 'logical': {
          /**
           * If the rule is a logical, then we need to update the Logical operator of the current node
           */
          const logicalRule = ruleObj.rule as LogicalRule;
          const currentOperator = _.get(
            compoundQuery,
            currNodePointerStr + '.operator'
          );
          if (currentOperator === null) {
            _.set(
              compoundQuery,
              currNodePointerStr + '.operator',
              logicalRule.value
            );
          } else if (currentOperator !== logicalRule.value) {
            throw new Error(
              'Multiple logical operators between a single query clause at ' +
                index
            );
          }

          break;
        }
        case 'criteria':
          {
            /**
             * If rule is a criteria, then we need to create a new CriteriaQueryNode
             * and push that to the current node children.
             */
            const criteriaRule = ruleObj.rule as CriteriaRule;
            const criteriaQueryNode = new CriteriaQueryNode(
              criteriaRule.relationship,
              criteriaRule.attribute,
              criteriaRule.value,
              criteriaRule.values
            );
            /**
             * DELETE THIS. Logic is moved back to parser.
             * IF the criteria has NEGATE operator.
             * the we remove the LOGICAL "NOT" out of its COMPARISION Operator.
             * For example, if the rule is "NOTIN" then we NEGATE the IN operator.
             * i.e if(name NIN ['john', 'jane'])
             * will be converted to
             * if(NOT(name IN ['john', 'jane']))
             * Because ELASTIC search does not have an NOT EQAL or NOTIN operator.
             * The logical NOT can be achived using the "MUST_NOT" boolean query.
             */
            // if (negateRelationshipOperators.includes(criteriaRule.relationship)) {
            //   const negateLogicalNode = new LogicalQueryNode('NOT', []);
            //   criteriaQueryNode.operator = negateRelationshipOperatorsMap[criteriaRule.relationship];
            //   negateLogicalNode.children.push(criteriaQueryNode);
            //   _.get(compoundQuery, currNodePointerStr + '.children').push(
            //     negateLogicalNode
            //   );
            // } else {
            _.get(compoundQuery, currNodePointerStr + '.children').push(
              criteriaQueryNode
            );
            // }
          }
          break;
        default:
          throw new Error('Invalid Rule Type at ' + index);
      }
    });
    return compoundQuery[0];
  }
}

export default new PrefixQueryBuilder();
