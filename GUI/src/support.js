export class Alert {
	constructor(displayText, linkText, link) {
		this.displayText = displayText || '';
		this.linkText = linkText || false;
		this.link = link || false;
	}

	appendToDOM(targetSelector) {
		// remove previous alerts
		this.removePreviousAlert();
		
		// append new alert to DOM
		var newDiv = document.createElement('div');
		newDiv.setAttribute('class', 'alert');
		newDiv.innerHTML = this.displayText;
		document.querySelector(targetSelector).appendChild(newDiv);
	}

	removePreviousAlert() {
		// if there is any previous alert then take it off of DOM
		var prevAlert = document.querySelector('.alert');
		if(prevAlert) {
			prevAlert.remove();
		}
	}
}
