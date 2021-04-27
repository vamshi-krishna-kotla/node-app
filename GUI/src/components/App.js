import React, { Component } from 'react';

class App extends Component {
	
	constructor(props) {
		super(props);

		// state should be set in the constructor
		// didn't allow to be set as a class property
		this.state = {
			library: "React"
		}
	}

	render() {
		return(
			<div>
				<h1>{this.state.library} component is working</h1>
			</div>
		);
	}
}

export default App;