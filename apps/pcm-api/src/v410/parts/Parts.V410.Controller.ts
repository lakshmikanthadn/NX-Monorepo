import { Request, Response } from 'express';
import { Config } from '../../config/config';
import { APIResponse } from '../../utils/APIResponse';
import Logger from '../../utils/LoggerUtil';
import { APIResponseGroup } from '../../v4/model/interfaces/CustomDataTypes';
import { inputValidator } from '../../v4/validator/InputValidator';
import { partsV410Service } from './Parts.V410.Service';

const log = Logger.getLogger('PartsV410Controller');

export class PartsV410Controller {
  /**
   * @swagger
   * /products/{id}/parts:
   *   get:
   *     tags:
   *     - Parts
   *     summary: >
   *       To get parts data with region exclusion and partial search
   *       of the given collection product based on id (collection product uuid).
   *     description: >
   *       Returns list of all the parts for a given product id.
   *       Currently accepts only product id of collection products.
   *       Also the response is available in two flavours small and medium.
   *     parameters:
   *     - $ref: "#/components/parameters/id"
   *     - $ref: "#/components/parameters/apiVersion"
   *     - $ref: "#/components/parameters/responseGroupForParts"
   *     - $ref: "#/components/parameters/offsetParam"
   *     - $ref: "#/components/parameters/limitParamForParts"
   *     - $ref: "#/components/parameters/region"
   *     responses:
   *       200:
   *        description: Returns a collection product's Has-parts
   *        content:
   *          application/json:
   *            schema:
   *              type: array
   *              items:
   *                anyOf:
   *                 - $ref: '#/components/schemas/PartsSmall'
   *                 - $ref: '#/components/schemas/PartsMedium'
   *       404:
   *         $ref: '#/components/responses/NotFoundBasic'
   *       400:
   *         $ref: '#/components/responses/BadRequestBasic'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedBasic'
   *       403:
   *         $ref: '#/components/responses/ForbiddenBasic'
   */

  public async getProductHasParts(
    request: Request,
    response: Response
  ): Promise<any> {
    log.debug('getProductHasParts : Request Params: ', request.params);
    const queryParams = request.query;
    const responseGroup: APIResponseGroup =
      request.query.responseGroup || 'small';
    const id: string = request.params.identifier;
    const limit: number = parseInt(queryParams.limit, 10)
      ? parseInt(queryParams.limit, 10)
      : Config.getPropertyValue('defaultBatchSizeV4');
    const offsetCursor: string = queryParams.offsetCursor;
    const region: string = queryParams.region;
    const version: string = queryParams.version;
    const searchTerm: string = queryParams.q;
    const appName: string = queryParams.appName;
    log.debug('getProductHasParts: ', {
      appName,
      id,
      limit,
      offsetCursor,
      region,
      responseGroup,
      searchTerm,
      version
    });
    try {
      inputValidator.productv410HasPartsValidator(request);
      const productHasParts = await partsV410Service.getProductHasParts(
        id,
        limit,
        offsetCursor,
        region,
        version,
        searchTerm,
        responseGroup
      );
      APIResponse.success(response, productHasParts);
    } catch (error) {
      Logger.handleErrorLog(log, 'getProductHasParts', error);
      APIResponse.failure(response, error);
    }
  }
}

export const partsV410Controller = new PartsV410Controller();
