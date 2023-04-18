export interface ITaxonomyFilter {
  name?: string;
  code: string;
  isCodePrefix: boolean;
  level: number;
  extendLevel: boolean;
}
export interface ITaxonomyMasterFilter {
  classificationFamily: string;
  classificationType: string;
  code: string;
  includeChildren: boolean;
  level: number;
}
export interface ITaxonomyMasterResponse {
  _id: string;
  name: string;
  code: string;
  classificationType: string;
  parentId: string;
  level: number;
}
