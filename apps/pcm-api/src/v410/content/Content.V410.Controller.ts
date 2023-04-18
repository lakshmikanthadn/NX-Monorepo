import { hasPermission } from '@tandfgroup/privilege-authorization-manager';
import * as rTracer from 'cls-rtracer';
import { Request, Response } from 'express';
import isIp = require('is-ip');
import * as jwt from 'jsonwebtoken';
import * as jwtDecode from 'jwt-decode';
import * as _ from 'lodash';

import { AppError } from '../../model/AppError';
import { APIResponse } from '../../utils/APIResponse';
import Logger from '../../utils/LoggerUtil';
import { contentV4Service } from '../../v4/content/ContentV4.Service';
import { getAPISecretValues } from '../../v4/utils/SecretMangerUtils';
import { contentV410ReqValidator } from './Content.V410.ReqValidator';
import { Config } from '../../config/config';

const log = Logger.getLogger('ContentV410Controller');
const iamEnv: string = Config.getPropertyValue('iamEnv');

class ContentV410Controller {
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
   *     - $ref: "#/components/parameters/apiVersion410"
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
   *       name: ipSignature
   *       schema:
   *         type: string
   *       description: |
   *          - Unique encrypted token containing client information.
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
    try {
      contentV410ReqValidator.validateQueryParams(request.query);
      if (request.query.appName === 'KORTEXT') {
        return this.getContentByIdBasedOnRole(request, response);
      } else {
        return this.getCfLinkToContentById(request, response);
      }
    } catch (error) {
      Logger.handleErrorLog(log, 'handleGetContentById:: ', error);
      APIResponse.failure(response, error);
    }
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
    return this.getCfLinkToContentById(request, response, skipEntitlementCheck);
  }

  /**
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
  private async getCfLinkToContentById(
    request: Request,
    response: Response,
    skipEntitlementCheck = false
  ): Promise<void> {
    try {
      const ipSignature = request.query.ipSignature;
      if (!ipSignature) {
        return APIResponse.failure(
          response,
          new AppError('Missing parameter ipSignature', 400)
        );
      }
      const secretData = await getAPISecretValues();
      const decodedIpSignature: jwt.JwtPayload = jwt.verify(
        ipSignature,
        secretData.ipVerifierKey
      ) as jwt.JwtPayload;
      const { ip, userId } = decodedIpSignature as {
        ip: string;
        userId: string;
      };
      const isValidIp = isIp(ip);
      if (!isValidIp) {
        return APIResponse.failure(
          response,
          new AppError(`Invalid IP ${ip}`, 403)
        );
      }
      const authHeaderToken = _.get(
        request,
        'headers.authorization',
        ''
      ).replace('idtoken ', '');
      const decodedJwt: any = jwtDecode(authHeaderToken);
      log.info(
        'decodedAuthHeaderToken and decodedIpSignature',
        decodedJwt,
        decodedIpSignature
      );
      if (
        !(
          userId === decodedJwt?.user?._id || userId === decodedJwt?.client?._id
        )
      ) {
        return APIResponse.failure(
          response,
          new AppError('User id mismatch', 403)
        );
      }
      const content = await contentV4Service.getContentByIdAndType(
        request.params.id,
        request.query.parentId,
        {
          cf: true,
          contentType: request.query.type,
          filenamePrefix: request.query.filenamePrefix,
          ip,
          isBot: false,
          skipEntitlementCheck,
          toRender: request.query.render === 'true',
          token: authHeaderToken
        }
      );
      if (!content || !Array.isArray(content) || content.length === 0) {
        return APIResponse.failure(
          response,
          new AppError('Content not found', 404)
        );
      } else {
        return APIResponse.success(response, {
          data: content,
          metadata: {
            transactionId: rTracer.id()
          }
        });
      }
    } catch (error) {
      Logger.handleErrorLog(log, 'getContentById', error);
      return APIResponse.failure(response, error);
    }
  }
}

export const contentV410Controller = new ContentV410Controller();
