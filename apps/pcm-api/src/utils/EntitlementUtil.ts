import axios, { AxiosError, AxiosResponse } from 'axios';
import { Config } from '../config/config';
import Logger from './LoggerUtil';
const log = Logger.getLogger('EntitlementUtils');

export interface IEntitlementUtils {
  isEntitled(
    partyId: string,
    productId: string,
    organizationId: string
  ): Promise<boolean>;
}

class EntitlementUtils {
  public async isEntitled(
    partyId: string,
    productId: string,
    organizationId: string,
    apiVersion = '4.0.0',
    render?: boolean,
    token?: string,
    ip?: string
  ): Promise<boolean> {
    try {
      let url: string;
      let config;
      const entitlementUrlV4: string =
        Config.getPropertyValue('entitlementUrlV4');
      log.debug(`isEntitled::`, { organizationId, partyId, productId, render });
      if (apiVersion === '4.0.1' && entitlementUrlV4) {
        url = entitlementUrlV4 + productId;
        config = {
          headers: {
            Authorization: 'idtoken ' + token,
            'Content-Type': 'application/json'
          },
          method: 'GET'
        };
      } else {
        if (partyId && organizationId) {
          url =
            Config.getPropertyValue('entitlementUrl') +
            '?customerId=' +
            partyId +
            '&orgId=' +
            organizationId +
            '&productId=' +
            productId;
        } else {
          url =
            Config.getPropertyValue('entitlementUrl') +
            '?customerId=' +
            (!partyId ? organizationId : partyId) +
            '&productId=' +
            productId;
        }
        config = {
          headers: {
            'Content-Type': 'application/json',
            'ignore-auth': 'true'
          },
          method: 'GET'
        };
      }
      let response: AxiosResponse;
      // log error only if error status code is not 401 or 403
      try {
        response = await axios(url, config);
      } catch (e) {
        if (this.shouldLogEntitlementAPIError(e)) {
          log.error(`isEntitled:: ERROR while calling entitlement API: ${e}`);
        } else {
          log.warn(
            `isEntitled:: Entitlement API response: ${{
              e,
              token
            }}`
          );
        }
        return false;
      }
      const json = response.data;
      // for 4.0.1
      if (apiVersion === '4.0.1') {
        if (!json.entitledResponse || response.status !== 200) {
          log.warn(
            `isEntitled:: Entitlement Check failure ip:${ip} url: ${url} response:${response} token:${token}`
          );
          return false;
        }
        const view = entitlementUrlV4 ? 'view' : 'View';
        const download = entitlementUrlV4 ? 'download' : 'Download';

        const grantTypes = entitlementUrlV4
          ? json.entitledResponse[0]
            ? json.entitledResponse[0].grantTypes
            : []
          : json.grantTypes;
        const validView =
          grantTypes && grantTypes.includes(view) && render === true;
        const validDownload =
          grantTypes && grantTypes.includes(download) && render === false;
        return response.status === 200 && (validView || validDownload)
          ? true
          : false;
      } else {
        // for 4.0.0
        return json.metaData.code === 200 &&
          json.grantTypes.indexOf('View') > -1
          ? true
          : false;
      }
    } catch (err) {
      log.error(`isEntitled:: ERROR: ${err}`);
      // Do not throw error handle the error here and return false.
      return false;
    }
  }

  /**
   * This method returns true if 403 and 401 error responses are returned by the entitlement API
   * @param statusCode error status code returned by entitlement API
   * @returns boolean
   */
  private isAccessError(statusCode: number): boolean {
    return statusCode === 401 || statusCode === 403 ? true : false;
  }

  private shouldLogEntitlementAPIError(e: AxiosError): boolean {
    return !e.response ||
      !e.response.status ||
      !this.isAccessError(e.response.status)
      ? true
      : false;
  }
}

export const entitlementUtils = new EntitlementUtils();
