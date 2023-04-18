import Logger from '../../utils/LoggerUtil';
import * as rTracer from 'cls-rtracer';
import { get as _get } from 'lodash';
import { Config } from '../../config/config';
import { AppError } from '../../model/AppError';
import { ResponseModel } from '@tandfgroup/pcm-entity-model-v4';
import { collectionRevisionV4Service } from '../../v4/collection/CollectionRevisionV4.Service';
import { partsRevisionV4Service } from '../../v4/parts/PartsRevisionV4.Service';
import { assetV4Service } from '../../v4/assets/AssetV4.Service';
import { partsUtil } from '../../utils/parts/Parts.Util';
import { APIResponseGroup } from '../../v4/model/interfaces/CustomDataTypes';
import { partsV410DAO } from './Parts.V410.DAO';

const log = Logger.getLogger('PartsV410Service');
const docTypeToESIndexMapperV4 = Config.getPropertyValue(
  'docTypeToESIndexMapperV4'
);

class PartsV410Service {
  public async getProductHasParts(
    id: string,
    limit: number,
    offsetCursor?: string,
    region?: string,
    version?: string,
    searchTerm?: string,
    responseGroup: APIResponseGroup = 'small'
  ): Promise<any> {
    log.debug(
      'getProductHasParts:: ',
      JSON.stringify({
        id,
        limit,
        offsetCursor,
        region,
        responseGroup,
        searchTerm,
        version
      })
    );
    const asset: ResponseModel.Asset = await assetV4Service.getAssetById(id, [
      'type'
    ]);
    if (!asset || asset.type !== 'collection') {
      throw new AppError('No such collection (product) found', 404);
    }
    const collectionVersion = [];
    if (version) {
      collectionVersion.push(version);
    }
    // get corresponding collection revision id with
    // collection version and collection id (parentId)
    const collectionRevisionData =
      await collectionRevisionV4Service.getCollectionRevisionData(
        id,
        collectionVersion,
        ['_id']
      );
    if (!collectionRevisionData || !collectionRevisionData.length) {
      throw new AppError('No revision data found for this collection.', 404);
    }
    const collectionRevisionId = collectionRevisionData[0]._id;
    // get all parts from parts-revisions-4.0.1 sending collection revision id
    const partsRevisionData =
      await partsRevisionV4Service.getPartsRevisionDataByIds(
        collectionRevisionId,
        responseGroup
      );
    if (!(partsRevisionData && partsRevisionData.length)) {
      throw new AppError('No parts data found for this product.', 404);
    }
    const partsData: ResponseModel.PartsCombined[] = partsRevisionData[0].parts;
    const { searchData, searchTotalCount } = await this.getSearchResults(
      partsData,
      responseGroup,
      offsetCursor,
      limit,
      region,
      searchTerm
    );
    let firstOrLastPageData;
    // Call it for first time for getting last page _id. Later use it in every request
    if (!offsetCursor) {
      const offsetCursorLast = 'last-page-cursor';
      firstOrLastPageData = (
        await this.getSearchResults(
          partsData,
          'small',
          offsetCursorLast,
          1,
          region,
          searchTerm
        )
      ).searchData;
    }
    // Call it to get first page _id when starting from opposite. Later use it in every request
    if (offsetCursor === 'last-page-cursor') {
      firstOrLastPageData = (
        await this.getSearchResults(
          partsData,
          'small',
          null,
          1,
          region,
          searchTerm
        )
      ).searchData;
    }
    const searchedPartsData =
      partsUtil.getPartsDataFromSearchResult(searchData);
    const mergedPartsData = partsUtil.mergePartsAndProductPartsData(
      partsData,
      searchedPartsData
    );
    const counts = [];
    counts.push({
      count: searchTotalCount,
      formatsCount: [],
      type: 'total'
    });
    const paginationData = this.preparePaginationData(
      offsetCursor,
      searchData,
      firstOrLastPageData
    );
    const respMetadata = {
      counts,
      isFirstPageReached: paginationData.isFirstPageReached,
      isLastPageReached: paginationData.isLastPageReached,
      lastPageCursor: paginationData.lastPageCursor,
      limit,
      nextPageCursor: paginationData.nextPageCursor,
      prevPageCursor: paginationData.prevPageCursor,
      source: 'Elasticsearch',
      transactionId: rTracer.id()
    };
    return {
      data: mergedPartsData,
      metadata: respMetadata
    };
  }

  private prepareSortOrder(offsetCursor: string) {
    let sortOrder = 'desc';
    // change default sort order 'asc' if custom offsetCursor present
    // if offsetCursor is 'last-page-cursor' change sort order
    // to desc as it is the last page
    if (offsetCursor) {
      if (offsetCursor !== 'last-page-cursor') {
        const offsetCursorArrForColon = offsetCursor.split(':');
        const offsetCursorArr =
          offsetCursorArrForColon[offsetCursorArrForColon.length - 1].split(
            '_'
          );
        sortOrder = offsetCursorArr[2];
        offsetCursor = offsetCursorArr[0].concat('_', offsetCursorArr[1]);
      } else {
        sortOrder = 'asc';
      }
    }
    return { newOffsetCursor: offsetCursor, sortOrder };
  }

  private preparePaginationData(
    offsetCursor: string,
    searchData: any[],
    firstOrLastPageData: any
  ) {
    let lastPageId = null;
    let firstPageId = null;
    // prepare first time and later use it in forthcoming request
    if (!offsetCursor || offsetCursor === 'last-page-cursor') {
      if (!offsetCursor) {
        lastPageId = firstOrLastPageData[0]._source.tieBreakerId;
        firstPageId = searchData[0]._id;
      } else {
        firstPageId = firstOrLastPageData[0]._source.tieBreakerId;
        lastPageId = searchData.slice(-1)[0]._id;
      }
    } else {
      firstPageId = offsetCursor.split(':')[0];
      lastPageId = offsetCursor.split(':')[1];
    }
    const nextPageCursor = this._getNextPageCursor(
      searchData,
      firstPageId,
      lastPageId
    );
    const prevPageCursor = this._getPrevPageCursor(
      searchData,
      firstPageId,
      lastPageId
    );
    // delete searchAfterParams once next/prev cursor is prepared
    return {
      isFirstPageReached: prevPageCursor === null ? true : false,
      isLastPageReached: nextPageCursor === null ? true : false,
      lastPageCursor:
        offsetCursor === 'last-page-cursor' ? null : 'last-page-cursor',
      nextPageCursor:
        offsetCursor === 'last-page-cursor' ? null : nextPageCursor,
      prevPageCursor: !offsetCursor ? null : prevPageCursor
    };
  }

  private _getNextPageCursor(
    data: any[],
    firstPageId: string,
    lastPageId: string
  ): string {
    if (data && data.length > 0) {
      const textToAppend = 'desc';
      const searchAfterParams = _get(data[data.length - 1], 'sort', null);
      const cursor = searchAfterParams[1];
      if (cursor === lastPageId) return null;
      else {
        const nextPageCursor = searchAfterParams.join('_');
        return `${firstPageId}:${lastPageId}:${nextPageCursor}_${textToAppend}`;
      }
    }
    return null;
  }

  private _getPrevPageCursor(
    data: any[],
    firstPageId: string,
    lastPageId: string
  ): string {
    if (data && data.length > 0) {
      const textToAppend = 'asc';
      const searchAfterParams = _get(data[0], 'sort', null);
      const cursor = searchAfterParams[1];
      if (cursor === firstPageId) return null;
      else {
        const prevPageCursor = searchAfterParams.join('_');
        return `${firstPageId}:${lastPageId}:${prevPageCursor}_${textToAppend}`;
      }
    }
    return null;
  }

  private async getSearchResults(
    partsData: ResponseModel.PartsCombined[],
    responseGroup: APIResponseGroup,
    offsetCursor: string,
    limit: number,
    region: string,
    searchTerm: string
  ) {
    const partsTypeToIndex = partsUtil.getUniquePartTypesToIndex(partsData);
    const idsToIndex = partsUtil.getIdsFromParts(partsData);
    const projections =
      partsUtil.getProjectionsBasedOnResponseGroup(responseGroup);
    const { newOffsetCursor, sortOrder } = this.prepareSortOrder(offsetCursor);
    const { searchData, searchTotalCount } =
      await partsV410DAO.getPartsDataByRegion({
        ids: idsToIndex,
        limit,
        offsetCursor: newOffsetCursor,
        partTypeToIndex: partsTypeToIndex.toString(),
        projections,
        region,
        searchTerm,
        sortOrder
      });
    if (Array.isArray(searchData) && searchData.length !== 0) {
      if (
        newOffsetCursor &&
        (newOffsetCursor === 'last-page-cursor' || sortOrder === 'asc')
      ) {
        // reverse original products
        // this is only done for specific case when offset cursor is last-page-cursor
        searchData.reverse();
      }
    } else {
      throw new AppError('No parts data found.', 404);
    }
    return { searchData, searchTotalCount };
  }
}

export const partsV410Service = new PartsV410Service();
