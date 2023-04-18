import NodeCache from 'node-cache';

/**
 * base Service to use it with Proxy ORG service and TOken Service
 * Hold the cache to cahce data
 */
export default class BaseService {
  public cache: NodeCache;
  /**
   *
   * @param {number} ttl standard time to live in seconds. 0 = infinity
   * @param {number} checkPeriod time in seconds to check n delete expired keys
   */
  constructor(
    ttl: number = 12 * 60 * 60, // default 4 Hours
    checkPeriod: number = 60 * 60 // default 1 hour mins
  ) {
    this.cache = new NodeCache({
      checkperiod: checkPeriod,
      stdTTL: ttl
    });
  }

  /**
   * This will be used to check the Fetch API response
   * @param {any} res
   * @return {any} res
   */
  protected checkFetchResStatus(res: any): any {
    if (res.ok) {
      // res.status >= 200 && res.status < 300
      return res;
    } else {
      throw new Error(res.statusText);
    }
  }
}
