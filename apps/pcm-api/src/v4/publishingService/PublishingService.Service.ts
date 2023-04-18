import {
  RequestModel,
  ResponseModel,
  StorageModel
} from '@tandfgroup/pcm-entity-model-v4';
import { cloneDeep } from 'lodash';
import { ISQSQueueUrlData } from '../../v4/model/interfaces/SQSQueueUrlData';
import { isUUID } from 'validator';

import { Config } from '../../config/config';
import { AppError } from '../../model/AppError';
import { assetV4Service } from '../assets/AssetV4.Service';
import { eventService } from '../event/Event.Service';
import { productV4DAO } from '../products/ProductV4.DAO';
import { schemaValidator } from '../validator/SchemaValidator';

type Prices = StorageModel.Product['prices'];

class PublishingServiceProductService {
  private publishingServiceProductEventQueue: ISQSQueueUrlData =
    Config.getPropertyValue('publishingServiceProductEventQueue');
  private publishingServiceProductSource = 'SALESFORCE';
  private schemaId =
    'OpenApiSchema#/definitions/PublishingServiceProductRequest';

  /**
   * Will initiate the Service Product Create Process by sending an event
   * @param id UUID for the product
   * @param serviceProduct ServiceProduct
   * @returns messageID
   */
  public async createServiceProduct(
    id: string,
    serviceProduct: RequestModel.PublishingService
  ): Promise<string> {
    return this.handleServiceProduct(id, serviceProduct, 'create');
  }

  /**
   * Will initiate the Service Product update Process by sending an event
   * @param id UUID for the product
   * @param serviceProduct ServiceProduct
   * @returns messageID
   */
  public async updateServiceProduct(
    id: string,
    serviceProduct: RequestModel.PublishingService
  ): Promise<string> {
    return this.handleServiceProduct(id, serviceProduct, 'update');
  }

  /**
   * Will initiate the Service Product get Process by sending an id
   * @param id UUID for the product
   */
  public async getPublishingServiceById(
    id: string
  ): Promise<{ prices: Prices; subType: string }> {
    const asset: ResponseModel.Asset = await assetV4Service.getAssetById(id, [
      'type'
    ]);
    if (!asset) {
      throw new AppError('Product (asset) not found.', 404);
    }
    const projectionFields = ['prices', 'subType'];
    const publishingService: StorageModel.Product =
      await productV4DAO.getProduct(asset.type, id, projectionFields);
    const { prices = null, subType = null } = publishingService || {};
    return { prices, subType };
  }

  /**
   * Will initiate the Service Product create/update Process based on action
   * by sending an event
   * @param id UUID for the product
   * @param serviceProduct ServiceProduct
   * @param action create/update
   * @returns messageID
   */
  private async handleServiceProduct(
    id: string,
    serviceProduct: RequestModel.PublishingService,
    action: string
  ): Promise<string> {
    if (!isUUID(id, 4)) {
      throw new AppError('Invalid UUID(v4) in the path parameter.', 400, {
        id
      });
    }
    schemaValidator.validate(this.schemaId, cloneDeep(serviceProduct));
    const asset = await assetV4Service.getAssetById(id, ['_id', 'type']);
    if (action === 'create' && asset && asset._id) {
      throw new AppError(
        `A product ${asset.type} already exists with id ${id}.`,
        409
      );
    } else if (action === 'update' && !asset) {
      throw new AppError(
        `Publishing Service product does NOT exists with id ${id}.`,
        404
      );
    }
    return eventService.sendProductEvent(
      {
        ...serviceProduct,
        _id: id,
        _sources: [
          { source: this.publishingServiceProductSource, type: 'product' }
        ]
      },
      this.publishingServiceProductEventQueue,
      this.publishingServiceProductSource,
      { productId: id, productType: serviceProduct.type }
    );
  }
}

export const publishingServiceProductService =
  new PublishingServiceProductService();
