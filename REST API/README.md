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
	* tokens : has CRUD operations facility to work with "tokens" directory inside ".data" folder
		- a unique token is generated for a user
		- there can be multiple tokens for a single user

### CRUD operations are configured in /lib/data.js
* each operation works with files inside the ".data" folder

# Working flow of the API
* create a directory `.data/users`
* add few users with required details [using POST request to `/users` route]
* create a directory `.data/tokens`
* add few tokens with required details [using POST request to `/tokens` route]
## 
* details of a user can be `READ`/`UPDATED`/`DELETED` only if a valid token is present for that user
* each token has an expiration time of 1 hour which is validated(authentication) before `read(GET)`/`update(PUT)`/`remove(DELETE)` requests for that user
* #### the token has to be passed as a request header to be read by the handler, to proceed with the authentication