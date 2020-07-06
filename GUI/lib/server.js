/**
 * GUI server related tasks
 * 
 */

// dependencies
const express = require('express');
const helpers = require('./helpers');

// initialize the server object
var server = {};

// instantiate the Express server
server.httpServer = express();

// GET method handler for base route
server.httpServer.get('/', function (req, res) {
	// find the requested page as per the route
	helpers.findPage('home', function(err, data) {
		if(!err && data) {
			// send the page template
			res.end(data);
		}
		else {
			// if page not found then call for an error
			res.status(500);
			console.log(err);
			res.end('Error fetching template');
		}
	});
});

/**
 * Initialise the server
 */
server.init = function () {
	// start the server and listen
	server.httpServer.listen(4000, function () {
		console.log('GUI serving at port: 4000');
	});
};

// export the module to be used
module.exports = server;