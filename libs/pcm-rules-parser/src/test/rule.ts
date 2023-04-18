import { SearchQuery } from '../common/model/SearchQueryRule';

export const inputJson: SearchQuery[] = [
  {
    rules: [
      {
        position: 0,
        rule: {
          value: 'BEGIN'
        },
        type: 'separator'
      },
      {
        position: 1,
        rule: {
          attribute: 'type',
          relationship: 'EQ',
          value: 'Book'
        },
        type: 'criteria'
      },
      {
        position: 2,
        rule: {
          value: 'AND'
        },
        type: 'logical'
      },
      {
        position: 3,
        rule: {
          attribute: 'format',
          relationship: 'EQ',
          value: 'EBK'
        },
        type: 'criteria'
      },
      {
        position: 4,
        rule: {
          value: 'END'
        },
        type: 'separator'
      }
    ],
    type: 'Book'
  }
];
