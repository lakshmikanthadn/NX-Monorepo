import { Request, Response } from 'express';

import { searchV4Controller } from '../v4/search/SearchV4Controller';
import { BaseRouter } from './BaseRouter';
class SearchRouter extends BaseRouter {
  constructor() {
    super();
  }

  protected initRoutes(): void {
    this.router.post('/search', (req: Request, res: Response) => {
      if (req.body.apiVersion === '4.0.1') {
        searchV4Controller.handlePostProduct(req, res);
      } else {
        this.handleInvalidAPIVersion(req, res);
      }
    });
  }
}

export const searchRouter = new SearchRouter();
