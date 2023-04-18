"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const addtionalJournalClassificationValidator_1 = __importDefault(require("./model/interface/businessProducts/addtionalJournalClassificationValidator"));
const addtionalJournalPermissionValidator_1 = __importDefault(require("./model/interface/businessProducts/addtionalJournalPermissionValidator"));
// get jsonschema file path
const parentFilePath = path.join(__dirname, '../lib/model/definitions/openApiComponents.json');
const mainSchema = fs.readFileSync(parentFilePath, 'utf-8');
const parentObj = JSON.parse(mainSchema);
// override PublishingServiceRequestClassification
parentObj.definitions.PublishingServiceRequestClassification = Object.assign(Object.assign({}, parentObj.definitions.PublishingServiceRequestClassification), addtionalJournalClassificationValidator_1.default);
// override JournalProductRequestClassification
parentObj.definitions.JournalProductRequestClassification = Object.assign(Object.assign({}, parentObj.definitions.JournalProductRequestClassification), addtionalJournalClassificationValidator_1.default);
// override JournalProductRequestPermission
parentObj.definitions.JournalProductRequestPermission = Object.assign(Object.assign({}, parentObj.definitions.JournalProductRequestPermission), addtionalJournalPermissionValidator_1.default
// comemments
);
fs.writeFileSync(parentFilePath, JSON.stringify(parentObj, null, 2));
