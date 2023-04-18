import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import * as sinon from 'sinon';
import app from '../../test/test-app';

import { productV4Controller } from '../v4/products/ProductV4.Controller';
import { internalRouter } from './InternalRouter';

const successResponder = (req, res) => res.status(200).send('success');
const acceptedResponder = (req, res) => res.status(202).send('accepted');

chai.use(chaiHttp);

app.use('/internal/products', internalRouter.getRoutes());

describe('internal router', () => {
  describe('InvalidAPIVersionError', () => {
    const testScenarios = [
      {
        body: { apiVersion: '4.0.x' },
        method: 'PUT',
        path: '/internal/products/12345'
      },
      {
        body: { apiVersion: '4.0.x' },
        method: 'POST',
        path: '/internal/products/rules'
      },
      {
        body: { apiVersion: '4.0.x' },
        method: 'POST',
        path: '/internal/products'
      }
    ];
    testScenarios.forEach((ts) => {
      it(`should receive ${ts.method} request from ${ts.path} and throw
            invalid api version when apiVersion is other than 4.0.1`, (done: any) => {
        const method = ts.method.toLowerCase();
        const errObj = {
          data: null,
          metadata: { message: 'Method not allowed' }
        };
        chai
          .request(app)
          [method](ts.path)
          .send(ts.body)
          .then((res: any) => {
            expect(res.status).to.equal(405);
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
  it(`should receive PUT request from /internal/products/:id and delegate
    it to productv4controller`, (done: any) => {
    const productV4ControllerMock = sinon
      .stub(productV4Controller, 'handleOAUpdate')
      .callsFake(successResponder);
    chai
      .request(app)
      .put('/internal/products/id')
      .send({ action: 'oaUpdate', apiVersion: '4.0.1' })
      .then((res: any) => {
        expect(res.status).to.equal(200);
        productV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        done(err);
      });
  });
  it(`should receive POST request from /products/rules and delegate
        it to productV4Controller`, (done: any) => {
    const productV4ControllerMock = sinon
      .stub(productV4Controller, 'handleRuleString')
      .callsFake(successResponder);
    chai
      .request(app)
      .post('/internal/products/rules')
      .send({ apiVersion: '4.0.1' })
      .then((res: any) => {
        expect(res.status).to.equal(200);
        productV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        done(err);
      });
  });
  it(`should receive POST request from /products and delegate
        it to productV4Controller`, (done: any) => {
    const productV4ControllerMock = sinon
      .stub(productV4Controller, 'handlePostProductInternal')
      .callsFake(acceptedResponder);
    chai
      .request(app)
      .post('/internal/products')
      .send({ apiVersion: '4.0.1' })
      .then((res: any) => {
        expect(res.status).to.equal(202);
        productV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        done(err);
      });
  });
});
