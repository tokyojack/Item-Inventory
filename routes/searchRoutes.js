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

            var q = "SELECT * FROM " + inventoryName + " AS inventory WHERE name=?";
            conn.query(q, req.params.search, function(err, results) {
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
                                    res.render("index.ejs", { inventory: results, images: images });
                                }
                            });
                    });

                }
                else
                    res.render("index.ejs", { inventory: [], images: [] });
            });
        });
    });


    //This may not be the best way todo this;
    router.post("/", function(req, res) {
        flashUtils.successMessage(req, res, '/search/' + req.body.name, "You searched " + req.body.name);
    });

    return router;
}
