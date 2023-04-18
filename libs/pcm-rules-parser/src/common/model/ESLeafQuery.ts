import { ESCompoundQuery } from './ESCompoundQuery';

export interface ESLeafQuery {
  range?: Query;
  term?: Query;
  terms?: Query;
  terms_set?: Query;
  nested?: NestedQuery;
  match?: Query;
  prefix?: Query;
}

interface Query {
  [key: string]: any;
}

interface NestedQuery {
  path: string;
  query: ESCompoundQuery | ESLeafQuery;
}
