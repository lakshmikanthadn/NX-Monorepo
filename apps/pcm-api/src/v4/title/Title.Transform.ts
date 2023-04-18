import Logger from '../../utils/LoggerUtil';

import {
  IBookVariant,
  IBookVariantIdentifiers,
  IBookVariantMeta,
  IUnwindedTitle
} from './Title.Model';

const log = Logger.getLogger('TitleTransform');

class TitleTransform {
  /**
   * This method Transforms the unwinded title in to a Book Variant
   * @param unwindedTitle
   */
  public unwindedTitleToVariant(unwindedTitle: IUnwindedTitle): IBookVariant {
    const editions = unwindedTitle.editions;
    const formats = editions.formats;
    const identifiers: IBookVariantIdentifiers = {
      dacKey: editions.dacKey,
      doi: editions.doi,
      isbn: formats.isbn,
      isbn10: formats.isbn10
    };
    const book: IBookVariantMeta = {
      edition: editions.edition,
      format: formats.format,
      publisherImprint: unwindedTitle.publisherImprint,
      status: formats.status
    };
    return {
      _id: formats.bookId,
      book,
      identifiers,
      title: unwindedTitle.title,
      type: 'book',
      version: null // Set to null as we do not have any value to et for version.
    };
  }
}

export const titleTransform = new TitleTransform();
