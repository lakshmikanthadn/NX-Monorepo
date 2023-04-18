import { hasPermission } from '@tandfgroup/privilege-authorization-manager';
import { Request, Response } from 'express';

import { APIResponse } from '../../utils/APIResponse';
import Logger from '../../utils/LoggerUtil';
import { publishingServiceProductService } from './PublishingService.Service';
import { Config } from '../../config/config';

const log = Logger.getLogger('PublishingServiceProductController');
const iamEnv: string = Config.getPropertyValue('iamEnv');
class PublishingServiceController {
  /**
   * This is protected handler allows to create the publishing service, only if
   * the user has publishing-service-product create permission
   * @param request express req object
   * @param response express resp object
   * @returns hands over the request to handler
   */
  @hasPermission(['api', 'publishing-service-product', 'create'], null, iamEnv)
  public async createPublishingService(request: Request, response: Response) {
    return this._handlePublishingService(request, response, 'create');
  }

  /**
   * This is protected handler allows to update the publishing service only if
   * the user has publishing-service-product update permission
   * @param request express req object
   * @param response express resp object
   * @returns hands over the request to handler
   */
  @hasPermission(['api', 'publishing-service-product', 'update'], null, iamEnv)
  public async updatePublishingService(request: Request, response: Response) {
    return this._handlePublishingService(request, response, 'update');
  }

  /**
   * This handles the create and update requests for publishing-service-product
   *  Marking this method public for testing only,
   * Temporary solution enable testing of Decorated method updateJournalPublishingServiceMap
   * Right now the Mocking is not working as expected with typescript Decorator.
   * @param request express Request object
   * @param response express request object
   * @param action create or update
   * @returns handles the create/update PublishingService request
   */
  public async _handlePublishingService(
    request: Request,
    response: Response,
    action: string
  ): Promise<void> {
    const product = request.body.product;
    const id = request.params.identifier;
    try {
      if (action === 'update') {
        await publishingServiceProductService.updateServiceProduct(id, product);
      } else {
        await publishingServiceProductService.createServiceProduct(id, product);
      }
      const responseData = {
        message:
          `Publishing-Service product ${action} request for id ${id} ` +
          `is accepted successfully, it will be processed soon.`
      };
      return APIResponse.accepted(response, {
        data: null,
        metadata: responseData
      });
    } catch (error) {
      Logger.handleErrorLog(log, 'updatePublishingService:: ', error);
      return APIResponse.failure(response, error);
    }
  }
}

export const publishingServiceController = new PublishingServiceController();
