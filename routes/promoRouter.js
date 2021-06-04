const express = require('express');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');

const Promotions = require('../models/promotions');

const promoRouter = express.Router();

// the middleware body parser is deprecated,use express.json()
promoRouter.use(express.json());
promoRouter.use(express.urlencoded({ extended: true })); // can get the form data

// #1: '/'
promoRouter
	.route('/')
	.get((req, res, next) => {
		Promotions.find({}).then(
			(promotions) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(promotions);
			},
			(err) => next(err)
		);
	})
	.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
		Promotions.create(req.body)
			.then(
				(promotion) => {
					console.log('Promotion created ', promotion);
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(promotion);
				},
				(err) => next(err)
			)
			.catch((err) => next(err));
	})
	.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
		res.statusCode = 403;
		res.end('PUT operation not supported on /dishes');
	})
	.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
		Promotions.remove({})
			.then(
				(resp) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(resp);
				},
				(err) => next(err)
			)
			.catch((err) => next(err));
	});

//#2: '/:promoId
promoRouter
	.route('/:promoId')
	.get((req, res, next) => {
		Promotions.findById(req.params.promoId)
			.then(
				(promotion) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(promotion);
				},
				(err) => next(err)
			)
			.catch((err) => next(err));
	})
	.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
		res.statusCode = 403;
		res.end('POST operation not supported on /promotions/' + req.params.promoId);
	})
	.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
		Promotions.findByIdAndUpdate(
			req.params.promoId,
			{
				$set: req.body
			},
			{ new: true }
		)
			.then(
				(promotion) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(promotion);
				},
				(err) => next(err)
			)
			.catch((err) => next(err));
	})
	.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
		Promotions.findByIdAndRemove(req.params.promoId)
			.then(
				(resp) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(resp);
				},
				(err) => next(err)
			)
			.catch((err) => next(err));
	});

module.exports = promoRouter;

// promoRouter
// 	.route('/')
// 	.all((req, res, next) => {
// 		// .all: for all the methods(get,post,put,delete),this code will be execute first by default. 1: endpoint 2: callback function
// 		res.statusCode = 200;
// 		res.setHeader('Content-Type', 'text/plain');
// 		next(); // So this will be done for all the requests: get,put,post and delete on the '/dishes', and it'll continue on to look for additional specifications down below here which will match this '/dishes' endpoint. after this is finished, the req and res will pass on to the next call of '/dishes'
// 	})
// 	.get((req, res, next) => {
// 		res.end('Will show all the promotions to you!'); //Don't need next(), GET is finished
// 	})
// 	.post((req, res, next) => {
// 		res.end('will add the promotion: ' + req.body.name + ' with details: ' + req.body.description); //because we use bodyParser,we can use req.body
// 	})
// 	.put((req, res, next) => {
// 		res.statusCode = 403; // Operation not supported
// 		res.end('PUT operation not supported on /promotions');
// 	})
// 	.delete((req, res, next) => {
// 		res.end('Deleting all promotions');
// 	});

// promoRouter
// 	.route('/:promoId')
// 	.all((req, res, next) => {
// 		res.statusCode = 200;
// 		res.setHeader('Content-Type', 'text/plain');
// 		next();
// 	})
// 	.get((req, res, next) => {
// 		console.log(req.params);
// 		res.end('Will show details of the promotion: ' + req.params.promoId + ' to you!');
// 	})
// 	.post((req, res, next) => {
// 		res.statusCode = 403;
// 		res.end('POST operation not supported on /promotions/' + req.params.promoId);
// 	})
// 	.put((req, res, next) => {
// 		res.write('Updating the promotion: ' + req.params.promoId + '\n');
// 		res.end('Will update the promotion: ' + req.body.name + ' with details: ' + req.body.description);
// 	})
// 	.delete((req, res, next) => {
// 		res.end('Deleting promotion: ' + req.params.promoId);
// 	});
