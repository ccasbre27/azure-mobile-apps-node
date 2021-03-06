
# Azure App Service Mobile Apps backend with Custom API

This sample provides a template basic application for use with Azure App Service.  It defines
a single table with a static schema.  In addition, it provides a custom API at
/api/completeall that, when you call (with a GET), will set all tasks to be completed.

# Features

* Single Table (TodoItem) with Static Schema
* Custom API using a custom SQL statement

This project can be used with any of the client projects provided by the QuickStart blade under
your Web app in the [Azure Portal](https://portal.azure.com).


## How to query (SQL) data with your API
Without parameters
  ```js
module.exports = {
    "get": function (req, res, next) {
        
        // Define the query - anything that can be handled by the mssql
        var query = {
            sql: 'SELECT * FROM YOUR_TABLE'
        };
        
        // Execute the query
        req.azureMobile.data.execute(query)
        .then(function (results) {
            // send the results
            res.json(results);
        });
        
    }
}
  ```
With parameters
  ```js
module.exports = {
    "get": function (req, res, next) {
        
        // Define the query - anything that can be handled by the mssql
        var query = {
            sql: 'SELECT * YOUR_TABLE WHERE YOUR_FIELD=@your_parameter',
            parameters: [{
                your_parameter: someValue
            }]
        };
        // Execute the query
        req.azureMobile.data.execute(query)
        .then(function (results) {
            // send the results
            res.json(results);
        });
        
    }
}
  ```


# More Information

For more information, see the [Azure documentation](https://azure.microsoft.com/en-us/documentation/articles/app-service-mobile-node-backend-how-to-use-server-sdk/).
