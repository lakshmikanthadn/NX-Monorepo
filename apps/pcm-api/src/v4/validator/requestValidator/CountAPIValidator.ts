import { Request } from 'express';
import Logger from '../../../utils/LoggerUtil';

import { Config } from '../../../config/config';
import { AppError } from '../../../model/AppError';
import { commonValidator } from './CommonValidator';

const log = Logger.getLogger('CommonValidator');
const featureToggles = Config.getPropertyValue('featureToggles');

class CountAPIValidator {
  /**
   * This method will returns true if everything is valid,
   * else throws APP Error error.
   * @param req Request
   */
  public validateCountApi(req: Request): boolean {
    log.debug('validateCountApi', { reqBody: req.body });
    const validationErrors = [];
    const {
      apiVersion,
      action,
      availability,
      rulesList,
      hasCounts,
      hasTotalPrices,
      ...restOfBody
    } = req.body;
    const invalidBodyParams = Object.keys(restOfBody);
    let invalidAvblParams;
    if (Array.isArray(availability)) {
      validationErrors.push(
        ...commonValidator.validateAvailability(availability)
      );
    } else {
      const { name, status, ...restOfAvailability } = availability || {};
      invalidAvblParams = Object.keys(restOfAvailability);
      if (invalidAvblParams.length > 0) {
        validationErrors.push(
          `Invalid parameters: availability ${invalidAvblParams.join()}`
        );
      }
    }
    if (invalidBodyParams.length > 0) {
      validationErrors.push(`Invalid parameters: ${invalidBodyParams.join()}`);
    }

    if (hasCounts && typeof hasCounts !== 'boolean') {
      validationErrors.push(`Invalid hasCounts value: ${hasCounts}`);
    }
    if (hasTotalPrices && typeof hasTotalPrices !== 'boolean') {
      validationErrors.push(`Invalid hasTotalPrices value: ${hasTotalPrices}`);
    }
    validationErrors.push(...commonValidator.validateSearchQuery(rulesList));
    if (validationErrors.length > 0) {
      throw new AppError(validationErrors.join(' and '), 400);
    }
    return true;
  }
}

export const countAPIValidator = new CountAPIValidator();
