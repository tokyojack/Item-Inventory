var router = require("express").Router();
var Scraper = require('images-scraper');
var bing = new Scraper.Bing();

var inventoryName = require('../config').tableName;
var flashUtils = require('../utils/flashUtils');

// URL: "/search"
module.exports = function (pool) {

    // "index.ejs" page. Load's items with a specific name
    router.get("/:itemName", function (req, res) {
        pool.getConnection(function (err, connection) {
            if (flashUtils.isDatabaseError(req, res, '/', err)) {
                connection.release();
                return;
            }

            var itemName = req.params.itemName;

            var searchItemsByName = require("./queries/searchItemsByName.sql");

            connection.query(searchItemsByName, [itemName], function (err, results) {
                connection.release();
                if (flashUtils.isDatabaseError(req, res, '/', err))
                    return;

                if (results.length >= 1) {
                    var itemsProcessed = 0;

                    var finals = [];
                    var images = new Object();

                    results.forEach(function (item, index, array) {
                        bing.list({
                                keyword: item.name,
                                num: 1,
                                detail: true
                            })
                            .then(function (result) {

                                finals.push(result[0].url);
                                images[item.name] = result[0].url;
                                itemsProcessed++;

                                if (itemsProcessed === array.length) {
                                    res.render("index.ejs", {
                                        inventory: results,
                                        images: images,
                                        success: 'You\'ve searched up ' + search
                                    });
                                }
                            });
                    });
                } else {
                    // If there aren't any items
                    res.render("index.ejs", {
                        inventory: [],
                        images: []
                    });
                }
            });
        });
    });
    return router;
}