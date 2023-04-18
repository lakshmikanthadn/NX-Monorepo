import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import * as sinon from 'sinon';

import app from '../../test/test-app';

import { healthRouter } from './HealthRouter';

chai.use(chaiHttp);
app.use('/', healthRouter.getRoutes());

describe('HealthRouter', () => {
  it(`should receive GET /health`, (done) => {
    const healthRouterStub = sinon
      .stub(healthRouter, 'checkConnection')
      .resolves({ name: 'cluster-name', status: 'green' });
    chai
      .request(app)
      .get('/health')
      .then((res: any) => {
        expect(res.status).to.equal(200);
        expect(JSON.parse(res.text)).to.deep.equal({
          APPLICATION_STATUS: 'I am healthy.'
        });
        healthRouterStub.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        healthRouterStub.restore();
        done(err);
      });
  });
  it(`should receive GET /products/search/health`, (done: any) => {
    const healthRouterStub = sinon
      .stub(healthRouter, 'checkConnection')
      .resolves({ name: 'cluster-name', status: 'green' });
    chai
      .request(app)
      .get('/products/search/health')
      .then((res: any) => {
        expect(res.status).to.equal(200);
        healthRouterStub.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        healthRouterStub.restore();
        done(err);
      });
  });
  it(`should receive GET /products/search/health`, (done: any) => {
    const errObj = {
      APPLICATION_STATUS: 'Unhealthy, not connected to Elasticsearch.'
    };
    const healthRouterStub = sinon
      .stub(healthRouter, 'checkConnection')
      .rejects(new Error('Something went wrong'));
    chai
      .request(app)
      .get('/products/search/health')
      .then((res: any) => {
        expect(res.status).to.equal(503);
        expect(JSON.parse(res.text)).to.deep.equal(errObj);
        healthRouterStub.restore();
        done();
      })
      .catch((err) => {
        healthRouterStub.restore();
        done(err);
      });
  });
  it(`should receive GET /health`, (done: any) => {
    const errObj = {
      APPLICATION_STATUS: 'Unhealthy, not connected to Elasticsearch.'
    };
    const healthRouterStub = sinon
      .stub(healthRouter, 'checkConnection')
      .rejects(new Error('Something went wrong'));
    chai
      .request(app)
      .get('/health')
      .then((res: any) => {
        expect(res.status).to.equal(503);
        expect(JSON.parse(res.text)).to.deep.equal(errObj);
        healthRouterStub.restore();
        done();
      })
      .catch((err) => {
        healthRouterStub.restore();
        done(err);
      });
  });
  it(`should receive GET /products/swagger/4.0.1`, (done: any) => {
    chai
      .request(app)
      .get('/products/search/swagger/4.0.1')
      .then((res: any) => {
        expect(res.status).to.equal(200);
        done();
      })
      .catch((err) => {
        console.log(err);
        done(err);
      });
  });
});
