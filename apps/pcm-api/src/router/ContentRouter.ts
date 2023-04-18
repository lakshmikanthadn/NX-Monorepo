import { Request, Response } from 'express';
import { contentV4Controller } from '../v4/content/ContentV4.Controller';
import { contentV410Controller } from '../v410/content/Content.V410.Controller';
import { BaseRouter } from './BaseRouter';

class ContentRouter extends BaseRouter {
  constructor() {
    super();
  }
  protected initRoutes(): void {
    this.router.get('/:id', (req: Request, res: Response) => {
      if (req.query.apiVersion === '4.0.1') {
        contentV4Controller.handleGetContentById(req, res);
      } else if (req.query.apiVersion === '4.1.0') {
        contentV410Controller.handleGetContentById(req, res);
      } else {
        this.handleInvalidAPIVersion(req, res);
      }
    });
    this.router.get('/', (req: Request, res: Response) => {
      if (req.query.apiVersion === '4.0.1') {
        contentV4Controller.getContentByIdentifier(req, res);
      } else {
        this.handleInvalidAPIVersion(req, res);
      }
    });
    this.router.post('/', (req: Request, res: Response) => {
      if (req.body.apiVersion === '4.0.1') {
        contentV4Controller.createAssociatedMedia(req, res);
      } else {
        this.handleInvalidAPIVersion(req, res);
      }
    });
  }
}

export const contentRouter = new ContentRouter();
