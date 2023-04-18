import jwtDecode from 'jwt-decode';
import get from 'lodash.get';

/**
 * Decoded Token
 */
export default class DecodedToken {
  private _decodedToken: object;

  /**
   * @param  {string} token
   */
  constructor(token: string) {
    try {
      this._decodedToken = jwtDecode(token);
    } catch (e) {
      this._decodedToken = {};
      throw e;
    }
  }

  /**
   * Get the organization name from the token
   * @return {string}
   */
  public getOrganizationName(): string {
    return get(this._decodedToken, 'user.organizationName', undefined);
  }

  /**
   * Get the organization name from the token
   * @return {string}
   */
  public getOrganizationId(): string {
    return get(this._decodedToken, 'user.organizationId', undefined);
  }
}
