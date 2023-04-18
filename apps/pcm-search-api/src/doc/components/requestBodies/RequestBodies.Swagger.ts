/**
 * @swagger
 * components:
 *  requestBodies:
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
 */
