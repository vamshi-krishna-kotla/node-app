/**
 * Create and export configuration variables
 * 
 */

//  container for all the environments

var environments = {
	// staging (default) environment
	"staging": {
		'port': 3000,
		'envName': 'staging',
		'hashingSecret': 'thisIsASecret'
	},
	// production environment
	"production": {
		'port': 5000,
		'envName': 'production',
		'hashingSecret': 'thisIsAlsoASecret'
	}
};



// determine which environment to be exported
var currentEnvironment = typeof(process.env.NODE_ENV) == "string" ? process.env.NODE_ENV.toLowerCase().replace(/ /g, '') : '';

// check that current environment is one of the environments above, if not, default to staging
var environmentToExport = typeof(environments[currentEnvironment]) == "object" ? environments[currentEnvironment] : environments.staging;

// export the module
module.exports = environmentToExport;