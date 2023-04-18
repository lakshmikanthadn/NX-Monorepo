import { expect } from 'chai';

import DecodedToken from './decodedToken';
import * as testData from '../../test/data';

describe('DecodedToken', () => {
  it(
    'should decode the token and return the organization name' +
      ' from Bot Token',
    () => {
      const decodedToken = new DecodedToken(testData.testBotIPToken);
      expect(decodedToken.getOrganizationName()).to.equal('Google Scholar Bot');
    }
  );
  it(
    'should decode the token and return the organization name' +
      ' from user Token',
    () => {
      const decodedToken = new DecodedToken(testData.testUserIPToken);
      expect(decodedToken.getOrganizationName()).to.equal(
        'Taylor And Francis Group'
      );
    }
  );
  it('should throw error when the token is invalid', (done) => {
    try {
      new DecodedToken('invalid.jwt.token');
      done(new Error('Expected error, but got success'));
    } catch (error) {
      done();
    }
  });
});
