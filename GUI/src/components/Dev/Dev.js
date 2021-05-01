import React, { Component } from 'react';

import styles from './Dev.module.scss';

export default class Dev extends Component {
	state = {};

	constructor(props) {
		super(props);
	}

	render() {
		return(
			<div className = {[styles.dev, this.props.propClass].join(' ')}>
				Developed using REACT
			</div>
		);
	}
}