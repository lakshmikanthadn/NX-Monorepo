import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');

import app from '../../test/test-app';
import { contentProxyV2Router } from './ContentProxyV2Router';

chai.use(chaiHttp);

const testUrl = 'https://api-dev.taylorfrancis.com/v4';

app.use('/contentv2', contentProxyV2Router.getRoutes());
const testCases = [
  {
    redirectTo:
      '/content/books/mono/download?identifierName=doi&identifierValue=123&type=webpdf',
    requestUrl: '/contentv2/books/download?doi=123&format=pdf',
    testName: 'book webpdf when format is pdf and producttype is book'
  },
  {
    redirectTo:
      '/content/books/mono/download' +
      '?identifierName=doi&identifierValue=123&type=previewpdf',
    requestUrl: '/contentv2/books/download?doi=123&format=previewPdf',
    testName:
      'book previewpdf when format is previewPdf and producttype is book'
  },
  {
    redirectTo:
      '/content/books/mono/download' +
      '?identifierName=doi&identifierValue=123&type=previewpdf',
    requestUrl: '/contentv2/books/download?doi=123&format=googlePreviewPdf',
    testName:
      'book previewpdf when format is googlePreviewpdf and producttype is book'
  },
  {
    redirectTo:
      '/content/books/edit/download' +
      '?identifierName=doi&identifierValue=123&type=webpdf',
    requestUrl: '/contentv2/books/e/download?doi=123&format=pdf',
    testName:
      'edited book webdpf when format is pdf, producttype is book and categoryType is e'
  },
  {
    redirectTo:
      '/content/books/mono/download?identifierName=doi&identifierValue=123&type=webpdf',
    requestUrl:
      '/contentv2/books/download?doi=123&format=pdf&isbn=123456&dac=1234567890',
    testName: 'book webpdf using only doi when url has doi, isbn and dacKey'
  },
  {
    redirectTo:
      '/content/books/mono/download' +
      '?identifierName=isbn&identifierValue=123456&type=webpdf',
    requestUrl:
      '/contentv2/books/download?format=pdf&isbn=123456&dac=1234567890',
    testName: 'book webpdf using isbn when doi is missing and dac is present'
  },
  {
    redirectTo:
      '/content/books/mono/download' +
      '?identifierName=dacKey&identifierValue=1234567890&type=webpdf',
    requestUrl: '/contentv2/books/download?format=pdf&dac=1234567890',
    testName:
      'book webpdf using dacKey when doi and isbn are missing and dac is present'
  },
  {
    redirectTo:
      '/content/chapters/mono/download' +
      '?identifierName=doi&identifierValue=1234%2F567890-1&type=chapterpdf',
    requestUrl: '/contentv2/books/download?format=pdf&doi=1234%2F567890-1',
    testName: `chapter's chapterpdf using doi when doi has hyphen in it and format is pdf`
  },
  {
    redirectTo:
      '/content/chapters/edit/download' +
      '?identifierName=doi&identifierValue=1234%2F567890-1&type=previewpdf',
    requestUrl:
      '/contentv2/books/e/download?format=previewPdf&doi=1234%2F567890-1&isbn=123456&dac=dac-2019-123h',
    testName: `chapter's previewPdf using doi when doi has hyphen in it and format is previewPdf`
  },
  {
    redirectTo:
      '/content/chapters/edit/download' +
      '?identifierName=doi&identifierValue=1234%2F567890-1&type=invalidformat',
    requestUrl:
      '/contentv2/books/e/download?format=invalidFormat&doi=1234%2F567890-1',
    testName: `the requested format when format is none of the pdf/googlePreviewPdf/previewPdf`
  },
  {
    redirectTo:
      '/content/chapters/edit/download' +
      '?identifierName=doi&identifierValue=1234%2F567890-1&type=invalidformat',
    requestUrl:
      '/contentv2/books/e/download?format=invalidFOrmat&doi=1234%2F567890-1',
    testName: `previewPdf format when format is missing`
  }
];
describe('ContentProxyV2Router', () => {
  testCases.forEach((ts) => {
    it(`should redirect to new url to get ${ts.testName}`, async () => {
      expect(
        await chai.request(app).get(ts.requestUrl).redirects(0).send()
      ).to.redirectTo(testUrl + ts.redirectTo);
    });
  });

  it(`should throw error when GET request to content proxy api has NO identifier`, (done: any) => {
    chai
      .request(app)
      .get('/contentv2/books/download?format=pdf')
      .then((res: any) => {
        expect(res.text).to.equal(
          'Missing either one the required query params doc, isbn and doi'
        );
        expect(res.status).to.equal(404);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
