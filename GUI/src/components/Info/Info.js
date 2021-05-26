import React, { Component } from 'react';

import styles from './Info.module.scss';

class Info extends Component {
	state = {
		pageStatus: true,
		timeout: setInterval(()=>{
			this.togglePageStatus();
		}, 3500)
	};

	constructor(props) {
		super(props);
	}

	
	togglePageStatus = () => {
		this.setState((currentState) => {
			return {
				pageStatus: !currentState.pageStatus
			}
		});
	};

	render() {
		return(
			<div className={[styles.info, this.props.propClass, this.state.pageStatus ? styles.up : styles.down].join(' ')}>
				Get notified if your page is {this.state.pageStatus ? "UP" : "DOWN"}
			</div>
		);
	}
}

export default Info;