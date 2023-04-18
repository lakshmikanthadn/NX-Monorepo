import { expect } from 'chai';
import * as log4js from 'log4js';
import * as sinon from 'sinon';

import Logger from './LoggerUtil';

const log = log4js.getLogger('className');
describe('CustomLogger', () => {
  describe('handleErrorLog', () => {
    it('should call logWarn when error name is AppError', () => {
      const error = { name: 'AppError' };
      const LoggerSpy = sinon.spy(log, 'warn');
      Logger.handleErrorLog(log, 'methodName', error);
      expect(LoggerSpy.calledOnce).to.equal(true);
    });
    it('should call logError when error name is not AppError', () => {
      const error = 'random-string';
      const LoggerSpy = sinon.spy(log, 'error');
      Logger.handleErrorLog(log, 'methodName', error);
      expect(LoggerSpy.calledOnce).to.equal(true);
    });
  });
});
