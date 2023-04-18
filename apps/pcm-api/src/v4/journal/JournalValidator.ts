import { RequestModel } from '@tandfgroup/pcm-entity-model-v4';
import { Request } from 'express';

import { AppError } from '../../model/AppError';

class JournalValidator {
  public validate(request: Request): boolean {
    // kept for future use
    const product: RequestModel.Journal = request.body.product;
    const productIdentifierName = request.query.productIdentifierName;
    if (productIdentifierName !== 'journalAcronym') {
      throw new AppError(
        `Product-identifier ${productIdentifierName} is not allowed.`,
        400
      );
    }
    let OAExist = false;
    let OSExist = false;
    if (product.permissions) {
      OAExist = product.permissions.some((perm) => {
        return perm.code === 'OA' || perm.name === 'open-access';
      });
      OSExist = product.permissions.some((perm) => {
        return perm.code === 'OS' || perm.name === 'open-select';
      });
    }

    if (OAExist && OSExist) {
      throw new AppError(
        `Both OA and OS permission is not allowed at a time.`,
        400
      );
    }

    let isEmailEmpty = false;
    if (product.contributors) {
      isEmailEmpty = product.contributors.some((contributor) => {
        return contributor.email === '';
      });
    }
    if (isEmailEmpty) {
      throw new AppError(`contributors email can not be empty.`, 400);
    }
    return true;
  }
}
export const journalValidator = new JournalValidator();
