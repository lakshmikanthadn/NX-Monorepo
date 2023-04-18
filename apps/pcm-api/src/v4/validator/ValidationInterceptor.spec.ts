import { assert } from 'chai';
import { Request, Response } from 'express';
import * as mockExpressRequest from 'mock-express-request';
import * as mockExpressResponse from 'mock-express-response';
import * as sinon from 'sinon';

import { validationInterceptor } from './ValidationInterceptor';

function getStubData() {
  const request: Request = new mockExpressRequest();
  const response: Response = new mockExpressResponse();
  const responseMock = sinon.mock(response);
  return {
    request,
    response,
    responseMock
  };
}

describe('validationInterceptor', () => {
  describe('apiVersionAndResponseGroupValidator', () => {
    it('should proceed for next route when the request parameter are valid', () => {
      const stubData = getStubData();
      stubData.request.body = {};
      const nextSpy = sinon.spy();
      validationInterceptor.apiVersionAndResponseGroupValidator(
        stubData.request,
        stubData.response,
        nextSpy
      );
      assert(nextSpy.calledOnce);
    });
  });
});
