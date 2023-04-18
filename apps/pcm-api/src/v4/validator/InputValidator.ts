import { StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import { Request } from 'express';
import { get as _get } from 'lodash';
import * as mime from 'mime-types';
import Logger from '../../utils/LoggerUtil';

import { isBoolean, isNumeric } from 'validator';
import { AppConstants } from '../../config/constant';
import { AppError } from '../../model/AppError';
import {
  APIResponseGroup,
  APIVersion
} from '../model/interfaces/CustomDataTypes';
import { commonValidator } from './requestValidator/CommonValidator';

const log = Logger.getLogger('InputValidator');

class InputValidator {
  private apiVersionsUnSupportResponseGroup: APIVersion[];
  private validResponseGroups: APIResponseGroup[];
  private idAndRespGroupBasedLimit: object;
  constructor() {
    this.apiVersionsUnSupportResponseGroup = ['4.0.0'];
    this.validResponseGroups = ['small', 'medium', 'large'];
    this.idAndRespGroupBasedLimit =
      AppConstants.IdentifierAndResponseGroupBasedLimitV4;
  }
  public validateAPIVersionResponseGroup(
    apiVersion: APIVersion,
    responseGroup: APIResponseGroup
  ): boolean {
    log.debug('validateAPIVersionResponseGroup:: ', {
      apiVersion,
      responseGroup
    });
    // validate apiVersion
    const validationErrors = [];
    if (responseGroup && !this.validResponseGroups.includes(responseGroup)) {
      validationErrors.push('Invalid Response group');
    }

    if (
      (!apiVersion ||
        this.apiVersionsUnSupportResponseGroup.includes(apiVersion)) &&
      responseGroup
    ) {
      // validationErrors.push('This API Version does not support response group.');
      // As per architect suggestion changing the error code to 404.
      throw new AppError(
        'This API Version does not support response group.',
        404
      );
    }

    if (validationErrors.length > 0) {
      throw new AppError(validationErrors.join('. '), 400);
    }
    return true;
  }

  public validateOffsetLimit(
    offset: string,
    limit: string,
    isSearchLimit = false,
    isPartsLimit = false
  ): boolean {
    log.debug('validateOffsetLimit:: ', { limit, offset });
    const validationErrors = commonValidator.validateOffsetLimit(
      offset,
      limit,
      isSearchLimit,
      isPartsLimit
    );

    if (validationErrors.length > 0) {
      throw new AppError(validationErrors.join(', '), 400);
    }
    return true;
  }
  public validateIdNameAndIdValues(
    identifierName: string,
    identifierValues: string,
    responseGroup: APIResponseGroup,
    productType: StorageModel.ProductType
  ): boolean {
    log.debug('validateIdNameAndIdValues:: ', {
      identifierName,
      identifierValues
    });

    const validationErrors = [];
    const defaultMaxBatchSize = _get(
      this.idAndRespGroupBasedLimit,
      `default.${responseGroup}`,
      30
    );
    const maxBatchSize = _get(
      this.idAndRespGroupBasedLimit,
      `${identifierName}.${responseGroup}`,
      defaultMaxBatchSize
    );
    const whitelistedIdentifiers =
      AppConstants.WhitelistedProductIdentifiersWithNonAssetIdentifiersV4;

    // identifierName validation
    if (identifierValues && !identifierName) {
      validationErrors.push('Missing query parameter: identifierName');
    }

    // identifierValues validation
    if (whitelistedIdentifiers.includes(identifierName) && !identifierValues) {
      validationErrors.push('Missing query parameter: identifierValues');
    }

    // If the identifier name is not whitelisted return 400
    if (identifierName && !whitelistedIdentifiers.includes(identifierName)) {
      validationErrors.push(`Invalid identifier-name: ${identifierName}`);
    }

    // type is needed if identifierName is non-asset (e.g., title)
    if (
      AppConstants.WhitelistedProductIdentifiersNotInAssetsV4.includes(
        identifierName
      ) &&
      !productType
    ) {
      validationErrors.push(
        `Missing query parameter: type when identifierName is ${identifierName}`
      );
    }

    if (whitelistedIdentifiers.includes(identifierName) && identifierValues) {
      const allIdentifierValues: string[] = identifierValues.split(',');
      if (
        Array.isArray(allIdentifierValues) &&
        allIdentifierValues.length > maxBatchSize
      ) {
        validationErrors.push(
          `identifierValues should contain min 1 and max ${maxBatchSize} values for ${identifierName}`
        );
      }
    }

    if (validationErrors.length > 0) {
      throw new AppError(validationErrors.join(', '), 400);
    }
    return true;
  }

  public validatePreArticleIdNameAndIdValues(
    identifierName: string,
    identifierValues: string,
    responseGroup: APIResponseGroup
  ): boolean {
    log.debug('validatePreArticleIdNameAndIdValues:: ', {
      identifierName,
      identifierValues
    });
    const validationErrors = [];
    const defaultMaxBatchSize = _get(
      this.idAndRespGroupBasedLimit,
      `default.${responseGroup}`,
      30
    );
    const maxBatchSize = _get(
      this.idAndRespGroupBasedLimit,
      `${identifierName}.${responseGroup}`,
      defaultMaxBatchSize
    );
    const whitelistedIdentifiers =
      AppConstants.WhitelistedPreArticleIdentifiers;

    // identifierName validation
    if (identifierValues && !identifierName) {
      validationErrors.push('Missing query parameter: identifierName');
    }

    // identifierValues validation
    if (whitelistedIdentifiers.includes(identifierName) && !identifierValues) {
      validationErrors.push('Missing query parameter: identifierValues');
    }

    // If the identifier name is not whitelisted return 400
    if (identifierName && !whitelistedIdentifiers.includes(identifierName)) {
      validationErrors.push(`Invalid identifier-name: ${identifierName}`);
    }

    if (whitelistedIdentifiers.includes(identifierName) && identifierValues) {
      const allIdentifierValues: string[] = identifierValues.split(',');
      if (
        Array.isArray(allIdentifierValues) &&
        allIdentifierValues.length > maxBatchSize
      ) {
        validationErrors.push(
          `identifierValues should contain min 1 and max ${maxBatchSize} values for ${identifierName}`
        );
      }
    }

    if (validationErrors.length > 0) {
      throw new AppError(validationErrors.join(', '), 400);
    }
    return true;
  }

  public validateProductType(productType: StorageModel.ProductType): boolean {
    log.debug('validateProductType:: ', { productType });

    const validationErrors = [];

    // productType validation
    if (productType && !AppConstants.ProductTypesV4.includes(productType)) {
      validationErrors.push(`Invalid product type : ${productType}`);
    }

    if (validationErrors.length > 0) {
      throw new AppError(validationErrors.join('. '), 400);
    }
    return true;
  }

  public validateAvailabilityNameAndStatus(
    availabilityName: string,
    availabilityStatus: string
  ): boolean {
    log.debug('validateAvailabilityNameAndStatus:: ', {
      availabilityName,
      availabilityStatus
    });

    const validationErrors = [];

    // productType validation
    if (availabilityStatus && !availabilityName) {
      validationErrors.push(
        `To use availabilityStatus, availabilityName is mandatory`
      );
    }

    if (validationErrors.length > 0) {
      throw new AppError(validationErrors.join('. '), 400);
    }
    return true;
  }

  public multipleProductsValidator(request): boolean {
    const {
      offset,
      limit,
      identifierName,
      identifierValues,
      type,
      availabilityName,
      availabilityStatus,
      responseGroup
    } = request.query;
    this.validateProductType(type);
    this.validateOffsetLimit(offset, limit);
    this.validateIdNameAndIdValues(
      identifierName,
      identifierValues,
      responseGroup,
      type
    );
    this.validateAvailabilityNameAndStatus(
      availabilityName,
      availabilityStatus
    );
    return true;
  }

  public preArticleValidator(request, response): boolean {
    const { offset, limit, identifierName, identifierValues, responseGroup } =
      request.query;
    this.validateOffsetLimit(offset, limit);
    this.validatePreArticleIdNameAndIdValues(
      identifierName,
      identifierValues,
      responseGroup
    );
    return true;
  }

  public validateFormatType(format: string): boolean {
    log.debug('validateFormatType:: ', { format });

    const validationErrors = [];

    // productType validation
    if (format && !AppConstants.FormatTypeList.includes(format)) {
      validationErrors.push(`Invalid format: ${format}`);
    }

    if (validationErrors.length > 0) {
      throw new AppError(validationErrors.join('. '), 400);
    }
    return true;
  }

  public productHasPartsValidator(request): boolean {
    const {
      offset,
      limit,
      expanded,
      format,
      type,
      responseGroup,
      productVersion,
      apiVersion,
      identifierType,
      includeCounts
    } = request.query;
    let { depth } = request.query;
    if (expanded) {
      throw new AppError('Invalid query parameter: expanded', 400);
    }
    if (responseGroup === 'large') {
      throw new AppError(`Invalid Response group: ${responseGroup}`, 400);
    }
    if (productVersion) {
      throw new AppError('currently we are not supporting productVersion', 400);
    }
    if (this.isformatAndTypeNotValid(format, type)) {
      throw new AppError(
        'format is only supported with type creativeWork',
        400
      );
    }
    if (apiVersion === '4.0.2' && !depth && depth !== 0) {
      depth = 1;
    }
    if (typeof depth === 'string' && !parseInt(depth, 10)) {
      throw new AppError(
        `Invalid query parameter: depth with value ${depth}`,
        400
      );
    }
    if (apiVersion !== '4.0.2' && depth) {
      throw new AppError(
        `depth is not supported for apiVersion ${apiVersion}`,
        400
      );
    }
    if (apiVersion === '4.0.2' && responseGroup !== 'small') {
      throw new AppError(
        `apiVersion ${apiVersion} does not support responseGroup ${responseGroup}`,
        400
      );
    }
    if (this.isDepthInvalid(apiVersion, responseGroup, depth)) {
      throw new AppError(`Invalid depth: ${depth}`, 400);
    }

    // now we don't need to validate the part-type as it may be anything ex: part, module, section
    // this.validateProductType(partType);

    this.validateOffsetLimit(offset, limit, false, true);
    this.validateFormatType(format);
    this.validateIdentifierType(identifierType);
    this.validateIncludeCounts(includeCounts);
    // might be needed in future who knows
    // this.validateAvailabilityNameAndStatus(availabilityName, availabilityStatus);
    return true;
  }
  private validateIdentifierType(identifierType: string): boolean {
    if (
      identifierType &&
      !AppConstants.WhitelistedPartsIdentiferTypes.includes(identifierType)
    ) {
      throw new AppError(`Invalid identifier type: ${identifierType}`, 400);
    }
    return true;
  }
  private validateIncludeCounts(includeCounts: string): boolean {
    if (includeCounts && !['true', 'false'].includes(includeCounts)) {
      throw new AppError(`Invalid includeCounts value: ${includeCounts}`, 400);
    }
    return true;
  }
  private isformatAndTypeNotValid(format, type): boolean {
    return (format && !type) || (format && type && type !== 'creativeWork');
  }
  private isDepthInvalid(apiVersion, responseGroup, depth): boolean {
    return (
      apiVersion === '4.0.2' &&
      responseGroup === 'small' &&
      (depth === 0 || ![1, 2].includes(parseInt(depth, 10) || 1))
    );
  }

  public productv410HasPartsValidator(request): boolean {
    const {
      apiVersion,
      offsetCursor,
      limit,
      region,
      responseGroup,
      version,
      q,
      appName,
      ...restOfBody
    } = request.query;
    log.debug('productv410HasPartsValidator:: ', {
      apiVersion,
      appName,
      limit,
      offsetCursor,
      q,
      region,
      responseGroup,
      version
    });
    const parsedLimit = parseInt(limit, 10);
    const validationErrors = [];
    if (restOfBody && Object.keys(restOfBody).length > 0) {
      const params = Object.keys(restOfBody).toString();
      throw new AppError(`Invalid parameter: ${params}`, 400);
    }
    if (responseGroup === 'large') {
      validationErrors.push(
        `Invalid Response group: ${responseGroup}. Currently we are only supporting small and medium.`
      );
    }
    if (appName && appName !== 'SF') {
      validationErrors.push(`Invalid app name ${appName}`);
    }
    if (q && !appName) {
      validationErrors.push('Missing parameter appName if q is present');
    }
    // limit validation
    if (limit && isNaN(parsedLimit)) {
      validationErrors.push('Invalid query parameter: limit');
    } else if (!isNaN(parsedLimit) && parsedLimit <= 0) {
      validationErrors.push('limit should not be less than 0');
    }
    if (offsetCursor) {
      validationErrors.push(
        ...commonValidator.validateOffsetCursor(offsetCursor, true)
      );
    }
    if (validationErrors.length > 0) {
      throw new AppError(validationErrors.join(' and '), 400);
    }
    return true;
  }

  public productPartsDeltaValidator(request: Request): boolean {
    const {
      apiVersion,
      region,
      responseGroup,
      v1,
      v2,
      include,
      ...restOfBody
    } = request.query;
    log.debug('productPartsDeltaValidator:: ', {
      apiVersion,
      include,
      region,
      responseGroup,
      v1,
      v2
    });
    const validationErrors = [];
    if (restOfBody && Object.keys(restOfBody).length > 0) {
      const params = Object.keys(restOfBody).toString();
      throw new AppError(`Invalid parameter: ${params}`, 400);
    }
    if (responseGroup === 'medium' || responseGroup === 'large') {
      validationErrors.push(
        `Invalid Response group: ${responseGroup}. Currently we are only supporting small.`
      );
    }
    if (!v1) {
      validationErrors.push('Missing collection version parameter v1');
    }
    if (!v2) {
      validationErrors.push('Missing collection version parameter v2');
    }
    if (v1 === v2) {
      validationErrors.push(
        'Delta cannot be found between same product version'
      );
    }
    if (validationErrors.length > 0) {
      throw new AppError(validationErrors.join(' and '), 400);
    }
    return true;
  }

  public validateContentAttributes(
    contentJson: StorageModel.AssociatedMedia
  ): boolean {
    log.debug('validateContentAttributes:: ', { contentJson });

    const validationErrors = [];

    const contentKeys = Object.keys(contentJson);
    let result = false;
    const validateKey = AppConstants.ValidateAsstMediaFieldsV4;
    result = validateKey.every((element) => {
      if (contentKeys.includes(element)) {
        return true;
      }
    });

    // contentAttributes validation
    if (!result) {
      validationErrors.push(
        `Invalid input content : ${JSON.stringify(contentJson)}`
      );
    }

    if (validationErrors.length > 0) {
      throw new AppError(validationErrors.join('. '), 400);
    }
    return true;
  }

  public validateAssociatedMedia(request: Request): boolean {
    const contentJson = request.body;
    const formatType = contentJson.type;
    const fileName = contentJson.fileName;
    const contentType = mime.lookup(fileName);
    this.validateContentAttributes(contentJson);
    this.validateFormatType(formatType);
    if (formatType === 'hyperlink') {
      throw new AppError('hyperlink is no more supported using this api', 400);
    }
    if (
      !contentType &&
      formatType !== 'hyperlink' &&
      formatType !== 'database'
    ) {
      throw new AppError('Invalid content-type', 400);
    }
    return true;
  }

  /**
   *
   * @param req
   * Note: All the Request query params comes as string values.
   * And isNumeric and isBoolean accepts only string values.
   */
  public validateTaxonomyQueryFilters(req: Request): boolean {
    const validationErrors = [];
    if (req.query.level && !isNumeric(req.query.level)) {
      validationErrors.push('Query-param `level` value is not Numeric');
    }

    if (req.query.isCodePrefix && !isBoolean(req.query.isCodePrefix)) {
      validationErrors.push('Query-param `isCodePrefix` value is not Boolean');
    }

    if (req.query.extendLevel && !isBoolean(req.query.extendLevel)) {
      validationErrors.push('Query-param `extendLevel` value is not Boolean');
    }

    if (req.query.extendLevel && !req.query.level) {
      validationErrors.push(
        'Query-param `level` is mandatory when `extendLevel` is passed'
      );
    }

    if (req.query.isCodePrefix && !req.query.code) {
      validationErrors.push(
        'Query-param `code` is mandatory when `isCodePrefix` is passed'
      );
    }

    if (validationErrors.length > 0) {
      throw new AppError(validationErrors.join(' and '), 400);
    }
    return true;
  }
  /**
   *
   * @param req
   * Note: All the Request query params comes as string values.
   * And isNumeric and isBoolean accepts only string values.
   */
  public validateTaxonomyClassificationFilters(req: Request): boolean {
    const validationErrors = [];

    if (!req.query.classificationFamily) {
      validationErrors.push('Query-param `classificationFamily` is mandatory');
    } else if (
      !['rom', 'hobs', 'ubx'].includes(req.query.classificationFamily)
    ) {
      validationErrors.push(
        'Query-param `classificationFamily` value is invalid'
      );
    }

    if (req.query.level && !isNumeric(req.query.level)) {
      validationErrors.push('Query-param `level` value is not Numeric');
    }

    if (req.query.includeChildren && !isBoolean(req.query.includeChildren)) {
      validationErrors.push(
        'Query-param `includeChildren` value is not Boolean'
      );
    }

    if (validationErrors.length > 0) {
      throw new AppError(validationErrors.join(' and '), 400);
    }
    return true;
  }
}
export const inputValidator = new InputValidator();
