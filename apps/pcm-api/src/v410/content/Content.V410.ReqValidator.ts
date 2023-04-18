import Ajv from 'ajv';
import { AppError } from '../../model/AppError';

const ajv = new Ajv();
const ReqQuerySchema = {
  additionalProperties: false,
  properties: {
    apiVersion: { enum: ['4.1.0'], type: 'string' },
    appName: { enum: ['KORTEXT'], type: 'string' },
    filenamePrefix: { maxLength: 50, type: 'string' },
    ipSignature: { type: 'string' },
    parentId: { type: 'string' },
    render: { enum: ['true', 'false'], type: 'string' },
    // Query parameters will always be string
    type: { type: 'string' }
  },
  required: ['apiVersion'],
  type: 'object'
};

const validateQuery = ajv.compile(ReqQuerySchema);

class ContentV410ReqValidator {
  public validateQueryParams(query: any) {
    const valid = validateQuery(query);
    if (!valid) {
      throw new AppError(
        'Request validation error.',
        400,
        validateQuery.errors
      );
    }
  }
}

export const contentV410ReqValidator = new ContentV410ReqValidator();
