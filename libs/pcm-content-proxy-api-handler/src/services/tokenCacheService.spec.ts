import * as testData from '../test/data';
import { expect } from 'chai';
import { TokenCacheService } from './tokenCacheService';

const ipTokenMap = [
  {
    ip: '127.0.0.1',
    token: testData.testBotIPToken
  },
  {
    ip: '130.117.124.10',
    token: testData.testUserIPToken
  },
  {
    ip: '203.192.253.96',
    token: '123a.dummy.token45'
  }
];

describe('TokenCacheService', () => {
  describe('getToken', () => {
    it('it should cache the token and should return when requested', () => {
      const ipTokenData = ipTokenMap[0];
      const tokenCacheService = new TokenCacheService();
      const success = tokenCacheService.setToken(
        ipTokenData.ip,
        ipTokenData.token
      );
      expect(success).to.be.true;
      const cachedToken = tokenCacheService.getToken(ipTokenData.ip);
      expect(cachedToken).to.equal(testData.testBotIPToken);
    });
    it('it should cache all the token and should return when requested', () => {
      const tokenCacheService = new TokenCacheService();
      ipTokenMap.forEach((ipTokenData) => {
        const success = tokenCacheService.setToken(
          ipTokenData.ip,
          ipTokenData.token
        );
        expect(success).to.be.true;
      });
      ipTokenMap.forEach((ipTokenData) => {
        const cachedToken = tokenCacheService.getToken(ipTokenData.ip);
        expect(cachedToken).to.equal(ipTokenData.token);
      });
    });

    it('it should return undefined if tokens are expired (TTL=4sec)', (done) => {
      const ttl = 4; // seconds
      const checkPeriod: number = 5 * 60;
      const tokenCacheService = new TokenCacheService(ttl, checkPeriod);
      ipTokenMap.forEach((ipTokenData) => {
        const success = tokenCacheService.setToken(
          ipTokenData.ip,
          ipTokenData.token
        );
        expect(success).to.be.true;
      });
      setTimeout(() => {
        ipTokenMap.forEach((ipTokenData) => {
          const cachedToken = tokenCacheService.getToken(ipTokenData.ip);
          expect(cachedToken).to.equal(undefined);
        });
        done();
      }, (ttl + 1) * 1000);
    });
  });
});
