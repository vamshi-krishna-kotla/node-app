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

		// putting default headers to be sent for any network request
		const defaultResponseHeaders = {
			// Access-Control-Allow-Origin: response header allow which domain to communicate with
			// wildcard response header to allow access to any origin
			"Access-Control-Allow-Origin": "*",
			// Access-Control-Allow-Headers: response header that filters which REQUEST HEADERS from the client are accepted
			// wildcard allows all headers
			"Access-Control-Allow-Headers": "*",
			// Access-Control-Allow-Headers: response header that filters which METHODS from the client are accepted
			// wildcard allows all methods
			"Access-Control-Allow-Methods": "*"
		};

		/* 
		before the actual network requests are performed, OPTIONS request is performed for testing CORS access
		this is called 'pre-flight' request 
		*/
		// handling OPTIONS request to return 200 for allowing CORS access
		if(method == "options") {
			// setting default headers
			res.writeHead(200, defaultResponseHeaders);
			res.end();
			return;
		}

		// route the request to the handler specified in the router
		chosenHandler(data, function(statusCode, payload){
			// use the statusCode returned by handler or use 200
			statusCode = typeof(statusCode) == "number" ? statusCode : 200;

			// use the payload called back by handler or use an empty object
			payload = typeof(payload) == "object" ? payload : {};

			// convert the payload to a string
			const payloadString = JSON.stringify(payload);

			// set custom header for returned response
			res.setHeader('Content-Type', 'application/json');
			// set the default response headers
			res.writeHead(statusCode, defaultResponseHeaders);
			// return the response
			res.end(payloadString);

			// log the request path
			helpers.debug(`Response: {\n Status:\x1b[34m ${statusCode} \x1b[0m \n Path:\x1b[34m ${path} \x1b[0m \n Method:\x1b[34m ${method} \x1b[0m \n Payload:\x1b[34m ${payloadString} \x1b[0m \n}`);
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