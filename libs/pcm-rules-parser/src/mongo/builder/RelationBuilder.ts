import * as Logger from 'log4js';

import { CriteriaRule } from '../../common/model/CriteriaRule';

const log = Logger.getLogger('RelationBuilder');

/**
 * Prepare relation query using CriteriaRule
 * takes a CriteriaRule as input and converts to the template string from config file.
 */
export function relationBuilder(rule: CriteriaRule): any {
  if (!rule) {
    log.error(`Invalid relation parameter:: ERROR: `, JSON.stringify(rule));
    throw new Error('Invalid relation parameter');
  }
  const relationalObj = {};
  switch (rule.relationship) {
    case 'EQ':
      relationalObj[rule.attribute] = { $eq: rule.value };
      break;
    case 'NE':
      relationalObj[rule.attribute] = { $ne: rule.value };
      break;
    case 'GT':
      relationalObj[rule.attribute] = { $gt: rule.value };
      break;
    case 'LT':
      relationalObj[rule.attribute] = { $lt: rule.value };
      break;
    case 'GE':
      relationalObj[rule.attribute] = { $gte: rule.value };
      break;
    case 'LE':
      relationalObj[rule.attribute] = { $lte: rule.value };
      break;
    case 'IN':
      relationalObj[rule.attribute] = { $in: rule.values };
      break;
    case 'NI':
      relationalObj[rule.attribute] = { $nin: rule.values };
      break;
    case 'ALL':
      relationalObj[rule.attribute] = { $all: rule.values };
      break;
    default:
      throw new Error('Invalid Criteria Rule');
  }
  return relationalObj;
}
