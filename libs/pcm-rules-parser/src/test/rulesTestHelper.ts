import { ProductRule } from '../index';

export const BEGIN: ProductRule = {
  position: 0,
  rule: {
    value: 'BEGIN'
  },
  type: 'separator'
};

export const END: ProductRule = {
  position: 0,
  rule: {
    value: 'END'
  },
  type: 'separator'
};

export const OR: ProductRule = {
  position: 0,
  rule: {
    value: 'OR'
  },
  type: 'logical'
};
export const AND: ProductRule = {
  position: 0,
  rule: {
    value: 'AND'
  },
  type: 'logical'
};
