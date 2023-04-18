import { RequestModel } from '@tandfgroup/pcm-entity-model-v4';
import { AppError } from '../../../model/AppError';

class PatchAPIValidator {
  public validatePatchRequest(
    productRequests: RequestModel.PatchRequest[]
  ): boolean {
    productRequests.forEach((pReq) => {
      const { op, path, value } = pReq;
      if (!(op && path && value)) {
        throw new AppError(
          `missing either one of these fields op, path, value`,
          400
        );
      }
      if (op !== 'replace') {
        throw new AppError(`invalid patch request with operation ${op}`, 400);
      }
    });

    return true;
  }
}
export const patchAPIValidator = new PatchAPIValidator();
