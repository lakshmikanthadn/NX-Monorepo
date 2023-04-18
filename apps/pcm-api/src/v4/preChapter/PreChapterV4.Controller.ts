import { Request, Response } from 'express';

import { APIResponse } from '../../utils/APIResponse';
import Logger from '../../utils/LoggerUtil';
import { preChapterProductService } from './PreChapterV4.Service';

const log = Logger.getLogger('PreChapterProductController');
export class PreChapterV4Controller {
  public async createPreChapterProduct(request: Request, response: Response) {
    return this._handlePreChapter(request, response, 'create');
  }
  public async updatePreChapterProduct(request: Request, response: Response) {
    return this._handlePreChapter(request, response, 'update');
  }
  public async _handlePreChapter(
    request: Request,
    response: Response,
    action: string
  ): Promise<void> {
    const product = request.body.product;
    const id = request.params.identifier;
    try {
      if (action === 'update') {
        await preChapterProductService.updatePreChapterProduct(id, product);
      } else {
        await preChapterProductService.createPreChapterProduct(product);
      }
      const responseData = {
        message: [
          {
            code: 202,
            description: `Pre-Chapter product ${action} request is accepted successfully, it will be processed soon.`
          }
        ],
        status: 'success'
      };
      return APIResponse.accepted(response, {
        data: null,
        metadata: responseData
      });
    } catch (error) {
      Logger.handleErrorLog(log, 'updatePreChapterProduct:: ', error);
      return APIResponse.failure(response, error);
    }
  }
}
export const prechapterV4Controller = new PreChapterV4Controller();
