var router = require("express").Router();

var inventoryName = require('../config').tableName;
var flashUtils = require('../utils/flashUtils');

module.exports = function(pool) {
    router.get("/:name", function(req, res) {
        pool.getConnection(function(err, conn) {
            if (flashUtils.isDatabaseError(req, res, '/', err)) {
                conn.release();
                return;
            }

            var itemName = req.params.name;

            var q = "DELETE FROM " + inventoryName + " WHERE name=?";
            conn.query(q, itemName, function(err, results) {
                conn.release();
                if (flashUtils.isDatabaseError(req, res, '/', err))
                    return;
                flashUtils.successMessage(req, res, '/', 'You\'ve deleted ' + itemName + ' from your inventory!');
            });
        });
    });
    return router;
}
