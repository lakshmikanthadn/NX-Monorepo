import { Request, Response } from 'express';
import * as fs from 'fs';
import * as swaggerUi from 'swagger-ui-express';

import { Config } from '../config/config';
import * as openApiV401 from '../public/swagger/4.0.x.json';
import { BaseRouter } from './BaseRouter';
import esClient from '../v4/utils/ESConnectionUtils';

const swaggerOptions = {
  defaultModelsExpandDepth: -1
};

class HealthRouter extends BaseRouter {
  constructor() {
    super();
  }

  protected initRoutes(): void {
    this.router.get('/health', async (req: Request, res: Response) => {
      try {
        const ebHealthStatus = await this.checkConnection();
        if (ebHealthStatus.status === 'green') {
          res.send({
            APPLICATION_STATUS: 'I am healthy.'
          });
        }
      } catch (e) {
        res.status(503).send({
          APPLICATION_STATUS: 'Unhealthy, not connected to Elasticsearch.'
        });
      }
    });

    this.router.get(
      '/products/search/health',
      async (req: Request, res: Response) => {
        try {
          const rawAppManifestData = JSON.parse(
            fs.readFileSync('ApplicationManifest.json', 'utf8')
          );

          const ebHealthStatus = await this.checkConnection();
          const appManifestData = {
            APPLICATION_ENV: Config.getPropertyValue('envName'),
            APPLICATION_NAME: rawAppManifestData.APPLICATION_NAME,
            APPLICATION_STATUS: 'Healthy.',
            APPLICATION_VERSION: rawAppManifestData.APPLICATION_VERSION,
            BUILD_DATE_TIME: rawAppManifestData.BUILD_DATE_TIME,
            ES_HEALTH_STATUS: ebHealthStatus.message
          };
          res.send({ ...appManifestData });
        } catch (e) {
          res.status(503).send({
            APPLICATION_STATUS: 'Unhealthy, not connected to Elasticsearch.'
          });
        }
      }
    );

    this.router.get('/products/search/swagger/4.0.1/json', (req, res) => {
      res.json(openApiV401);
    });
    this.router.use(
      '/products/search/swagger/4.0.1',
      swaggerUi.serve,
      swaggerUi.setup(openApiV401, { swaggerOptions })
    );
  }

  /** Check the ES connection status */
  private async checkConnection() {
    const health = await esClient.cluster.health({});
    const { cluster_name, status } = health.body;
    return {
      message: `cluster ${cluster_name} health status is ${status}`,
      status
    };
  }
}

export const healthRouter = new HealthRouter();
