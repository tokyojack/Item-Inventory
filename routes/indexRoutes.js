var router = require("express").Router();
var Scraper = require('images-scraper');
var bing = new Scraper.Bing();

var inventoryName = require('../config').tableName;
var utils = require('../utils/utils');
var flashUtils = require('../utils/flashUtils');

module.exports = function(pool) {
    router.get("/", function(req, res) {
        pool.getConnection(function(err, conn) {
            if (flashUtils.isDatabaseError(req, res, '/', err)) {
                conn.release();
                return;
            }

            var q = "SELECT * FROM " + inventoryName + " AS inventory";
            conn.query(q, function(err, results) {
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

    router.post("/", function(req, res) {
        if (utils.isEmpty(req.body.name)) {
            flashUtils.errorMessage(req, res, '/', 'The name input is empty!');
            return;
        }


        if (utils.isEmpty(req.body.amount)) {
            flashUtils.errorMessage(req, res, '/', 'The amount input is empty!');
            return;
        }

        var item = {
            name: req.body.name,
            amount: req.body.amount
        };

        bing.list({
                keyword: item.name,
                num: 1,
                detail: true
            })
            .then(function(result) {
                if (result[0].url === undefined)
                    return;

                pool.getConnection(function(err, conn) {
                    if (flashUtils.isDatabaseError(req, res, '/', err)) {
                        conn.release();
                        return;
                    }
                    var q = "INSERT INTO " + inventoryName + " SET ? ON DUPLICATE KEY UPDATE amount = amount + " + item.amount;
                    conn.query(q, item, function(err, results) {
                        conn.release();
                        if (flashUtils.isDatabaseError(req, res, '/', err))
                            return;

                        flashUtils.successMessage(req, res, '/', 'You\'ve added ' + item.name + "(" + item.amount + ") to your inventory!");
                    });
                });
            }).catch(function(err) {
                if (err)
                    flashUtils.errorMessage(req, res, '/', 'No image found for your item');
            });
    });

    return router;
}
