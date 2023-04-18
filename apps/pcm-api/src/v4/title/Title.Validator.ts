import { Request } from 'express';

import { AppError } from '../../model/AppError';

class TitleValidator {
  private fetchVariantWhiteListedIds = ['isbn', 'isbn10'];

  /**
   * All the validators either return true or throw APP Error.
   * Make sure to put them inside a try catch and handle the error.
   */
  public fetchVariantRequestValidator(request: Request): boolean {
    const {
      action,
      apiVersion,
      formats,
      identifiers,
      includeEditions = false,
      ...restOfBody
    } = request.body;
    const validationErrors = [];
    const invalidBodyParams = Object.keys(restOfBody);
    if (invalidBodyParams.length > 0) {
      validationErrors.push(
        `unexpected parameters: ${invalidBodyParams.join()}`
      );
    }
    if (this.isInvalidIdentifier(identifiers)) {
      validationErrors.push(`invalid/missing identifiers`);
    } else {
      identifiers.forEach((idObject) => {
        const isValidIdName =
          idObject.name &&
          this.fetchVariantWhiteListedIds.includes(idObject.name);
        const isValidIdValues =
          idObject.values && Array.isArray(idObject.values);
        if (!isValidIdName) {
          validationErrors.push(`invalid/missing identifier name`);
        }
        if (!isValidIdValues) {
          validationErrors.push(`invalid/missing identifier values`);
        } else if (
          idObject.values.length === 0 ||
          idObject.values.length > 100
        ) {
          validationErrors.push(
            `request should have min 1 and max 100 identifiers`
          );
        }
      });
    }
    if (identifiers && identifiers.length > 1) {
      validationErrors.push(
        `currently we support one identifier(object) in identifiers`
      );
    }
    if (this.isInvalidFormats(formats)) {
      validationErrors.push(`invalid "formats" filter`);
    }
    if (![true, false].includes(includeEditions)) {
      validationErrors.push(`invalid "includeEditions" filter`);
    }
    if (validationErrors.length > 0) {
      throw new AppError(validationErrors.join(' and '), 400);
    }
    return true;
  }
  private isInvalidFormats(formats): boolean {
    return formats && (!Array.isArray(formats) || formats.length === 0);
  }
  private isInvalidIdentifier(identifiers): boolean {
    return (
      !identifiers || !Array.isArray(identifiers) || identifiers.length === 0
    );
  }
}

export const titleValidator = new TitleValidator();
