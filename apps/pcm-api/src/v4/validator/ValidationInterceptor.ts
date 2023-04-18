import Logger from '../../utils/LoggerUtil';
import { inputValidator } from './InputValidator';

import { APIResponse } from '../../utils/APIResponse';

const log = Logger.getLogger('ValidatonInterceptor');

class ValidationInterceptor {
  public apiVersionAndResponseGroupValidator(request, response, next) {
    const apiVersion = request.body.apiVersion || request.query.apiVersion;
    const responseGroup =
      request.body.responseGroup || request.query.responseGroup;
    try {
      inputValidator.validateAPIVersionResponseGroup(apiVersion, responseGroup);
      next();
    } catch (error) {
      APIResponse.failure(response, error);
    }
  }
}

export const validationInterceptor = new ValidationInterceptor();
