# Node-URL-Monitor

A node based (local) web application to check the status of URLs, given by 'authenticated' users.

***********

## Built using

### API server
* [Node](https://nodejs.org/en/) : Javascript runtime for server-side scripting

### GUI server
* [Express](https://expressjs.com/) : Node framework for web servers
* [Webpack](https://webpack.js.org/) : Code bundler
* [Sass](https://sass-lang.com/) : CSS Preprocessor


## Key features
1. Backend built with workers operating to check the status of a URL given by the user
2. Regular monitoring of the user data
3. GUI built to serve the static HTML, CSS and JS assets of respective pages
4. `Login` feature that authenticates users to view/edit/delete their data
5. Enables user to delete the account, which deletes all the corresponding user data in the backend

## Basic workflow
1. Start the API server
	* API server is present in `API` folder
	* works with storing data in local files

	```
	mkdir .data
	cd API
	npm run server:prod
	```

2. Start the GUI server
	
	```
	cd GUI
	npm i
	npm run start
	```

3. Create a user account and login
4. Create new `checks` and save
5. Work with multiple users by logging out one user and logging in with other