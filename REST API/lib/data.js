/**
 * Library used for storing and editing data
 * 
 */

// Dependencies
const fs = require('fs');
const path = require('path');

// Container for this module (to be exported)
var lib = {};

// base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// Write data to a file
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

// Read data from a file
lib.read = function (dir, file, callback) {
	fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', function(err, data){
		// return 'err' and 'data' in same order and read in same order
		callback(err,data);
	});
};

// Update the data inside an exisiting file
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

// Delete a file
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

// Export the module
module.exports = lib;