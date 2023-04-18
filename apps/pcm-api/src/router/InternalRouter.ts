import { Request, Response } from 'express';
import { AppError } from '../model/AppError';
import { APIResponse } from '../utils/APIResponse';
import { productV4Controller } from '../v4/products/ProductV4.Controller';
import { BaseRouter } from './BaseRouter';
class InternalRouter extends BaseRouter {
  constructor() {
    super();
  }

  protected initRoutes(): void {
    this.router.put('/:id', (req: Request, res: Response) => {
      if (req.body.apiVersion === '4.0.1' && req.body.action === 'oaUpdate') {
        productV4Controller.handleOAUpdate(req, res);
      } else {
        APIResponse.failure(res, new AppError('Method not allowed', 405));
      }
    });

    this.router.post('/rules', (req: Request, res: Response) => {
      if (req.body.apiVersion === '4.0.1') {
        productV4Controller.handleRuleString(req, res);
      } else {
        APIResponse.failure(res, new AppError('Method not allowed', 405));
      }
    });

    this.router.post('/', (req: Request, res: Response) => {
      if (req.body.apiVersion === '4.0.1') {
        productV4Controller.handlePostProductInternal(req, res);
      } else {
        APIResponse.failure(res, new AppError('Method not allowed', 405));
      }
    });
  }
}

export const internalRouter = new InternalRouter();
