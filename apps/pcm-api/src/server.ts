const appEnv: string = process.env.NODE_ENV || 'dev';
import App from './app';
import { getAPISecretValues } from './v4/utils/SecretMangerUtils';

import { appLogger } from './utils/AppLoggerUtil';
import { initMongoDbConnection } from './v4/utils/MongoConnectionUtils';

const logger = appLogger.getLogger('Server');

async function startServer() {
  try {
    const secretData = await getAPISecretValues();
    await initMongoDbConnection(
      secretData.hubDbUsername,
      secretData.hubDbPassword,
      'hubDB',
      appEnv
    );
    await initMongoDbConnection(
      secretData.storeDbUsername,
      secretData.storeDbPassword,
      'storeDB',
      appEnv
    );
    const app = new App(secretData).app;
    const port = process.env.PORT || 3000;
    app.set('port', port);
    const server = app
      .listen(app.get('port'), () => {
        logger.info('Express server listening on port ' + app.get('port'));
      })
      .on('error', (err) => {
        logger.error('Cannot start server, port most likely in use');
        logger.error(err);
      });

    /**
     * TCP KEEP ALIVE settings
     * This is to enable the TCP keep alive feature.
     * tcp_keepalive_time/_interval/_probes values are set at ec2 level
     * using the ebextensions.
     */
    server.on('connection', (socket) => {
      // TODO: NODE jS is not picking tcp_keepalive_time, so manually setting the value
      // set initial delay to 0 so that node picks from default tcp_keepalive_time
      socket.setKeepAlive(true, 300 * 1000); // milliseconds
    });
    /**
     * HTTP KEEP ALIVE settings
     * Terminate TCP connection after 1 hour of inactivity
     */
    if (['dev', 'uat', 'qa'].includes(appEnv)) {
      server.keepAliveTimeout = 60 * 60 * 60 * 1000; // 30 minutes
      server.headersTimeout = 60 * 61 * 60 * 1000; // 31 minutes
      server.timeout = 60 * 60 * 60 * 1000; // milliseconds
    } else {
      server.keepAliveTimeout = 30 * 60 * 1000; // 30 minutes
      server.headersTimeout = 31 * 60 * 1000; // 31 minutes
      /**
       * Request timeout settings
       */
      // Keep this less than API Gateway timeout(30sec)
      server.timeout = 28 * 1000; // milliseconds
    }
  } catch (err) {
    logger.error(err);
    // comment
  }
}

startServer();
