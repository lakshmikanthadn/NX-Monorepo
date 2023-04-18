import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import * as sinon from 'sinon';
import app from '../../test/test-app';

import { contentV4Controller } from '../v4/content/ContentV4.Controller';
import { contentV410Controller } from '../v410/content/Content.V410.Controller';
import { contentRouter } from './ContentRouter';

const successResponder = (req, res) => res.status(200).send('success');

chai.use(chaiHttp);

app.use('/content', contentRouter.getRoutes());

describe('ContentRouter', () => {
  describe('InvalidAPIVersionError', () => {
    const testScenarios = [
      {
        method: 'GET',
        path: '/content',
        query: { apiVersion: '4.0.x' }
      },
      {
        method: 'GET',
        path: '/content/1234',
        query: { apiVersion: '4.0.x' }
      },
      {
        body: { apiVersion: '4.0.x' },
        method: 'POST',
        path: '/content'
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
  it(`should receive GET request from /content/id and delegate
     it to contentV4Controller when apiVersion query param is 4.0.1`, (done: any) => {
    const contentV4ControllerMock = sinon
      .stub(contentV4Controller, 'handleGetContentById')
      .callsFake(successResponder);
    chai
      .request(app)
      .get('/content/id')
      .query({ apiVersion: '4.0.1' })
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
  it(`should receive GET request from /content/id and delegate
    it to contentV4Controller when apiVersion query param is 4.01.0`, (done: any) => {
    const contentV410ControllerMock = sinon
      .stub(contentV410Controller, 'handleGetContentById')
      .callsFake(successResponder);
    chai
      .request(app)
      .get('/content/id')
      .query({ apiVersion: '4.1.0' })
      .then((res: any) => {
        expect(res.status).to.equal(200);
        contentV410ControllerMock.restore();
        done();
      })
      .catch((err) => {
        console.log(err);
        contentV410ControllerMock.restore();
        done(err);
      });
  });
  it(`should receive POST request from /content and delegate
    it to contentV4Controller`, (done: any) => {
    const contentV4ControllerMock = sinon
      .stub(contentV4Controller, 'createAssociatedMedia')
      .callsFake(successResponder);
    chai
      .request(app)
      .post('/content')
      .send({ apiVersion: '4.0.1' })
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
  it(`should receive GET request from /content/ and delegate
    it to contentV4Controller`, (done: any) => {
    const contentV4ControllerMock = sinon
      .stub(contentV4Controller, 'getContentByIdentifier')
      .callsFake(successResponder);
    chai
      .request(app)
      .get('/content/')
      .query({ apiVersion: '4.0.1' })
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
  it(`should receive GET request from /content/
        and throw invalid api version when apiVersion is other than 4.0.1`, (done: any) => {
    const errObj = {
      data: null,
      metadata: { message: 'Invalid API Version: 4.0.x' }
    };
    chai
      .request(app)
      .get('/content/')
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
});
