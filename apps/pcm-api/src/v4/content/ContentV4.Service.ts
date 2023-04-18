import { ResponseModel, StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import * as jwtDecode from 'jwt-decode';
import Logger from '../../utils/LoggerUtil';

import { AppError } from '../../model/AppError';
import { Config } from '../../config/config';
import { AppConstants } from '../../config/constant';
import { entitlementUtils } from '../../utils/EntitlementUtil';
import { assetV4Service } from '../assets/AssetV4.Service';
import { associatedMediaV4Service } from '../associatedMedia/AssociatedMediaV4.Service';
import { cloudfrontService } from '../aws/cloudfront/CloudFront.Service';
import { creativeWorkV4Service } from '../creativeWork/CreativeWorkV4.Service';
import { IResponseEntitlement } from '../model/interfaces/Entitlement';
import { partsV4Service } from '../parts/PartsV4.Service';
import { productV4Service } from '../products/ProductV4.Service';
import { S3UtilsV4 } from '../utils/S3UtilsV4';
import * as AmazonS3URI from 'amazon-s3-uri';
import {
  IContentFilterOptions,
  IContentMetaQueryParams
} from './ContentMetaQueryParams';

const log = Logger.getLogger('ContentV4Service');

class ContentV4Service {
  public async createAssociatedMedia(contentData): Promise<any> {
    log.debug(`createAssociatedMedia::`, { contentData });

    const fileName = contentData.fileName;
    const parentId = contentData.parentId;
    const contentType = contentData.type;

    // checking whether content is in asset or not
    const asset: ResponseModel.Asset = await assetV4Service.getAssetById(
      parentId,
      ['type']
    );
    if (!asset) {
      throw new AppError('Product (asset) not found.', 404);
    }

    // currently supporting creativeWork only
    if (asset.type !== 'creativeWork') {
      throw new AppError(
        'this api supports asset type as creativeWork only',
        400
      );
    }

    // prepare unsigned url
    const bucketName = Config.getPropertyValue('contentS3Bucket');
    const region = Config.getPropertyValue('secretRegion');
    const absolutePath = `creativework/${parentId}`;
    const unsignedUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${absolutePath}/${fileName}`;
    if (!(contentType === 'hyperlink' || contentType === 'database')) {
      contentData['location'] = unsignedUrl;
    } else {
      contentData['location'] = fileName;
    }

    // checking based on fileName aka location and parentId from associatedMedia
    // if for a particular parentId same fileName aka location is entered again
    //      it will not allow to overwrite
    // but, for a particular parentId multiple contents are allowed
    //      using different fileName aka location
    const isAssociatedtMediaExists =
      await associatedMediaV4Service.getAsstMediaByParentIdAndFilename(
        parentId,
        contentData.location
      );
    if (isAssociatedtMediaExists) {
      throw new AppError(
        'A content already exists with this fileName & parentId.',
        400
      );
    }
    const associatedMedia =
      await associatedMediaV4Service.createAssociatedMedia(
        this.prepareAsstMedia(contentData)
      );
    if (!associatedMedia) {
      throw new AppError('Error while creating content', 400);
    }
    let signedUrl;
    if (contentType === 'hyperlink' || contentType === 'database') {
      signedUrl = fileName;
    } else {
      signedUrl = await S3UtilsV4.getPresignedUrlToUpload(
        absolutePath,
        fileName
      );
    }
    if (!(signedUrl && signedUrl !== '')) {
      throw new AppError('Error while creating signedUrl', 400);
    }
    await creativeWorkV4Service.updateCreativeWorkSources(parentId);
    await assetV4Service.updateAssetSources(parentId);
    log.debug(`createAssociatedMedia::`, { associatedMedia, signedUrl });
    return { _id: associatedMedia._id, location: signedUrl };
  }

  public async getContentByIdAndType(
    productId: string,
    parentId: string,
    contentMetaField: IContentMetaQueryParams
  ): Promise<ResponseModel.AssociatedMedia[]> {
    const {
      contentType: requestedContentType,
      toRender,
      token,
      filenamePrefix,
      skipEntitlementCheck = false,
      isBot,
      ip,
      cf
    } = contentMetaField;
    // replacing debug log with info for time being
    log.info(`getContentByIdAndType::`, {
      filenamePrefix,
      isBot,
      parentId,
      productId,
      requestedContentType,
      skipEntitlementCheck,
      toRender
    });
    const contentType = await this.remapContent(requestedContentType);
    let signedAssociatedMedia = [];
    // checking whether asset is available or not
    const asset = await assetV4Service.getAssetById(productId, ['type']);
    if (!asset) {
      throw new AppError('Product Asset not found', 404);
    }
    const assetType = asset.type;
    const currentVersion = await this.checkCurrentVersionBasedOnAssetType(
      assetType,
      productId
    );
    /* getting all associatedMedias related to productId
     * segregating associatedMedia based on type(s) provided
     */
    const asstMediasByType = await this.getAsstMediaByType(
      productId,
      currentVersion,
      contentType
    );
    const contentTypesNotWhitelistedCount = await this.NonWhiteListContentCount(
      asstMediasByType
    );
    // checking before PayWall or after PayWall
    if (
      contentTypesNotWhitelistedCount === 0 ||
      skipEntitlementCheck === true
    ) {
      signedAssociatedMedia = await this.getSignedOrUnsignedAsstdMedia(
        asstMediasByType,
        { cf, filenamePrefix, ip, isBot, toRender }
      );
      // adding accessType in content
      return signedAssociatedMedia.map((media) => {
        media.accessType = null;
        return media;
      });
    } else {
      const response = await this.checkEntitlement(
        asset,
        parentId,
        token,
        toRender,
        ip
      );
      log.info(`getContentByIdAndType:: ${{ ...response }}`);
      if (!response.isEntitlementAvailable) {
        throw new AppError(`You do not have access to view this content`, 403);
      }
      signedAssociatedMedia = await this.getSignedOrUnsignedAsstdMedia(
        asstMediasByType,
        { cf, filenamePrefix, ip, isBot, toRender }
      );
      // adding accessType in content
      return signedAssociatedMedia.map((media) => {
        media.accessType = response.entitlementType;
        return media;
      });
    }
  }
  public async getOAandBeforePayWallContentByIdAndType(
    productId: string,
    parentId: string,
    contentMetaField: IContentMetaQueryParams
  ): Promise<ResponseModel.AssociatedMedia[]> {
    const {
      contentType: requestedContentType,
      toRender,
      filenamePrefix,
      isBot,
      ip,
      cf
    } = contentMetaField;
    // replacing debug log with info for time being
    log.info(`getOAandBeforePayWallContentByIdAndType::`, {
      filenamePrefix,
      isBot,
      parentId,
      productId,
      requestedContentType,
      toRender
    });
    const contentType = await this.remapContent(requestedContentType);
    let signedAssociatedMedia = [];
    // checking whether asset is available or not
    const asset = await assetV4Service.getAssetById(productId, ['type']);
    if (!asset) {
      throw new AppError('Product Asset not found', 404);
    }
    const assetType = asset.type;
    const currentVersion = await this.checkCurrentVersionBasedOnAssetType(
      assetType,
      productId
    );
    /* getting all associatedMedias related to productId
     * segregating associatedMedia based on type(s) provided
     */
    const asstMediasByType = await this.getAsstMediaByType(
      productId,
      currentVersion,
      contentType
    );
    const contentTypesNotWhitelistedCount = await this.NonWhiteListContentCount(
      asstMediasByType
    );
    // checking before PayWall or after PayWall
    if (contentTypesNotWhitelistedCount === 0) {
      signedAssociatedMedia = await this.getSignedOrUnsignedAsstdMedia(
        asstMediasByType,
        { cf, filenamePrefix, ip, isBot, toRender }
      );
      // adding accessType in content
      return signedAssociatedMedia.map((media) => {
        media.accessType = null;
        return media;
      });
    } else {
      const isOA = await productV4Service.isOpenAccess(asset.type, asset._id);
      if (isOA) {
        signedAssociatedMedia = await this.getSignedOrUnsignedAsstdMedia(
          asstMediasByType,
          { cf, filenamePrefix, ip, isBot, toRender }
        );
        // adding accessType in content
        return signedAssociatedMedia.map((media) => {
          media.accessType = 'openAccess';
          return media;
        });
      } else {
        throw new AppError(`The product is not open access`, 400);
      }
    }
  }

  private async checkEntitlement(
    asset: ResponseModel.Asset,
    parentId: string,
    token: string,
    toRender?: boolean,
    ip?: string
  ): Promise<IResponseEntitlement> {
    log.debug(`checkEntitlement:: `, { asset, parentId });
    const apiVersion = '4.0.1';
    let isEntitlementAvailable = true;
    let entitlementType = '';
    if (!asset) {
      log.debug(`checkEntitlement:: asset: ${asset} not found.`);
      throw new AppError('Content not found', 404);
    }
    const promises = [productV4Service.isOpenAccess(asset.type, asset._id)];
    if (parentId) {
      promises.push(partsV4Service.isAccessibleForFree(parentId, asset._id));
    } else {
      promises.push(Promise.resolve(false));
    }
    log.debug(`checkEntitlement:: token: ${token}`);
    const decodedJwt: any = jwtDecode(token);
    const user = decodedJwt.user;
    if (user) {
      const partyId = user.partyId;
      const organizationId = user.organizationId;
      promises.push(
        entitlementUtils.isEntitled(
          partyId,
          asset._id,
          organizationId,
          apiVersion,
          toRender,
          token,
          ip
        )
      );
    } else {
      promises.push(Promise.resolve(false));
    }
    const entitlementData = await Promise.all(promises);
    if (entitlementData[0]) {
      entitlementType = 'openAccess';
    } else if (entitlementData[1]) {
      entitlementType = 'freeAccess';
    } else if (entitlementData[2]) {
      entitlementType = 'licensed';
    } else {
      isEntitlementAvailable = false;
    }
    return Promise.resolve({
      entitlementType,
      isEntitlementAvailable
    });
  }
  private async remapContent(requestedContentType) {
    const allRequestedContentTypes = requestedContentType
      ? requestedContentType.split(',')
      : [];
    return this.remapContentType(allRequestedContentTypes);
  }
  private async checkCurrentVersionBasedOnAssetType(
    assetType,
    productId
  ): Promise<string> {
    let currentVersion;
    if (assetType === 'scholarlyArticle') {
      const productWrapper = await productV4Service.getProductById(
        productId,
        'medium',
        null,
        null
      );
      currentVersion =
        productWrapper && productWrapper.product[`${assetType}`].currentVersion;
    }
    return currentVersion;
  }
  private async getAsstMediaByType(productId, currentVersion, contentType) {
    const asstMedias =
      await associatedMediaV4Service.getContentMetaDataByParentid(
        productId,
        true,
        currentVersion
      );
    if (!asstMedias || asstMedias.length === 0) {
      log.warn(
        `getContentByIdAndType:: No associatedmedia found for ${{
          currentVersion,
          productId
        }}`
      );
      return [];
    }
    const asstMediasByType = contentType.length
      ? asstMedias.filter((media) => contentType.includes(media.type))
      : asstMedias;
    return asstMediasByType;
  }
  private async NonWhiteListContentCount(asstMediasByType) {
    const contentTypesNotWhitelistedCount =
      asstMediasByType.length &&
      asstMediasByType.reduce(
        (
          nonWhitelistedCount: number,
          asstMedia: ResponseModel.AssociatedMedia
        ) => {
          if (
            !AppConstants.ContentTypesWhitelistBeforePayWall.includes(
              asstMedia.type
            )
          ) {
            nonWhitelistedCount++;
          }
          return nonWhitelistedCount;
        },
        0
      );
    return contentTypesNotWhitelistedCount;
  }

  private async getSignedOrUnsignedAsstdMedia(
    asstMedias: ResponseModel.AssociatedMedia[],
    { toRender, filenamePrefix, isBot, ip, cf }: IContentFilterOptions
  ): Promise<ResponseModel.AssociatedMedia[]> {
    log.debug(`getSignedOrUnsignedAsstdMedia:: `, { asstMedias, toRender });
    let signedAssociatedMedia = [];
    const associatedMediaPromise = asstMedias.map(async (media) => {
      if (AppConstants.ContentTypesSignatureNotRequired.includes(media.type)) {
        return Promise.resolve({
          _id: media._id,
          location: media.location,
          size: media.size,
          type: media.type
        });
      } else {
        return this.getSignedAsstdMedia(media, {
          cf,
          filenamePrefix,
          ip,
          isBot,
          toRender
        });
      }
    });
    signedAssociatedMedia = await Promise.all(associatedMediaPromise);
    log.debug(`getSignedOrUnsignedAsstdMedia:: `, { signedAssociatedMedia });
    return signedAssociatedMedia;
  }

  private async getSignedAsstdMedia(
    media: ResponseModel.AssociatedMedia,
    { toRender, filenamePrefix, isBot, ip, cf }: IContentFilterOptions
  ): Promise<ResponseModel.AssociatedMedia> {
    log.debug(`getSignedAsstdMedia:: `, { isBot, media, toRender });
    const { bucket, key } = AmazonS3URI(media.location);
    const hasContent: boolean = await S3UtilsV4.headObjects(bucket, key);
    if (!hasContent) {
      log.error(`No content found at ${media.location} for ${media.type}`);
      return {
        _id: media._id,
        location: null,
        size: media.size,
        type: media.type
      } as ResponseModel.AssociatedMedia;
    }
    if (cf === true) {
      const location = new URL(media.location);
      const url = await cloudfrontService.getSignedUrlToRead(
        location.pathname,
        { contentType: media.type, filenamePrefix, ip, isBot, toRender }
      );
      return {
        _id: media._id,
        location: url,
        size: media.size,
        type: media.type
      } as ResponseModel.AssociatedMedia;
    } else {
      const url = await S3UtilsV4.getPresignedUrlToRead(
        media.location,
        toRender,
        media.type ? media.type.includes('pdf') : false,
        filenamePrefix,
        media.type,
        isBot
      );
      if (url === 'https://s3.amazonaws.com/') {
        throw new Error('Error generating presigned url for the content');
      }
      return {
        _id: media._id,
        location: url,
        size: media.size,
        type: media.type
      } as ResponseModel.AssociatedMedia;
    }
  }

  private prepareAsstMedia(associatedMedia): StorageModel.AssociatedMedia {
    return {
      _id: productV4Service.getNewId(),
      location: associatedMedia.location,
      parentId: associatedMedia.parentId,
      parentType: 'creativeWork',
      size: null,
      type: associatedMedia.type,
      versionType: 'FINAL'
    };
  }

  /**
   * This method remap the requested content type(s) to the actual content type(s)
   * stored in the associated media
   * @param requestedContentType array of strings representing content types
   * @returns string array with mapped content types
   */
  private remapContentType(requestedContentType: string[]): string[] {
    return requestedContentType.map((type) => {
      return AppConstants.ContentTypeMapping[type] || type;
    });
  }
}

export const contentV4Service = new ContentV4Service();
