import * as _ from 'lodash';

import {
  whiteListedCriteriaRelationship,
  whiteListedLogicalValue,
  whiteListedPreProductsV4,
  whiteListedProduct,
  whiteListedProductsV4,
  whiteListedSeparatorValue,
  allOperators
} from '../config/Config';
import { CriteriaRule } from '../model/CriteriaRule';
import { LogicalRule } from '../model/LogicalRule';
import { ProductRule, SearchQuery } from '../model/SearchQueryRule';
import { SeparatorRule, SeparatorType } from '../model/SeparatorRule';
import {
  convertAttributeDataType,
  convertAttributesDataType
} from './DataTypeUtil';

export class Validator {
  /**
   * This method validates input SearchQueries i.e array of SearchQuery
   * @param searchQueries: SearchQuery[]
   */
  public static validateSearchQueries(
    searchQueries: SearchQuery[],
    schemaMapper: object
  ): boolean {
    this.isSearchQueriesValid(searchQueries);
    return searchQueries.every((searchQuery: SearchQuery) => {
      return this.validateSearchQuery(
        searchQuery,
        schemaMapper[searchQuery.type]
      );
    });
  }

  /**
   * This method checks whether input SearchQueries i.e array of SearchQuery is valid
   * here valid represents: null, undefined, empty([]) scenarios
   * @param searchQueries: SearchQuery[]
   */
  public static isSearchQueriesValid(searchQueries: SearchQuery[]): boolean {
    if (!searchQueries) {
      throw new Error(
        'Invalid Input: searchQueries :: ' + JSON.stringify(searchQueries)
      );
    }
    if (
      !(
        searchQueries &&
        Array.isArray(searchQueries) &&
        searchQueries.length !== 0
      )
    ) {
      throw new Error(
        'Invalid Input: searchQueries :: ' + JSON.stringify(searchQueries)
      );
    }
    return true;
  }

  /**
   * This method validates SearchQuery at so many levels based on input provided
   * as this is our first layer when all the checks are passed and validated properly
   * then only we are going to use it for parser.
   * @param searchQuery
   */
  public static validateSearchQuery(
    searchQuery: SearchQuery,
    productSchema: object
  ): boolean {
    if (!(searchQuery && !Array.isArray(searchQuery))) {
      throw new Error(
        'Invalid Input: searchQuery :: ' + JSON.stringify(searchQuery)
      );
    }
    if (
      !(
        searchQuery.type &&
        (whiteListedProductsV4.includes(searchQuery.type) ||
          whiteListedProduct.includes(searchQuery.type) ||
          whiteListedPreProductsV4.includes(searchQuery.type))
      )
    ) {
      throw new Error('Invalid Input: searchQuery type :: ' + searchQuery.type);
    }
    if (
      !(
        searchQuery.rules &&
        Array.isArray(searchQuery.rules) &&
        searchQuery.rules.length !== 0
      )
    ) {
      throw new Error(
        `Invalid Input: searchQuery rules :: ` +
          JSON.stringify(searchQuery.rules)
      );
    }
    if (!productSchema) {
      throw new Error(
        `schemaMapper not found :: ` + JSON.stringify(productSchema)
      );
    }

    this._validateSearchQueryRules(searchQuery, productSchema);

    if (!this.validateRuleOrder(searchQuery)) {
      throw new Error('Invalid Input: rules are not in proper order');
    }
    return true;
  }

  /**
   * This method checks if correct order of the rules
   * is present in our searchQuery or not.
   * Returns true if searchQuery is valid.
   * Returns false if searchQuery is invalid.
   * @param searchQuery
   */
  public static validateRuleOrder(searchQuery: SearchQuery) {
    const queryStack = [];
    searchQuery.rules.forEach((rule) => {
      switch (rule.type) {
        case 'separator':
          this.handleSeparatorRuleOrderValidation(rule, queryStack);
          break;
        case 'logical':
          this.handleLogicalRuleOrderValidation(rule, queryStack);
          break;
        case 'criteria':
          this.handleCriteriaRuleOrderValidation(rule, queryStack);
          break;
        default:
          throw new Error('Invalid Input: rule type is invalid');
      }
    });
    if (queryStack.length > 0) {
      return false;
    }
    return true;
  }

  // get the topmost element from stack
  private static peek(array: string[]): string {
    return array[array.length - 1];
  }

  // handle rules order validation on coming across a separator rule
  private static handleSeparatorRuleOrderValidation(
    rule: ProductRule,
    queryStack: string[]
  ) {
    if (rule.rule.value === 'BEGIN') {
      this.handleBeginSeparatorRuleOrderValidation(rule.rule.value, queryStack);
    } else {
      this.handleEndSeparatorRuleOrderValidation(queryStack);
    }
  }

  // handle rules order validation on coming across a BEGIN separator rule
  private static handleBeginSeparatorRuleOrderValidation(
    separatorType: SeparatorType,
    queryStack: string[]
  ) {
    if (
      this.peek(queryStack) === null ||
      !this.peek(queryStack) ||
      this.peek(queryStack) === 'BEGIN' ||
      this.peek(queryStack) === 'logical'
    ) {
      queryStack.push(separatorType);
    } else {
      throw new Error('Invalid Input: rules are not in proper order');
    }
  }

  // handle rules order validation on coming across an END separator rule
  private static handleEndSeparatorRuleOrderValidation(queryStack: string[]) {
    if (
      this.peek(queryStack) === 'BEGIN' ||
      this.peek(queryStack) === 'criteria'
    ) {
      let poppedValue = queryStack.pop();
      while (poppedValue !== 'BEGIN') {
        poppedValue = queryStack.pop();
      }
      if (this.peek(queryStack)) {
        queryStack.push('criteria');
      }
    } else {
      throw new Error('Invalid Input: rules are not in proper order');
    }
  }

  // handle rules order validation on coming across a logical rule
  private static handleLogicalRuleOrderValidation(
    rule: ProductRule,
    queryStack: string[]
  ) {
    if (
      this.peek(queryStack) === 'criteria' ||
      this.peek(queryStack) === 'BEGIN'
    ) {
      queryStack.push(rule.type);
    } else {
      throw new Error('Invalid Input: rules are not in proper order');
    }
  }

  // handle rules order validation on coming across a criteria rule
  private static handleCriteriaRuleOrderValidation(
    rule: ProductRule,
    queryStack: string[]
  ) {
    if (
      this.peek(queryStack) === 'BEGIN' ||
      this.peek(queryStack) === 'logical'
    ) {
      queryStack.push(rule.type);
    } else {
      throw new Error('Invalid Input: rules are not in proper order');
    }
  }

  // validates SearchQuery rules based on type
  private static _validateSearchQueryRules(
    searchQuery: SearchQuery,
    productSchema: object
  ): boolean {
    return searchQuery.rules.every((rules: ProductRule) => {
      if (rules.type === 'separator') {
        this._validateSeparator(rules.rule as SeparatorRule);
      } else if (rules.type === 'logical') {
        this._validateLogical(rules.rule as LogicalRule);
      } else if (rules.type === 'criteria') {
        this._validateCriteria(
          rules.rule as CriteriaRule,
          searchQuery.type,
          productSchema
        );
      } else {
        throw new Error('Invalid Input: invalid rules type :: ' + rules.type);
      }
      return true;
    });
  }

  // validates separator rule
  private static _validateSeparator(rule: SeparatorRule): boolean {
    if (
      !(rule && rule.value && whiteListedSeparatorValue.includes(rule.value))
    ) {
      throw new Error(
        'Invalid Input: invalid Separator Rule :: ' + JSON.stringify(rule)
      );
    }
    return true;
  }

  // validates logical rule
  private static _validateLogical(rule: LogicalRule): boolean {
    if (!(rule && rule.value && whiteListedLogicalValue.includes(rule.value))) {
      throw new Error(
        'Invalid Input: invalid Logical Rule :: ' + JSON.stringify(rule)
      );
    }
    return true;
  }

  // validates criteria rule
  private static _validateCriteria(
    rule: CriteriaRule,
    productType: string,
    productSchema: object
  ): boolean {
    // checks whether rule itself exists or not
    if (!(rule && !Array.isArray(rule))) {
      throw new Error(
        'Invalid Input: invalid Criteria Rule :: ' + JSON.stringify(rule)
      );
    }
    Validator.validateCriteriaRuleValueRelationship(rule);

    // checks whether rule attribute exists in given productType or not
    let attribute = rule.attribute;
    if (!attribute) {
      throw new Error(
        'Invalid Input: invalid attribute name in Criteria Rule :: ' +
          JSON.stringify(rule)
      );
    }
    // when attribute is classifications[type: netbase].entries.code
    if (attribute.includes('[') && attribute.includes(']')) {
      attribute = attribute.replace(/\[.*\]/g, '');
    }
    const atributeDataType = _.get(
      productSchema,
      `${attribute}._jsDataType`,
      undefined
    );
    const atributeDateFormat = _.get(
      productSchema,
      `${attribute}.format`,
      undefined
    );
    if (!atributeDataType) {
      throw new Error(
        'Invalid Input: invalid attribute name in Criteria Rule :: ' +
          JSON.stringify(rule)
      );
    }

    try {
      Object.prototype.hasOwnProperty.call(rule, 'values') && rule.values
        ? convertAttributesDataType(
            rule.values,
            atributeDataType,
            atributeDateFormat
          )
        : convertAttributeDataType(
            rule.value,
            atributeDataType,
            atributeDateFormat
          );
    } catch (error) {
      throw new Error(
        `Invalid Input: ${error.message} :: ` + JSON.stringify(rule)
      );
    }
    return true;
  }

  private static validateCriteriaRuleValueRelationship(rule: CriteriaRule) {
    // checks whether rule relationship is proper or not
    if (
      !(
        rule.relationship &&
        whiteListedCriteriaRelationship.includes(rule.relationship)
      )
    ) {
      throw new Error(
        'Invalid Input: invalid relationship in Criteria Rule :: ' +
          JSON.stringify(rule)
      );
    }

    // checks rule value/values as value should be string and values should be array
    const validValue =
      rule.value !== null &&
      rule.value !== undefined &&
      !Array.isArray(rule.value);
    const validValues =
      rule.values && Array.isArray(rule.values) && rule.values.length !== 0;
    if (!(validValue || validValues)) {
      throw new Error(
        'Invalid Input: invalid value or values in Criteria Rule :: ' +
          JSON.stringify(rule)
      );
    }

    // IN and NIN should come with values only
    const isValidArrayRelation =
      allOperators
        .filter((op) => op.needsArrayOperand)
        .map((op) => op.value)
        .includes(rule.relationship) && validValues;
    const isValidRelation =
      allOperators
        .filter((op) => !op.needsArrayOperand)
        .map((op) => op.value)
        .includes(rule.relationship) && validValue;
    if (!(isValidArrayRelation || isValidRelation)) {
      throw new Error(
        'Invalid Input: invalid value or values in Criteria Rule :: ' +
          JSON.stringify(rule)
      );
    }
  }
}
