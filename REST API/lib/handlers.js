/**
 * These are the request handlers
 * 
 */
// Dependencies
const _data = require('./data');
const helpers = require('./helpers');

// define the handlers
var handlers = {};

// Users
handlers.users = function (data, callback) {
	const acceptableMethods = ["post", "get", "put", "delete"];
	if(acceptableMethods.indexOf(data.method) > -1) {
		handlers._users[data.method]( data, callback);
	}
	else {
		callback(405);
	}
};

// Container for users submethods
handlers._users = {};

// Users - post
// Required data: fname, lname, phone, password, tosAgreement
// Optional data: none
handlers._users.post = function (data, callback) {
	// Check that all required fiels are filled out
	var firstName = (typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0) ? data.payload.firstName.trim() : false;
	var lastName = (typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0) ? data.payload.lastName.trim() : false;
	var phone = (typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10) ? data.payload.phone.trim() : false;
	var password = (typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0) ? data.payload.password.trim() : false;
	var tosAgreement = (typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true) ? true : false;

	if(firstName && lastName && phone && password && tosAgreement) {
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
						'phone': phone,
						'hashedPassword': hashedPassword,
						'tosAgreement': true
					};
	
					// store the user
					_data.create('users', phone, userObject, function (err) {
						if(!err) {
							callback(200);
						}
						else {;
							console.log(err);
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

// Users - get
// Required data: phone
// Optional data: none
/**
 * @TODO Only let an authenticated user access their object
 * don't let anyone else access their object
 */
handlers._users.get = function (data, callback) {
	// Check that the phone number is valid
	var phone = (typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10) ? data.queryStringObject.phone : false;
	if(phone) {
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
		callback(400, {'Error': 'Missing required field(phone)'});
	}
};

// Users - put
// Required data: phone
// Optional data: fname, lname, password (at least one must be specified)
/**
 * @TODO Only let an authenticated user access their object
 * don't let anyone else access their object
 */
handlers._users.put = function (data, callback) {
	// check for the required field
	const phone = (typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10) ? data.queryStringObject.phone : false;

	// check for the optional field
	const firstName = (typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0) ? data.payload.firstName.trim() : false;
	const lastName = (typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0) ? data.payload.lastName.trim() : false;
	const password = (typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0) ? data.payload.password.trim() : false;

	// error if phone is invalid
	if(phone) {
		// error if nothing is sent for updating
		if(firstName || lastName || password){
			_data.read('users', phone, function (err, userData) {
				if(!err && userData) {
					// modify the userData fields to update
					if(firstName) {
						userData.firstName = firstName;
					}
					if(lastName) {
						userData.lastName = lastName;
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
							console.log(err);
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
			callback(400, {'Error': 'Missing fields to update'});
		}
	}
	else {
		callback(400, {'Error': 'Missing required field(phone)'});
	}
};

// Users - delete
// Required data: phone
/**
 * @TODO Only let an authenticated user access their object
 * don't let anyone else access their object
 * @TODO clean up or delete any other data files associated to the user
 */
handlers._users.delete = function (data, callback) {
	// Check that the phone number is valid
	var phone = (typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10) ? data.queryStringObject.phone : false;
	if(phone) {
		_data.read('users', phone, function (err, data) {
			if(!err && data) {
				_data.delete('users', phone, function (err) {
					if(!err) {
						callback(200);
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
		callback(400, {'Error': 'Missing required field(phone)'});
	}
};

// notFound handler
handlers.notFound = function (data, callback) {
	callback(404);
};

// PING handler
handlers.ping = function(data, callback) {
	callback(200);
};

module.exports = handlers;