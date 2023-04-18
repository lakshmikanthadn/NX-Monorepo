import { hasPermission } from '@tandfgroup/privilege-authorization-manager';
import { Request, Response } from 'express';

import { APIResponse } from '../../utils/APIResponse';
import Logger from '../../utils/LoggerUtil';
import { journalService } from './Journal.Service';
import { journalValidator } from './JournalValidator';
import { Config } from '../../config/config';

const log = Logger.getLogger('JournalController');
const iamEnv: string = Config.getPropertyValue('iamEnv');

class JournalController {
  /**
   *
   * @param request express request object
   * @param response express response object
   * @returns hands over the request to handler
   */
  @hasPermission(['api', 'journal-product', 'update'], null, iamEnv)
  public async updateJournalProduct(
    request: Request,
    response: Response
  ): Promise<void> {
    return this._updateJournalProduct(request, response);
  }

  /**
   * This method is temporary solution to test the Decorated method updateJournalProduct
   * Right now the Mocking is not working as expected with typescript Decorator.
   * Keeping this public for testing.
   * @param request
   * @param response
   * @returns updates the journal product
   */
  public async _updateJournalProduct(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const product = request.body.product;
      const productIdentifier = request.params.identifier;
      const productIdentifierName =
        request.query.productIdentifierName || '_id';
      journalValidator.validate(request);
      await journalService.updateJournalProduct(
        productIdentifier,
        product,
        productIdentifierName
      );
      const responseData = {
        message:
          `Journal product data for ${productIdentifierName} ${productIdentifier} ` +
          `is accepted successfully, it will be processed soon.`
      };
      return APIResponse.accepted(response, {
        data: null,
        metadata: responseData
      });
    } catch (error) {
      Logger.handleErrorLog(log, 'updateJournalProduct:: ', error);
      return APIResponse.failure(response, error);
    }
  }
}

export const journalController = new JournalController();
