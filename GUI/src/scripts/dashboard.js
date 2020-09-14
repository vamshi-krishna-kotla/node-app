import '../styles/dashboard.scss';

import { Alert, hideHeaderLinks } from '../support';

document.addEventListener('DOMContentLoaded', function(){
	dashboardInit();
});

/**
 * init method for the page
 */
function dashboardInit() {
	hideHeaderLinks('sign-in', 'sign-up', 'log-out');

	// get sessioStorage data
	const loginData = JSON.parse(sessionStorage.getItem('appUserData'));

	// get current user from querystring
	const queryString = window.location.search.substring(1).split('&');
	var currentUser = queryString.find( q => {
		return q.indexOf('user') > -1;
	});

	// get currentUser data from querystring if a valid query parameter is given
	if(currentUser) {
		currentUser = currentUser.slice(currentUser.indexOf('=') + 1, currentUser.length);
		document.getElementById('title').innerHTML = `${currentUser} Dashboard!`;
	}

	// check whether the user is logged in
	if(currentUser && loginData && loginData[currentUser]) {
		let userData = Object.assign(loginData[currentUser], {'phone': currentUser});
		// user has signed in
		getUserInfo(userData);
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

/**
 * 
 * @param {Object} userData : data of a user as present in sessionStorage
 * Make a http GET call to fetch the details of a user
 * Call in functions to display user data
 */
async function getUserInfo(userData) {
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

			// show pre-registered user checks
			showUserChecks(data);
		}
		else {
			// user details not found; alert the user
			hideHeaderLinks('log-out', 'sign-up');
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
			a.appendAlertToDOM('.page-content');
		}
	}
	catch(e) {
		console.error(e);
	}
}

/**
 * 
 * @param {Object} userDetails : user data sent by a successful http request
 * Populate the personal details of the user onto the DOM
 */
function fillUserDetails(userDetails) {
	// show user detials table
	document.querySelector('.user-details').classList.remove('hide');

	/**
	 * fill in personal details of user
	 */
	const userInfo = {
		'firstName': userDetails.firstName,
		'lastName': userDetails.lastName,
		'email': userDetails.email,
		'phone': userDetails.phone,
	};
	var key;
	for( key in userInfo ) {
		document.querySelector(`.user-details input.user-${key}`).value = userDetails[key];
	}
}

/**
 * 
 * @param {Object} userDetails : user data sent by a successful http request
 * Filter for any checks present currently and display
 * Notify user if no checks are present
 */
async function showUserChecks(userDetails) {
	if(userDetails.checks && userDetails.checks.length > 0) {
		// there are checks present for a user
		/**
		 * @todo fetch each check details and fill the user checks table
		 */
	}
	else {
		// no checks currently
		document.querySelector('#user-check-details table')
			.insertAdjacentHTML('beforeend','<tr><td class="no-check-row" colspan=5>No checks!</td></tr>');
	}
}