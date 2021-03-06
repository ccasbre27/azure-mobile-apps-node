// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
/* Not including this in documentation of the public API
@module azure-mobile-apps/express/tables/attachRoutes
@description
This module takes a table configuration object generated by the {@link module:azure-mobile-apps/express/tables/table table module}
and adds appropriate routes for each HTTP verb to a provided express router.
*/

var parseQuery = require('../middleware/parseQuery'),
    parseItem = require('../middleware/parseItem'),
    createQuery = require('../middleware/createQuery'),
    authorize = require('../middleware/authorize'),
    notAllowed = require('../middleware/notAllowed'),
    nextLink = require('../middleware/nextLink'),
    eTag = require('../middleware/eTag'),
    importDefinition = require('../../configuration/importDefinition');

/* Creates an express router with appropriate routes configures for each HTTP verb.
@param {module:azure-mobile-apps/express/tables/table} table Table configuration object.
@returns An express router with routes configured.
*/
module.exports = function (table) {
    var defaultRoute = '/',
        idRoute = '/:id',
        router = table.execute;

    configureOperation('read', 'get', [defaultRoute], [parseQuery(table)], [nextLink]);
    configureOperation('read', 'get', [idRoute], [parseQuery(table)], [eTag]);
    configureOperation('insert', 'post', [defaultRoute], [parseItem(table)], [eTag]);
    configureOperation('undelete', 'post', [idRoute], [parseQuery(table)], [eTag]);
    configureOperation('update', 'patch', [defaultRoute, idRoute], [parseItem(table), createQuery(table)], [eTag]);
    configureOperation('delete', 'delete', [defaultRoute, idRoute], [parseQuery(table)], [eTag]);

    // Return table middleware configured by the user (set on the middleware.execute property by the table module).
    // If none has been provided, just return the router we configured
    return !table.middleware.execute || table.middleware.execute.length === 0
        ? [router]
        : table.middleware.execute;

    // attach middleware for the specified operation to the appropriate routes
    function configureOperation(operation, verb, routes, pre, post) {
        var middleware = buildOperationMiddleware(operation, pre, post);

        routes.forEach(function (route) {
            router[verb](route, middleware);
        });
    }

    function buildOperationMiddleware(operation, pre, post) {
        importDefinition.setAccess(table, operation);

        // return 405 not allowed for disabled operations
        if (table[operation].disable) {
            return notAllowed(operation);
        }

        // if no middleware has been configured for the specific operation, just use the executeOperation middleware
        var middleware = table.middleware[operation] || [table.operation];

        // hook up the authorize middleware if specified
        if (table[operation].authorize) middleware.unshift(authorize);

        // add required internal middleware, e.g. parseItem, parseQuery
        if (pre) middleware.unshift.apply(middleware, pre);
        if (post) middleware.push.apply(middleware, post);

        return middleware;
    }
};
