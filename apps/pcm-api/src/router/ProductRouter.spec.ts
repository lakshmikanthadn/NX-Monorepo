import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import * as sinon from 'sinon';
import app from '../../test/test-app';

import { ackController } from '../v4/ack/ACK.Controller';
import { journalPublishingServiceMapController } from '../v4/JournalPubServiceMap/JournalPubServiceMap.Controller';
import { partsV4Controller } from '../v4/parts/PartsV4.Controller';
import { partsV410Controller } from '../v410/parts/Parts.V410.Controller';
import { productV4Controller } from '../v4/products/ProductV4.Controller';
import { productRouter } from './ProductRouter';
import { partsrevisionV4Controller } from '../v4/partsRevision/PartsRevisionV4.Controller';
const successResponder = (req, res) => res.status(200).send('success');

chai.use(chaiHttp);

describe('ProductRouter', () => {
  it('should have same number of router when we invoke getRoutes 2 times', () => {
    const routesCount1 = productRouter.getRoutes().stack.length;
    const routesCount2 = productRouter.getRoutes().stack.length;
    expect(routesCount1).to.equal(routesCount2);
  });
  app.use('/products', productRouter.getRoutes());
  describe('InvalidAPIVersionError', () => {
    const testScenarios = [
      {
        method: 'HEAD',
        path: '/products',
        query: { apiVersion: '4.0.x' }
      },
      {
        method: 'GET',
        path: '/products',
        query: { apiVersion: '4.0.x' }
      },
      {
        method: 'GET',
        path: '/products/manuscript',
        query: { apiVersion: '4.0.x' }
      },
      {
        body: { apiVersion: '4.0.x' },
        method: 'POST',
        path: '/products'
      },
      {
        method: 'GET',
        path: '/products/12345',
        query: { apiVersion: '4.0.x' }
      },
      {
        method: 'GET',
        path: '/products/manuscript/12345',
        query: { apiVersion: '4.0.x' }
      },
      {
        method: 'GET',
        path: '/products/manuscript/workflow/12345',
        query: { apiVersion: '4.0.x' }
      },
      {
        method: 'GET',
        path: '/products/report',
        query: { apiVersion: '4.0.x' }
      },
      {
        body: { apiVersion: '4.0.x' },
        method: 'POST',
        path: '/products/12345'
      },
      {
        body: { apiVersion: '4.0.x' },
        method: 'POST',
        path: '/products/1234/ack'
      },
      {
        body: { apiVersion: '4.0.x' },
        method: 'PUT',
        path: '/products/12345'
      },
      {
        method: 'GET',
        path: '/products/12345/publishing-services',
        query: { apiVersion: '4.0.x' }
      },
      {
        method: 'GET',
        path: '/products/12345/associated-media',
        query: { apiVersion: '4.0.x' }
      },
      {
        body: { apiVersion: '4.0.x' },
        method: 'PUT',
        path: '/products/12345/publishing-services'
      },
      {
        body: { apiVersion: '4.0.x' },
        method: 'PATCH',
        path: '/products/12345'
      },
      {
        method: 'GET',
        path: '/products/12345/parts',
        query: { apiVersion: '4.0.x' }
      },
      {
        method: 'GET',
        path: '/products/12345/parts/123',
        query: { apiVersion: '4.0.x' }
      },
      {
        method: 'GET',
        path: '/products/book/classifications/subject',
        query: { apiVersion: '4.0.x' }
      }
    ];
    testScenarios.forEach((ts) => {
      it(`should receive ${ts.method} request from ${ts.path} and throw
            invalid api version when apiVersion is other than 4.0.1`, (done: any) => {
        const method = ts.method.toLowerCase();
        const errObj = {
          data: null,
          metadata: { message: 'Invalid API Version: 4.0.x' }
        };
        chai
          .request(app)
          [method](ts.path)
          .query(ts.query)
          .send(ts.body)
          .then((res: any) => {
            expect(res.status).to.equal(400);
            if (method !== 'head') {
              expect(JSON.parse(res.text)).to.deep.equal(errObj);
            }
            done();
          })
          .catch((err) => {
            console.log(err);
            done(err);
          });
      });
    });
  });
  it(`should receive HEAD request from /products and delegate
        it to productV4Controller`, (done: any) => {
    const productV4ControllerMock = sinon
      .stub(productV4Controller, 'getProductByIdentifier')
      .callsFake(successResponder);
    chai
      .request(app)
      .head('/products')
      .query({
        apiVersion: '4.0.1',
        identifierName: 'collectionId',
        identifierValue: 'ABC-123XYZ'
      })
      .then((res: any) => {
        expect(res.status).to.equal(200);
        productV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        productV4ControllerMock.restore();
        done(err);
      });
  });
  it(`should receive GET request from /products and delegate
        it to productV4Controller`, (done: any) => {
    const productV4ControllerMock = sinon
      .stub(productV4Controller, 'getProducts')
      .callsFake(successResponder);
    chai
      .request(app)
      .get('/products')
      .query({ apiVersion: '4.0.1' })
      .then((res: any) => {
        expect(res.status).to.equal(200);
        productV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        productV4ControllerMock.restore();
        done(err);
      });
  });
  it(`should receive GET request from /products/manuscript and delegate
        it to productV4Controller`, (done: any) => {
    const productV4ControllerMock = sinon
      .stub(productV4Controller, 'getPreArticles')
      .callsFake(successResponder);
    chai
      .request(app)
      .get('/products/manuscript')
      .query({ apiVersion: '4.0.1' })
      .then((res: any) => {
        expect(res.status).to.equal(200);
        productV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        productV4ControllerMock.restore();
        done(err);
      });
  });
  it(`should receive GET request from /products/report and delegate
        it to productV4Controller`, (done: any) => {
    const productV4ControllerMock = sinon
      .stub(productV4Controller, 'getReport')
      .callsFake(successResponder);
    chai
      .request(app)
      .get('/products/report')
      .query({ apiVersion: '4.0.1', type: 'salessheets' })
      .then((res: any) => {
        expect(res.status).to.equal(200);
        productV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        productV4ControllerMock.restore();
        done(err);
      });
  });
  it(`should receive GET request from /products and throw
    invalid api version when apiVersion is other than 4.0.1`, (done: any) => {
    const errObj = {
      data: null,
      metadata: { message: 'Invalid API Version: 4.0.x' }
    };
    chai
      .request(app)
      .get('/products')
      .query({ apiVersion: '4.0.x' })
      .then((res: any) => {
        expect(res.status).to.equal(400);
        expect(JSON.parse(res.text)).to.deep.equal(errObj);
        done();
      })
      .catch((err) => {
        console.log(err);
        done(err);
      });
  });
  it(`should receive POST request from /products and delegate it to productV4Controller
        when action is search and apiVersion is 4.0.1`, (done: any) => {
    const productV4ControllerMock = sinon
      .stub(productV4Controller, 'handlePostProduct')
      .callsFake(successResponder);
    chai
      .request(app)
      .post('/products')
      .send({ action: 'search', apiVersion: '4.0.1' })
      .then((res: any) => {
        expect(res.status).to.equal(200);
        productV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        productV4ControllerMock.restore();
        done(err);
      });
  });
  it(`should receive POST request from /products and delegate it to productV4Controller
        when action is new-id and apiVersion is 4.0.1`, (done: any) => {
    const productV4ControllerMock = sinon
      .stub(productV4Controller, 'handlePostProduct')
      .callsFake(successResponder);
    chai
      .request(app)
      .post('/products')
      .send({ action: 'new-id', apiVersion: '4.0.1' })
      .then((res: any) => {
        expect(res.status).to.equal(200);
        productV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        productV4ControllerMock.restore();
        done(err);
      });
  });
  it(`should receive POST request from /products and delegate it to productV4Controller
        when action is save and apiVersion is 4.0.1`, (done: any) => {
    const productV4ControllerMock = sinon
      .stub(productV4Controller, 'handlePostProduct')
      .callsFake(successResponder);
    chai
      .request(app)
      .post('/products')
      .send({ action: 'save', apiVersion: '4.0.1' })
      .then((res: any) => {
        expect(res.status).to.equal(200);
        productV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        productV4ControllerMock.restore();
        done(err);
      });
  });
  it(`should receive PUT request from /products/:identifier and delegate
        it to productV4Controller`, (done: any) => {
    const productV4ControllerMock = sinon
      .stub(productV4Controller, 'handleUpdateProduct')
      .callsFake(successResponder);
    chai
      .request(app)
      .put('/products/1234')
      .send({ apiVersion: '4.0.1' })
      .then((res: any) => {
        expect(res.status).to.equal(200);
        productV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        productV4ControllerMock.restore();
        done(err);
      });
  });
  it(`should receive PUT request from /products/:identifier and delegate
        it to productV4Controller`, (done: any) => {
    const productV4ControllerMock = sinon
      .stub(productV4Controller, 'handlePartialUpdateProduct')
      .callsFake(successResponder);
    chai
      .request(app)
      .patch('/products/1234')
      .send({ apiVersion: '4.0.1' })
      .then((res: any) => {
        expect(res.status).to.equal(200);
        productV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        productV4ControllerMock.restore();
        done(err);
      });
  });
  it(`should receive GET request from /products/:identifier and throw
        invalid api version when apiVersion is other than 4.0.1`, (done: any) => {
    const errObj = {
      data: null,
      metadata: { message: 'Invalid API Version: 4.0.x' }
    };
    chai
      .request(app)
      .get('/products/1234')
      .query({ apiVersion: '4.0.x' })
      .then((res: any) => {
        expect(res.status).to.equal(400);
        expect(JSON.parse(res.text)).to.deep.equal(errObj);
        done();
      })
      .catch((err) => {
        console.log(err);
        done(err);
      });
  });
  it(`should receive GET request from /products/:identifier and delegate
        it to productV4Controller When apiVersion is 4.0.1`, (done: any) => {
    const productV4ControllerMock = sinon
      .stub(productV4Controller, 'getProduct')
      .callsFake(successResponder);
    chai
      .request(app)
      .get('/products/1234')
      .query({ apiVersion: '4.0.1' })
      .then((res: any) => {
        expect(res.status).to.equal(200);
        productV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        productV4ControllerMock.restore();
        done(err);
      });
  });
  it(`should receive GET request from /products/manuscript/:identifier and delegate
        it to productV4Controller When apiVersion is 4.0.1`, (done: any) => {
    const productV4ControllerMock = sinon
      .stub(productV4Controller, 'getPreArticle')
      .callsFake(successResponder);
    chai
      .request(app)
      .get('/products/manuscript/1234')
      .query({ apiVersion: '4.0.1' })
      .then((res: any) => {
        expect(res.status).to.equal(200);
        productV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        productV4ControllerMock.restore();
        done(err);
      });
  });
  it(`should receive GET request from /products/manuscript/workflow/:identifier and delegate
        it to productV4Controller When apiVersion is 4.0.1`, (done: any) => {
    const productV4ControllerMock = sinon
      .stub(productV4Controller, 'getManuscriptWorkflow')
      .callsFake(successResponder);
    chai
      .request(app)
      .get('/products/manuscript/workflow/1234')
      .query({ apiVersion: '4.0.1' })
      .then((res: any) => {
        expect(res.status).to.equal(200);
        productV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        productV4ControllerMock.restore();
        done(err);
      });
  });
  it(`should receive GET request from /products/:assetType/classifications/:taxonomyType and
    delegate it to productV4Controller When apiVersion is 4.0.1`, (done: any) => {
    const productV4ControllerMock = sinon
      .stub(productV4Controller, 'getTaxonomy')
      .callsFake(successResponder);
    chai
      .request(app)
      .get('/products/book/classifications/subject')
      .query({ apiVersion: '4.0.1' })
      .then((res: any) => {
        expect(res.status).to.equal(200);
        productV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        productV4ControllerMock.restore();
        done(err);
      });
  });
  it(`should receive GET request from /products/:identifier/parts and delegate
        it to partsV4Controller When apiVersion is 4.0.1`, (done: any) => {
    const partsV4ControllerMock = sinon
      .stub(partsV4Controller, 'getProductHasParts')
      .callsFake(successResponder);
    chai
      .request(app)
      .get('/products/1234/parts')
      .query({ apiVersion: '4.0.1' })
      .then((res: any) => {
        expect(res.status).to.equal(200);
        partsV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        partsV4ControllerMock.restore();
        done(err);
      });
  });
  it(`should receive GET request from /products/:identifier/parts and delegate
        it to partsV410Controller When apiVersion is 4.1.0`, (done: any) => {
    const partsV410ControllerMock = sinon
      .stub(partsV410Controller, 'getProductHasParts')
      .callsFake(successResponder);
    chai
      .request(app)
      .get('/products/1234/parts')
      .query({ apiVersion: '4.1.0' })
      .then((res: any) => {
        expect(res.status).to.equal(200);
        partsV410ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        partsV410ControllerMock.restore();
        done(err);
      });
  });
  it(`should receive GET request from /products/:identifier/parts-delta and delegate
        it to partsV4Controller When apiVersion is 4.0.1`, (done: any) => {
    const partsV4ControllerMock = sinon
      .stub(partsV4Controller, 'getProductPartsDelta')
      .callsFake(successResponder);
    chai
      .request(app)
      .get('/products/1234/parts-delta')
      .query({ apiVersion: '4.0.1' })
      .then((res: any) => {
        expect(res.status).to.equal(400);
        partsV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        partsV4ControllerMock.restore();
        done(err);
      });
  });
  it(`should throw error from /products/:identifier/parts-delta  
         When apiVersion is not 4.0.1`, (done: any) => {
    const partsV4ControllerMock = sinon
      .stub(partsV4Controller, 'getProductPartsDelta')
      .callsFake(successResponder);
    chai
      .request(app)
      .get('/products/1234/parts-delta')
      .query({ apiVersion: '4.0.2', fromDate: '2020-12-02' })
      .then((res: any) => {
        console.log(res);
        expect(res.status).to.equal(400);
        partsV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        partsV4ControllerMock.restore();
        done(err);
      });
  });
  it(`should receive GET request from /products/:identifier/parts-delta and delegate
        it to partsRevisionV4Controller When apiVersion is 4.0.1`, (done: any) => {
    const partsV4ControllerMock = sinon
      .stub(partsrevisionV4Controller, 'getProductPartsRevisionDelta')
      .callsFake(successResponder);
    chai
      .request(app)
      .get('/products/1234/parts-delta')
      .query({ apiVersion: '4.0.1', fromDate: '2020-12-02' })
      .then((res: any) => {
        expect(res.status).to.equal(200);
        partsV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        partsV4ControllerMock.restore();
        done(err);
      });
  });
  it(`should receive GET request from /products/:identifier/parts-delta and delegate
  it to partsRevisionV4Controller When apiVersion is 4.0.1 and include is passed`, (done: any) => {
    const partsV4ControllerMock = sinon
      .stub(partsrevisionV4Controller, 'getProductPartsRevisionDelta')
      .callsFake(successResponder);
    chai
      .request(app)
      .get('/products/1234/parts-delta')
      .query({
        apiVersion: '4.0.1',
        fromDate: '2020-12-02',
        include: ['partsAdded', 'partsRemoved', 'partsUpdated'],
        toDate: '2020-12-03'
      })
      .then((res: any) => {
        expect(res.status).to.equal(500);
        partsV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        partsV4ControllerMock.restore();
        done(err);
      });
  });
  it(`should receive GET request from /products/:identifier/ack and delegate
        it to productV4Controller When apiVersion is 4.0.1`, (done: any) => {
    const ackControllerMock = sinon
      .stub(ackController, 'handleAssetDistributionAck')
      .callsFake(successResponder);
    chai
      .request(app)
      .post('/products/1234/ack')
      .send({ apiVersion: '4.0.1', data: {} })
      .then((res: any) => {
        expect(res.status).to.equal(200);
        ackControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        ackControllerMock.restore();
        done(err);
      });
  });
  it(`should receive GET request from /products/:identifier/parts/:partId and delegate
        it to productV4Controller when apiVersion is 4.0.1`, (done: any) => {
    const partsV4ControllerMock = sinon
      .stub(partsV4Controller, 'getProductHasPart')
      .callsFake(successResponder);
    chai
      .request(app)
      .get('/products/1234/parts/234')
      .query({ apiVersion: '4.0.1' })
      .then((res: any) => {
        expect(res.status).to.equal(200);
        partsV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        partsV4ControllerMock.restore();
        done(err);
      });
  });
  it(`should receive POST request from /products/uuid and delegate
        it to productV4Controller when apiVersion is 4.0.1`, (done: any) => {
    const productV4ControllerMock = sinon
      .stub(productV4Controller, 'handleCreateProductById')
      .callsFake(successResponder);
    chai
      .request(app)
      .post('/products/1234')
      .send({ apiVersion: '4.0.1', product: {} })
      .then((res: any) => {
        expect(res.status).to.equal(200);
        productV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        productV4ControllerMock.restore();
        done(err);
      });
  });
  it(`should receive PUT request from /products/:acronym/publishing-services and delegate
    it to productV4Controller when apiVersion is 4.0.1`, (done: any) => {
    const productV4ControllerMock = sinon
      .stub(
        journalPublishingServiceMapController,
        'updateJournalPublishingServiceMap'
      )
      .callsFake(successResponder);
    chai
      .request(app)
      .put('/products/TCEO/publishing-services')
      .query({ productIdentifierName: 'journalAcronym' })
      .send({ apiVersion: '4.0.1', product: {} })
      .then((res: any) => {
        expect(res.status).to.equal(200);
        productV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        productV4ControllerMock.restore();
        done(err);
      });
  });
  it(`should receive GET request from /products/:acronym/publishing-services and delegate
        it to productV4Controller when apiVersion is 4.0.1`, (done: any) => {
    const productV4ControllerMock = sinon
      .stub(
        journalPublishingServiceMapController,
        'getJournalPublishingServiceMap'
      )
      .callsFake(successResponder);
    chai
      .request(app)
      .get('/products/TCEO/publishing-services')
      .query({ apiVersion: '4.0.1', productIdentifierName: 'journalAcronym' })
      .then((res: any) => {
        expect(res.status).to.equal(200);
        productV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        productV4ControllerMock.restore();
        done(err);
      });
  });
  it(`should receive GET request from /products/:identifier/associated-media and delegate
        it to productV4Controller when apiVersion is 4.0.1`, (done: any) => {
    const productV4ControllerMock = sinon
      .stub(productV4Controller, 'getProductAssociatedMedia')
      .callsFake(successResponder);
    chai
      .request(app)
      .get('/products/1234/associated-media')
      .query({ apiVersion: '4.0.1' })
      .then((res: any) => {
        expect(res.status).to.equal(200);
        productV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        productV4ControllerMock.restore();
        done(err);
      });
  });
});
