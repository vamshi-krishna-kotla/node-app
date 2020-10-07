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
		(document.querySelector(`.user-details input.user-${key}`) || {}).value = userDetails[key];
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
function showUserChecks(userDetails, tokenId) {

	document.querySelector('#new-check-form').addEventListener("submit", function (event) {
		event.preventDefault();
		createNewCheck(tokenId);
	});

	const tableBody = document.querySelector('#user-check-details table#current-checks tbody');

	if(userDetails.checks && userDetails.checks.length > 0) {
		// there are checks present for a user
		userDetails.checks.forEach(async check => {
			var response = await fetch(`http://localhost:3000/checks?id=${check}`, {
				method: 'GET',
				headers: {
					token: tokenId
				}
			});

			const data = await response.json();

			if(response.status == 200) {
				// show check to the user
				var newCheckRow = document.createElement('tr');
				newCheckRow.innerHTML = 
				`<td>${data.id}</td>
				<td>${data.protocol}</td>
				<td>${data.url}</td>
				<td>${data.method}</td>
				<td>${data.successCodes}</td>
				<td>${data.timeoutSeconds}</td>`;

				newCheckRow.addEventListener('click', function(){
					// expand to view/edit/delete check
					expandCheck(newCheckRow, tokenId);
				});

				tableBody
					.appendChild(newCheckRow);
			}
			else {
				const newAlert = new Alert({
					'message': 'Error fetching check details!',
					'type': 'fail'
				});
				newAlert.appendAlertToDOM('#user-check-details');
			}
		});
	}
	else {
		// no checks currently
		tableBody
			.insertAdjacentHTML('beforeend','<tr class="no-check-row"><td colspan=6>No checks!</td></tr>');
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

		// close the edit options
		document.querySelector('#user-personal-details .close-edit').click();

	} catch (error) {
		console.error(error);
	}
}

/**
 * 
 * @param {String} tokenId: login token of the signed in user
 * 
 * Creates a new check if all inputs are valid  
 */
async function createNewCheck(tokenId) {
	const form = document.querySelector('#new-check-form');

	var payload = {};

	payload.protocol = form.querySelector('#new-check-protocol').value;
	payload.url = form.querySelector('#new-check-url').value;
	payload.method = form.querySelector('#new-check-method').value;
	payload.successCodes = [];
	payload.timeoutSeconds = parseInt(form.querySelector('#new-check-timeoutSec').value);

	[...form.querySelectorAll('input[name="statusCode"]')].forEach(input => {
		if(input.checked) {
			payload.successCodes.push(input.value);
		}
	});

	if(payload.successCodes.length > 0) {
		// send POST request to create new check
		try {
			var response = await fetch('http://localhost:3000/checks', {
				method: 'POST',
				body: JSON.stringify(payload),
				headers: {
					token: tokenId
				}
			});

			var data = await response.json();

			if(response.status == 200) {
				// fetched successful response from create check method
				var newCheckRow = document.createElement('tr');
				newCheckRow.innerHTML = 
				`<td>${data.id}</td>
				<td>${data.protocol}</td>
				<td>${data.url}</td>
				<td>${data.method}</td>
				<td>${data.successCodes}</td>
				<td>${data.timeoutSeconds}</td>`;

				// add the new check to current-checks table
				newCheckRow.addEventListener('click', function(){
					// expand to view/edit/delete check
					expandCheck(newCheckRow, tokenId);
				});
				document.querySelector('#user-check-details table#current-checks tbody')
					.appendChild(newCheckRow);

				// remove the 'no-check-row' if new row is added
				var noCheckRow = document.querySelector('.no-check-row');
				if(noCheckRow) {
					noCheckRow.remove();
				}
				
				// notify the user
				const newAlert = new Alert({
					'message': 'New check added!',
					'type': 'success'
				});
				newAlert.appendAlertToDOM('#check-operation-update');
			}
			else {
				const newAlert = new Alert({
					'message': data.Error,
					'type': 'notify'
				});
				newAlert.appendAlertToDOM('#check-operation-update');
			}
		} catch (error) {
			console.error(error);
		}
	}
	else {
		const newAlert = new Alert({
			'message': 'Please select one or more success codes!',
			'type': 'notify'
		});
		newAlert.appendAlertToDOM('#user-check-details');
	}
}

/**
 * 
 * @param {Node} row : the row element which is clicked
 * @param {String} tokenId : signed-in user login Id
 * 
 * Expand the clicked check to view, edit and delete that check
 * 
 * @todo expand modal with check details and button clicks
 */
function expandCheck(row, tokenId) {
	var popUp = document.querySelector('.pop-up');
	popUp.addEventListener('click', function(event) {
		if(event.target == popUp) {
			if(popUp.firstChild) {
				popUp.removeChild(popUp.firstChild);
			}
			popUp.classList.add('hide');
		}
	});

	// filter check data from the table node 
	var rowData = [];
	row.querySelectorAll('td').forEach(data => {
		rowData.push(data.innerText)
	});

	// populate the modal with check content
	popUp.querySelectorAll('div table td .field').forEach((cell, index) => {
		cell.value = rowData[index];
	})

	// add delete option to the modal
	var deleteCheckButton = popUp.querySelector('button.delete-button');
	deleteCheckButton.onclick = function() {
		deleteCheck(row, tokenId);
		popUp.classList.add('hide');
	};

	// add update option to the modal
	var updateCheckButton = popUp.querySelector('button.update-button');
	updateCheckButton.onclick = function() {
		updateCheck(row, tokenId);
		popUp.classList.add('hide');
	};
	
	// display the modal 
	popUp.classList.remove('hide');

}

/**
 * 
 * @param {Node} row : the row element which is clicked
 * @param {*} tokenId : signed-in user login Id
 * 
 * Delete the current check and remove the row from DOM
 */
async function deleteCheck(row, tokenId) {
	var checkId = row.querySelectorAll('td')[0].innerHTML;
	const tableBody = row.parentElement;
	try {
		var response = await fetch(`http://localhost:3000/checks?id=${checkId}`, {
			method: 'DELETE',
			headers: {
				token: tokenId
			}
		});
	
		const data = await response.json();
	
		if(response.status == 200) {
			// delete the current row from DOM
			row.remove();

			// add no-check-row if all checks are deleted
			if(tableBody.querySelectorAll('tr').length == 0) {
				tableBody
					.insertAdjacentHTML('beforeend','<tr class="no-check-row"><td colspan=6>No checks!</td></tr>');
			}

			const newAlert = new Alert({
				'message': 'Removed check successfully',
				'type': 'success'
			});
			newAlert.appendAlertToDOM('#check-operation-update');
		}
		else {
			const newAlert = new Alert({
				'message': data.Error,
				'type': 'notify'
			});
			newAlert.appendAlertToDOM('#check-operation-update');
		}
	} catch (error) {
		console.error(error);
	}
}

/**
 * 
 * @param {Node} row : the row element which is clicked
 * @param {*} tokenId : signed-in user login Id
 * 
 * Update the current check and update the row on the table
 * 
 */
async function updateCheck(row, tokenId) {
	var checkTable = document.querySelector('.pop-up .pop-up-content table');

	var payload = {};
	var check = checkTable.querySelector('input[name="check-id"]').value;

	// get check data
	payload.protocol = checkTable.querySelector('input[name="protocol"]').value;
	payload.url = checkTable.querySelector('input[name="url"]').value;
	payload.method = checkTable.querySelector('input[name="method"]').value;
	payload.successCodes = checkTable.querySelector('input[name="success-codes"]').value;
	payload.timeoutSeconds = checkTable.querySelector('input[name="timeout-seconds"]').value;

	// parse check data
	payload.timeoutSeconds = parseInt(payload.timeoutSeconds);
	payload.successCodes = payload.successCodes.split(',');

	try {
		var alertData = {};

		// send the request
		var response = await fetch(`http://localhost:3000/checks?id=${check}`, {
			method: 'PUT',
			body: JSON.stringify(payload),
			headers: {
				token: tokenId
			}
		});

		if(response.status == 200) {
			// update the row
			row.insertAdjacentHTML('afterend',
			`<tr>
				<td>${check}</td>
				<td>${payload.protocol}</td>
				<td>${payload.url}</td>
				<td>${payload.method}</td>
				<td>${payload.successCodes}</td>
				<td>${payload.timeoutSeconds}</td>
			</tr>`);
			row.remove();
			// show an alert with successful message
			alertData = {
				"message": "Check updated successfully!",
				"type": "success"
			};
		}
		else {
			const data = await response.json();

			// show an alert with failure message
			alertData = {
				"message": data.Error,
				"type": "fail"
			};
		}
	} catch (error) {
		alertData = {
			"message": "Failed to update check! Please try again later!",
			"type": "fail"
		};
	}
	finally {
		const newAlert = new Alert(alertData);
		newAlert.appendAlertToDOM('#check-operation-update');
	}
}