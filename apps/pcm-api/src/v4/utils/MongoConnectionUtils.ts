import * as mongoose from 'mongoose';
import Logger from '../../utils/LoggerUtil';

import { Config } from '../../config/config';

const logger = Logger.getLogger('CONN-UTIL');
let hubDBConnection = mongoose.connection;

export async function initMongoDbConnection(
  dbUserName: string,
  dbUserPass: string,
  dbType,
  appEnv: string
) {
  let storeDbHost = Config.getPropertyValue('storeDbHost');
  const hubDbHost = Config.getPropertyValue('hubDbHost');
  // This code is to connect-to dev/uat/prod/qa MONGO-DB from local machine
  // this helps connecting to MONGO DB through jump server.
  if (process.env.MONGO_USE_JUMP_SERVER === 'true') {
    storeDbHost = Config.getPropertyValue('storeDbHostJumpServer');
  }

  // if env is local then NO-NEED to fetch DB-cred's from secret manager.
  if (appEnv === 'local') {
    if (dbType == 'hubDB') {
      setMongooseHubDBConnection(`mongodb://${hubDbHost}`);
    } else return setMongooseDefaultConnection(`mongodb://${storeDbHost}`);
  } else {
    let dbConnectionString;
    if (dbType == 'hubDB') {
      logger.info('Connecting to ATLAS hubDB:', hubDbHost);
      dbConnectionString = `mongodb+srv://${dbUserName}:${dbUserPass}@${hubDbHost}?retryWrites=true&w=majority&readPreference=secondary`;
      return setMongooseHubDBConnection(dbConnectionString);
    } else {
      logger.info('Connecting to ATLAS storeDB:', storeDbHost);
      dbConnectionString = `mongodb+srv://${dbUserName}:${dbUserPass}@${storeDbHost}?retryWrites=true&w=majority&readPreference=secondary`;
      return setMongooseDefaultConnection(dbConnectionString);
    }
  }
}

async function setMongooseDefaultConnection(
  connectionUrl: string
): Promise<any> {
  logger.info('Connecting to Store db');
  const connectionOptions = {
    poolSize: 100,
    serverSelectionTimeoutMS: 10 * 1000,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
  };
  mongoose.connection.on('connected', () => {
    logger.info('Mongoose default connection is open.');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('Mongoose default connection has occurred ' + err + ' error');
  });

  mongoose.connection.on('disconnected', () => {
    logger.error('Mongoose default connection is disconnected');
  });
  process.on('SIGINT', () => {
    console.log(
      'Mongoose default connection is disconnected due to application termination'
    );
    console.log('Process exited. writing all the logs.');
    mongoose.connection.close(() => {
      logger.shutdown();
      process.exit(0);
    });
  });
  return mongoose.connect(connectionUrl, connectionOptions);
}

async function setMongooseHubDBConnection(connectionUrl: string): Promise<any> {
  logger.info('Connecting to Hub db');
  const connectionOptions = {
    poolSize: 100,
    serverSelectionTimeoutMS: 10 * 1000,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
  };
  hubDBConnection = await mongoose.createConnection(
    connectionUrl,
    connectionOptions
  );
  return hubDBConnection;
}

export { hubDBConnection };
