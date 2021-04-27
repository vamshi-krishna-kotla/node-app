import '../styles/home.scss';

import { hideHeaderLinks } from '../support';

import React from 'react';
import ReactDOM from 'react-dom';

import App from '../components/App';

document.addEventListener('DOMContentLoaded', function(){
	homePageInit();
});

function homePageInit() {
	hideHeaderLinks('log-out');
	ReactDOM.render(<App />	, document.getElementById('root'));
}