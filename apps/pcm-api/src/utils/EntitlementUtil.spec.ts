import { expect } from 'chai';
import * as nock from 'nock';
import { URL } from 'url';

import { Config } from '../config/config';
import { entitlementUtils } from './EntitlementUtil';

const entitlementUrlV4: string = Config.getPropertyValue('entitlementUrlV4');

describe('EntitlementUtils', () => {
  const productId = 'some-id';
  const entitleUrl = new URL(entitlementUrlV4 + productId);
  const queryStr = entitleUrl.searchParams.get('productIds');
  const pathParams = entitleUrl.pathname + '?productIds=' + queryStr;
  describe('isEntitled', () => {
    it(`should return false when api version is 4.0.1 and fat api return
        entitleResponse as null`, () => {
      nock(entitleUrl.origin, {
        reqheaders: {
          Authorization: 'idtoken token'
        }
      })
        .get(pathParams)
        .reply(200, {
          entitledResponse: null
        });
      return entitlementUtils
        .isEntitled('some-partyId', productId, null, '4.0.1', null, 'token')
        .then((res) => expect(res).equal(false));
    });
    it(`should return false when api version is 4.0.1 and fat api return status
        code other than 200`, () => {
      nock(entitleUrl.origin, {
        reqheaders: {
          Authorization: 'idtoken token'
        }
      })
        .get(pathParams)
        .reply(401, {
          entitledResponse: []
        });
      return entitlementUtils
        .isEntitled('some-partyId', productId, null, '4.0.1', null, 'token')
        .then((res) => {
          expect(res).equal(false);
        });
    });
  });
});
