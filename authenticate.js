var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

var config = require('./config.js');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Create the token
exports.getToken = function(user) {
	//getToken take a parameter 'user' as payload
	return jwt.sign(user, config.secretKey, { expiresIn: 3600 }); //3600s = 1hour
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); //'fromAuthHeaderAsBearerToken(): When verify a user, token will be extracted from the request Authentication Header
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(
	new JwtStrategy(opts, (jwt_payload, done) => {
		console.log('JWT payload: ', jwt_payload); //can see what is inside jwt_payload
		User.findOne({ _id: jwt_payload._id }, (err, user) => {
			if (err) {
				return done(err, false);
			} else if (user) {
				return done(null, user);
			} else {
				return done(null, false);
			}
		});
	})
);

//Verify user:
//strategy is 'jwt'
//passport.authenticate will verify user, if successful, will continue; otherwise will return err say user not authenticated
exports.verifyUser = passport.authenticate('jwt', { session: false });

exports.verifyAdmin = function(req, res, next) {
	if (req.user.admin) next();
	else {
		err = new Error('You are not authorized to perform this operation!');
		err.status = 403;
		return next(err);
	}
};
