export interface IProductsRuleRequest {
  productType: string;
  rules: any;
  projections?: string[];
  availabilityName?: string;
  offset?: number;
  offsetCursor?: string;
  limit?: number;
  sortOrder: string;
  availability?: any;
}
