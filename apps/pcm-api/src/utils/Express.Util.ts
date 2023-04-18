// This is an express internal dependency.
// No need to include in package.
import * as pathToRegexp from 'path-to-regexp';

/**
 * This method is used to exclude some of the routes from express middleware
 * It takes n number of paths, 1st argument should be express middleware
 * If the paths DOES NOT match to the incoming request path
 * then only the middleware is applied else middleware is ignored.
 * @middleware any
 * @pathsToExclude string[] list of all the paths to exclude the middleware
 *
 */
export function unless(middleware: any, ...pathsToExclude: string[]) {
  return (req, res, next) => {
    const ignoreMiddleware = pathsToExclude.some((path) =>
      pathToRegexp(path).exec(req.originalUrl.split('?')[0])
    );
    ignoreMiddleware ? next() : middleware(req, res, next);
  };
}
