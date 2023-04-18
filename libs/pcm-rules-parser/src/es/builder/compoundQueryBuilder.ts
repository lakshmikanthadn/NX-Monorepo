import { ESCompoundQuery } from '../../common/model/ESCompoundQuery';
import { ESLeafQuery } from '../../common/model/ESLeafQuery';

/**
 * This method return the Compound query also called as Bool Query.
 * @param operator Logical Operator to use in the query to build compound query.
 * @param values Oprand on which the logical operator is to be applied.
 * @param filterContext
 * @returns
 */
export function buildESCompoundQuery(
  operator: string,
  values: Array<ESLeafQuery | ESCompoundQuery>,
  needRelevanceScore: boolean
): ESCompoundQuery {
  switch (operator) {
    case 'AND':
      if (needRelevanceScore === true) {
        return { bool: { must: values } };
      } else {
        return { bool: { filter: values } };
      }
    case 'OR':
      return { bool: { should: values } };
    case 'NOT':
      return { bool: { must_not: values } };
    default:
      throw new Error(`Invalid operator ${operator}`);
  }
}
