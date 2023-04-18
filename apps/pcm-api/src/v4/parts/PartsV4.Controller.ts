import { Request, Response } from 'express';
import { Config } from '../../config/config';
import { APIResponse } from '../../utils/APIResponse';
import Logger from '../../utils/LoggerUtil';
import { APIResponseGroup } from '../model/interfaces/CustomDataTypes';
import { inputValidator } from '../validator/InputValidator';
import { partsV4Service } from './PartsV4.Service';

const log = Logger.getLogger('PartsV4Controller');

export class PartsV4Controller {
  /**
   * @swagger
   * /products/{id}/parts:
   *   get:
   *     tags:
   *     - Parts
   *     summary: To get parts data of the product based on id (product uuid).
   *     description: >
   *       Returns list of all the parts for a given product id.
   *        One can use additional filters to get the specific parts using productType and format.
   *        Also the response is available in two flavours small and medium.
   *     parameters:
   *     - $ref: "#/components/parameters/id"
   *     - $ref: "#/components/parameters/apiVersion"
   *     - $ref: "#/components/parameters/responseGroupForParts"
   *     - $ref: "#/components/parameters/offsetParam"
   *     - $ref: "#/components/parameters/limitParamForParts"
   *     - $ref: "#/components/parameters/productType"
   *     - $ref: "#/components/parameters/depth"
   *     - in: query
   *       name: format
   *       schema:
   *         type: string
   *         enum: [video, hyperlink, document, presentation, image,
   * portableDocument, audio, database, archive, spreadsheet]
   *       description: Filter product parts by specific format, applicable only for creativeWork
   *     responses:
   *       200:
   *        description: Returns a Product's Has-parts
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
    log.debug('getProductHasParts : Request Params : ', request.params);
    const responseGroup: APIResponseGroup = request.query.responseGroup;
    const identifierValue: string = request.params.identifier;
    let limit = request.query.limit;
    let offset = request.query.offset;
    const parsedLimit = parseInt(limit, 10);
    const parsedOffset = parseInt(offset, 10);
    const defaultBatchSize = Config.getPropertyValue('defaultBatchSizeV4');
    const partType = request.query.type;
    const format: string = request.query.format;
    const productVersion: string = request.query.productVersion;
    const depth = request.query.depth;
    const requestedIncludeCounts: string = request.query.includeCounts;
    const includeCounts: boolean =
      requestedIncludeCounts && requestedIncludeCounts.toLowerCase() === 'true'
        ? true
        : false;
    let identifierName: string = request.query.productIdentifierName;
    const parsedDepth = parseInt(depth, 10) || 1;
    try {
      /**
       * All the validators either return true or throw APP Error.
       * Make sure to put them inside a try catch and handle the error.
       */
      inputValidator.productHasPartsValidator(request);
      offset = parsedOffset ? parsedOffset : 0;
      limit = parsedLimit ? parsedLimit : defaultBatchSize;
      identifierName = identifierName ? identifierName : '_id';
      const productHasParts = await partsV4Service.getProductHasParts(
        identifierValue,
        identifierName,
        offset,
        limit,
        includeCounts,
        partType,
        format,
        responseGroup,
        productVersion,
        request.query.apiVersion === '4.0.2' ? true : false,
        parsedDepth
      );
      APIResponse.success(response, productHasParts);
    } catch (error) {
      Logger.handleErrorLog(log, 'getProductHasParts', error);
      APIResponse.failure(response, error);
    }
  }

  /**
   * @swagger
   * /products/{id}/parts/{partId}:
   *   get:
   *     tags:
   *     - Parts
   *     summary: To get part details of the product based on product id and part id.
   *     description: >
   *       Returns a one part for a given part-id from the list of parts of the parent.
   *       Also the response is available in two flavours small and medium.
   *     parameters:
   *     - $ref: "#/components/parameters/id"
   *     - $ref: "#/components/parameters/partIdParam"
   *     - $ref: "#/components/parameters/apiVersion"
   *     - $ref: "#/components/parameters/responseGroupForParts"
   *     responses:
   *       200:
   *        description: Returns a Product's Has-part
   *        content:
   *          application/json:
   *            schema:
   *             anyOf:
   *              - $ref: '#/components/schemas/PartsSmall'
   *              - $ref: '#/components/schemas/PartsMedium'
   *       404:
   *         $ref: '#/components/responses/NotFoundBasic'
   *       400:
   *         $ref: '#/components/responses/BadRequestBasic'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedBasic'
   *       403:
   *         $ref: '#/components/responses/ForbiddenBasic'
   */

  public async getProductHasPart(
    request: Request,
    response: Response
  ): Promise<any> {
    log.debug('getProductHasPart : Request Params : ', request.params);
    const responseGroup: APIResponseGroup = request.query.responseGroup;
    const identifier: string = request.params.identifier;
    const partId: string = request.params.partId;
    try {
      /**
       * All the validators either return true or throw APP Error.
       * Make sure to put them inside a try catch and handle the error.
       */
      inputValidator.productHasPartsValidator(request);
      const productHasPart = await partsV4Service.getProductHasPart(
        identifier,
        partId,
        responseGroup
      );
      APIResponse.success(response, productHasPart);
    } catch (error) {
      Logger.handleErrorLog(log, 'getProductHasPart', error);
      APIResponse.failure(response, error);
    }
  }

  /**
   * @swagger
   * /products/{id}/parts-delta:
   *   get:
   *     tags:
   *     - Parts
   *     summary: To get delta in parts of a product based on the product versions and product id.
   *     description: >
   *       Returns the parts added and removed from the list of parts of any 2 versions of the parent.
   *       Region filter can also be applied to restrict parts from specifed region in response.
   *       The response is available in small flavour.
   *     parameters:
   *     - $ref: "#/components/parameters/id"
   *     - $ref: "#/components/parameters/apiVersion"
   *     - $ref: "#/components/parameters/responseGroupForParts"
   *     - $ref: "#/components/parameters/region"
   *     responses:
   *       200:
   *        description: returns delta between a product's parts
   *        content:
   *          application/json:
   *            schema:
   *             anyOf:
   *              - $ref: '#/components/schemas/PartsSmall'
   *       404:
   *         $ref: '#/components/responses/NotFoundBasic'
   *       400:
   *         $ref: '#/components/responses/BadRequestBasic'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedBasic'
   *       403:
   *         $ref: '#/components/responses/ForbiddenBasic'
   */

  public async getProductPartsDelta(
    request: Request,
    response: Response
  ): Promise<any> {
    log.debug('getProductPartsDelta : Request Params : ', request.params);
    const identifier: string = request.params.identifier;
    const v1: string = request.query.v1;
    const v2: string = request.query.v2;
    const responseGroup: APIResponseGroup = request.query.responseGroup;
    const region: string = request.query.region;
    try {
      inputValidator.productPartsDeltaValidator(request);
      const productPartsDelta = await partsV4Service.getProductPartsDelta(
        identifier,
        v1,
        v2,
        region,
        responseGroup
      );
      APIResponse.success(response, productPartsDelta);
    } catch (error) {
      Logger.handleErrorLog(log, 'getProductHasPart', error);
      APIResponse.failure(response, error);
    }
  }
}

export const partsV4Controller = new PartsV4Controller();
