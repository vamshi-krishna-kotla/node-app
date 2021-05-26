import React, { Component } from 'react';

import Info from '../components/Info/Info';
import Dev from '../components/Dev/Dev';
import Features from "../components/Features/Features";

import styles from './App.module.scss';

import './index.scss';

class App extends Component {

	state = {
		commonStateInput: ''
	};
	
	constructor(props) {
		super(props);
	}

	modifyCommonStateInput = (value) => {
		this.setState({
			commonStateInput: value
		})
	};

	render() {
		return(
			<div className="App">
				<div className = {styles.App}>
					<Info propClass = "propInfo" modifyCommonStateInput = {this.modifyCommonStateInput} />
					<Dev propClass = "propDevInfo" modifyCommonStateInput = {this.modifyCommonStateInput} />
					<Features propClass = "propFeatures" modifyCommonStateInput = {this.modifyCommonStateInput} />
				</div>

				<p>This text area can be modified from other components</p>
				<p>Use the input boxes in the above modules</p>
				<h1>{this.state.commonStateInput}</h1>
			</div>
		);
	}
}

export default App;