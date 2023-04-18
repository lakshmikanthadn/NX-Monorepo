import { Request, Response } from 'express';
import { productV4Controller } from '../v4/products/ProductV4.Controller';
import { BaseRouter } from './BaseRouter';
class TaxonomyRouter extends BaseRouter {
  constructor() {
    super();
  }

  protected initRoutes(): void {
    this.router.get('/', (req: Request, res: Response) => {
      if (req.query.apiVersion === '4.0.1') {
        productV4Controller.getTaxonomyClassifications(req, res);
      } else {
        this.handleInvalidAPIVersion(req, res);
      }
    });
  }
}

export const taxonomyRouter = new TaxonomyRouter();
