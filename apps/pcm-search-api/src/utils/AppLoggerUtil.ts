import * as rTracer from 'cls-rtracer';
import { Request, Response } from 'express';
import * as jwtDecode from 'jwt-decode';
import * as _ from 'lodash';
import * as log4js from 'log4js';
import * as requestIp from 'request-ip';
import TokenDecoder from '../v4/utils/TokenDecoder';

import { Config } from '../config/config';

const logger = log4js.getLogger('AppLogger');
/**
 * Configure the log4js.
 * 1
 */
class AppLogger {
  constructor(appEnv) {
    this.configure(appEnv);
  }

  public getLogger(loggerName) {
    return log4js.getLogger(loggerName);
  }

  /**
   * This will return a express middleware
   * Middleware Logs token details and the request details.
   *
   */
  public getRequestInfoLogger() {
    return (req, res, next) => {
      const thiz = this;
      // Express won't trigger the finish event if we don't use res.send method,
      // so using setTimeout method. if "finish" event is not fired we will log it after 30 sec.
      const timer = setTimeout(() => {
        thiz.logRequestInfo(req, res);
      }, 30 * 1000);
      res.on('finish', () => {
        clearTimeout(timer);
        thiz.logRequestInfo(req, res);
      });
      next();
    };
  }

  private logRequestInfo(req: Request, res: Response) {
    let decodedJwt: any = {};
    let authHeaderToken: string;
    try {
      authHeaderToken = _.get(req, 'headers.authorization', '').replace(
        'idtoken ',
        ''
      );
      decodedJwt = jwtDecode(authHeaderToken);
    } catch (e) {
      logger.debug('logRequestInfo Unable to decode auth header.');
    }
    const completePath = req.originalUrl.split('?')[0];
    // results first element as empty.
    const completePathSplitted = completePath.split('/');
    // remove the empty string
    completePathSplitted.shift();
    // Get the BasePath prepend with /.
    const basePath = '/' + completePathSplitted.shift();
    // Get the Path by join and prepend with /.
    const path = '/' + completePathSplitted.join('/');
    /**
     * Do not add any JSON properties to respLogData
     * stringify them before,
     * Else they will create too many index fields in ELK stack.
     */
    const headers = _.clone(req.headers);
    delete headers['authorization'];
    const requestData = {
      action: req.body.action || 'NA',
      apiVersion: req.query.apiVersion || req.body.apiVersion || '4.0.0',
      authToken: decodedJwt,
      basePath,
      body: JSON.stringify(req.body),
      headers,

      ip: requestIp.getClientIp(req),

      method: req.method,

      // For service account organizationName is null so using partyId
      organizationName: new TokenDecoder(authHeaderToken).getTokenIdentity(),
      path,
      query: req.query,
      referrer: req.headers.referer || req.headers.referrer,
      remoteAddress: req.connection.remoteAddress || req.socket.remoteAddress,
      statusCode: res.statusCode,
      took: Number.parseFloat(
        res.getHeader('X-Response-Time')?.toString()?.replace('ms', '')
      ),
      userAgent: req.headers['user-agent'],
      username: decodedJwt?.user?.username || decodedJwt?.client?.username
    };
    logger.info(`logRequestInfo request:${JSON.stringify(requestData)}`);
  }

  private configure(appEnv: string) {
    const logLayout = {
      pattern: '%d %p %c %x{reqId} %m%n',
      tokens: {
        reqId() {
          // Return 00000000-0000-0000-0000-000000000000 as transaction id.
          // Just a random UUID using this
          return rTracer.id() || '00000000-0000-0000-0000-000000000000';
        }
      },
      type: 'pattern'
    };
    const LOG4JS_CONFIG = {
      appenders: {
        consoleAppender: {
          layout: logLayout,
          type: 'console'
        },
        fileAppender: {
          // 100 MB
          backups: 1,

          compress: true,

          filename: `${Config.getPropertyValue('logPath')}/app.log`,
          layout: logLayout,
          maxLogSize: 100 * 1024 * 1024,
          type: 'file'
        }
      },
      categories: {
        default: {
          appenders: ['fileAppender'],
          level: 'info'
        }
      }
    };
    // For better performance, disable console logs in PROD.
    if (['local', 'test'].includes(appEnv)) {
      console.log('Configuring log4js for local and test environment.');
      LOG4JS_CONFIG.categories.default.level = 'info';
      LOG4JS_CONFIG.categories.default.appenders = ['consoleAppender'];
    }
    log4js.configure(LOG4JS_CONFIG);
  }
}

export const appLogger = new AppLogger(process.env.NODE_ENV);
