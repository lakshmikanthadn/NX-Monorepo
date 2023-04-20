"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.contentV4Service = void 0;
var jwt_decode_1 = require("jwt-decode");
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var AppError_1 = require("../../model/AppError");
var config_1 = require("../../config/config");
var constant_1 = require("../../config/constant");
var EntitlementUtil_1 = require("../../utils/EntitlementUtil");
var AssetV4_Service_1 = require("../assets/AssetV4.Service");
var AssociatedMediaV4_Service_1 = require("../associatedMedia/AssociatedMediaV4.Service");
var CloudFront_Service_1 = require("../aws/cloudfront/CloudFront.Service");
var CreativeWorkV4_Service_1 = require("../creativeWork/CreativeWorkV4.Service");
var PartsV4_Service_1 = require("../parts/PartsV4.Service");
var ProductV4_Service_1 = require("../products/ProductV4.Service");
var S3UtilsV4_1 = require("../utils/S3UtilsV4");
var AmazonS3URI = require("amazon-s3-uri");
var log = LoggerUtil_1.default.getLogger('ContentV4Service');
var ContentV4Service = /** @class */ (function () {
    function ContentV4Service() {
    }
    ContentV4Service.prototype.createAssociatedMedia = function (contentData) {
        return __awaiter(this, void 0, void 0, function () {
            var fileName, parentId, contentType, asset, bucketName, region, absolutePath, unsignedUrl, isAssociatedtMediaExists, associatedMedia, signedUrl;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.debug("createAssociatedMedia::", { contentData: contentData });
                        fileName = contentData.fileName;
                        parentId = contentData.parentId;
                        contentType = contentData.type;
                        return [4 /*yield*/, AssetV4_Service_1.assetV4Service.getAssetById(parentId, ['type'])];
                    case 1:
                        asset = _a.sent();
                        if (!asset) {
                            throw new AppError_1.AppError('Product (asset) not found.', 404);
                        }
                        // currently supporting creativeWork only
                        if (asset.type !== 'creativeWork') {
                            throw new AppError_1.AppError('this api supports asset type as creativeWork only', 400);
                        }
                        bucketName = config_1.Config.getPropertyValue('contentS3Bucket');
                        region = config_1.Config.getPropertyValue('secretRegion');
                        absolutePath = "creativework/".concat(parentId);
                        unsignedUrl = "https://".concat(bucketName, ".s3.").concat(region, ".amazonaws.com/").concat(absolutePath, "/").concat(fileName);
                        if (!(contentType === 'hyperlink' || contentType === 'database')) {
                            contentData['location'] = unsignedUrl;
                        }
                        else {
                            contentData['location'] = fileName;
                        }
                        return [4 /*yield*/, AssociatedMediaV4_Service_1.associatedMediaV4Service.getAsstMediaByParentIdAndFilename(parentId, contentData.location)];
                    case 2:
                        isAssociatedtMediaExists = _a.sent();
                        if (isAssociatedtMediaExists) {
                            throw new AppError_1.AppError('A content already exists with this fileName & parentId.', 400);
                        }
                        return [4 /*yield*/, AssociatedMediaV4_Service_1.associatedMediaV4Service.createAssociatedMedia(this.prepareAsstMedia(contentData))];
                    case 3:
                        associatedMedia = _a.sent();
                        if (!associatedMedia) {
                            throw new AppError_1.AppError('Error while creating content', 400);
                        }
                        if (!(contentType === 'hyperlink' || contentType === 'database')) return [3 /*break*/, 4];
                        signedUrl = fileName;
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, S3UtilsV4_1.S3UtilsV4.getPresignedUrlToUpload(absolutePath, fileName)];
                    case 5:
                        signedUrl = _a.sent();
                        _a.label = 6;
                    case 6:
                        if (!(signedUrl && signedUrl !== '')) {
                            throw new AppError_1.AppError('Error while creating signedUrl', 400);
                        }
                        return [4 /*yield*/, CreativeWorkV4_Service_1.creativeWorkV4Service.updateCreativeWorkSources(parentId)];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, AssetV4_Service_1.assetV4Service.updateAssetSources(parentId)];
                    case 8:
                        _a.sent();
                        log.debug("createAssociatedMedia::", { associatedMedia: associatedMedia, signedUrl: signedUrl });
                        return [2 /*return*/, { _id: associatedMedia._id, location: signedUrl }];
                }
            });
        });
    };
    ContentV4Service.prototype.getContentByIdAndType = function (productId, parentId, contentMetaField) {
        return __awaiter(this, void 0, void 0, function () {
            var requestedContentType, toRender, token, filenamePrefix, _a, skipEntitlementCheck, isBot, ip, cf, contentType, signedAssociatedMedia, asset, assetType, currentVersion, asstMediasByType, contentTypesNotWhitelistedCount, response_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        requestedContentType = contentMetaField.contentType, toRender = contentMetaField.toRender, token = contentMetaField.token, filenamePrefix = contentMetaField.filenamePrefix, _a = contentMetaField.skipEntitlementCheck, skipEntitlementCheck = _a === void 0 ? false : _a, isBot = contentMetaField.isBot, ip = contentMetaField.ip, cf = contentMetaField.cf;
                        // replacing debug log with info for time being
                        log.info("getContentByIdAndType::", {
                            filenamePrefix: filenamePrefix,
                            isBot: isBot,
                            parentId: parentId,
                            productId: productId,
                            requestedContentType: requestedContentType,
                            skipEntitlementCheck: skipEntitlementCheck,
                            toRender: toRender
                        });
                        return [4 /*yield*/, this.remapContent(requestedContentType)];
                    case 1:
                        contentType = _b.sent();
                        signedAssociatedMedia = [];
                        return [4 /*yield*/, AssetV4_Service_1.assetV4Service.getAssetById(productId, ['type'])];
                    case 2:
                        asset = _b.sent();
                        if (!asset) {
                            throw new AppError_1.AppError('Product Asset not found', 404);
                        }
                        assetType = asset.type;
                        return [4 /*yield*/, this.checkCurrentVersionBasedOnAssetType(assetType, productId)];
                    case 3:
                        currentVersion = _b.sent();
                        return [4 /*yield*/, this.getAsstMediaByType(productId, currentVersion, contentType)];
                    case 4:
                        asstMediasByType = _b.sent();
                        return [4 /*yield*/, this.NonWhiteListContentCount(asstMediasByType)];
                    case 5:
                        contentTypesNotWhitelistedCount = _b.sent();
                        if (!(contentTypesNotWhitelistedCount === 0 ||
                            skipEntitlementCheck === true)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.getSignedOrUnsignedAsstdMedia(asstMediasByType, { cf: cf, filenamePrefix: filenamePrefix, ip: ip, isBot: isBot, toRender: toRender })];
                    case 6:
                        signedAssociatedMedia = _b.sent();
                        // adding accessType in content
                        return [2 /*return*/, signedAssociatedMedia.map(function (media) {
                                media.accessType = null;
                                return media;
                            })];
                    case 7: return [4 /*yield*/, this.checkEntitlement(asset, parentId, token, toRender, ip)];
                    case 8:
                        response_1 = _b.sent();
                        log.info("getContentByIdAndType:: ".concat(__assign({}, response_1)));
                        if (!response_1.isEntitlementAvailable) {
                            throw new AppError_1.AppError("You do not have access to view this content", 403);
                        }
                        return [4 /*yield*/, this.getSignedOrUnsignedAsstdMedia(asstMediasByType, { cf: cf, filenamePrefix: filenamePrefix, ip: ip, isBot: isBot, toRender: toRender })];
                    case 9:
                        signedAssociatedMedia = _b.sent();
                        // adding accessType in content
                        return [2 /*return*/, signedAssociatedMedia.map(function (media) {
                                media.accessType = response_1.entitlementType;
                                return media;
                            })];
                }
            });
        });
    };
    ContentV4Service.prototype.getOAandBeforePayWallContentByIdAndType = function (productId, parentId, contentMetaField) {
        return __awaiter(this, void 0, void 0, function () {
            var requestedContentType, toRender, filenamePrefix, isBot, ip, cf, contentType, signedAssociatedMedia, asset, assetType, currentVersion, asstMediasByType, contentTypesNotWhitelistedCount, isOA;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requestedContentType = contentMetaField.contentType, toRender = contentMetaField.toRender, filenamePrefix = contentMetaField.filenamePrefix, isBot = contentMetaField.isBot, ip = contentMetaField.ip, cf = contentMetaField.cf;
                        // replacing debug log with info for time being
                        log.info("getOAandBeforePayWallContentByIdAndType::", {
                            filenamePrefix: filenamePrefix,
                            isBot: isBot,
                            parentId: parentId,
                            productId: productId,
                            requestedContentType: requestedContentType,
                            toRender: toRender
                        });
                        return [4 /*yield*/, this.remapContent(requestedContentType)];
                    case 1:
                        contentType = _a.sent();
                        signedAssociatedMedia = [];
                        return [4 /*yield*/, AssetV4_Service_1.assetV4Service.getAssetById(productId, ['type'])];
                    case 2:
                        asset = _a.sent();
                        if (!asset) {
                            throw new AppError_1.AppError('Product Asset not found', 404);
                        }
                        assetType = asset.type;
                        return [4 /*yield*/, this.checkCurrentVersionBasedOnAssetType(assetType, productId)];
                    case 3:
                        currentVersion = _a.sent();
                        return [4 /*yield*/, this.getAsstMediaByType(productId, currentVersion, contentType)];
                    case 4:
                        asstMediasByType = _a.sent();
                        return [4 /*yield*/, this.NonWhiteListContentCount(asstMediasByType)];
                    case 5:
                        contentTypesNotWhitelistedCount = _a.sent();
                        if (!(contentTypesNotWhitelistedCount === 0)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.getSignedOrUnsignedAsstdMedia(asstMediasByType, { cf: cf, filenamePrefix: filenamePrefix, ip: ip, isBot: isBot, toRender: toRender })];
                    case 6:
                        signedAssociatedMedia = _a.sent();
                        // adding accessType in content
                        return [2 /*return*/, signedAssociatedMedia.map(function (media) {
                                media.accessType = null;
                                return media;
                            })];
                    case 7: return [4 /*yield*/, ProductV4_Service_1.productV4Service.isOpenAccess(asset.type, asset._id)];
                    case 8:
                        isOA = _a.sent();
                        if (!isOA) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.getSignedOrUnsignedAsstdMedia(asstMediasByType, { cf: cf, filenamePrefix: filenamePrefix, ip: ip, isBot: isBot, toRender: toRender })];
                    case 9:
                        signedAssociatedMedia = _a.sent();
                        // adding accessType in content
                        return [2 /*return*/, signedAssociatedMedia.map(function (media) {
                                media.accessType = 'openAccess';
                                return media;
                            })];
                    case 10: throw new AppError_1.AppError("The product is not open access", 400);
                }
            });
        });
    };
    ContentV4Service.prototype.checkEntitlement = function (asset, parentId, token, toRender, ip) {
        return __awaiter(this, void 0, void 0, function () {
            var apiVersion, isEntitlementAvailable, entitlementType, promises, decodedJwt, user, partyId, organizationId, entitlementData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.debug("checkEntitlement:: ", { asset: asset, parentId: parentId });
                        apiVersion = '4.0.1';
                        isEntitlementAvailable = true;
                        entitlementType = '';
                        if (!asset) {
                            log.debug("checkEntitlement:: asset: ".concat(asset, " not found."));
                            throw new AppError_1.AppError('Content not found', 404);
                        }
                        promises = [ProductV4_Service_1.productV4Service.isOpenAccess(asset.type, asset._id)];
                        if (parentId) {
                            promises.push(PartsV4_Service_1.partsV4Service.isAccessibleForFree(parentId, asset._id));
                        }
                        else {
                            promises.push(Promise.resolve(false));
                        }
                        log.debug("checkEntitlement:: token: ".concat(token));
                        decodedJwt = (0, jwt_decode_1.default)(token);
                        user = decodedJwt.user;
                        if (user) {
                            partyId = user.partyId;
                            organizationId = user.organizationId;
                            promises.push(EntitlementUtil_1.entitlementUtils.isEntitled(partyId, asset._id, organizationId, apiVersion, toRender, token, ip));
                        }
                        else {
                            promises.push(Promise.resolve(false));
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        entitlementData = _a.sent();
                        if (entitlementData[0]) {
                            entitlementType = 'openAccess';
                        }
                        else if (entitlementData[1]) {
                            entitlementType = 'freeAccess';
                        }
                        else if (entitlementData[2]) {
                            entitlementType = 'licensed';
                        }
                        else {
                            isEntitlementAvailable = false;
                        }
                        return [2 /*return*/, Promise.resolve({
                                entitlementType: entitlementType,
                                isEntitlementAvailable: isEntitlementAvailable
                            })];
                }
            });
        });
    };
    ContentV4Service.prototype.remapContent = function (requestedContentType) {
        return __awaiter(this, void 0, void 0, function () {
            var allRequestedContentTypes;
            return __generator(this, function (_a) {
                allRequestedContentTypes = requestedContentType
                    ? requestedContentType.split(',')
                    : [];
                return [2 /*return*/, this.remapContentType(allRequestedContentTypes)];
            });
        });
    };
    ContentV4Service.prototype.checkCurrentVersionBasedOnAssetType = function (assetType, productId) {
        return __awaiter(this, void 0, void 0, function () {
            var currentVersion, productWrapper;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(assetType === 'scholarlyArticle')) return [3 /*break*/, 2];
                        return [4 /*yield*/, ProductV4_Service_1.productV4Service.getProductById(productId, 'medium', null, null)];
                    case 1:
                        productWrapper = _a.sent();
                        currentVersion =
                            productWrapper && productWrapper.product["".concat(assetType)].currentVersion;
                        _a.label = 2;
                    case 2: return [2 /*return*/, currentVersion];
                }
            });
        });
    };
    ContentV4Service.prototype.getAsstMediaByType = function (productId, currentVersion, contentType) {
        return __awaiter(this, void 0, void 0, function () {
            var asstMedias, asstMediasByType;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, AssociatedMediaV4_Service_1.associatedMediaV4Service.getContentMetaDataByParentid(productId, true, currentVersion)];
                    case 1:
                        asstMedias = _a.sent();
                        if (!asstMedias || asstMedias.length === 0) {
                            log.warn("getContentByIdAndType:: No associatedmedia found for ".concat({
                                currentVersion: currentVersion,
                                productId: productId
                            }));
                            return [2 /*return*/, []];
                        }
                        asstMediasByType = contentType.length
                            ? asstMedias.filter(function (media) { return contentType.includes(media.type); })
                            : asstMedias;
                        return [2 /*return*/, asstMediasByType];
                }
            });
        });
    };
    ContentV4Service.prototype.NonWhiteListContentCount = function (asstMediasByType) {
        return __awaiter(this, void 0, void 0, function () {
            var contentTypesNotWhitelistedCount;
            return __generator(this, function (_a) {
                contentTypesNotWhitelistedCount = asstMediasByType.length &&
                    asstMediasByType.reduce(function (nonWhitelistedCount, asstMedia) {
                        if (!constant_1.AppConstants.ContentTypesWhitelistBeforePayWall.includes(asstMedia.type)) {
                            nonWhitelistedCount++;
                        }
                        return nonWhitelistedCount;
                    }, 0);
                return [2 /*return*/, contentTypesNotWhitelistedCount];
            });
        });
    };
    ContentV4Service.prototype.getSignedOrUnsignedAsstdMedia = function (asstMedias, _a) {
        var toRender = _a.toRender, filenamePrefix = _a.filenamePrefix, isBot = _a.isBot, ip = _a.ip, cf = _a.cf;
        return __awaiter(this, void 0, void 0, function () {
            var signedAssociatedMedia, associatedMediaPromise;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        log.debug("getSignedOrUnsignedAsstdMedia:: ", { asstMedias: asstMedias, toRender: toRender });
                        signedAssociatedMedia = [];
                        associatedMediaPromise = asstMedias.map(function (media) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                if (constant_1.AppConstants.ContentTypesSignatureNotRequired.includes(media.type)) {
                                    return [2 /*return*/, Promise.resolve({
                                            _id: media._id,
                                            location: media.location,
                                            size: media.size,
                                            type: media.type
                                        })];
                                }
                                else {
                                    return [2 /*return*/, this.getSignedAsstdMedia(media, {
                                            cf: cf,
                                            filenamePrefix: filenamePrefix,
                                            ip: ip,
                                            isBot: isBot,
                                            toRender: toRender
                                        })];
                                }
                                return [2 /*return*/];
                            });
                        }); });
                        return [4 /*yield*/, Promise.all(associatedMediaPromise)];
                    case 1:
                        signedAssociatedMedia = _b.sent();
                        log.debug("getSignedOrUnsignedAsstdMedia:: ", { signedAssociatedMedia: signedAssociatedMedia });
                        return [2 /*return*/, signedAssociatedMedia];
                }
            });
        });
    };
    ContentV4Service.prototype.getSignedAsstdMedia = function (media, _a) {
        var toRender = _a.toRender, filenamePrefix = _a.filenamePrefix, isBot = _a.isBot, ip = _a.ip, cf = _a.cf;
        return __awaiter(this, void 0, void 0, function () {
            var _b, bucket, key, hasContent, location_1, url, url;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        log.debug("getSignedAsstdMedia:: ", { isBot: isBot, media: media, toRender: toRender });
                        _b = AmazonS3URI(media.location), bucket = _b.bucket, key = _b.key;
                        return [4 /*yield*/, S3UtilsV4_1.S3UtilsV4.headObjects(bucket, key)];
                    case 1:
                        hasContent = _c.sent();
                        if (!hasContent) {
                            log.error("No content found at ".concat(media.location, " for ").concat(media.type));
                            return [2 /*return*/, {
                                    _id: media._id,
                                    location: null,
                                    size: media.size,
                                    type: media.type
                                }];
                        }
                        if (!(cf === true)) return [3 /*break*/, 3];
                        location_1 = new URL(media.location);
                        return [4 /*yield*/, CloudFront_Service_1.cloudfrontService.getSignedUrlToRead(location_1.pathname, { contentType: media.type, filenamePrefix: filenamePrefix, ip: ip, isBot: isBot, toRender: toRender })];
                    case 2:
                        url = _c.sent();
                        return [2 /*return*/, {
                                _id: media._id,
                                location: url,
                                size: media.size,
                                type: media.type
                            }];
                    case 3: return [4 /*yield*/, S3UtilsV4_1.S3UtilsV4.getPresignedUrlToRead(media.location, toRender, media.type ? media.type.includes('pdf') : false, filenamePrefix, media.type, isBot)];
                    case 4:
                        url = _c.sent();
                        if (url === 'https://s3.amazonaws.com/') {
                            throw new Error('Error generating presigned url for the content');
                        }
                        return [2 /*return*/, {
                                _id: media._id,
                                location: url,
                                size: media.size,
                                type: media.type
                            }];
                }
            });
        });
    };
    ContentV4Service.prototype.prepareAsstMedia = function (associatedMedia) {
        return {
            _id: ProductV4_Service_1.productV4Service.getNewId(),
            location: associatedMedia.location,
            parentId: associatedMedia.parentId,
            parentType: 'creativeWork',
            size: null,
            type: associatedMedia.type,
            versionType: 'FINAL'
        };
    };
    /**
     * This method remap the requested content type(s) to the actual content type(s)
     * stored in the associated media
     * @param requestedContentType array of strings representing content types
     * @returns string array with mapped content types
     */
    ContentV4Service.prototype.remapContentType = function (requestedContentType) {
        return requestedContentType.map(function (type) {
            return constant_1.AppConstants.ContentTypeMapping[type] || type;
        });
    };
    return ContentV4Service;
}());
exports.contentV4Service = new ContentV4Service();
