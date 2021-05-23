var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');

const mongoose = require('mongoose');

const Dishes = require('./models/dishes');

const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url);

connect.then(
	(db) => {
		console.log('Connected correctly to server');
	},
	(err) => {
		console.log(err);
	}
);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
//body parser:
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser('12345-67890-12345-67890')); // any number

app.use(
	session({
		name: 'session-id',
		secret: '12345-67890-12345-67890',
		saveUninitialized: false,
		resave: false,
		store: new FileStore()
	})
);

function auth(req, res, next) {
	console.log(req.session);

	if (!req.session.user) {
		//user is not authorized yet
		var authHeader = req.headers.authorization;
		if (!authHeader) {
			var err = new Error('You are not authenticated!');
			res.setHeader('WWW-Authenticate', 'Basic');
			err.status = 401;
			next(err);
			return;
		}
		//new Buffer(string) is deprecated
		var auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':'); // 1st split authHeader using ' '(space) into 2 arrays, the array[0] is  'Basic' and the array[1] contains base64 encoded string which contains the username and password; 2nd split: 'username:password' is split into 2 arrays by ':'
		var user = auth[0];
		var pass = auth[1];
		if (user == 'pineapple' && pass == 'yellow') {
			req.session.user = 'pineapple'; //set up the session
			next(); //authorized
		} else {
			var err = new Error('You are not authenticated!');
			res.setHeader('WWW-Authenticate', 'Basic');
			err.status = 401;
			next(err);
		}
	} else {
		if (req.session.user === 'pineapple') {
			next();
		} else {
			//not likely to happen
			var err = new Error('Your are not authenticated!');
			err.status = 401;
			next(err);
		}
	}
}

app.use(auth); //program will be authorized

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
