import { StorageModel as SM } from '@tandfgroup/pcm-entity-model-v4';

class PreProductTransform {
  public transform(preProduct: SM.Product) {
    if (!preProduct) {
      throw new Error('Invalid preProduct.');
    }
    preProduct = this._removePrivateProperties(preProduct);
    return preProduct;
  }

  /**
   * This method removes all the private properties of the preProduct.
   * @param preProduct StorePreProduct
   */
  private _removePrivateProperties(preProduct: SM.Product): SM.Product {
    // This is to remove the private properties of the product.
    delete preProduct._schemaVersion;
    delete preProduct._sources;
    delete preProduct._modifiedDate;
    delete preProduct._createdDate;
    delete preProduct._isSellable;
    return preProduct;
  }
}

export const preProductTransform = new PreProductTransform();
