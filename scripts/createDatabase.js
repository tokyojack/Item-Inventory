var mysql = require('mysql');
var config = require('../config');

var connection = mysql.createConnection(config.db);

connection.query('CREATE TABLE `inventory` ( \
 `name` varchar(255) NOT NULL, \
 `amount` int(11) NOT NULL, \
 PRIMARY KEY (`name`) \
) ENGINE=InnoDB DEFAULT CHARSET=latin1');

console.log('Success: Database Created!')

connection.end();
