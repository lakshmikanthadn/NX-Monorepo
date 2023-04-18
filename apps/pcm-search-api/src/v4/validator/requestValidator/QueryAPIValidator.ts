import { Request } from 'express';

import Logger from '../../../utils/LoggerUtil';
import { AppError } from '../../../model/AppError';
import { commonValidator } from './CommonValidator';

const log = Logger.getLogger('QueryValidator');

class QueryAPIValidator {
  public validateSearch(req: Request): boolean {
    log.debug('validateSearch::', req.body);
    const validationErrors = [];
    const searchPayload = req.body;
    if (!searchPayload) {
      throw new AppError(`Invalid parameters in search query`, 400);
    }
    const {
      action,
      apiVersion,
      offset,
      limit,
      rulesList,
      hasTotalPrices,
      hasCounts,
      availability,
      offsetCursor,
      ...restOfBody
    } = searchPayload;

    if (offset && offset !== 0) {
      validationErrors.push('Only Offset with value 0 allowed.');
    }

    if (offsetCursor && offset === 0) {
      validationErrors.push(
        'Offset parameter is not supported when using the offsetCursor parameter.'
      );
    }

    const invalidBodyParams = Object.keys(restOfBody);
    let invalidAvblParams;
    if (Array.isArray(availability)) {
      validationErrors.push(
        ...commonValidator.validateAvailability(availability)
      );
    } else {
      const { name, status, ...restOfAvailability } = availability || {};
      if (!name && status) {
        validationErrors.push(
          'Missing availability.name in the request parameters.'
        );
      }
      invalidAvblParams = Object.keys(restOfAvailability);
      if (invalidAvblParams.length > 0) {
        validationErrors.push(
          `Invalid parameters: availability ` + `${invalidAvblParams.join()}`
        );
      }
    }

    if (invalidBodyParams.length > 0) {
      validationErrors.push(`Invalid parameters: ${invalidBodyParams.join()}`);
    }
    // Validate hasTotalPrices value`
    if (hasTotalPrices && ![true, false].includes(hasTotalPrices)) {
      validationErrors.push(`Invalid hasTotalPrices value: ${hasTotalPrices}`);
    }

    if (hasCounts && ![true, false].includes(hasCounts)) {
      validationErrors.push(`Invalid hasCounts value: ${hasCounts}`);
    }
    if (rulesList && rulesList.length > 1) {
      validationErrors.push('Invalid rulesList: only one rule is allowed.');
    } else {
      validationErrors.push(
        ...commonValidator.validateSearchQuery(rulesList, null, availability)
      );
    }
    validationErrors.push(
      ...commonValidator.validateOffsetLimit(offset, limit, true)
    );
    if (offsetCursor) {
      validationErrors.push(
        ...commonValidator.validateOffsetCursor(offsetCursor)
      );
    }
    if (validationErrors.length > 0) {
      throw new AppError(validationErrors.join(' and '), 400);
    }
    return true;
  }
}

export const queryAPIValidator = new QueryAPIValidator();
