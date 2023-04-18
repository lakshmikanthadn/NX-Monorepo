import { MongooseSchema } from '@tandfgroup/pcm-entity-model-v4';
import { expect } from 'chai';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';

import { journalPublishingServiceMapData } from '../test/data/JournalPublishingServiceMapV4';
import { journalPublishingServiceMapV4DAO } from './JournalPubServiceMap.Dao';

describe('JournalPublishingServiceMapV4DAO', () => {
  let mongoServer;
  before(async () => {
    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getConnectionString();
    await mongoose
      .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => {
        console.log('Connection to Test MongoDB is success.');
      })
      .catch((err) => {
        console.log('Connection to Test MongoDB is failed.', err);
      });
    const JournalPublishingServiceMap = mongoose.model(
      'JournalPublishingServiceMap',
      MongooseSchema.JournalPublishingServiceMap,
      'journalPublishingServiceMap-4.0.1'
    );
    await JournalPublishingServiceMap.insertMany(
      journalPublishingServiceMapData
    );
  });
  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should have all the methods', () => {
    expect(journalPublishingServiceMapV4DAO).to.respondTo(
      'getJournalPublishingServiceMapById'
    );
  });
  describe('getJournalPublishingServiceMapById', () => {
    it('should return Publishing Service valid id are passed', (done) => {
      const id = 'CCOS';
      journalPublishingServiceMapV4DAO
        .getJournalPublishingServiceMapById(id)
        .then((products) => {
          expect(products).to.be.an('array');
          expect(products.length).to.equal(1);
          expect(products[0]).to.have.property('publishingServices');
          expect(products[0].publishingServices.length).to.equal(2);
          expect(products[0].publishingServices[0]._id).to.be.equal(
            '40950323-665d-42e0-9756-9b613b029b07'
          );
          expect(products[0].publishingServices[1]._id).to.be.equal(
            '4553b399-4d49-4137-b0b4-fdcb9fec3657'
          );
          done();
        })
        .catch(done);
    });
    it(`should return Publishing Service valid id are passed along with classificationName and
      classificationType`, (done) => {
      const id = 'CCOS';
      const classificationName = 'Product Review';
      const classificationType = 'article-type';
      journalPublishingServiceMapV4DAO
        .getJournalPublishingServiceMapById(
          id,
          null,
          classificationName,
          classificationType
        )
        .then((products) => {
          expect(products).to.be.an('array');
          expect(products.length).to.equal(1);
          expect(products[0]).to.have.property('publishingServices');
          expect(products[0].publishingServices.length).to.equal(1);
          expect(products[0].publishingServices[0]._id).to.be.equal(
            '40950323-665d-42e0-9756-9b613b029b07'
          );
          done();
        })
        .catch(done);
    });
    it(`should return Publishing Service valid id are passed along with classificationName`, (done) => {
      const id = 'CCOS';
      const classificationName = 'Product Review';
      journalPublishingServiceMapV4DAO
        .getJournalPublishingServiceMapById(id, null, classificationName)
        .then((products) => {
          expect(products).to.be.an('array');
          expect(products.length).to.equal(1);
          expect(products[0]).to.have.property('publishingServices');
          expect(products[0].publishingServices.length).to.equal(1);
          expect(products[0].publishingServices[0]._id).to.be.equal(
            '40950323-665d-42e0-9756-9b613b029b07'
          );
          done();
        })
        .catch(done);
    });
    it(`should return Publishing Service valid id are passed along with
      classificationType`, (done) => {
      const id = 'CCOS';
      const classificationType = 'cats-article-type';
      journalPublishingServiceMapV4DAO
        .getJournalPublishingServiceMapById(id, null, null, classificationType)
        .then((products) => {
          expect(products).to.be.an('array');
          expect(products.length).to.equal(1);
          expect(products[0]).to.have.property('publishingServices');
          expect(products[0].publishingServices.length).to.equal(1);
          expect(products[0].publishingServices[0]._id).to.be.equal(
            '4553b399-4d49-4137-b0b4-fdcb9fec3657'
          );
          done();
        })
        .catch(done);
    });
  });
});
