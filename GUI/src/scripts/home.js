import '../styles/home.scss';

import { hideHeaderLinks } from '../support';

document.addEventListener('DOMContentLoaded', function(){
	homePageInit();
});

function homePageInit() {
	hideHeaderLinks('log-out');
}