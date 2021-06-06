var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var FacebookTokenStrategy = require('passport-facebook-token');

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

exports.facebookPassport = passport.use(
	new FacebookTokenStrategy(
		{
			clientID: config.facebook.clientId,
			clientSecret: config.facebook.clientSecret
		}, //a callback function:
		(accessToken, refreshToken, profile, done) => {
			User.findOne({ facebookId: profile.id }, (err, user) => {
				if (err) {
					// user is false
					return done(err, false);
				}
				if (!err && user !== null) {
					//a user already logged in with the facebookId，so just return the user,err is null
					return done(null, user);
				} else {
					//no err and user doesn't exist, so we need create a new user
					user = new User({ username: profile.displayName }); //facebook profile object has displayName
					user.facebookId = profile.id;
					user.firstname = profile.name.givenName;
					user.lastname = profile.name.familyName;
					user.save((err, user) => {
						if (err)
							return done(err, false); //create user failed
						else return done(null, user); //return the created user
					});
				}
			});
		}
	)
);
