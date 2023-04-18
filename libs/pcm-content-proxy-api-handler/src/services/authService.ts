import get from 'lodash.get';
// Load the module via require until the stabilization of ES modules in node.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fetch = require('node-fetch');

/**
 * AUTH SERVICE MODULE
 */
export default class AuthService {
  /**
   * @param {string} clientID client id of the APP/CLIENT
   * @param {string} clientSecret client secret of the APP/CLIENT
   * @param {string} authAPIUrl auth api url to get a token
   */
  constructor(
    private clientID: string,
    private clientSecret: string,
    private authTokenAPIUrl: string
  ) {}

  /**
   * Returns a IP based token
   * @param {string} clientIp of the user to get token
   * @return {Promise<string>} returns a JWT token
   */
  public async getToken(clientIp: string): Promise<string> {
    const reqBody = {
      client_id: this.clientID,
      client_secret: this.clientSecret,
      grant_type: 'ip'
    };
    const token = await fetch(this.authTokenAPIUrl, {
      body: JSON.stringify(reqBody),
      headers: { 'Content-Type': 'application/json', clientip: clientIp },
      method: 'post'
    })
      .then(this.checkFetchResStatus)
      .then((res: any) => res.json())
      .then((tokenData: any) => get(tokenData, 'id_token'));
    return token;
  }

  /**
   * To handle the fetch module response from
   * using any type for param and return type for simplicity.
   * @param  {any} res
   * @return {any}
   */
  private checkFetchResStatus(res: any): any {
    if (res.ok) {
      // res.status >= 200 && res.status < 300
      return res;
    } else {
      throw new Error(res.statusText);
    }
  }
}
