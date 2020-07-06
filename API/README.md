# REST *(REpresentational State Transfer)* API

**Note:** FILESYSTEM has been used for data storage

______________________________
------------------------------

## Background workers - configured to perform checks given by different users
#### this part of the API works in the background and is opaque to the user

* The workers perform the given network request, passed in the `check` details by the user
* All the checks are performed once every minute
* The host, url, method, success-codes etc. are fetched from the `.data/checks` directory
* The `state` of the check and `lastChecked` timestamp are pushed into the respective check data
______________________________
------------------------------

## API for the user to create checks, after successful authentication
#### server runs on PORT 5000 for production environment and 3000 for any other

* run `set NODE_ENV=production && node index` [ref *'package.json'* for scripts ]
* any other NODE_ENV value will be defaulted to PORT 3000 (staging currently)

#### handlers are coded in an object to handle different routes
- current handlers/routes:
	* ping : returns statusCode 200
	* notFound : return statusCode 404; a redirect for any invalid route
	* users : has CRUD operations facility to work with "users" directory inside ".data" folder
	* tokens : has CRUD operations facility to work with "tokens" directory inside ".data" folder
		- a unique `token` is generated for a user, ***which is valid only for an hour***
		- there can be multiple tokens for a single user
	* checks : has CRUD operations facility to work with "checks" directory inside ".data" folder
		- `check` is basically the service that tells the system to check certain URL, whether it is UP or DOWN, and notify the user that created the check
		- authenticated users, via their `tokens` can create their `checks` [maximum 5 checks allowed per user]

### CRUD operations are configured in /lib/data.js
* each operation works with files inside the ".data" folder

______________________________
------------------------------

# Working flow of the API
* create a directory `.data/users`
* add few users with required details [using POST request to `/users` route]
* create a directory `.data/tokens`
* add few tokens with required details [using POST request to `/tokens` route]
* create a directory `.data/checks`
* add few checks with required details [using POST request to `/checks` route]
## 
* details of a user can be `READ`/`UPDATED`/`DELETED` only if a valid token is present for that user
* each token has an expiration time of 1 hour which is validated(authentication) before `read(GET)`/`update(PUT)`/`remove(DELETE)` requests for that user
* user can create their "checks" (max. 5) which have the details about the target URL, method and other required fields, that the user wants to "check"
#### the token has to be passed as a request header to be read by the handler, to proceed with the authentication
- for GET, PUT, DELETE requests made to `/users` route
- for all the requests made to `/checks` route