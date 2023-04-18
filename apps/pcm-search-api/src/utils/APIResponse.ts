import * as rTracer from 'cls-rtracer';
import { Response } from 'express';
import Logger from './LoggerUtil';

import { AppError } from '../model/AppError';
import { IErrorResponse } from '../model/ErrorResponse';

const log = Logger.getLogger('APIResponse');

export class APIResponse {
  public static success(response: Response, responseData: any) {
    this.send(response, responseData, 200);
  }

  public static failure(
    response: Response,
    apiError: AppError,
    handleDeprecation = false
  ) {
    if (apiError.name !== 'AppError') {
      apiError = new AppError(apiError.message, 500);
    }
    if (handleDeprecation) {
      this.send(response, { message: apiError.message }, apiError.code);
    } else {
      this.send(
        response,
        this.getResponseDataFromAppError(apiError),
        apiError.code
      );
    }
  }

  private static getResponseDataFromAppError(
    apiError: AppError
  ): IErrorResponse {
    const xTransactionId = rTracer.id();
    // TODO: Do we need this? is SF handling the errors?
    if (apiError['type']) {
      return {
        data: null,
        metadata: {
          _id: apiError['_id'] || '',
          error: '',
          message: apiError.message || '',
          messages: apiError.info || [],
          transactionDate: new Date().toISOString(),
          transactionId: xTransactionId && xTransactionId.toString(),
          type: apiError['type'] || ''
        }
      };
    } else {
      return {
        data: null,
        metadata: {
          error: apiError.info,
          message: apiError.message
        }
      };
    }
  }

  private static send(response: Response, jsonBody: any, code: number) {
    // Add the transaction to all the response
    // if(jsonBody.metadata) {
    //   jsonBody.metadata.transactionId = rTracer.id();
    // }
    /**
     * Do not add any JSON properties to respLogData
     * stringify them before,
     * Else they will create too many index fields in ELK stack.
     */
    const respLogData = {
      body: code === 200 ? 'NA' : JSON.stringify(jsonBody),
      statusCode: code
    };
    log.info(`send response:${JSON.stringify(respLogData)}`);
    response.status(code);
    response.json(jsonBody);
  }
}
