var express = require('express');
var User = require('../models/user'); // import user Model

var router = express.Router();
// the middleware body parser is deprecated,use express.json()
router.use(express.json());
router.use(express.urlencoded({ extended: true })); // can get the form data

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('respond with a resource');
});

//Sign up new users:
router.post('/signup', function(req, res, next) {
	//make sure username not exist in database( findOne(query, projection) example: db.restaurents.findOne({"cuisine" : "Italian"}, {_id:0, grades:0}) => will return the first one restaurents with "cuisine" is "Italian", but without return '_id' and 'grades' fields. )
	User.findOne({ username: req.body.username })
		.then((user) => {
			//shouldn't have duplicate username signed up
			if (user != null) {
				var err = new Error('User ' + req.body.username + ' already exists!');
				err.status = 403;
				next(err);
			} else {
				//create a new user
				return User.create({
					username: req.body.username,
					password: req.body.password
				});
			}
		})
		.then(
			(user) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json({ status: 'Registration Successful!', user: user });
			},
			(err) => next(err)
		)
		.catch((err) => next(err));
});

router.post('/login', (req, res, next) => {
	if (!req.session.user) {
		//user is not authorized yet(user not logged in)
		var authHeader = req.headers.authorization;
		if (!authHeader) {
			var err = new Error('You are not authenticated!');
			res.setHeader('WWW-Authenticate', 'Basic');
			err.status = 401;
			next(err);
			return;
		}
		//retrieve user information from authHeader
		var auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':'); // 1st split authHeader using ' '(space) into 2 arrays, the array[0] is  'Basic' and the array[1] contains base64 encoded string which contains the username and password; 2nd split: 'username:password' is split into 2 arrays by ':'
		var username = auth[0];
		var password = auth[1];
		//Check user information with db
		User.findOne({ username: username })
			.then((user) => {
				//we can't find a user with that user name
				if (user === null) {
					var err = new Error('User ' + username + ' does not exist!');
					err.status = 403;
					return next(err);
					//username and password match database
				} else if (user.username === username && user.password === password) {
					req.session.user = 'authenticated'; //req.session.user can be set to any string, if not set it is null
					res.statusCode = 200;
					res.setHeader('Content-Type', 'text/plain');
					res.end('You are authenticated!');
				}
			})
			.catch((err) => next(err));
	} else {
		//user is already logged in no need to login again
		//req.session.user not null
		res.statusCode = 200;
		res.setHeader('Content-Type', 'text/plain');
		res.end('You are already authenticated!');
	}
});

router.get('/logout', (req, res) => {
	//use 'get' since we don't need to send any information in the body
	if (req.session) {
		//session must exist, otherwise it's not logged in
		req.session.destroy();
		res.clearCookie('session-id');
		res.redirect('/'); //redirect to homepage
	} else {
		var err = new Error('You are not logged in!');
		err.status = 403;
		next(err);
	}
});

module.exports = router;
