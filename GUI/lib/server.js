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
			res.status(200);
			res.setHeader('Content-Type', 'text/html');
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

// GET method handler for routes
server.httpServer.get('/:route', function (req, res) {
	// return the page template if the route is available; else redirect to error page
	if(server.availableRoutes.includes(req.params.route)) {
		// find the requested page as per the route
		helpers.findPage(req.params.route, function(err, data) {
			if(!err && data) {
				// send the page template
				res.status(200);
				res.setHeader('Content-Type', 'text/html');
				res.end(data);
			}
			else {
				// if page not found then call for an error
				res.status(500);
				console.log(err);
				res.end('Error fetching template');
			}
		});
	}
	else {
		// redirect to error page since the route is not available
		res.status(404);
		res.setHeader('Content-type', 'text/html');
		/**
		 * @TODO create an error page and redirect to it
		 */
		res.end('<h1>404 Page not found</h1>');
	}
});

// currently available routes for the GUI
server.availableRoutes = ['sign-in'];

/**
 * Initialise the server
 */
server.init = function () {
	// start the server and listen
	server.httpServer.listen(4000, function () {
		console.log('GUI serving at: \x1b[35m%s\x1b[0m', 'http://localhost:4000');
	});
};

// export the module to be used
module.exports = server;