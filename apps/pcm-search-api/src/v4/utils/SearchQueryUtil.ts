import { StorageModel } from '@tandfgroup/pcm-entity-model-v4';
import { GroupedSearchQuery } from '@tandfgroup/pcm-rules-parser';
import * as moment from 'moment';

import { AppError } from '../../model/AppError';
import { esQueryParser } from '../../utils/QueryParser';

class SearchQueryUtil {
  public getQueryForRulesProductsQuery(
    productType: StorageModel.ProductType,
    rules: any
  ) {
    let query;
    try {
      query = esQueryParser.parse([{ rules, type: productType }]);
    } catch (e) {
      throw new AppError(e.message, 400);
    }
    return query[0].rules;
  }

  public getRulesStringFromSearchQuery(
    searchQuery: GroupedSearchQuery[]
  ): GroupedSearchQuery[] {
    return searchQuery.map((sq) => {
      sq.rulesString = JSON.stringify(
        this.getQueryForRulesProductsQuery(
          sq.type as StorageModel.ProductType,
          sq.rules
        ),
        this.replacer
      );
      sq.rulesString = sq.rulesString.replace(/"ISODate\(/g, 'ISODate("');
      sq.rulesString = sq.rulesString.replace(/Z\)"/g, 'Z")');
      return sq;
    });
  }

  public replacer = (key, value) => {
    if (moment(value, 'YYYY-MM-DDTHH:mm:ss.sssZ', true).isValid()) {
      return 'ISODate(' + value + ')';
    }
    return value;
  };
}

export const searchQueryUtil = new SearchQueryUtil();
