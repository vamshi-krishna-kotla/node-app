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
			fillUserDetails(data, userData.tokenId);

			// show pre-registered user checks
			showUserChecks(data, userData.tokenId);
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
function fillUserDetails(userDetails, tokenId) {
	// show user detials table
	document.querySelector('.user-details').classList.remove('hide');

	/**
	 * fill in personal details of user
	 */
	delete userDetails.tosAgreement;
	var key;
	for( key in userDetails ) {
		document.querySelector(`.user-details input.user-${key}`).value = userDetails[key];
	}

	// hoist required elements
	const fName =  document.querySelector('.user-firstName');
	const lName = document.querySelector('.user-lastName');
	const email = document.querySelector('.user-email');
	const updateButton = document.querySelector('.update-user-details');
	const newPasswordRow = document.querySelector('.new-password-row');
	const updatedPassword = document.querySelector('.user-updated-password');
	const closeEdit = document.querySelector('.close-edit');
	const triggerEdit = document.querySelector('.trigger-edit-user-details');

	// make the user form editable to update details
	triggerEdit.addEventListener('click', function(){
		// make the first name, last name and email fields editable
		[fName, lName, email].forEach(element => {
			element.disabled = false;
			element.classList.add('editable');
		});

		// show the password field
		newPasswordRow.classList.remove('hide');

		// show the update user details button
		updateButton.classList.remove('hide');
		updateButton.onclick = () => {
			updateUserDetails({
				'firstName': fName.value,
				'lastName': lName.value,
				'email': email.value,
				'password': updatedPassword.value,
			}, userDetails.phone, tokenId);
		};

		// show "close edit" button
		closeEdit.classList.remove('hide');

		// hide trigger edit button
		triggerEdit.classList.add('hide');

	});

	// close edit options when clicked on "close edit" button
	closeEdit.addEventListener('click', () => {
		// hide update edit button
		updateButton.classList.add('hide');

		// show edit button
		triggerEdit.classList.remove('hide');
		
		// hide the password field
		newPasswordRow.classList.add('hide');

		// hide the close edit button
		closeEdit.classList.add('hide');

		// make the first name, last name and email fields un-editable
		[fName, lName, email].forEach(element => {
			element.disabled = true;
			element.classList.remove('editable');
		});
	});
}

/**
 * 
 * @param {Object} userDetails : user data sent by a successful http request
 * Filter for any checks present currently and display
 * Notify user if no checks are present
 */
async function showUserChecks(userDetails, tokenId) {
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

/**
 * 
 * @param {Object} payload : data to be sent to the API to update user details
 * @param {String} userPhone : phone number of user to identify a user, sent as querystring param
 * @param {String} userTokenId : user login token ID sent as header to the API
 * 
 * Make a PUT request to update the user details with given data
 */
async function updateUserDetails(payload, userPhone, userTokenId) {
	// remove empty values from the payload
	var key;
	for(key in payload) {
		if(!payload[key]) {
			delete payload[key];
		}
	}

	// send PUT request to update user details
	try {
		var response = await fetch(`http://localhost:3000/users?phone=${userPhone}`, {
			method: 'PUT',
			// need to send stringified data as payload!
			body: JSON.stringify(payload),
			headers: {
				'token': userTokenId
			}
		});

		var alertData = {
			'message': '',
			'linkText': '',
			'link': '',
			'type': ''
		};

		if(response.status === 200) {
			// details updated successfully
			// alert the user with a success message
			alertData.message = "Details updated successfully!";
			alertData.type = "success";
		}
		else {
			// alert the user based on the response
			const data = await response.json();
			alertData.message = data.Error || "Error while updating";
			alertData.type = "fail";
		}
		const alert = new Alert(alertData);
		alert.appendAlertToDOM('#user-personal-details');

	} catch (error) {
		console.error(error);
	}
}