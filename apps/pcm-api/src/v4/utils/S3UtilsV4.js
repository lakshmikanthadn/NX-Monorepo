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
exports.S3UtilsV4 = void 0;
var AmazonS3URI = require("amazon-s3-uri");
var AWS = require("aws-sdk");
var mime = require("mime-types");
var path = require("path");
var util = require("util");
var config_1 = require("../../config/config");
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var SecretMangerUtils_1 = require("./SecretMangerUtils");
var log = LoggerUtil_1.default.getLogger('S3UtilsV4');
var s3 = new AWS.S3({ region: config_1.Config.getPropertyValue('defaultAwsRegion') });
var s3LinkExpiryForUpload = 10 * 60; // seconds. (Set for 10 minutes)
var defaultS3LinkExpiryTime = 10; // seconds. (10 seconds)
var s3LinkExpiryTimeOfVideos = defaultS3LinkExpiryTime; // seconds (30 minutes)
var s3LinkExpirySecondsForBot = 2 * 24 * 60 * 60; // seconds (Set for 2 days)
var S3UtilsV4 = /** @class */ (function () {
    function S3UtilsV4() {
    }
    S3UtilsV4.getPresignedUrlToUpload = function (filePath, fileName) {
        return __awaiter(this, void 0, void 0, function () {
            var bucketName, myBucket, contentType, params;
            return __generator(this, function (_a) {
                log.debug('getPresignedUrlToUpload::,', "path: ".concat(filePath, ", fileName: ").concat(fileName));
                bucketName = config_1.Config.getPropertyValue('contentS3Bucket');
                myBucket = "".concat(bucketName, "/").concat(filePath);
                contentType = mime.lookup(fileName);
                params = {
                    Bucket: myBucket,
                    ContentType: contentType,
                    Expires: s3LinkExpiryForUpload,
                    Key: fileName
                };
                return [2 /*return*/, S3UtilsV4.sign(new AWS.S3(), 'putObject', params)];
            });
        });
    };
    /**
     * Deprecate this method
     */
    S3UtilsV4.uploadToS3 = function (collectionData, id) {
        return __awaiter(this, void 0, void 0, function () {
            var bucketName, date, partialTime, partialDate, dateParts, year, month, day, myBucket, key, params;
            return __generator(this, function (_a) {
                log.debug('uploadToS3::,', "id: ".concat(id, ", collectionData: ").concat(collectionData));
                bucketName = config_1.Config.getPropertyValue('contentS3Bucket');
                date = new Date();
                partialTime = date.toISOString().substr(11, 8);
                partialDate = date.toISOString().substring(0, 10);
                dateParts = partialDate.split('-');
                year = dateParts[0];
                month = dateParts[1];
                day = dateParts[2];
                myBucket = "".concat(bucketName, "/collections/source/").concat(year, "/").concat(month, "/").concat(day);
                key = "".concat(id, "_").concat(partialTime, ".json");
                params = {
                    Body: JSON.stringify(collectionData),
                    Bucket: myBucket,
                    // pass your bucket name
                    Key: key
                };
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        s3.upload(params, function (s3Err, data) {
                            if (s3Err) {
                                log.error('ERROR:: Unable to upload data.', s3Err);
                                resolve(null);
                                return;
                            }
                            log.info("uploadToS3:: File uploaded successfully at ".concat(data.Location));
                            resolve(data.Location);
                        });
                    })];
            });
        });
    };
    S3UtilsV4.headObjects = function (bucket, key) {
        return __awaiter(this, void 0, void 0, function () {
            var params;
            return __generator(this, function (_a) {
                params = {
                    Bucket: bucket,
                    Key: key
                };
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        s3.headObject(params, function (err, metadata) {
                            if (err && err.code === 'NotFound') {
                                resolve(false);
                            }
                            else {
                                resolve(true);
                            }
                        });
                    })];
            });
        });
    };
    S3UtilsV4.getPresignedUrlToRead = function (s3Url, toRender, isPdf, filenamePrefix, mediaType, isBot) {
        if (toRender === void 0) { toRender = false; }
        if (isPdf === void 0) { isPdf = false; }
        return __awaiter(this, void 0, void 0, function () {
            var params, secretData, s3InstForBot, myBucket, strippedKey, expires, strippedKeys, fileExtension, filename;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log.debug('getPresignedUrlToRead::,', "s3Url: ".concat(s3Url, ", toRender: ").concat(toRender, ", isPdf: ").concat(isPdf, ", isBot: ").concat(isBot));
                        return [4 /*yield*/, (0, SecretMangerUtils_1.getAPISecretValues)()];
                    case 1:
                        secretData = _a.sent();
                        s3InstForBot = new AWS.S3({
                            accessKeyId: secretData.accessKeyId,
                            region: config_1.Config.getPropertyValue('defaultAwsRegion'),
                            secretAccessKey: secretData.secretAccessKey,
                            signatureVersion: 'v4'
                        });
                        myBucket = AmazonS3URI(s3Url).bucket;
                        strippedKey = AmazonS3URI(s3Url).key;
                        expires = S3UtilsV4.getExpiration(isBot, mediaType);
                        if (toRender) {
                            params = {
                                Bucket: myBucket,
                                Expires: expires,
                                Key: strippedKey
                            };
                            if (isPdf) {
                                params.ResponseContentType = 'application/pdf';
                            }
                        }
                        else {
                            strippedKeys = path.basename(strippedKey).split('.');
                            fileExtension = strippedKeys[strippedKeys.length - 1];
                            filename = path.basename(strippedKey);
                            if (filenamePrefix) {
                                filename = "".concat(filenamePrefix, "_").concat(mediaType, ".").concat(fileExtension);
                            }
                            params = {
                                Bucket: myBucket,
                                Expires: expires,
                                Key: strippedKey,
                                ResponseContentDisposition: "attachment; filename=\"".concat(filename, "\"")
                            };
                        }
                        return [2 /*return*/, S3UtilsV4.sign(isBot ? s3InstForBot : s3, 'getObject', params)];
                }
            });
        });
    };
    S3UtilsV4.sign = function (s3Inst, operation, params) {
        log.debug('sign:: ', "operation: ".concat(operation, "; params: ").concat(JSON.stringify(params)));
        return new Promise(function (resolve, reject) {
            s3Inst.getSignedUrl(operation, params, function (err, url) {
                if (err) {
                    log.debug('ERROR:: Unable to sign the URL.');
                    resolve(null);
                    return;
                }
                resolve(url);
            });
        });
    };
    S3UtilsV4.getExpiration = function (isBot, mediaType) {
        if (isBot) {
            return s3LinkExpirySecondsForBot;
        }
        else if (mediaType === 'video') {
            return s3LinkExpiryTimeOfVideos;
        }
        else {
            return defaultS3LinkExpiryTime;
        }
    };
    return S3UtilsV4;
}());
exports.S3UtilsV4 = S3UtilsV4;
util.deprecate(S3UtilsV4.uploadToS3, 'This method is deprecated use a Simple Storage Service instead', 'DEP0001');
