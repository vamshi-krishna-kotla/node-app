const path = require('path');
const fs = require('fs');

const scriptsPath = path.resolve(__dirname, 'src', 'scripts');
const scripts = fs.readdirSync( scriptsPath, "utf8" );

var fileMap = {};
scripts.forEach(script => {
	fileMap[script] = path.resolve(scriptsPath, script);
});

module.exports = {
	entry: fileMap,
	output: {
		path: path.resolve(__dirname, 'dist', 'scripts'),
		filename: '[name]'
	}
}

// console.log(fileMap)