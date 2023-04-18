import { RequestModel } from '@tandfgroup/pcm-entity-model-v4';
import { hasPermission } from '@tandfgroup/privilege-authorization-manager';
import { Request, Response } from 'express';
import { AppError } from '../../model/AppError';
import { APIResponse } from '../../utils/APIResponse';
import Logger from '../../utils/LoggerUtil';
import { ackService } from './ACK.Service';
import { Config } from '../../config/config';
const log = Logger.getLogger('ACKController');
const iamEnv: string = Config.getPropertyValue('iamEnv');

class ACKController {
  /**
   * @swagger
   * /products/{id}/ack:
   *   post:
   *     tags:
   *     - ACK
   *     summary: Send acknowledgement to PCM when the product is received.
   *     description: >
   *       This is to send the acknowledgement to PCM when you receive the PRODUCT
   *       update/create events from PCM.
   *       User should have a right permission in order to send the acknowledgement.
   *       You might need a service account in order to access this endpoint.
   *     parameters:
   *       - $ref: "#/components/parameters/id"
   *     requestBody:
   *       required: true
   *       content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/requestBodies/ProductACK'
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
  public async handleAssetDistributionAck(
    request: Request,
    response: Response
  ): Promise<void> {
    const applicationName = request.body?.data?.name;
    if (['KORTEXT'].includes(applicationName)) {
      return this.ackKortextAssetDistribution(request, response);
    } else {
      return APIResponse.failure(
        response,
        new AppError('Invalid application name', 400, [
          { message: `Invalid name ${applicationName}`, path: '/name' }
        ])
      );
    }
  }

  public async _ackAssetDistribution(request: Request, response: Response) {
    const ack: RequestModel.ProductAcknowledgement = request.body.data;
    const assetId: string = request.params.identifier;
    try {
      await ackService.ackAssetDistribution(assetId, ack);
      return APIResponse.accepted(response, {
        data: null,
        metadata: { message: `Acknowledgement is accepted successfully.` }
      });
    } catch (error) {
      Logger.handleErrorLog(log, 'ackKortextAssetDistribution:: ', error);
      return APIResponse.failure(response, error);
    }
  }

  @hasPermission(['api', 'kortext-asset-ack', 'create'], null, iamEnv)
  private async ackKortextAssetDistribution(
    request: Request,
    response: Response
  ): Promise<void> {
    return this._ackAssetDistribution(request, response);
  }
}

export const ackController = new ACKController();
