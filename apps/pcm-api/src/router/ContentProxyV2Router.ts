import { Request, Response } from 'express';

import { Config } from '../config/config';
import { appLogger } from '../utils/AppLoggerUtil';
import Logger from '../utils/LoggerUtil';
import { BaseRouter } from './BaseRouter';

const log = Logger.getLogger('ContentProxyV2Router');
const contentApiUrl = Config.getPropertyValue('contentApiUrl');

export default class ContentProxyV2Router extends BaseRouter {
  constructor() {
    super();
  }
  /**
   * this method initializes all the routes of a ContentV2 Proxy router
   */
  protected initRoutes(): void {
    this.router.get(
      '/:productType/:categoryType/download',
      appLogger.getRequestInfoLogger(),
      (req: Request, res: Response) => {
        this.contentV2ProxyReqHandler(req, res);
      }
    );
    this.router.get(
      '/:productType/download',
      appLogger.getRequestInfoLogger(),
      (req: Request, res: Response) => {
        this.contentV2ProxyReqHandler(req, res);
      }
    );
  }
  /**
   * To Handle all the CAPI V2 requests and redirect them permanently to new Content API.
   * @param req request
   * @param res response
   * Keeping the Redirection of the request in router itself for simplicity.
   */
  private contentV2ProxyReqHandler(request: Request, response: Response): void {
    let identifierName: string;
    let identifierValue: string;
    let contentType: string;
    let isChapter = false;
    try {
      // Pick the Right identifier and check if the Product is chapter
      if (request.query.doi) {
        identifierName = 'doi';
        identifierValue = request.query.doi;
        // Assume as chapter if the doi has hyphen in it.
        isChapter = identifierValue.includes('-');
      } else if (request.query.isbn) {
        identifierName = 'isbn';
        identifierValue = request.query.isbn;
      } else if (request.query.dac) {
        identifierName = 'dacKey';
        identifierValue = request.query.dac;
      } else {
        log.warn(
          'contentV2ProxyReqHandler Invalid Request:: request query ',
          request.query
        );
        response.status(404);
        response.send(
          `Missing either one the required query params doc, isbn and doi`
        );
        return;
      }
      // Derive the product type based on isChapter(derived from doi)
      const productType = isChapter ? 'chapters' : 'books';
      // Derive the Category code Based on the category Code we get in URL.
      const categoryType =
        request.params.categoryType === 'e' ? 'edit' : 'mono';

      // Derive the format Based on the format property in the request.
      const format = request.query.format;
      switch (format) {
        case 'pdf':
          contentType = isChapter ? 'chapterpdf' : 'webpdf';
          break;
        case 'googlePreviewPdf':
        case 'previewPdf':
          contentType = 'previewpdf';
          break;
        default:
          contentType = format ? format.toLowerCase() : 'previewpdf';
      }
      return response.redirect(
        301, // Moved Permanently
        this.getNewUrl(
          identifierName,
          identifierValue,
          contentType,
          productType,
          categoryType
        )
      );
    } catch (e) {
      log.error(e);
      throw e;
    }
  }

  // gets the UBX-website url corresponds to the requested product
  private getNewUrl(
    identifierName: string,
    identifierValue: string,
    contentType: string,
    productType: string,
    categoryType: string
  ): string {
    return (
      `${contentApiUrl}/${productType}/${categoryType}/download` +
      `?identifierName=${identifierName}` +
      `&identifierValue=${encodeURIComponent(identifierValue)}` +
      `&type=${contentType}`
    );
  }
}

export const contentProxyV2Router = new ContentProxyV2Router();
