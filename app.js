var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var passport = require('passport');
var authenticate = require('./authenticate');
var config = require('./config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');
var uploadRouter = require('./routes/uploadRouter');

const mongoose = require('mongoose');

const Dishes = require('./models/dishes');

// const url = 'mongodb://localhost:27017/conFusion';
const url = config.mongoUrl;
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

//redirect all http to https
app.all('*', (req, res, next) => {
	if (req.secure) {
		//if incoming request is already a secure request, the request object will carry this flag called 'secure' which will be set to 'true'
		return next();
	} else {
		res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url); //req.url contain rest of the path except the hostname and the port number
	}
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
//body parser:
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser('12345-67890-12345-67890')); // any number

app.use(passport.initialize());

//This two end points must before authentication function, so a user can reach these two end points without authentication, but any other end points needs authentication
app.use('/', indexRouter);
app.use('/users', usersRouter);

// app.use(auth); //program will be authorized: when I configured this authentication, this authentication was applied to every single incoming request, used in every router

app.use(express.static(path.join(__dirname, 'public'))); //public folder is open for anybody to access

//API endpoint:
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);
app.use('/imageUpload', uploadRouter);

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
