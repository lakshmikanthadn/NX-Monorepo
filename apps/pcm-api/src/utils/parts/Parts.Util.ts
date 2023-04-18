import { ResponseModel } from '@tandfgroup/pcm-entity-model-v4';
import { esQueryUtil } from '../ESQuery.Util';
import { apiResponseGroupConfig } from '../../v4/config';
import { APIResponseGroup } from '../../v4/model/interfaces/CustomDataTypes';
type PartsChangedInfoList = ResponseModel.PartsRevision['partsAdded'];
class PartsUtil {
  public getUniquePartTypesToIndex(
    partsData: Array<{ type: string }>
  ): string[] {
    const uniquePartsType = new Set(partsData.map((parts) => parts.type));
    return [...uniquePartsType].map((partType: string) => {
      return esQueryUtil.getESIndexByProductType(partType);
    });
  }

  public getIdsFromParts(partsData: Array<{ _id: string }>): string[] {
    return partsData.map((part) => {
      return part._id;
    });
  }

  public getProjectionsBasedOnResponseGroup(
    resGroup: APIResponseGroup
  ): string[] {
    if (resGroup === 'small') {
      return [
        ...apiResponseGroupConfig.getProjectionFields(
          'allProducts',
          'partSmall'
        )
      ];
    } else {
      return [
        ...apiResponseGroupConfig.getProjectionFields(
          'allProducts',
          'partMedium'
        )
      ];
    }
  }

  public mergePartsAndProductPartsData(
    partsData: ResponseModel.PartsCombined[] | PartsChangedInfoList,
    esProductData: any[]
  ) {
    const merged = [];
    for (const prod of esProductData) {
      merged.push({
        ...partsData.find((part) => part._id === prod._id),
        ...prod
      });
    }
    return merged;
  }

  public getPartsDataFromSearchResult(searchData: any[]) {
    return searchData.map((part) => {
      const productType = part._source?.type;
      const data = { _id: part._id };
      if (part._source && part._source[productType])
        data[`${productType}`] = part._source[productType];
      if (part._source?.contributors)
        data['contributors'] = part._source.contributors;
      if (part._source?.identifiers)
        data['identifiers'] = part._source.identifiers;
      if (part._source?.permissions)
        data['permissions'] = part._source.permissions;
      if (part._source?.prices) data['prices'] = part._source.prices;
      if (part._source?.title) data['title'] = part._source.title;
      if (productType === 'collection' && part._source?.categories) {
        data['categories'] = part._source.categories;
      }
      return data;
    });
  }

  public getPartsDiff(
    olderPartsData: ResponseModel.PartsCombined[],
    newerPartsData: ResponseModel.PartsCombined[]
  ): ResponseModel.PartsCombined[] {
    return newerPartsData.filter((newPart) => {
      return !olderPartsData.some((oldPart) => oldPart._id === newPart._id);
    });
  }
}

export const partsUtil = new PartsUtil();
