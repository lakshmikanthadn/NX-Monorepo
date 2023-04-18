import { hasPermission } from '@tandfgroup/privilege-authorization-manager';
import * as rTracer from 'cls-rtracer';
import { Request, Response } from 'express';

import { AppError } from '../../model/AppError';
import { APIResponse } from '../../utils/APIResponse';
import Logger from '../../utils/LoggerUtil';
import { IJournalProductServiceMapWrapper } from '../model/interfaces/JournalPublishingServiceMapWrapper';
import { journalPublishingServiceMapService } from './JournalPubServiceMap.Service';
import { Config } from '../../config/config';

const log = Logger.getLogger('JournalPublishingServiceMapController');
const iamEnv: string = Config.getPropertyValue('iamEnv');

class JournalPublishingServiceMapController {
  /**
   * @swagger
   * /products/{productIdentifier}/publishing-services:
   *   put:
   *     tags:
   *     -  Publishing-Services-Mapping
   *     summary: To Map Journal product with the Publishing services
   *     description: >
   *       This endpoint will allow user to create a mapping between
   *       the Journal product with the Publishing services.
   *        - You should have a permission to update the Product,
   *          use service account with right ROLES to update.
   *     parameters:
   *      - $ref: "#/components/parameters/productIdentifier"
   *      - $ref: "#/components/parameters/productIdentifierName"
   *     requestBody:
   *       required: true
   *       content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/requestBodies/CreateProductMapping'
   *     responses:
   *       202:
   *         $ref: '#/components/responses/AcceptedBasic'
   *       404:
   *         $ref: '#/components/responses/NotFoundBasic'
   *       400:
   *         $ref: '#/components/responses/BadRequestBasic'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedBasic'
   *       403:
   *         $ref: '#/components/responses/ForbiddenBasic'
   */

  /**
   * add the publishing service map to journal product.
   * This works only for journal acronym identifier only,
   * uuid or any other identifier of the journal is NOT allowed.
   * @param request express request object
   * @param response express response object
   * @returns {Promise<void>} hands over the request to handler
   */
  @hasPermission(['api', 'journal-product', 'update'], null, iamEnv)
  public async updateJournalPublishingServiceMap(
    request: Request,
    response: Response
  ): Promise<void> {
    return this._updateJournalPublishingServiceMap(request, response);
  }

  /**
   * Temporary solution enable testing of Decorated method updateJournalPublishingServiceMap
   * Right now the Mocking is not working as expected with typescript Decorator.
   * Marking this method public for testing only.
   * @param request express request object
   * @param response express response object
   * @returns {Promise<void>} updates the journalPublishingService map
   */
  public async _updateJournalPublishingServiceMap(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const mappingData = request.body.data;
      const productIdentifier = request.params.identifier;
      const productIdentifierName = request.query.productIdentifierName;
      await journalPublishingServiceMapService.updateJournalPublishingServiceMap(
        productIdentifier,
        productIdentifierName,
        mappingData
      );
      const responseData = {
        message:
          `Journal Publishing-Service mapping data for ${productIdentifierName} ${productIdentifier} ` +
          `is accepted successfully, it will be processed soon.`
      };
      return APIResponse.accepted(response, {
        data: null,
        metadata: responseData
      });
    } catch (error) {
      Logger.handleErrorLog(log, 'createJournalPublishingServiceMap:: ', error);
      return APIResponse.failure(response, error);
    }
  }
  /**
   * @swagger
   * /products/{productIdentifier}/publishing-services:
   *   get:
   *     tags:
   *     - Publishing-Services-Mapping
   *     summary: Get Journal product and Publishing services mapping data
   *     description: >
   *       This endpoint will allow user to get a mapping data of
   *       the Journal product with the Publishing services.
   *     parameters:
   *      - $ref: "#/components/parameters/apiVersion"
   *      - $ref: "#/components/parameters/productIdentifier"
   *      - $ref: "#/components/parameters/productIdentifierName"
   *      - $ref: "#/components/parameters/responseGroupForParts"
   *      - in: query
   *        name: classificationType
   *        schema:
   *          type: string
   *        description: |
   *         Filter all the Publishing Services matching classification type.
   *           - Use along with classificationName filter.
   *           - This is a required parameter when classificationName filter is used.
   *      - in: query
   *        name: classificationName
   *        schema:
   *          type: string
   *        description: |
   *         Filter all the Publishing Services matching classification name.
   *           - Use along with classificationName filter.
   *           - This is a required parameter when classificationType filter is used.
   *     responses:
   *       200:
   *         $ref: '#/components/responses/AcceptedBasic'
   *       404:
   *         $ref: '#/components/responses/NotFoundBasic'
   *       400:
   *         $ref: '#/components/responses/BadRequestBasic'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedBasic'
   *       403:
   *         $ref: '#/components/responses/ForbiddenBasic'
   */
  public async getJournalPublishingServiceMap(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const productIdentifier = request.params.identifier;
      const productIdentifierName =
        request.query.productIdentifierName || '_id';
      const classificationType = request.query.classificationType;
      const classificationName = request.query.classificationName;
      const responseGroup = request.query.responseGroup;
      if (!['journalAcronym', '_id'].includes(productIdentifierName)) {
        throw new AppError(
          `Product-identifier ${productIdentifierName} is not allowed.`,
          400
        );
      }
      const responseData: IJournalProductServiceMapWrapper[] =
        await journalPublishingServiceMapService.getJournalPublishingServiceMap(
          productIdentifier,
          productIdentifierName,
          classificationName,
          classificationType,
          responseGroup
        );
      const xTransactionId = rTracer.id();
      return APIResponse.success(response, {
        data: responseData ? responseData : null,
        metadata: {
          transactionId: xTransactionId && xTransactionId.toString()
        }
      });
    } catch (error) {
      Logger.handleErrorLog(log, 'getJournalPublishingServiceMap:: ', error);
      return APIResponse.failure(response, error);
    }
  }
}

export const journalPublishingServiceMapController =
  new JournalPublishingServiceMapController();
