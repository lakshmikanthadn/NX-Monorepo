// eslint-disable-next-line @typescript-eslint/no-var-requires
const nock = require('nock');
import { expect } from 'chai';
import { URL } from 'url';

import * as testData from '../test/data';
import AuthService from '../services/authService';

describe('AuthService', () => {
  const testAuthTokenAPIUrl = new URL(testData.testAuthTokenAPIUrl);
  describe('getToken', () => {
    it(
      'should return a token when IAM service returns' + ' a success response',
      async () => {
        const authService: AuthService = new AuthService(
          testData.testClientID,
          testData.testClientSecret,
          testData.testAuthTokenAPIUrl
        );
        nock(testAuthTokenAPIUrl.origin)
          .post(testAuthTokenAPIUrl.pathname)
          .reply(200, { id_token: testData.testUserIPToken });
        const token = await authService.getToken(testData.testIP);
        expect(token).to.equal(testData.testUserIPToken);
      }
    );

    it(
      'should throw error when IAM service returns' + ' a 403 error response',
      (done) => {
        const authService: AuthService = new AuthService(
          testData.testClientID,
          testData.testClientSecret,
          testData.testAuthTokenAPIUrl
        );
        nock(testAuthTokenAPIUrl.origin)
          .post(testAuthTokenAPIUrl.pathname)
          .reply(403, {});
        authService
          .getToken(testData.testIP)
          .then(() => {
            done(new Error('Expected Error, got Success'));
          })
          .catch((error) => done());
      }
    );

    it(
      'should throw error when IAM service returns' + ' a 404 error response',
      (done) => {
        const authService: AuthService = new AuthService(
          testData.testClientID,
          testData.testClientSecret,
          testData.testAuthTokenAPIUrl
        );
        nock(testAuthTokenAPIUrl.origin)
          .post(testAuthTokenAPIUrl.pathname)
          .reply(404, {});
        authService
          .getToken(testData.testIP)
          .then(() => {
            done(new Error('Expected Error, got Success'));
          })
          .catch((error) => done());
      }
    );
  });
});
