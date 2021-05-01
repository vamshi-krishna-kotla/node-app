import React, { Component } from 'react';

import styles from './Features.module.scss';

export default class Features extends Component {
	state = {};

	constructor(props) {
		super(props);
	}

	render () {
		return (
			<div className={[styles.features, this.props.propClass].join(' ')}>
				Features List
			</div>
		);
	};
}