import { expect } from 'chai';
import * as sinon from 'sinon';

import { Config } from '../../config/config';
import { entitlementUtils } from '../../utils/EntitlementUtil';
import { assetV4Service } from '../assets/AssetV4.Service';
import { associatedMediaV4Service } from '../associatedMedia/AssociatedMediaV4.Service';
import { creativeWorkV4Service } from '../creativeWork/CreativeWorkV4.Service';
import { partsV4Service } from '../parts/PartsV4.Service';
import { productV4Service } from '../products/ProductV4.Service';
import { S3UtilsV4 } from '../utils/S3UtilsV4';
import { contentV4Service } from './ContentV4.Service';

describe('ContentV4Service', () => {
  it('should have all the required methods', () => {
    expect(contentV4Service).to.respondTo('createAssociatedMedia');
  });
  let assetV4ServiceMock;
  let associatedMediaV4ServiceMock;
  let productV4ServiceMock;
  let partsV4ServiceMock;
  let bucketName;
  let region;
  let S3UtilsV4Mock;
  let entitlementUtilsMock;
  let token;
  let creativeWorkV4ServiceMock;
  beforeEach(() => {
    token = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpcCI6IjM4LjEyNy4xOTguMiIsImNvbnRlbnRfY2Vuc29yaW5nX2VuYWJsZWQiOmZhbHNlLCJzY29wZSI6WyJ1bmxpY2Vuc2VkX3NlYXJjaCIsInByb2R1Y3RfYWNjZXNzIl0sImNvdW50cnlfY29kZSI6IlVTIiwiciI6WyJBRE4iLCJBRE4iXSwidGVycml0b3J5X3R5cGUiOiJjb3VudHJ5IiwidXNlciI6eyJfaWQiOiI1YWFhNmZmZGE0OWEyZTAwMWM4NTY0NDgiLCJ1c2VybmFtZSI6ImphY2tzb24ubWVuZXplc0BpbmZvcm1hLmNvbSIsImVtYWlsIjoiamFja3Nvbi5tZW5lemVzQGluZm9ybWEuY29tIiwiZGlzcGxheU5hbWUiOiJKYWNrc29uIE1lbmV6ZXMiLCJvcmdhbml6YXRpb25JZCI6Ijc1NzAiLCJoYXNBY2NlcHRlZFRlcm1zIjp0cnVlLCJ1c2VyVHlwZSI6InVzZXIiLCJvcmdhbml6YXRpb25OYW1lIjoiMTcwODIxMDIgVGVzdCBJbnN0aXR1dGUiLCJwYXJ0eUlkIjozNTc5LCJtRkFBdXRoZW50aWNhdGVkIjpmYWxzZX0sImlzcyI6Imh0dHBzOi8vYWNjb3VudHMtZGV2LnRheWxvcmZyYW5jaXMuY29tL2lkZW50aXR5LyIsImV4cCI6MTU2OTQyNDc5NywiaWF0IjoxNTY5NDIxMTk3LCJhdWQiOiIzOGEwZjY0ZmEwY2I1MWFlMDBmNjllZmUyNTRmYTEwY2U3M2ZmNmRhZWQxNDA2OTcyZTZkNzNkNWNmYzM1MzQ5Iiwic3ViIjoiNWFhYTZmZmRhNDlhMmUwMDFjODU2NDQ4In0.VhfDguj1mAGLljdxNNrAtS0cNE0PqwKjCEoUmtMzOIlZwVCWJTcw0JhKOC_3wSjz1Bk-X5cKLk0myd2PO7Isn6f_FXLMtrXcTfBSYURy5W4xrivx0yg-82g2ydJWWYZijR8sKY2Qt0nDMNIaqm8fVVWAfGSDKrsGCcyzlBnWTufmt_6ZY6W-EcyxC4gYsRCUAq8T8DZw8SwDGyk5bH9Y7j8mtfz4yKrHx3iz6YNoK2ZWzgjY7O5tWfnIft9h-vMVB2es1KD-0qrVInFbRMqOTX9CzZ7jc6q1xMoCAIvzBc_mZmLqfWDwnE0-N-cG8gISN9onMssEYm9Kc-C_1mpAVA`;
    bucketName = Config.getPropertyValue('contentS3Bucket');
    region = Config.getPropertyValue('secretRegion');
    assetV4ServiceMock = sinon.mock(assetV4Service);
    associatedMediaV4ServiceMock = sinon.mock(associatedMediaV4Service);
    productV4ServiceMock = sinon.mock(productV4Service);
    partsV4ServiceMock = sinon.mock(partsV4Service);
    S3UtilsV4Mock = sinon.mock(S3UtilsV4);
    entitlementUtilsMock = sinon.mock(entitlementUtils);
    creativeWorkV4ServiceMock = sinon.mock(creativeWorkV4Service);
  });
  describe('createAssociatedMedia', () => {
    it('should return a signed location when content is created properly', (done) => {
      const content = {
        fileName: 'content3.mp4',
        parentId: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'video'
      };
      const fileName = 'content3.mp4';
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'creativeWork'
      };
      const absolutePath = `creativework/${content.parentId}`;
      const location = `https://${bucketName}.s3.${region}.amazonaws.com/${absolutePath}/${fileName}`;
      const id = 'some-id';
      // Set expectaion of/from Asset Service.
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(content.parentId, ['type'])
        .resolves(asset);
      // Set expectaion of/from Associated media Service.
      associatedMediaV4ServiceMock
        .expects('getAsstMediaByParentIdAndFilename')
        .once()
        .withArgs(content.parentId, location)
        .resolves(null);
      productV4ServiceMock.expects('getNewId').once().returns(id);
      associatedMediaV4ServiceMock
        .expects('createAssociatedMedia')
        .once()
        .resolves({ _id: 'some-uuid' });
      S3UtilsV4Mock.expects('getPresignedUrlToUpload')
        .once()
        .withArgs(absolutePath, fileName)
        .resolves('https://some-signed-url');
      creativeWorkV4ServiceMock
        .expects('updateCreativeWorkSources')
        .once()
        .withArgs(content.parentId)
        .resolves({ _id: 'some-uuid' });
      assetV4ServiceMock
        .expects('updateAssetSources')
        .once()
        .withArgs(content.parentId)
        .resolves({
          ...asset,
          _sources: [{ source: 'WEBCMS', type: 'content' }]
        });
      contentV4Service
        .createAssociatedMedia(content)
        .then((savedContent) => {
          expect(savedContent).to.have.property(
            'location',
            'https://some-signed-url'
          );
          associatedMediaV4ServiceMock.verify();
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          creativeWorkV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          associatedMediaV4ServiceMock.restore();
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
          creativeWorkV4ServiceMock.restore();
        });
    });
    it('should throw error when asset is not found', (done) => {
      const content = {
        fileName: 'content3.mp4',
        parentId: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'video'
      };
      // Set expectaion of/from Asset Service.
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(content.parentId, ['type'])
        .returns(null);
      // Set expectaion of/from Associated media Service.
      associatedMediaV4ServiceMock
        .expects('getAsstMediaByParentIdAndFilename')
        .never();
      productV4ServiceMock.expects('getNewId').never();
      associatedMediaV4ServiceMock.expects('createAssociatedMedia').never();
      S3UtilsV4Mock.expects('getPresignedUrlToUpload').never();
      contentV4Service
        .createAssociatedMedia(content)
        .then(() => {
          done(
            new Error('Expecting Product (asset) not found. but got success')
          );
        })
        .catch((err) => {
          expect(err.message).to.equal('Product (asset) not found.');
          expect(err.code).to.equal(404);
          associatedMediaV4ServiceMock.verify();
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .finally(() => {
          associatedMediaV4ServiceMock.restore();
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it('should throw error when asset type is not creativeWork', (done) => {
      const content = {
        fileName: 'content3.mp4',
        parentId: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'video'
      };
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'book'
      };
      // Set expectaion of/from Asset Service.
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(content.parentId, ['type'])
        .returns(asset);
      // Set expectaion of/from Associated media Service.
      associatedMediaV4ServiceMock
        .expects('getAsstMediaByParentIdAndFilename')
        .never();
      productV4ServiceMock.expects('getNewId').never();
      associatedMediaV4ServiceMock.expects('createAssociatedMedia').never();
      S3UtilsV4Mock.expects('getPresignedUrlToUpload').never();
      contentV4Service
        .createAssociatedMedia(content)
        .then(() => {
          done(
            new Error('Expecting Product (asset) not found. but got success')
          );
        })
        .catch((err) => {
          expect(err.message).to.equal(
            'this api supports asset type as creativeWork only'
          );
          expect(err.code).to.equal(400);
          associatedMediaV4ServiceMock.verify();
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .finally(() => {
          associatedMediaV4ServiceMock.restore();
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it('should throw error when associatedMedia already exists with same location', (done) => {
      const content = {
        fileName: 'content3.mp4',
        parentId: '6c9f9801-3519-425d-be31-8829cae4bac4',
        parentType: 'creativeWork',
        type: 'video'
      };
      const fileName = 'content3.mp4';
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'creativeWork'
      };
      const associateMedia = {
        _id: '6c9f9801-3519-425d-be31-8829abcd1111',
        fileName: 'content3.mp4',
        parentId: '6c9f9801-3519-425d-be31-8829cae4bac4',
        parentType: 'creativeWork',
        size: null,
        type: 'video'
      };
      const absolutePath = `creativework/${content.parentId}`;
      const location = `https://${bucketName}.s3.${region}.amazonaws.com/${absolutePath}/${fileName}`;
      // Set expectaion of/from Asset Service.
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(content.parentId, ['type'])
        .resolves(asset);
      // Set expectaion of/from Associated media Service.
      associatedMediaV4ServiceMock
        .expects('getAsstMediaByParentIdAndFilename')
        .once()
        .withArgs(content.parentId, location)
        .resolves(associateMedia);
      productV4ServiceMock.expects('getNewId').never();
      associatedMediaV4ServiceMock.expects('createAssociatedMedia').never();
      S3UtilsV4Mock.expects('getPresignedUrlToUpload').never();
      contentV4Service
        .createAssociatedMedia(content)
        .then(() => {
          done(
            new Error('Expecting Product (asset) not found. but got success')
          );
        })
        .catch((err) => {
          expect(err.message).to.equal(
            'A content already exists with this fileName & parentId.'
          );
          expect(err.code).to.equal(400);
          associatedMediaV4ServiceMock.verify();
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .finally(() => {
          associatedMediaV4ServiceMock.restore();
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it('should return same location when type is database', (done) => {
      const content = {
        fileName: 'content3.db',
        parentId: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'database'
      };
      const fileName = content.fileName;
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'creativeWork'
      };
      const id = 'some-id';
      // Set expectaion of/from Asset Service.
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(content.parentId, ['type'])
        .resolves(asset);
      // Set expectaion of/from Associated media Service.
      associatedMediaV4ServiceMock
        .expects('getAsstMediaByParentIdAndFilename')
        .once()
        .withArgs(content.parentId, fileName)
        .resolves(null);
      productV4ServiceMock.expects('getNewId').once().returns(id);
      associatedMediaV4ServiceMock
        .expects('createAssociatedMedia')
        .once()
        .resolves({ _id: 'some-uuid' });
      S3UtilsV4Mock.expects('getPresignedUrlToUpload').never();
      creativeWorkV4ServiceMock
        .expects('updateCreativeWorkSources')
        .once()
        .withArgs(content.parentId);
      assetV4ServiceMock
        .expects('updateAssetSources')
        .once()
        .withArgs(content.parentId);
      contentV4Service
        .createAssociatedMedia(content)
        .then((savedContent) => {
          expect(savedContent).to.have.property('location', fileName);
          associatedMediaV4ServiceMock.verify();
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          creativeWorkV4ServiceMock.verify();
          assetV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          associatedMediaV4ServiceMock.restore();
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
          creativeWorkV4ServiceMock.restore();
          assetV4ServiceMock.restore();
        });
    });
    it('should return same location when type is hyperlink', (done) => {
      const content = {
        fileName: 'http://some-content-url.pdf',
        parentId: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'hyperlink'
      };
      const fileName = content.fileName;
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'creativeWork'
      };
      const id = 'some-id';
      // Set expectaion of/from Asset Service.
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(content.parentId, ['type'])
        .resolves(asset);
      // Set expectaion of/from Associated media Service.
      associatedMediaV4ServiceMock
        .expects('getAsstMediaByParentIdAndFilename')
        .once()
        .withArgs(content.parentId, fileName)
        .resolves(null);
      productV4ServiceMock.expects('getNewId').once().returns(id);
      associatedMediaV4ServiceMock
        .expects('createAssociatedMedia')
        .once()
        .resolves({ _id: 'some-uuid' });
      S3UtilsV4Mock.expects('getPresignedUrlToUpload').never();
      creativeWorkV4ServiceMock
        .expects('updateCreativeWorkSources')
        .once()
        .withArgs(content.parentId);
      assetV4ServiceMock
        .expects('updateAssetSources')
        .once()
        .withArgs(content.parentId);
      contentV4Service
        .createAssociatedMedia(content)
        .then((savedContent) => {
          expect(savedContent).to.have.property('location', fileName);
          associatedMediaV4ServiceMock.verify();
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          creativeWorkV4ServiceMock.verify();
          assetV4ServiceMock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          associatedMediaV4ServiceMock.restore();
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
          creativeWorkV4ServiceMock.restore();
          assetV4ServiceMock.restore();
        });
    });
    it('should throw error when createAssociatedMedia rejects', (done) => {
      const content = {
        fileName: 'content3.mp4',
        parentId: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'video'
      };
      const fileName = 'content3.mp4';
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'creativeWork'
      };
      const absolutePath = `creativework/${content.parentId}`;
      const location = `https://${bucketName}.s3.${region}.amazonaws.com/${absolutePath}/${fileName}`;
      const id = 'some-id';
      // Set expectaion of/from Asset Service.
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(content.parentId, ['type'])
        .resolves(asset);
      // Set expectaion of/from Associated media Service.
      associatedMediaV4ServiceMock
        .expects('getAsstMediaByParentIdAndFilename')
        .once()
        .withArgs(content.parentId, location)
        .resolves(null);
      productV4ServiceMock.expects('getNewId').once().returns(id);
      associatedMediaV4ServiceMock
        .expects('createAssociatedMedia')
        .once()
        .resolves(null);
      S3UtilsV4Mock.expects('getPresignedUrlToUpload').never();
      contentV4Service
        .createAssociatedMedia(content)
        .then(() => {
          done(
            new Error('Expecting Product (asset) not found. but got success')
          );
        })
        .catch((err) => {
          expect(err.message).to.equal('Error while creating content');
          expect(err.code).to.equal(400);
          associatedMediaV4ServiceMock.verify();
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .finally(() => {
          associatedMediaV4ServiceMock.restore();
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it('should throw error when getPresignedUrlToUpload rejects', (done) => {
      const content = {
        fileName: 'content3.mp4',
        parentId: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'video'
      };
      const fileName = 'content3.mp4';
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'creativeWork'
      };
      const absolutePath = `creativework/${content.parentId}`;
      const location = `https://${bucketName}.s3.${region}.amazonaws.com/${absolutePath}/${fileName}`;
      const id = 'some-id';
      // Set expectaion of/from Asset Service.
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(content.parentId, ['type'])
        .resolves(asset);
      // Set expectaion of/from Associated media Service.
      associatedMediaV4ServiceMock
        .expects('getAsstMediaByParentIdAndFilename')
        .once()
        .withArgs(content.parentId, location)
        .resolves(null);
      productV4ServiceMock.expects('getNewId').once().returns(id);
      associatedMediaV4ServiceMock
        .expects('createAssociatedMedia')
        .once()
        .resolves({ _id: 'some-uuid' });
      S3UtilsV4Mock.expects('getPresignedUrlToUpload')
        .once()
        .withArgs(absolutePath, fileName)
        .resolves(null);
      contentV4Service
        .createAssociatedMedia(content)
        .then(() => {
          done(
            new Error('Expecting Product (asset) not found. but got success')
          );
        })
        .catch((err) => {
          expect(err.message).to.equal('Error while creating signedUrl');
          expect(err.code).to.equal(400);
          associatedMediaV4ServiceMock.verify();
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .finally(() => {
          associatedMediaV4ServiceMock.restore();
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
  });
  describe('getContentByIdAndType', () => {
    const ip = '0.0.0.0';
    const isBot = false;
    const bucket = 's3-euw1-ap-pe-df-pch-content-store-d';
    const keyPrefix = 'collection/some-collection-id';
    it(`should return signed content when id is valid and type is googlepdf
         i.e beforePaywall`, (done) => {
      const id = '6c9f9801-3519-425d-be31-8829cae4bac4';
      const toRender = true;
      const filenamePrefix = 'someName';
      const parentId = undefined;
      const asstMediatype = 'googlepdf';
      const location =
        'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/collection/some-collection-id/google.pdf';
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'book'
      };
      const associatedMedias = [
        {
          _id: 'some-id-1',
          location: location,
          size: 1234,
          type: 'googlepdf'
        },
        {
          _id: 'some-id-2',
          location: 'some-location-2',
          size: 2234,
          type: 'webpdf'
        }
      ];
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves(asset);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, true)
        .resolves(associatedMedias);
      productV4ServiceMock.expects('isOpenAccess').never();
      entitlementUtilsMock.expects('isEntitled').never();
      S3UtilsV4Mock.expects('headObjects')
        .once()
        .withArgs(bucket, keyPrefix + '/google.pdf')
        .resolves(true);
      S3UtilsV4Mock.expects('getPresignedUrlToRead')
        .once()
        .withArgs(location, toRender, true)
        .resolves('https://some-signed-url');
      const contentType = asstMediatype;
      contentV4Service
        .getContentByIdAndType(id, parentId, {
          cf: false,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .then((retriveContent) => {
          expect(retriveContent).to.be.an('array');
          expect(retriveContent.length).to.equal(1);
          retriveContent.forEach((content) => {
            expect(content).to.have.property(
              'location',
              'https://some-signed-url'
            );
            expect(content).to.have.property('type', 'googlepdf');
            expect(content).to.have.property('accessType', null);
            expect(content).to.have.property('size', 1234);
            expect(content).to.have.property('_id', 'some-id-1');
          });
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          entitlementUtilsMock.verify();
          associatedMediaV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          entitlementUtilsMock.restore();
          associatedMediaV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it(`should return unsigned content when id is valid and type is coverimage
         i.e beforePaywall`, (done) => {
      const id = '6c9f9801-3519-425d-be31-8829cae4bac4';
      const toRender = true;
      const filenamePrefix = 'someName';
      const parentId = undefined;
      const asstMediatype = 'coverimage';
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'book'
      };
      const associatedMedias = [
        {
          _id: 'some-id-1',
          location: 'some-location-1',
          size: 1234,
          type: 'coverimage'
        },
        {
          _id: 'some-id-2',
          location: 'some-location-2',
          size: 2234,
          type: 'webpdf'
        }
      ];
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves(asset);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, true)
        .resolves(associatedMedias);
      productV4ServiceMock.expects('isOpenAccess').never();
      entitlementUtilsMock.expects('isEntitled').never();
      S3UtilsV4Mock.expects('getPresignedUrlToRead').never();
      const contentType = asstMediatype;
      contentV4Service
        .getContentByIdAndType(id, parentId, {
          cf: false,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .then((retriveContent) => {
          expect(retriveContent).to.be.an('array');
          expect(retriveContent.length).to.equal(1);
          retriveContent.forEach((content) => {
            expect(content).to.have.property('location', 'some-location-1');
            expect(content).to.have.property('type', 'coverimage');
            expect(content).to.have.property('accessType', null);
            expect(content).to.have.property('size', 1234);
            expect(content).to.have.property('_id', 'some-id-1');
          });
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          entitlementUtilsMock.verify();
          associatedMediaV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          entitlementUtilsMock.restore();
          associatedMediaV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it(`should return signed content when id is valid and type is webpdf but skipEntitlementCheck is true
         i.e afterPaywall`, (done) => {
      const id = '6c9f9801-3519-425d-be31-8829cae4bac4';
      const toRender = true;
      const filenamePrefix = 'someName';
      const parentId = undefined;
      const asstMediatype = 'webpdf';
      const location =
        'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/collection/some-collection-id/web.pdf';
      const skipEntitlementCheck = true;
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'book'
      };
      const associatedMedias = [
        {
          _id: 'some-id-1',
          location: 'some-location-1',
          size: 1234,
          type: 'coverimage'
        },
        {
          _id: 'some-id-2',
          location: location,
          size: 2234,
          type: 'webpdf'
        }
      ];
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves(asset);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, true)
        .resolves(associatedMedias);
      productV4ServiceMock.expects('isOpenAccess').never();
      entitlementUtilsMock.expects('isEntitled').never();
      S3UtilsV4Mock.expects('headObjects')
        .once()
        .withArgs(bucket, keyPrefix + '/web.pdf')
        .resolves(true);
      S3UtilsV4Mock.expects('getPresignedUrlToRead')
        .once()
        .withArgs(location, toRender, true)
        .resolves('https://some-signed-url');
      const contentType = asstMediatype;
      contentV4Service
        .getContentByIdAndType(id, parentId, {
          cf: false,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          skipEntitlementCheck,
          toRender,
          token
        })
        .then((retriveContent) => {
          expect(retriveContent).to.be.an('array');
          expect(retriveContent.length).to.equal(1);
          retriveContent.forEach((content) => {
            expect(content).to.have.property(
              'location',
              'https://some-signed-url'
            );
            expect(content).to.have.property('type', 'webpdf');
            expect(content).to.have.property('accessType', null);
            expect(content).to.have.property('size', 2234);
            expect(content).to.have.property('_id', 'some-id-2');
          });
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          entitlementUtilsMock.verify();
          associatedMediaV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          entitlementUtilsMock.restore();
          associatedMediaV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it(`should return signed content when id is valid and type is undefined
            but skipEntitlementCheck is true i.e afterPaywall`, (done) => {
      const id = '6c9f9801-3519-425d-be31-8829cae4bac4';
      const toRender = true;
      const filenamePrefix = 'someName';
      const parentId = undefined;
      const asstMediatype = undefined;
      const location =
        'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/collection/some-collection-id/web.pdf';
      const skipEntitlementCheck = true;
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'book'
      };
      const associatedMedias = [
        {
          _id: 'some-id-1',
          location: 'some-location-1',
          size: 1234,
          type: 'coverimage'
        },
        {
          _id: 'some-id-2',
          location: location,
          size: 2234,
          type: 'webpdf'
        }
      ];
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves(asset);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, true)
        .resolves(associatedMedias);
      productV4ServiceMock.expects('isOpenAccess').never();
      entitlementUtilsMock.expects('isEntitled').never();
      S3UtilsV4Mock.expects('headObjects')
        .once()
        .withArgs(bucket, keyPrefix + '/web.pdf')
        .resolves(true);
      S3UtilsV4Mock.expects('getPresignedUrlToRead')
        .once()
        .withArgs(location, toRender, true)
        .resolves('https://some-signed-url');
      const contentType = asstMediatype;
      contentV4Service
        .getContentByIdAndType(id, parentId, {
          cf: false,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          skipEntitlementCheck,
          toRender,
          token
        })
        .then((retriveContent) => {
          console.log('retriveContent is', retriveContent);
          expect(retriveContent).to.be.an('array');
          expect(retriveContent.length).to.equal(2);
          expect(retriveContent[0]).to.have.property(
            'location',
            'some-location-1'
          );
          expect(retriveContent[0]).to.have.property('type', 'coverimage');
          expect(retriveContent[0]).to.have.property('accessType', null);
          expect(retriveContent[1]).to.have.property(
            'location',
            'https://some-signed-url'
          );
          expect(retriveContent[1]).to.have.property('type', 'webpdf');
          expect(retriveContent[1]).to.have.property('accessType', null);
          expect(retriveContent[1]).to.have.property('size', 2234);
          expect(retriveContent[1]).to.have.property('_id', 'some-id-2');
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          entitlementUtilsMock.verify();
          associatedMediaV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          entitlementUtilsMock.restore();
          associatedMediaV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });

    it(`should return signed content when id is valid and type is webpdf and has licensed
        i.e afterPaywall`, (done) => {
      const id = '6c9f9801-3519-425d-be31-8829cae4bac4';
      const toRender = true;
      const filenamePrefix = 'someName';
      const parentId = undefined;
      const asstMediatype = 'webpdf';
      const location =
        'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/collection/some-collection-id/web.pdf';
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'book'
      };
      const associatedMedias = [
        {
          _id: 'some-id-1',
          location: 'some-location-1',
          size: 1234,
          type: 'googlepdf'
        },
        {
          _id: 'some-id-2',
          location: location,
          size: 2234,
          type: 'webpdf'
        }
      ];
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves(asset);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, true)
        .resolves(associatedMedias);
      productV4ServiceMock
        .expects('isOpenAccess')
        .once()
        .withArgs(asset.type, asset._id)
        .resolves(false);
      entitlementUtilsMock.expects('isEntitled').resolves(true);
      S3UtilsV4Mock.expects('headObjects')
        .once()
        .withArgs(bucket, keyPrefix + '/web.pdf')
        .resolves(true);
      S3UtilsV4Mock.expects('getPresignedUrlToRead')
        .once()
        .withArgs(location, toRender, true)
        .resolves('https://some-signed-url');
      const contentType = asstMediatype;
      contentV4Service
        .getContentByIdAndType(id, parentId, {
          cf: false,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .then((retriveContent) => {
          expect(retriveContent).to.be.an('array');
          expect(retriveContent.length).to.equal(1);
          retriveContent.forEach((content) => {
            expect(content).to.have.property(
              'location',
              'https://some-signed-url'
            );
            expect(content).to.have.property('type', 'webpdf');
            expect(content).to.have.property('accessType', 'licensed');
            expect(content).to.have.property('size', 2234);
            expect(content).to.have.property('_id', 'some-id-2');
          });
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          entitlementUtilsMock.verify();
          associatedMediaV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          entitlementUtilsMock.restore();
          associatedMediaV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it(`should return signed content when id is valid and type is webpdf and has licensed
        i.e afterPaywall`, (done) => {
      const id = '6c9f9801-3519-425d-be31-8829cae4bac4';
      const toRender = true;
      const filenamePrefix = 'someName';
      const parentId = undefined;
      const asstMediatype = 'webpdf';
      const location =
        'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/collection/some-collection-id/web.pdf';
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'scholarlyArticle'
      };
      const associatedMedias = [
        {
          _id: 'some-id-1',
          location: 'some-location-1',
          size: 1234,
          type: 'googlepdf'
        },
        {
          _id: 'some-id-2',
          location: location,
          size: 2234,
          type: 'webpdf'
        }
      ];
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves(asset);
      productV4ServiceMock
        .expects('getProductById')
        .once()
        .withArgs(id, 'medium')
        .resolves({
          product: {
            scholarlyArticle: {
              currentVersion: 'FINAL'
            }
          }
        });
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, true, 'FINAL')
        .resolves(associatedMedias);
      productV4ServiceMock
        .expects('isOpenAccess')
        .once()
        .withArgs(asset.type, asset._id)
        .resolves(false);
      entitlementUtilsMock.expects('isEntitled').resolves(true);
      S3UtilsV4Mock.expects('headObjects')
        .once()
        .withArgs(bucket, keyPrefix + '/web.pdf')
        .resolves(true);
      S3UtilsV4Mock.expects('getPresignedUrlToRead')
        .once()
        .withArgs(location, toRender, true)
        .resolves('https://some-signed-url');
      const contentType = asstMediatype;
      contentV4Service
        .getContentByIdAndType(id, parentId, {
          cf: false,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .then((retriveContent) => {
          expect(retriveContent).to.be.an('array');
          expect(retriveContent.length).to.equal(1);
          retriveContent.forEach((content) => {
            expect(content).to.have.property(
              'location',
              'https://some-signed-url'
            );
            expect(content).to.have.property('type', 'webpdf');
            expect(content).to.have.property('accessType', 'licensed');
            expect(content).to.have.property('size', 2234);
            expect(content).to.have.property('_id', 'some-id-2');
          });
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          entitlementUtilsMock.verify();
          associatedMediaV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          entitlementUtilsMock.restore();
          associatedMediaV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it(`should return dbits xml when asstMediatype is book xml`, (done) => {
      const id = '6c9f9801-3519-425d-be31-8829cae4bac4';
      const toRender = true;
      const filenamePrefix = 'someName';
      const parentId = undefined;
      const asstMediatype = 'bookxml';
      const location =
        'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/collection/some-collection-id/dbits.xml';
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'book'
      };
      const associatedMedias = [
        {
          _id: 'some-id-1',
          location: 'googlepdf-location',
          size: 1234,
          type: 'googlepdf'
        },
        {
          _id: 'some-id-2',
          location: location,
          size: 2234,
          type: 'dbitsxml'
        }
      ];
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves(asset);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, true)
        .resolves(associatedMedias);
      productV4ServiceMock
        .expects('isOpenAccess')
        .once()
        .withArgs(asset.type, asset._id)
        .resolves(true);
      entitlementUtilsMock.expects('isEntitled').resolves(false);
      S3UtilsV4Mock.expects('headObjects')
        .once()
        .withArgs(bucket, keyPrefix + '/dbits.xml')
        .resolves(true);
      S3UtilsV4Mock.expects('getPresignedUrlToRead')
        .once()
        .withArgs(location, toRender, false, filenamePrefix, 'dbitsxml', false)
        .resolves('https://dbits-signed-url');
      const contentType = asstMediatype;
      contentV4Service
        .getContentByIdAndType(id, parentId, {
          cf: false,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .then((retriveContent) => {
          expect(retriveContent).to.be.an('array');
          expect(retriveContent.length).to.equal(1);
          retriveContent.forEach((content) => {
            expect(content).to.have.property(
              'location',
              'https://dbits-signed-url'
            );
            expect(content).to.have.property('type', 'dbitsxml');
            expect(content).to.have.property('size', 2234);
            expect(content).to.have.property('_id', 'some-id-2');
          });
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          entitlementUtilsMock.verify();
          associatedMediaV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          entitlementUtilsMock.restore();
          associatedMediaV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it(`should return signed content when id is valid and type is webpdf and has openAccess
            i.e afterPaywall`, (done) => {
      const id = '6c9f9801-3519-425d-be31-8829cae4bac4';
      const toRender = true;
      const filenamePrefix = 'someName';
      const parentId = undefined;
      const asstMediatype = 'webpdf';
      const location =
        'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/collection/some-collection-id/web.pdf';
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'book'
      };
      const associatedMedias = [
        {
          _id: 'some-id-1',
          location: 'some-location-1',
          size: 1234,
          type: 'googlepdf'
        },
        {
          _id: 'some-id-2',
          location: location,
          size: 2234,
          type: 'webpdf'
        }
      ];
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves(asset);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, true)
        .resolves(associatedMedias);
      productV4ServiceMock
        .expects('isOpenAccess')
        .once()
        .withArgs(asset.type, asset._id)
        .resolves(true);
      entitlementUtilsMock.expects('isEntitled').resolves(false);
      S3UtilsV4Mock.expects('headObjects')
        .once()
        .withArgs(bucket, keyPrefix + '/web.pdf')
        .resolves(true);
      S3UtilsV4Mock.expects('getPresignedUrlToRead')
        .once()
        .withArgs(location, toRender, true)
        .resolves('https://some-signed-url');
      const contentType = asstMediatype;
      contentV4Service
        .getContentByIdAndType(id, parentId, {
          cf: false,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .then((retriveContent) => {
          expect(retriveContent).to.be.an('array');
          expect(retriveContent.length).to.equal(1);
          retriveContent.forEach((content) => {
            expect(content).to.have.property(
              'location',
              'https://some-signed-url'
            );
            expect(content).to.have.property('type', 'webpdf');
            expect(content).to.have.property('accessType', 'openAccess');
            expect(content).to.have.property('size', 2234);
            expect(content).to.have.property('_id', 'some-id-2');
          });
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          entitlementUtilsMock.verify();
          associatedMediaV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          entitlementUtilsMock.restore();
          associatedMediaV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it(`should return unsigned content when id is valid and type is database and has openAccess
        i.e afterPaywall`, (done) => {
      const id = '6c9f9801-3519-425d-be31-8829cae4bac4';
      const toRender = true;
      const filenamePrefix = 'someName';
      const parentId = undefined;
      const asstMediatype = 'database';
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'book'
      };
      const associatedMedias = [
        {
          _id: 'some-id-1',
          location: 'some-location-1',
          size: 1234,
          type: 'googlepdf'
        },
        {
          _id: 'some-id-2',
          location: 'some-location-2',
          size: 2234,
          type: 'database'
        }
      ];
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves(asset);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, true)
        .resolves(associatedMedias);
      productV4ServiceMock
        .expects('isOpenAccess')
        .once()
        .withArgs(asset.type, asset._id)
        .resolves(true);
      entitlementUtilsMock.expects('isEntitled').resolves(false);
      S3UtilsV4Mock.expects('getPresignedUrlToRead').never();
      const contentType = asstMediatype;
      contentV4Service
        .getContentByIdAndType(id, parentId, {
          cf: false,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .then((retriveContent) => {
          expect(retriveContent).to.be.an('array');
          expect(retriveContent.length).to.equal(1);
          retriveContent.forEach((content) => {
            expect(content).to.have.property('location', 'some-location-2');
            expect(content).to.have.property('type', 'database');
            expect(content).to.have.property('accessType', 'openAccess');
            expect(content).to.have.property('size', 2234);
            expect(content).to.have.property('_id', 'some-id-2');
          });
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          entitlementUtilsMock.verify();
          associatedMediaV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          entitlementUtilsMock.restore();
          associatedMediaV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it(`should throw error when asset is null`, (done) => {
      const id = '6c9f9801-3519-425d-be31-8829cae4bac4';
      const toRender = true;
      const filenamePrefix = 'someName';
      const parentId = undefined;
      const asstMediatype = 'googlepdf';
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves(null);
      productV4ServiceMock.expects('isOpenAccess').never();
      entitlementUtilsMock.expects('isEntitled').never();
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .never();
      S3UtilsV4Mock.expects('headObjects').never();
      S3UtilsV4Mock.expects('getPresignedUrlToRead').never();
      const contentType = asstMediatype;
      contentV4Service
        .getContentByIdAndType(id, parentId, {
          cf: false,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .then(() => {
          done(new Error('Expecting Content not found. but got success'));
        })
        .catch((err) => {
          expect(err.message).to.equal('Product Asset not found');
          expect(err.code).to.equal(404);
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          entitlementUtilsMock.verify();
          associatedMediaV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          entitlementUtilsMock.restore();
          associatedMediaV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it(`should return empty array when associatedMedias is null`, (done) => {
      const id = '6c9f9801-3519-425d-be31-8829cae4bac4';
      const toRender = true;
      const filenamePrefix = 'someName';
      const parentId = undefined;
      const asstMediatype = 'googlepdf';
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'book'
      };
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves(asset);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, true)
        .resolves(null);
      productV4ServiceMock.expects('isOpenAccess').never();
      entitlementUtilsMock.expects('isEntitled').never();
      S3UtilsV4Mock.expects('headObjects').never();
      S3UtilsV4Mock.expects('getPresignedUrlToRead').never();
      const contentType = asstMediatype;
      contentV4Service
        .getContentByIdAndType(id, parentId, {
          cf: false,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .then((retriveContent) => {
          expect(retriveContent).to.be.an('array');
          expect(retriveContent.length).to.equal(0);
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          entitlementUtilsMock.verify();
          associatedMediaV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          entitlementUtilsMock.restore();
          associatedMediaV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it(`should return empty array when associatedMedias is empty array []`, (done) => {
      const id = '6c9f9801-3519-425d-be31-8829cae4bac4';
      const toRender = true;
      const filenamePrefix = 'someName';
      const parentId = undefined;
      const asstMediatype = 'googlepdf';
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'book'
      };
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves(asset);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, true)
        .resolves([]);
      productV4ServiceMock.expects('isOpenAccess').never();
      entitlementUtilsMock.expects('isEntitled').never();
      S3UtilsV4Mock.expects('getPresignedUrlToRead').never();
      const contentType = asstMediatype;
      contentV4Service
        .getContentByIdAndType(id, parentId, {
          cf: false,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .then((retriveContent) => {
          expect(retriveContent).to.be.an('array');
          expect(retriveContent.length).to.equal(0);
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          entitlementUtilsMock.verify();
          associatedMediaV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          entitlementUtilsMock.restore();
          associatedMediaV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it(`should return empty array when associatedMedias exists but request type doesn't exist
        and before Paywall`, (done) => {
      const id = '6c9f9801-3519-425d-be31-8829cae4bac4';
      const toRender = true;
      const filenamePrefix = 'someName';
      const parentId = undefined;
      const asstMediatype = 'googlepdf';
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'book'
      };
      const associatedMedias = [
        {
          _id: 'some-id-1',
          location: 'some-location-1',
          size: 1234,
          type: 'coverimage'
        },
        {
          _id: 'some-id-2',
          location: 'some-location-2',
          size: 2234,
          type: 'webpdf'
        }
      ];
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves(asset);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, true)
        .resolves(associatedMedias);
      productV4ServiceMock.expects('isOpenAccess').never();
      entitlementUtilsMock.expects('isEntitled').never();
      S3UtilsV4Mock.expects('getPresignedUrlToRead').never();
      const contentType = asstMediatype;
      contentV4Service
        .getContentByIdAndType(id, parentId, {
          cf: false,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .then((retriveContent) => {
          expect(retriveContent).to.be.an('array');
          expect(retriveContent.length).to.equal(0);
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          entitlementUtilsMock.verify();
          associatedMediaV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          entitlementUtilsMock.restore();
          associatedMediaV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it(`should return empty array when associatedMedias exists but request type doesn't exist
        and after Paywall has license`, (done) => {
      const id = '6c9f9801-3519-425d-be31-8829cae4bac4';
      const toRender = true;
      const filenamePrefix = 'someName';
      const parentId = undefined;
      const asstMediatype = 'chapterpdf';
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'book'
      };
      const associatedMedias = [
        {
          _id: 'some-id-1',
          location: 'some-location-1',
          size: 1234,
          type: 'coverimage'
        },
        {
          _id: 'some-id-2',
          location: 'some-location-2',
          size: 2234,
          type: 'webpdf'
        }
      ];
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves(asset);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, true)
        .resolves(associatedMedias);
      S3UtilsV4Mock.expects('getPresignedUrlToRead').never();
      const contentType = asstMediatype;
      contentV4Service
        .getContentByIdAndType(id, parentId, {
          cf: false,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .then((retriveContent) => {
          expect(retriveContent).to.be.an('array');
          expect(retriveContent.length).to.equal(0);
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          entitlementUtilsMock.verify();
          associatedMediaV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          entitlementUtilsMock.restore();
          associatedMediaV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it(`should throw error when unable to sign the url and before PayWall`, (done) => {
      const id = '6c9f9801-3519-425d-be31-8829cae4bac4';
      const toRender = true;
      const filenamePrefix = 'someName';
      const parentId = undefined;
      const location =
        'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/collection/some-collection-id/google.pdf';
      const asstMediatype = 'googlepdf';
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'book'
      };
      const associatedMedias = [
        {
          _id: 'some-id-1',
          location: location,
          size: 1234,
          type: 'googlepdf'
        },
        {
          _id: 'some-id-2',
          location: 'some-location-2',
          size: 2234,
          type: 'webpdf'
        }
      ];
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves(asset);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, true)
        .resolves(associatedMedias);
      productV4ServiceMock.expects('isOpenAccess').never();
      entitlementUtilsMock.expects('isEntitled').never();
      S3UtilsV4Mock.expects('headObjects')
        .once()
        .withArgs(bucket, keyPrefix + '/google.pdf')
        .resolves(true);
      S3UtilsV4Mock.expects('getPresignedUrlToRead')
        .once()
        .withArgs(location, toRender, true)
        .resolves('https://s3.amazonaws.com/');
      const contentType = asstMediatype;
      contentV4Service
        .getContentByIdAndType(id, parentId, {
          cf: false,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .then(() => {
          done(new Error('Expecting Content not found. but got success'));
        })
        .catch((err) => {
          expect(err.message).to.equal(
            'Error generating presigned url for the content'
          );
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          entitlementUtilsMock.verify();
          associatedMediaV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          entitlementUtilsMock.restore();
          associatedMediaV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it(`should throw error when unable to sign the url and after PayWall`, (done) => {
      const id = '6c9f9801-3519-425d-be31-8829cae4bac4';
      const toRender = true;
      const filenamePrefix = 'someName';
      const parentId = undefined;
      const asstMediatype = 'webpdf';
      const location =
        'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/collection/some-collection-id/web.pdf';
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'book'
      };
      const associatedMedias = [
        {
          _id: 'some-id-1',
          location: 'some-location-1',
          size: 1234,
          type: 'googlepdf'
        },
        {
          _id: 'some-id-2',
          location: location,
          size: 2234,
          type: 'webpdf'
        }
      ];
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves(asset);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, true)
        .resolves(associatedMedias);
      productV4ServiceMock
        .expects('isOpenAccess')
        .once()
        .withArgs(asset.type, asset._id)
        .resolves(false);
      entitlementUtilsMock.expects('isEntitled').resolves(true);
      S3UtilsV4Mock.expects('headObjects')
        .once()
        .withArgs(bucket, keyPrefix + '/web.pdf')
        .resolves(true);
      S3UtilsV4Mock.expects('getPresignedUrlToRead')
        .once()
        .withArgs(location, toRender, true)
        .resolves('https://s3.amazonaws.com/');
      const contentType = asstMediatype;
      contentV4Service
        .getContentByIdAndType(id, parentId, {
          cf: false,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .then(() => {
          done(new Error('Expecting Content not found. but got success'));
        })
        .catch((err) => {
          expect(err.message).to.equal(
            'Error generating presigned url for the content'
          );
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          entitlementUtilsMock.verify();
          associatedMediaV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          entitlementUtilsMock.restore();
          associatedMediaV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it(`should throw error when user donot have access applicable only after Paywall`, (done) => {
      const id = '6c9f9801-3519-425d-be31-8829cae4bac4';
      const toRender = true;
      const filenamePrefix = 'someName';
      const parentId = undefined;
      const asstMediatype = 'webpdf';
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'book'
      };
      const associatedMedias = [
        {
          _id: 'some-id-1',
          location: 'some-location-1',
          size: 1234,
          type: 'googlepdf'
        },
        {
          _id: 'some-id-2',
          location: 'some-location-2',
          size: 2234,
          type: 'webpdf'
        }
      ];
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves(asset);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, true)
        .resolves(associatedMedias);
      productV4ServiceMock
        .expects('isOpenAccess')
        .once()
        .withArgs(asset.type, asset._id)
        .resolves(false);
      entitlementUtilsMock.expects('isEntitled').resolves(false);
      S3UtilsV4Mock.expects('getPresignedUrlToRead').never();
      const contentType = asstMediatype;
      contentV4Service
        .getContentByIdAndType(id, parentId, {
          cf: false,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .then(() => {
          done(new Error('Expecting forbidden access but got success'));
        })
        .catch((err) => {
          expect(err.message).to.equal(
            `You do not have access to view this content`
          );
          expect(err.code).to.equal(403);
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          entitlementUtilsMock.verify();
          associatedMediaV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          entitlementUtilsMock.restore();
          associatedMediaV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it(`should return multiple content when id is valid and comma separated
        multiple content types are passed`, (done) => {
      const id = 'e972b42f-bd70-44c7-b4f2-95495a60eae9';
      const toRender = true;
      const filenamePrefix = 'someName';
      const parentId = undefined;
      const location =
        'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/collection/some-collection-id/dbits.xml';
      const asstMediatype = 'coverimage,dbitsxml';
      const asset = {
        _id: 'e972b42f-bd70-44c7-b4f2-95495a60eae9',
        type: 'chapter'
      };
      const associatedMedias = [
        {
          _id: 'some-id-1',
          location: 'some-location-1',
          size: 748,
          type: 'chapterabstractxml'
        },
        {
          _id: 'some-id-2',
          location: 'some-location-2',
          size: 149408,
          type: 'chapterpdf'
        },
        {
          _id: 'some-id-3',
          location: 'some-location-3',
          size: 403689,
          type: 'coverimage'
        },
        {
          _id: 'some-id-4',
          location: location,
          size: 97757,
          type: 'dbitsxml'
        }
      ];
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves(asset);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, true)
        .resolves(associatedMedias);
      productV4ServiceMock
        .expects('isOpenAccess')
        .once()
        .withArgs(asset.type, asset._id)
        .resolves(false);
      entitlementUtilsMock.expects('isEntitled').resolves(true);
      S3UtilsV4Mock.expects('headObjects')
        .once()
        .withArgs(bucket, keyPrefix + '/dbits.xml')
        .resolves(true);
      S3UtilsV4Mock.expects('getPresignedUrlToRead')
        .once()
        .withArgs(location, toRender, false, filenamePrefix, 'dbitsxml', false)
        .resolves('https://some-signed-url');
      const contentType = asstMediatype;
      contentV4Service
        .getContentByIdAndType(id, parentId, {
          cf: false,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .then((retriveContent) => {
          expect(retriveContent).to.be.an('array');
          expect(retriveContent.length).to.equal(2);
          expect(retriveContent[0]).to.have.property(
            'location',
            'some-location-3'
          );
          expect(retriveContent[0]).to.have.property('type', 'coverimage');
          expect(retriveContent[0]).to.have.property('accessType', 'licensed');
          expect(retriveContent[1]).to.have.property(
            'location',
            'https://some-signed-url'
          );
          expect(retriveContent[1]).to.have.property('type', 'dbitsxml');
          expect(retriveContent[1]).to.have.property('accessType', 'licensed');
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          entitlementUtilsMock.verify();
          associatedMediaV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          entitlementUtilsMock.restore();
          associatedMediaV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it(`should return relevant content when id is valid and comma separated multiple
        content types are passed but few are invalid content types`, (done) => {
      const id = 'e972b42f-bd70-44c7-b4f2-95495a60eae9';
      const toRender = true;
      const filenamePrefix = 'someName';
      const parentId = undefined;
      const asstMediatype = 'coverimage,some-invalid-content-type';
      const asset = {
        _id: 'e972b42f-bd70-44c7-b4f2-95495a60eae9',
        type: 'chapter'
      };
      const associatedMedias = [
        {
          _id: 'some-id-1',
          location: 'some-location-1',
          size: 748,
          type: 'chapterabstractxml'
        },
        {
          _id: 'some-id-2',
          location: 'some-location-2',
          size: 149408,
          type: 'chapterpdf'
        },
        {
          _id: 'some-id-3',
          location: 'some-location-3',
          size: 403689,
          type: 'coverimage'
        },
        {
          _id: 'some-id-4',
          location: 'some-location-4',
          size: 97757,
          type: 'dbitsxml'
        }
      ];
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves(asset);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, true)
        .resolves(associatedMedias);
      S3UtilsV4Mock.expects('getPresignedUrlToRead').never();
      const contentType = asstMediatype;
      contentV4Service
        .getContentByIdAndType(id, parentId, {
          cf: false,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .then((retriveContent) => {
          expect(retriveContent).to.be.an('array');
          expect(retriveContent.length).to.equal(1);
          retriveContent.forEach((content) => {
            expect(content).to.have.property('location', 'some-location-3');
            expect(retriveContent[0]).to.have.property('type', 'coverimage');
            expect(retriveContent[0]).to.have.property('accessType', null);
            expect(retriveContent[0]).to.have.property('size', 403689);
            expect(retriveContent[0]).to.have.property('_id', 'some-id-3');
          });
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          entitlementUtilsMock.verify();
          associatedMediaV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          entitlementUtilsMock.restore();
          associatedMediaV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
  });
  describe('getOAandBeforePayWallContentByIdAndType', () => {
    const ip = '0.0.0.0';
    const isBot = false;
    const bucket = 's3-euw1-ap-pe-df-pch-content-store-d';
    const keyPrefix = 'collection/some-collection-id';
    it(`should return signed content when id is valid and type is googlepdf
         i.e beforePaywall`, (done) => {
      const id = '6c9f9801-3519-425d-be31-8829cae4bac4';
      const toRender = true;
      const filenamePrefix = 'someName';
      const parentId = undefined;
      const asstMediatype = 'googlepdf';
      const location =
        'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/collection/some-collection-id/google.pdf';
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'book'
      };
      const associatedMedias = [
        {
          _id: 'some-id-1',
          location: location,
          size: 1234,
          type: 'googlepdf'
        },
        {
          _id: 'some-id-2',
          location: 'some-location-2',
          size: 2234,
          type: 'webpdf'
        }
      ];
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves(asset);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, true)
        .resolves(associatedMedias);
      productV4ServiceMock.expects('isOpenAccess').never();
      S3UtilsV4Mock.expects('headObjects')
        .once()
        .withArgs(bucket, keyPrefix + '/google.pdf')
        .resolves(true);
      S3UtilsV4Mock.expects('getPresignedUrlToRead')
        .once()
        .withArgs(location, toRender, true)
        .resolves('https://some-signed-url');
      const contentType = asstMediatype;
      contentV4Service
        .getOAandBeforePayWallContentByIdAndType(id, parentId, {
          cf: false,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .then((retriveContent) => {
          expect(retriveContent).to.be.an('array');
          expect(retriveContent.length).to.equal(1);
          retriveContent.forEach((content) => {
            expect(content).to.have.property(
              'location',
              'https://some-signed-url'
            );
            expect(content).to.have.property('type', 'googlepdf');
            expect(content).to.have.property('accessType', null);
            expect(content).to.have.property('size', 1234);
            expect(content).to.have.property('_id', 'some-id-1');
          });
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          associatedMediaV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          associatedMediaV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it(`should return unsigned content when id is valid and type is coverimage
    i.e beforePaywall`, (done) => {
      const id = '6c9f9801-3519-425d-be31-8829cae4bac4';
      const toRender = true;
      const filenamePrefix = 'someName';
      const parentId = undefined;
      const asstMediatype = 'coverimage';
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'book'
      };
      const associatedMedias = [
        {
          _id: 'some-id-1',
          location: 'some-location-1',
          size: 1234,
          type: 'coverimage'
        },
        {
          _id: 'some-id-2',
          location: 'some-location-2',
          size: 2234,
          type: 'webpdf'
        }
      ];
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves(asset);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, true)
        .resolves(associatedMedias);
      productV4ServiceMock.expects('isOpenAccess').never();
      S3UtilsV4Mock.expects('getPresignedUrlToRead').never();
      const contentType = asstMediatype;
      contentV4Service
        .getOAandBeforePayWallContentByIdAndType(id, parentId, {
          cf: false,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .then((retriveContent) => {
          expect(retriveContent).to.be.an('array');
          expect(retriveContent.length).to.equal(1);
          retriveContent.forEach((content) => {
            expect(content).to.have.property('location', 'some-location-1');
            expect(content).to.have.property('type', 'coverimage');
            expect(content).to.have.property('accessType', null);
            expect(content).to.have.property('size', 1234);
            expect(content).to.have.property('_id', 'some-id-1');
          });
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          associatedMediaV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          associatedMediaV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it(`should throw error when asset is null`, (done) => {
      const id = '6c9f9801-3519-425d-be31-8829cae4bac4';
      const toRender = true;
      const filenamePrefix = 'someName';
      const parentId = undefined;
      const asstMediatype = 'googlepdf';
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves(null);
      productV4ServiceMock.expects('isOpenAccess').never();
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .never();
      S3UtilsV4Mock.expects('getPresignedUrlToRead').never();
      const contentType = asstMediatype;
      contentV4Service
        .getOAandBeforePayWallContentByIdAndType(id, parentId, {
          cf: false,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .then(() => {
          done(new Error('Expecting Content not found. but got success'));
        })
        .catch((err) => {
          expect(err.message).to.equal('Product Asset not found');
          expect(err.code).to.equal(404);
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          associatedMediaV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          associatedMediaV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it(`should return relevant content when id is valid and comma separated multiple
        content types are passed but few are invalid content types`, (done) => {
      const id = 'e972b42f-bd70-44c7-b4f2-95495a60eae9';
      const toRender = true;
      const filenamePrefix = 'someName';
      const parentId = undefined;
      const asstMediatype = 'coverimage,some-invalid-content-type';
      const asset = {
        _id: 'e972b42f-bd70-44c7-b4f2-95495a60eae9',
        type: 'chapter'
      };
      const associatedMedias = [
        {
          _id: 'some-id-1',
          location: 'some-location-1',
          size: 748,
          type: 'chapterabstractxml'
        },
        {
          _id: 'some-id-2',
          location: 'some-location-2',
          size: 149408,
          type: 'chapterpdf'
        },
        {
          _id: 'some-id-3',
          location: 'some-location-3',
          size: 403689,
          type: 'coverimage'
        },
        {
          _id: 'some-id-4',
          location: 'some-location-4',
          size: 97757,
          type: 'dbitsxml'
        }
      ];
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves(asset);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, true)
        .resolves(associatedMedias);
      S3UtilsV4Mock.expects('getPresignedUrlToRead').never();
      const contentType = asstMediatype;
      contentV4Service
        .getOAandBeforePayWallContentByIdAndType(id, parentId, {
          cf: false,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .then((retriveContent) => {
          expect(retriveContent).to.be.an('array');
          expect(retriveContent.length).to.equal(1);
          retriveContent.forEach((content) => {
            expect(content).to.have.property('location', 'some-location-3');
            expect(retriveContent[0]).to.have.property('type', 'coverimage');
            expect(retriveContent[0]).to.have.property('accessType', null);
            expect(retriveContent[0]).to.have.property('size', 403689);
            expect(retriveContent[0]).to.have.property('_id', 'some-id-3');
          });
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          associatedMediaV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          associatedMediaV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it(`should return empty array when associatedMedias is empty array []`, (done) => {
      const id = '6c9f9801-3519-425d-be31-8829cae4bac4';
      const toRender = true;
      const filenamePrefix = 'someName';
      const parentId = undefined;
      const asstMediatype = 'googlepdf';
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'book'
      };
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves(asset);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, true)
        .resolves([]);
      productV4ServiceMock.expects('isOpenAccess').never();
      S3UtilsV4Mock.expects('getPresignedUrlToRead').never();
      const contentType = asstMediatype;
      contentV4Service
        .getOAandBeforePayWallContentByIdAndType(id, parentId, {
          cf: false,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .then((retriveContent) => {
          expect(retriveContent).to.be.an('array');
          expect(retriveContent.length).to.equal(0);
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          associatedMediaV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          associatedMediaV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it(`should return signed content when id is valid and type is webpdf but product is OA
    i.e beforePaywall`, (done) => {
      const id = '6c9f9801-3519-425d-be31-8829cae4bac4';
      const toRender = true;
      const filenamePrefix = 'someName';
      const parentId = undefined;
      const asstMediatype = 'webpdf';
      const location =
        'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/collection/some-collection-id/web.pdf';
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'book'
      };
      const associatedMedias = [
        {
          _id: 'some-id-1',
          location: 'some-location-1',
          size: 1234,
          type: 'googlepdf'
        },
        {
          _id: 'some-id-2',
          location: location,
          size: 2234,
          type: 'webpdf'
        }
      ];
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves(asset);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, true)
        .resolves(associatedMedias);
      productV4ServiceMock
        .expects('isOpenAccess')
        .once()
        .withArgs(asset.type, asset._id)
        .resolves(true);
      S3UtilsV4Mock.expects('headObjects')
        .once()
        .withArgs(bucket, keyPrefix + '/web.pdf')
        .resolves(true);
      S3UtilsV4Mock.expects('getPresignedUrlToRead')
        .once()
        .withArgs(location, toRender, true)
        .resolves('https://some-signed-url');
      const contentType = asstMediatype;
      contentV4Service
        .getOAandBeforePayWallContentByIdAndType(id, parentId, {
          cf: false,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .then((retriveContent) => {
          expect(retriveContent).to.be.an('array');
          expect(retriveContent.length).to.equal(1);
          retriveContent.forEach((content) => {
            expect(content).to.have.property(
              'location',
              'https://some-signed-url'
            );
            expect(content).to.have.property('type', 'webpdf');
            expect(content).to.have.property('accessType', 'openAccess');
            expect(content).to.have.property('size', 2234);
            expect(content).to.have.property('_id', 'some-id-2');
          });
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          associatedMediaV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          associatedMediaV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it(`should return signed content when id is valid and type is webpdf`, (done) => {
      const id = '6c9f9801-3519-425d-be31-8829cae4bac4';
      const toRender = true;
      const filenamePrefix = 'someName';
      const parentId = undefined;
      const asstMediatype = 'webpdf';
      const location =
        'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/collection/some-collection-id/web.pdf';
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'scholarlyArticle'
      };
      const associatedMedias = [
        {
          _id: 'some-id-1',
          location: 'some-location-1',
          size: 1234,
          type: 'googlepdf'
        },
        {
          _id: 'some-id-2',
          location: location,
          size: 2234,
          type: 'webpdf'
        }
      ];
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves(asset);
      productV4ServiceMock
        .expects('getProductById')
        .once()
        .withArgs(id, 'medium')
        .resolves({
          product: {
            scholarlyArticle: {
              currentVersion: 'FINAL'
            }
          }
        });
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, true, 'FINAL')
        .resolves(associatedMedias);
      productV4ServiceMock
        .expects('isOpenAccess')
        .once()
        .withArgs(asset.type, asset._id)
        .resolves(true);
      S3UtilsV4Mock.expects('headObjects')
        .once()
        .withArgs(bucket, keyPrefix + '/web.pdf')
        .resolves(true);
      S3UtilsV4Mock.expects('getPresignedUrlToRead')
        .once()
        .withArgs(location, toRender, true)
        .resolves('https://some-signed-url');
      const contentType = asstMediatype;
      contentV4Service
        .getOAandBeforePayWallContentByIdAndType(id, parentId, {
          cf: false,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .then((retriveContent) => {
          expect(retriveContent).to.be.an('array');
          expect(retriveContent.length).to.equal(1);
          retriveContent.forEach((content) => {
            expect(content).to.have.property(
              'location',
              'https://some-signed-url'
            );
            expect(content).to.have.property('type', 'webpdf');
            expect(content).to.have.property('accessType', 'openAccess');
            expect(content).to.have.property('size', 2234);
            expect(content).to.have.property('_id', 'some-id-2');
          });
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          associatedMediaV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          associatedMediaV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it(`should throw error when product is not OA`, (done) => {
      const id = '6c9f9801-3519-425d-be31-8829cae4bac4';
      const toRender = true;
      const filenamePrefix = 'someName';
      const parentId = undefined;
      const asstMediatype = 'webpdf';
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'book'
      };
      const associatedMedias = [
        {
          _id: 'some-id-1',
          location: 'some-location-1',
          size: 1234,
          type: 'googlepdf'
        },
        {
          _id: 'some-id-2',
          location: 'some-location-2',
          size: 2234,
          type: 'webpdf'
        }
      ];
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves(asset);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, true)
        .resolves(associatedMedias);
      productV4ServiceMock
        .expects('isOpenAccess')
        .once()
        .withArgs(asset.type, asset._id)
        .resolves(false);
      S3UtilsV4Mock.expects('getPresignedUrlToRead').never();
      const contentType = asstMediatype;
      contentV4Service
        .getOAandBeforePayWallContentByIdAndType(id, parentId, {
          cf: false,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .then(() => {
          done(new Error('Expecting Content not found. but got success'));
        })
        .catch((err) => {
          expect(err.message).to.equal('The product is not open access');
          expect(err.code).to.equal(400);
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          associatedMediaV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          associatedMediaV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
    it(`should throw error when product is not present at S3`, (done) => {
      const id = '6c9f9801-3519-425d-be31-8829cae4bac4';
      const toRender = true;
      const filenamePrefix = 'someName';
      const parentId = undefined;
      const asstMediatype = 'webpdf';
      const location =
        'https://s3-euw1-ap-pe-df-pch-content-store-d.s3.eu-west-1.amazonaws.com/collection/some-collection-id/web.pdf';
      const asset = {
        _id: '6c9f9801-3519-425d-be31-8829cae4bac4',
        type: 'book'
      };
      const associatedMedias = [
        {
          _id: 'some-id-1',
          location: 'some-location-1',
          size: 1234,
          type: 'googlepdf'
        },
        {
          _id: 'some-id-2',
          location: location,
          size: 2234,
          type: 'webpdf'
        }
      ];
      assetV4ServiceMock
        .expects('getAssetById')
        .once()
        .withArgs(id, ['type'])
        .resolves(asset);
      associatedMediaV4ServiceMock
        .expects('getContentMetaDataByParentid')
        .once()
        .withArgs(id, true)
        .resolves(associatedMedias);
      productV4ServiceMock
        .expects('isOpenAccess')
        .once()
        .withArgs(asset.type, asset._id)
        .resolves(true);
      S3UtilsV4Mock.expects('headObjects')
        .once()
        .withArgs(bucket, keyPrefix + '/web.pdf')
        .resolves(false);
      S3UtilsV4Mock.expects('getPresignedUrlToRead').never();
      const contentType = asstMediatype;
      contentV4Service
        .getOAandBeforePayWallContentByIdAndType(id, parentId, {
          cf: false,
          contentType,
          filenamePrefix,
          ip,
          isBot,
          toRender,
          token
        })
        .then((retriveContent) => {
          expect(retriveContent).to.be.an('array');
          expect(retriveContent.length).to.equal(1);
          retriveContent.forEach((content) => {
            expect(content).to.have.property('location', null);
            expect(content).to.have.property('type', 'webpdf');
            expect(content).to.have.property('accessType', 'openAccess');
            expect(content).to.have.property('size', 2234);
            expect(content).to.have.property('_id', 'some-id-2');
          });
          assetV4ServiceMock.verify();
          productV4ServiceMock.verify();
          associatedMediaV4ServiceMock.verify();
          S3UtilsV4Mock.verify();
          done();
        })
        .catch(done)
        .finally(() => {
          assetV4ServiceMock.restore();
          productV4ServiceMock.restore();
          associatedMediaV4ServiceMock.restore();
          S3UtilsV4Mock.restore();
        });
    });
  });
});
