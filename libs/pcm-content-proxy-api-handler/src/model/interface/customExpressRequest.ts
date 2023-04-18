import { Request } from 'express';
export interface CustomExpressRequest extends Request {
  isBot?: boolean;
  hasAllContentAccess?: boolean;
}
