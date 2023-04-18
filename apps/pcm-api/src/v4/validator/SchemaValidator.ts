import { OpenApiComponentV4 as schema } from '@tandfgroup/pcm-entity-model-v4';
import * as Ajv from 'ajv';
import * as _ from 'lodash';
import { isEmail } from 'validator';

import { AppError } from '../../model/AppError';
import { NullRemover } from '../utils/NullRemoverUtilsV4';

class SchemaValidator {
  private jsonValidator: Ajv.Ajv;
  constructor() {
    this.jsonValidator = new Ajv({
      allErrors: true,
      jsonPointers: true,
      schemas: [schema]
    });
    this.jsonValidator.addFormat('email', (data: string) => isEmail(data));
  }

  public validate(schemaId: string, data: any) {
    const cleanedData = NullRemover.cleanNullField(_.cloneDeep(data));
    const validateSchema = this.jsonValidator.getSchema(schemaId);
    if (validateSchema(cleanedData)) {
      return true;
    } else {
      throw new AppError(
        'Validation error',
        400,
        validateSchema.errors.map((e: any) => {
          return {
            code: 400,
            description: e.message, // Remove if SF is not using description.
            ...e
          };
        })
      );
    }
  }
}

export const schemaValidator = new SchemaValidator();
