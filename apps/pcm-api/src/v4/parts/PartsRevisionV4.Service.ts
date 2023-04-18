import Logger from '../../utils/LoggerUtil';

import { apiResponseGroupConfig } from '../config';
import { APIResponseGroup } from '../model/interfaces/CustomDataTypes';
import { partsRevisionV4DAO } from './PartsRevisionV4.DAO';

const log = Logger.getLogger('PartsRevisionV4Service');

class PartsRevisionV4Service {
  public async getHasPartsCount(
    identifier: string,
    productVersion: string,
    partType?: any,
    format?: string
  ): Promise<number> {
    log.debug(`getHasPartsCount:: `, {
      format,
      identifier,
      partType,
      productVersion
    });
    return partsRevisionV4DAO.getHasPartsCount(
      identifier,
      productVersion,
      partType,
      format
    );
  }
  public async getHasParts(
    productId: string,
    productVersion: string,
    offset: number,
    limit: number,
    partType?: string,
    format?: string,
    responseGroup: APIResponseGroup = 'small'
  ): Promise<any[]> {
    log.debug(`getHasParts:: `, {
      format,
      limit,
      offset,
      partType,
      productId,
      productVersion,
      responseGroup
    });
    const projectionFields = apiResponseGroupConfig.getProjectionFields(
      'part',
      responseGroup
    );
    return partsRevisionV4DAO.getHasParts(
      productId,
      productVersion,
      offset,
      limit,
      projectionFields,
      partType,
      format
    );
  }
  public async getPartsRevisionDataByIds(
    ids: string[],
    responseGroup: APIResponseGroup = 'small'
  ) {
    log.debug(`getPartsRevisionDataById:: `, {
      ids,
      responseGroup
    });
    const projectionFields = apiResponseGroupConfig.getProjectionFields(
      'part',
      responseGroup
    );
    return partsRevisionV4DAO.getPartsRevisionDataByIds(ids, projectionFields);
  }
}
export const partsRevisionV4Service = new PartsRevisionV4Service();
