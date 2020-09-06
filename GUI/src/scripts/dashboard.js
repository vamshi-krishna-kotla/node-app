import '../styles/dashboard.scss';

import { Alert, hideHeaderLinks } from '../support';

window.onload = function () {
	hideHeaderLinks('sign-in', 'sign-up', 'create-check', 'log-out');

	// get sessioStorage data
	const loginData = JSON.parse(sessionStorage.getItem('appUserData'));

	// get current user from querystring
	const queryString = window.location.search.substring(1).split('&');
	var currentUser = queryString.find( q => {
		return q.indexOf('user') > -1;
	});
	currentUser = currentUser.slice(currentUser.indexOf('=') + 1, currentUser.length);
	document.getElementById('title').innerHTML = `${currentUser} Dashboard!`;

	// check whether the user is logged in
	if(loginData && loginData[currentUser]) {
		// user has signed in
		showUserChecks(loginData[currentUser]);
	}
	else {
		// user data is not present in sessionStorage, user needs to sign-in
		// display alert to user to sign-in
		var alertData = {
			'message': 'You are not signed in!',
			'linkText': 'Please sign-in!',
			'link': 'sign-in',
			'type': 'notify'
		};
		const a = new Alert(alertData);
		a.appendAlertToDOM('.page-content');
	}
};

async function showUserChecks(userData) {
	hideHeaderLinks('sign-in', 'sign-up');

	// make call to API to retrive user checks
	try {
		var response = await fetch(`http://localhost:3000/checks?id=${userData.tokenId}`, {
			method: 'GET'
		});
		if(response.status === 200) {
			/**
			 * @todo succesful http call: populate the DOM with userchecks
			 */
			var responseData = await response.json();
		}
		else if(response.status === 404) {
			/**
			 * @todo no checks found: prompt the user to create checks
			 */
		}
		else if(response.status === 400 || response.status === 403) {
			/**
			 * @todo error with the request: show error to the user
			 */
		}
	}
	catch(e) {
	}
}