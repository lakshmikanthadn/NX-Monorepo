import { Parts } from './partsV4';
import { PartsChangedInfo } from './partsChangedInfo';
export interface PartsRevision extends Parts {
  parentId: string;
  revision: number;
  partsAdded?: PartsChangedInfo[];
  partsRemoved?: PartsChangedInfo[];
  partsUpdated?: PartsChangedInfo[];
}
