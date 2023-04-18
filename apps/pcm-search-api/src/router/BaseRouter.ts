import { Router } from 'express';
import { AppError } from '../model/AppError';
import { APIResponse } from '../utils/APIResponse';

export abstract class BaseRouter {
  protected router: Router;
  private initiatedRoutes = false;

  constructor() {
    this.router = Router();
  }

  public getRoutes(): Router {
    if (!this.initiatedRoutes) {
      this.initRoutes();
      this.initiatedRoutes = true;
    }
    return this.router;
  }

  protected abstract initRoutes(): void;

  protected handleInvalidAPIVersion(req, res) {
    APIResponse.failure(
      res,
      new AppError(
        `Invalid API Version: ${req.query.apiVersion || req.body.apiVersion}`,
        400
      )
    );
  }
}
