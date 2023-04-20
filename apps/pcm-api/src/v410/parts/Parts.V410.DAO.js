"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.partsV410DAO = void 0;
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var ESConnectionUtils_1 = require("../../v4/utils/ESConnectionUtils");
var log = LoggerUtil_1.default.getLogger('PartsV410DAO');
var PartsV410DAO = /** @class */ (function () {
    function PartsV410DAO() {
    }
    PartsV410DAO.prototype.getPartsDataByRegion = function (partsQueryData) {
        return __awaiter(this, void 0, void 0, function () {
            var ids, partTypeToIndex, projections, limit, sortOrder, offsetCursor, region, searchTerm, query, clientReqBody, searchAfterParams, body;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ids = partsQueryData.ids, partTypeToIndex = partsQueryData.partTypeToIndex, projections = partsQueryData.projections, limit = partsQueryData.limit, sortOrder = partsQueryData.sortOrder, offsetCursor = partsQueryData.offsetCursor, region = partsQueryData.region, searchTerm = partsQueryData.searchTerm;
                        log.debug("getPartsDataByRegion:: ", JSON.stringify({
                            ids: ids,
                            limit: limit,
                            offsetCursor: offsetCursor,
                            partTypeToIndex: partTypeToIndex,
                            projections: projections,
                            region: region,
                            searchTerm: searchTerm
                        }));
                        query = {
                            bool: {
                                filter: [
                                    {
                                        terms: {
                                            _id: ids
                                        }
                                    }
                                ]
                            }
                        };
                        if (region) {
                            query.bool['must_not'] = [
                                {
                                    nested: {
                                        path: 'rights',
                                        query: {
                                            bool: {
                                                filter: [{ match: { 'rights.iso3.keyword': region } }]
                                            }
                                        }
                                    }
                                }
                            ];
                        }
                        if (searchTerm) {
                            query.bool['must'] = [
                                {
                                    bool: {
                                        should: [
                                            {
                                                nested: {
                                                    path: 'contributors',
                                                    query: {
                                                        bool: {
                                                            must: [
                                                                {
                                                                    multi_match: {
                                                                        fields: ['contributors.fullName'],
                                                                        query: searchTerm
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    }
                                                }
                                            },
                                            {
                                                multi_match: {
                                                    fields: [
                                                        'title',
                                                        'identifiers.doi',
                                                        'identifiers.isbn',
                                                        'book.publisherImprint'
                                                    ],
                                                    query: searchTerm
                                                }
                                            }
                                        ]
                                    }
                                }
                            ];
                        }
                        clientReqBody = {
                            _source: projections,
                            body: {
                                query: query
                            },
                            index: partTypeToIndex,
                            size: limit
                        };
                        if (sortOrder) {
                            clientReqBody.body['sort'] = [
                                {
                                    _score: sortOrder,
                                    'tieBreakerId.keyword': sortOrder
                                }
                            ];
                        }
                        searchAfterParams = offsetCursor &&
                            offsetCursor !== 'last-page-cursor' &&
                            offsetCursor.split('_');
                        if (offsetCursor && offsetCursor !== 'last-page-cursor') {
                            clientReqBody.body['search_after'] = searchAfterParams;
                        }
                        return [4 /*yield*/, ESConnectionUtils_1.default.search(clientReqBody)];
                    case 1:
                        body = (_a.sent()).body;
                        return [2 /*return*/, {
                                searchData: body.hits.hits,
                                searchTotalCount: body.hits.total.value
                            }];
                }
            });
        });
    };
    return PartsV410DAO;
}());
exports.partsV410DAO = new PartsV410DAO();
