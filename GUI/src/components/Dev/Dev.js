import React, { Component } from 'react';

import styles from './Dev.module.scss';

export default class Dev extends Component {
	state = {
		devFeatures : [
			"Usage of React library",
			"Independent of `create-react-app` template",
			"Built with CSS modules"
		]
	};

	constructor(props) {
		super(props);
	}

	modifyCommonStateInput = (event) => {
		this.props.modifyCommonStateInput(event.target.value);
	};

	render() {
		return(
			<div className={[styles.dev, this.props.propClass].join(' ')}>
				<p className={styles.title}><strong>Tech Features</strong></p>
				<hr></hr>
				<ul className={styles.devFeaturesList}>
					{
						this.state.devFeatures.map((feature, index) => <li className={styles.devFeaturesListItem} key={index}>{feature}</li>)
					}
				</ul>
				<input onInput={this.modifyCommonStateInput}></input>
			</div>
		);
	}
}