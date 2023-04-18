import { ESLeafQuery } from '../../common/model/ESLeafQuery';
import { CriteriaQueryNode } from '../../common/model/entity/CriteriaQueryNode';

export function buildESLeafQuery(leafQuery: CriteriaQueryNode): ESLeafQuery {
  switch (leafQuery.operator) {
    case 'EQ':
      return { term: { [`${leafQuery.attribute}`]: leafQuery.value } };
    case 'LIKE':
      return { match: { [`${leafQuery.attribute}`]: leafQuery.value } };
    case 'GT':
      return {
        range: { [`${leafQuery.attribute}`]: { gt: leafQuery.value } }
      };
    case 'LT':
      return {
        range: { [`${leafQuery.attribute}`]: { lt: leafQuery.value } }
      };
    case 'GE':
      return {
        range: { [`${leafQuery.attribute}`]: { gte: leafQuery.value } }
      };
    case 'LE':
      return {
        range: { [`${leafQuery.attribute}`]: { lte: leafQuery.value } }
      };
    case 'IN':
      return {
        terms: { [`${leafQuery.attribute}`]: leafQuery.values }
      };
    case 'PREFIX':
      return {
        prefix: { [`${leafQuery.attribute}`]: leafQuery.value }
      };
    case 'ALL':
      return {
        terms_set: {
          [`${leafQuery.attribute}`]: {
            minimum_should_match_script: {
              source: 'params.num_terms'
            },
            terms: leafQuery.values
          }
        }
      };

    /**
     * Handling the NEGATE operators (NE,NIN) for the criteia ion this Builder is a good idea
     * but this will be a pain when you have nested queries.
     * So NEGATE quries are not handled here. They are handled in the prefix Query.
     *
     * The logic simple,
     * if(name NIN ['john', 'jane'])
     * is wrtten as
     * if(NOT(name IN ['john', 'jane']))
     * This is done while building the prefix query.
     * So removing all the NEGATE operartors from this builder.
     * i.e NE and NI
     */

    // case 'NE':
    //   return {
    //     bool: {
    //       must_not: [{ term: { [`${leafQuery.attribute}`]: leafQuery.value } }]
    //     }
    //   };

    // case 'NI':
    //   return {
    //     bool: {
    //       must_not: [
    //         { terms: { [`${leafQuery.attribute}`]: leafQuery.values } }
    //       ]
    //     }
    //   };
    default:
      throw new Error(`Invalid Criteria Rule: ${leafQuery.operator}`);
  }
}
