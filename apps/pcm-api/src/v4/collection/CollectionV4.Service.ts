import {
  RequestModel,
  StorageModel,
  ResponseModel
} from '@tandfgroup/pcm-entity-model-v4';
import { GroupedSearchQuery } from '@tandfgroup/pcm-rules-parser';

import { AppError } from '../../model/AppError';
import Logger from '../../utils/LoggerUtil';
import { searchQueryUtil } from '../../utils/SearchQueryUtil';
import { apiResponseGroupConfig } from '../config';
import { APIResponseGroup } from '../model/interfaces/CustomDataTypes';
import { productV4DAO } from '../products/ProductV4.DAO';
import { S3UtilsV4 } from '../utils/S3UtilsV4';
import { SQSUtilsV4 } from '../utils/SQSUtilsV4';

const log = Logger.getLogger('collectionV4Service');

class CollectionV4Service {
  public async uploadProduct(product: RequestModel.Collection, action: string) {
    log.debug('uploadProduct::,', { _id: product._id, action });
    const isDynamicCollection = product.categories.some((item) => {
      return item.name === 'collection-update-type' && item.type === 'dynamic';
    });

    product.prices.forEach((item) => {
      if (!item.price) {
        log.error('uploadProduct:: collection product is missing the prices', {
          _id: product._id,
          action
        });
      }
    });

    /*
     * Check if rulesList exist
     * if exist validate query and update new rule
     * prepare rule string for dynamic collection
     */

    const rulesList = product.rulesList as GroupedSearchQuery[];
    if (rulesList) {
      const queries = searchQueryUtil.getRulesStringFromSearchQuery(rulesList);
      product.rulesList = queries;
    }
    const collectionType = isDynamicCollection
      ? 'dynamicCollection'
      : 'staticCollection';
    // upload data to s3
    const location: string = await S3UtilsV4.uploadToS3(product, product._id);
    if (!(location && location !== '')) {
      throw new AppError('Error while uploading file', 400);
    }

    // send sqs message
    const messageId = await SQSUtilsV4.sendMessage(
      product._id,
      location,
      action,
      collectionType
    );
    if (!(messageId && messageId !== '')) {
      throw new AppError('Error while sending message', 400);
    }
    return { _id: product._id };
  }

  public async uploadPatchProduct(product: any) {
    log.debug('uploadPatchProduct::,', { _id: product._id });
    const location: string = await S3UtilsV4.uploadToS3(product, product._id);
    if (!(location && location !== '')) {
      throw new AppError('Error while uploading file', 400);
    }

    const collectionType = 'dynamicCollection';
    const action = 'patchCollection';

    // send sqs message
    await SQSUtilsV4.sendMessage(product._id, location, action, collectionType);

    return { _id: product._id };
  }

  public async getProductByTitle(
    title: string,
    productType: StorageModel.ProductType,
    responseGroup: APIResponseGroup = 'small'
  ): Promise<any> {
    log.debug('getProductByTitle:: ', {
      productType,
      responseGroup,
      title
    });
    const projectionFields = apiResponseGroupConfig.getProjectionFields(
      productType,
      responseGroup
    );
    return productV4DAO.getProductByTitle(title, productType, projectionFields);
  }

  public isBespokeCollection(
    collectionId: string,
    categories: ResponseModel.Category[]
  ) {
    const isCollectionTypeBespoke = categories.some((item) => {
      return item.name === 'collection-type' && item.type === 'bespoke';
    });
    return isCollectionTypeBespoke && collectionId === 'BD.EBOOK';
  }
}
export const collectionV4Service = new CollectionV4Service();
