import NodeCache from 'node-cache';

/**
 * Token Cache
 */
export class TokenCacheService {
  private tokenCache: NodeCache;
  /**
   *
   * @param {number} ttl standard time to live in seconds. 0 = infinity
   * @param {number} checkPeriod time in seconds to check n delete expired keys
   */
  constructor(
    ttl: number = 45 * 60, // default 45 mins
    checkPeriod: number = 5 * 60 // default 5 mins
  ) {
    this.tokenCache = new NodeCache({
      checkperiod: checkPeriod,
      stdTTL: ttl
    });
  }

  /**
   * get the token from cache
   *
   * @param {string} ip IP as a key
   * @return {string} token
   */
  public getToken(ip: string): string | undefined {
    return this.tokenCache.get(ip);
  }

  /**
   * Set the token against an IP
   *
   * @param {string} ip IP as a Key
   * @param {string} token token to be stored against IP
   * @return {boolean}
   */
  public setToken(ip: string, token: string): boolean {
    return this.tokenCache.set(ip, token);
  }
}
