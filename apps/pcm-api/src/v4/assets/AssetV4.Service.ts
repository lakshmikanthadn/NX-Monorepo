import { StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import Logger from '../../utils/LoggerUtil';
import { AppError } from '../../model/AppError';

import { assetDaoV4 } from './AssetV4.DAO';
import { productV4Service } from '../products/ProductV4.Service';

const log = Logger.getLogger('AssetV4Service');

class AssetV4Service {
  public async getProductByIdentifier(
    identifierName: string,
    identifierValue: string
  ): Promise<StorageModel.Asset> {
    log.debug(`getProductByIdentifier:: `, { identifierName, identifierValue });
    return assetDaoV4.getAssetByIdentifierNameValue(
      identifierName,
      identifierValue,
      []
    );
  }

  public async createAsset(
    asset: StorageModel.Asset
  ): Promise<StorageModel.Asset> {
    log.debug(`createAsset:: asset: ${asset}`);
    return assetDaoV4.createAsset(asset);
  }

  public async updateAssetSources(
    parentId: string
  ): Promise<StorageModel.Asset> {
    log.debug(`updateAssetSources:: parentId: ${parentId}`);
    return assetDaoV4.updateAssetSources(parentId);
  }

  public async getAssetById(
    id: string,
    projectionProperties: string[] = []
  ): Promise<StorageModel.Asset> {
    log.debug(`getAssetById:: id: ${id}`);
    return assetDaoV4.getAssetById(id, projectionProperties);
  }

  public async getAssetsByIds(
    ids: string[],
    projectionProperties: string[] = []
  ): Promise<StorageModel.Asset[]> {
    log.debug(`getAssetByIds:: ids: ${ids.join()}`);
    return assetDaoV4.getAssetsByIds(ids, projectionProperties);
  }

  /**
   * Get the Product ID of the requested content by using
   * Note: Here the identifier should be unique,
   * if an given identifier matches more than one product an 400 error is thrown
   * except for the books where we try to get the eBook
   * @param identifierName identifier name (isbn/doi/_id)
   * @param identifierValue value of the identifier
   */
  public async getValidAssetByIdentifierNameValue(
    identifierName: string,
    identifierValue: string
  ): Promise<{ _id: string; type: StorageModel.ProductType }> {
    log.debug(`getValidAssetByIdentifierNameValue:: `, {
      identifierName,
      identifierValue
    });
    const assets = await this.getAssetsByIdentifierNameValues(identifierName, [
      identifierValue
    ]);
    if (!assets || assets.length <= 0) {
      return { _id: null, type: null };
    }

    // If Only One Asset for the ID then Return
    if (assets.length === 1) {
      return assets[0];
    }

    // If more than one Product then Calculate the Uniqe Product Types
    const productTypes = assets.map((asset) => asset.type);
    const uniqueProductTypes = new Set(productTypes);

    // Try to Pick the Best book if Book Present
    if (uniqueProductTypes.has('book')) {
      const bookAssets = assets.filter((asset) => asset.type === 'book');
      const ids: string[] = bookAssets.map((book) => book._id);
      return {
        _id: await productV4Service.getValidEbookId(ids, bookAssets[0].type),
        type: bookAssets[0].type
      };
    }

    // Try to Pick the Best chapter if chapter Present
    if (uniqueProductTypes.has('chapter')) {
      const chapterAssets = assets.filter((asset) => asset.type === 'chapter');
      let assetsWithCmsContent = chapterAssets.filter((asset) =>
        asset._sources.find((source) => source.source === 'CMS')
      );
      if (assetsWithCmsContent.length === 0) {
        assetsWithCmsContent = chapterAssets;
      }
      return assetsWithCmsContent.sort(
        (a, b) => b._modifiedDate.getTime() - a._modifiedDate.getTime()
      )[0];
    }

    if (uniqueProductTypes.size > 1) {
      log.error(
        `Product identifier ${identifierValue} is associated with ` +
          ` multiple product types: ${JSON.stringify([...uniqueProductTypes])}`
      );
      throw new AppError(
        'Product identifier is associated with multiple product types.',
        409
      );
    } else {
      throw new AppError(
        'Product identifier is associated with more than one Product.',
        409
      );
    }
  }
  public async getAssetsByIdentifierNameValues(
    keyname: string,
    keyvalues: string[],
    productType?: StorageModel.ProductType
  ): Promise<StorageModel.Asset[]> {
    log.debug(`getAssetsByIdentifierNameValues:: `, {
      keyname,
      keyvalues,
      productType
    });
    return assetDaoV4.getAssetsByIdentifierNameValues(
      keyname,
      keyvalues,
      productType
    );
  }
}

// This module exports only one instance of the AssetService instead of exporting the class.
export const assetV4Service = new AssetV4Service();
