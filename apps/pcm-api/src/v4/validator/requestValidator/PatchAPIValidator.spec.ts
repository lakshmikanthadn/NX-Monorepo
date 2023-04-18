import { expect } from 'chai';
import { patchAPIValidator } from './PatchAPIValidator';

const inValidTestData1 = [
  {
    garbageKey: 'replace',
    garbageValue: 'identifiers.sku'
  }
] as any;

const inValidTestData2 = [
  {
    op: 'garbage',
    path: 'identifiers.sku',
    value: '001-555-5678'
  }
] as any;

const validTestData = [
  {
    op: 'replace',
    path: 'identifiers.sku',
    value: '001-555-5678'
  }
] as any;

describe('patchAPIValidator', () => {
  it('should return errors when invalid request containing invalid key processed', (done) => {
    try {
      patchAPIValidator.validatePatchRequest(inValidTestData1);
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.message).to.equal(
        'missing either one of these fields op, path, value'
      );
      done();
    }
  });
  it('should return errors when invalid request containing invalid operation', (done) => {
    try {
      patchAPIValidator.validatePatchRequest(inValidTestData2);
    } catch (err) {
      expect(err.code).to.equal(400);
      expect(err.message).to.equal(
        'invalid patch request with operation garbage'
      );
      done();
    }
  });
  it('should return without error when valid request passed', (done) => {
    const result = patchAPIValidator.validatePatchRequest(validTestData);
    expect(result).to.equal(true);
    done();
  });
});
