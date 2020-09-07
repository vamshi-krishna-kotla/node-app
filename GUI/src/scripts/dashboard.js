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
		let userData = Object.assign(loginData[currentUser], {'phone': currentUser});
		// user has signed in
		showUserInfo(userData);
		showUserChecks(userData);
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

async function showUserInfo(userData) {
	try{
		var response = await fetch(`http://localhost:3000/users?phone=${userData.phone}`, {
			method: 'GET',
			headers: {
				'token': userData.tokenId
			}
		});
		const data = await response.json();
		if(response.status === 200) {
			// user details found: populate DOM with details
			hideHeaderLinks('sign-in', 'sign-up');
			fillUserDetails(data);
		}
		else {
			// user details not found; alert the user
			hideHeaderLinks('log-out', 'create-check', 'sign-up');
			var alertData = {
				'message': '',
				'linkText': 'Please sign-in again!',
				'link': 'sign-in',
				'type': ''
			};
			if(response.status === 403) {
				// user token is invalid
				Object.assign(alertData, {
					'message': data.Error,
					'type': 'notify'
				});
			}
			else {
				// Error fetching details, try signing in again
				Object.assign(alertData, {
					'message': `${response.status}: ${data.Error}`,
					'type': 'fail'
				});
			}
			const a = new Alert(alertData);
			a.appendAlertToDOM('.user-details');
		}
	}
	catch(e) {
		console.error(e);
	}
}

function fillUserDetails(userDetails) {
	console.log(userDetails);
	/**
	 * @todo fill in details of user
	 */
}