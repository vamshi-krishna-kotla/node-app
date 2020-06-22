# This part of the application has the code for a REST API

## FILESYSTEM has been used for data storage

#### server runs on PORT 5000 for production environment and 3000 for any other

* run `set NODE_ENV=production && node index`
* any other NODE_ENV value will be defaulted to PORT 3000 (staging currently)

#### handlers are coded in an object to handle different routes
- current handlers/routes:
	* ping : returns statusCode 200
	* notFound : return statusCode 404; a redirect for any invalid route
	* users : has CRUD operations facility to work with "users" directory inside ".data" folder

### CRUD operations are configured in /lib/data.js
* each operation works with files inside the ".data" folder