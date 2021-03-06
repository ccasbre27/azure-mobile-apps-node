// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var errors = require('../../utilities/errors');

module.exports = function (configuration) {
    return function (req, res, next) {
        var single = req.method === 'GET' && req.azureMobile.query && req.azureMobile.query.single,
            successStatus = req.method === 'POST' ? 201 : 200;

        preventCaching();

        if(resultFound())
            res.status(successStatus).json(formatResultsForClient());
        else
            next(errors.notFound());

        function preventCaching() {
            // this is very nasty, but the simplest way I can find to circumvent the default express/fresh behaviour for 304s
            req.headers['if-modified-since'] = undefined;
            req.headers['if-none-match'] = undefined;
            res.set('cache-control', 'no-cache');
            res.set('expires', 0);
            res.set('pragma', 'no-cache');
        }

        function resultFound() {
            if(single && res.results.constructor === Array)
                return res.results.length > 0;
            return !!(res.results);
        }

        function formatResultsForClient() {
            if(single && res.results.constructor === Array)
                return res.results[0];

            if(res.results.constructor === Array && res.results.hasOwnProperty('totalCount'))
                return {
                    results: res.results,
                    count: res.results.totalCount
                };

            return res.results;
        }
    };
};
