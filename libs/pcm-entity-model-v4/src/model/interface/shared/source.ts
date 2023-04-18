export type ProductSource =
  | 'CMS'
  | 'HUB'
  | 'MBS'
  | 'WEBCMS'
  | 'SALESFORCE'
  | 'DARTS';

export interface Source {
  type: string;
  source: ProductSource;
}
