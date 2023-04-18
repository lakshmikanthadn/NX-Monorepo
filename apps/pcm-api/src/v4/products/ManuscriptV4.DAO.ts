import { StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import * as mongoose from 'mongoose';
import { hubDBConnection } from '../utils/MongoConnectionUtils';
import Logger from '../../utils/LoggerUtil';
import { Config } from '../../config/config';
import { AppError } from '../../model/AppError';
import { GenricSchema } from '../../model/GenricSchema';

const docTypeToCollectionMapperV4 = Config.getPropertyValue(
  'docTypeToCollectionMapperV4'
);
const validProductTypes = Object.keys(docTypeToCollectionMapperV4);
const log = Logger.getLogger('ManuscriptV4DAO');

class ManuscriptV4DAO {
  private productModelsHolder = {};

  public async getManuscript(
    productType: StorageModel.ProductType,
    id: string,
    projectionFields: string[],
    availabilityName?: string,
    availabilityStatus?: string[],
    productVersion?: string,
    region?: string
  ): Promise<StorageModel.Product> {
    log.debug('getProduct:: ', {
      availabilityName,
      availabilityStatus,
      id,
      productType,
      productVersion,
      projectionFields,
      region
    });
    const model = this.getProductModel(productType);
    const query = { _id: id };
    const projections = this.prepareMongoProjections(projectionFields);
    log.debug('getManuscript:: ', { projections, query });
    return model.findOne(query, projections).lean().exec();
  }

  private getProductModel(productType: string): mongoose.Model<any> {
    const productTypeLowerCase = productType.toLowerCase();
    if (!validProductTypes.includes(productTypeLowerCase)) {
      throw new Error('Invalid Product type.');
    }

    if (this.productModelsHolder[productTypeLowerCase]) {
      return this.productModelsHolder[productTypeLowerCase];
    } else {
      const newProductModel = hubDBConnection.model<any>(
        productType,
        GenricSchema,
        docTypeToCollectionMapperV4[productTypeLowerCase]
      );
      this.productModelsHolder[productTypeLowerCase] = newProductModel;
      return newProductModel;
    }
  }

  private prepareMongoProjections(projectionFields: string[]): any {
    if (Array.isArray(projectionFields)) {
      const projections = {};
      projectionFields.forEach((property) => {
        projections[property] = 1;
      });
      return projections;
    } else {
      throw new AppError('Invalid projections.', 400);
    }
  }
}

export const manuscriptV4DAO = new ManuscriptV4DAO();
