import { StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import { GroupedSearchQuery } from '@tandfgroup/pcm-rules-parser';
import * as _ from 'lodash';
import { isUUID } from 'validator';
import Logger from '../../../utils/LoggerUtil';

import { IAvailability } from 'v4/model/interfaces/SearchResult';
import { Config } from '../../../config/config';
import { AppConstants } from '../../../config/constant';

const log = Logger.getLogger('CommonValidator');

class CommonValidator {
  private maxBatchSize: number;
  private searchAPIMaxBatchSizeV4: number;
  private partsAPIMaxBatchSizeV4: number;
  constructor() {
    this.maxBatchSize = Config.getPropertyValue('maxBatchSizeV4');
    this.searchAPIMaxBatchSizeV4 = Config.getPropertyValue(
      'searchAPIMaxBatchSizeV4'
    );
    this.partsAPIMaxBatchSizeV4 = Config.getPropertyValue(
      'partsAPIMaxBatchSizeV4'
    );
  }

  /**
   * This Method returns List of Error messages if any,
   * else returns empty Array.
   * @param productType
   */
  public validateProductType(productType: StorageModel.ProductType): string[] {
    log.debug('validateProductType:: ', { productType });
    const validationErrors = [];
    // productType validation
    if (
      !(
        AppConstants.ProductTypesV4.includes(productType) ||
        AppConstants.PreProductTypesV4.includes(productType)
      )
    ) {
      validationErrors.push(`Invalid product type : ${productType}`);
    }
    return validationErrors;
  }

  /**
   * This Method returns List of Error messages if any,
   * else returns empty Array.
   * @param offsetCursor
   */
  public validateOffsetCursor(offsetCursor: string): string[] {
    log.debug('validateOffsetCursor:: ', { offsetCursor });

    const validationErrors = [];
    if (offsetCursor === 'last-page-cursor') {
      return validationErrors;
    }
    if (typeof offsetCursor !== 'string') {
      validationErrors.push(`Invalid offsetCursor : ${offsetCursor}`);
    } else {
      let isOffsetCursorValidForSplitting = false;
      if (offsetCursor.split(':').length === 3)
        isOffsetCursorValidForSplitting = true;
      if (isOffsetCursorValidForSplitting) {
        const uuids = this.getUUIDFromOffsetCursor(offsetCursor);
        uuids.forEach((uuid) => {
          if (!isUUID(uuid)) {
            validationErrors.push(`Invalid offsetCursor : ${offsetCursor}`);
          }
        });
      } else {
        validationErrors.push(`Invalid offsetCursor : ${offsetCursor}`);
      }
    }
    return validationErrors;
  }

  private getUUIDFromOffsetCursor(offsetCursor: string): string[] {
    const uuids: string[] = offsetCursor.split(':').map((uuid) => {
      if (uuid.includes('_')) return uuid.split('_')[1];
      else return uuid;
    });
    return uuids;
  }

  /**
   * This Method returns List of Error messages if any,
   * else returns empty Array.
   * @param offset
   * @param limit
   * @param isSearchLimit
   */
  public validateOffsetLimit(
    offset: string,
    limit: string,
    isSearchLimit = false,
    isPartsLimit = false
  ): string[] {
    log.debug('validateOffsetLimit:: ', { limit, offset });

    const parsedLimit = parseInt(limit, 10);
    const parsedOffset = parseInt(offset, 10);
    const validationErrors = [];
    let maxBatchSize;

    if (isSearchLimit) {
      maxBatchSize = this.searchAPIMaxBatchSizeV4;
    } else {
      maxBatchSize = isPartsLimit
        ? this.partsAPIMaxBatchSizeV4
        : this.maxBatchSize;
    }

    // limit validation
    if (limit && isNaN(parsedLimit)) {
      validationErrors.push('Invalid query parameter: limit');
    } else if (
      !isNaN(parsedLimit) &&
      (parsedLimit > maxBatchSize || parsedLimit <= 0)
    ) {
      validationErrors.push(`limit should be between 1 - ${maxBatchSize}`);
    }

    // offset validation
    if ((offset && isNaN(parsedOffset)) || parsedOffset < 0) {
      validationErrors.push('Invalid query parameter: offset');
    }

    return validationErrors;
  }

  /**
   * This Method returns List of Error messages if any,
   * else returns empty Array.
   * @param searchQuery
   * @param requestedProductsType
   */
  public validateSearchQuery(
    searchQuery: GroupedSearchQuery[],
    requestedProductsType: string = null,
    availability?: IAvailability
  ): string[] {
    const validationErrors = [];
    log.debug('validateSearchQuery:: ', { requestedProductsType, searchQuery });
    // Validate if the searchQuery is array
    if (
      !searchQuery ||
      !Array.isArray(searchQuery) ||
      searchQuery.length === 0
    ) {
      validationErrors.push('Invalid or missing search rules.');
      return validationErrors;
    }

    const isGroupedSearchQuery = searchQuery.some((sq) => {
      return (
        sq.rules &&
        sq.rules.some((rule) => {
          return rule.type === 'group';
        })
      );
    });
    if (availability && isGroupedSearchQuery) {
      validationErrors.push(
        'Invalid availability filter, Grouped-SearchQuery ' +
          'will not support root level availability filter'
      );
    }

    // Validate rules against the requested productType
    // If requestedProductsType is not provided(null) ignore this validation.
    if (
      requestedProductsType !== null &&
      !searchQuery.some((sQ) => sQ.type === requestedProductsType)
    ) {
      validationErrors.push(
        'Requested Product type is not available in search query.'
      );
    }
    const uniqueProductTypes = new Set();
    searchQuery.forEach((sQuery) => {
      // validate attributes (projections)
      if (sQuery.attributes && !Array.isArray(sQuery.attributes)) {
        validationErrors.push(`Invalid attribute parameters in the rules.`);
      }
      // Validate the Product type.
      validationErrors.push(
        ...this.validateProductType(sQuery.type as StorageModel.ProductType)
      );
      uniqueProductTypes.add(sQuery.type);
    });
    // Validate rules for duplicate type
    if (uniqueProductTypes.size !== searchQuery.length) {
      validationErrors.push(
        'Invalid search query: duplicate rules for same type.'
      );
    }
    return validationErrors;
  }

  public validateAvailability(availability: any[]): string[] {
    log.debug('validateAvailability:: ', { availability });
    const validationErrors = [];
    if (availability.length === 0) {
      validationErrors.push(
        'At least one filter is required for each of the availability ' +
          'channel mentioned in the query'
      );
    } else {
      availability.forEach((item) => {
        const { name, status } = item;
        if (name && !status) {
          validationErrors.push(
            `Missing availability.status in the request parameters.`
          );
        }
        const inputFilterOperator: string[] = Object.keys(
          _.get(item, 'status', {})
        );

        if (status && inputFilterOperator.length > 1) {
          validationErrors.push(
            `Invalid availability filter, only one operator is allowed for status`
          );
        }
        if (status && !['ALL', 'IN'].includes(inputFilterOperator[0])) {
          validationErrors.push(
            'Invalid operator ' +
              inputFilterOperator[0] +
              ' in the availability filter.'
          );
        }
      });
    }
    return validationErrors;
  }
}

export const commonValidator = new CommonValidator();
