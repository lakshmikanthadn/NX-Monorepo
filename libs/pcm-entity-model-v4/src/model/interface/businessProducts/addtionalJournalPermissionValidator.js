"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    allOf: [
        {
            if: {
                properties: {
                    name: {
                        const: 'open-select'
                    }
                }
            },
            then: {
                properties: {
                    code: { enum: ['OS'] }
                }
            }
        },
        {
            if: {
                properties: {
                    name: {
                        const: 'open-access'
                    }
                }
            },
            then: {
                properties: {
                    code: { enum: ['OA'] }
                }
            }
        }
    ]
};
