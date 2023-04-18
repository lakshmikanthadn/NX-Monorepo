import { HasPart } from './hasPart';

export interface Parts {
  _id: string;
  _schemaVersion: string;
  _createdDate: Date;
  _modifiedDate: Date;
  // confirm version?
  version: string;
  parts: HasPart[];
}
