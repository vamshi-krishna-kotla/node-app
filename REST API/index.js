/**
 * Primary file for API
 * 
 * 
 */

// dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');

// start the server
server.init();

// start the background workers
workers.init();