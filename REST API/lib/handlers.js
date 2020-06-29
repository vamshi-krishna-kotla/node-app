/**
 * These are the request handlers
 * 
 */
// Dependencies
const _data = require('./data');
const helpers = require('./helpers');
const config = require('./config');

// define the handlers for each route (valid route)
var handlers = {};

// <host>/users route
/**
 * This function filters the handler based on the HTTP method
 * - uses the 'data.method' param for filtering
 * @param {*} data : the object coming from the calling function; has the details of the HTTP request basically
 * @param {*} callback : returns 405 if an invalid method is given
 */
handlers.users = function (data, callback) {
	const acceptableMethods = ["post", "get", "put", "delete"];
	if(acceptableMethods.indexOf(data.method) > -1) {
		handlers._users[data.method](data, callback);
	}
	else {
		callback(405);
	}
};

// Container for users submethods
handlers._users = {};

// <host>/users - post
/**
 * http POST method to include new user
 * 
 * Required data: firstName, lastName, email, phone, password, tosAgreement | passed as payload to '/users' route
 * 
 * Optional data: none
 * 
 * @param {*} data : object from the http request that includes required details to add new user
 * @param {*} callback : return respective statusCode (and error) based on the operation
 */
handlers._users.post = function (data, callback) {
	// Check that all required fiels are filled out
	var firstName = (typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0) ? data.payload.firstName.trim() : false;
	var lastName = (typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0) ? data.payload.lastName.trim() : false;
	var email = (typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0) ? data.payload.email.trim() : false;
	var phone = (typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10) ? data.payload.phone.trim() : false;
	var password = (typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0) ? data.payload.password.trim() : false;
	var tosAgreement = (typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true) ? true : false;

	if(firstName && lastName && email && phone && password && tosAgreement) {
		//  Make sure that the user doesn't already exist
		_data.read('users', phone, function (err, data) {
			// expecting 'err' to be valid because we should not be having a user already
			// if we have a user already then callback an error
			if(err) {
				// hash the password
				var hashedPassword = helpers.hash(password);

				// Create the user object
				if(hashedPassword) {
					var userObject = {
						'firstName': firstName,
						'lastName': lastName,
						'email': email,
						'phone': phone,
						'hashedPassword': hashedPassword,
						'tosAgreement': true
					};
	
					// store the user
					_data.create('users', phone, userObject, function (err) {
						if(!err) {
							callback(200);
						}
						else {
							callback(500, {'Error': 'Could not create the new user'});
						}
					});
				}
				else {
					callback(500, {'Error': 'Could not hash user\'s password'});
				}
			}
			else {
				callback(400, {'Error': 'User with that phone number already exists'});
			}
		});
	}
	else {
		callback(400, {'Error': 'Missing required fields'});
	}
};

// <host>/users - get
/**
 * http GET method to read data of an already present user
 * 
 * 
 * A user is validated with a token, that was generated to that user, before reading
 * 
 * Required data: phone | passed as a queryString parameter with '/users' route
 * @example /users?phone=1234567890
 * 
 * Optional data: none
 * 
 * @param {*} data : object from the http request that includes required details to read a user
 * @param {*} callback : return respective statusCode (and error) based on the operation
 * 
 */
handlers._users.get = function (data, callback) {
	// Check that the phone number is valid
	var phone = (typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10) ? data.queryStringObject.phone : false;
	if(phone) {
		// get the token from the headers
		const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
		// verify that the given token is valid for the phone number
		handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
			if(tokenIsValid) {
				// lookup the user
				_data.read('users', phone, function (err, data) {
					if(!err && data) {
						// Remove the hashed password from the object before sending data
						// we don't want to expose the password
						delete data.hashedPassword;
						callback(200, data);
					}
					else {
						callback(404, {'Error': 'Unable to read data'});
					}
				});
			}
			else {
				callback(403, {'Error': 'Missing required token in header or token is invalid'});
			}
		});
	}
	else {
		callback(400, {'Error': 'Missing required field(phone)'});
	}
};

// <host>/users - put
/**
 * http PUT method to update data of an already present user
 * 
 * A user is validated with a token, that was generated to that user, before updating
 * 
 * Required data: phone | passed as a queryString parameter with '/users' route
 * @example /users?phone=1234567890
 *  
 * Optional data: firstName, lastName, email, password (at least one must be specified) | passed as payload to '/users' route
 * 
 * @param {*} data : object from the http request that includes required details to read a user and update
 * @param {*} callback : return respective statusCode (and error) based on the operation
 * 
 */
handlers._users.put = function (data, callback) {
	// check for the required field
	const phone = (typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10) ? data.queryStringObject.phone : false;

	// check for the optional field
	const firstName = (typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0) ? data.payload.firstName.trim() : false;
	const lastName = (typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0) ? data.payload.lastName.trim() : false;
	const email = (typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0) ? data.payload.email.trim() : false;
	const password = (typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0) ? data.payload.password.trim() : false;

	// error if phone is invalid
	if(phone) {
		// error if nothing is sent for updating
		if(firstName || lastName || email || password){
			// get the token from the headers
			const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
			handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
				if(tokenIsValid){
					_data.read('users', phone, function (err, userData) {
						if(!err && userData) {
							// modify the userData fields to update
							if(firstName) {
								userData.firstName = firstName;
							}
							if(lastName) {
								userData.lastName = lastName;
							}
							if(email) {
								userData.email = email;
							}
							if(password) {
								userData.hashedPassword = helpers.hash(password);
							}
							// store the updates
							_data.update('users', phone, userData, function (err) {
								if(!err){
									callback(200);
								}
								else {
									callback(500, {'Error': 'Could not update the user'});
								}
							});
						}
						else {
							callback(400, {'Error': 'Specified user does not exist'})
						} 
					});
				}
				else {
					callback(403, {'Error': 'Missing required token in header or token is invalid'});
				}
			});
		}
		else {
			callback(400, {'Error': 'Missing fields to update'});
		}
	}
	else {
		callback(400, {'Error': 'Missing required field(phone)'});
	}
};

// <host>/users - delete
/**
 * http DELETE method to remove an already present user
 * 
 * A user is validated with a token, that was generated to that user, before deleting
 * 
 * Required data: phone | passed as a queryString parameter with '/users' route
 * @example /users?phone=1234567890
 * 
 * @param {*} data : object from the http request that includes required details to read a user and delete
 * @param {*} callback : return respective statusCode (and error) based on the operation
 * 
 */
handlers._users.delete = function (data, callback) {
	// Check that the phone number is valid
	var phone = (typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10) ? data.queryStringObject.phone : false;
	if(phone) {
		// get the token from the headers
		const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
		handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
			if(tokenIsValid){
				_data.read('users', phone, function (err, data) {
					if(!err && data) {
						_data.delete('users', phone, function (err) {
							if(!err) {
								// delete each of the checks associated with the user
								const userChecks = ((typeof(data.checks) == 'object') && (data.checks instanceof Array)) ? data.checks : [];
								const checksToDelete = userChecks.length;
								if(checksToDelete > 0) {
									var deletionError = false;
									
									// loop through checks
									userChecks.forEach(function(checkId) {
										_data.delete('checks', checkId, function (err) {
											if(err) {
												deletionError = true;
											}
										});
									});
									if(!deletionError) {
										callback(200);
									}
									else {
										callback(500, {'Error': `Errors encountered while attempting to delete all of user's checks. 
											All checks may not have been deleted successfully`})
									}
								}
								else {
									callback(200);
								}
							}
							else {
								callback(500, {'Error': 'Could not delete specified user'});
							}
						});
					}
					else {
						callback(404, {'Error': 'Could not find the specified user'});
					}
				});
			}
			else {
				callback(403, {'Error': 'Missing required token in header or token is invalid'});
			}
		});
	}
	else {
		callback(400, {'Error': 'Missing required field(phone)'});
	}
};

// <host>/tokens route
/**
 * 
 * Tokens are used for authentication purpose; instead of using 'phone' and 'password' each time
 * 
 * This function filters the handler based on the HTTP method
 * - uses the 'data.method' param for filtering
 * @param {*} data : the object coming from the calling function; has the details of the HTTP request basically
 * @param {*} callback : returns 405 if an invalid method is given
 */
handlers.tokens = function (data, callback) {
	const acceptableMethods = ["post", "get", "put", "delete"];
	if(acceptableMethods.indexOf(data.method) > -1) {
		handlers._tokens[data.method](data, callback);
	}
	else {
		callback(405);
	}
};

// Container for all tokens sub methods
handlers._tokens = {};

// <host>/tokens - post
/**
 * http POST method to include new token for a user
 * 
 * generates a random string of length 20 and 
 * creates a new file with that string in '.data/tokens' directory
 * 
 * Required data: phone, password | passed as payload to '/tokens' route
 * 
 * Optional data: none
 * 
 * @param {*} data : object from the http request that includes required details to add new token
 * @param {*} callback : return respective statusCode (and error) based on the operation
 */
handlers._tokens.post = function (data, callback) {
	var phone = (typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10) ? data.payload.phone.trim() : false;
	var password = (typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0) ? data.payload.password.trim() : false;
	if(phone && password) {
		// Looking up the user who matches that phone
		_data.read('users', phone, function (err, userData) {
			if(!err && userData) {
				// hash the sent passsword and compare it to the password stored in userData
				var hashedPassword = helpers.hash(password);
				if(hashedPassword == userData.hashedPassword){
					// if valid then create a token with random name. Set expiration date 1 hour
					var tokenId = helpers.createRandomString(20);

					// expires from 1 hour (1000 * 60 min * 60 sec)ms
					var expires = Date.now() + 60*60*1000;
					var tokenObject = {
						'phone': phone,
						'id': tokenId,
						'expires': expires
					};

					// store the token
					_data.create('tokens', tokenId, tokenObject, function (err) {
						if(!err) {
							callback(200, tokenObject);
						}
						else {
							callback(500, {'Error': 'Could not create a new token'});
						}
					});
				}
				else {
					callback(400, {'Error': 'Password didnot match the specified user\'s stored password'});
				}
			}
			else {
				callback(400, {'Error': 'Could not find the user specified'});
			}
		});
	}
	else {
		callback(400, {'Error': 'Missing required field(s)'});
	}
};

// <host>/tokens - get
/**
 * http GET method to read data of an already present token
 * 
 * Required data: id | passed as a queryString parameter with '/tokens' route
 * @example /tokens?id=2boco4pcx242udm53hd1
 * 
 * Optional data: none
 * 
 * @param {*} data : object from the http request that includes required details to read a token
 * @param {*} callback : return respective statusCode (and error) based on the operation
 * 
 */
handlers._tokens.get = function (data, callback) {
	// Check that the id is valid
	var id = (typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20) ? data.queryStringObject.id : false;
	if(id) {
		_data.read('tokens', id, function (err, tokenData) {
			if(!err && tokenData) {
				callback(200, tokenData);
			}
			else {
				callback(404, {'Error': 'Unable to read token'});
			}
		});
	}
	else {
		callback(400, {'Error': 'Missing required field(id)'});
	}
};

// <host>/tokens - put
/**
 * http PUT method to extend the expiry of an already present token
 * 
 * Required data: id, extend | 
 * 		id (string): passed as a queryString parameter with '/token' route
 * 		extend (boolean): passed as a payload
 * @example /tokens?id=2boco4pcx242udm53hd1
 *  
 * Optional data: none
 * 
 * @param {*} data : object from the http request that includes required details to read a token and update
 * @param {*} callback : return respective statusCode (and error) based on the operation
 * 
 */
handlers._tokens.put = function (data, callback) {
	// check for the required field
	const id = (typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20) ? data.queryStringObject.id : false;
	const extend = (typeof(data.payload.extend) == 'boolean' && data.payload.extend) ? true : false;
	
	if(id && extend) {
		// look up the token
		_data.read('tokens', id, function (err, tokenData) {
			if(!err && tokenData) {
				// check to make sure the token has not expired
				if(tokenData.expires > Date.now()) {
					tokenData.expires = Date.now() + 1000*60*60;
					// store the new update
					_data.update('tokens', id, tokenData, function (err) {
						if(!err) {
							callback(200);
						}
						else {
							callback(500, {'Error': 'Couldnot update the token expiration'});
						}
					});
				}
				else {
					callback(400, {'Error': 'Token has already expired and cannot be extended'});
				} 
			}
			else {
				callback(400, {'Error': 'Token does not exist'});
			}
		});
	}
	else {
		callback(400, {'Error': 'Missing required field(s) or field(s) are invalid'});
	}
};

// <host>/tokens - delete
/**
 * http DELETE method to remove an already present token
 * 
 * Required data: id | passed as a queryString parameter with '/token' route
 * @example /tokens?id=65aaqtgkb84i02ofj01s
 * 
 * Optional data: none
 * 
 * @param {*} data : object from the http request that includes required details to read a token and delete
 * @param {*} callback : return respective statusCode (and error) based on the operation
 * 
 */
handlers._tokens.delete = function (data, callback) {
	// Check that the id is valid
	var id = (typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20) ? data.queryStringObject.id : false;
	if(id) {
		_data.read('tokens', id, function (err, data) {
			if(!err && data) {
				_data.delete('tokens', id, function (err) {
					if(!err) {
						callback(200);
					}
					else {
						callback(500, {'Error': 'Could not delete specified token'});
					}
				});
			}
			else {
				callback(404, {'Error': 'Could not find the specified token'});
			}
		});
	}
	else {
		callback(400, {'Error': 'Missing required field(id)'});
	}
};

/**
 * Verify if a given token-id is currently valid for a given user
 * 
 * @param {*} id : token id to be validated with phone
 * @param {*} phone : phone number to be validated for a user
 * @param {*} callback : returns boolean result of validation
 */
handlers._tokens.verifyToken = function (id, phone, callback) {
	// look up the token
	_data.read('tokens', id, function (err, tokenData) {
		if(!err && tokenData) {
			// check whether the token is for the given user, and has not expired
			if(tokenData.phone == phone && tokenData.expires > Date.now()) {
				callback(true);
			}
			else {
				callback(false);
			}
		}
		else {
			callback(false);
		}	
	});
};

// <host>/checks route
/**
 * 
 * 
 * This function filters the handler based on the HTTP method
 * - uses the 'data.method' param for filtering
 * @param {*} data : the object coming from the calling function; has the details of the HTTP request basically
 * @param {*} callback : returns 405 if an invalid method is given
 */
handlers.checks = function (data, callback) {
	const acceptableMethods = ["post", "get", "put", "delete"];
	if(acceptableMethods.indexOf(data.method) > -1) {
		handlers._checks[data.method](data, callback);
	}
	else {
		callback(405);
	}
};

// Container for all the checks methods
handlers._checks = {};

// <host>/checks - post
/**
 * http POST method to create a new 'check' for a user(authenticated)
 * 
 * Required data: protocol, url, method, successCodes, timeoutSeconds | passed as payload to '/checks' route
 * protocol: over which protocol is the user requesting the check [http/https]
 * url: URL given to be added to the check
 * method: http method to be performed to the given URL
 * successCodes: array of code that are considered as a successful ping
 * timeoutSeconds: the timeout to accept a responce from the http request sent to the url
 * 
 * Required data: token | passed as headers
 * token => the token generated previously for a user, used for authentication
 * 
 * Optional data: none
 * 
 * @param {*} data : object from the http request that includes required details to create a new check
 * @param {*} callback : return respective statusCode (and error) based on the operation
 */
handlers._checks.post = function (data, callback) {
	// validate all the inputs
	const protocol = (typeof(data.payload.protocol) == 'string' && ['https', 'http'].indexOf(data.payload.protocol.trim()) > -1) ? data.payload.protocol.trim() : false;
	const url = (typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0) ? data.payload.url.trim() : false;
	const method = (typeof(data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1) ? data.payload.method : false;
	const successCodes = ((typeof(data.payload.successCodes) == 'object') && (data.payload.successCodes instanceof Array) && (data.payload.successCodes.length > 0)) ? data.payload.successCodes : false;
	const timeoutSeconds = ((typeof(data.payload.timeoutSeconds) == 'number') && (data.payload.timeoutSeconds %1 === 0) && (data.payload.timeoutSeconds >=1) && (data.payload.timeoutSeconds <=5)) ? data.payload.timeoutSeconds : false;

	if(protocol && url && method && successCodes && timeoutSeconds) {
		// get the token from headers
		const token = (typeof(data.headers.token) == "string") ? data.headers.token : false;

		// lookup the user by reading the token
		_data.read('tokens', token, function(err, tokenData){
			if(!err && tokenData) {
				const userPhone = tokenData.phone;

				// lookup the user data
				_data.read('users', userPhone, function (err, userData) {
					if(!err && userData) {
						// add new checks to the checks array of the user or create an empty array and add
						const userChecks = ((typeof(userData.checks) == 'object') && (userData.checks instanceof Array)) ? userData.checks : [];

						// verify the user has less than the number of max checks allowed
						if(userChecks.length < config.maxChecks) {
							// create a random ID for the check
							const checkId = helpers.createRandomString(20);

							// create the check object and include user's phone
							const checkObject = {
								'id': checkId,
								'userPhone': userPhone,
								'protocol': protocol,
								'url': url,
								'method': method,
								'successCodes': successCodes,
								'timeoutSeconds': timeoutSeconds
							};

							// save the object
							_data.create('checks', checkId, checkObject, function (err) {
								if(!err) {
									// add the checkId to the users object
									userData.checks = userChecks;
									userData.checks.push(checkId);

									// save the new user data
									_data.update('users', userPhone, userData, function (err) {
										if(!err) {
											callback(200, checkObject);
										}
										else {
											callback(500, {'Error': 'Could not update the user with new check'});
										}
									});
								}
								else {
									callback(500, {'Error': 'Could not create the new check'});
								}
							});
						}
						else {
							callback(400, {'Error': `User already has max number of checks (${config.maxChecks})`});
						} 
					}
					else {
						callback(403, {'Error': 'Not authorized'});
					}
				});
			}
			else {
				callback(403, {'Error': 'Not authorized'});
			}
		}); 
	}
	else {
		callback(400, {'Error': 'Missing required inputs or inputs are invalid'});
	}

};

// <host>/checks - get
/**
 * http GET method to retirive the details of certain check of a user(authenticated)
 * 
 * Required data: id | passed as a queryString parameter; basically the checkId which will be searched
 * 
 * Required data: token | passed as headers
 * token => the token generated previously for a user, used for authentication
 * 
 * Optional data: none
 * 
 * @param {*} data : object from the http request that includes required details to read a check
 * @param {*} callback : return respective statusCode (and error) based on the operation
 */
handlers._checks.get = function (data, callback) {
	// Check that the id(checkId) is valid
	var id = (typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20) ? data.queryStringObject.id : false;
	if(id) {
		// lookup the check
		_data.read('checks', id, function (err, checkData) {
			if(!err && checkData) {
				// get the token from the headers
				const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
				// verify that the given token is valid and belongs to the user who created the check
				handlers._tokens.verifyToken(token, checkData.userPhone, function (tokenIsValid) {
					if(tokenIsValid) {
						// if token is valid then return the checkData
						callback(200, checkData);
					}
					else {
						callback(403, {'Error': 'Missing required token in header or token is invalid/expired'});
					}
				});
			}
			else {
				callback(404, {'Error': 'No check found with given ID'});
			}
		});
	}
	else {
		callback(400, {'Error': 'Missing required field(phone)'});
	}
};

// <host>/checks - put
/**
 * 
 * http PUT method to update the 'check' of a user
 * 
 * Required data: id | passed as a queryString parameter; basically the checkId, of the check that needs to be updated
 * 
 * Required data: token | passed as headers
 * token => the token generated previously for a user, used for authentication
 * 
 * Optional data: protocol, url, method, successCodes, timeoutSeconds (at least one must be specified) | passed as payload to the request
 * 
 * @param {*} data : object from the http request that includes required details to read a check and update
 * @param {*} callback : return respective statusCode (and error) based on the operation
 * 
 */
handlers._checks.put = function (data, callback) {
	// check for the required field
	const id = (typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20) ? data.queryStringObject.id.trim() : false;

	// check for the optional field
	const protocol = (typeof(data.payload.protocol) == 'string' && ['https', 'http'].indexOf(data.payload.protocol.trim()) > -1) ? data.payload.protocol.trim() : false;
	const url = (typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0) ? data.payload.url.trim() : false;
	const method = (typeof(data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1) ? data.payload.method : false;
	const successCodes = ((typeof(data.payload.successCodes) == 'object') && (data.payload.successCodes instanceof Array) && (data.payload.successCodes.length > 0)) ? data.payload.successCodes : false;
	const timeoutSeconds = ((typeof(data.payload.timeoutSeconds) == 'number') && (data.payload.timeoutSeconds %1 === 0) && (data.payload.timeoutSeconds >=1) && (data.payload.timeoutSeconds <=5)) ? data.payload.timeoutSeconds : false;

	// error if id(checkId) is invalid
	if(id) {
		// error if nothing is sent for updating
		if(protocol || url || method || successCodes || timeoutSeconds){
			// lookup the check
			_data.read('checks', id, function (err, checkData) {
				if(!err && checkData) {
					// get the token from the headers
					const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
					handlers._tokens.verifyToken(token, checkData.userPhone, function (tokenIsValid) {
						if(tokenIsValid){
							// update the check where necessary
							if(protocol) {
								checkData.protocol = protocol;
							}
							if(url) {
								checkData.url = url;
							}
							if(method) {
								checkData.method = method;
							}
							if(successCodes) {
								checkData.successCodes = successCodes;
							}
							if(timeoutSeconds) {
								checkData.timeoutSeconds = timeoutSeconds;
							}

							// store the updates
							_data.update('checks', id, checkData, function (err) {
								if(!err) {
									callback(200);
								}
								else {
									callback(500, {'Error': 'Could not update the check'});
								}
							});
						}
						else {
							callback(403, {'Error': 'Missing required token in header or token is invalid'});
						}
					});
				}
				else {
					callback(400, {'Error': 'CheckId did not exist'});
				}
			});
		}
		else {
			callback(400, {'Error': 'Missing fields to update'});
		}
	}
	else {
		callback(400, {'Error': 'Missing required field (id)'});
	}
};

// <host>/checks - delete
/**
 * http DELETE method to remove a check of a user
 * 
 * Required data: id | passed as a queryString parameter; basically the checkId, of the check that needs to be deleted
 * 
 * Required data: token | passed as headers
 * token => the token generated previously for a user, used for authentication
 * 
 * Optional data: none
 * 
 * @param {*} data : object from the http request that includes required details to read a check and delete
 * @param {*} callback : return respective statusCode (and error) based on the operation
 */
handlers._checks.delete = function (data, callback) {
	// check for the required field : id (checkID)
	const id = (typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20) ? data.queryStringObject.id : false;
	if(id) {
		// lookup the check
		_data.read('checks', id, function (err, checkData) {
			if(!err && checkData) {
				// get the token from the headers
				const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
				handlers._tokens.verifyToken(token, checkData.userPhone, function (tokenIsValid) {
					if(tokenIsValid){
						// delete the check data
						_data.delete('checks', id, function (err) {
							if(!err) {
								// lookup that user
								_data.read('users', checkData.userPhone, function (err, userData) {
									if(!err && userData) {
										const userChecks = ((typeof(userData.checks) == 'object') && (userData.checks instanceof Array)) ? userData.checks : [];

										// remove the deleted check from the list of checks
										const checkPosition = userChecks.indexOf(id);
										if(checkPosition > -1) {
											userChecks.splice(checkPosition,1);

											// resave the usersData
											_data.update('users', checkData.userPhone, userData, function (err) {
												if(!err) {
													callback(200);
												}
												else {
													callback(500, {'Error': 'Could not update the user'});
												}
											}); 
										}
										else {
											callback(500, {'Error': 'Could not find the check on the users object and hence could not remove it'});
										}
									}
									else {
										callback(500, {'Error': 'Could not find the user who created the check and hence could not remove the check from the list of checks on the user object'});
									}
								});
							}
							else {
								callback(500, {'Error': 'Could not delete the specified check'});
							}
						});
					}
					else {
						callback(403, {'Error': 'Missing required token in header or token is invalid'});
					}
				});
			}
			else {
				callback(400, {'Error': 'Specified checkId doesnot exist'});
			}
		});
	}
	else {
		callback(400, {'Error': 'Missing required field(checkID)'});
	}
};


// notFound handler
// <host>/<any-invalid-route>
/**
 * 
 * This handler is basically a redirect to any route which is invalid
 * If a user tries to access a route that is invalid, they are redirected to this handler
 * 
 * @param {*} data : object from the http request
 * @param {*} callback : return 404 statusCode
 * 
 */
handlers.notFound = function (data, callback) {
	callback(404);
};

// PING handler
// '<host>/ping' route
/**
 * Basic route to check the availability of the server
 * 
 * @param {*} data : object from the http request
 * @param {*} callback : return 200 statusCode
 * 
 */
handlers.ping = function(data, callback) {
	callback(200);
};

// export the module
module.exports = handlers;