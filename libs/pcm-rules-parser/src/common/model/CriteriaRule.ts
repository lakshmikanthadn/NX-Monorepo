export type RelationshipTypes =
  | 'EQ'
  | 'NE'
  | 'GT'
  | 'GE'
  | 'LT'
  | 'LE'
  | 'IN'
  | 'NI'
  | 'ALL'
  | 'LIKE'
  | 'PREFIX';

export interface CriteriaRule {
  attribute: string;
  relationship: RelationshipTypes;
  values?: any[];
  value?: any;
}
