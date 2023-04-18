/**
 * @swagger
 * components:
 *  requestBodies:
 *
 *   ProductACK:
 *     type: object
 *     properties:
 *       apiVersion:
 *        $ref: "#/components/schemas/apiVersion"
 *       data:
 *        $ref: '#/components/schemas/ProductAcknowledgement'
 *
 *   PatchRequest:
 *     type: object
 *     properties:
 *       apiVersion:
 *        $ref: "#/components/schemas/apiVersion"
 *       data:
 *         type: array
 *         items:
 *           $ref: '#/components/schemas/PatchRequest'
 *
 *   CreateProductMapping:
 *     type: object
 *     properties:
 *       apiVersion:
 *        $ref: "#/components/schemas/apiVersion"
 *       data:
 *         $ref: '#/components/schemas/JournalPublishingServiceMapRequest'
 *
 *   ActionValidate:
 *     type: object
 *     properties:
 *       apiVersion:
 *        $ref: "#/components/schemas/apiVersion"
 *       action:
 *         type: string
 *         enum: [validate]
 *       rulesList:
 *         type: array
 *         items:
 *           $ref: '#/components/schemas/Rules'
 *         description: "Rules-list maximum length should be 1"
 *
 *   CreateContent:
 *     type: object
 *     properties:
 *       apiVersion:
 *        $ref: "#/components/schemas/apiVersion"
 *       fileName:
 *         type: string
 *         description: "Name of the content file to be uploaded to PCM"
 *       format:
 *        type: string
 *        enum: [video, image, document, presentation, portableDocument,audio,archive,spreadsheet]
 *        description: "type – specific to creativeWork"
 *       parentId:
 *         type: string
 *         description: "Unique Identifier of the product(associated parent)"
 *
 *   ActionQuery:
 *     type: object
 *     properties:
 *       apiVersion:
 *        $ref: "#/components/schemas/apiVersion"
 *       action:
 *         type: string
 *         enum: [query]
 *       offset:
 *         description: |
 *          The number of items to skip before starting to collect the result set.
 *            - Use *offsetCursor* instead, that has better performance.
 *            - This value should be set to 0 when using with offsetCursor.
 *         type: number
 *         minimum: 0
 *       limit:
 *         type: number
 *         description: The number of products to return.
 *         default: 30
 *         minimum: 1
 *         maximum: 100
 *       offsetCursor:
 *         type: string
 *         description: |
 *          This value is used for pagination.
 *            - Set this value from the previous page response body from a property nextPageCursor.
 *            - You can also use the lastPageCursor value from the previous response.
 *            - Make sure to set the offset value as zero when using this parameter.
 *       hasCounts:
 *         type: boolean
 *         default: false
 *       availability:
 *         $ref: '#/components/schemas/AvailabilityFilter'
 *       rulesList:
 *         type: array
 *         items:
 *           $ref: '#/components/schemas/Rules'
 *         description: "Rules-list maximum length should be 1"
 *
 *   ActionNewId:
 *     type: object
 *     properties:
 *       apiVersion:
 *        $ref: "#/components/schemas/apiVersion"
 *       action:
 *         type: string
 *         enum: [new-id]
 *
 *   ActionSave:
 *     type: object
 *     properties:
 *       action:
 *         type: string
 *         enum: [save]
 *       product:
 *        oneOf:
 *         - $ref: '#/components/schemas/RespProduct'
 *         - $ref: '#/components/schemas/CollectionProductRequest'
 *
 *   ActionFetchVariants:
 *     type: object
 *     properties:
 *       apiVersion:
 *        $ref: "#/components/schemas/apiVersion"
 *       action:
 *         type: string
 *         enum: [fetchVariants]
 *       includeEditions:
 *         type: boolean
 *         default: false
 *         description: Enabling this flag will return all editions of the requested book.
 *       formats:
 *         type: array
 *         items:
 *           type: string
 *           description: To filter only the required format(s) of the book. example e-Book
 *       identifiers:
 *         items:
 *           $ref: '#/components/schemas/identifiersFilter'
 *
 *   ActionCount:
 *     type: object
 *     properties:
 *       apiVersion:
 *        $ref: "#/components/schemas/apiVersion"
 *       action:
 *         type: string
 *         enum: [count]
 *       hasCounts:
 *         type: boolean
 *         default: false
 *       hasTotalPrices:
 *         type: boolean
 *         default: false
 *       availability:
 *         - $ref: '#/components/schemas/AvailabilityFilter'
 *       rulesList:
 *         type: array
 *         items:
 *           $ref: '#/components/schemas/Rules'
 *
 *   CollectionProduct:
 *     type: object
 *     properties:
 *       apiVersion:
 *        $ref: "#/components/schemas/apiVersion"
 *       product:
 *         $ref: '#/components/schemas/CollectionProductRequest'
 *
 *   JSONRuleForProduct:
 *     type: object
 *     properties:
 *       apiVersion:
 *        $ref: "#/components/schemas/apiVersion"
 *       data:
 *         type: array
 *         items:
 *           $ref: '#/components/schemas/Rules'
 *
 *   PublishingServiceProduct:
 *     type: object
 *     properties:
 *       apiVersion:
 *        $ref: "#/components/schemas/apiVersion"
 *       action:
 *         type: string
 *         enum: [save, update]
 *       product:
 *         $ref: '#/components/schemas/PublishingServiceProductRequest'
 *
 *   JournalProduct:
 *     type: object
 *     properties:
 *       apiVersion:
 *        $ref: "#/components/schemas/apiVersion"
 *       action:
 *         type: string
 *         enum: [update]
 *       product:
 *         $ref: '#/components/schemas/JournalProductRequest'
 *
 *   UpdateOAProduct:
 *     type: object
 *     properties:
 *       product:
 *         $ref: '#/components/schemas/OAProductRequest'
 */
