import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';

import app from '../../test/test-app';

import { healthRouter } from './HealthRouter';

chai.use(chaiHttp);
app.use('/', healthRouter.getRoutes());

describe('HealthRouter', () => {
  it(`should receive GET /health`, async () => {
    const mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getConnectionString();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    await chai
      .request(app)
      .get('/health')
      .then(async (res: any) => {
        await mongoose.disconnect();
        await mongoServer.stop();
        expect(res.status).to.equal(200);
        return;
      });
  });
  it(`should receive GET /health and return 503 when not connected to mongo`, (done: any) => {
    chai
      .request(app)
      .get('/health')
      .then((res: any) => {
        expect(res.status).to.equal(503);
        done();
      })
      .catch((err) => {
        console.log(err);
        done(err);
      });
  });
  it(`should receive GET /products/health`, (done: any) => {
    chai
      .request(app)
      .get('/products/health')
      .then((res: any) => {
        expect(res.status).to.equal(200);
        done();
      })
      .catch((err) => {
        console.log(err);
        done(err);
      });
  });
  it(`should receive GET /products/swagger/4.0.1`, (done: any) => {
    chai
      .request(app)
      .get('/products/swagger/4.0.1')
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
