// eslint-disable-next-line max-len
import { ContentProxyHandlerConfig } from './model/interface/contentProxyHandlerConfig';
import AuthService from './services/authService';
import ContentProxyController from './controller/contentProxyController';
import { RequestHandler } from 'express';
import { TokenCacheService } from './services/tokenCacheService';
import { ProxyOrgService } from './services/proxyOrgService';

// eslint-disable-next-line max-len
export { ContentProxyHandlerConfig } from './model/interface/contentProxyHandlerConfig';
/**
 * ContentProxyHandler Module
 */
export class ContentProxyHandler {
  private contentProxyController: ContentProxyController;

  /**
   * @param  {ContentProxyHandlerConfig} config
   */
  constructor(config: ContentProxyHandlerConfig) {
    this.contentProxyController = new ContentProxyController(
      new AuthService(
        config.clientID,
        config.clientSecret,
        config.authTokenAPIUrl
      ),
      new TokenCacheService(),
      new ProxyOrgService(config.propertiesAPIUrl),
      config.botOrgName || ''
    );
  }

  /**
   * @return {RequestHandler}
   */
  public getExpressMiddleWare(): RequestHandler {
    return this.contentProxyController.expressMiddleWare.bind(
      this.contentProxyController
    );
  }
}

export default ContentProxyHandler;
