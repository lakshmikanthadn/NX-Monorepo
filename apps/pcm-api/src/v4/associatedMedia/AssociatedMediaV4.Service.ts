import { ResponseModel, StorageModel } from '@tandfgroup/pcm-entity-model-v4';

import { AppConstants } from '../../config/constant';
import Logger from '../../utils/LoggerUtil';
import { associatedMediaV4Dao } from './AssociatedMediaV4.DAO';

const log = Logger.getLogger('AssociatedMediaV4Service');

class AssociatedMediaV4Service {
  public responseModelProjections: string[] = [
    'location',
    'type',
    'size',
    '_id',
    'versionType'
  ];
  private contentTypesHostedInPublicDomain =
    AppConstants.ContentTypesHostedInPublicDomain;

  public async getContentMetaDataByParentid(
    parentId: string,
    includeLocationForAll = false,
    currentVersion?: string
  ): Promise<ResponseModel.AssociatedMedia[]> {
    log.debug('getContentMetaDataByParentid:: ', {
      includeLocationForAll,
      parentId
    });
    const respAssociatedMedias: ResponseModel.AssociatedMedia[] =
      await associatedMediaV4Dao.getAssociatedMediaByParentId(
        parentId,
        this.responseModelProjections,
        currentVersion
      );
    if (includeLocationForAll) {
      return respAssociatedMedias;
    }
    return this.enableLocationByType(
      respAssociatedMedias,
      this.contentTypesHostedInPublicDomain
    );
  }

  public async getAsstMediasByParentIds(
    parentIds: string[],
    includeLocationForAll = false
  ): Promise<any> {
    const projectionWithParentId = [
      'location',
      'type',
      'size',
      '_id',
      'parentId',
      'versionType'
    ];
    const respAssociatedMedias: ResponseModel.AssociatedMedia[] =
      await associatedMediaV4Dao.getAsstMediasByParentIds(
        parentIds,
        projectionWithParentId
      );
    if (includeLocationForAll) {
      return respAssociatedMedias;
    }
    return this.enableLocationByType(
      respAssociatedMedias,
      this.contentTypesHostedInPublicDomain
    );
  }

  public async getAsstMediaByParentIdAndFilename(
    parentId: string,
    fileName: string
  ): Promise<ResponseModel.AssociatedMedia> {
    return associatedMediaV4Dao.getByParentIdAndLocation(parentId, fileName, [
      '_id'
    ]);
  }

  public async getAsstMediaByParentIdAndType(
    parentId: string,
    type: string
  ): Promise<ResponseModel.AssociatedMedia[]> {
    return associatedMediaV4Dao.getAsstMediaByParentIdAndType(parentId, type, [
      'location'
    ]);
  }

  public async createAssociatedMedia(
    content: StorageModel.AssociatedMedia
  ): Promise<ResponseModel.AssociatedMedia> {
    return associatedMediaV4Dao.createAssociatedMedia(content);
  }

  private enableLocationByType(
    associatedMedias: ResponseModel.AssociatedMedia[],
    selectedTypes: string[]
  ): ResponseModel.AssociatedMedia[] {
    return associatedMedias.map((associatedMedia) => {
      if (!selectedTypes.includes(associatedMedia.type)) {
        associatedMedia['location'] = null;
      }
      return associatedMedia;
    });
  }
}

export const associatedMediaV4Service = new AssociatedMediaV4Service();
