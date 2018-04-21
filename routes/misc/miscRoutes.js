var router = require("express").Router();

module.exports = function () {

    router.get("*", (req, res) => res.redirect("/"));

    router.post("*", (req, res) => res.redirect("/"));

    return router;
}