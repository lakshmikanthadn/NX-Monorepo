import * as log4js from 'log4js';

export default class Logger {
  public static loggers = {};
  public static getLogger(className) {
    if (!this.loggers[className]) {
      const logger = log4js.getLogger(className);
      this.loggers[className] = logger;
    }
    return this.loggers[className];
  }

  public static handleErrorLog(log, methodName: string, error) {
    if (error.name === 'AppError') {
      log.warn(methodName, error);
    } else {
      log.error(methodName, error);
    }
  }
}
