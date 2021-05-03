import '../styles/404.scss';

import { hideHeaderLinks } from '../support';

import React from 'react';
import ReactDOM from 'react-dom';

import ErrorComp from "../components/ErrorComp/ErrorComp"; 

document.addEventListener('DOMContentLoaded', function(){
	hideHeaderLinks('log-out');
	ReactDOM.render(<ErrorComp />	, document.getElementById('error-page-root'));
});
