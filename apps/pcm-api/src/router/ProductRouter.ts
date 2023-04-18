import { Request, Response } from 'express';

import { ackController } from '../v4/ack/ACK.Controller';
import { journalPublishingServiceMapController } from '../v4/JournalPubServiceMap/JournalPubServiceMap.Controller';
import { partsV4Controller } from '../v4/parts/PartsV4.Controller';
import { partsV410Controller } from '../v410/parts/Parts.V410.Controller';
import { productV4Controller } from '../v4/products/ProductV4.Controller';
import { partsrevisionV4Controller } from '../v4/partsRevision/PartsRevisionV4.Controller';
import { BaseRouter } from './BaseRouter';
import { validator } from '../v4/validator/schemaValidator/requestValidator';
import { partsRevisionSchema } from '../v4/partsRevision/partsRevision.Schema';
class ProductRouter extends BaseRouter {
  constructor() {
    super();
  }

  protected initRoutes(): void {
    this.router.head('/', (req: Request, res: Response) => {
      if (req.query.apiVersion === '4.0.1') {
        productV4Controller.getProductByIdentifier(req, res);
      } else {
        this.handleInvalidAPIVersion(req, res);
      }
    });

    this.router.get('/', (req: Request, res: Response) => {
      if (req.query.apiVersion === '4.0.1') {
        productV4Controller.getProducts(req, res);
      } else {
        this.handleInvalidAPIVersion(req, res);
      }
    });

    this.router.get('/manuscript', (req: Request, res: Response) => {
      if (req.query.apiVersion === '4.0.1') {
        productV4Controller.getPreArticles(req, res);
      } else {
        this.handleInvalidAPIVersion(req, res);
      }
    });

    this.router.get('/report', (req: Request, res: Response) => {
      if (req.query.apiVersion === '4.0.1') {
        productV4Controller.getReport(req, res);
      } else {
        this.handleInvalidAPIVersion(req, res);
      }
    });

    this.router.get(
      '/:identifier/associated-media',
      (req: Request, res: Response) => {
        if (req.query.apiVersion === '4.0.1') {
          productV4Controller.getProductAssociatedMedia(req, res);
        } else {
          this.handleInvalidAPIVersion(req, res);
        }
      }
    );

    this.router.get(
      '/manuscript/workflow/:identifier',
      (req: Request, res: Response) => {
        if (req.query.apiVersion === '4.0.1') {
          productV4Controller.getManuscriptWorkflow(req, res);
        } else {
          this.handleInvalidAPIVersion(req, res);
        }
      }
    );

    this.router.get(
      '/manuscript/:identifier',
      (req: Request, res: Response) => {
        if (req.query.apiVersion === '4.0.1') {
          productV4Controller.getPreArticle(req, res);
        } else {
          this.handleInvalidAPIVersion(req, res);
        }
      }
    );

    this.router.get('/:identifier', (req: Request, res: Response) => {
      if (req.query.apiVersion === '4.0.1') {
        productV4Controller.getProduct(req, res);
      } else {
        this.handleInvalidAPIVersion(req, res);
      }
    });

    this.router.put('/:identifier', (req: Request, res: Response) => {
      if (req.body.apiVersion === '4.0.1') {
        productV4Controller.handleUpdateProduct(req, res);
      } else {
        this.handleInvalidAPIVersion(req, res);
      }
    });

    this.router.patch('/:identifier', (req: Request, res: Response) => {
      if (req.body.apiVersion === '4.0.1') {
        productV4Controller.handlePartialUpdateProduct(req, res);
      } else {
        this.handleInvalidAPIVersion(req, res);
      }
    });

    this.router.post('/:identifier/ack', (req: Request, res: Response) => {
      if (req.body.apiVersion === '4.0.1') {
        ackController.handleAssetDistributionAck(req, res);
      } else {
        this.handleInvalidAPIVersion(req, res);
      }
    });

    this.router.put(
      '/:identifier/publishing-services',
      (req: Request, res: Response) => {
        if (req.body.apiVersion === '4.0.1') {
          journalPublishingServiceMapController.updateJournalPublishingServiceMap(
            req,
            res
          );
        } else {
          this.handleInvalidAPIVersion(req, res);
        }
      }
    );

    this.router.get(
      '/:identifier/publishing-services',
      (req: Request, res: Response) => {
        if (req.query.apiVersion === '4.0.1') {
          journalPublishingServiceMapController.getJournalPublishingServiceMap(
            req,
            res
          );
        } else {
          this.handleInvalidAPIVersion(req, res);
        }
      }
    );

    this.router.get('/:identifier/parts', (req: Request, res: Response) => {
      if (['4.0.1', '4.0.2'].includes(req.query.apiVersion)) {
        partsV4Controller.getProductHasParts(req, res);
      } else if (req.query.apiVersion === '4.1.0') {
        partsV410Controller.getProductHasParts(req, res);
      } else {
        this.handleInvalidAPIVersion(req, res);
      }
    });
    this.router.get(
      '/:identifier/parts/:partId',
      (req: Request, res: Response) => {
        if (req.query.apiVersion === '4.0.1') {
          partsV4Controller.getProductHasPart(req, res);
        } else {
          this.handleInvalidAPIVersion(req, res);
        }
      }
    );

    this.router.get(
      '/:identifier/parts-delta',
      (request, response, next) => {
        const defaultInclude = ['partsAdded', 'partsRemoved', 'partsUpdated'];
        const include: string = request.query.include;
        request.query.include = include ? include.split(',') : defaultInclude;
        next();
      },
      validator.expressRequestValidator({
        query: partsRevisionSchema.definitions.GetPartsDeltaReqQuery
      }),
      (req: Request, res: Response) => {
        if (req.query.fromDate && req.query.apiVersion === '4.0.1') {
          partsrevisionV4Controller.getProductPartsRevisionDelta(req, res);
        } else if (req.query.apiVersion === '4.0.1') {
          partsV4Controller.getProductPartsDelta(req, res);
        } else {
          this.handleInvalidAPIVersion(req, res);
        }
      }
    );

    this.router.post('/', (req: Request, res: Response) => {
      if (req.body.apiVersion === '4.0.1') {
        productV4Controller.handlePostProduct(req, res);
      } else {
        this.handleInvalidAPIVersion(req, res);
      }
    });

    this.router.post('/:identifier', (req: Request, res: Response) => {
      if (req.body.apiVersion === '4.0.1') {
        productV4Controller.handleCreateProductById(req, res);
      } else {
        this.handleInvalidAPIVersion(req, res);
      }
    });

    this.router.get(
      '/:assetType/classifications/:taxonomyType',
      (req: Request, res: Response) => {
        if (req.query.apiVersion === '4.0.1') {
          productV4Controller.getTaxonomy(req, res);
        } else {
          this.handleInvalidAPIVersion(req, res);
        }
      }
    );
  }
}

export const productRouter = new ProductRouter();
