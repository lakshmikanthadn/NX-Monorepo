/**
 * @swagger
 * components:
 *  responses:
 *   NotFoundBasic:
 *     description: The specified resource was not found.
 *     content:
 *       application/json:
 *         schema:
 *           $ref: '#/components/schemas/ErrorMessageResponse'
 *
 *   UnauthorizedBasic:
 *     description: |
 *          Please sign in before you access the service
 *          - When you don't pass a valid token in the Authorization header.
 *     content:
 *       text/html:
 *         schema:
 *           type: string
 *           example: Please sign in before you access the service
 *
 *   ForbiddenBasic:
 *     description: |
 *      You don't have access to this service.
 *       - When you have a valid token but you don't have access to the resource.
 *       - When your token is expired.
 *     content:
 *       text/html:
 *         schema:
 *           type: string
 *           example: Forbidden - You dont have access to this service
 *       application/json:
 *         schema:
 *           $ref: '#/components/schemas/ErrorMessageResponse'
 *
 *   BadRequestBasic:
 *     description: |
 *       Invalid/Bad request.
 *         - The request sent by the client has errors in the request parameters/body.
 *         - Check metadata in the response body for more detailed info on the error.
 *     content:
 *       application/json:
 *         schema:
 *           $ref: '#/components/schemas/ErrorMessageResponse'
 *
 *   AcceptedBasic:
 *     description: The request has been accepted and will be processed soon.
 *     content:
 *       application/json:
 *         schema:
 *           $ref: '#/components/schemas/SuccessMessageResponse'
 *
 *   MethodNotAllowedBasic:
 *    description: Method not allowed for the product type
 *    content:
 *      application/json:
 *        schema:
 *          $ref: '#/components/schemas/ErrorMessageResponse'
 */
