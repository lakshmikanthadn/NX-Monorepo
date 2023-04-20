"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partsRevisionSchema = void 0;
exports.partsRevisionSchema = {
    $id: 'PartsRevision',
    $schema: 'http://json-schema.org/draft-07/schema#',
    definitions: {
        GetPartsDeltaReqQuery: {
            additionalProperties: false,
            errorMessage: {
                oneOf: 'Should have either Date Range(fromDate & toDate) OR Version Number (v1 & v2)'
            },
            oneOf: [
                {
                    required: ['fromDate']
                },
                {
                    required: ['v1', 'v2']
                }
            ],
            properties: {
                apiVersion: {
                    type: 'string'
                },
                channel: {
                    enum: ['DS'],
                    type: 'string'
                },
                fromDate: {
                    errorMessage: {
                        format: 'should be in YYYY-MM-DD format'
                    },
                    format: 'date',
                    type: 'string'
                },
                include: {
                    items: {
                        enum: ['partsAdded', 'partsRemoved', 'partsUpdated'],
                        type: 'string'
                    },
                    type: 'array'
                },
                region: {
                    type: 'string'
                },
                responseGroup: {
                    default: 'small',
                    enum: ['small'],
                    type: 'string'
                },
                toDate: {
                    errorMessage: {
                        format: 'should be in YYYY-MM-DD format'
                    },
                    format: 'date',
                    type: 'string'
                },
                v1: {
                    type: 'string'
                },
                v2: {
                    type: 'string'
                }
            },
            required: ['apiVersion'],
            type: 'object'
        },
        PartsDeltaRes: {
            properties: {
                partsAdded: {
                    type: 'string'
                }
            }
        }
    }
};
