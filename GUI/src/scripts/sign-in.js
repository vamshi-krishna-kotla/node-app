import '../styles/sign-in.scss';

import { Alert,hideHeaderLinks } from '../support';

document.addEventListener('DOMContentLoaded', function () {
	signInPageInit();
});

/**
 * init method for the page
 */
function signInPageInit() {
	hideHeaderLinks('sign-in', 'log-out');

	document.querySelector('#login-form').addEventListener('submit', function(event) {
		// stop the form from default submission
		event.preventDefault();
		let payload = {};
		let elements = [...this.elements];
		['phone', 'password'].forEach(sel => {
			payload[sel] = elements.find(function (e) {
				return e.className == sel;
			}).value;
		});

		signInUser(payload);

	});
};

/**
 * 
 * @param {Object} payload : required data to log-in an existing user
 * Log-in a user with http POST request to create a new token
 */
async function signInUser(payload) {
	var alertData = {
		'message': '',
		'linkText': false,
		'link': false,
		'type': 'notify'
	};
	try {
		// POST to API with payload
		var response = await fetch('http://localhost:3000/tokens', {
			method: 'POST',
			body: JSON.stringify(payload)
		});

		var data = await response.json();

		// handle the response
		if(response.status == 200) {
			// if the POST request returns 200 - display a success message to the user
			// give a link to dashboard for the signed in user - take to dashboard page
			alertData = {
				'message': 'Signed In successfully! Session expires in 1 hour!!',
				'linkText': '<link to dashborad>!',
				// sending number of the user as querystring parameter
				'link': `dashboard?user=${data.phone}`,
				'type': 'success'
			};

			// handle the response from the succesful request
			handleResponse(data);
		}
		else if(response.status == 400 || response.status == 500) {
			// if the response is invalid - display an error message to the user with msg regarding invalid request
			alertData = {
				'message': data.Error,
				'type': 'fail'
			};
		}
		else {
			// if the response is anything else - display an error message to the user
			throw 'Error while signing in! Please try again later!';
		}
	}
	catch(e) {
		alertData = {
			'message': (typeof e === 'string') ? e : 'Error: Couldn\'t make a successful HTTP fetch call!',
			'type': 'notify'
		};
		console.error(e);
	}
	finally {
		const a = new Alert(alertData);
		a.appendAlertToDOM('.page-content');
	}
}

/**
 * 
 * @param {Object} responseData : response data received after successfully logging in a user
 * Set the token value to be used for the session
 */
function handleResponse(responseData) {
	
	// get session data of logged in users
	var appUserData = JSON.parse(sessionStorage.getItem('appUserData')) || {};

	// set data of current logged in user with updated token
	appUserData[responseData.phone] = {
		'tokenId': responseData.id,
		'expires': responseData.expires
	}
	sessionStorage.setItem('appUserData', JSON.stringify(appUserData));
}