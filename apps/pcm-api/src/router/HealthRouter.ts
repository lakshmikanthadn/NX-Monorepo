import { Request, Response } from 'express';
import * as fs from 'fs';
import * as mongoose from 'mongoose';
import * as swaggerUi from 'swagger-ui-express';

import { Config } from '../config/config';
import * as openApiV401 from '../public/swagger/4.0.x.json';
import { BaseRouter } from './BaseRouter';

const swaggerOptions = {
  defaultModelsExpandDepth: -1
};

class HealthRouter extends BaseRouter {
  constructor() {
    super();
  }

  protected initRoutes(): void {
    this.router.get('/health', (req: Request, res: Response) => {
      if (mongoose.connection.readyState === 1) {
        res.send({
          APPLICATION_STATUS: 'I am healthy.'
        });
      } else {
        res.status(503).send({
          APPLICATION_STATUS: 'Unhealthy, not connected to Mongo DB.'
        });
      }
    });

    this.router.get('/products/health', (req: Request, res: Response) => {
      try {
        const rawAppManifestData = JSON.parse(
          fs.readFileSync('ApplicationManifest.json', 'utf8')
        );
        const appManifestData = {
          APPLICATION_ENV: Config.getPropertyValue('envName'),
          APPLICATION_NAME: rawAppManifestData.APPLICATION_NAME,
          APPLICATION_STATUS: 'Healthy.',
          APPLICATION_VERSION: rawAppManifestData.APPLICATION_VERSION,
          BUILD_DATE_TIME: rawAppManifestData.BUILD_DATE_TIME,
          MONGO_DB_STATUS: this.getMongoDbStatus()
        };
        res.send({ ...appManifestData });
      } catch (e) {
        res.send({
          APPLICATION_STATUS: 'Healthy, but failed to get AppManifestData'
        });
      }
    });

    this.router.get('/products/swagger/4.0.1/json', (req, res) => {
      res.json(openApiV401);
    });
    this.router.use(
      '/products/swagger/4.0.1',
      swaggerUi.serve,
      swaggerUi.setup(openApiV401, { swaggerOptions })
    );
  }

  private getMongoDbStatus() {
    const readyStateCode = mongoose.connection.readyState;
    const codeToTextMapper = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting'
    };
    const dbStatus = codeToTextMapper[readyStateCode];
    return dbStatus
      ? dbStatus
      : `Invalid status code from mongoose.connection.readyState: ${readyStateCode}`;
  }
}

export const healthRouter = new HealthRouter();
