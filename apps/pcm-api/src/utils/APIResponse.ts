import * as rTracer from 'cls-rtracer';
import { Response } from 'express';
import Logger from './LoggerUtil';

import { AppError } from '../model/AppError';
import { IErrorResponse } from '../model/ErrorResponse';

const log = Logger.getLogger('APIResponse');

export class APIResponse {
  public static successWithTraceIdInfo(response: Response, responseData: any) {
    this.send(response, this.getResponseData(responseData), 200);
  }
  public static failureWithTraceIdInfo(response: Response, responseData: any) {
    this.send(
      response,
      this.getResponseData(responseData, true),
      responseData.code ? responseData.code : 500
    );
  }
  public static success(response: Response, responseData: any) {
    this.send(response, responseData, 200);
  }

  public static created(response: Response, responseData: any) {
    this.send(response, responseData, 201);
  }

  public static accepted(response: Response, responseData: any) {
    this.send(response, responseData, 202);
  }
  public static oaFailure(
    response: Response,
    responseData: any,
    errCode?: number
  ) {
    this.send(response, responseData, errCode ? errCode : 400);
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

  private static getResponseData(data: any, isError = false) {
    const xTransactionId = rTracer.id();
    const metadata = {
      transactionId: xTransactionId && xTransactionId.toString()
    };
    if (isError) {
      metadata['message'] = data.message || '';
      data = null;
    }
    return {
      data,
      metadata
    };
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
    if (jsonBody.metadata) {
      jsonBody.metadata.transactionId = rTracer.id();
    }
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
