import { expect } from 'chai';

import { NullRemover } from './NullRemoverUtilsV4';

describe('NullRemover', () => {
  it('cleanNullField', () => {
    const obj = {
      _id: 'some-id',
      address: [
        {
          area: 'some-area',
          pincode: null,
          street: 'some-street'
        }
      ],
      title: null
    };
    const refinedObj = {
      _id: 'some-id',
      address: [
        {
          area: 'some-area',
          street: 'some-street'
        }
      ]
    };
    const result = NullRemover.cleanNullField(obj);
    expect(result).to.deep.equal(refinedObj);
  });
});
