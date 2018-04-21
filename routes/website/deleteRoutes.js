var router = require("express").Router();

var flashUtils = require('../utils/flashUtils');

// URL: "/delete"
module.exports = function(pool) {

    // Delete's the item with the name in the param
    router.get("/:name", function(req, res) {
        pool.getConnection(function(err, connection) {
            if (flashUtils.isDatabaseError(req, res, '/', err)) {
                connection.release();
                return;
            }

            var itemName = req.params.name;

            var deleteItem = require("./queries/deleteItem.sql");

            connection.query(deleteItem, [itemName], function(err, results) {
                connection.release();

                if (flashUtils.isDatabaseError(req, res, '/', err))
                    return;

                flashUtils.successMessage(req, res, '/', 'You\'ve deleted ' + itemName + ' from your inventory!');
            });
        });
    });
    
    return router;
}
