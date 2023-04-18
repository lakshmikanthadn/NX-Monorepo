import Logger from '../../../utils/LoggerUtil';

import { AppError } from '../../../model/AppError';
import { commonValidator } from './CommonValidator';

const log = Logger.getLogger('CommonValidator');

class SearchDownloadValidator {
  public validateSearchDownloadRequest(request): boolean {
    log.debug('searchResultRequest:: ', { action: request['action'] });
    const validationErrors = [];
    // validate params
    const {
      _id,
      action,
      apiVersion,
      rulesList,
      recipients,
      fileName,
      availability,
      ...restOfBody
    } = request;
    const invalidBodyParams = Object.keys(restOfBody);
    if (invalidBodyParams.length > 0) {
      validationErrors.push(`Invalid parameters: ${invalidBodyParams.join()}`);
    }
    // validate availability
    let invalidAvblParams;
    if (availability) {
      const { name, status, ...restOfAvailability } = availability;
      if (this.isNameDoesntExists(name, status)) {
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
    if (!recipients) {
      validationErrors.push('Missing field recipients in request payload');
    } else {
      const recipientsEmailTo = recipients.to;
      const recipientsEmailCC = recipients.cc;
      if (!recipientsEmailTo) {
        validationErrors.push('Invalid recipients');
      } else if (this.hasNoRecipientEmailTo(recipientsEmailTo)) {
        validationErrors.push('At least one email is required for recipients');
      } else {
        recipientsEmailTo.forEach((email) => {
          validationErrors.push(...commonValidator.validateEmail(email));
        });
        if (this.isEmailCCAnArrayAndExists(recipientsEmailCC)) {
          recipientsEmailCC.forEach((email) => {
            validationErrors.push(...commonValidator.validateEmail(email));
          });
        }
      }
    }
    if (!fileName) {
      validationErrors.push('Missing field fileName in request payload');
    }
    if (!rulesList) {
      validationErrors.push('Invalid rulesList');
    } else {
      validationErrors.push(...commonValidator.validateSearchQuery(rulesList));
    }
    if (validationErrors.length > 0) {
      throw new AppError(
        'Validation error',
        400,
        validationErrors.map((msg: string) => {
          return {
            code: 400,
            dataPath: '',
            description: msg
          };
        })
      );
    }
    return true;
  }
  private isNameDoesntExists(name, status): boolean {
    return !name && status;
  }
  private hasNoRecipientEmailTo(recipientsEmailTo): boolean {
    return Array.isArray(recipientsEmailTo) && recipientsEmailTo.length === 0;
  }
  private isEmailCCAnArrayAndExists(recipientsEmailCC): boolean {
    return (
      recipientsEmailCC &&
      Array.isArray(recipientsEmailCC) &&
      recipientsEmailCC.length > 0
    );
  }
}

export const searchDownloadValidator = new SearchDownloadValidator();
