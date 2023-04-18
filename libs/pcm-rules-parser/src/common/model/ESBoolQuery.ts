import { ESCompoundQuery } from './ESCompoundQuery';
import { ESLeafQuery } from './ESLeafQuery';

export interface ESBoolQuery {
  filter?: Array<ESLeafQuery | ESCompoundQuery>;
  must?: Array<ESLeafQuery | ESCompoundQuery>;
  must_not?: Array<ESLeafQuery | ESCompoundQuery>;
  /**
   * TODO: Find why? For some reaons Typescript complains using should with Array<ESLeafQuery | ESCompoundQuery>
   * should?: Array<ESLeafQuery | ESCompoundQuery>
   * So marking it as any
   */
  should?: any;
}
