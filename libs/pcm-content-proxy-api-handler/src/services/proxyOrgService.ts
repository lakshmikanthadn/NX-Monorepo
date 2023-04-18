import BaseService from './baseService';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetch = require('node-fetch');
/**
 * Proxy ORG Service
 * To get the Orgnization/Parties Detials to enable in Proxy API.
 * Also this will cache the parties data and will refresh every 24 hours.
 */
export class ProxyOrgService extends BaseService {
  /**
   * @param {string} Properrties URL to get the Parties
   * @param {number} ttl standard time to live in seconds. 0 = infinity
   * @param {number} checkPeriod time in seconds to check n delete expired keys
   */
  constructor(
    private propertiesApiUrl: string,
    ttl: number = 24 * 60 * 60, // 24 hours
    checkPeriod: number = 60 * 60 // Every hour
  ) {
    super(ttl, checkPeriod);
  }

  /**
   * Fetches list of party ids that are allowed in Proxy API via properties API
   * @return {Promise<string>} returns a JWT token
   */
  public async fetchAllowedParties(): Promise<string[]> {
    try {
      const parties = await fetch(this.propertiesApiUrl, {
        headers: { 'ignore-auth': true },
        method: 'get'
      })
        .then(this.checkFetchResStatus)
        .then((res: any) => res.json())
        .then((resJson: any) => resJson.data.parties);
      return parties;
    } catch (error) {
      return [];
    }
  }

  /**
   * To get the allowed parties
   * @return {string[]} list of party ids that are allowed in Proxy API
   */
  public async getAllowedParties(): Promise<string[]> {
    const partiesCached: string[] = this.cache.get('parties') || [];
    if (partiesCached && partiesCached.length > 0) {
      return partiesCached;
    } else {
      const partiesFecthed = await this.fetchAllowedParties();
      this.cache.set('parties', partiesFecthed);
      return partiesFecthed;
    }
  }

  /**
   * Checks if the party id is allowed to access the API.
   * @param {string} partyId Party ID to verify
   * @return {boolean} boolean
   */
  public async isPartyAllowed(partyId: string): Promise<boolean> {
    const partiesAllowed = await this.getAllowedParties();
    const partyAllowed = partiesAllowed.includes(partyId?.toString());
    return partyAllowed;
  }
}
