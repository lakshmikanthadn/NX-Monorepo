// eslint-disable-next-line @typescript-eslint/no-var-requires
const MockExpressRequest = require('mock-express-request');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const MockExpressResponse = require('mock-express-response');
import { Response } from 'express';
import { expect } from 'chai';
import { mock, spy } from 'sinon';

import ContentProxyController from './contentProxyController';
import * as testData from '../test/data';
import AuthService from '../services/authService';
import { CustomExpressRequest } from '../model/interface/customExpressRequest';
import { TokenCacheService } from '../services/tokenCacheService';
import { ProxyOrgService } from '../services/proxyOrgService';

describe('ContentProxyController', () => {
  describe('expressMiddleWare', () => {
    let contentProxyController: ContentProxyController;
    let request: CustomExpressRequest;
    let response: Response;
    let authService: AuthService;
    let proxyOrgService: ProxyOrgService;
    let tokenCacheService: TokenCacheService;
    beforeEach(() => {
      request = new MockExpressRequest({
        headers: {
          'CF-Connecting-IP': testData.testIP,
          'X-Client-IP': '11.22.33.44',
          'X-Forwarded-For': '1.2.3.4'
        }
      });
      response = new MockExpressResponse();
      authService = testData.getTestAuthService();
      proxyOrgService = testData.getProxyOrgService();
      tokenCacheService = new TokenCacheService();
      contentProxyController = new ContentProxyController(
        authService,
        tokenCacheService,
        proxyOrgService,
        testData.testBotOrgName
      );
    });

    it('should set the token in the request headers', (done) => {
      const authServiceMock = mock(authService);
      authServiceMock
        .expects('getToken')
        .withArgs(testData.testIP)
        .once()
        .resolves(testData.testBotIPToken);
      contentProxyController.expressMiddleWare(request, response, () => {
        authServiceMock.verify();
        expect(request.headers.authorization).to.equal(
          `idtoken ${testData.testBotIPToken}`
        );
        authServiceMock.restore();
        done();
      });
    });

    it(
      'should store the token in cache and and set in the request header' +
        ' after retrieving from server',
      (done) => {
        const authServiceMock = mock(authService);
        const tokenCacheServiceSpy = spy(tokenCacheService, 'setToken');
        authServiceMock
          .expects('getToken')
          .withArgs(testData.testIP)
          .once()
          .resolves(testData.testBotIPToken);
        contentProxyController.expressMiddleWare(request, response, () => {
          authServiceMock.verify();
          expect(
            tokenCacheServiceSpy.withArgs(
              testData.testIP,
              testData.testBotIPToken
            ).calledOnce
          ).to.be.true;
          expect(tokenCacheService.getToken(testData.testIP)).to.equal(
            testData.testBotIPToken
          );
          expect(request.headers.authorization).to.equal(
            `idtoken ${testData.testBotIPToken}`
          );
          authServiceMock.restore();
          tokenCacheServiceSpy.restore();
          done();
        });
      }
    );

    it(
      'should get token from cache and set in the request header' +
        ' when token is present in cache',
      (done) => {
        const authServiceMock = mock(authService);
        tokenCacheService.setToken(testData.testIP, testData.testBotIPToken);
        const tokenCacheServiceSpy = spy(tokenCacheService, 'getToken');
        authServiceMock.expects('getToken').withArgs(testData.testIP).never();
        contentProxyController.expressMiddleWare(request, response, () => {
          authServiceMock.verify();
          expect(tokenCacheServiceSpy.withArgs(testData.testIP).calledOnce).to
            .be.true;
          expect(request.headers.authorization).to.equal(
            `idtoken ${testData.testBotIPToken}`
          );
          authServiceMock.restore();
          tokenCacheServiceSpy.restore();
          done();
        });
      }
    );

    it(
      'should set null as token in the authorization header ' +
        'when there is no IP in the request',
      (done) => {
        request.headers = {};
        const authServiceMock = mock(authService);
        authServiceMock.expects('getToken').never();
        contentProxyController.expressMiddleWare(request, response, () => {
          authServiceMock.verify();
          expect(request.isBot).to.be.false;
          expect(request.headers.authorization).to.equal(undefined);
          authServiceMock.restore();
          done();
        });
      }
    );

    it(
      'should set token and set isBot true ' +
        'when token from IAM is Bot Token',
      (done) => {
        const authServiceMock = mock(authService);
        authServiceMock
          .expects('getToken')
          .withArgs(testData.testIP)
          .once()
          .resolves(testData.testBotIPToken);
        contentProxyController.expressMiddleWare(request, response, () => {
          authServiceMock.verify();
          expect(request.isBot).to.be.true;
          expect(request.headers.authorization).to.equal(
            `idtoken ${testData.testBotIPToken}`
          );
          authServiceMock.restore();
          done();
        });
      }
    );
    it(
      'should set token and set isBot false ' +
        'when token from IAM is user Token',
      (done) => {
        const authServiceMock = mock(authService);
        authServiceMock
          .expects('getToken')
          .withArgs(testData.testIP)
          .once()
          .resolves(testData.testUserIPToken);
        contentProxyController.expressMiddleWare(request, response, () => {
          authServiceMock.verify();
          expect(request.isBot).to.be.false;
          expect(request.headers.authorization).to.equal(
            `idtoken ${testData.testUserIPToken}`
          );
          authServiceMock.restore();
          done();
        });
      }
    );
  });
});
