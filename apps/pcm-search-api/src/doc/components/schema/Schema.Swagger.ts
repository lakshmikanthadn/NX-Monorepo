/**
 * @swagger
 * components:
 *  schemas:
 *   apiVersion:
 *     type: string
 *     enum: [4.0.1]
 *     description: "API version (must be 4.0.1)"
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
 *       source:
 *         type: string
 *         enum: [Elasticsearch]
 *         description: "Source must be Elasticsearch"
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
