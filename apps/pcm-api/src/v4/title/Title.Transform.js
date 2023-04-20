"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.titleTransform = void 0;
var LoggerUtil_1 = require("../../utils/LoggerUtil");
var log = LoggerUtil_1.default.getLogger('TitleTransform');
var TitleTransform = /** @class */ (function () {
    function TitleTransform() {
    }
    /**
     * This method Transforms the unwinded title in to a Book Variant
     * @param unwindedTitle
     */
    TitleTransform.prototype.unwindedTitleToVariant = function (unwindedTitle) {
        var editions = unwindedTitle.editions;
        var formats = editions.formats;
        var identifiers = {
            dacKey: editions.dacKey,
            doi: editions.doi,
            isbn: formats.isbn,
            isbn10: formats.isbn10
        };
        var book = {
            edition: editions.edition,
            format: formats.format,
            publisherImprint: unwindedTitle.publisherImprint,
            status: formats.status
        };
        return {
            _id: formats.bookId,
            book: book,
            identifiers: identifiers,
            title: unwindedTitle.title,
            type: 'book',
            version: null // Set to null as we do not have any value to et for version.
        };
    };
    return TitleTransform;
}());
exports.titleTransform = new TitleTransform();
