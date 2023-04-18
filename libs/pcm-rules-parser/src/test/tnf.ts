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
          value: 'BEGIN'
        },
        type: 'separator'
      },
      {
        position: 2,
        rule: {
          attribute: 'type',
          relationship: 'EQ',
          value: 'Book'
        },
        type: 'criteria'
      },
      {
        position: 3,
        rule: {
          value: 'AND'
        },
        type: 'logical'
      },
      {
        position: 4,
        rule: {
          attribute: 'format',
          relationship: 'EQ',
          value: 'EBK'
        },
        type: 'criteria'
      },
      {
        position: 5,
        rule: {
          value: 'END'
        },
        type: 'separator'
      },
      {
        position: 6,
        rule: {
          value: 'OR'
        },
        type: 'logical'
      },
      {
        position: 7,
        rule: {
          attribute: 'type',
          relationship: 'EQ',
          value: 'Article'
        },
        type: 'criteria'
      },
      {
        position: 8,
        rule: {
          value: 'END'
        },
        type: 'separator'
      }
    ],
    type: 'Book'
  },
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
          value: 'BEGIN'
        },
        type: 'separator'
      },
      {
        position: 2,
        rule: {
          attribute: 'type',
          relationship: 'EQ',
          value: 'Book'
        },
        type: 'criteria'
      },
      {
        position: 3,
        rule: {
          value: 'AND'
        },
        type: 'logical'
      },
      {
        position: 4,
        rule: {
          attribute: 'format',
          relationship: 'EQ',
          value: 'EBK'
        },
        type: 'criteria'
      },
      {
        position: 5,
        rule: {
          value: 'END'
        },
        type: 'separator'
      },
      {
        position: 6,
        rule: {
          value: 'OR'
        },
        type: 'logical'
      },
      {
        position: 7,
        rule: {
          attribute: 'type',
          relationship: 'EQ',
          value: 'Article'
        },
        type: 'criteria'
      },
      {
        position: 8,
        rule: {
          value: 'END'
        },
        type: 'separator'
      }
    ],
    type: 'Chapter'
  }
];
