export class Alert {
	constructor(data) {
		this.displayText = data.message || '';
		this.linkText = data.linkText || false;
		this.link = data.link || false;
		this.type = (['notify', 'success', 'fail'].indexOf(data.type) > -1) ? data.type : 'notify';
	}

	appendAlertToDOM(targetSelector) {
		// remove previous alerts
		this.removeAlert();
		
		// build new alert
		var newAlertDiv = this.buildAlertHTML();
		
		// append new alert to DOM
		document.querySelector(targetSelector).appendChild(newAlertDiv);
	}

	removeAlert() {
		// if there is any previous alert then take it off of DOM
		var prevAlert = document.querySelector('.alert');
		if(prevAlert) {
			prevAlert.remove();
		}
	}

	buildAlertHTML() {
		// build the alert with relevant classes
		var newDiv = document.createElement('div');
		newDiv.setAttribute('class', 'alert');
		newDiv.classList.add(`alert-${this.type}`);
		var text = document.createElement('span');
		text.appendChild(document.createTextNode(this.displayText))
		newDiv.appendChild(text);

		// if any link is given, append it
		if(this.link && this.linkText) {
			var appendLink = document.createElement('a');
			appendLink.setAttribute('href', `/${this.link}`);
			appendLink.appendChild(document.createTextNode(this.linkText));
			newDiv.appendChild(appendLink);
		}
		
		// add close icon for the alert box
		var closeAlert = document.createElement('span');
		closeAlert.innerHTML = '&#x2715;';
		closeAlert.setAttribute('class', 'alert-close');
		closeAlert.onclick = () => {
			this.removeAlert();
		};
		newDiv.appendChild(closeAlert);

		return newDiv;
	}
}
