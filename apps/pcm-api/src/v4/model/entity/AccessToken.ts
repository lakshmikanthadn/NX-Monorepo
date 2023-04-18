import jwtDecode from 'jwt-decode';
import { get } from 'lodash';

/**
 * Decoded Token
 */
export default class AccessToken {
  private decodedToken: object;

  /**
   * @param  {string} token
   */
  constructor(token: string) {
    try {
      this.decodedToken = jwtDecode(token);
    } catch (e) {
      this.decodedToken = {};
    }
  }

  /**
   * Get the organization name from the token
   * @return {string}
   */
  get organizationName(): string {
    return get(this.decodedToken, 'user.organizationName', undefined);
  }

  /**
   * Get the IP embedded in the token
   * @return {string}
   */
  get ip(): string {
    return get(this.decodedToken, 'ip', undefined);
  }
}
