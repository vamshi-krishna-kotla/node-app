import React, { Component } from 'react';

import Info from '../components/Info/Info';
import Dev from '../components/Dev/Dev';
import Features from "../components/Features/Features";

import styles from './App.module.scss';

import './index.scss';

class App extends Component {

	state = {
	};
	
	constructor(props) {
		super(props);
	}

	render() {
		return(
			<div className="App">
				<div className = {styles.App}>
					<Info propClass = "propInfo" />
					<Dev propClass = "propDevInfo" />
					<Features propClass = "propFeatures" />
				</div>
			</div>
		);
		/**
		 * The state of the App component can be modified by the child components
		 * 
		 * We are passing functions to edit the parent state down to the children
		 * 
		 * Replacement of this feature is usage of a global state (which is not necessary for this project)
		 */
	}
}

export default App;