/**
 * Helpers for various tasks
 * 
 */

 // Dependencies
const crypto = require('crypto');
const config = require('./config');

//  Container for all the helpers
var helpers = {};

/**
 * Create a 'SHA256' hash for given string
 * 'SHA256' is configured in node to be used for hashing
 * This function is basely used for encrypting (password)
 * @param {*} str : string which is hashed using 'crypto' library
 */
helpers.hash = function (str) {
	if(typeof(str) == 'string' && str.length > 0) {
		var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
		return hash;
	}
	else {
		return false;
	}
};

/**
 * Parse a JSON string to an object in all cases without throwing
 * If the given string is not JSON then return an empty object
 * @param {*} str : data passed in string format which need to be converted to JSON format
 */
helpers.parseJsonToObject = function (str) {
	try {
		var obj = JSON.parse(str);
	}
	catch(e) {
		return {};
	}
	return obj;
};

// export the container
module.exports = helpers;