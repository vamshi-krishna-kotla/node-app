/**
 * Library used for storing and editing data
 * 
 */

// Dependencies
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// Container for this module (to be exported)
var lib = {};

// base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

/**
 * Write data to a file
 * 
 * @param {*} dir : directory inside the .data folder to be accessed
 * @param {*} file : file inside the given directory to be created new
 * @param {*} data : JSON data to be written to the file
 * @param {*} callback : returns any error if operation failed else returns false
 */
lib.create = function (dir, file, data, callback) {
	// Open the file for writing

	// the "wx" swtich is to create a new file and write into it
	// gives an error if the file already exists!
	fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', function(err, fileDescriptor) {
		if(!err && fileDescriptor) {
			// convert data to string
			var stringData = JSON.stringify(data);

			// write to file and close it
			fs.writeFile(fileDescriptor, stringData, function (err) {
				if(!err) {
					fs.close(fileDescriptor, function (err) {
						if(!err) {
							callback(false);
						}
						else {
							callback('Error closing new file');
						}
					});
				}
				else {
					callback('Error writing to new file');
				}
			});
		}
		else {
			callback('Could not create new file; it may already exist');
		}
	}); 
};

/**
 * Read data from a file
 * 
 * @param {*} dir : directory inside the .data folder to be accessed
 * @param {*} file : file inside the given directory, whose contents are to be read
 * @param {*} callback : returns data read from the file, after parsing the data, and error:false else returns an error and data:undefined
 */
lib.read = function (dir, file, callback) {
	fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', function(err, data){
		// return 'err' and 'data' in same order and read in same order
		if(!err && data) {
			var parsedData = helpers.parseJsonToObject(data);
			callback(false, parsedData);
		}
		else {
			callback(err,data);
		}
	});
};

/**
 * Update the data inside an exisiting file
 * Truncates any current data present currently in a file and writes new data
 * 
 * @param {*} dir : directory inside the .data folder to be accessed
 * @param {*} file : file inside the given directory to be accessed; needs to be already present
 * @param {*} data : JSON data to be written to the file
 * @param {*} callback : returns any error if operation failed else returns false
 */
lib.update = function (dir, file, data, callback) {
	// the "r+" switch is used to work with an already existing file
	// gives an error if the file doesn't exist at all
	fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', function (err, fileDescriptor) {
		if(!err && fileDescriptor) {
			var stringData = JSON.stringify(data);

			// trunctate the file

			// fs.ftruncate is used to truncate (erase) the data from a file using fileDescriptor
			fs.ftruncate(fileDescriptor, function (err) {
				if(!err) {
					fs.writeFile(fileDescriptor, stringData, function (err) {
						if(!err) {
							fs.close(fileDescriptor, function (err) {
								if(!err) {
									callback(false);
								}
								else {
									callback('Error closing the file');
								}
							});
						}
						else {
							callback('Error writing new data into the file');
						}
					});
				}
				else {
					callback('Error truncating the file');
				}
			});
		}
		else {
			callback('Could not open the given file; file may not exist!');
		}
	});
};

/**
 * Delete a file
 * 
 * @param {*} dir : directory inside the .data folder to be accessed
 * @param {*} file : file inside the given directory, that has to be deleted
 * @param {*} callback : returns err:false if file is deleted successfully else returns a string
 */
lib.delete = function (dir, file, callback) {
	fs.unlink(lib.baseDir + dir + '/' + file + '.json', function (err) {
		if(!err) {
			callback(false);
		}
		else {
			callback('Error deleting file');
		}
	});	
};

/**
 * List the content in a directory
 * 
 * @param {*} dir : directory inside the .data folder to be accessed
 * @param {*} callback : returns err:false and list of files, if files are found inside the directory
 */
lib.list = function (dir, callback) {
	fs.readdir(lib.baseDir+dir+'/', function (err, data) {
		if(!err && data && data.length > 0) {
			var trimmedFilenames = [];
			data.forEach(function (fileName) {
				trimmedFilenames.push(fileName.replace('.json', ''));
			});
			callback(false, trimmedFilenames);
		}
		else {
			callback(err, data);
		}
	});
};

// Export the module
module.exports = lib;