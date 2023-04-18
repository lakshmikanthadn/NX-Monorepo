import Logger from '../../utils/LoggerUtil';
import esClient from '../../v4/utils/ESConnectionUtils';

const log = Logger.getLogger('PartsV410DAO');
interface IPartsQueryData {
  ids: string[];
  partTypeToIndex: string;
  projections: string[];
  limit: number;
  region?: string;
  searchTerm?: string;
  sortOrder?: string;
  offsetCursor?: string;
}
class PartsV410DAO {
  public async getPartsDataByRegion(
    partsQueryData: IPartsQueryData
  ): Promise<any> {
    const {
      ids,
      partTypeToIndex,
      projections,
      limit,
      sortOrder,
      offsetCursor,
      region,
      searchTerm
    } = partsQueryData;
    log.debug(
      `getPartsDataByRegion:: `,
      JSON.stringify({
        ids,
        limit,
        offsetCursor,
        partTypeToIndex,
        projections,
        region,
        searchTerm
      })
    );
    const query = {
      bool: {
        filter: [
          {
            terms: {
              _id: ids
            }
          }
        ]
      }
    };
    if (region) {
      query.bool['must_not'] = [
        {
          nested: {
            path: 'rights',
            query: {
              bool: {
                filter: [{ match: { 'rights.iso3.keyword': region } }]
              }
            }
          }
        }
      ];
    }
    if (searchTerm) {
      query.bool['must'] = [
        {
          bool: {
            should: [
              {
                nested: {
                  path: 'contributors',
                  query: {
                    bool: {
                      must: [
                        {
                          multi_match: {
                            fields: ['contributors.fullName'],
                            query: searchTerm
                          }
                        }
                      ]
                    }
                  }
                }
              },
              {
                multi_match: {
                  fields: [
                    'title',
                    'identifiers.doi',
                    'identifiers.isbn',
                    'book.publisherImprint'
                  ],
                  query: searchTerm
                }
              }
            ]
          }
        }
      ];
    }
    const clientReqBody = {
      _source: projections,
      body: {
        query: query
      },
      index: partTypeToIndex,
      size: limit
    };
    if (sortOrder) {
      clientReqBody.body['sort'] = [
        {
          _score: sortOrder,
          'tieBreakerId.keyword': sortOrder
        }
      ];
    }
    const searchAfterParams =
      offsetCursor &&
      offsetCursor !== 'last-page-cursor' &&
      offsetCursor.split('_');
    if (offsetCursor && offsetCursor !== 'last-page-cursor') {
      clientReqBody.body['search_after'] = searchAfterParams;
    }
    const { body } = await esClient.search(clientReqBody);
    return {
      searchData: body.hits.hits,
      searchTotalCount: body.hits.total.value
    };
  }
}
export const partsV410DAO = new PartsV410DAO();
