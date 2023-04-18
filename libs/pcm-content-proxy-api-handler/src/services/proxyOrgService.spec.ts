// eslint-disable-next-line @typescript-eslint/no-var-requires
const nock = require('nock');
import { expect } from 'chai';
import * as testData from '../test/data';
import { URL } from 'url';
import * as sinon from 'sinon';
import { ProxyOrgService } from './proxyOrgService';

describe('ProxyOrgService', () => {
  const propertiesApiUrl = new URL(testData.propertiesApiUrl);
  const ttl: number = 24 * 60 * 60; // 24 hours
  const checkPeriod: number = 60 * 60;
  describe('getAllowedParties', () => {
    it('should have property cache when proxyOrgService is initiated', () => {
      const proxyOrgService = new ProxyOrgService(testData.propertiesApiUrl);
      expect(proxyOrgService).to.have.property('cache');
    });
    it('should have empty cache when proxyOrgService is initiated ', () => {
      const proxyOrgService = new ProxyOrgService(
        testData.propertiesApiUrl,
        ttl,
        checkPeriod
      );
      const parties = proxyOrgService.cache.get('parties');
      expect(parties).to.equal(undefined);
    });
    it('should return allowed parties from fetchAllowedParties for proxy API', (done) => {
      const proxyOrg = new ProxyOrgService(
        testData.propertiesApiUrl,
        ttl,
        checkPeriod
      );
      const proxyServiceMock = sinon.mock(proxyOrg);
      proxyServiceMock
        .expects('fetchAllowedParties')
        .once()
        .withArgs()
        .resolves(testData.parties);
      proxyOrg
        .getAllowedParties()
        .then((parties) => {
          expect(parties).to.equal(testData.parties);
          proxyServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          proxyServiceMock.restore();
        });
    });

    it('should cache allowed parties when cache is empty ', (done) => {
      const proxyOrgService = new ProxyOrgService(
        testData.propertiesApiUrl,
        ttl,
        checkPeriod
      );
      const proxyServiceMock = sinon.mock(proxyOrgService);
      proxyServiceMock
        .expects('fetchAllowedParties')
        .once()
        .withArgs()
        .resolves(testData.parties);
      proxyOrgService
        .getAllowedParties()
        .then((parties) => {
          const cachedparties = proxyOrgService.cache.get('parties');
          expect(cachedparties).to.deep.equal(testData.parties);
          proxyServiceMock.verify();
          done();
        })
        .catch((err) => {
          done(err);
        })
        .finally(() => {
          proxyServiceMock.restore();
        });
    });
    it('should return allowed parties for cache', async () => {
      const proxyOrgService = new ProxyOrgService(
        testData.propertiesApiUrl,
        ttl,
        checkPeriod
      );
      const proxyServiceMock = sinon.mock(proxyOrgService);
      const allParties = ['123562'];
      proxyOrgService.cache.set('parties', allParties);
      proxyServiceMock.expects('fetchAllowedParties').never();
      proxyOrgService.getAllowedParties().then((parties) => {
        expect(parties).to.equal(allParties);
      });
    });
  });
  describe('fetchAllowedParties', () => {
    it('should fetch all the allowed party ids', async () => {
      const proxyService: ProxyOrgService = new ProxyOrgService(
        testData.propertiesApiUrl,
        ttl,
        checkPeriod
      );
      const responseData = {
        data: {
          parties: testData.parties
        },
        metadata: {
          message: 'success',
          status: 'success'
        }
      };
      nock(propertiesApiUrl.origin)
        .get(propertiesApiUrl.pathname)
        .reply(200, responseData);
      const parties = await proxyService.fetchAllowedParties();
      expect(parties).to.deep.equal(testData.parties);
    });
  });
  describe('isPartyAllowed', () => {
    it('should check if party id is allowed to access the api', async () => {
      const proxyOrg = new ProxyOrgService(
        testData.propertiesApiUrl,
        ttl,
        checkPeriod
      );
      const proxyServiceMock = sinon.mock(proxyOrg);
      proxyServiceMock
        .expects('getAllowedParties')
        .once()
        .withArgs()
        .resolves(testData.parties);
      const result = await proxyOrg.isPartyAllowed('1822334');
      expect(result).to.equal(true);
    });
  });
});
