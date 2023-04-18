import { ProductRule } from './productRule';

export interface Rules {
  attributes?: string[];
  rules?: ProductRule[];
  type: string;
  rulesString?: string;
}
