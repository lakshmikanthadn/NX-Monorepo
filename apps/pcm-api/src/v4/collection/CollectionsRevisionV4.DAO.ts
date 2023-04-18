import { MongooseSchema, StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import * as mongoose from 'mongoose';
import Logger from '../../utils/LoggerUtil';

import { Config } from '../../config/config';

const log = Logger.getLogger('CollectionRevisionDAO');
type CollectionRevisionsType = StorageModel.CollectionsRevision &
  mongoose.Document;
const docTypeToCollectionMapperV4 = Config.getPropertyValue(
  'docTypeToCollectionMapperV4'
);

class CollectionsRevisionV4DAO {
  public model: mongoose.Model<CollectionRevisionsType>;

  constructor() {
    const collectionName = docTypeToCollectionMapperV4.collectionrevision;
    this.model = mongoose.model(
      'CollectionsRevisionV4',
      MongooseSchema.CollectionRevision,
      collectionName
    );
  }
  /**
   * This method returns collection revision data for a given collection version.
   * If collection version is not specified,
   * then it defualts to the latest revision of the collection.
   * @param {string} collectionId uuid of the part (collection uuid).
   * @param {string} collectionVersion version of the part (collection version).
   * @param {string[]} projectionFields choose the fields to be returned from collection-revision table.
   */
  public async getCollectionRevisionData(
    collectionId: string,
    collectionVersions?: string[],
    projectionFields?: string[]
  ): Promise<any> {
    log.debug(`getCollectionRevisionData:: `, {
      collectionId,
      collectionVersions,
      projectionFields
    });
    const query = { parentId: collectionId };
    if (collectionVersions?.length) {
      query['version'] = { $in: collectionVersions };
    }
    const projection = {};
    projectionFields.forEach((property) => {
      projection[property] = 1;
    });
    return this.model
      .find(query, projection)
      .lean()
      .exec()
      .catch((_error: Error) => {
        return Promise.reject(
          'We are unable to find revision data for this collection.'
        );
      });
  }
}
export const collectionsRevisionV4DAO = new CollectionsRevisionV4DAO();
