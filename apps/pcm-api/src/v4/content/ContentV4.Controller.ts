import { hasPermission } from '@tandfgroup/privilege-authorization-manager';
import { AppConstants } from '../../config/constant';
import { Request, Response } from 'express';
import * as _ from 'lodash';
import * as requestIp from 'request-ip';

import { Config } from '../../config/config';
import { AppError } from '../../model/AppError';
import { APIResponse } from '../../utils/APIResponse';
import Logger from '../../utils/LoggerUtil';
import { assetV4Service } from '../assets/AssetV4.Service';
import { productV4Service } from '../products/ProductV4.Service';
import { inputValidator } from '../validator/InputValidator';
import { contentV4Service } from './ContentV4.Service';

const log = Logger.getLogger('ContentController');
const iamEnv = Config.getPropertyValue('iamEnv');
const featureToggles = Config.getPropertyValue('featureToggles');

class ContentV4Controller {
  /**
   * @swagger
   * /content:
   *   post:
   *     tags:
   *     - Content
   *     summary: To create a content(Associated media) in PCM for a existing product.
   *     description: >
   *       This endpoint will allow user to create a content in PCM for a product.
   *       (Supports only Creativework product).
   *        - It returns an S3 location (valid for 10 minutes) to upload a content.
   *        - Once content is uploaded to the given s3 location,
   *          content will be processed and can be consumed by the user.
   *     requestBody:
   *       required: true
   *       content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/requestBodies/CreateContent'
   *     responses:
   *       202:
   *        description: The AWS s3 URL to upload the content file - Returns "accepted" status.
   *        content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               location:
   *                 type: string
   *                 description: pre-signed AWS s3 URL of the content to upload
   *               _id:
   *                 type: string
   *                 description: newly created content-id
   *       404:
   *         $ref: '#/components/responses/NotFoundBasic'
   *       400:
   *         $ref: '#/components/responses/BadRequestBasic'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedBasic'
   *       403:
   *         $ref: '#/components/responses/ForbiddenBasic'
   */
  public async createAssociatedMedia(
    request: Request,
    response: Response
  ): Promise<void> {
    log.debug('createAssociatedMedia:: Request creativeWork:', request.body);
    const contentJson = request.body;
    try {
      // all validations related to this api.
      inputValidator.validateAssociatedMedia(request);

      return contentV4Service
        .createAssociatedMedia(contentJson)
        .then((createdContent) => {
          APIResponse.accepted(response, createdContent);
        })
        .catch((error) => {
          APIResponse.failure(response, error);
        });
    } catch (error) {
      Logger.handleErrorLog(log, 'createAssociatedMedia:: ', error);
      APIResponse.failure(response, error);
    }
  }

  /**
   * @swagger
   * /content/{id}:
   *   get:
   *     tags:
   *     - Content
   *     summary: To get content data (location of the content) based on product id.
   *     description: |
   *       Returns content location details (i.e presigned s3 url OR public url) for all
   *       content types of the product.
   *         - User should have entitlement/read-access to content.
   *         - Open access and free access content can be accessed without entitlement.
   *         - Few content types are free to access. find the list below.
   *            - previewpdf
   *            - googlepdf
   *            - coverimage
   *            - bannerimage
   *            - exportcsv
   *            - hyperlink
   *            - partslist
   *         - All presigned S3 Urls are valid ONLY for 10 seconds.
   *     parameters:
   *     - $ref: "#/components/parameters/id"
   *     - $ref: "#/components/parameters/apiVersion"
   *     - in: query
   *       name: type
   *       required: false
   *       schema:
   *         type: string
   *         enum: [webpdf,previewpdf,dbitsxml,googlepdf,chapterpdf,video,partslist,coverimage]
   *       description: type of the content to filter.
   *     - in: query
   *       name: parentId
   *       schema:
   *         type: string
   *       description: |
   *          - Unique Identifier of the parent product.
   *          - Useful when accessing the free content of collection.
   *     - in: query
   *       name: render
   *       schema:
   *         type: boolean
   *         default: false
   *       description: |
   *          - when true s3 url will allow you to render the content/file.
   *          - when false s3 url will allow user to download the content/file.
   *     - in: query
   *       name: filenamePrefix
   *       schema:
   *         type: string
   *       description: |
   *         Valid when render=false. Used for prefixing the filename.
   *         Note: Do not use semicolon in the filenamePrefix. They will be removed.
   *         fileName = filenamePrefix + content-type + .extension
   *     responses:
   *       200:
   *        description: Returns list of content having presigned s3 url, type and accessType.
   *        content:
   *          application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/ContentRespBody'
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
   * We have implemented ROLE based content access for KORTEXT
   * This handleGetContentById method redirects the request to
   * proper handler based on the APP-NAME.
   * @param request express request object
   * @param response express response object
   */
  public async handleGetContentById(
    request: Request,
    response: Response
  ): Promise<void> {
    const appName = request.query.appName;
    const isAppWhiltested = ['KORTEXT', 'CATS-WMS'].includes(appName);
    try {
      if (appName && !isAppWhiltested) {
        throw new AppError(`Invalid query param ${appName}.`, 400);
      }
      if (appName && isAppWhiltested) {
        return this.getContentByIdBasedOnRole(request, response);
      } else {
        return this.getContentByIdBasedOnEntitlement(request, response);
      }
    } catch (error) {
      Logger.handleErrorLog(log, 'handleGetContentById:: ', error);
      APIResponse.failure(response, error);
    }
  }

  /**
   * @swagger
   * /content:
   *   get:
   *     tags:
   *     - Content
   *     summary: To get content data (location of the content) based on product identifierName and
   *       identifierValue.
   *     description: |
   *       Returns content location details (i.e presigned s3 url OR public url) for all
   *       content types of the product.
   *         - User should have entitlement/read-access to content.
   *         - Open access and free access content can be accessed without entitlement.
   *         - Few content types are free to access. find the list below.
   *            - previewpdf
   *            - googlepdf
   *            - coverimage
   *            - bannerimage
   *            - exportcsv
   *            - hyperlink
   *            - partslist
   *         - All presigned S3 Urls are valid ONLY for 10 seconds.
   *     parameters:
   *     - $ref: "#/components/parameters/apiVersion"
   *     - $ref: "#/components/parameters/identifierName"
   *     - $ref: "#/components/parameters/identifierValue"
   *     responses:
   *       200:
   *        description: Returns list of content having presigned s3 url, type and accessType.
   *        content:
   *          application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/ContentRespBody'
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
   * Get all the content of the product in a json format.
   *
   * @param request
   * @param response
   */
  public async getContentByIdentifier(
    request: Request,
    response: Response
  ): Promise<void> {
    const identifierName: string = request.query.identifierName;
    const identifierValue: string = request.query.identifierValue;
    try {
      if (!identifierName) {
        throw new AppError(`Missing parameter identifierName`, 400);
      }
      if (!['doi', 'isbn', '_id'].includes(identifierName)) {
        throw new AppError(`Incorrect identifierName: ${identifierName}`, 400);
      }
      if (!identifierValue) {
        throw new AppError(`Missing parameter identifierValue`, 400);
      }
      const { _id: productId } =
        await assetV4Service.getValidAssetByIdentifierNameValue(
          identifierName,
          identifierValue
        );
      if (!productId) {
        throw new AppError('Content (Product/Asset) not found', 404);
      }
      request.params = { id: productId };
      await this.getContentByIdBasedOnEntitlement(request, response);
    } catch (error) {
      Logger.handleErrorLog(log, 'getContentByIdentifier', error);
      APIResponse.failure(response, error);
    }
  }

  /**
   * @swagger
   * /content/{productTypeSupported}/download:
   *   get:
   *     tags:
   *     - Content
   *     summary: To get the content url then redirect to the url based on product identifierName
   *       and identifierValue.
   *     description: |
   *       Redirect to the url based on product identifierName and identifierValue.
   *     parameters:
   *     - $ref: "#/components/parameters/productTypeSupported"
   *     - in: query
   *       name: type
   *       required: false
   *       schema:
   *         type: string
   *         enum: [webpdf,previewpdf,dbitsxml,googlepdf,chapterpdf,video,partslist,coverimage]
   *       description: type of the content to filter.
   *     responses:
   *       200:
   *        description: Redirect to another url.
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
   * get the content url then redirect to the url
   * @param request
   * @param response
   */
  public async downloadContentByIdentifier(
    request: Request & { isBot?: boolean; hasAllContentAccess?: boolean },
    response: Response
  ): Promise<void> {
    const identifierName: string = request.query.identifierName;
    const identifierValue: string = request.query.identifierValue;
    const contentType: string = request.query.type;
    const isBot: boolean = request.isBot ? request.isBot : false;
    const hasAllContentAccess: boolean = request.hasAllContentAccess
      ? request.hasAllContentAccess
      : false;
    const productType = request.params.productType;
    const categoryType = request.params.categoryType;
    const contextId = request.query.contextId;

    try {
      if (!identifierName) {
        throw new AppError(`Missing parameter identifierName`, 400);
      }
      if (!['doi', 'isbn'].includes(identifierName)) {
        throw new AppError(`Incorrect identifierName: ${identifierName}`, 400);
      }
      if (!identifierValue) {
        throw new AppError(`Missing parameter identifierValue`, 400);
      }
      if (!contentType) {
        throw new AppError(`Missing parameter type (contentType)`, 400);
      }
      const { _id: productId, type } =
        await assetV4Service.getValidAssetByIdentifierNameValue(
          identifierName,
          identifierValue
        );
      if (!(productId && type)) {
        throw new AppError('Content (Product/Asset) not found', 404);
      }
      const relUrl = await productV4Service.getRelUrlFromProduct(
        productId,
        type
      );
      const token = _.get(request, 'headers.authorization', '').replace(
        'idtoken ',
        ''
      );
      const ip = requestIp.getClientIp(request);
      const filenamePrefix = identifierValue.replace('/', '_');
      const toRender = false;
      let content;
      if (hasAllContentAccess) {
        content = await contentV4Service.getContentByIdAndType(
          productId,
          contextId,
          {
            cf: false,
            contentType,
            filenamePrefix,
            ip,
            isBot,
            toRender,
            token
          }
        );
      } else {
        content =
          await contentV4Service.getOAandBeforePayWallContentByIdAndType(
            productId,
            contextId,
            {
              cf: false,
              contentType,
              filenamePrefix,
              ip,
              isBot,
              toRender,
              token
            }
          );
      }
      const contentLocation = content && content[0] && content[0].location;
      if (contentLocation) {
        this.redirect(response, contentLocation, relUrl);
      } else if (!contentLocation && contentType === 'googlepdf') {
        log.info(
          'downloadContentByIdentifier: Google PDF is missing, pulling preview PDF.'
        );
        const previewPdfContent = await contentV4Service.getContentByIdAndType(
          productId,
          null,
          {
            cf: false,
            contentType: 'previewpdf',
            filenamePrefix,
            ip,
            isBot,
            toRender,
            token
          }
        );
        const previewPdfLocation =
          (previewPdfContent &&
            previewPdfContent[0] &&
            previewPdfContent[0].location) ||
          this.getUBXPageUrl(productType, categoryType, identifierValue);
        this.redirect(response, previewPdfLocation, relUrl);
      } else {
        this.redirect(
          response,
          this.getUBXPageUrl(productType, categoryType, identifierValue),
          relUrl
        );
      }
    } catch (error) {
      Logger.handleErrorLog(log, 'getContentByIdentifier', error);
      this.redirect(
        response,
        this.getUBXPageUrl(productType, categoryType, identifierValue),
        ''
      );
    }
  }

  private redirect(response, url, relUrl) {
    log.info('downloadContentByIdentifier: Redirecting to: ', url);
    try {
      if (relUrl) {
        response.setHeader('rel', relUrl);
      }
    } catch (error) {
      log.error(
        'downloadContentByIdentifier: Error setting rel header: ',
        error
      );
    }
    response.redirect(url);
  }

  /**
   * Returns the content based on the USER role present in the token.
   * User role should have all-content read permission.
   * @param request express request object
   * @param response express response object
   * @returns Responds with the content data
   */
  @hasPermission(['api', 'all-content', 'read'], null, iamEnv)
  private async getContentByIdBasedOnRole(
    request: Request,
    response: Response
  ): Promise<void> {
    const skipEntitlementCheck = true;
    return this.__getContentById(request, response, skipEntitlementCheck);
  }

  /**
   * Returns the content based on the entitlement
   * entitlement is checked against (org id of) the token.
   * @param request express request object
   * @param response express response object
   * @returns Responds with the content data
   */
  private async getContentByIdBasedOnEntitlement(
    request: Request,
    response: Response
  ): Promise<void> {
    const skipEntitlementCheck = false;
    return this.__getContentById(request, response, skipEntitlementCheck);
  }

  /**
   * DO NOT USE THIS METHOD,
   * instead use getContentByIdBasedOnEntitlement or getContentByIdBasedOnRole.
   * If you want to use then first understand the skipEntitlementCheck parameter,
   * else set the skipEntitlementCheck false,
   * if set to true then this method returns a CONTENT for FREE.
   *
   * This method sends back the requested content data.
   * @param request express request object
   * @param response express response object
   * @param skipEntitlementCheck To skip the entitlement check.
   * Make sure to use this flag carefully.
   * If you have no idea on this flag then set this to "false"
   * @returns Responds with the content data
   */
  private async __getContentById(
    request: Request,
    response: Response,
    skipEntitlementCheck = false
  ): Promise<void> {
    const productId = request.params.id;
    let toRender = request.query.render;
    const parentId = request.query.parentId;
    const contentType = request.query.type;
    const filenamePrefix = request.query.filenamePrefix;
    try {
      if (filenamePrefix && filenamePrefix.length > 50) {
        throw new AppError(
          'Maximum character length should not exceed 50 for filenamePrefix',
          400
        );
      }
      if (toRender && toRender.toLowerCase() === 'true') {
        toRender = true;
      } else if (toRender && toRender.toLowerCase() === 'false') {
        toRender = false;
      } else if (toRender) {
        throw new AppError('Invalid query parameter: render', 400);
      } else {
        toRender = false;
      }
      const token = _.get(request, 'headers.authorization', '').replace(
        'idtoken ',
        ''
      );
      const content = await contentV4Service.getContentByIdAndType(
        productId,
        parentId,
        {
          cf: false,
          contentType,
          filenamePrefix,
          ip: requestIp.getClientIp(request),
          isBot: false,
          skipEntitlementCheck,
          toRender,
          token
        }
      );
      if (!content || !Array.isArray(content) || content.length === 0) {
        APIResponse.failure(response, new AppError('Content not found', 404));
      } else {
        APIResponse.success(response, content);
      }
      return;
    } catch (error) {
      Logger.handleErrorLog(log, 'getContentById', error);
      APIResponse.failure(response, error);
    }
  }

  // gets the UBX-website url corresponds to the requested product
  private getUBXPageUrl(type: string, categoryType: string, id: string): any {
    return (
      `${Config.getPropertyValue('ubxWebsUrl')}/${
        AppConstants.ContentProxyResourceMapping[type.toLowerCase()]
      }` +
      (categoryType ? `/${categoryType}/` : '/') +
      id
    );
  }
}

export const contentV4Controller = new ContentV4Controller();
