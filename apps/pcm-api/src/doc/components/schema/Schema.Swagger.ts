/**
 * @swagger
 * components:
 *  schemas:
 *   apiVersion:
 *     type: string
 *     enum: [4.0.1]
 *     description: "API version (must be 4.0.1)"
 *
 *   identifiersFilter:
 *     type: object
 *     properties:
 *       name:
 *        type: string
 *       values:
 *         type: array
 *         items:
 *           type: string
 *
 *   AvailabilityFilter:
 *     type: object
 *     description: Use of this is deprecated.
 *     deprecated: true
 *     properties:
 *       name:
 *         type: string
 *       status:
 *         type: array
 *         items:
 *           type: string
 *
 *   ContentRespBody:
 *     type: object
 *     properties:
 *       location:
 *         type: string
 *       type:
 *         type: string
 *       accessType:
 *         type: string
 *         enum: [freeAccess, openAccess, licensed]
 *
 *   QueryAPIRespMetaData:
 *     type: object
 *     properties:
 *       offset:
 *         type: number
 *         default: 0
 *       limit:
 *         type: number
 *         default: 30
 *       type:
 *         type: string
 *         default: book
 *         enum: [collection, book, chapter, creativeWork, scholarlyArticle, set, series]
 *       counts:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *             count:
 *               type: number
 *       prices:
 *         type: array
 *         items:
 *           $ref: '#/components/schemas/Price'
 *
 *   QueryRespBody:
 *     type: object
 *     properties:
 *       metadata:
 *         $ref: '#/components/schemas/QueryAPIRespMetaData'
 *       data:
 *         type: array
 *         items:
 *          $ref: '#/components/schemas/ProductAndAvailability'
 *
 *   ValidateRespBody:
 *     type: object
 *     properties:
 *       metadata:
 *         $ref: '#/components/schemas/QueryAPIRespMetaData'
 *       data:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             identifier:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 value:
 *                   type: string
 *             product:
 *               $ref: '#/components/schemas/RespProduct'
 *             availability:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Availability'
 *             error:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                 message:
 *                   type: string
 *
 *   TitleRespBody:
 *     type: object
 *     properties:
 *       identifier:
 *         type: object
 *         properties:
 *           name:
 *             type: string
 *           value:
 *             type: string
 *       variants:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             book:
 *               type: object
 *               properties:
 *                 edition:
 *                   type: string
 *                 format:
 *                   type: string
 *                 publisherImprint:
 *                   type: string
 *                 status:
 *                   type: string
 *             title:
 *               type: string
 *             type:
 *               type: string
 *               enum: [book, collection, chapter, creativeWork, scholarlyArticle, set, series]
 *             identifiers:
 *               type: object
 *               properties:
 *                 dacKey:
 *                   type: string
 *                 doi:
 *                   type: string
 *                 isbn:
 *                   type: string
 *                 isbn10:
 *                   type: string
 *             version:
 *               type: string
 *
 *   CountRespBody:
 *     type: object
 *     properties:
 *       metadata:
 *         $ref: '#/components/schemas/QueryAPIRespMetaData'
 *
 *   ProductAndAvailability:
 *     type: object
 *     properties:
 *       product:
 *         $ref: '#/components/schemas/RespProduct'
 *       availability:
 *         type: array
 *         items:
 *          $ref: '#/components/schemas/Availability'
 */
