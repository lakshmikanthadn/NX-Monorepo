import { RulePart } from './rulePart';

export interface ProductRule {
  type: string;
  rule?: RulePart;
  position?: number;
  name?: string;
  rules?: ProductRule[];
}
