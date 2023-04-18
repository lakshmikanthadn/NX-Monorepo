/**
 * @swagger
 * components:
 *  parameters:
 *
 *   offsetParam:
 *     in: query
 *     name: offset
 *     required: false
 *     description: The number of items to skip before starting to collect the result set.
 *     schema:
 *       type: number
 *       default: 0
 *       minimum: 0
 *
 *   availabilityNameParam:
 *    in: query
 *    name: availabilityName
 *    required: false
 *    description: |
 *     Name of the availability channel.
 *     Use this query parameter to filter the availability by channel name.
 *      - By default API returns all channels availability information.
 *      - Note: This is not a "product" filter.
 *    schema:
 *     type: string
 *
 *   limitParam:
 *     in: query
 *     name: limit
 *     required: false
 *     description: The number of products to return.
 *     schema:
 *       type: number
 *       default: 30
 *       minimum: 1
 *       maximum: 50
 *
 *   limitParamForParts:
 *     in: query
 *     name: limit
 *     required: false
 *     schema:
 *       type: number
 *       default: 30
 *       minimum: 1
 *     description: |
 *       The number of products to return. Max value varies from 1 to 500. Check the below table.
 *       |  response group    |    Max Limit      |
 *       |--------------------|-------------------|
 *       | small/medium       |       500         |
 *       | large              |   Not supported   |
 *
 *   id:
 *     name: id
 *     in: path
 *     description: "UUID - identifier of the product."
 *     required: true
 *     schema:
 *       type: string
 *
 *   productIdentifier:
 *     name: productIdentifier
 *     in: path
 *     description: |
 *       Any of the Product identifier.
 *        - Use this together with the productIdentifierName query parameter.
 *        - This is helpful when user wants to identify a Product with identifier other than UUID.
 *     required: true
 *     schema:
 *       type: string
 *
 *   partIdParam:
 *     name: partId
 *     in: path
 *     description: "UUID - identifier of the part."
 *     required: true
 *     schema:
 *       type: string
 *
 *   apiVersion:
 *     name: apiVersion
 *     in: query
 *     description: "The value must be 4.0.1"
 *     required: true
 *     schema:
 *       type: string
 *       enum: [4.0.1]
 *
 *   apiVersion410:
 *     name: apiVersion
 *     in: query
 *     description: "The value must be 4.1.0"
 *     required: true
 *     schema:
 *       type: string
 *       enum: [4.1.0]
 *
 *   responseGroup:
 *     name: responseGroup
 *     in: query
 *     description: "One can choose among the following type of response they want."
 *     required: false
 *     schema:
 *       type: string
 *       default: small
 *       enum: [small,medium,large]
 *
 *   responseGroupForParts:
 *     name: responseGroup
 *     in: query
 *     description: "One can choose among the following the type of response they want."
 *     required: false
 *     schema:
 *       type: string
 *       default: small
 *       enum: [small, medium]
 *
 *   productType:
 *     name: type
 *     in: query
 *     schema:
 *      $ref: "#/components/schemas/Product"
 *
 *   productTypeSupported:
 *     name: type
 *     in: query
 *     schema:
 *       type: string
 *       enum: [books, chapters]
 *       description: Name of the supported product.
 *
 *   taxonomyAssetType:
 *     name: type
 *     in: query
 *     schema:
 *       type: string
 *
 *   taxonomyType:
 *     name: type
 *     in: query
 *     schema:
 *       type: string
 *
 *   identifierName:
 *     name: identifierName
 *     in: query
 *     schema:
 *      type: string
 *      enum: [doi,isbn,dacKey,_id,journalId,collectionId,journalAcronym]
 *      description: Name of the identifier.
 *
 *   productIdentifierName:
 *     name: productIdentifierName
 *     in: query
 *     required: true
 *     schema:
 *      type: string
 *      enum: [journalAcronym]
 *      description: Name of the product identifier that is passed in path parameter {id}.
 *
 *   identifierValue:
 *     name: identifierValue
 *     in: query
 *     schema:
 *      type: string
 *      description: identifier value, any one of the id mentioned in identifierName.
 *
 *   identifierValues:
 *     in: query
 *     name: identifierValues
 *     schema:
 *       type: string
 *     description: |
 *      Identifier value, any one of the id mentioned in identifierName.
 *       - Comma separated values. Maximum ids varies from 1 to 100.
 *       - Check the below table.
 *          | identifierName  |  response group    | Max identifierValues |
 *          |-----------------|--------------------|----------------------|
 *          |   dacKey/doi    | small/medium/large |       30             |
 *          |   journalId     | small/medium/large |       30             |
 *          | journalAcronym  | small/medium       |       100            |
 *          | journalAcronym  | large              |       50             |
 *          |   isbn/_id      | small/medium       |       100            |
 *          |   isbn/_id      | large              |       50             |
 *          | all-other-ids   | small/medium/large |       30             |
 *
 */
