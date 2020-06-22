/**
 * Primary file for API
 * 
 * 
 */
// dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');

// server should respond to all requests with a string
var server = http.createServer(function (req, res) {

	// get the url and parse it
	var parsedUrl = url.parse(req.url,true);

	// get the path from url
	var path = parsedUrl.pathname; // getting just the route/path without host
	var trimmedPath = path.replace(/^\/+|\/+$/g,''); // trimming '/' from path

	// get the querystring as an object
	var queryStringObject = parsedUrl.query;

	// get the http method
	var method = req.method.toLowerCase();

	// get the headers as an object
	var headers = req.headers;

	// get the payload, if any
	var decoder = new StringDecoder('utf-8');
	var buffer = "";
	req.on('data', function(data) {
		// "data" event is called whenever there is a payload
		buffer += decoder.write(data);
	});
	req.on('end', function() {
		// "end" event is always called irrespective of payload
		buffer += decoder.end();

		// choose the handler this request should go to
		// if one is not found then use the notfound handler
		var chosenHandler = typeof(router[trimmedPath]) !== "undefined" ? router[trimmedPath] : handlers.notfound;

		// construct the data object to send to the handler
		var data = {
			'trimmedPath': trimmedPath,
			'queryStringObject': queryStringObject,
			'method': method,
			'headers': headers,
			'payload': buffer
		};

		// route the request to the handler specified in the router
		chosenHandler(data, function(statusCode, payload){
			// use the statusCode returned by handler or use 200
			statusCode = typeof(statusCode) == "number" ? statusCode : 200;

			// use the payload called back by handler or use an empty object
			payload = typeof(payload) == "object" ? payload : {};

			// convert the payload to a string
			var payloadString = JSON.stringify(payload);

			// return the response
			res.setHeader('Content-Type', 'application/json');
			res.writeHead(statusCode);
			res.end(payloadString);

			// log the request path
			console.log("Response: ",statusCode, payloadString);
		});
	});	
})

// start the server and listen
server.listen(config.port, function () {
	console.log("Server is listening on PORT "+config.port+" in "+config.envName+" mode");
})

// define the handlers
var handlers = {
	"notfound": function (data, callback) {
		callback(404);
	}
};
// PING handler
handlers.ping = function(data, callback) {
	callback(200);
};
// define a request router
var router = {
	"ping": handlers.ping
};