import { ResponseModel, StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import { AppError } from '../../model/AppError';
import { partsUtil } from '../../utils/parts/Parts.Util';
import { assetV4Service } from '../assets/AssetV4.Service';
import { partsRevisionV4DAO } from '../parts/PartsRevisionV4.DAO';
import { partsV4Service } from '../parts/PartsV4.Service';
import { APIResponseGroup } from '../model/interfaces/CustomDataTypes';
import { associatedMediaV4Dao } from '../associatedMedia/AssociatedMediaV4.DAO';
import Logger from '../../utils/LoggerUtil';
const log = Logger.getLogger('PartsRevisonV4Service');
type PartsChangedInfoList = ResponseModel.PartsRevision['partsAdded'];
class PartsRevisionV4Service {
  public async getPartsRevisionDataByDate(
    id: string,
    fromDate: string,
    toDate: string
  ): Promise<Array<StorageModel.PartsRevision>> {
    log.debug(`getPartsRevisionDataByDate:: `, {
      fromDate,
      id,
      toDate
    });
    return partsRevisionV4DAO.getPartsRevisionDataByDate(id, fromDate, toDate);
  }
  public async getProductPartsDelta(
    id: string,
    fromDate: string,
    toDate: string,
    requestedParts: string[],
    channel?: string,
    responseGroup?: APIResponseGroup
  ) {
    log.debug(
      'getProductPartsDelta:: ',
      JSON.stringify({
        fromDate,
        id,
        responseGroup,
        toDate
      })
    );
    const fromdate = new Date(fromDate);
    const todate = new Date(toDate);
    if (fromdate > todate) {
      throw new AppError(
        'fromDate should be less than or equal to todate',
        400
      );
    }
    const asset: ResponseModel.Asset = await assetV4Service.getAssetById(id, [
      'type'
    ]);
    if (!asset || asset.type !== 'collection') {
      throw new AppError('No such collection (product) found', 404);
    }
    const partsRevisionData =
      await partsrevisionV4Service.getPartsRevisionDataByDate(
        id,
        fromDate,
        toDate
      );
    if (!partsRevisionData) {
      throw new AppError('Parts data not found for this product.', 404);
    }
    let partsAdded: PartsChangedInfoList = [];
    let partsRemoved: PartsChangedInfoList = [];
    let partsUpdated: PartsChangedInfoList = [];
    partsRevisionData.forEach((partsRevision) => {
      if (partsRevision.partsAdded && requestedParts.includes('partsAdded')) {
        partsAdded = partsAdded.concat(partsRevision.partsAdded);
      }
      if (
        partsRevision.partsRemoved &&
        requestedParts.includes('partsRemoved')
      ) {
        partsRemoved = partsRemoved.concat(partsRevision.partsRemoved);
      }
      if (
        partsRevision.partsUpdated &&
        requestedParts.includes('partsUpdated')
      ) {
        partsUpdated = partsUpdated.concat(partsRevision.partsUpdated);
      }
    });

    let finalPartsAdded = [];
    let finalPartsRemoved = [];
    let finalPartsUpdated = [];
    let partsAddedIfChannel = [];
    const {
      addedPartsDataFromSearchResult,
      removedPartsDataFromSearchResult,
      updatedPartsDataFromSearchResult
    } = await this.handleDateFilterOfPartsData(
      partsAdded,
      partsRemoved,
      partsUpdated,
      responseGroup
    );
    finalPartsAdded = partsUtil.mergePartsAndProductPartsData(
      partsAdded,
      addedPartsDataFromSearchResult
    );
    finalPartsRemoved = partsUtil.mergePartsAndProductPartsData(
      partsRemoved,
      removedPartsDataFromSearchResult
    );
    finalPartsUpdated = partsUtil.mergePartsAndProductPartsData(
      partsUpdated,
      updatedPartsDataFromSearchResult
    );
    if (channel) {
      partsAddedIfChannel = await this.filterNoContent(finalPartsAdded);
      return {
        partsAdded: partsAddedIfChannel,
        partsRemoved: finalPartsRemoved,
        partsUpdated: finalPartsUpdated
      };
    }

    return {
      partsAdded: finalPartsAdded,
      partsRemoved: finalPartsRemoved,
      partsUpdated: finalPartsUpdated
    };
  }
  private async filterNoContent(finalPartsAdded): Promise<string[]> {
    const partsAddedContent = await associatedMediaV4Dao.isContentExists(
      finalPartsAdded,
      ['parentId']
    );
    const filterFinalPartsAdded = finalPartsAdded.filter(
      (parts) =>
        parts._id === partsAddedContent[partsAddedContent.indexOf(parts._id)]
    );
    return filterFinalPartsAdded;
  }
  private async handleDateFilterOfPartsData(
    partsAdded: PartsChangedInfoList,
    partsRemoved: PartsChangedInfoList,
    partsUpdated: PartsChangedInfoList,
    responseGroup: APIResponseGroup
  ) {
    const searchDataForAddedParts =
      partsAdded.length > 0
        ? await partsV4Service.getSearchResults(partsAdded, { responseGroup })
        : [];
    const searchDataForRemovedParts =
      partsRemoved.length > 0
        ? await partsV4Service.getSearchResults(partsRemoved, { responseGroup })
        : [];
    const searchDataForUpdatedParts =
      partsUpdated.length > 0
        ? await partsV4Service.getSearchResults(partsUpdated, { responseGroup })
        : [];
    const addedPartsDataFromSearchResult =
      searchDataForAddedParts.length > 0
        ? partsUtil.getPartsDataFromSearchResult(searchDataForAddedParts)
        : [];
    const removedPartsDataFromSearchResult =
      searchDataForRemovedParts.length > 0
        ? partsUtil.getPartsDataFromSearchResult(searchDataForRemovedParts)
        : [];
    const updatedPartsDataFromSearchResult =
      searchDataForUpdatedParts.length > 0
        ? partsUtil.getPartsDataFromSearchResult(searchDataForUpdatedParts)
        : [];
    return {
      addedPartsDataFromSearchResult,
      removedPartsDataFromSearchResult,
      updatedPartsDataFromSearchResult
    };
  }
}

export const partsrevisionV4Service = new PartsRevisionV4Service();
