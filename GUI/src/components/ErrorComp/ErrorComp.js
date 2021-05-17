import React, { useEffect } from 'react';

// seperated HTML into another file
import ErrorCompHTML from './ErrorComp.html';

import styles from './ErrorComp.module.scss';

function ErrorComp() {

	// local variable to store updated HTML
	let errorComponentHTML;

	useEffect(() => {

		/**
		 * removing the commented part(s) from the 
		 * imported HTML before appending it to the DOM
		 * 
		 * replacing with empty string, the {text, spaces, ", <, >, =, :, ',', [, ], -} 
		 * that are present in between the comment tags <!-- and -->
		 */
		errorComponentHTML = ErrorCompHTML.replace(/<!--[\w\s:,\"-<=>\[\]]+-->/gm, '');

		// set the HTML once the component is mounted onto the DOM
		document.querySelector(`.${styles['error-page']}`).insertAdjacentHTML('afterbegin', errorComponentHTML);
		/**
		 * set the CSS module classes to all elements that are given the
		 * data-class attribute in the HTML section
		 */
		try {
			[...document.querySelectorAll('[data-class]')].forEach(element => {
				element.classList.add(styles[`error-${element.dataset.class}`]);
			});
		}
		catch(err) {
			console.error(err);
		}
	});

	return(
		// the parent div where the HTML will be put into
		<div className={styles['error-page']}>
			placeholder test text for any components to be added inside Error page component
		</div>
	);

}

export default ErrorComp;