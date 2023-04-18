import Logger from '../../../utils/LoggerUtil';
import { OaValidationError } from '../../model/interfaces/OAUpdateWrapper';

const log = Logger.getLogger('OAUpdateAPIValidator');
class OAUpdateAPIValidator {
  public validateOAUpdateRequest(request: any): OaValidationError[] {
    const { appName, requestId, callBackurl } = request;
    const validationErrors: OaValidationError[] = [];
    if (!appName || appName !== 'OMS') {
      validationErrors.push(new OaValidationError('invalid app name'));
    }
    if (!requestId) {
      validationErrors.push(new OaValidationError('invalid requestId'));
    }
    try {
      const validUrl = new URL(callBackurl);
      log.info(`${validUrl} is valid`);
    } catch (error) {
      log.warn(`${error.input} is not a valid url`);
      validationErrors.push(new OaValidationError('invalid callBackurl'));
    }
    return validationErrors;
  }
}
export const oaUpdateAPIValidator = new OAUpdateAPIValidator();
