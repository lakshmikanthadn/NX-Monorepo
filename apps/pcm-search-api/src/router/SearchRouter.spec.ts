import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import * as sinon from 'sinon';
import app from '../../test/test-app';

import { searchV4Controller } from '../v4/search/SearchV4Controller';
import { searchRouter } from './SearchRouter';

const successResponder = (req, res) => res.status(200).send('success');

chai.use(chaiHttp);

describe('SearchRouter', () => {
  it('should have same number of router when we invoke getRoutes 2 times', () => {
    const routesCount1 = searchRouter.getRoutes().stack.length;
    const routesCount2 = searchRouter.getRoutes().stack.length;
    expect(routesCount1).to.equal(routesCount2);
  });
  app.use('/products', searchRouter.getRoutes());
  describe('InvalidAPIVersionError', () => {
    const testScenarios = [
      {
        body: { apiVersion: '4.0.x' },
        method: 'POST',
        path: '/products/search'
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

  it(`should receive POST request from /products and delegate it to searchV4Controller
        when action is search and apiVersion is 4.0.1`, (done: any) => {
    const searchV4ControllerMock = sinon
      .stub(searchV4Controller, 'handlePostProduct')
      .callsFake(successResponder);
    chai
      .request(app)
      .post('/products/search')
      .send({ action: 'query', apiVersion: '4.0.1' })
      .then((res: any) => {
        expect(res.status).to.equal(200);
        searchV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        searchV4ControllerMock.restore();
        done(err);
      });
  });
  it(`should receive POST request from /products/search and delegate it to searchV4Controller
        when action is save and apiVersion is 4.0.1`, (done: any) => {
    const searchV4ControllerMock = sinon
      .stub(searchV4Controller, 'handlePostProduct')
      .callsFake(successResponder);
    chai
      .request(app)
      .post('/products/search')
      .send({ action: 'count', apiVersion: '4.0.1' })
      .then((res: any) => {
        expect(res.status).to.equal(200);
        searchV4ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        searchV4ControllerMock.restore();
        done(err);
      });
  });
});
