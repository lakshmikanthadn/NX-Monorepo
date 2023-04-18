import {
  ClassificationFamilyEnum,
  ClassificationTypeEnum
} from '../../schema/classificationSchema';

export type ClassificationFamilyEnumType =
  (typeof ClassificationFamilyEnum)[number];
export type ClassificationTypeEnumType =
  (typeof ClassificationTypeEnum)[number];

export interface Classification {
  _id: number;
  name: string;
  code: string;
  status: string;
  classificationFamily: ClassificationFamilyEnumType;
  classificationType: ClassificationTypeEnumType;
  _source: string;
  network: number[];
  level: number;
  parentId?: number;
  _modifiedDate: Date;
  _createdDate: Date;
}
