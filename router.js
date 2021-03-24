const {BasicStrategy} = require('passport-http');
const express = require('express');
const jsonParser = require('body-parser').json();
const passport = require('passport');
const uuid = require('uuid');

const {UserContact} = require('./models');

const router = express.Router();

router.use(jsonParser);

const basicStrategy = new BasicStrategy((username, password, callback) => {
	let user;

	UserContact
		.findOne({userId: username})
		.exec()
		.then(_user => {

			user = _user;
			if (!user) {
				return callback(null, false, {message: 'Incorrect username'});
			}

			return user.validatePassword(password);
		})
		.then(isValid => {
			console.log("Is valid "+isValid);
			if (!isValid) {
				return callback(null, false, {message: 'Incorrect password'});
			}
			else {
				return callback(null, user);
			}
		})
		.catch(err => console.log('Invalid username or password'))
});

router.use(require('express-session')({ 
  secret: 'something something',
  resave: false,
  saveUninitialized: false 
}));

passport.use(basicStrategy);
router.use(passport.initialize());
router.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  UserContact.findById(id, function(err, user) {
    done(err, user);
  });
});

function loggedIn(req, res, next) {
	if (req.user) {
		next();
	} else {
		res.json({redirect: '/signin.html', message: 'Please sign in'});
	}
}

// GET for user to sign in
router.get('/login',
	passport.authenticate('basic', {session: true, failureRedirect: '/signin.html'}),
		(req, res) => {
			res.json({user: req.user.apiRepr(), message: 'Sign in successful'});
		}
);

// GET for user session (protected, must be signed-in already and have session cookie)
router.get('/me', loggedIn, (req, res, next) => {

  	res.json({user: req.user.apiRepr()});
	}
);

// GET for user to sign out
router.get('/logout', (req, res) => {
	req.session.destroy(function (err) {
  		res.redirect('/');
  	});
});

// POST for creating new user account
router.post('/sign-up', (req, res) => {

	if (!req.body) {
		return res.status(400).json({message: 'No request body'});
	}
	if (!('username' in req.body)) {
		return res.status(422).json({message: 'Missing field: username'});
	}

	let {username, password,contacts} = req.body;

	if (typeof username !== 'string') {
		return res.status(422).json({message: 'Incorrect field type: username'});
	}

	username = username.trim();

	if (username ==='') {
		return res.status(422).json({message: 'Incorrect field length: username'});
	}

	if (!(password)) {
		return res.status(422).json({message: 'Missing field: password'});
	}

	if (typeof password !== 'string') {
		return res.status(422).json({message: 'Incorrect field type: password'});
	}

	password = password.trim();

	if (password === '') {
		return res.status(422).json({message: 'Incorrect field length: password'});
	}


UserContact
		.find({"userId" : username})
		.count()
		.exec()
		.then(count => {

			if (count > 0) {
				return res.status(422).json({message: 'Username already taken'});
			}
			return UserContact.hashPassword(password);
		})
		.then(hash => {
			return UserContact
				.create({
					userId: username,
					password: hash
				});
		})
		.then(user => {
			return res.status(201).json({user: user.apiRepr(), message: 'New account created! Please sign in'});
		})
		.catch(err => {
			res.status(500).json({message: 'Internal server error'});
		});
});


router.get('/users', (req, res) => {
  console.log("req.query"+JSON.stringify(req.query));
  UserContact
    .find(
     req.query
      )
    // `exec` returns a promise
    .exec()
    // success callback: for each restaurant we got back, we'll
    // call the `.apiRepr` instance method we've created in
    // models.js in order to only expose the data we want the API return.
    .then(users => {
      res.json({
        users: users[0].contacts.map(
          (user) => user.apiRepr())
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

// PUT (password protected, must have session cookie) for editing user data 
router.put('/me/username', loggedIn, (req, res) => {

	if (!('username' in req.body)) {
		return res.status(422).json({message: 'Please enter a username'});
	}

	let {username} = req.body;

	if (typeof username !== 'string') {
		return res.status(422).json({message: 'Incorrect field type: username'});
	}

	username = username.trim();

	if (username ==='') {
		return res.status(422).json({message: 'Please enter a username'});
	}

	User
		.find({username})
		.count()
		.exec()
		.then(count => {
			if (count > 0) {
				return res.status(422).json({message: 'Username already taken'});
			}
		})
	
	const updated = { username: req.body.username }

	User
		.findByIdAndUpdate(req.user.id, {$set: updated}, {new: true})
		.then(user => res.status(200).json({user: user.apiRepr()}))
		.catch(err => res.status(500).json({message: 'Error, update failed'}));

});

// DELETE user account (password protected, must have session cookie)
router.delete('/me', loggedIn, (req, res) => {
    UserContact
		.findByIdAndRemove(req.user.id)
		.then(user => res.status(200).json({redirect: '/'}).end())
		.catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.use('*', function(req, res) {
	res.status(404).json({message: 'Not Found'});
});

module.exports = {router};