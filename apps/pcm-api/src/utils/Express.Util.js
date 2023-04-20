"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unless = void 0;
// This is an express internal dependency.
// No need to include in package.
var pathToRegexp = require("path-to-regexp");
/**
 * This method is used to exclude some of the routes from express middleware
 * It takes n number of paths, 1st argument should be express middleware
 * If the paths DOES NOT match to the incoming request path
 * then only the middleware is applied else middleware is ignored.
 * @middleware any
 * @pathsToExclude string[] list of all the paths to exclude the middleware
 *
 */
function unless(middleware) {
    var pathsToExclude = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        pathsToExclude[_i - 1] = arguments[_i];
    }
    return function (req, res, next) {
        var ignoreMiddleware = pathsToExclude.some(function (path) {
            return pathToRegexp(path).exec(req.originalUrl.split('?')[0]);
        });
        ignoreMiddleware ? next() : middleware(req, res, next);
    };
}
exports.unless = unless;
