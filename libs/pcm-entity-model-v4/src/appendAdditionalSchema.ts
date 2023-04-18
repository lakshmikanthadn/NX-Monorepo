import * as fs from 'fs';
import * as path from 'path';

import additionalJournalClassification from './model/interface/businessProducts/addtionalJournalClassificationValidator';
import additionalJournalPermission from './model/interface/businessProducts/addtionalJournalPermissionValidator';
// get jsonschema file path
const parentFilePath = path.join(
  __dirname,
  '../lib/model/definitions/openApiComponents.json'
);

const mainSchema = fs.readFileSync(parentFilePath, 'utf-8');
const parentObj = JSON.parse(mainSchema);

// override PublishingServiceRequestClassification
parentObj.definitions.PublishingServiceRequestClassification = {
  ...parentObj.definitions.PublishingServiceRequestClassification,
  ...additionalJournalClassification
};

// override JournalProductRequestClassification
parentObj.definitions.JournalProductRequestClassification = {
  ...parentObj.definitions.JournalProductRequestClassification,
  ...additionalJournalClassification
};

// override JournalProductRequestPermission
parentObj.definitions.JournalProductRequestPermission = {
  ...parentObj.definitions.JournalProductRequestPermission,
  ...additionalJournalPermission
  // comemments
};

fs.writeFileSync(parentFilePath, JSON.stringify(parentObj, null, 2));
