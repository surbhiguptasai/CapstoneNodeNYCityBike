# NYC CityBike #

NYCCityBike app allows user to find and manage a bike rides. 
It provides real time information about available bikes and docking stations in NYC leveraging information from public API.

Live version: [https://capstonenodenycitybike.herokuapp.com/](https://capstonenodenycitybike.herokuapp.com/)
(free hosting and server sleeps, so may take a few seconds to wake up)
## Features ##

Users can:

- Try a demo account (unique instances of pre-populated sample entries)
- Create unique user account with username and password; login/logout
- Get real time information about available bikes and docking stations in NYC leveraging information from public API.
- Select appropriate stations as well as pictorial view leveraging Google location API.
- Manage his rides by posting his rides and allowing with features to post, modify or delete his rides.
- Get information  about rules of road and how to ride bike and safety rules.
- Get information about various places of interest for bike ride as well as for tourism purposes.


## Screenshots ##

![](https://github.com/surbhiguptasai/portfolio/blob/master/images/nycbikeR2.jpg)

## Users API ##

root path: /users

- '/login' 

	- GET for user to log in
		- required in req body:
			- { username: String, password: String }

- '/logout'

	- GET for user to sign out
		- destroys session, redirects to root

- '/sign-up'

	- POST to create new user account
		- required in req body:
			- { username: String, password: String }

- '/me'

	- GET to retrieve user data
		- protected, requires login/session cookie
		- returns:
			- { 
			- username: String,
			- firstName: String,
			- lastName: String,
			- rides: Array of objects:
				- { 
				- id: String,
				- rideDate: String,
				- stationFrom: String,
				- stationTo: String,
				- cost: String,
				- paymentType: String ,
				- bikeType: String
				- }
				
	- DELETE to delete user
		- protected, requires login/session cookie
		- redirects to root
				
- '/me/username'

	- PUT to edit username
		- protected, rquires login/session cookie
		- required in req body: {username: String}


- '/rides

	- POST for posting new entry
		- protected, requires login/session cookie
		- returns updated user data and new entry (see '/me' GET for format)

	- PUT for editing ride of User
		- protected, requires login/session cookie
		- required in req body: same fields at POST
		- returns updated user data (see '/me' GET for format)
	
	- DELETE for deleting ride of User
		- protected, requires login/session cookie
		- required in req body: {id: String}
		- returns updated user data (see '/me' GET for format)
		
	- GET for retrieving rides of user
        - protected, requires login/session cookie
        - required in req body: {id: String}
        - returns updated user data (see '/me' GET for format)


## Tech ##

Back end: Node.js and Express with Mongo database and Mongoose; Mocha and Chai for testing

Front end: jQuery,  HTML5, CSS, and React

