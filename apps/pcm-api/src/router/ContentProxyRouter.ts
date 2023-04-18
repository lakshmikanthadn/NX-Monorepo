import { ContentProxyHandler } from '@tandfgroup/pcm-content-proxy-api-handler';
import { Request, Response } from 'express';

import { AppError } from '../model/AppError';
import { APIResponse } from '../utils/APIResponse';
import { appLogger } from '../utils/AppLoggerUtil';
import { contentV4Controller } from '../v4/content/ContentV4.Controller';
import { AppConstants } from '../config/constant';
import { BaseRouter } from './BaseRouter';

export default class ContentProxyRouter extends BaseRouter {
  private contentProxyHandler: ContentProxyHandler;

  constructor(contentProxyHandler: ContentProxyHandler) {
    super();
    this.contentProxyHandler = contentProxyHandler;
  }
  /**
   * The below 2 endpoints for GOOGLE SCHOLAR to deliver content.
   * These endpoints completly does authentication based on the IP.
   *
   *
   * The ProductType and categoryType are not respected by PCM.
   * and these parmas are added for SEO improvemenet.
   *
   * this method initializes all the routes of a Content Proxy router
   */
  protected initRoutes(): void {
    this.router.get(
      '/:productType/:categoryType/download',
      this.contentProxyReqValidator,
      this.contentProxyHandler.getExpressMiddleWare(),
      appLogger.getRequestInfoLogger(),
      (req: Request, res: Response) => {
        contentV4Controller.downloadContentByIdentifier(req, res);
      }
    );
    this.router.get(
      '/:productType/download',
      this.contentProxyReqValidator,
      this.contentProxyHandler.getExpressMiddleWare(),
      appLogger.getRequestInfoLogger(),
      (req: Request, res: Response) => {
        contentV4Controller.downloadContentByIdentifier(req, res);
      }
    );
  }
  /**
   * Express middleware for validation
   * @param req request
   * @param res response
   * @param next nextFunction
   * Keeping the validation in the router itself for simplicity.
   */
  private contentProxyReqValidator(req, res, next): void {
    // Setting this intentionally, We need to consider content proxy API as 4.0.1 version.
    req.query.apiVersion = '4.0.1';
    const categoryType = req.params.categoryType;
    const productType = req.params.productType;
    if (
      !AppConstants.ContentProxyWhitelistedResources.includes(
        productType.toLowerCase()
      )
    ) {
      APIResponse.failure(
        res,
        new AppError(`Invalid product type ${productType}`, 400)
      );
    } else if (
      categoryType &&
      !AppConstants.ContentProxyResourceCategories.includes(
        categoryType.toLowerCase()
      )
    ) {
      APIResponse.failure(
        res,
        new AppError(`Invalid category type ${categoryType}`, 400)
      );
    } else {
      next();
    }
  }
}
