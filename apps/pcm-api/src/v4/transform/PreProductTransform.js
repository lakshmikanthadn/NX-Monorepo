"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preProductTransform = void 0;
var PreProductTransform = /** @class */ (function () {
    function PreProductTransform() {
    }
    PreProductTransform.prototype.transform = function (preProduct) {
        if (!preProduct) {
            throw new Error('Invalid preProduct.');
        }
        preProduct = this._removePrivateProperties(preProduct);
        return preProduct;
    };
    /**
     * This method removes all the private properties of the preProduct.
     * @param preProduct StorePreProduct
     */
    PreProductTransform.prototype._removePrivateProperties = function (preProduct) {
        // This is to remove the private properties of the product.
        delete preProduct._schemaVersion;
        delete preProduct._sources;
        delete preProduct._modifiedDate;
        delete preProduct._createdDate;
        delete preProduct._isSellable;
        return preProduct;
    };
    return PreProductTransform;
}());
exports.preProductTransform = new PreProductTransform();
