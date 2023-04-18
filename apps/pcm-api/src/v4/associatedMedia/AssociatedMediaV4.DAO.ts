import { MongooseSchema, StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import * as mongoose from 'mongoose';
import Logger from '../../utils/LoggerUtil';

import { Config } from '../../config/config';
import { AppError } from '../../model/AppError';

const log = Logger.getLogger('AssociatedMediaDAO');

type AssociatedMediaModelType = StorageModel.AssociatedMedia &
  mongoose.Document;
type PartsChangedInfoList = StorageModel.PartsRevision['partsAdded'];
const docTypeToCollectionMapperV4 = Config.getPropertyValue(
  'docTypeToCollectionMapperV4'
);
interface IPdfXmlData {
  parentId: string;
  _id: string;
}

class AssociatedMediaV4DAO {
  public model: mongoose.Model<AssociatedMediaModelType>;
  constructor() {
    const collectionName = docTypeToCollectionMapperV4.associatedmedia;
    this.model = mongoose.model<AssociatedMediaModelType>(
      'AssociatedMediaV4',
      MongooseSchema.AssociatedMedia,
      collectionName
    );
  }

  public async getAssociatedMediaByParentId(
    parentId: string,
    projectionData: string[] = [],
    currentVersion?: string
  ): Promise<StorageModel.AssociatedMedia[]> {
    log.debug('getAssociatedMediaByParentId', { parentId, projectionData });
    const projection = {};
    projectionData.forEach((property) => {
      projection[property] = 1;
    });
    if (currentVersion) {
      return this.model
        .find({ parentId, versionType: currentVersion }, projection)
        .lean()
        .exec()
        .catch((error: Error) => {
          return Promise.reject('We are unable to find the AssociatedMedia.');
        });
    } else {
      return this.model
        .find({ parentId }, projection)
        .lean()
        .exec()
        .catch((error: Error) => {
          return Promise.reject('We are unable to find the AssociatedMedia.');
        });
    }
  }

  public async getAsstMediasByParentIds(
    parentIds: string[],
    projectionData: string[] = []
  ): Promise<StorageModel.AssociatedMedia[]> {
    log.debug('getAsstMediasByParentIds', { parentIds, projectionData });
    const query = { parentId: { $in: parentIds } };
    const projection = {};
    projectionData.forEach((property) => {
      projection[property] = 1;
    });
    return this.model
      .find(query, projection)
      .lean()
      .exec()
      .catch((error: Error) => {
        return Promise.reject('We are unable to find the AssociatedMedia.');
      });
  }

  public async getAsstMediaByParentIdAndType(
    parentId: string,
    type: string,
    projectionData: string[] = []
  ): Promise<StorageModel.AssociatedMedia[]> {
    log.debug('getAsstMediasByParentIds', { parentId, projectionData });
    const query = { parentId, type };
    const projection = {};
    projectionData.forEach((property) => {
      projection[property] = 1;
    });
    return this.model
      .find(query, projection)
      .lean()
      .exec()
      .catch((error: Error) => {
        return Promise.reject('We are unable to find the AssociatedMedia.');
      });
  }

  public async getByParentIdAndLocation(
    parentId: string,
    location: string,
    projectionData: string[] = []
  ): Promise<StorageModel.AssociatedMedia> {
    log.debug('getByParentIdAndLocation', {
      location,
      parentId,
      projectionData
    });
    const projection = {};
    projectionData.forEach((property) => {
      projection[property] = 1;
    });
    return this.model
      .findOne({ location, parentId }, projection)
      .lean()
      .exec()
      .catch((error: Error) => {
        return Promise.reject('We are unable to find the AssociatedMedia.');
      });
  }
  public async isContentExists(
    partsAdded: PartsChangedInfoList,
    projectionData: string[]
  ): Promise<string[]> {
    log.debug('isContentExists', {
      partsAdded,
      projectionData
    });
    const product = partsAdded.filter(
      (parts) => parts.type === 'book' || parts.type === 'chapter'
    );
    const remainingProduct = partsAdded.filter(
      (parts) => !(parts.type === 'book' || parts.type === 'chapter')
    );
    const remainingIds: string[] = remainingProduct.map((asset) => asset._id);
    const ids: string[] = product.map((asset) => asset._id);
    const bookChapterPdfData: IPdfXmlData[] = await this.isPdfExists(
      ids,
      projectionData
    );
    const bookChapterPdfParentId: string[] = bookChapterPdfData.map(
      (asset) => asset.parentId
    );

    const bookChapterXmlData: IPdfXmlData[] = await this.isXmlExists(
      bookChapterPdfParentId,
      projectionData
    );
    const bookChapterXmlParentId: string[] = bookChapterXmlData.map(
      (asset) => asset.parentId
    );
    const parentIds = remainingIds.concat(bookChapterXmlParentId);
    return parentIds;
  }

  async isPdfExists(ids: string[], projectionData: string[]) {
    const query = {
      parentId: { $in: ids },
      type: { $in: ['webpdf', 'chapterpdf'] }
    };
    const projection = {};
    projectionData.forEach((property) => {
      projection[property] = 1;
    });
    return this.model
      .find(query, projection)
      .lean()
      .exec()
      .catch((error: Error) => {
        return Promise.reject(
          'We are unable to find pdf for this AssociatedMedia.'
        );
      });
  }

  async isXmlExists(ids: string[], projectionData: string[]) {
    const query = {
      parentId: { $in: ids },
      type: { $eq: 'dbitsxml' }
    };
    const projection = {};
    projectionData.forEach((property) => {
      projection[property] = 1;
    });
    return this.model
      .find(query, projection)
      .lean()
      .exec()
      .catch(() => {
        return Promise.reject(
          'We are unable to find dbitsxml for the AssociatedMedia.'
        );
      });
  }

  public createAssociatedMedia(
    content: StorageModel.AssociatedMedia
  ): Promise<StorageModel.AssociatedMedia> {
    log.debug('createAssociatedMedia:: content: ', content);
    return this.model.create(content).catch((error) => {
      throw new AppError('Error while creating content', 400, error);
    });
  }
}

export const associatedMediaV4Dao = new AssociatedMediaV4DAO();
