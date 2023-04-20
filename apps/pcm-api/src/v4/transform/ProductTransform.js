"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productTransform = void 0;
var constant_1 = require("../../config/constant");
var ProductTransform = /** @class */ (function () {
    function ProductTransform() {
    }
    ProductTransform.prototype.transform = function (product) {
        if (!product) {
            throw new Error('Invalid product.');
        }
        product = this._transformPrivateProperties(product);
        product = this._removePrivateProperties(product);
        product = this._transformFirstPublishedYear(product);
        return product;
    };
    /**
     * This method modifies the private properties of the product
     * and removes the underscore from the field names before sending response.
     * Currently, only _modifiedDate private property is permitted.
     * @param product StoreProduct
     */
    ProductTransform.prototype._transformPrivateProperties = function (product) {
        if (product._modifiedDate) {
            product.modifiedDate = product._modifiedDate;
        }
        delete product._modifiedDate;
        return product;
    };
    /**
     * This method removes all the private properties (except _modifiedDate) of the product.
     * @param product StoreProduct
     */
    ProductTransform.prototype._removePrivateProperties = function (product) {
        // This is o remove the private properties of the product.
        delete product._schemaVersion;
        delete product._sources;
        delete product._createdDate;
        delete product._isSellable;
        return product;
    };
    /**
     * This is to transform the firstPublishedYear property from NUMBER to STRING DATA type.
     * We have introduced firstPublishedYearNumber as a temporary field in the DB.
     * We will remove once we change the firstPublishedYear to number.
     * This is applicable only for book chapter and set
     */
    ProductTransform.prototype._transformFirstPublishedYear = function (product) {
        var productType = this.getProductType(product);
        if (['book', 'chapter', 'set'].includes(productType) &&
            product[productType]) {
            var productMeta = product[productType];
            productMeta.firstPublishedYear = productMeta.firstPublishedYear
                ? productMeta.firstPublishedYear.toString()
                : productMeta.firstPublishedYear;
            delete productMeta.firstPublishedYearNumber;
        }
        return product;
    };
    /**
     * This method returns productType based on the type
     * or based the property of a specific product type.
     * @param product Product
     */
    ProductTransform.prototype.getProductType = function (product) {
        return (product.type ||
            Object.keys(product).find(function (key) {
                return constant_1.AppConstants.ProductTypesV4.includes(key);
            }));
    };
    return ProductTransform;
}());
exports.productTransform = new ProductTransform();
