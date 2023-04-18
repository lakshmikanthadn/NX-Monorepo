import { ResponseModel, StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import * as _ from 'lodash';
import * as uuidV4 from 'uuid/v4';
import Logger from '../../utils/LoggerUtil';
import { GroupedSearchQuery } from '@tandfgroup/pcm-rules-parser';
import { getMeaningFullUrl } from '@tandfgroup/framework-utility-ubx-website';
import * as rTracer from 'cls-rtracer';
import { eventService } from '../event/Event.Service';

import { Config } from '../../config/config';
import { searchV4Service } from '../search/SearchV4Service';
import { AppConstants } from '../../config/constant';
import { AppError } from '../../model/AppError';
import { searchQueryUtil } from '../../utils/SearchQueryUtil';
import { assetV4Service } from '../assets/AssetV4.Service';
import { associatedMediaV4Service } from '../associatedMedia/AssociatedMediaV4.Service';
import { apiResponseGroupConfig } from '../config';
import { creativeWorkV4Service } from '../creativeWork/CreativeWorkV4.Service';
import {
  APIResponseGroup,
  APIVersion
} from '../model/interfaces/CustomDataTypes';
import { IOAUpdateWrapper } from '../model/interfaces/OAUpdateWrapper';
import { IProductFilterOptions } from '../model/interfaces/ProductFilterOptions';
import { IProductWrapper } from '../model/interfaces/ProductWrapper';
import { ISearchReqDownload } from '../model/interfaces/SearchResult';
import {
  ITaxonomyFilter,
  ITaxonomyMasterFilter,
  ITaxonomyMasterResponse
} from '../model/interfaces/TaxonomyFilter';
import { taxonomyV4Service } from '../taxonomy/TaxonomyV4.Service';
import { SQSUtilsV4 } from '../utils/SQSUtilsV4';
import { productV4DAO } from './ProductV4.DAO';
import { manuscriptV4DAO } from './ManuscriptV4.DAO';
import { S3UtilsV4 } from '../utils/S3UtilsV4';
import { ISQSQueueUrlData } from 'v4/model/interfaces/SQSQueueUrlData';

const log = Logger.getLogger('ProductV4Service');
const ubxWebsUrl = Config.getPropertyValue('ubxWebsUrl');

interface IProductByIdTypeQuery {
  productType: StorageModel.ProductType;
  id: string;
  responseGroup: APIResponseGroup;
  productVersion?: string;
  hasPartPosition?: number;
  availabilityName?: string;
  availabilityStatus?: string[];
  region?: string;
}

class ProductV4Service {
  private productSource = 'SEARCHDOWNLOAD';
  private searchResultDownloadQueue: ISQSQueueUrlData = Config.getPropertyValue(
    'searchResultDownloadQueue'
  );
  public async getReport(type: string): Promise<string> {
    const bucketName = Config.getPropertyValue('contentS3Bucket');
    const absolutePath = `${type}/reports/daily/${type}.zip`;
    const unsignedUrl = `https://${bucketName}.s3.eu-west-1.amazonaws.com/${absolutePath}`;
    return S3UtilsV4.getPresignedUrlToRead(unsignedUrl, false, false);
  }

  public async uploadSearchRequest(searchRequestData: ISearchReqDownload) {
    log.debug('uploadSearchRequest::,', { action: searchRequestData.action });
    const rulesList = searchRequestData.rulesList;
    let finalRule;
    rulesList.forEach((sq) => {
      const queries = searchQueryUtil.getQueryForRulesProductsQuery(
        sq.type,
        sq.rules
      );
      const availability = searchRequestData.availability;
      if (availability) {
        const searchQueryParserResult = _.cloneDeep(rulesList);
        searchQueryParserResult[0].rules = queries;
        const availabilityName = availability.name;
        const availabilityStatus = availability.status;
        const queryWithAvailability = searchV4Service._getQueryWithAvailability(
          searchQueryParserResult,
          availabilityName,
          availabilityStatus,
          availability
        );

        finalRule = queryWithAvailability[0].rules;
      } else {
        finalRule = queries;
      }

      // preparing final rulesString to be processed
      sq.rulesString = JSON.stringify(finalRule, searchQueryUtil.replacer);
      // update rulesString for date
      sq.rulesString = sq.rulesString.replace(/"ISODate\(/g, 'ISODate("');
      sq.rulesString = sq.rulesString.replace(/Z\)"/g, 'Z")');
      // send sqs message
    });
    eventService.sendProductEvent(
      searchRequestData,
      this.searchResultDownloadQueue,
      this.productSource,
      {}
    );
    return { _id: searchRequestData._id };
  }

  public getNewId(): string {
    log.debug('getNewId');
    const uuid: string = uuidV4();
    if (uuid) {
      return uuid;
    } else {
      throw new AppError('Could not generate UUID at this moment', 404);
    }
  }

  public getTransactionId() {
    return rTracer.id();
  }

  public async createProduct(
    product: StorageModel.Product
  ): Promise<StorageModel.Product> {
    const productType = product.type;
    const creativeWork = product.creativeWork;
    // _createdDate and _modifiedDate are handled by mongoose.
    delete product._createdDate;
    delete product._modifiedDate;
    if (!productType) {
      throw new AppError('Product Type not defined', 400);
    }
    if (productType !== 'creativeWork') {
      throw new AppError(`Invalid Product type: ${productType}.`, 405);
    }
    if (!creativeWork) {
      throw new AppError(`Invalid creativeWork: ${product.creativeWork}.`, 400);
    }

    // no need to store mediaType
    delete product.creativeWork['mediaType'];

    product._sources = [{ source: 'WEBCMS', type: 'product' }];

    const format = product.creativeWork.format;
    if (!(format && AppConstants.FormatTypeList.includes(format))) {
      throw new AppError(`Invalid format: ${format}.`, 400);
    }

    if (!product.subType) {
      product.subType = format;
    }
    return creativeWorkV4Service.createCreativeWork(product);
  }
  public async uploadOAUpdate(oaUpdate: any, id: string) {
    log.debug('uploadOAUpdate::,', oaUpdate);
    const asset: ResponseModel.Asset = await assetV4Service.getAssetById(id, [
      'type'
    ]);
    if (!asset) {
      throw new AppError('Product (asset) not found.', 404);
    }
    const uploadOAUpdate: IOAUpdateWrapper = {
      callBackurl: oaUpdate.callBackurl,
      data: oaUpdate.requestPayload,
      orderNumber: oaUpdate.orderNumber,
      transactionId: oaUpdate.requestId
    };
    uploadOAUpdate.data.id = id;
    const messageId = await SQSUtilsV4.sendOAUpdateMessage(uploadOAUpdate);
    if (!(messageId && messageId !== '')) {
      throw new AppError('Error while uploading oaUpdate message', 500);
    }
    return messageId;
  }

  public async getTaxonomy(
    assetType: string,
    taxonomyType: string,
    taxonomyFilter: ITaxonomyFilter
  ): Promise<ResponseModel.Taxonomy[]> {
    log.debug('getTaxonomy:: ', { assetType, taxonomyFilter, taxonomyType });
    return taxonomyV4Service.getTaxonomy(
      assetType,
      taxonomyType,
      taxonomyFilter
    );
  }

  public async getTaxonomyClassifications(
    taxonomyFilter: ITaxonomyMasterFilter
  ): Promise<ITaxonomyMasterResponse[]> {
    log.debug('getTaxonomyClassifications:: ', { taxonomyFilter });
    return taxonomyV4Service.getTaxonomyClassifications(taxonomyFilter);
  }

  public getRulesStringFromSearchQuery(
    ruleString: GroupedSearchQuery[]
  ): ResponseModel.JSONRulesResponse[] {
    return searchQueryUtil
      .getRulesStringFromSearchQuery(ruleString)
      .map(({ type, rulesString }) => {
        return { rulesString, type };
      });
  }

  public async getProductById(
    id: string,
    responseGroup: APIResponseGroup = 'small',
    productVersion?: APIVersion,
    availabilityName?: string,
    region?: string
  ): Promise<IProductWrapper> {
    log.debug('getProductById:: ', {
      id,
      productVersion,
      region,
      responseGroup
    });
    const asset: ResponseModel.Asset = await assetV4Service.getAssetById(id, [
      'type'
    ]);
    if (!asset) {
      throw new AppError('Product (asset) not found.', 404);
    }
    return this.getProductByIdAndType({
      availabilityName,
      availabilityStatus: undefined,
      hasPartPosition: undefined,
      id,
      productType: asset.type,
      productVersion,
      region,
      responseGroup
    });
  }

  public async getProductsByDynamicIds(
    idName: string,
    idValues: string[],
    productType?: StorageModel.ProductType,
    responseGroup: APIResponseGroup = 'small',
    availabilityName?: string,
    availabilityStatus?: string[],
    productVersion?: string
  ): Promise<IProductWrapper[]> {
    log.debug('getProductsByDynamicIds:: ', {
      availabilityName,
      availabilityStatus,
      idName,
      idValues,
      productType,
      productVersion,
      responseGroup
    });
    // based on idName and values
    const assets: ResponseModel.Asset[] =
      await assetV4Service.getAssetsByIdentifierNameValues(
        idName,
        idValues,
        productType
      );
    if (!assets || assets.length <= 0) {
      throw new AppError('Products (assets) not found.', 404);
    }
    const productsIdsByType = this.groupProductIdsByType(assets);

    // If the productType is JOURNAL then we need to return only active journal products
    if (Object.prototype.hasOwnProperty.call(productsIdsByType, 'journal')) {
      const activeJournals: Array<{ _id: string }> =
        await productV4DAO.getActiveProductByIds(
          'journal',
          productsIdsByType.journal
        );
      productsIdsByType.journal = activeJournals.map(
        (aJournal) => aJournal._id
      );
    }
    const productsDataPromiserForEachType = Object.keys(productsIdsByType).map(
      (pType: StorageModel.ProductType) => {
        return this.getProductsByIdsAndType(pType, productsIdsByType[pType], {
          availabilityName,
          availabilityStatus,
          productVersion,
          responseGroup
        });
      }
    );
    const productsDataForEachType = await Promise.all(
      productsDataPromiserForEachType
    );
    const allProductsData = productsDataForEachType.reduce(
      (allProducts: any[], products: any[]) => {
        return allProducts.concat(products);
      },
      []
    );
    if (!allProductsData || allProductsData.length === 0) {
      throw new AppError('Products not found.', 404, {
        additionalMessage:
          'Incase of journal, there are no ACTIVE journal products.'
      });
    }
    return allProductsData;
  }

  public async getProductsWithType(
    productType: StorageModel.ProductType,
    offset: number,
    limit: number,
    responseGroup: APIResponseGroup = 'small',
    availabilityName?: string,
    availabilityStatus?: string[],
    productVersion?: string
  ): Promise<IProductWrapper[]> {
    log.debug('getProductsWithType:: ', {
      availabilityName,
      limit,
      offset,
      productType,
      productVersion,
      responseGroup
    });
    if (productType) {
      const projectionFields = apiResponseGroupConfig.getProjectionFields(
        productType,
        responseGroup
      );
      const products = await productV4DAO.getProductsWithType(
        productType,
        offset,
        limit,
        projectionFields,
        availabilityName,
        availabilityStatus,
        productVersion
      );
      const wrappedProducts: IProductWrapper[] =
        await this.stitchProductsWithAvailabilityAndAsstMedia(
          products,
          projectionFields,
          availabilityName
        );
      return wrappedProducts;
    } else {
      throw new AppError('Products not found.', 404);
    }
  }

  public async getProductByTitle(
    title: string,
    productType: StorageModel.ProductType,
    responseGroup: APIResponseGroup = 'small'
  ): Promise<any> {
    log.debug('getProductByTitle:: ', {
      productType,
      responseGroup,
      title
    });
    const projectionFields = apiResponseGroupConfig.getProjectionFields(
      productType,
      responseGroup
    );
    return productV4DAO.getProductByTitle(title, productType, projectionFields);
  }

  public async getProductByIdentifier(
    identifierName: string,
    identifierValue: string,
    productType: StorageModel.ProductType,
    responseGroup: APIResponseGroup = 'small',
    availabilityName?: string
  ): Promise<any> {
    log.debug('getProductByIdentifier:: ', {
      availabilityName,
      identifierName,
      identifierValue,
      productType,
      responseGroup
    });
    const projectionFields = apiResponseGroupConfig.getProjectionFields(
      productType,
      responseGroup
    );
    const products = await productV4DAO.getProductByIdentifier(
      identifierName,
      identifierValue,
      productType,
      projectionFields
    );
    const wrappedProducts: IProductWrapper[] =
      await this.stitchProductsWithAvailabilityAndAsstMedia(
        products,
        projectionFields,
        availabilityName
      );
    return wrappedProducts;
  }

  public async getPreArticlesByIdentifier(
    identifierName: string,
    identifierValues: string[],
    productType: StorageModel.ProductType,
    responseGroup: APIResponseGroup = 'small'
  ): Promise<any> {
    log.debug('getPreArticlesByIdentifier:: ', {
      identifierName,
      identifierValues,
      productType,
      responseGroup
    });
    const projectionFields = apiResponseGroupConfig.getProjectionFields(
      productType,
      responseGroup
    );
    const products = await productV4DAO.getPreArticlesByIdentifier(
      identifierName,
      identifierValues,
      productType,
      projectionFields
    );
    const wrappedProducts: IProductWrapper[] =
      await this.stitchProductsWithAvailabilityAndAsstMedia(
        products,
        projectionFields
      );
    return wrappedProducts;
  }

  public isOpenAccess(
    productType: ResponseModel.ProductType,
    id: string
  ): Promise<boolean> {
    log.debug(`isOpenAccess:: `, { id, productType });
    return productV4DAO
      .getProduct(productType, id, ['permissions.name'])
      .then((product: ResponseModel.Product) => {
        if (
          !(product && product.permissions && product.permissions.length > 0)
        ) {
          return false;
        }
        return product.permissions.some(
          (permit) => permit.name === 'open-access'
        );
      });
  }
  public async getValidEbookId(
    ids: string[],
    type: StorageModel.ProductType
  ): Promise<string> {
    if (ids.length === 1) {
      return ids[0];
    }
    const formatCodeProperty = type + '.formatCode';
    const statusProperty = type + '.status';
    const projectionFields = [formatCodeProperty, '_id', statusProperty];
    const products = await productV4DAO.getProductsByIds(type, ids, {
      projectionFields
    });
    const eBookProduct = products.filter(
      (eBooks) => eBooks.book && eBooks.book.formatCode === 'EBK'
    );
    if (eBookProduct.length === 0) {
      return null;
    } else if (eBookProduct.length === 1) {
      return eBookProduct[0]._id;
    }
    // Check If you have status available if so return.
    const statusAvail = eBookProduct.find(
      (status) => status.book.status === 'Available'
    );
    if (statusAvail) {
      return statusAvail._id;
    }
    // Check If you have status Out of print if so return.
    const statusOop = eBookProduct.find(
      (status) => status.book.status === 'Out of Print'
    );
    if (statusOop) {
      return statusOop._id;
    }
    const statusWithdrawn = eBookProduct.find(
      (status) => status.book.status === 'Withdrawn'
    );
    if (statusWithdrawn) {
      return statusWithdrawn._id;
    }
    return null;
  }
  public getAvailabilityForChannel(
    product: StorageModel.Product,
    availabilityName: string
  ): StorageModel.Availability[] {
    log.debug(`getAvailabilityFromProduct:: `, { availabilityName, product });
    if (!product || !product.availability) {
      return [];
    }
    if (!availabilityName) {
      return product.availability;
    }
    return product.availability.filter(
      (item) => item.name === availabilityName
    );
  }

  public async getRelUrlFromProduct(
    id: string,
    type: StorageModel.ProductType
  ): Promise<string> {
    log.debug(`getRelUrlFromProduct:: `, {
      id,
      type
    });
    const projectionFields = apiResponseGroupConfig.getProjectionFields(
      type,
      'medium'
    );
    const product = await productV4DAO.getProduct(type, id, projectionFields);
    return `${ubxWebsUrl}/${getMeaningFullUrl(product)}`;
  }

  public async getPreArticleById(
    id: string,
    responseGroup: APIResponseGroup = 'small'
  ): Promise<IProductWrapper> {
    log.debug('getPreArticleById:: ', {
      id,
      responseGroup
    });
    const productType: StorageModel.ProductType = 'preArticle';
    return this.getProductByIdAndType({
      id,
      productType,
      responseGroup
    });
  }

  public async getManuscriptWorkflowById(
    id: string,
    responseGroup: APIResponseGroup = 'small'
  ): Promise<IProductWrapper> {
    log.debug('getManuscriptWorkflowById:: ', {
      id,
      responseGroup
    });
    const productType: StorageModel.ProductType = 'manuscriptWorkflow';
    return this.getProductByIdAndType({
      id,
      productType,
      responseGroup
    });
  }

  private async getProductByIdAndType(
    productByIdTypeQuery: IProductByIdTypeQuery
  ): Promise<IProductWrapper> {
    const {
      availabilityName,
      availabilityStatus,
      hasPartPosition,
      id,
      productType,
      productVersion,
      region,
      responseGroup
    } = productByIdTypeQuery;
    log.debug('getProductByIdAndType:: ', {
      availabilityName,
      availabilityStatus,
      hasPartPosition,
      id,
      productType,
      productVersion,
      region,
      responseGroup
    });
    const projectionFields = apiResponseGroupConfig.getProjectionFields(
      productType,
      responseGroup
    );
    let productDataPromiser: Array<Promise<any>>;
    if (productType == 'manuscriptWorkflow') {
      productDataPromiser = [
        manuscriptV4DAO.getManuscript(
          productType,
          id,
          projectionFields,
          availabilityName,
          availabilityStatus,
          productVersion,
          region
        )
      ];
    } else {
      productDataPromiser = [
        productV4DAO.getProduct(
          productType,
          id,
          projectionFields,
          availabilityName,
          availabilityStatus,
          productVersion,
          region
        )
      ];
    }

    // Modify here for each foreign-key(field) of a Product.
    if (
      projectionFields.length === 0 ||
      projectionFields.includes('associatedMedia')
    ) {
      const includeLocationForAll = false;
      productDataPromiser.push(
        associatedMediaV4Service.getContentMetaDataByParentid(
          id,
          includeLocationForAll
        )
      );
    }

    return Promise.all(productDataPromiser).then((resolvedData) => {
      const product = resolvedData[0];
      if (product) {
        // Modify here for availability field on case of large Product.
        if (projectionFields.includes('availability')) {
          const availability = this.getAvailabilityForChannel(
            product,
            availabilityName
          );
          delete product['availability'];
          if (
            product.type === 'scholarlyArticle' &&
            Array.isArray(resolvedData[1])
          ) {
            product['associatedMedia'] = resolvedData[1].filter((asstMedia) => {
              return (
                asstMedia.versionType ===
                product['scholarlyArticle']['currentVersion']
              );
            });
          } else {
            product['associatedMedia'] = resolvedData[1];
          }
          return Promise.resolve({ availability, product });
        } else {
          return Promise.resolve({ product });
        }
      } else {
        throw new AppError('Product not found.', 404);
      }
    });
  }

  private async getProductsByIdsAndType(
    productType: StorageModel.ProductType,
    ids: string[],
    opts: IProductFilterOptions
  ): Promise<IProductWrapper[]> {
    const {
      responseGroup = 'small',
      productVersion,
      availabilityName,
      availabilityStatus
    } = opts;
    log.debug('getProductsByIdsAndType:: ', {
      availabilityName,
      availabilityStatus,
      ids,
      productType,
      productVersion,
      responseGroup
    });
    const projectionFields = apiResponseGroupConfig.getProjectionFields(
      productType,
      responseGroup
    );
    const productDataPromiser: Array<Promise<any>> = [
      productV4DAO.getProductsByIds(productType, ids, {
        availabilityName,
        availabilityStatus,
        productVersion,
        projectionFields
      })
    ];
    // Modify here for each foreign-key(field) of a Product.
    if (
      projectionFields.length === 0 ||
      projectionFields.includes('associatedMedia')
    ) {
      const includeLocationForAll = false;
      productDataPromiser.push(
        associatedMediaV4Service.getAsstMediasByParentIds(
          ids,
          includeLocationForAll
        )
      );
    }

    return Promise.all(productDataPromiser).then((resolvedData: any[]) => {
      const products = this.stichProductsWithAsstMedia(
        resolvedData[0],
        resolvedData[1]
      );
      if (projectionFields.includes('availability')) {
        return products.map((product: StorageModel.Product) => {
          let availability = [];
          if (product['availability']) {
            availability = this.getAvailabilityForChannel(
              product,
              availabilityName
            );
            delete product['availability'];
          }
          return { availability, product };
        });
      } else {
        return products.map((product: StorageModel.Product) => {
          return { product };
        });
      }
    });
  }
  /**
   * This method groups each product with its product type
   * @param asset Accepts a asset with type and _id
   *
   */
  private groupProductIdsByType(asset: Array<{ type: string; _id: string }>): {
    [key: string]: string[];
  } {
    const productsByType = {};
    asset.forEach((product) => {
      /* istanbul ignore else */
      if (AppConstants.ProductTypesV4.includes(product.type)) {
        productsByType[product.type] = Object.prototype.hasOwnProperty.call(
          productsByType,
          product.type
        )
          ? productsByType[product.type]
          : [];
        productsByType[product.type].push(product._id);
      }
    });
    return productsByType;
  }

  private stichProductsWithAsstMedia(
    products: StorageModel.Product[],
    asstMedias: StorageModel.AssociatedMedia[]
  ): ResponseModel.Product[] {
    if (!products || products.length === 0) {
      return [];
    }

    if (!asstMedias || asstMedias.length === 0) {
      return products;
    }

    return products.map((product) => {
      product['associatedMedia'] = asstMedias
        .filter((asstMedia) => {
          return product.type === 'scholarlyArticle'
            ? asstMedia.parentId === product._id &&
                asstMedia.versionType ===
                  product['scholarlyArticle']['currentVersion']
            : asstMedia.parentId === product._id;
        })
        .map((asstMedia) => {
          delete asstMedia.parentId;
          return asstMedia;
        });

      return product;
    });
  }

  private async stitchProductsWithAvailabilityAndAsstMedia(
    products: any,
    projectionFields: string[],
    availabilityName?: string
  ): Promise<IProductWrapper[]> {
    // Modify here for availability field in case of large Product.
    let wrappedProducts: IProductWrapper[] = [];
    if (projectionFields.includes('availability')) {
      wrappedProducts = products.map((product: StorageModel.Product) => {
        const availability = this.getAvailabilityForChannel(
          product,
          availabilityName
        );
        delete product['availability'];
        return { availability, product };
      });
    } else {
      wrappedProducts = products.map((product: StorageModel.Product) => {
        delete product['availability'];
        return { product };
      });
    }
    if (
      projectionFields.length === 0 ||
      projectionFields.includes('associatedMedia')
    ) {
      const productsIdData = products.map((product) => product._id);
      const asstMedias =
        await associatedMediaV4Service.getAsstMediasByParentIds(productsIdData);
      wrappedProducts.forEach((wrappedProduct) => {
        wrappedProduct['product']['associatedMedia'] = asstMedias
          .filter(
            (asstMedia) => asstMedia.parentId === wrappedProduct.product._id
          )
          .map((asstMedia) => {
            delete asstMedia.parentId;
            return asstMedia;
          });
      });
    }
    return wrappedProducts;
  }
}
export const productV4Service = new ProductV4Service();
