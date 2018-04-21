var router = require("express").Router();
var Scraper = require('images-scraper');
var bing = new Scraper.Bing();

var utils = require('../utils/utils');
var flashUtils = require('../utils/flashUtils');

// URL: "/"
module.exports = function (pool) {

    // "index.ejs" page. Load's all the items from the database, then links a random image that is related to it's name, to it.
    router.get("/", function (req, res) {
        pool.getConnection(function (err, connection) {
            if (flashUtils.isDatabaseError(req, res, '/', err)) {
                connection.release();
                return;
            }

            var selectItems = require("./queries/selectItems.sql");

            connection.query(selectItems, function (err, results) {
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

                                // When all items have been processed
                                if (itemsProcessed === array.length) {
                                    res.render("index.ejs", {
                                        inventory: results,
                                        images: images
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

    // Insert's new item on form submit
    router.post("/", function (req, res) {
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
            .then(function (result) {
                if (result[0].url === undefined)
                    return;

                pool.getConnection(function (err, connection) {
                    if (flashUtils.isDatabaseError(req, res, '/', err)) {
                        connection.release();
                        return;
                    }

                    var insertItem = require("./queries/insertItem.sql");

                    connection.query(insertItem, [item, item.amount], function (err, results) {
                        connection.release();
                        if (flashUtils.isDatabaseError(req, res, '/', err))
                            return;

                        flashUtils.successMessage(req, res, '/', 'You\'ve added ' + item.name + "(" + item.amount + ") to your inventory!");
                    });
                });
            }).catch(function (err) {
                if (err)
                    flashUtils.errorMessage(req, res, '/', 'No image found for your item');
            });
    });

    return router;
}