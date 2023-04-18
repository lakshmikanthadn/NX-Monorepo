import Logger from '../../utils/LoggerUtil';
import { collectionsRevisionV4DAO } from './CollectionsRevisionV4.DAO';

const log = Logger.getLogger('collectionV4Service');

class CollectionRevisionV4Service {
  public async getCollectionRevisionData(
    id: string,
    versions?: string[],
    projectionFields?: string[]
  ): Promise<any> {
    log.debug('getCollectionRevisionData:: ', {
      id,
      projectionFields,
      versions
    });
    return collectionsRevisionV4DAO.getCollectionRevisionData(
      id,
      versions,
      projectionFields
    );
  }
}

export const collectionRevisionV4Service = new CollectionRevisionV4Service();
