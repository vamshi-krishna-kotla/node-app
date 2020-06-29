/**
 * Server related tasks
 *  
 */

// dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const handlers = require('./handlers');
const helpers = require('./helpers');

// initialize the server object
var server = {};

// server should respond to all requests with a string
server.httpServer = http.createServer(function (req, res) {

	// get the url and parse it
	const parsedUrl = url.parse(req.url,true);

	// get the path from url
	const path = parsedUrl.pathname; // getting just the route/path without host
	const trimmedPath = path.replace(/^\/+|\/+$/g,''); // trimming '/' from path

	// get the querystring as an object
	const queryStringObject = parsedUrl.query;

	// get the http method
	const method = req.method.toLowerCase();

	// get the headers as an object
	const headers = req.headers;

	// get the payload, if any
	const decoder = new StringDecoder('utf-8');
	var buffer = "";
	req.on('data', function(data) {
		// "data" event is called whenever there is a payload
		buffer += decoder.write(data);
	});
	req.on('end', function() {
		// "end" event is always called irrespective of payload
		buffer += decoder.end();

		// choose the handler this request should go to
		// if one is not found then use the notFound handler
		const chosenHandler = typeof(server.router[trimmedPath]) !== "undefined" ? server.router[trimmedPath] : handlers.notFound;

		// construct the data object to send to the handler
		const data = {
			'trimmedPath': trimmedPath,
			'queryStringObject': queryStringObject,
			'method': method,
			'headers': headers,
			'payload': helpers.parseJsonToObject(buffer)
		};

		// route the request to the handler specified in the router
		chosenHandler(data, function(statusCode, payload){
			// use the statusCode returned by handler or use 200
			statusCode = typeof(statusCode) == "number" ? statusCode : 200;

			// use the payload called back by handler or use an empty object
			payload = typeof(payload) == "object" ? payload : {};

			// convert the payload to a string
			const payloadString = JSON.stringify(payload);

			// return the response
			res.setHeader('Content-Type', 'application/json');
			res.writeHead(statusCode);
			res.end(payloadString);

			// log the request path
			console.log("Response: ",statusCode, payloadString);
		});
	});	
});


/**
 * define a request router
 * 
 * this object has the routes configurations
 */
server.router = {
	"ping": handlers.ping,
	"users": handlers.users,
	"tokens": handlers.tokens,
	"checks": handlers.checks
};


/**
 * Initialise the server
 */
server.init = function () {
	// start the server and listen
	server.httpServer.listen(config.port, function () {
		console.log("Server is listening on PORT "+ "\x1b[35m" + config.port + "\x1b[0m" + " in "+ "\x1b[36m" + config.envName+ "\x1b[0m" + " mode");
	})
};

// export the module to be used
module.exports = server;