import '../styles/sign-up.scss';

// get data from the form
window.onload = function () {
	document.querySelector('#user-data').addEventListener('submit', function(event) {
		// stop the form from default submission
		event.preventDefault();
		let payload = {};
		let elements = [...this.elements];
		['firstName', 'lastName', 'email'].forEach(sel => {
			payload[sel] = elements.find(function (e) {
				return e.className == sel;
			}).value;
		});

		payload['tosAgreement'] = true;

		// validate phone number
		let phoneNumber = elements.find(function (e) {
			return e.className == 'phone';
		}).value;

		if(validatePhone(phoneNumber)) {
			payload['phone'] = phoneNumber;

			// validate whether password and re-entered password are same
			let enteredPassword = elements.find(function (e) {
				return e.className == 'password';
			}).value;
			let checkPassword = elements.find(function (e) {
				return e.className == 'reenter-password';
			}).value;
	
			let finalPassword = (enteredPassword === checkPassword) ? enteredPassword : false;
			if(finalPassword) {
				payload['password'] = finalPassword;
				
				// put a post request to API with the obtained 'payload' object
				/**
				 * @todo put a POST to API and get the result
				 */
				console.log('POST to the API');
			}
			else {
				alert('Passwords do not match!');
			}
		}
		else {
			alert('Please enter a valid phone number [10 digits]');
		}

	});

};

function validatePhone(phone) {
	// return true if phone is number and of 10 digits; else return false
	return /^[0-9]{10}$/.test(phone);
}