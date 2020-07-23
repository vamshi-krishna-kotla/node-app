# Web App GUI

## This part of the application has the graphic user interface
- Based on the user's choice the front-end makes calls to the backend API
- ***WEBPACK*** is used as the bundler for generating minified JS and CSS files for the frontend
- HTML pages are served using ***EXPRESS*** framework

## Development

- ***workflow of dev server***
	* The dev-server is set up to work with the JS and CSS assets and for serving the HTML pages
	* **webpack-dev-server** is used along with **express server** for development
	* for the development server to run we are using proxy for the webpack-dev-server to hit the express server
	* express server needs to be working together with the webpack-dev-server
	* `npm run start:dev` -> to start the express server in dev mode
	* `npm run dev` -> to start the webpack-dev-server
	* The dev server stores the bundled files in memory without actually generating them for production, the actual server is running in express port [4000] while the webpack-dev-server uses it as proxy at port 8080

- ***generation of HTML pages***
	* The express router is set up to serve respective pages along with respective CSS and JS files
	* There are *_header.html* and *_footer.html* as default HTML templates to be added onto every page
	* The view for each page is augmented with these default components and served as complete files to the end user
	* Respective CSS and JS are referenced using `<script>` and `<link>` tags, in each view, to fetch the respective CSS and JS needed for the page

## Deployment to production
use `npm run start` to generate the static build and serve on **localhost 4000**