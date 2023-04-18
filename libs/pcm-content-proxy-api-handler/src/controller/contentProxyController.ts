import * as requestIp from 'request-ip';
import { Response, NextFunction } from 'express';

import DecodedToken from '../model/entity/decodedToken';
import AuthService from '../services/authService';
import { CustomExpressRequest } from '../model/interface/customExpressRequest';
import { TokenCacheService } from '../services/tokenCacheService';
import { ProxyOrgService } from '../services/proxyOrgService';

/**
 * ContentProxyHandler Module
 */
export default class ContentProxyController {
  private botOrgName: string;
  private requestIp = requestIp;
  /**
   * @param {AuthService} authService
   * @param {TokenCacheService} tokenCacheService
   * @param  {string} botOrgName
   */
  constructor(
    private authService: AuthService,
    private tokenCacheService: TokenCacheService,
    private proxyOrgService: ProxyOrgService,
    botOrgName: string
  ) {
    this.botOrgName = botOrgName;
    this.authService = authService;
    this.tokenCacheService = tokenCacheService;
  }

  /**
   * @param  {Request} req express request object
   * @param  {Response} res express response object
   * @param  {NextFunction} next express next function
   * @return {Promise<void>}
   */
  public async expressMiddleWare(
    req: CustomExpressRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    req.isBot = false;
    // The reason fo rusing the CF-Connecting-IP header is that
    // All the requests reaching the server are intercepted by CLOUDFLARE
    // So pick the CloudFlare Connecting IP address
    const clientIp =
      req.header('CF-Connecting-IP') ||
      req.header('cf-connecting-ip') ||
      this.requestIp.getClientIp(req);
    if (!clientIp) {
      next();
      return;
    }
    try {
      let token = this.tokenCacheService.getToken(clientIp);
      if (!token) {
        token = await this.authService.getToken(clientIp);
        this.tokenCacheService.setToken(clientIp, token);
      }
      req.headers.authorization = `idtoken ${token}`;
      const decodeToken = new DecodedToken(token);
      if (decodeToken.getOrganizationName() === this.botOrgName) {
        req.isBot = true;
      }
      req.hasAllContentAccess = await this.proxyOrgService.isPartyAllowed(
        decodeToken.getOrganizationId()
      );
      next();
    } catch (error) {
      res.status(500);
      res.send(JSON.stringify(error));
    }
  }
}
