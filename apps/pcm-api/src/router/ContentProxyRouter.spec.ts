import { ContentProxyHandler } from '@tandfgroup/pcm-content-proxy-api-handler';
import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import * as sinon from 'sinon';

import app from '../../test/test-app';
import { contentV4Controller } from '../v4/content/ContentV4.Controller';
import ContentProxyRouter from './ContentProxyRouter';

const successResponder = (req, res) => res.status(200).send('success');

chai.use(chaiHttp);

const contentProxyHandler: ContentProxyHandler = {
  getExpressMiddleWare: () => (req: any, res: any, next: any) => next()
} as ContentProxyHandler;
const contentProxyRouter = new ContentProxyRouter(contentProxyHandler);

app.use('/content', contentProxyRouter.getRoutes());

describe('ContentProxyRouter', () => {
  it(`should receive GET request to content proxy api and delegate it to contentV4Controller`, (done: any) => {
    const contentV4ControllerMock = sinon
      .stub(contentV4Controller, 'downloadContentByIdentifier')
      .callsFake(successResponder);
    chai
      .request(app)
      .get('/content/books/oa-mono/download')
      .then((res: any) => {
        expect(res.status).to.equal(200);
        contentV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        contentV4ControllerMock.restore();
        done(err);
      });
  });
  it(`should receive GET request to content proxy api and delegate
     it to contentV4Controller`, (done: any) => {
    const contentV4ControllerMock = sinon
      .stub(contentV4Controller, 'downloadContentByIdentifier')
      .callsFake(successResponder);
    chai
      .request(app)
      .get('/content/books/download')
      .then((res: any) => {
        expect(res.status).to.equal(200);
        contentV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        contentV4ControllerMock.restore();
        done(err);
      });
  });
  it(`should receive GET request for entry-version to content proxy api and delegate
it to contentV4Controller`, (done: any) => {
    const contentV4ControllerMock = sinon
      .stub(contentV4Controller, 'downloadContentByIdentifier')
      .callsFake(successResponder);
    chai
      .request(app)
      .get('/content/entry-versions/download')
      .then((res: any) => {
        expect(res.status).to.equal(200);
        contentV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        contentV4ControllerMock.restore();
        done(err);
      });
  });
  it(`should throw error when GET request to content proxy api has invalid product type`, (done: any) => {
    const contentV4ControllerMSpy = sinon.spy(
      contentV4Controller,
      'downloadContentByIdentifier'
    );
    chai
      .request(app)
      .get('/content/invalid-product-type/oa-mono/download')
      .then((res: any) => {
        expect(res.status).to.equal(400);
        expect(res.body.metadata.message).to.equal(
          `Invalid product type invalid-product-type`
        );
        expect(contentV4ControllerMSpy.called).to.equal(false);
        contentV4ControllerMSpy.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        contentV4ControllerMSpy.restore();
        done(err);
      });
  });
  it(`should throw error when GET request to content proxy api has invalid product type`, (done: any) => {
    const contentV4ControllerMSpy = sinon.spy(
      contentV4Controller,
      'downloadContentByIdentifier'
    );
    chai
      .request(app)
      .get('/content/invalid-product-type/download')
      .then((res: any) => {
        expect(res.status).to.equal(400);
        expect(res.body.metadata.message).to.equal(
          `Invalid product type invalid-product-type`
        );
        expect(contentV4ControllerMSpy.called).to.equal(false);
        contentV4ControllerMSpy.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        contentV4ControllerMSpy.restore();
        done(err);
      });
  });

  it(`should throw error when GET request to content proxy api has invalid category type`, (done: any) => {
    const contentV4ControllerMSpy = sinon.spy(
      contentV4Controller,
      'downloadContentByIdentifier'
    );
    chai
      .request(app)
      .get('/content/books/invalid-category-type/download')
      .then((res: any) => {
        expect(res.status).to.equal(400);
        expect(res.body.metadata.message).to.equal(
          `Invalid category type invalid-category-type`
        );
        expect(contentV4ControllerMSpy.called).to.equal(false);
        contentV4ControllerMSpy.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        contentV4ControllerMSpy.restore();
        done(err);
      });
  });
});
