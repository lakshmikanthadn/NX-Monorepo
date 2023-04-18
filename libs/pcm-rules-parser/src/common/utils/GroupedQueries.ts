import * as _ from 'lodash';
import * as Logger from 'log4js';

import { logicalBuilder } from '../../mongo/builder';

const log = Logger.getLogger('GroupedQueries');

/**
 * This methods take the data between parenthesis one chunk and processes as follows:
 * it first checks whether the scenario goes for elemMatch condition or not
 * if satisfies elemMatch condition then it finds the root attribute and the final query
 * and combines it with elemMatch and returns queryString.
 * else it calls normal logicalBuilder() and returns queryString.
 * e.g prices.price and prices.currency
 */
export function handleGroupedQueries(
  relation: string,
  selectedQueryTemplate: string,
  criteriaRuleHolder: any[],
  productSchema: object
): any {
  if (relation === '&' || relation === '|') {
    const positionArray = selectedQueryTemplate.split(relation);
    if (positionArray.length >= 2 && !positionArray.includes('')) {
      const queryDataArray = positionArray.map(
        (element) => criteriaRuleHolder[element]
      );
      // getting the root
      let root = getCommonRootAttribute(queryDataArray);
      let rootDataType = _.get(productSchema, `${root}._jsDataType`, undefined);
      const { newRoot, newRootDataType } = checkNewRootAndReturnRootAndType(
        root,
        rootDataType,
        productSchema
      );
      rootDataType = newRootDataType;
      root = newRoot;
      const isElligibleForGroupedQuery =
        root !== '' && rootDataType === 'array';
      if (isElligibleForGroupedQuery) {
        // goes for $elemMatch
        const finalArray = queryDataArray.map((query) => {
          const newAttribute = Object.keys(query)[0];
          const newQuery = {};
          newQuery[newAttribute.replace(root + '.', '').toString()] =
            query[newAttribute];
          return newQuery;
        });
        // creating indexes array e.g ['0', '1']
        const elemMatchIndexs = finalArray.map((query, index) =>
          index.toString()
        );

        // putting $and or $or inside elementMatch condition
        const finalQuery = {};
        finalQuery[root] = {
          $elemMatch: logicalBuilder(relation, elemMatchIndexs, finalArray)
        };
        return finalQuery;
      } else {
        // goes with normal logic
        return logicalBuilder(relation, positionArray, criteriaRuleHolder);
      }
    } else {
      log.error(`handleGroupedQueries:: ERROR: `, { selectedQueryTemplate });
      throw new Error(
        'Invalid Query string :: Logical operation needs minimum 2 criteria'
      );
    }
  }
  log.error(`handleGroupedQueries:: ERROR: `, { selectedQueryTemplate });
  throw new Error('Invalid Query string');
}

function checkNewRootAndReturnRootAndType(
  root,
  rootDataType,
  productSchema: object
) {
  // handling scenario when an object is inside an array and condition goes for $elemMatch
  let newRootDataType = rootDataType;
  let newRoot = root;
  while (newRoot !== '') {
    if (newRootDataType === 'array') {
      break;
    }
    newRoot = root.substring(0, root.lastIndexOf('.'));
    newRootDataType = _.get(productSchema, `${newRoot}._jsDataType`, undefined);
  }
  return { newRoot, newRootDataType };
}

/**
 * This method takes queries array and finds root and returns root
 * if at level 1 attributes are same that that attribute becomes root attribute
 * if not it return backs '' (empty string)
 * e.g-1: prices.price and prices.currency then it will return prices.
 * e.g-2: price and currency then it will return ''
 * e.g-3: prices.currency.india and prices.currency.usa then it will return prices.currency
 * e.g-4: prices.price.india and usa then it will return ''
 * @param queries
 */
export function getCommonRootAttribute(queries: any[]): any {
  let rootAttribute = Object.keys(queries[0])[0];
  let areAllAttributeSame = true;
  let isRootTrimmed = false;
  queries.forEach((query) => {
    const currAttribute = Object.keys(query)[0];
    if (rootAttribute !== currAttribute) {
      areAllAttributeSame = false;
      const commonTextInAttribute = findCommonPath([
        rootAttribute,
        currAttribute
      ]);
      if (
        commonTextInAttribute !== rootAttribute &&
        commonTextInAttribute !== currAttribute
      ) {
        isRootTrimmed = true;
      }
      rootAttribute = commonTextInAttribute;
    }
  });
  return areAllAttributeSame || !isRootTrimmed ? '' : rootAttribute;
}

export function findCommonPath(paths: string[]) {
  // todo add example for understanding
  if (paths.length === 0) {
    return '';
  }
  if (paths.length === 1) {
    return paths[0];
  }
  return paths.reduce((commonPath, currPath) => {
    const commonPathArr = commonPath.split('.');
    const currPathArr = currPath.split('.');
    for (let i = 0; i < commonPathArr.length; i++) {
      if (commonPathArr[i] !== currPathArr[i]) {
        return commonPathArr.slice(0, i).join('.');
      }
    }
    return commonPath;
  });
}
