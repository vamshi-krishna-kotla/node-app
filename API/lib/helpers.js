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
 * 
 * @param {String} str : string which is hashed using 'crypto' library
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
 * 
 * @param {String} str : data passed in string format which need to be converted to JSON format
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

/**
 * Generates and returns a random alphanumeric string 
 * 
 * @param {Number} strLength : length of the string that returned; should be a valid number
 */
helpers.createRandomString = function (strLength) {
	strLength = (typeof(strLength) == 'number' && strLength > 0) ? strLength : false;

	if(strLength) {
		// define all the possible characters that could go into the string
		var possibleCharacters = 'qwertyuiopasdfghjklzxcvbnm1234567890';

		// start the string
		var str = '';
		for(i=1;i<=strLength;i++) {
			// get a random character from possible characters string
			var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random()*possibleCharacters.length));
			// append this character to the file string
			str += randomCharacter;
		}

		return str;
	}
	else {
		return false;
	}
};

/**
 * Prints lines to console only when NODE_DEBUG env variable is set
 * 
 * @param {String} str : string to be printed to the console when process.env.NODE_DEBUG is set to 'true'
 */
helpers.debug = function (str) {
	const print = ((typeof(process.env.NODE_DEBUG) == "string") && process.env.NODE_DEBUG.toLowerCase().replace(/ /g, '') == "true") ? true : false;
	if(print) {
		console.log(str);
	}	
};

// export the container
module.exports = helpers;