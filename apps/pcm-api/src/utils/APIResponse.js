"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIResponse = void 0;
var rTracer = require("cls-rtracer");
var LoggerUtil_1 = require("./LoggerUtil");
var AppError_1 = require("../model/AppError");
var log = LoggerUtil_1.default.getLogger('APIResponse');
var APIResponse = /** @class */ (function () {
    function APIResponse() {
    }
    APIResponse.successWithTraceIdInfo = function (response, responseData) {
        this.send(response, this.getResponseData(responseData), 200);
    };
    APIResponse.failureWithTraceIdInfo = function (response, responseData) {
        this.send(response, this.getResponseData(responseData, true), responseData.code ? responseData.code : 500);
    };
    APIResponse.success = function (response, responseData) {
        this.send(response, responseData, 200);
    };
    APIResponse.created = function (response, responseData) {
        this.send(response, responseData, 201);
    };
    APIResponse.accepted = function (response, responseData) {
        this.send(response, responseData, 202);
    };
    APIResponse.oaFailure = function (response, responseData, errCode) {
        this.send(response, responseData, errCode ? errCode : 400);
    };
    APIResponse.failure = function (response, apiError, handleDeprecation) {
        if (handleDeprecation === void 0) { handleDeprecation = false; }
        if (apiError.name !== 'AppError') {
            apiError = new AppError_1.AppError(apiError.message, 500);
        }
        if (handleDeprecation) {
            this.send(response, { message: apiError.message }, apiError.code);
        }
        else {
            this.send(response, this.getResponseDataFromAppError(apiError), apiError.code);
        }
    };
    APIResponse.getResponseData = function (data, isError) {
        if (isError === void 0) { isError = false; }
        var xTransactionId = rTracer.id();
        var metadata = {
            transactionId: xTransactionId && xTransactionId.toString()
        };
        if (isError) {
            metadata['message'] = data.message || '';
            data = null;
        }
        return {
            data: data,
            metadata: metadata
        };
    };
    APIResponse.getResponseDataFromAppError = function (apiError) {
        var xTransactionId = rTracer.id();
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
        }
        else {
            return {
                data: null,
                metadata: {
                    error: apiError.info,
                    message: apiError.message
                }
            };
        }
    };
    APIResponse.send = function (response, jsonBody, code) {
        // Add the transaction to all the response
        if (jsonBody.metadata) {
            jsonBody.metadata.transactionId = rTracer.id();
        }
        /**
         * Do not add any JSON properties to respLogData
         * stringify them before,
         * Else they will create too many index fields in ELK stack.
         */
        var respLogData = {
            body: code === 200 ? 'NA' : JSON.stringify(jsonBody),
            statusCode: code
        };
        log.info("send response:".concat(JSON.stringify(respLogData)));
        response.status(code);
        response.json(jsonBody);
    };
    return APIResponse;
}());
exports.APIResponse = APIResponse;
