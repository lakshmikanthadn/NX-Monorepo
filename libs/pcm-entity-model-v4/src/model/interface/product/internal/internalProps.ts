import { Source } from '../../shared/source';

export interface InternalProps {
  _sources?: Source[];
  _schemaVersion?: string;
  _createdDate?: Date;
  _modifiedDate?: Date;
  _status?: string;
  _isSellable?: boolean;
}
