import { StorageModel as SM } from '@tandfgroup/pcm-entity-model-v4';

import { AppConstants } from '../../config/constant';

type bookChapterSetMeta = SM.BookMetaData | SM.ChapterMetaData | SM.SetMetaData;

class ProductTransform {
  public transform(product: any) {
    if (!product) {
      throw new Error('Invalid product.');
    }
    let tempProduct = {
      _id: product._id,
      searchAfterParams: product.sort,
      ...product._source
    };

    tempProduct = this._removePrivateProperties(tempProduct);
    tempProduct = this._transformFirstPublishedYear(tempProduct);
    return tempProduct;
  }

  /**
   * This method removes all the private properties of the product.
   * @param product StoreProduct
   */
  private _removePrivateProperties(product: SM.Product): SM.Product {
    // This is o remove the private properties of the product.
    delete product._schemaVersion;
    delete product._sources;
    delete product._modifiedDate;
    delete product._createdDate;
    delete product._isSellable;
    return product;
  }

  /**
   * This is to transform the firstPublishedYear property from NUMBER to STRING DATA type.
   * We have introduced firstPublishedYearNumber as a temporary field in the DB.
   * We will remove once we change the firstPublishedYear to number.
   * This is applicable only for book chapter and set
   */
  private _transformFirstPublishedYear(product: SM.Product): SM.Product {
    const productType = this.getProductType(product);
    if (
      ['book', 'chapter', 'set'].includes(productType) &&
      product[productType]
    ) {
      const productMeta: bookChapterSetMeta = product[
        productType
      ] as bookChapterSetMeta;
      productMeta.firstPublishedYear = productMeta.firstPublishedYear
        ? (productMeta.firstPublishedYear.toString() as any)
        : productMeta.firstPublishedYear;
      delete productMeta.firstPublishedYearNumber;
    }
    return product;
  }
  /**
   * This method returns productType based on the type
   * or based the property of a specific product type.
   * @param product Product
   */
  private getProductType(product: SM.Product): SM.ProductType {
    return (
      product.type ||
      (Object.keys(product).find((key) =>
        AppConstants.ProductTypesV4.includes(key)
      ) as SM.ProductType)
    );
  }
}

export const productTransform = new ProductTransform();
