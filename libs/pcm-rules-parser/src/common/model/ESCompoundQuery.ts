import { ESBoolQuery } from './ESBoolQuery';

export interface ESCompoundQuery {
  bool: ESBoolQuery;
}
