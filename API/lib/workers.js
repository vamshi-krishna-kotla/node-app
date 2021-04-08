/**
 * Background workers
 * 
 */

// dependencies
const _data = require('./data');
const http = require('http');
const https = require('https');
const url = require('url');
const helpers = require('./helpers');

// initialize the workers object
var workers = {};

/**
 * sanity-checking the check-data
 */
workers.validateCheckData = function (originalCheckData) {
	originalCheckData = ((typeof(originalCheckData) == 'object') && originalCheckData != null) ? originalCheckData : {};
	originalCheckData.id = (typeof(originalCheckData.id) == 'string' && originalCheckData.id.trim().length == 20) ? originalCheckData.id : false;
	originalCheckData.userPhone = (typeof(originalCheckData.userPhone) == 'string' && originalCheckData.userPhone.trim().length == 10) ? originalCheckData.userPhone : false;
	originalCheckData.protocol = (typeof(originalCheckData.protocol) == 'string' && ['https', 'http'].indexOf(originalCheckData.protocol.trim()) > -1) ? originalCheckData.protocol.trim() : false;
	originalCheckData.url = (typeof(originalCheckData.url) == 'string' && originalCheckData.url.trim().length > 0) ? originalCheckData.url.trim() : false;
	originalCheckData.method = (typeof(originalCheckData.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(originalCheckData.method) > -1) ? originalCheckData.method : false;
	originalCheckData.successCodes = ((typeof(originalCheckData.successCodes) == 'object') && (originalCheckData.successCodes instanceof Array) && (originalCheckData.successCodes.length > 0)) ? originalCheckData.successCodes : false;
	originalCheckData.timeoutSeconds = ((typeof(originalCheckData.timeoutSeconds) == 'number') && (originalCheckData.timeoutSeconds %1 === 0) && (originalCheckData.timeoutSeconds >=1) && (originalCheckData.timeoutSeconds <=5)) ? originalCheckData.timeoutSeconds : false;

	// set the keys that may not be set (if the workers have never seen this check before)
	originalCheckData.state = (typeof(originalCheckData.state) == 'string' && ['up', 'down'].indexOf(originalCheckData.state) > -1) ? originalCheckData.state : 'down';
	originalCheckData.lastChecked = ((typeof(originalCheckData.lastChecked) == 'number') && (originalCheckData.lastChecked > 0)) ? originalCheckData.lastChecked : false;

	// if all the validations pass, pass the data along to next step
	if(
		originalCheckData.id &&
		originalCheckData.userPhone &&
		originalCheckData.protocol &&
		originalCheckData.url &&
		originalCheckData.method &&
		originalCheckData.successCodes &&
		originalCheckData.timeoutSeconds
	) {
		workers.performCheck(originalCheckData);
	}
	else {
		helpers.debug('\x1b[31m' + 'Error: One of the checks is not properly formatted; skipping it' + '\x1b[0m');
	}
};

/**
 * Perform the check, send the original checkData and outcome of the process to next step
 * 
 * @param {Object} originalCheckData : the data read from the respective check
 * Includes the data given by the user while registering the check
 * - protocol
 * - url
 * - method
 * - successCodes
 * - timeoutSeconds
 */
workers.performCheck = function (originalCheckData) {
	// prepare the initial check outcome
	var checkOutcome = {
		'error': false,
		'responseCode': false
	};

	// variable to verify whether a check has been performed or not 
	// mark that the outcome has not been sent yet, as a default
	var outcomeSent = false;

	// parse the hostname and path out of originalCheckData
	const parsedUrl = url.parse(originalCheckData.protocol+'://'+originalCheckData.url, true);
	const hostname = parsedUrl.hostname;
	// using 'path' not 'pathname' to get the queryString as well
	const path = parsedUrl.path;

	// construct the request 
	const requestDetails = {
		'protocol': originalCheckData.protocol+':',
		'hostname': hostname,
		'method': originalCheckData.method.toUpperCase(),
		'path': path,
		'timeout': originalCheckData.timeoutSeconds * 1000
	};

	// instantiate the request object (using either 'http' or 'https')
	const _module = originalCheckData.protocol == 'http' ? http : https;
	var req = _module.request(requestDetails, function (res) {
		// grab the status
		const status = res.statusCode;

		// update the check outcome and pass the data along
		checkOutcome.responseCode = status;
		if(!outcomeSent) {
			workers.processCheckOutcome(originalCheckData, checkOutcome);
			outcomeSent = true;
		}
	});

	// bind to error event of the request
	req.on('error', function (err) {
		// update the check outcome and pass the data along
		checkOutcome.error = {
			'error': true,
			'value': err
		};
		if(!outcomeSent) {
			workers.processCheckOutcome(originalCheckData, checkOutcome);
			outcomeSent = true;
		}
	});

	// bind to the timeout
	req.on('timeout', function (err) {
		// update the check outcome and pass the data along
		checkOutcome.error = {
			'error': true,
			'value': 'timeout'
		};
		if(!outcomeSent) {
			workers.processCheckOutcome(originalCheckData, checkOutcome);
			outcomeSent = true;
		}
	});

	// end the request (same as sending it)
	req.end();
};

/**
 * Process the check outcome and update the checkData as needed
 * Special logic for accomodating a check that has never been tested before; do not alert on such
 * 
 * @param {Object} originalCheckData :  the data read from the respective check
 * Includes the data given by the user while registering the check
 * - protocol
 * - url
 * - method
 * - successCodes
 * - timeoutSeconds
 * 
 * @param {Object} checkOutcome : has the outcome of performing a respective check
 * - valid only after the outcomeSent is verified
 * 
 * @TODO 
 * Trigger an alert to the user if needed
 */
workers.processCheckOutcome = function (originalCheckData, checkOutcome) {
	// decide if the check is considered 'up' or 'down'

	/**
	 * the "responseStatus" is converted to string before checking if it is given as part 
	 * of the "succesCodes" by the user as the "successCodes", given by the user, will be stored in string format
	 * 
	 */
	var state = ((!checkOutcome.error) && (checkOutcome.responseCode) && (originalCheckData.successCodes.indexOf(checkOutcome.responseCode.toString()) > -1)) ? 'up' : 'down';

	// decide if an alert is warranted
	var alertWarranted = ((originalCheckData.lastChecked) && (originalCheckData.state != state)) ? true : false;

	// update the checkData with the 'state' and 'lastChecked' timestamp
	var newCheckData = originalCheckData;
	newCheckData.state = state;
	newCheckData.lastChecked = Date.now();

	// store the check
	_data.update('checks', newCheckData.id, newCheckData, function (err) {
		if(!err) {
			// send the check data to next phase of the proess
			if(alertWarranted) {
				workers.alertUserToStatusChange(newCheckData);
			}
			else {
				helpers.debug('\x1b[33m'+'Check: '+ newCheckData.id +' has not changed; no alert needed'+ '\x1b[0m')
			}
		}
		else {
			helpers.debug('\x1b[31m'+'Error: Trying to save updates to one of the checks'+'\x1b[0m');
		}
	})
};

/**
 * Alert the user with given phone number or mail regarding the check
 * 
 * @param {Object} newCheckData : updated data of certain check after its check has been performed
 * Includes default checkData present when a check is read and two added parameters [state, lastChecked]
 * 
 * @todo
 * notify the respective user 
 */
workers.alertUserToStatusChange = function (newCheckData) {
	// alert the user 
	helpers.debug('Alert the user: '+ newCheckData.userPhone + ' for the check:' + newCheckData.id);
};

/**
 * lookup all checks, get their data, send to a validator
 */
workers.gatherAllChecks = function () {
	// get all the checks
	_data.list('checks', function (err, checks) {
		if(!err) {
			if(checks && checks.length > 0) {
				checks.forEach(check => {
					_data.read('checks', check, function (err, originalCheckData) {
						if(!err && originalCheckData) {
							// pass to check validator, and let that function continue or log any errors as needed
							workers.validateCheckData(originalCheckData);
						}
						else {
							helpers.debug('\x1b[31m' + 'Error reading one of the check\'s data:' + originalCheckData.id + '\x1b[0m');
						}
					});
				});
			}
			else {
				helpers.debug('\x1b[33m' + 'No checks currently!' + '\x1b[0m');
			}
		}
		else {
			helpers.debug('\x1b[31m' + 'Error listing checks!' + '\x1b[0m');
		}
	});
};

/**
 * timer to execute the worker process once per minute
 */
workers.loop = function () {
	setInterval(function () {
		workers.gatherAllChecks();
	}, 1000*60);
};

/**
 * start the backgroud workers to perform checks
 */
workers.init = function() {
	console.log('\x1b[34m' + 'Started workers!' + '\x1b[0m');

	// execute all the checks
	workers.gatherAllChecks();

	// call a loop so that the checks continue to execute
	workers.loop();
};

// export the module
module.exports = workers;