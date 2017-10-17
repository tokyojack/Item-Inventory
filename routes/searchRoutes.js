var router = require("express").Router();
var Scraper = require('images-scraper');
var bing = new Scraper.Bing();

var inventoryName = require('../config').tableName;
var flashUtils = require('../utils/flashUtils');

module.exports = function(pool) {

    router.get("/:search", function(req, res) {
        pool.getConnection(function(err, conn) {
            if (flashUtils.isDatabaseError(req, res, '/', err)) {
                conn.release();
                return;
            }

            var search = req.params.search;

            var q = "SELECT * FROM " + inventoryName + " AS inventory WHERE name=?";
            conn.query(q, search, function(err, results) {
                conn.release();
                if (flashUtils.isDatabaseError(req, res, '/', err))
                    return;

                if (results.length >= 1) {
                    var itemsProcessed = 0;

                    var finals = [];
                    var images = new Object();

                    results.forEach(function(item, index, array) {
                        bing.list({
                                keyword: item.name,
                                num: 1,
                                detail: true
                            })
                            .then(function(result) {

                                finals.push(result[0].url);
                                images[item.name] = result[0].url;
                                itemsProcessed++;

                                if (itemsProcessed === array.length) {
                                    res.render("index.ejs", { inventory: results, images: images, success: 'You\'ve searched up ' + search });
                                }
                            });
                    });

                }
                else
                    res.render("index.ejs", { inventory: [], images: [] });
            });
        });
    });
    return router;
}
