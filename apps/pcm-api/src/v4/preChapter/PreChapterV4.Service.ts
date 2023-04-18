import { RequestModel, StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import { cloneDeep } from 'lodash';
import { ISQSQueueUrlData } from 'v4/model/interfaces/SQSQueueUrlData';

import { Config } from '../../config/config';
import { AppError } from '../../model/AppError';
import { assetV4Service } from '../assets/AssetV4.Service';
import { eventService } from '../event/Event.Service';
import { schemaValidator } from '../validator/SchemaValidator';
import { productV4Service } from '../products/ProductV4.Service';
import { productV4DAO } from '../products/ProductV4.DAO';
class PreChapterProductService {
  private preChapterProductEventQueue: ISQSQueueUrlData =
    Config.getPropertyValue('preChapterProductEventQueue');
  private preChapterProductSource = 'ACTIVITY';
  private schemaId = 'OpenApiSchema#/definitions/PreChapterProductRequest';
  private bookStatus = ['Out of Print', 'Deprecated', 'Withdrawn'];

  /**
   * Will initiate the Service Product Create Process by sending an event
   * @param id UUID for the product
   * @param serviceProduct ServiceProduct
   * @returns messageID
   */
  public async createPreChapterProduct(
    serviceProduct: RequestModel.PreChapter
  ): Promise<string> {
    return this.handleServiceProduct(
      serviceProduct,
      'create',
      productV4Service.getNewId()
    );
  }

  /**
   * Will initiate the Service Product update Process by sending an event
   * @param id UUID for the product
   * @param serviceProduct ServiceProduct
   * @returns messageID
   */
  public async updatePreChapterProduct(
    id: string,
    serviceProduct: RequestModel.PreChapter
  ): Promise<string> {
    return this.handleServiceProduct(serviceProduct, 'update', id);
  }
  private async handleServiceProduct(
    preChapterProduct: RequestModel.PreChapter,
    action: string,
    id: string
  ): Promise<string> {
    schemaValidator.validate(this.schemaId, cloneDeep(preChapterProduct));
    if (action === 'create') {
      if (preChapterProduct.isPartOf.length != 1) {
        throw new AppError(`isPartOf should have length one.`, 400);
      }
      await this.isValidBookPart(preChapterProduct.isPartOf[0]);
    }

    if (action === 'update') {
      const asset = await assetV4Service.getAssetById(id, ['_id', 'type']);
      if (!asset) {
        throw new AppError(
          `Pre Chapter product does NOT exists with id ${id}.`,
          404
        );
      }
    }
    return eventService.sendProductEvent(
      {
        ...preChapterProduct,
        _id: id,
        _sources: [{ source: this.preChapterProductSource, type: 'product' }]
      },
      this.preChapterProductEventQueue,
      this.preChapterProductSource,
      { productId: id }
    );
  }
  private async isValidBookPart(preChapterIsPartOf) {
    if (preChapterIsPartOf.type != 'book') {
      throw new AppError(`type should be book.`, 400);
    }
    const product: StorageModel.Product = await productV4DAO.getProduct(
      preChapterIsPartOf.type,
      preChapterIsPartOf._id,
      ['book.status', 'type', 'identifiers.isbn']
    );
    if (product === null) {
      throw new AppError(
        `book product does NOT exists with id ${preChapterIsPartOf._id}.`,
        400
      );
    }
    if (product.identifiers.isbn !== preChapterIsPartOf.identifiers.isbn) {
      throw new AppError(
        `isbn ${preChapterIsPartOf.identifiers.isbn} does not match with isbn of book id ${preChapterIsPartOf._id}.`,
        400
      );
    }
    if (product.type !== preChapterIsPartOf.type) {
      throw new AppError(
        `type for id ${preChapterIsPartOf._id} does not match with ${preChapterIsPartOf.type}.`,
        400
      );
    }
    if (this.bookStatus.includes(product.book.status)) {
      throw new AppError(
        `${preChapterIsPartOf.type} with status ${product.book.status} is not allowed.`,
        400
      );
    }
  }
}
export const preChapterProductService = new PreChapterProductService();
