import { Request, Response } from 'express';
import Logger from '../../utils/LoggerUtil';

import { AppError } from '../../model/AppError';
import { APIResponse } from '../../utils/APIResponse';
import {
  IFetchVariantsResponseBody as IVariantsInfo,
  IRequestIdentifier
} from './Title.Model';
import { titleService } from './Title.Service';
import { titleValidator } from './Title.Validator';

const log = Logger.getLogger('TitleController');

class TitleController {
  /**
   * @swagger
   * /products#action=fetchVariants:
   *   post:
   *     tags:
   *     - Miscellaneous
   *     summary: To get variants of same Book product based on identifier (Supports only isbn13).
   *     description: Returns all the variants of the same Book product for the given ISBN.
   *     requestBody:
   *       required: true
   *       content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/requestBodies/ActionFetchVariants'
   *     responses:
   *       200:
   *        description: Returns all variants of the book.
   *        content:
   *          application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/TitleRespBody'
   *       404:
   *         $ref: '#/components/responses/NotFoundBasic'
   *       400:
   *         $ref: '#/components/responses/BadRequestBasic'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedBasic'
   *       403:
   *         $ref: '#/components/responses/ForbiddenBasic'
   */

  public async getProductVariantsByIds(
    request: Request,
    response: Response
  ): Promise<void> {
    log.debug('getProductVariantsByIds:: ');
    try {
      /**
       * All the validators either return true or throw APP Error.
       * Make sure to put them inside a try catch and handle the error.
       */
      titleValidator.fetchVariantRequestValidator(request);
      const { formats, identifiers, includeEditions } = request.body;
      // As we support only one identifier.
      const identifier: IRequestIdentifier = identifiers[0];
      return titleService
        .getProductVariantsByIds(identifier.name, identifier.values, {
          formats,
          includeEditions
        })
        .then((variantsInfo: IVariantsInfo[]) => {
          if (!variantsInfo || variantsInfo.length === 0) {
            APIResponse.failure(
              response,
              new AppError('Product variants not found.', 404)
            );
            return;
          }
          APIResponse.success(response, variantsInfo);
        })
        .catch((error) => {
          Logger.handleErrorLog(log, 'getProductVariantsByIds', error);
          APIResponse.failure(response, error);
        });
    } catch (error) {
      Logger.handleErrorLog(log, 'getProductVariantsByIds', error);
      APIResponse.failure(response, error);
    }
  }
}

export const titleController = new TitleController();
