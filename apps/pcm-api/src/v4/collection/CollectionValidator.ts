import { RequestModel } from '@tandfgroup/pcm-entity-model-v4';
import * as AmazonS3URI from 'amazon-s3-uri';
import Logger from '../../utils/LoggerUtil';
import { S3UtilsV4 } from '../utils/S3UtilsV4';

import { AppConstants } from '../../config/constant';
import { AppError } from '../../model/AppError';

const log = Logger.getLogger('CollectionValidator');

type CollectionParts = RequestModel.Collection['partsAdded'];
type CollectionCategories = RequestModel.Collection['categories'];

class CollectionValidator {
  public async validateCollection(
    productData: RequestModel.Collection,
    action?: string
  ): Promise<boolean> {
    if (productData.isPartOf) {
      throw new AppError(`Invalid property(s): isPartOf`, 400);
    }
    if (productData['availability']) {
      throw new AppError(`Invalid property(s): availability`, 400);
    }
    const categories: CollectionCategories = productData.categories;
    if (!categories) {
      throw new AppError(`Missing or Invalid required field: categories`, 400);
    }
    this._validateCategories(categories);
    const collectionUpdateType = this.getCollectionUpdateType(categories);
    const rulesList = productData.rulesList;
    if (
      collectionUpdateType === 'dynamic' &&
      (!rulesList || !Array.isArray(rulesList) || rulesList.length === 0)
    ) {
      throw new AppError(
        'Invalid or missing search rules for dynamic collection',
        400
      );
    }

    // commenting out for time being
    // if (
    //   collectionUpdateType === 'static' &&
    //   productData.collection.autoRollover !== false
    // ) {
    //   throw new AppError(
    //     'Invalid autoRollover field for static collection',
    //     400
    //   );
    // }

    const isProductLevelAvailabilityExists: boolean =
      rulesList &&
      rulesList.some((res) => {
        return !!res['availability'];
      });
    if (isProductLevelAvailabilityExists) {
      throw new AppError(
        'Invalid availability filter, product ' +
          'level availability filter is not allowed',
        400
      );
    }
    if (
      action === 'update' &&
      productData.collection &&
      !productData.collection.ruleUpdateStartDate &&
      !productData.collection.ruleUpdateEndDate
    ) {
      throw new AppError(
        `Missing ruleUpdateStartDate/ruleUpdateEndDate in the request payload.`,
        400
      );
    }
    const validTo = productData.collection.validTo;
    const plannedPublicationDate =
      productData.collection.plannedPublicationDate;

    /* this method will validate the validTo & plannedPublicationDates and their relation*/
    this._validateDatesRelation(
      validTo && validTo.toString(),
      plannedPublicationDate && plannedPublicationDate.toString()
    );
    const partsAdded = productData.partsAdded;
    const partsUpdated = productData.partsUpdated;

    if (collectionUpdateType === 'static') {
      this.validateParts(partsAdded);
      this.validateParts(partsUpdated);
    }

    // any of parts id should not match with product id
    this._validatePartIds(productData);

    // validate associated media
    await this.validateAssociatedMedia(productData.associatedMedia);

    return true;
  }

  public validateCollectionId(request): boolean {
    const {
      identifierName,
      identifierValue,
      apiVersion,
      responseGroup,
      type,
      ...rest
    } = request;
    log.debug('validateCollectionId:: ', {
      identifierName,
      identifierValue,
      type
    });
    if (rest && Object.keys(rest).length > 0) {
      const params = Object.keys(rest).toString();
      throw new AppError(`Invalid parameter ${params}`, 400);
    }
    if (!identifierName) {
      throw new AppError(`Missing parameter identifierName`, 400);
    }
    if (
      !AppConstants.WhitelistedProductIdentifiersV4.includes(identifierName) &&
      !AppConstants.WhitelistedProductIdentifiersNotInAssetsV4.includes(
        identifierName
      )
    ) {
      throw new AppError(`Incorrect identifierName ${identifierName}`, 400);
    }
    if (
      AppConstants.WhitelistedProductIdentifiersV4.includes(identifierName) &&
      type
    ) {
      throw new AppError(`Additional parameter type not required`, 400);
    }
    if (
      AppConstants.WhitelistedProductIdentifiersNotInAssetsV4.includes(
        identifierName
      ) &&
      !type
    ) {
      throw new AppError(`Missing parameter type`, 400);
    }
    if (type && !AppConstants.ProductTypesV4WithTitle.includes(type)) {
      throw new AppError(`Incorrect product type`, 400);
    }
    if (!identifierValue) {
      throw new AppError(`Missing parameter identifierValue`, 400);
    }
    return true;
  }
  private _validateDatesRelation(
    validTo: string,
    plannedPublicationDate: string
  ) {
    if (validTo && plannedPublicationDate) {
      if (
        !(this.isIsoDate(validTo) && this.isIsoDate(plannedPublicationDate))
      ) {
        throw new AppError(
          'validTo and plannedPublicationDate should ' + 'have ISO date format',
          400
        );
      }
      const d1 = new Date(validTo);
      const d2 = new Date(plannedPublicationDate);
      if (d1 < d2) {
        throw new AppError(
          'validTo date should be greater than ' + 'plannedPublicationDate.',
          400
        );
      }
    }
  }

  private getCollectionUpdateType(categories: CollectionCategories): string {
    const isDynamicCollectionUpdateType = categories.some((item) => {
      return (
        item['name'] === 'collection-update-type' && item['type'] === 'dynamic'
      );
    });
    return isDynamicCollectionUpdateType ? 'dynamic' : 'static';
  }

  private _validatePartIds(productData: RequestModel.Collection) {
    // any of parts id should not match with product id
    const parts = [
      ...(productData.partsUpdated ? productData.partsUpdated : []),
      ...(productData.partsRemoved ? productData.partsRemoved : []),
      ...(productData.partsAdded ? productData.partsAdded : [])
    ];
    const partIds = parts.map((part) => part.identifier);

    if (partIds.includes(productData._id)) {
      throw new AppError(
        productData._id +
          ' ' +
          'should not match with any of parts update/delete/added' +
          ' ' +
          'id in the request payload',
        400
      );
    }
  }
  private _validateCategories(categories: CollectionCategories) {
    let categoriesNames = [];
    let isCategoryNameExist = false;
    let isValidCategory = false;

    /* istanbul ignore else */
    if (Array.isArray(categories)) {
      categoriesNames = categories.map((item) => item.name);
      isCategoryNameExist =
        categoriesNames.includes('collection-type') &&
        categoriesNames.includes('collection-update-type');

      /* istanbul ignore else */
      if (!isCategoryNameExist) {
        throw new AppError(
          'Category must contain collection-type and collection-update-type',
          400
        );
      }

      isValidCategory = categories.some((item) => {
        return (
          item['name'] === 'collection-update-type' &&
          (item['type'] === 'static' || item['type'] === 'dynamic')
        );
      });

      /* istanbul ignore else */
      if (!isValidCategory) {
        throw new AppError(
          'Category type must be of type static or dynamic',
          400
        );
      }
    }
  }
  private isIsoDate(str: string): boolean {
    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) {
      return false;
    }
    const d = new Date(str);
    return d.toISOString() === str;
  }

  private validateParts(parts: CollectionParts) {
    if (parts && Array.isArray(parts) && parts.length > 0) {
      const partsPositions = parts.map((item) => {
        if (!item.position) {
          throw new AppError(
            'Position field is required for static collection',
            400
          );
        }
        return item.position;
      });
      const hasDuplicates =
        new Set(partsPositions).size !== partsPositions.length;
      if (hasDuplicates) {
        throw new AppError('Parts should contain unique position', 400);
      }
    }
  }
  private async validateAssociatedMedia(
    associatedMedia: RequestModel.AssociatedMedia[]
  ) {
    const validateAssociatedMediaTypes = ['coverimage', 'bannerimage'];
    if (associatedMedia) {
      if (!Array.isArray(associatedMedia)) {
        throw new AppError('Invalid associated media', 400);
      }
      for await (const content of associatedMedia) {
        if (!validateAssociatedMediaTypes.includes(content.type)) {
          throw new AppError(
            `Invalid associatedMedia type: ${content.type}`,
            400
          );
        }
        try {
          const { bucket, key } = AmazonS3URI(content.location);
          const hasContent: boolean = await S3UtilsV4.headObjects(bucket, key);
          if (!hasContent) {
            throw new AppError(
              `No content found at ${content.location} for ${content.type}`,
              400
            );
          }
        } catch (error) {
          throw new AppError(
            `Invalid S3 URI: ${content.location} for ${content.type}`,
            400
          );
        }
      }
    }
  }
}

export const collectionValidator = new CollectionValidator();
