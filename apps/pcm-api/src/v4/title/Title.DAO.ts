import { StorageModel, MongooseSchema } from '@tandfgroup/pcm-entity-model-v4';
import { get as _get } from 'lodash';
import * as mongoose from 'mongoose';
import Logger from '../../utils/LoggerUtil';

import { Config } from '../../config/config';
import { AppConstants } from '../../config/constant';
import { AppError } from '../../model/AppError';
import {
  IBookVariant,
  IFetchVariantFilters,
  IFetchVariantsResponseBody as IVariantsInfo,
  IUnwindedTitle
} from './Title.Model';
import { titleTransform } from './Title.Transform';

const log = Logger.getLogger('TitleDAO');
const docTypeToCollectionMapping = Config.getPropertyValue(
  'docTypeToCollectionMapping'
);
const titlesQueryMapping = AppConstants.titlesQueryMapping;
type TitleDoc = mongoose.Document & StorageModel.TitleMetaData;

class TitleDAO {
  public model: mongoose.Model<any>;
  constructor() {
    this.model = mongoose.model<TitleDoc>(
      'Title',
      MongooseSchema.Title,
      docTypeToCollectionMapping.title
    );
  }
  /**
   * This method returns the Book Variants data based on the input id.
   * @param idName
   * @param idValues
   * @param filters
   */
  public async getProductVariantsByIds(
    idName: string,
    idValues: string[],
    filters: IFetchVariantFilters
  ): Promise<IVariantsInfo[]> {
    log.debug(`getProductVariantsByIds:: `, { filters, idName, idValues });
    // Prepare the query to get unwinded titles
    const identifierPath = titlesQueryMapping[idName];
    const aggQuery = this._getAggregateQuery(identifierPath, idValues, filters);
    return this.model
      .aggregate(aggQuery)
      .exec()
      .then(
        (results: Array<{ _id: string; unwindedTitles: IUnwindedTitle[] }>) => {
          if (results.length === 0) {
            throw new AppError('Variants not found.', 404);
          }
          const variantsInfo: IVariantsInfo[] = [];
          results.forEach((result) => {
            variantsInfo.push(
              ...this._filterTransformAndStitch(
                result,
                idValues,
                idName,
                filters
              )
            );
          });
          return variantsInfo;
        }
      )
      .catch((err) => {
        throw err;
      });
  }
  /**
   * This method prepares a aggregate query for the titles API.
   * Step 1: Add $match stage for identifier query.
   * then unwind all editions.
   * Step 2: Add the $projection stage if we need to get only the editions Of the input id
   * Step 3: add $unwind stage for editions.formats and editions,
   *  So that we don't need think of using $eleMatch for additional filters (if any).
   * Step 4: Addtional filters can be applied here but inorder to find out
   *  inputidentifer we need to apply filter outside aggragation.
   * Last Stage: #group all the books back to its title.
   * @param identifierPath
   * @param idValues
   * @param filters
   */
  private _getAggregateQuery(
    identifierPath: string,
    idValues: string[],
    filters: IFetchVariantFilters
  ): object[] {
    log.debug(`_getAggregateQuery:: `, { filters, idValues, identifierPath });
    // Step 1
    const query = {};
    query[identifierPath] = { $in: idValues };
    const aggQuery = [];
    aggQuery.push({ $match: query });
    aggQuery.push({ $unwind: '$editions' });
    // Step 2
    if (!filters.includeEditions) {
      // Push the query once again after unwonding editions
      // so it filters only the editions in which given id is exists.
      aggQuery.push({ $match: query });
    }
    // Step 3
    aggQuery.push({ $unwind: '$editions.formats' });
    // Last Step
    if (!filters.includeEditions) {
      // Need this check when two input isbns(identifiers)
      // matching same title but different edition.
      aggQuery.push({
        $group: {
          _id: { edition: '$editions.edition', titleId: '$_id' },
          unwindedTitles: { $push: '$$ROOT' }
        }
      });
    } else {
      aggQuery.push({
        $group: { _id: '$_id', unwindedTitles: { $push: '$$ROOT' } }
      });
    }
    log.debug('_getAggregateQuery:: ', { aggQuery: JSON.stringify(aggQuery) });
    return aggQuery;
  }
  /**
   * This method will
   * 1. Find outs the input indetifier from aggragator result
   * 2. Apply the filter. If passed through filter then
   *    - transform the title to book variant
   *    - stitch it with its input identifer
   * @param aggTitleResults the outcome of the aggregator query
   * @param idValues all the input identifers
   * @param idName identifier name
   */
  private _filterTransformAndStitch(
    titlesObject: { _id: string; unwindedTitles: IUnwindedTitle[] },
    idValues: string[],
    idName: string,
    filters: IFetchVariantFilters
  ): IVariantsInfo[] {
    log.debug(`_filterTransformAndStitch:: `, { idName, idValues });
    const identifierPath = titlesQueryMapping[idName];
    const inputIdentifiers: string[] = [];
    const variants = [];
    // Transformation and Stitching begins here
    titlesObject.unwindedTitles.forEach((unwindedTitle: IUnwindedTitle) => {
      const currIdentifier = _get(unwindedTitle, identifierPath, undefined);
      if (
        idValues.includes(currIdentifier) &&
        !inputIdentifiers.includes(currIdentifier)
      ) {
        inputIdentifiers.push(currIdentifier);
      }
      // Derive the include flag based on the filters need to be applied.
      const includeThisProduct =
        !filters.formats ||
        filters.formats.includes(unwindedTitle.editions.formats.format);
      // transform and push if this product has to be included.
      if (includeThisProduct) {
        const bookVariant: IBookVariant =
          titleTransform.unwindedTitleToVariant(unwindedTitle);
        variants.push(bookVariant);
      }
    });
    return inputIdentifiers.map((inputIdentifierValue) => {
      return {
        identifier: { name: idName, value: inputIdentifierValue },
        variants
      };
    });
  }
}
// This module exports only one instance of the titleDao instead of exporting the class.
export const titleDao = new TitleDAO();
