import { Request, Response } from 'express';
import { ResponseModel } from '@tandfgroup/pcm-entity-model-v4';
import { APIResponse } from '../../utils/APIResponse';
import { APIResponseGroup } from '../model/interfaces/CustomDataTypes';
import Logger from '../../utils/LoggerUtil';
import * as rTracer from 'cls-rtracer';
import { partsrevisionV4Service } from './PartsRevisionV4.Service';
const log = Logger.getLogger('PartsRevisionV4Controller');
interface IData {
  partsAdded?: ResponseModel.PartsRevision;
  partsRemoved?: ResponseModel.PartsRevision;
  partsUpdated?: ResponseModel.PartsRevision;
}
export class PartsRevisionV4Controller {
  public async getProductPartsRevisionDelta(
    request: Request,
    response: Response
  ): Promise<any> {
    log.debug(
      'getProductPartsRevisionDelta : Request Params : ',
      request.params
    );
    const identifier: string = request.params.identifier;
    const include: string[] = request.query.include;
    const fromDate: string = request.query.fromDate;
    const toDate: string = request.query.toDate;
    const channel: string = request.query.channel;
    const responseGroup: APIResponseGroup = request.query.responseGroup;
    try {
      const productPartsDelta =
        await partsrevisionV4Service.getProductPartsDelta(
          identifier,
          fromDate,
          toDate,
          include,
          channel,
          responseGroup
        );
      const counts: {
        count: number;
        type: string;
      }[] = [];
      const data: IData = {};
      include.forEach((parts) => {
        data[parts] = productPartsDelta[parts];
        counts.push({
          count: productPartsDelta[parts].length,
          type: parts
        });
      });
      const respMetadata = {
        counts,
        transactionId: rTracer.id()
      };
      const responseOb = { data, metadata: respMetadata };
      APIResponse.success(response, responseOb);
    } catch (error) {
      Logger.handleErrorLog(log, 'getProductPartsRevisionDelta', error);
      APIResponse.failure(response, error);
    }
  }
}

export const partsrevisionV4Controller = new PartsRevisionV4Controller();
