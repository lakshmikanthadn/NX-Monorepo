import {
  RequestModel,
  ResponseModel,
  StorageModel
} from '@tandfgroup/pcm-entity-model-v4';
import { GroupedSearchQuery } from '@tandfgroup/pcm-rules-parser';
import { Request, Response } from 'express';
import * as _ from 'lodash';
import * as newrelic from 'newrelic';

import { associatedMediaV4Service } from '../associatedMedia/AssociatedMediaV4.Service';

import { isUUID } from 'validator';
import { Config } from '../../config/config';
import { AppConstants } from '../../config/constant';
import { AppError } from '../../model/AppError';
import { IProductWrapper } from '../model/interfaces/ProductWrapper';
import { APIResponse } from '../../utils/APIResponse';
import Logger from '../../utils/LoggerUtil';
import { assetV4Service } from '../assets/AssetV4.Service';
import { collectionV4Controller } from '../collection/CollectionV4.Controller';
import { prechapterV4Controller } from '../preChapter/PreChapterV4.Controller';
import { collectionValidator } from '../collection/CollectionValidator';
import { journalController } from '../journal/Journal.Controller';
import {
  APIResponseGroup,
  APIVersion
} from '../model/interfaces/CustomDataTypes';
import { ISearchQueryParams } from '../model/interfaces/SearchResult';
import {
  ITaxonomyFilter,
  ITaxonomyMasterFilter
} from '../model/interfaces/TaxonomyFilter';
import { publishingServiceController } from '../publishingService/PublishingService.Controller';
import { searchV4Controller } from '../search/SearchV4Controller';
import { searchV4Service } from '../search/SearchV4Service';
import { titleController } from '../title/Title.Controller';
import { productTransform } from '../transform/ProductTransform';
import { preProductTransform } from '../transform/PreProductTransform';
import { inputValidator } from '../validator/InputValidator';
import { oaUpdateAPIValidator } from '../validator/requestValidator/OAUpdateAPIValidator';
import { searchDownloadValidator } from '../validator/requestValidator/SearchDownloadApiValidator';
import { validateAPIValidator } from '../validator/requestValidator/ValidateAPIValidator';
import { productV4Service } from './ProductV4.Service';

const log = Logger.getLogger('ProductV4Controller');
const UUIDVersion = 4;

export class ProductV4Controller {
  /**
   * @swagger
   * /products/report:
   *   get:
   *     tags:
   *     - Products
   *     summary: To download salessheets report.
   *     description: Return 200 status code if report exists else 404 status code.
   *     parameters:
   *       - $ref: "#/components/parameters/apiVersion"
   *       - $ref: "#/components/parameters/type"
   *     responses:
   *       200:
   *        description: Returns signed url for daily report
   *        content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               location:
   *                 type: string
   *                 description: s3 url string
   *       400:
   *        description: Bad request
   *       404:
   *        description: Not found
   */
  public async getReport(request: Request, response: Response): Promise<void> {
    {
      const contentType = request.query.type;
      try {
        if (!contentType) {
          throw new AppError('Invalid query parameter: type', 400);
        }
        if (contentType !== 'salessheets') {
          throw new AppError(
            `Invalid query parameter: type with value ${contentType}`,
            400
          );
        }

        const content = await productV4Service.getReport(contentType);
        if (!content) {
          APIResponse.failure(response, new AppError('Content not found', 404));
          return;
        } else {
          APIResponse.success(response, { location: content });
        }
      } catch (error) {
        Logger.handleErrorLog(log, 'getReport', error);
        APIResponse.failure(response, error);
      }
    }
  }

  getProductAssociatedMedia(
    request: Request,
    response: Response
  ): Promise<void> {
    const type: string = request.query.type;
    const identifier: string = request.params.identifier;
    return associatedMediaV4Service
      .getAsstMediaByParentIdAndType(identifier, type)
      .then((associatedMedias) => {
        if (associatedMedias && associatedMedias.length > 0) {
          APIResponse.success(response, {
            data: associatedMedias,
            metadata: {}
          });
        } else {
          APIResponse.failure(
            response,
            new AppError('Product AssociatedMedia not found', 404)
          );
        }
      })
      .catch((error) => {
        Logger.handleErrorLog(log, 'getAssociatedMedia:: ', error);
        APIResponse.failure(response, error);
      });
  }

  /**
   * This method acts as re-router to route all the POST:/products calls.
   * This method re-routes calls to corresponding controller based on the action.
   * @param req
   * @param res
   */
  public async handlePostProduct(req: Request, res: Response): Promise<void> {
    try {
      const requestPayload = req.body;
      const action = requestPayload.action;
      newrelic.setTransactionName(`products#action=${action}`);
      switch (action) {
        case 'save':
          this.handleCreateProduct(req, res);
          break;
        case 'download':
          this.handleSearchRequestDownload(req, res);
          break;
        case 'new-id':
          this.getNewId(req, res);
          break;
        case 'validate':
          this.validateProducts(req, res);
          break;
        case 'query':
          searchV4Controller.searchProducts(req, res);
          break;
        case 'count':
          searchV4Controller.getSearchMetadata(req, res);
          break;
        case 'fetchVariants':
          titleController.getProductVariantsByIds(req, res);
          break;
        // This is for internal usage only. Do not add to swagger/confluence/contract-doc
        case 'parseQuery':
          searchV4Controller.parseSearchQuery(req, res);
          break;
        default:
          throw new AppError(`Invalid action: ${action}`, 400);
      }
    } catch (error) {
      APIResponse.failure(res, error);
    }
  }

  /**
   * This method acts as re-router to route all the POST:/internal/products calls.
   * This method re-routes calls to corresponding controller based on the action.
   * @param req
   * @param res
   */
  public async handlePostProductInternal(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requestPayload = req.body;
      const action = requestPayload.action;
      newrelic.setTransactionName(`products#action=${action}`);
      if (action === 'save') {
        this.handleCreateProductInternal(req, res);
      } else {
        throw new AppError(`Invalid action: ${action}`, 400);
      }
    } catch (error) {
      APIResponse.failure(res, error);
    }
  }

  public async handleSearchRequestDownload(req: Request, res: Response) {
    try {
      const requestPayload = req.body;
      searchDownloadValidator.validateSearchDownloadRequest(requestPayload);
      requestPayload._id = productV4Service.getNewId();
      return productV4Service
        .uploadSearchRequest(requestPayload)
        .then((msgResponse: any) => {
          const responseData = {
            data: null,
            metadata: {
              _id: '',
              error: '',
              message: '',
              messages: [
                {
                  code: 202,
                  description:
                    'Search query is accepted. and results will be sent over email(s) soon.'
                }
              ],
              transactionDate: new Date().toISOString(),
              transactionId: productV4Service.getTransactionId(),
              type: 'search result download'
            }
          };
          APIResponse.accepted(res, responseData);
        })
        .catch((error) => {
          error['type'] = 'search result download';
          Logger.handleErrorLog(log, 'handleSearchRequestDownload:: ', error);
          APIResponse.failure(res, error);
        });
    } catch (error) {
      error['type'] = 'search result download';
      Logger.handleErrorLog(log, 'handleSearchRequestDownload:: ', error);
      APIResponse.failure(res, error);
    }
  }

  /**
   * @swagger
   * /products:
   *   head:
   *     tags:
   *     - Products
   *     summary: To Check if the asset exists in store based on identifier.
   *     description: Return 200 status code if product exists else 404 status code.
   *     parameters:
   *       - $ref: "#/components/parameters/apiVersion"
   *       - $ref: "#/components/parameters/identifierName"
   *       - $ref: "#/components/parameters/identifierValue"
   *     responses:
   *       200:
   *        description: OK
   *       400:
   *        description: Bad request
   *       404:
   *        description: Not found
   */
  public async getProductByIdentifier(
    request: Request,
    response: Response
  ): Promise<void> {
    const identifierName: string = request.query.identifierName;
    const identifierValue: string = decodeURIComponent(
      request.query.identifierValue
    );
    const type: StorageModel.ProductType = request.query.type;
    try {
      collectionValidator.validateCollectionId(request.query);
      if (!type) {
        const asset = await assetV4Service.getProductByIdentifier(
          identifierName,
          identifierValue
        );
        if (!asset) {
          throw new AppError(`Product not found`, 404);
        }
        response.sendStatus(200);
      } else {
        const product = await productV4Service.getProductByIdentifier(
          identifierName,
          identifierValue,
          type
        );
        if (!product || product.length <= 0) {
          throw new AppError(`Product not found`, 404);
        }
        response.sendStatus(200);
      }
    } catch (error) {
      Logger.handleErrorLog(log, 'getProductByIdentifier', error);
      response.set('x-message', error.message);
      response.sendStatus(error.code);
    }
  }

  /**
   * @swagger
   * /products/{id}#action=oaUpdate:
   *   put:
   *     tags:
   *     - Products
   *     summary: To update product with OA permission based on _id (UUID).
   *     description: |
   *      This endpoint will allow you to update the product OA information for the Product.
   *        - You should have a permission to update the Product,
   *        - It's for internal use only,
   *     parameters:
   *     - $ref: "#/components/parameters/id"
   *     requestBody:
   *       required: true
   *       content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/requestBodies/OAProductRequest'
   *     responses:
   *       202:
   *         $ref: '#/components/responses/AcceptedBasic'
   *       404:
   *         $ref: '#/components/responses/NotFoundBasic'
   *       400:
   *         $ref: '#/components/responses/BadRequestBasic'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedBasic'
   *       403:
   *         $ref: '#/components/responses/ForbiddenBasic'
   */

  public async handleOAUpdate(req: Request, response: Response): Promise<void> {
    const requestPayload = req.body;
    try {
      log.debug('handleOAUpdate:: ', { requestPayload });
      const validationErrors =
        oaUpdateAPIValidator.validateOAUpdateRequest(requestPayload);
      if (validationErrors.length > 0) {
        const responseData = {
          metadata: {
            messages: validationErrors,
            requestId: requestPayload.requestId,
            transactionDate: new Date().toISOString()
          },
          responsePayload: null
        };
        APIResponse.oaFailure(response, responseData);
      } else {
        await productV4Service
          .uploadOAUpdate(requestPayload, req.params.id)
          .then(() => {
            const responseData = {
              messages: [
                {
                  code: 202,
                  description: 'it will be processed and acknowledged soon.'
                }
              ],
              requestId: requestPayload.requestId,
              status: 'success'
            };
            APIResponse.accepted(response, responseData);
          });
      }
    } catch (error) {
      const responseData = {
        metadata: {
          messages: [
            {
              code: error.code,
              description: error.message
            }
          ],
          requestId: requestPayload.requestId,
          transactionDate: new Date().toISOString()
        },
        responsePayload: null
      };
      Logger.handleErrorLog(log, 'handleOAUpdate:: ', error);
      APIResponse.oaFailure(response, responseData, error.code);
    }
  }

  /**
   * @swagger
   * /products:
   *   post:
   *     tags:
   *     - Products
   *     summary: To create a product in PCM store.
   *     description: |
   *      This endpoint will allow you to create a new product in PCM store.
   *        - Supports only Collection and Creativework product.
   *        - You should have a permission to update the Product,
   *          use service account with right ROLES to update.
   *     requestBody:
   *       required: true
   *       content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/requestBodies/ActionSave'
   *     responses:
   *       201:
   *        description: Returns _id of the product created. (For creativeWork only)
   *        content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               _id:
   *                 type: string
   *                 description: newly created product-id
   *       202:
   *         $ref: '#/components/responses/AcceptedBasic'
   *       404:
   *         $ref: '#/components/responses/NotFoundBasic'
   *       400:
   *         $ref: '#/components/responses/BadRequestBasic'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedBasic'
   *       403:
   *         $ref: '#/components/responses/ForbiddenBasic'
   *       405:
   *         $ref: '#/components/responses/MethodNotAllowedBasic'
   */
  public async handleCreateProduct(req: Request, res: Response): Promise<void> {
    try {
      log.debug('handleCreateProduct::,', { requestPayload: req.body });
      const productData = req.body.product;
      if (!productData) {
        throw new AppError(
          `Missing product data in the request payload.`,
          400,
          { data: productData }
        );
      }
      switch (productData.type) {
        case 'creativeWork':
          await this.createCreativeWorkProduct(req, res);
          break;
        case 'collection':
          await this.createCollectionProduct(req, res);
          break;
        default:
          throw new AppError(`Invalid type: ${productData.type}`, 400);
      }
    } catch (error) {
      Logger.handleErrorLog(log, 'handleCreateProduct:: ', error);
      APIResponse.failure(res, error);
    }
  }

  /**
   * @swagger
   * /products:
   *   post:
   *     tags:
   *     - Products
   *     summary: To create a product in PCM store.
   *     description: |
   *      This endpoint will allow you to create a new product in PCM store.
   *        - Supports only pre-chapter product.
   *        - Curently for internal use only.
   *     requestBody:
   *       required: true
   *       content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/requestBodies/ActionSave'
   *     responses:
   *       201:
   *        description: Returns _id of the product created.
   *        content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               _id:
   *                 type: string
   *                 description: newly created product-id
   *       202:
   *         $ref: '#/components/responses/AcceptedBasic'
   *       404:
   *         $ref: '#/components/responses/NotFoundBasic'
   *       400:
   *         $ref: '#/components/responses/BadRequestBasic'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedBasic'
   *       403:
   *         $ref: '#/components/responses/ForbiddenBasic'
   *       405:
   *         $ref: '#/components/responses/MethodNotAllowedBasic'
   */
  public async handleCreateProductInternal(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      log.debug('handleCreateProductInternal::,', { requestPayload: req.body });
      const productData = req.body.product;
      if (!productData) {
        throw new AppError(
          `Missing product data in the request payload.`,
          400,
          { data: productData }
        );
      }
      if (productData.type === 'preChapter') {
        await prechapterV4Controller.createPreChapterProduct(req, res);
      } else {
        throw new AppError(`Invalid type: ${productData.type}`, 400);
      }
    } catch (error) {
      Logger.handleErrorLog(log, 'handleCreateProductInternal:: ', error);
      APIResponse.failure(res, error);
    }
  }

  /**
   * @swagger
   * /products/{id}:
   *   get:
   *     tags:
   *     - Products
   *     summary: To get a product data and availability based on _id (UUID) and region.
   *     description: Returns product data and availability(only for large and medium).
   *     parameters:
   *     - $ref: "#/components/parameters/id"
   *     - $ref: "#/components/parameters/apiVersion"
   *     - $ref: "#/components/parameters/responseGroup"
   *     - $ref: "#/components/parameters/availabilityNameParam"
   *     - $ref: "#/components/parameters/region"
   *     responses:
   *       200:
   *        description: Returns a Product along with its availability
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/ProductAndAvailability'
   *       404:
   *         $ref: '#/components/responses/NotFoundBasic'
   *       400:
   *         $ref: '#/components/responses/BadRequestBasic'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedBasic'
   *       403:
   *         $ref: '#/components/responses/ForbiddenBasic'
   */
  public async getProduct(request: Request, response: Response): Promise<void> {
    const responseGroup: APIResponseGroup = request.query.responseGroup;
    const productVersion: APIVersion = request.query.productVersion;
    const identifier: string = request.params.identifier;
    const availabilityName: string = request.query.availabilityName;
    const region: string = request.query.region;
    try {
      const productWrapper = await productV4Service.getProductById(
        identifier,
        responseGroup,
        productVersion,
        availabilityName,
        region
      );
      if (!productWrapper) {
        APIResponse.failure(response, new AppError('Product not found', 404));
        return;
      }
      productWrapper.product = productTransform.transform(
        productWrapper.product
      );
      APIResponse.success(response, productWrapper);
    } catch (error) {
      Logger.handleErrorLog(log, 'getProduct', error);
      APIResponse.failure(response, error);
    }
  }

  /**
   * @swagger
   * /products:
   *   get:
   *     tags:
   *     - Products
   *     summary: To get multiple products based on identifier.
   *     description: Returns multiple products based on identifierName & identifierValues.
   *     parameters:
   *       - $ref: "#/components/parameters/apiVersion"
   *       - $ref: "#/components/parameters/responseGroup"
   *       - $ref: "#/components/parameters/identifierName"
   *       - $ref: "#/components/parameters/identifierValues"
   *     responses:
   *       200:
   *        description: Returns all the products along with their availability.
   *        content:
   *          application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/ProductAndAvailability'
   *       404:
   *         $ref: '#/components/responses/NotFoundBasic'
   *       400:
   *         $ref: '#/components/responses/BadRequestBasic'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedBasic'
   *       403:
   *         $ref: '#/components/responses/ForbiddenBasic'
   */
  public async getProducts(
    request: Request,
    response: Response
  ): Promise<void> {
    const responseGroup = request.query.responseGroup;
    const productVersion = request.query.productVersion;
    const keyname: string = request.query.identifierName;
    const keyvalues: string = request.query.identifierValues;
    const availabilityName: string = request.query.availabilityName;
    const availableStatus: string = request.query.availabilityStatus;
    // Product type is no more a mandatory field and default is book.
    let productType = request.query.type;
    let limit = request.query.limit;
    let offset = request.query.offset;
    const parsedLimit = parseInt(limit, 10);
    const parsedOffset = parseInt(offset, 10);
    const whitelistedIdentifiers = AppConstants.WhitelistedProductIdentifiersV4;
    const defaultBatchSize = Config.getPropertyValue('defaultBatchSizeV4');

    try {
      /**
       * All validations related to this endpoint.
       * All the validators either return "true" or throw APP Error.
       * Make sure to put them inside a try catch and handle the error.
       */
      inputValidator.multipleProductsValidator(request);
      offset = parsedOffset ? parsedOffset : 0;
      limit = parsedLimit;

      let productsWrapper;
      limit = limit ? limit : defaultBatchSize;

      const availabilityStatus: string[] = availableStatus
        ? availableStatus.split(',')
        : undefined;

      if (whitelistedIdentifiers.includes(keyname) && keyvalues) {
        const identifierValues: string[] = keyvalues.split(',');
        productsWrapper = await productV4Service.getProductsByDynamicIds(
          keyname,
          identifierValues,
          productType,
          responseGroup,
          availabilityName,
          availabilityStatus,
          productVersion
        );
      } else if (
        AppConstants.WhitelistedProductIdentifiersNotInAssetsV4.includes(
          keyname
        ) &&
        keyvalues &&
        productType
      ) {
        productsWrapper = await productV4Service.getProductByIdentifier(
          keyname,
          keyvalues,
          productType,
          responseGroup,
          availabilityName
        );
      } else {
        // Set default productType to Book instead of throwing error.
        /* istanbul ignore else */
        if (!(request.query && productType)) {
          productType = 'book';
        }
        productsWrapper = await productV4Service.getProductsWithType(
          productType,
          offset,
          limit,
          responseGroup,
          availabilityName,
          availabilityStatus,
          productVersion
        );
      }
      if (!productsWrapper || productsWrapper.length <= 0) {
        APIResponse.failure(response, new AppError('Products not found', 404));
        return;
      }
      const transformedProducts = this.getTransformedProducts(productsWrapper);
      APIResponse.success(response, transformedProducts);
    } catch (error) {
      Logger.handleErrorLog(log, 'getProducts', error);
      APIResponse.failure(response, error);
    }
  }

  /**
   * @swagger
   * /{taxonomyAssetType}/classifications/{taxonomyType}:
   *   get:
   *     tags:
   *     - Taxonomy
   *     summary: To get a the taxonomy details of a classification family(rom/ubx).
   *     description: Returns list of all taxonomy for a requested classification family(rom/ubx).
   *     parameters:
   *     - $ref: "#/components/parameters/taxonomyAssetType"
   *     - $ref: "#/components/parameters/taxonomyType"
   *     - in: query
   *       name: code
   *       schema:
   *         type: string
   *       description: |
   *         Filter the classifications based on the **code**.
   *     - in: query
   *       name: level
   *       schema:
   *         type: number
   *         enum: [1,2,3,4,5,6]
   *       description: Filters a particular level.
   *     - in: query
   *       name: name
   *       schema:
   *         type: string
   *     - in: query
   *       name: isCodePrefix
   *       schema:
   *         type: boolean
   *     - in: query
   *       name: extendLevel
   *       schema:
   *         type: boolean
   *     responses:
   *       200:
   *        description: Returns a Taxonomy data for the given request.
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/TaxonomyResp'
   *       404:
   *         $ref: '#/components/responses/NotFoundBasic'
   *       400:
   *         $ref: '#/components/responses/BadRequestBasic'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedBasic'
   *       403:
   *         $ref: '#/components/responses/ForbiddenBasic'
   */

  public async getTaxonomy(req: Request, res: Response): Promise<void> {
    try {
      /**
       * All the validators either return true or throw APP Error.
       * Make sure to put them inside a try catch and handle the error.
       */
      inputValidator.validateTaxonomyQueryFilters(req);
      const taxonomyFilter: ITaxonomyFilter = {
        code: req.query.code,
        extendLevel: req.query.extendLevel === 'true',
        isCodePrefix: req.query.isCodePrefix === 'true',
        level: parseInt(req.query.level, 10),
        name: req.query.name
      };
      const taxonomy = await productV4Service.getTaxonomy(
        req.params.assetType,
        req.params.taxonomyType,
        taxonomyFilter
      );
      if (!taxonomy || taxonomy.length === 0) {
        APIResponse.failure(res, new AppError('Taxonomy not found', 404));
        return;
      }
      APIResponse.success(res, taxonomy);
    } catch (error) {
      Logger.handleErrorLog(log, 'getTaxonomy', error);
      APIResponse.failure(res, error);
    }
  }

  /**
   * @swagger
   * /taxonomy:
   *   get:
   *     tags:
   *     - Taxonomy
   *     summary: To get a the taxonomy details of a classification family(rom/ubx).
   *     description: Returns list of all taxonomy for a requested classification family(rom/ubx).
   *     parameters:
   *     - $ref: "#/components/parameters/apiVersion"
   *     - in: query
   *       name: classificationFamily
   *       required: true
   *       schema:
   *         type: string
   *         enum: [rom,hobs,ubx]
   *       description: classification family.
   *     - in: query
   *       name: classificationType
   *       schema:
   *         type: string
   *         enum: [keyword,notable-figure,period,region,subject]
   *       description: Filter the classifications based on the classificationType.
   *     - in: query
   *       name: code
   *       schema:
   *         type: string
   *       description: |
   *         Filter the classifications based on the **code**.
   *          - You can use this filter along with **includeChildren** filter
   *            to get all the children of the particular classification **code**.
   *          - You can also use the **level** filter to get children at a particular level.
   *     - in: query
   *       name: includeChildren
   *       schema:
   *         type: boolean
   *         enum: [true,false]
   *         default: false
   *       description: |
   *        - Includes all the children of the classification.
   *        - Use this filter along with the **code** filter.
   *     - in: query
   *       name: level
   *       schema:
   *         type: number
   *         enum: [1,2,3,4,5,6]
   *       description: Filters a particular level.
   *     responses:
   *       200:
   *        description: Returns a Taxonomy data for the given request.
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/TaxonomyMasterResp'
   *       404:
   *         $ref: '#/components/responses/NotFoundBasic'
   *       400:
   *         $ref: '#/components/responses/BadRequestBasic'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedBasic'
   *       403:
   *         $ref: '#/components/responses/ForbiddenBasic'
   */

  public async getTaxonomyClassifications(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      /**
       * All the validators either return true or throw APP Error.
       * Make sure to put them inside a try catch and handle the error.
       */
      inputValidator.validateTaxonomyClassificationFilters(req);
      const taxonomyFilter: ITaxonomyMasterFilter = {
        classificationFamily: req.query.classificationFamily,
        classificationType: req.query.classificationType,
        code: req.query.code,
        includeChildren: req.query.includeChildren === 'true',
        level: req.query.level ? parseInt(req.query.level, 10) : undefined
      };
      const taxonomy = await productV4Service.getTaxonomyClassifications(
        taxonomyFilter
      );

      if (!taxonomy || taxonomy.length === 0) {
        APIResponse.failureWithTraceIdInfo(
          res,
          new AppError('Taxonomy not found', 404)
        );
        return;
      }
      APIResponse.successWithTraceIdInfo(res, taxonomy);
    } catch (error) {
      Logger.handleErrorLog(log, 'getTaxonomy', error);
      APIResponse.failureWithTraceIdInfo(res, error);
    }
  }

  /**
   * @swagger
   * /products#action=new-id:
   *   post:
   *     tags:
   *     - Miscellaneous
   *     summary: To get a new-id (uuid).
   *     description: This endpoint is used to generate a new UUID for product before creating it.
   *     requestBody:
   *       required: true
   *       content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/requestBodies/ActionNewId'
   *     responses:
   *       201:
   *        description: Returns uuid.
   *        content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               _id:
   *                 type: string
   *                 description: new uuid
   *       401:
   *         $ref: '#/components/responses/UnauthorizedBasic'
   *       403:
   *         $ref: '#/components/responses/ForbiddenBasic'
   */
  public async getNewId(request: Request, response: Response): Promise<void> {
    try {
      const newId = productV4Service.getNewId();
      APIResponse.created(response, { _id: newId });
    } catch (error) {
      Logger.handleErrorLog(log, 'getNewId', error);
      APIResponse.failure(response, error);
    }
  }

  /**
   * @swagger
   * /products/{id}:
   *   put:
   *     tags:
   *     - Products
   *     summary: To update product metadata based on _id (UUID).
   *     description: |
   *      This endpoint will allow you to update the product metadata information for the Product.
   *        - Supports only Collection, PublishingService and the Journal product.
   *        - You should have a permission to update the Product,
   *          use service account with right ROLES to update.
   *     parameters:
   *     - $ref: "#/components/parameters/id"
   *     requestBody:
   *       required: true
   *       content:
   *        application/json:
   *          schema:
   *            oneOf:
   *              - $ref: '#/components/requestBodies/CollectionProduct'
   *              - $ref: '#/components/requestBodies/PublishingServiceProduct'
   *              - $ref: '#/components/requestBodies/JournalProduct'
   *     responses:
   *       202:
   *         $ref: '#/components/responses/AcceptedBasic'
   *       404:
   *         $ref: '#/components/responses/NotFoundBasic'
   *       400:
   *         $ref: '#/components/responses/BadRequestBasic'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedBasic'
   *       403:
   *         $ref: '#/components/responses/ForbiddenBasic'
   */
  public async handleUpdateProduct(req: Request, res: Response): Promise<void> {
    try {
      log.debug('handleProduct::,', { requestPayload: req.body });
      const productData = req.body.product;
      if (!productData) {
        throw new AppError(
          `Missing product data in the request payload.`,
          400,
          { data: productData }
        );
      }
      switch (productData.type) {
        case 'collection':
          await this.updateCollectionProduct(req, res);
          break;
        case 'publishingService':
          await publishingServiceController.updatePublishingService(req, res);
          break;
        case 'journal':
          await journalController.updateJournalProduct(req, res);
          break;
        default:
          throw new AppError(`Invalid type: ${productData.type}`, 400);
      }
    } catch (error) {
      Logger.handleErrorLog(log, 'handleUpdateProduct', error);
      return APIResponse.failure(res, error);
    }
  }

  /**
   * @swagger
   * /products/{id}:
   *   patch:
   *     tags:
   *     - Products
   *     summary: For partially updating product metadata based on _id (UUID).
   *     description: |
   *      This endpoint will allow you to update the product metadata information for the Product.
   *        - Supports only Collection.
   *        - You should have a permission to update the Product,
   *          use service account with right ROLES to update.
   *     parameters:
   *     - $ref: "#/components/parameters/id"
   *     requestBody:
   *       required: true
   *       content:
   *        application/json:
   *          schema:
   *            - $ref: '#/components/requestBodies/PatchRequest'
   *     responses:
   *       202:
   *         $ref: '#/components/responses/AcceptedBasic'
   *       404:
   *         $ref: '#/components/responses/NotFoundBasic'
   *       400:
   *         $ref: '#/components/responses/BadRequestBasic'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedBasic'
   *       403:
   *         $ref: '#/components/responses/ForbiddenBasic'
   */
  public async handlePartialUpdateProduct(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      log.debug('handlePartialUpdateProduct::,', { requestPayload: req.body });
      const productData: RequestModel.PatchRequest[] = req.body.data;
      if (!productData) {
        throw new AppError(`Missing product data in the request payload.`, 400);
      }
      await this.partialUpdateCollectionProduct(req, res);
    } catch (error) {
      Logger.handleErrorLog(log, 'handlePartialUpdateProduct', error);
      return APIResponse.failure(res, error);
    }
  }

  /**
   * @swagger
   * /products/{id}#CreateORUpdatePublishingServiceProduct:
   *   put:
   *     tags:
   *     - Products
   *     summary: This handles the create and update requests for publishing-service-product.
   *     description: |
   *      This endpoint will allow you to create / update the publishing-service-product metadata
   *      information for the Product.
   *        - Supports only PublishingService product.
   *        - You should have a permission to update the Product,
   *          use service account with right ROLES to update.
   *     parameters:
   *     - $ref: "#/components/parameters/id"
   *     requestBody:
   *       required: true
   *       content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/requestBodies/PublishingServiceProduct'
   *     responses:
   *       202:
   *         $ref: '#/components/responses/AcceptedBasic'
   *       404:
   *         $ref: '#/components/responses/NotFoundBasic'
   *       400:
   *         $ref: '#/components/responses/BadRequestBasic'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedBasic'
   *       403:
   *         $ref: '#/components/responses/ForbiddenBasic'
   */
  public async handleCreateProductById(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      log.debug('handleCreateProductById::,', {
        id: req.params.identifier,
        requestPayload: req.body
      });
      const productData = req.body.product;
      if (!productData) {
        throw new AppError(
          `Missing product data in the request payload.`,
          400,
          { data: productData }
        );
      }
      if (!(productData.type && productData.type === 'publishingService')) {
        throw new AppError(`Invalid type: ${productData.type}`, 400);
      }
      // Commented for future use, switch require minimum 3 case
      // switch (productData.type) {
      //   case 'publishingService':
      //     await publishingServiceController.createPublishingService(req, res);
      //     break;
      //   default: throw new AppError(`Invalid type: ${productData.type}`, 400);
      // }
      await publishingServiceController.createPublishingService(req, res);
    } catch (error) {
      Logger.handleErrorLog(log, 'handleCreateProductById', error);
      APIResponse.failure(res, error);
    }
  }

  /**
   * @swagger
   * /products#action=validate:
   *   post:
   *     tags:
   *     - Miscellaneous
   *     summary: To validate a given list of products with supported identifiers.
   *     description: identifiers supported are _id/identifiers.doi/identifiers.isbn
   *     requestBody:
   *       required: true
   *       content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/requestBodies/ActionValidate'
   *     responses:
   *       200:
   *        description: Response object of metadata and data blocks based on rules provided
   *        content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ValidateRespBody'
   *       404:
   *         $ref: '#/components/responses/NotFoundBasic'
   *       400:
   *         $ref: '#/components/responses/BadRequestBasic'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedBasic'
   *       403:
   *         $ref: '#/components/responses/ForbiddenBasic'
   */

  public async validateProducts(
    request: Request,
    response: Response
  ): Promise<void> {
    try {
      const requestPayload = request.body;
      validateAPIValidator.validateValidationApi(request);
      const hasCounts: boolean = requestPayload.hasCounts;
      const availabilityName: string = requestPayload.availability.name;
      const searchQuery: GroupedSearchQuery[] = requestPayload.rulesList;
      const inputIdentifiers = [];
      const searchPromiser = [];
      const allProducts = [];
      const allCounts = [];
      const qualifiedIdentifier = [];
      const inputAttributes = [];

      let searchQueryParserResult;
      try {
        searchQueryParserResult =
          searchV4Controller.mapAndParseSearchQuery(searchQuery);
      } catch (parserError) {
        Logger.handleErrorLog(log, 'searchProducts: ', parserError);
        throw new AppError(parserError.message, 400);
      }
      log.debug(
        'searchQueryParserResult::',
        JSON.stringify(searchQueryParserResult)
      );

      // when we have multiple rulesList so we have to go one by one
      searchQuery.forEach((sQuery, index) => {
        const productType: StorageModel.ProductType =
          sQuery.type as StorageModel.ProductType;
        const query = searchQueryParserResult[index];

        // this is used to remove individual(dot) projection when root projection is passed
        // As mongodb chooses individual one on top of the root one.
        // e.g : ["identifiers", "identifiers.dacKey", "identifiers.doi"]
        // e.g : ["book", "book.publicationDate", "book.subtitle"]
        const rootAttributes = query.attributes.filter(
          (attribute) => !attribute.includes('.')
        );
        let dotAttributes = query.attributes.filter((attribute) =>
          attribute.includes('.')
        );
        rootAttributes.forEach((root) => {
          dotAttributes = dotAttributes.filter(
            (attribute) => !attribute.includes(root)
          );
        });
        query.attributes = [...rootAttributes, ...dotAttributes];
        inputAttributes[index] = query.attributes;
        // finding the attributes (projections) and adding isbn/doi if missing
        // as _id by default we are getting
        if (
          !query.attributes.includes('identifiers.isbn') &&
          !query.attributes.includes('identifiers.doi') &&
          !query.attributes.includes('identifiers')
        ) {
          query.attributes = [
            ...query.attributes,
            'identifiers.isbn',
            'identifiers.doi'
          ];
        } else if (
          !query.attributes.includes('identifiers.isbn') &&
          !query.attributes.includes('identifiers') &&
          query.attributes.includes('identifiers.doi')
        ) {
          query.attributes = [...query.attributes, 'identifiers.isbn'];
        } else if (
          !query.attributes.includes('identifiers.doi') &&
          !query.attributes.includes('identifiers') &&
          query.attributes.includes('identifiers.isbn')
        ) {
          query.attributes = [...query.attributes, 'identifiers.doi'];
        }

        // find qualifiedIdentifier for each rulesList & assign to qualifiedIdentifier respectively
        qualifiedIdentifier[index] = this.findQualifiedIdentifier(sQuery.rules);
        log.debug('qualifiedIdentifier::', JSON.stringify(qualifiedIdentifier));

        // creating inputIdentifiers array for each rulesList respectively to match valid/invalid
        inputIdentifiers[index] = this.getInputIdentifiers(
          qualifiedIdentifier[index]
        );
        log.debug('inputIdentifiers::', JSON.stringify(inputIdentifiers));
        // calling searchProducts for each rulesList and storing all promises in searchPromiser
        searchPromiser.push(
          searchV4Service.searchProducts({
            availabilityName,
            hasCounts,
            productType,
            searchQueryParserResult: [query]
          } as ISearchQueryParams)
        );
      });
      // getting all the results for all rulesList respectively in searchResults
      const searchResults = await Promise.all(searchPromiser);
      // for total count of all valid products
      let totalCount = 0;
      log.debug('searchResults ::', JSON.stringify(searchResults));
      // again traversing in the results for all rulesList respectively
      searchResults.forEach((sResult, index) => {
        const products = sResult.products;
        const counts = sResult.counts;

        // allProducts contains all products from all the rulesList
        allProducts.push(
          ...this.getValidInvalidProducts(
            products,
            qualifiedIdentifier[index],
            inputIdentifiers[index],
            inputAttributes[index]
          )
        );

        // if hasCounts is true will get counts in searchResults for each rulesList
        // individual counts for productType will be same but total will be addition of all
        if (counts) {
          counts.forEach((countEntity) => {
            countEntity.type === 'Total'
              ? (totalCount += countEntity.count)
              : allCounts.push(countEntity);
          });
        }
      });
      // assigning total count in our proper response
      allCounts.push({ count: totalCount, type: 'Total' });
      // creating our response as required
      const validateApiResponse = {
        data: allProducts,
        metadata: {
          counts: hasCounts ? allCounts : null
        }
      };

      APIResponse.success(response, validateApiResponse);
    } catch (error) {
      APIResponse.failure(response, error);
    }
  }

  /**
   * @swagger
   * /products/rules:
   *   post:
   *     tags:
   *     - Products
   *     summary: To get parsed rulesString based on rules JSON.
   *     description: |
   *        - You should have a permission to update the Product,
   *        - It's for internal use only,
   *     requestBody:
   *       required: true
   *       content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/requestBodies/JSONRuleForProduct'
   *     responses:
   *       200:
   *         description: Returns a parsed rulesString for the given request.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ParsedRulesResponse'
   *       404:
   *         $ref: '#/components/responses/NotFoundBasic'
   *       400:
   *         $ref: '#/components/responses/BadRequestBasic'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedBasic'
   *       403:
   *         $ref: '#/components/responses/ForbiddenBasic'
   */

  public async handleRuleString(req: Request, res: Response): Promise<void> {
    try {
      const rulesString: GroupedSearchQuery[] = req.body.data;
      if (!rulesString) {
        throw new AppError(`Missing product data in the request payload.`, 400);
      }
      if (!Array.isArray(rulesString)) {
        throw new AppError(`Invalid rulesString ${rulesString}.`, 400);
      }
      const parsedRuleString: ResponseModel.JSONRulesResponse[] =
        productV4Service.getRulesStringFromSearchQuery(rulesString);
      const xTransactionId = productV4Service.getTransactionId();
      const responseData = {
        data: parsedRuleString,
        metadata: {
          message: '',
          transactionId: xTransactionId
        }
      };
      APIResponse.success(res, responseData);
    } catch (error) {
      APIResponse.failure(res, error);
    }
  }

  /**
   * @swagger
   * /products/manuscript/{id}:
   *   get:
   *     tags:
   *     - Products
   *     summary: To get a manuscript pre-article's data based on _id (UUID).
   *     description: Returns pre-article data.
   *     parameters:
   *     - $ref: "#/components/parameters/apiVersion"
   *     - $ref: "#/components/parameters/id"
   *     - $ref: "#/components/parameters/responseGroup"
   *     responses:
   *       200:
   *        description: Returns a pre-article
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/ProductAndAvailability'
   *       404:
   *         $ref: '#/components/responses/NotFoundBasic'
   *       400:
   *         $ref: '#/components/responses/BadRequestBasic'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedBasic'
   *       403:
   *         $ref: '#/components/responses/ForbiddenBasic'
   */
  public async getPreArticle(
    request: Request,
    response: Response
  ): Promise<void> {
    const responseGroup: APIResponseGroup = request.query.responseGroup;
    const identifier: string = request.params.identifier;
    try {
      const preArticleWrapper = await productV4Service.getPreArticleById(
        identifier,
        responseGroup
      );
      if (!preArticleWrapper) {
        APIResponse.failure(response, new AppError('Product not found', 404));
        return;
      }
      preArticleWrapper.product = preProductTransform.transform(
        preArticleWrapper.product
      );
      APIResponse.success(response, preArticleWrapper);
    } catch (error) {
      Logger.handleErrorLog(log, 'getPreArticle', error);
      APIResponse.failure(response, error);
    }
  }

  /**
   * @swagger
   * /products/manuscript:
   *   get:
   *     tags:
   *     - Products
   *     summary: To get multiple pre-articles based on identifier.
   *     description: Returns multiple pre-articles based on identifierName & identifierValues.
   *     parameters:
   *       - $ref: "#/components/parameters/apiVersion"
   *       - $ref: "#/components/parameters/responseGroup"
   *       - $ref: "#/components/parameters/manuscriptIdentifierName"
   *       - $ref: "#/components/parameters/manuscriptIdentifierValues"
   *     responses:
   *       200:
   *        description: Returns all the pre-articles along with their availability.
   *        content:
   *          application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/ProductAndAvailability'
   *       404:
   *         $ref: '#/components/responses/NotFoundBasic'
   *       400:
   *         $ref: '#/components/responses/BadRequestBasic'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedBasic'
   *       403:
   *         $ref: '#/components/responses/ForbiddenBasic'
   */
  public async getPreArticles(
    request: Request,
    response: Response
  ): Promise<void> {
    const responseGroup = request.query.responseGroup;
    const keyname: string = request.query.identifierName;
    const keyvalues: string = request.query.identifierValues;
    try {
      /**
       * All validations related to this endpoint.
       * All the validators either return "true" or throw APP Error.
       * Make sure to put them inside a try catch and handle the error.
       */
      inputValidator.preArticleValidator(request, response);
      let preArticlesWrapper;
      const whitelistedIdentifiers =
        AppConstants.WhitelistedPreArticleIdentifiers;
      if (whitelistedIdentifiers.includes(keyname) && keyvalues) {
        const identifierValues: string[] = keyvalues.split(',');
        preArticlesWrapper = await productV4Service.getPreArticlesByIdentifier(
          keyname,
          identifierValues,
          'preArticle',
          responseGroup
        );
      }
      if (!preArticlesWrapper || preArticlesWrapper.length <= 0) {
        APIResponse.failure(response, new AppError('Product not found', 404));
        return;
      }
      const transformedPreArticles =
        this.getTransformedPreProducts(preArticlesWrapper);
      APIResponse.success(response, transformedPreArticles);
    } catch (error) {
      Logger.handleErrorLog(log, 'getPreArticles', error);
      APIResponse.failure(response, error);
    }
  }

  /**
   * @swagger
   * /products/manuscript/workflow/{id}:
   *   get:
   *     tags:
   *     - Products
   *     summary: To get a manuscript-workflow's data based on _id (UUID).
   *     description: Returns manuscript-workflow data.
   *     parameters:
   *     - $ref: "#/components/parameters/apiVersion"
   *     - $ref: "#/components/parameters/id"
   *     - $ref: "#/components/parameters/responseGroup"
   *     responses:
   *       200:
   *        description: Returns a manuscript-workflow
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/ProductAndAvailability'
   *       404:
   *         $ref: '#/components/responses/NotFoundBasic'
   *       400:
   *         $ref: '#/components/responses/BadRequestBasic'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedBasic'
   *       403:
   *         $ref: '#/components/responses/ForbiddenBasic'
   */
  public async getManuscriptWorkflow(
    request: Request,
    response: Response
  ): Promise<void> {
    const responseGroup: APIResponseGroup = request.query.responseGroup;
    const identifier: string = request.params.identifier;
    try {
      const manuscriptWorkflowWrapper =
        await productV4Service.getManuscriptWorkflowById(
          identifier,
          responseGroup
        );
      if (!manuscriptWorkflowWrapper) {
        APIResponse.failure(response, new AppError('Product not found', 404));
        return;
      }
      manuscriptWorkflowWrapper.product = preProductTransform.transform(
        manuscriptWorkflowWrapper.product
      );
      APIResponse.success(response, manuscriptWorkflowWrapper);
    } catch (error) {
      Logger.handleErrorLog(log, 'getManuscriptWorkflow', error);
      APIResponse.failure(response, error);
    }
  }

  private getTransformedProducts(productsWrapper: IProductWrapper[]) {
    return productsWrapper.map((productWrapper) => {
      productWrapper.product = productTransform.transform(
        productWrapper.product
      );
      return productWrapper;
    });
  }

  private getTransformedPreProducts(preProductsWrapper: IProductWrapper[]) {
    return preProductsWrapper.map((preProductWrapper) => {
      preProductWrapper.product = preProductTransform.transform(
        preProductWrapper.product
      );
      return preProductWrapper;
    });
  }

  private async updateCollectionProduct(req: Request, res: Response) {
    return collectionV4Controller.updateCollectionProduct(req, res);
  }

  private async partialUpdateCollectionProduct(req: Request, res: Response) {
    return collectionV4Controller.partialUpdateCollectionProduct(req, res);
  }

  private async createCreativeWorkProduct(
    req: Request,
    res: Response
  ): Promise<void> {
    const productData = req.body.product;
    try {
      if (!productData.identifiers) {
        throw new AppError(
          `Missing product-data/identifiers in the request.`,
          400
        );
      }
      if (productData.isPartOf) {
        throw new AppError(`Invalid property(s): isPartOf`, 400);
      }
      /**
       * Check if user is sending a valid _id
       * if valid accept it.
       * if invalid throw APP Error,
       * if user is not sending, create one.
       */
      if (productData._id && !isUUID(productData._id, UUIDVersion)) {
        throw new AppError('Invalid _id. Note: Only UUID is allowed.', 400);
      } else {
        /* istanbul ignore else */
        if (!productData._id) {
          const newUUID = productV4Service.getNewId();
          productData._id = newUUID;
        }
      }
      const isAssetExists = await assetV4Service.getAssetById(productData._id, [
        '_id'
      ]);
      if (isAssetExists) {
        throw new AppError('A product already exists with this _id.', 400);
      }
      return productV4Service
        .createProduct(productData)
        .then((createdProduct: any) => {
          APIResponse.created(res, createdProduct);
        })
        .catch((error) => {
          const { _id, type } = req.body.product;
          error['_id'] = _id;
          error['type'] = type;
          Logger.handleErrorLog(log, 'createCreativeWorkProduct', error);
          APIResponse.failure(res, error);
        });
    } catch (error) {
      const { _id, type } = req.body.product;
      error['_id'] = _id;
      error['type'] = type;
      Logger.handleErrorLog(log, 'createCreativeWorkProduct', error);
      APIResponse.failure(res, error);
    }
  }

  private async createCollectionProduct(req: Request, res: Response) {
    return collectionV4Controller.createCollectionProduct(req, res);
  }

  private findQualifiedIdentifier(rules) {
    const whitelistedIdentifiers =
      AppConstants.whitelistedIdentifiersForValidationApi;
    let qualifiedIdentifier = null;

    rules.forEach((sRule) => {
      if (
        sRule.type === 'criteria' &&
        whitelistedIdentifiers.includes(sRule.rule.attribute) &&
        !qualifiedIdentifier
      ) {
        qualifiedIdentifier = sRule;
      } else if (
        sRule.type === 'criteria' &&
        qualifiedIdentifier.rule.relationship === 'IN' &&
        whitelistedIdentifiers.includes(sRule.rule.attribute) &&
        sRule.rule.relationship === 'IN'
      ) {
        qualifiedIdentifier =
          sRule.rule.values.length > qualifiedIdentifier.rule.values.length
            ? sRule
            : qualifiedIdentifier;
      } else if (
        sRule.type === 'criteria' &&
        qualifiedIdentifier.rule.relationship === 'EQ' &&
        whitelistedIdentifiers.includes(sRule.rule.attribute) &&
        sRule.rule.relationship === 'IN'
      ) {
        qualifiedIdentifier = sRule;
      }
    });
    return qualifiedIdentifier;
  }

  private getInputIdentifiers(qualifiedIdentifier) {
    const inputIdentifiers = [];
    if (qualifiedIdentifier.rule.relationship === 'EQ') {
      inputIdentifiers.push({
        name: qualifiedIdentifier.rule.attribute,
        value: qualifiedIdentifier.rule.value
      });
    } else {
      /* istanbul ignore else */
      if (qualifiedIdentifier.rule.relationship === 'IN') {
        qualifiedIdentifier.rule.values.forEach((val) =>
          inputIdentifiers.push({
            name: qualifiedIdentifier.rule.attribute,
            value: val
          })
        );
      }
    }
    return inputIdentifiers;
  }

  private getValidInvalidProducts(
    products,
    qualifiedIdentifier,
    inputIdentifiers,
    inputAttributes
  ) {
    log.debug(
      'getValidInvalidProducts::',
      JSON.stringify(products),
      qualifiedIdentifier,
      inputIdentifiers,
      inputAttributes
    );
    products.forEach((validEntity) => {
      // as availability info is not needed so deleting it
      // delete validEntity.availability;
      const product = validEntity.product;
      // find index of valid product from inputIdentifiers created before for each rulesList
      const inputIdentifier = inputIdentifiers.find(
        (prod) =>
          prod.name === qualifiedIdentifier.rule.attribute &&
          prod.value ===
            _.get(product, qualifiedIdentifier.rule.attribute, undefined)
      );

      // transform valid product as proper response
      const inputIdentifierName = inputIdentifier.name.includes('.')
        ? inputIdentifier.name.split('.')[1]
        : inputIdentifier.name;
      validEntity.identifier = {
        name: inputIdentifierName,
        value: inputIdentifier.value
      };

      // removing the identifiers added by us from attributes (projections) i.e isbn/doi
      if (
        !inputAttributes.includes('identifiers.isbn') &&
        !inputAttributes.includes('identifiers')
      ) {
        delete validEntity.product.identifiers.isbn;
      }
      if (
        !inputAttributes.includes('identifiers.doi') &&
        !inputAttributes.includes('identifiers')
      ) {
        delete validEntity.product.identifiers.doi;
      }
    });
    // prepare Invalid Identifiers
    const invalidInputIdentifiers = inputIdentifiers.filter((inputId) => {
      return !products.some((p) => p.identifier.value === inputId.value);
    });
    if (invalidInputIdentifiers.length !== 0) {
      invalidInputIdentifiers.forEach((invalidEntity) => {
        invalidEntity.name = invalidEntity.name.includes('.')
          ? invalidEntity.name.split('.')[1]
          : invalidEntity.name;
        const invalidProduct = {};
        invalidProduct['identifier'] = invalidEntity;
        invalidProduct['product'] = {};
        invalidProduct['error'] = {
          code: '404',
          message: 'Product is invalid'
        };
        // here products is all products (valid + invalid) of a particular rulesList.
        products.push(invalidProduct);
      });
    }
    return products;
  }
}

export const productV4Controller = new ProductV4Controller();
