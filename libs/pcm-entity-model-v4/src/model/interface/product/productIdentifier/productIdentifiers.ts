export interface ProductIdentifiers {
  isbn?: string;
  dacKey?: string;
  editionId?: string;
  doi?: string;
  orderNumber?: string;
  titleId?: string;
  sku?: string;
  chapterId?: string;
  /**
   * @pattern ^[a-zA-Z0-9-]+$
   */
  collectionId?: string;
  businessId?: string;
  articleId?: string;
  articleSectionId?: string;
  productId?: string;
  code?: string;
  seriesCode?: string;
  journalId?: string;
  electronicIssn?: string;
  journalAcronym?: string;
  printIssn?: string;
  publishingServiceId?: string;
}
