/**
 * Helpers for various tasks
 * 
 */

// Dependencies
const fs = require('fs');
const path = require('path');

// Required paths for base templates and views
const templates = path.resolve(__dirname,'../templates/');
const views = path.resolve(__dirname,'../views/');

//  Container for all the helpers
var helpers = {};

/**
 * Return the page layout HTML for the requested page, including the global header and footer
 * 
 * @param {String} fileName : name of the view that is requested
 * @param {Function} callback : returns entire page layout including the header and footer or an error
 */
helpers.findPage = async function (fileName, callback) {
	try {
		var header = await fs.readFileSync(templates+'/_header.html', 'utf8');
		var template = await fs.readFileSync(views+'/'+fileName+'.html','utf8');
		var footer = await fs.readFileSync(templates+'/_footer.html', 'utf8');
		var page = header + template + footer;
		callback(false, page);
	} catch (err) {
		callback(err);
	}
};

// export the container
module.exports = helpers;