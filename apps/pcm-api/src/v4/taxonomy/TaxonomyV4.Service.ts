import { ResponseModel } from '@tandfgroup/pcm-entity-model-v4';
import Logger from '../../utils/LoggerUtil';
import { apiResponseGroupConfig } from '../config/apiResponseGroupConfig';
import {
  ITaxonomyFilter,
  ITaxonomyMasterFilter,
  ITaxonomyMasterResponse
} from '../model/interfaces/TaxonomyFilter';
import { taxonomyV4DAO } from './TaxonomyV4.DAO';

const log = Logger.getLogger('TaxonomyV4Service');

export class TaxonomyV4Service {
  public async getTaxonomy(
    assetType: string,
    taxonomyType: string,
    taxonomyFilter: ITaxonomyFilter
  ): Promise<ResponseModel.Taxonomy[]> {
    log.debug('getTaxonomy:: ', { assetType, taxonomyFilter, taxonomyType });
    const projectionFields =
      apiResponseGroupConfig.getProjectionFieldsForTaxonomy();
    return taxonomyV4DAO.getTaxonomy(
      assetType,
      taxonomyType,
      taxonomyFilter,
      projectionFields
    );
  }
  public async getTaxonomyClassifications(
    taxonomyFilter: ITaxonomyMasterFilter
  ): Promise<ITaxonomyMasterResponse[]> {
    log.debug('getTaxonomyClassifications:: ', { taxonomyFilter });
    const projectionFields =
      apiResponseGroupConfig.getProjectionFieldsForTaxonomyMaster();
    let taxonomyMasterResponse: any[];
    if (taxonomyFilter.classificationFamily === 'ubx') {
      const filter: ITaxonomyFilter = {
        code: taxonomyFilter.code,
        extendLevel: taxonomyFilter.includeChildren,
        isCodePrefix:
          taxonomyFilter.code &&
          (taxonomyFilter.level || taxonomyFilter.includeChildren)
            ? true
            : false,
        level: taxonomyFilter.level
      };
      taxonomyMasterResponse = await taxonomyV4DAO.getTaxonomy(
        null,
        taxonomyFilter.classificationType,
        filter,
        projectionFields
      );
    } else {
      taxonomyMasterResponse = await taxonomyV4DAO.getTaxonomyClassifications(
        taxonomyFilter,
        projectionFields
      );
    }
    return this._transformTaxonomyClassifications(taxonomyMasterResponse);
  }
  private _transformTaxonomyClassifications(
    taxonomyMasterResponse: any[]
  ): ITaxonomyMasterResponse[] {
    return taxonomyMasterResponse.map((taxonomy) => {
      return {
        _id: taxonomy._id.toString(),
        classificationType: taxonomy.classificationType
          ? taxonomy.classificationType
          : taxonomy.type,
        code: taxonomy.code,
        level: taxonomy.level,
        name: taxonomy.name,
        parentId: taxonomy.parentId ? taxonomy.parentId.toString() : null
      };
    });
  }
}

export const taxonomyV4Service = new TaxonomyV4Service();
