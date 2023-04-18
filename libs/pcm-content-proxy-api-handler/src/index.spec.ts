import { expect } from 'chai';

import ContentProxyHandler from './index';
import { testContentProxyHandlerConfig } from './test/data';

describe('ContentProxyHandler index', () => {
  it('should return a middleware function', () => {
    const contentProxyHandler = new ContentProxyHandler(
      testContentProxyHandlerConfig
    );
    expect(contentProxyHandler.getExpressMiddleWare()).to.be.an('Function');
  });
});
