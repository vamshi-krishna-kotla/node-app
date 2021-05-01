import React, { Component } from 'react';

import Info from '../components/Info/Info';

import styles from './App.module.scss';

class App extends Component {
	
	constructor(props) {
		super(props);
	}

	render() {
		return(
			<div className = {styles.App}>
				<Info />
			</div>
		);
	}
}

export default App;