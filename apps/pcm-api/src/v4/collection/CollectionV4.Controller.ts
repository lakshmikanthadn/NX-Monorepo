import { RequestModel, ResponseModel } from '@tandfgroup/pcm-entity-model-v4';
import { hasPermission } from '@tandfgroup/privilege-authorization-manager';
import { Request, Response } from 'express';

import { productV4Service } from '../products/ProductV4.Service';
import { AppError } from '../../model/AppError';
import { APIResponse } from '../../utils/APIResponse';
import Logger from '../../utils/LoggerUtil';
import { assetV4Service } from '../assets/AssetV4.Service';
import { collectionValidator } from './CollectionValidator';
import { patchAPIValidator } from '../validator/requestValidator/PatchAPIValidator';
import { schemaValidator } from '../validator/SchemaValidator';
import { collectionV4Service } from './CollectionV4.Service';
import { Config } from '../../config/config';

const log = Logger.getLogger('collectionV4Controller');
const iamEnv: string = Config.getPropertyValue('iamEnv');

export class CollectionV4Controller {
  private schemaId = 'OpenApiSchema#/definitions/CollectionProductRequest';

  /**
   * This method acts as re-router to route all the POST:/products calls.
   * This method re-routes calls to corresponding controller based on the action.
   * @param req
   * @param res
   */

  @hasPermission(['api', 'collection-product', 'update'], null, iamEnv)
  public async updateCollectionProduct(req: Request, res: Response) {
    log.debug('updateCollectionProduct:: received');
    const productData: RequestModel.Collection = req.body.product;
    try {
      const identifier: string = req.params.identifier;
      productData._id = productData._id || identifier;
      log.debug('updateCollectionProduct:: _id', productData._id);
      // Validate Collection
      const action = 'update';
      await collectionValidator.validateCollection(productData);
      // Validate collection using schema
      await schemaValidator.validate(this.schemaId, productData);
      await this.handleProductExistError(productData, action);
      return this.handleUploadProduct(req, res, productData, action);
    } catch (error) {
      error['_id'] = req.params.identifier;
      error['type'] = req.body.product.type;
      APIResponse.failure(res, error);
    }
  }

  @hasPermission(['api', 'collection-product', 'update'], null, iamEnv)
  public async partialUpdateCollectionProduct(
    req: Request,
    res: Response
  ): Promise<void> {
    log.debug('partialUpdateCollectionProduct:: received');
    return this._partialUpdateCollectionProduct(req, res);
  }

  public async _partialUpdateCollectionProduct(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const productData: RequestModel.PatchRequest[] = req.body.data;
      const identifier: string = req.params.identifier;

      // Validate Patch Collection
      patchAPIValidator.validatePatchRequest(productData);
      const productReqWithId = { _id: identifier, data: productData };
      log.debug('handlePatchProductUpload:: _id', productReqWithId['_id']);
      await collectionV4Service.uploadPatchProduct(productReqWithId);
      const responseData = {
        data: null,
        metadata: {
          message:
            'Product data uploaded successfully, it will be processed and acknowledged soon.',
          transactionId: productV4Service.getTransactionId()
        }
      };
      return APIResponse.accepted(res, responseData);
    } catch (error) {
      Logger.handleErrorLog(log, 'handlePatchProductUpload:: ', error);
      return APIResponse.failure(res, error);
    }
  }

  @hasPermission(['api', 'collection-product', 'create'], null, iamEnv)
  public async createCollectionProduct(
    req: Request,
    res: Response
  ): Promise<void> {
    log.debug('createCollectionProduct:: received');
    return this._createCollectionProduct(req, res);
  }

  public async _createCollectionProduct(req: Request, res: Response) {
    const productData: RequestModel.Collection = req.body.product;
    try {
      // Validate Collection
      const action = 'create';
      await collectionValidator.validateCollection(productData, action);
      // Validate request with AjV
      await schemaValidator.validate(this.schemaId, productData);
      await this.handleProductExistError(productData, action);
      return this.handleUploadProduct(req, res, productData, action);
    } catch (error) {
      const { _id, type } = req.body.product;
      error['_id'] = _id;
      error['type'] = type;
      Logger.handleErrorLog(log, 'createCollectionProduct', error);
      APIResponse.failure(res, error);
    }
  }

  private async handleUploadProduct(
    req: Request,
    res: Response,
    productData: RequestModel.Collection,
    action: string
  ) {
    return collectionV4Service
      .uploadProduct(productData, action)
      .then((product: any) => {
        const responseData = {
          _id: product._id,
          messages: [
            {
              code: 202,
              description:
                'Product data uploaded successfully, it will be processed and acknowledged soon.'
            }
          ],
          status: 'success'
        };
        APIResponse.accepted(res, responseData);
      })
      .catch((error) => {
        const { _id, type } = req.body.product;
        error['_id'] = _id;
        error['type'] = type;
        Logger.handleErrorLog(log, 'handleUploadProduct', error);
        APIResponse.failure(res, error);
      });
  }

  private async handleProductExistError(
    productData: RequestModel.Collection,
    action: string
  ): Promise<boolean> {
    const productType = productData.type;
    const title = productData.title;
    const _id = productData._id;
    const collectionId =
      productData.identifiers && productData.identifiers.collectionId;
    const productCategories = productData.categories;
    const isBespokeCollection = collectionV4Service.isBespokeCollection(
      collectionId,
      productCategories
    );
    const promises = [assetV4Service.getAssetById(_id, ['_id'])];
    promises.push(collectionV4Service.getProductByTitle(title, productType));
    if (collectionId && !isBespokeCollection) {
      promises.push(
        assetV4Service.getProductByIdentifier('collectionId', collectionId)
      );
    }
    const productRes = await Promise.all(promises);
    const errorStr = ['_id', 'title', 'collectionId'];
    const errorVal = [_id, title, collectionId];

    if (action === 'create') {
      productRes.forEach((res: ResponseModel.Asset, i: number) => {
        if (res) {
          // throw error if product exist for any one of collectionId, _id and title while create
          throw new AppError(
            `A product already exists with ${errorStr[i]} ${errorVal[i]}`,
            409
          );
        }
      });
    } else {
      productRes.forEach((res: ResponseModel.Asset, i: number) => {
        if (!res) {
          // throw error if product don't exists for collectionId, _id and title while update
          throw new AppError(
            `A product must exists with ${errorStr[i]} ${errorVal[i]}`,
            400
          );
        }
      });
    }
    return true;
  }
}

export const collectionV4Controller = new CollectionV4Controller();
