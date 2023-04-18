import Logger from '../../utils/LoggerUtil';

import { titleDao } from './Title.DAO';
import {
  IFetchVariantFilters,
  IFetchVariantsResponseBody as IVariantsInfo
} from './Title.Model';

const log = Logger.getLogger('TitleService');

class TitleService {
  public async getProductVariantsByIds(
    idName: string,
    idValues: string[],
    filters: IFetchVariantFilters
  ): Promise<IVariantsInfo[]> {
    log.debug('getTitlesDynamically:: ', { filters, idName, idValues });
    const variantsInfo: IVariantsInfo[] =
      await titleDao.getProductVariantsByIds(idName, idValues, filters);
    // Generate empty variants values for the products mising in the store/DB.
    return idValues.map((id) => {
      const variantInfoForId = variantsInfo.find(
        (variantInfo) => variantInfo.identifier.value === id
      );
      if (variantInfoForId) {
        return variantInfoForId;
      }
      return {
        identifier: { name: idName, value: id },
        variants: []
      };
    });
  }
}

export const titleService = new TitleService();
