import { expect } from 'chai';
import { oaUpdateAPIValidator } from './OAUpdateAPIValidator';

const invalidTestDate = {
  appName: 'invalid-app name',
  callBackurl: 'invalid url',
  requestId: null
};
const validTestData = {
  appName: 'OMS',
  callBackurl: 'http://valid_url.com/',
  requestId: 'valid-id'
};

describe('oaUpdateAPIValidator', () => {
  it('should return errors when invalid request processed', (done) => {
    const validationResponse =
      oaUpdateAPIValidator.validateOAUpdateRequest(invalidTestDate);
    expect(validationResponse).to.be.an('Array');
    expect(validationResponse.length).eqls(3);
    done();
  });
  it('should return empty array when valid request processed', (done) => {
    const validationResponse =
      oaUpdateAPIValidator.validateOAUpdateRequest(validTestData);
    expect(validationResponse).to.be.an('Array');
    expect(validationResponse.length).eqls(0);
    done();
  });
});
