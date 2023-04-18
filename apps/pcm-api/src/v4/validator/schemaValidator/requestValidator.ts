import { NextFunction, Request, Response } from 'express';
import * as Ajv from 'ajv';
import * as ajvErrors from 'ajv-errors';

import { AppError } from '../../../model/AppError';
import { APIResponse } from '../../../utils/APIResponse';

export interface ReqSchema {
  query?: any;
  params?: any;
  body?: any;
}

class Validator {
  public expressRequestValidator(reqSchema: ReqSchema) {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        if (reqSchema.query) {
          this.validate(reqSchema.query, request.query);
          next();
        }
      } catch (error) {
        APIResponse.failure(response, error);
      }
    };
  }
  private validate(schema: any, data: any): boolean {
    const ajv: Ajv.Ajv = new Ajv({ allErrors: true });
    ajvErrors(ajv);
    const validate = ajv.compile(schema);
    const valid = validate(data);
    if (valid) {
      return true;
    } else {
      throw new AppError('Validation error', 400, validate.errors);
    }
  }
}
export const validator = new Validator();
