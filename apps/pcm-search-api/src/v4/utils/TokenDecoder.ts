import jwtDecode from 'jwt-decode';

import { get } from 'lodash';

export interface tokenModel {
  ip: String;
  user?: {
    _id?: String;
    email?: String;
    organizationId?: String;
    organizationName?: String;
    userType?: String;
    username?: String;
    name?: String;
    partyId?: String;
  };
  client?: {
    _id?: String;
    username?: String;
    name?: String;
    clientId?: String;
  };
}

export default class TokenDecoder {
  private _decodedToken: tokenModel;

  constructor(token: string) {
    try {
      this._decodedToken = jwtDecode(token);
    } catch (e) {
      this._decodedToken = {} as tokenModel;
    }
  }
  public getTokenIdentity(): string {
    const client = get(this._decodedToken, 'client', undefined);
    if (client) {
      return client.username ? client.username : client.name;
    }
    const user = get(this._decodedToken, 'user', undefined);
    if (user) {
      if (user.organizationName && user.organizationName != '') {
        return user.organizationName;
      }
      if (this._decodedToken.ip != '') {
        return `annonymous - ${
          user.username && user.username != ''
            ? user.username
            : this._decodedToken.ip
        }`;
      }
      return 'annonymous';
    }
    return undefined;
  }
}
