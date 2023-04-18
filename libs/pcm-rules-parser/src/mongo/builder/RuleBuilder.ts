import * as Logger from 'log4js';

import {
  whiteListedCriteriaRelationship,
  whiteListedLogicalValue,
  whiteListedRuleType,
  whiteListedSeparatorValue
} from '../../common/config/Config';
import { CriteriaRule } from '../../common/model/CriteriaRule';
import { LogicalRule } from '../../common/model/LogicalRule';
import { ParserTemplateDataHolder } from '../../common/model/ParserTemplateDataHolder';
import { ProductRule, SearchQuery } from '../../common/model/SearchQueryRule';
import { SeparatorRule } from '../../common/model/SeparatorRule';
import { relationBuilder } from './RelationBuilder';

const log = Logger.getLogger('RuleBuilder');

const SeparatorTypes = {
  BEGIN: '(',
  END: ')'
};
const LogicalTypes = {
  AND: '&',
  OR: '|'
};

/**
 * replaces 'BEGIN' with '(' and 'END' with ')'.
 */
export function getSeparator(rule: SeparatorRule): string {
  if (!(rule && rule.value && whiteListedSeparatorValue.includes(rule.value))) {
    log.error(`Invalid Separator Rule:: ERROR: `, JSON.stringify(rule));
    throw new Error('Invalid Separator Rule');
  }
  return SeparatorTypes[rule.value];
}

/**
 * replaces 'AND' with '&' and 'OR' with '|'.
 */
export function getLogical(rule: LogicalRule): string {
  if (!(rule && rule.value && whiteListedLogicalValue.includes(rule.value))) {
    log.error(`Invalid Logical Rule:: ERROR: `, JSON.stringify(rule));
    throw new Error('Invalid Logical Rule');
  }
  return LogicalTypes[rule.value];
}

/**
 * checks whether Criteria goes for $elemMatch or not
 * if not prepares relation query using relationBuilder() method.
 * this method is for this scenario : classifications[type:netbase].entries.code
 */
export function handleCriteria(rule: CriteriaRule): any {
  if (rule.attribute.includes('[') && rule.attribute.includes(']')) {
    return handleClassifications(rule);
  } else {
    return relationBuilder(rule);
  }
}

/**
 * handles classifications[type:netbase].entries.code by using $elemMatch
 * returns resolved $elemMatch query
 */
export function handleClassifications(rule: CriteriaRule): any {
  const openBraceIndex = rule.attribute.lastIndexOf('[');
  const closeBraceIndex = rule.attribute.indexOf(']');
  const criteriaPrefix = rule.attribute.substring(0, openBraceIndex); // classifications
  const embeddedCriteria = rule.attribute.substring(
    openBraceIndex + 1,
    closeBraceIndex
  ); // type:netbase
  const criteriaSuffix = rule.attribute.substring(closeBraceIndex + 2); // entries.code
  const classificationRule: CriteriaRule = {
    attribute: criteriaSuffix.toString(),
    relationship: rule.relationship,
    value: rule.value,
    values: rule.values
  };
  // returns {entries.code : { $eq: "WB0038"}}
  const elemMatch = relationBuilder(classificationRule);
  const embeddedCriteriaArray = embeddedCriteria.split(':'); // returns [type, netbase]
  elemMatch[embeddedCriteriaArray[0]] = embeddedCriteriaArray[1];
  const finalClassificationQuery = {};
  finalClassificationQuery[criteriaPrefix] = { $elemMatch: elemMatch };
  return finalClassificationQuery;
}

/**
 * converts Criteria into relation query using handleCriteria() method.
 */
export function getCriteria(rule: CriteriaRule): string {
  const isValidAtributeValue =
    rule &&
    ((rule.value !== null && rule.value !== undefined) || rule.values) &&
    (Array.isArray(rule.values) || !Array.isArray(rule.value));
  const isValidRelationShip =
    rule &&
    rule.relationship &&
    whiteListedCriteriaRelationship.includes(rule.relationship);

  if (!(isValidRelationShip && isValidAtributeValue && rule.attribute)) {
    log.error(`Invalid Criteria Rule:: ERROR: `, JSON.stringify(rule));
    throw new Error('Invalid Criteria Rule');
  }
  return handleCriteria(rule);
}

/**
 * Stage 1
 * Prepare query string by following rules:
 * replacing 'BEGIN' with '(' and 'END' with ')' using getSeparator() method.
 * replacing Logical relationship with logical operators using getLogical() method.
 * preparing query string using relationBuilder() from getCriteria() method.
 */
export function prepareQueryByRelation(
  searchQuery: SearchQuery
): ParserTemplateDataHolder {
  const criteriaRuleHolder = [];
  if (!(searchQuery && searchQuery.rules && searchQuery.rules.length !== 0)) {
    log.error(`Invalid Rules:: ERROR: `, JSON.stringify(searchQuery.rules));
    throw new Error(`Invalid Rules: searchQuery.rules`);
  }
  let searchQueryTemplate = '';
  let queryIndex = 0;
  searchQuery.rules.forEach((productRule: ProductRule) => {
    if (
      !(
        productRule &&
        productRule.type &&
        productRule.rule &&
        whiteListedRuleType.includes(productRule.type)
      )
    ) {
      log.error(`Invalid Rules type:: ERROR: `, JSON.stringify(productRule));
      throw new Error('Invalid Rules: productRule');
    }
    if (productRule.type === 'separator') {
      searchQueryTemplate += getSeparator(productRule.rule as SeparatorRule);
    } else if (productRule.type === 'logical') {
      searchQueryTemplate += getLogical(productRule.rule as LogicalRule);
    } else if (productRule.type === 'criteria') {
      criteriaRuleHolder.push(getCriteria(productRule.rule as CriteriaRule));
      searchQueryTemplate += `${queryIndex}`;
      queryIndex++;
    }
  });
  return { criteriaRuleHolder, searchQueryTemplate };
}
