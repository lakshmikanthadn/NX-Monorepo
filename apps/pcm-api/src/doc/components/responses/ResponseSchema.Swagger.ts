/**
 * @swagger
 * components:
 *  schemas:
 *
 *   ErrorMessageResponse:
 *     type: object
 *     properties:
 *       metadata:
 *         $ref: "#/components/schemas/ErrorRespMetadata"
 *
 *   SuccessMessageResponse:
 *     type: object
 *     properties:
 *       metadata:
 *         $ref: "#/components/schemas/SuccessRespMetadata"
 *
 *   ParsedRulesResponse:
 *     type: object
 *     properties:
 *       metadata:
 *         $ref: "#/components/schemas/SuccessRespMetadata"
 *       data:
 *         type: array
 *         items:
 *           $ref: "#/components/schemas/JSONRulesResponse"
 *
 *   ErrorRespMetadata:
 *     type: object
 *     properties:
 *       message:
 *         type: string
 *         description: Error message
 *       error:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             dataPath:
 *               type: string
 *             schemaPath:
 *               type: string
 *             keyword:
 *               type: string
 *             description:
 *               type: string
 *             params:
 *               type: object
 *       transactionId:
 *         $ref: "#/components/schemas/TransactionId"
 *
 *   TransactionId:
 *     type: string
 *     description: transaction id for reference. (Share this ID with PCM for debugging.)
 *
 *   SuccessRespMetadata:
 *     type: object
 *     properties:
 *       message:
 *         type: string
 *         description: success message
 *       transactionId:
 *         $ref: "#/components/schemas/TransactionId"
 *
 *   TaxonomyMasterResp:
 *     type: array
 *     items:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         classificationType:
 *           type: string
 *         code:
 *           type: string
 *         level:
 *           type: number
 *         name:
 *           type: string
 *         parentId:
 *           type: string
 *
 *   TaxonomyResp:
 *     type: array
 *     items:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         assetType:
 *           type: string
 *         type:
 *           type: string
 *         code:
 *           type: string
 *         level:
 *           type: number
 *         name:
 *           type: string
 *         parentId:
 *           type: string
 */
