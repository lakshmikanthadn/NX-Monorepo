import { expect } from 'chai';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import * as sinon from 'sinon';
import app from '../../test/test-app';

import { productV4Controller } from '../v4/products/ProductV4.Controller';
import { taxonomyRouter } from './TaxonomyRouter';

const successResponder = (req, res) => res.status(200).send('success');

chai.use(chaiHttp);

app.use('/taxonomy', taxonomyRouter.getRoutes());

describe('taxonomy router', () => {
  it(`should receive GET request from /taxonomy and delegate
    it to productv4controller`, (done: any) => {
    const productV4ControllerMock = sinon
      .stub(productV4Controller, 'getTaxonomyClassifications')
      .callsFake(successResponder);
    chai
      .request(app)
      .get('/taxonomy')
      .query({
        apiVersion: '4.0.1',
        classificationFamily: 'rom',
        code: 'sub_1'
      })
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
  it(`should receive receive GET request from /taxonomy and throw invalid api version
        when apiVersion is other than 4.0.1`, (done: any) => {
    const errObj = {
      data: null,
      metadata: { message: 'Invalid API Version: 4.0.x' }
    };
    chai
      .request(app)
      .get('/taxonomy')
      .query({
        apiVersion: '4.0.x',
        classificationFamily: 'rom',
        code: 'sub_1'
      })
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
