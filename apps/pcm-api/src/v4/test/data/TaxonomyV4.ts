import { ResponseModel } from '@tandfgroup/pcm-entity-model-v4';

export const taxonomyTestData: ResponseModel.Taxonomy[] = [
  {
    _id: 'AG',
    assetType: 'book',
    code: 'SCAG',
    level: 1,
    name: 'Environment & Agriculture',
    parentId: null,
    status: 'active',
    type: 'subject'
  },
  {
    _id: 'AG05',
    assetType: 'book',
    code: 'SCAG05',
    level: 2,
    name: 'Agriculture & Environmental Sciences',
    parentId: 'AG',
    status: 'active',
    type: 'subject'
  },
  {
    _id: 'AG0505',
    assetType: 'book',
    code: 'SCAG0505',
    level: 3,
    name: 'Agriculture',
    parentId: 'AG05',
    status: 'active',
    type: 'subject'
  },
  {
    _id: 'AG0515',
    assetType: 'book',
    code: 'SCAG0515',
    level: 3,
    name: 'Forestry',
    parentId: 'AG05',
    status: 'active',
    type: 'subject'
  },
  {
    _id: 'HE02',
    assetType: 'book',
    code: 'SCHE02',
    level: 2,
    name: 'Adult Audiology',
    parentId: 'HE',
    status: 'inactive',
    type: 'subject'
  }
];
