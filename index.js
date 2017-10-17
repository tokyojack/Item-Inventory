//============================= Packages =============================

var express = require("express");
var app = express();

var bodyParser = require("body-parser");
var flash = require('express-flash');
var session = require('express-session')

//============================= Letting express use them =============================

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(flash());
app.use(session({
    secret: 'supersecret',
    resave: false,
    saveUninitialized: false
}));

app.use(function(req, res, next) {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

//============================= Pool =============================

var config = require('./config');
var mysql = require("mysql");
var pool = mysql.createPool(config.db);

//============================= Routes =============================

var indexRoutes = require("./routes/indexRoutes")(pool);
var searchRoutes = require("./routes/searchRoutes")(pool);
var deleteRoutes = require("./routes/deleteRoutes")(pool);
var miscRoutes = require("./routes/miscRoutes")();

app.use("/", indexRoutes);
app.use("/search", searchRoutes);
app.use("/delete", deleteRoutes);
app.use("*", miscRoutes);

//============================= Starting Server =============================
app.listen(8080, function() {
    console.log("The server has started running, yahoo!");
});

var cleanup = require('./utils/nodeEnding').nodeEndingCode(nodeEndInstance);

//============================= Ending Server =============================
function nodeEndInstance() {
    console.log("The pool has been closed.");
    pool.end();
};
