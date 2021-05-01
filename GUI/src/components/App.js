import React, { Component } from 'react';

import Info from '../components/Info/Info';
import Dev from '../components/Dev/Dev';
import Features from "../components/Features/Features";

import styles from './App.module.scss';

import './index.scss';

class App extends Component {
	
	constructor(props) {
		super(props);
	}

	render() {
		return(
			<div className = {styles.App}>
				<Info propClass = "propInfo"/>
				<Dev propClass = "propDevInfo"/>
				<Features propClass = "propFeatures"/>
			</div>
		);
	}
}

export default App;