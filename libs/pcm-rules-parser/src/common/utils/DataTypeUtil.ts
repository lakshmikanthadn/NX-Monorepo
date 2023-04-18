import * as _ from 'lodash';
import * as Logger from 'log4js';
import * as moment from 'moment';

import { fullTextSearchOperators } from '../config/Config';
import { CriteriaRule } from '../model/CriteriaRule';
import { ProductRule, SearchQuery } from '../model/SearchQueryRule';

const log = Logger.getLogger('DataTypeUtil');

/**
 * This method takes a SearchQuery as input and goes for each Criteria and converts
 * criteria value or values data based on criteria attribute's data-type as mentioned
 * in the original Schema.
 * If the value or values is not proper it throws error for the same.
 * It supports :
 * -string to number and vice versa
 * -string to boolean and vice versa
 * -string to Date
 * e.g: prices.price original schema type is number but it comes in input as string
 * so, if prices.price = "100.75" then, result will be prices.price = 100.75
 * @param searchQuery
 */
export function transformSearchQueryBasedOnDataType(
  searchQuery: SearchQuery,
  productSchema: object,
  forEsQuery = false
): SearchQuery {
  const productRules = searchQuery.rules;
  productRules.forEach((productRule: ProductRule) => {
    if (productRule.type === 'criteria') {
      const criteriaRule: CriteriaRule = productRule.rule as CriteriaRule;

      try {
        let originalAttribute = criteriaRule.attribute;
        const value = criteriaRule.value;
        const values = criteriaRule.values;
        const relationship = criteriaRule.relationship;

        // when attribute is classifications[type: netbase].entries.code
        if (
          originalAttribute.includes('[') &&
          originalAttribute.includes(']')
        ) {
          originalAttribute = originalAttribute.replace(/\[.*\]/g, '');
        }

        const atributeDataType = _.get(
          productSchema,
          `${originalAttribute}._jsDataType`,
          undefined
        );
        const atributeDateFormat = _.get(
          productSchema,
          `${originalAttribute}.format`,
          undefined
        );
        /**
         * All the string fields are assumed to indexed as text by default.
         * And indexed as keyword in a secondary type by adding a .keyword to the field name.
         * So here if the trasnformation is for elastic search
         * then we change the name of the field
         */
        if (
          forEsQuery &&
          atributeDataType === 'string' &&
          !atributeDateFormat &&
          !fullTextSearchOperators.includes(relationship)
        ) {
          criteriaRule.attribute = getESQueryAttribute(originalAttribute);
        }

        if (!atributeDataType) {
          throw new Error('Invalid attribute name: ' + originalAttribute);
        }

        if (values && Array.isArray(values)) {
          criteriaRule.values = convertAttributesDataType(
            values,
            atributeDataType,
            atributeDateFormat
          );
        } else if (
          value !== null &&
          value !== undefined &&
          !Array.isArray(value)
        ) {
          criteriaRule.value = convertAttributeDataType(
            value,
            atributeDataType,
            atributeDateFormat
          );
        } else {
          log.error(
            `transformSearchQueryBasedOnDataType :: Invalid Input ERROR: ${JSON.stringify(
              criteriaRule
            )}`
          );
          throw new Error('Invalid Input: criteriaRule');
        }
        productRule.rule = criteriaRule;
      } catch (error) {
        log.error(
          `transformSearchQueryBasedOnDataType :: Invalid Input ERROR: ${error}`
        );
        throw error;
      }
    }
  });
  searchQuery.rules = productRules;
  return searchQuery;
}

// used for value
export function convertAttributeDataType(
  data: any,
  toDataType: string,
  dateFormat: string
): any {
  if (typeof data === toDataType && !dateFormat) {
    return data;
  }
  return convertAttributeDataToRespectiveType(data, toDataType, dateFormat);
}

function getESQueryAttribute(originalAttribute: string) {
  return originalAttribute === '_id'
    ? originalAttribute
    : originalAttribute + '.keyword';
}

function convertAttributeDataToRespectiveType(
  data: any,
  toDataType: string,
  dateFormat: string
) {
  switch (toDataType) {
    case 'number':
      if (isNaN(data) || data === true || data === false) {
        throw new Error('invalid value, a number value is expected');
      }
      return Number(data);
    case 'boolean':
      if (data === true || data.toString().toLowerCase() === 'true') {
        return true;
      } else if (data === false || data.toString().toLowerCase() === 'false') {
        return false;
      } else {
        throw new Error('invalid value, a boolean value is expected');
      }
    case 'string':
      if (dateFormat === 'date-time') {
        if (!moment(data, 'YYYY-MM-DDTHH:mm:ss.sssZ', true).isValid()) {
          throw new Error('invalid value, a date value is expected');
        }
        return new Date(data);
      }
      return data.toString();
    default:
      throw new Error('invalid data type');
  }
}

// used for values
export function convertAttributesDataType(
  datas: any[],
  toDataType: string,
  dateFormat: string
): any[] {
  const convertedData = [];
  datas.forEach((data) => {
    convertedData.push(convertAttributeDataType(data, toDataType, dateFormat));
  });
  return convertedData;
}
