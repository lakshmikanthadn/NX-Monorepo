import { CriteriaRule } from './CriteriaRule';
import { LogicalRule } from './LogicalRule';
import { SeparatorRule } from './SeparatorRule';

export type RuleType = SeparatorRule | LogicalRule | CriteriaRule;

export interface ProductRule {
  type: string;
  rule: RuleType;
  position?: number;
}

export interface GroupRule {
  type: string;
  name: string;
  rules: ProductRule[];
}

export interface SearchQuery {
  attributes?: string[];
  rules: ProductRule[];
  type: string;
  rulesString?: string;
}

export interface GroupedSearchQuery {
  attributes?: string[];
  rules: Array<ProductRule | GroupRule>;
  type: string;
  rulesString?: string;
}
