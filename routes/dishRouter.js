const express = require('express');

// const app = express(); //use express node module
const mongoose = require('mongoose');

const Dishes = require('../models/dishes');

const dishRouter = express.Router();

// the middleware body parser is deprecated,use express.json()
dishRouter.use(express.json());
dishRouter.use(express.urlencoded({ extended: true })); // can get the form data

// #1: '/'
dishRouter
	.route('/')
	.get((req, res, next) => {
		Dishes.find({})
			.then(
				(dishes) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(dishes);
				},
				(err) => next(err)
			)
			.catch((err) => next(err));
	})
	.post((req, res, next) => {
		Dishes.create(req.body)
			.then(
				(dish) => {
					console.log('Dish Created ', dish);
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(dish);
				},
				(err) => next(err)
			)
			.catch((err) => next(err));
	})
	.put((req, res, next) => {
		res.statusCode = 403;
		res.end('PUT operation not supported on /dishes');
	})
	.delete((req, res, next) => {
		Dishes.remove({})
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

// #2: '/:dishId'
dishRouter
	.route('/:dishId')
	.get((req, res, next) => {
		Dishes.findById(req.params.dishId)
			.then(
				(dish) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(dish);
				},
				(err) => next(err)
			)
			.catch((err) => next(err));
	})
	.post((req, res, next) => {
		res.statusCode = 403;
		res.end('POST operation not supported on /dishes/' + req.params.dishId);
	})
	.put((req, res, next) => {
		Dishes.findByIdAndUpdate(
			req.params.dishId,
			{
				$set: req.body
			},
			{ new: true }
		)
			.then(
				(dish) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(dish);
				},
				(err) => next(err)
			)
			.catch((err) => next(err));
	})
	.delete((req, res, next) => {
		Dishes.findByIdAndRemove(req.params.dishId)
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

// #3: '/:dishId/comments'
dishRouter
	.route('/:dishId/comments')
	.get((req, res, next) => {
		Dishes.findById(req.params.dishId)
			.then(
				(dish) => {
					if (dish != null) {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(dish.comments);
					} else {
						err = new Error('Dish ' + req.params.dishId + ' not found');
						err.status = 404;
						return next(err); // in app.js file has a error handler
					}
				},
				(err) => next(err)
			)
			.catch((err) => next(err));
	})
	.post((req, res, next) => {
		Dishes.findById(req.params.dishId)
			.then(
				(dish) => {
					if (dish != null) {
						dish.comments.push(req.body); //add comment
						dish.save().then(
							(dish) => {
								res.statusCode = 200;
								res.setHeader('Content-Type', 'application/json');
								res.json(dish);
							},
							(err) => next(err)
						);
					} else {
						err = new Error('Dish ' + req.params.dishId + ' not found');
						err.status = 404;
						return next(err); // in app.js file has a error handler
					}
				},
				(err) => next(err)
			)
			.catch((err) => next(err));
	})
	.put((req, res, next) => {
		res.statusCode = 403;
		res.end('PUT operation not supported on /dishes' + req.params.dishId + '/comments');
	})
	.delete((req, res, next) => {
		Dishes.findById(req.params.dishId)
			.then(
				(dish) => {
					if (dish != null) {
						for (var i = dish.comments.length - 1; i >= 0; i--) {
							dish.comments.id(dish.comments[i]._id).remove(); //How to get into subdocument: dish is mogoose document; comments is field name,
						}
						dish.save().then(
							(dish) => {
								res.statusCode = 200;
								res.setHeader('Content-Type', 'application/json');
								res.json(dish);
							},
							(err) => next(err)
						);
					} else {
						err = new Error('Dish ' + req.params.dishId + ' not found');
						err.status = 404;
						return next(err); // in app.js file has a error handler
					}
				},
				(err) => next(err)
			)
			.catch((err) => next(err));
	});

// #4:'/:dishId/comments/:commentId'
dishRouter
	.route('/:dishId/comments/:commentId')
	.get((req, res, next) => {
		Dishes.findById(req.params.dishId)
			.then(
				(dish) => {
					// dish exist and dish comments exist
					if (dish != null && dish.comments.id(req.params.commentId) != null) {
						res.statusCode = 200;
						res.setHeader('Content-Type', 'application/json');
						res.json(dish.comments.id(req.params.commentId));
					} else if (dish == null) {
						// dish not exist:
						err = new Error('Dish ' + req.params.dishId + ' not found');
						err.status = 404;
						return next(err);
					} else {
						//dish exist but dish comments not exist
						err = new Error('Comment ' + req.params.commentId + ' not found');
						err.status = 404;
						return next(err);
					}
				},
				(err) => next(err)
			)
			.catch((err) => next(err));
	})
	.post((req, res, next) => {
		res.statusCode = 403;
		res.end('POST operation not supported on /dishes/' + req.params.dishId + '/comments/' + req.params.commentId);
	})
	.put((req, res, next) => {
		Dishes.findById(req.params.dishId)
			.then(
				(dish) => {
					if (dish != null && dish.comments.id(req.params.commentId) != null) {
						if (req.body.rating) {
							dish.comments.id(req.params.commentId).rating = req.body.rating;
						}
						if (req.body.comment) {
							dish.comments.id(req.params.commentId).comment = req.body.comment;
						}
						dish.save().then(
							(dish) => {
								res.statusCode = 200;
								res.setHeader('Content-Type', 'application/json');
								res.json(dish);
							},
							(err) => next(err)
						);
					} else if (dish == null) {
						err = new Error('Dish ' + req.params.dishId + ' not found');
						err.status = 404;
						return next(err);
					} else {
						err = new Error('Comment ' + req.params.commentId + ' not found');
						err.status = 404;
						return next(err);
					}
				},
				(err) => next(err)
			)
			.catch((err) => next(err));
	})
	.delete((req, res, next) => {
		Dishes.findById(req.params.dishId)
			.then(
				(dish) => {
					if (dish != null && dish.comments.id(req.params.commentId) != null) {
						dish.comments.id(req.params.commentId).remove();
						dish.save().then(
							(dish) => {
								res.statusCode = 200;
								res.setHeader('Content-Type', 'application/json');
								res.json(dish);
							},
							(err) => next(err)
						);
					} else if (dish == null) {
						err = new Error('Dish ' + req.params.dishId + ' not found');
						err.status = 404;
						return next(err);
					} else {
						err = new Error('Comment ' + req.params.commentId + ' not found');
						err.status = 404;
						return next(err);
					}
				},
				(err) => next(err)
			)
			.catch((err) => next(err));
	});

module.exports = dishRouter;

// //#1: '/'
// dishRouter
// 	.route('/')
// 	// .all((req, res, next) => {
// 	// 	// .all: for all the methods(get,post,put,delete),this code will be execute first by default. 1: endpoint 2: callback function
// 	// 	res.statusCode = 200;
// 	// 	res.setHeader('Content-Type', 'text/plain');
// 	// 	next(); // So this will be done for all the requests: get,put,post and delete on the '/dishes', and it'll continue on to look for additional specifications down below here which will match this '/dishes' endpoint. after this is finished, the req and res will pass on to the next call of '/dishes'
// 	// })
// 	.get((req, res, next) => {
// 		Dishes.find({}) //find({}) will get a promise
// 			.then(
// 				(dishes) => {
// 					res.statusCode = 200;
// 					res.setHeader('Content-Type', 'application/json');
// 					res.json(dishes); //take it back as a json file
// 				},
// 				(err) => next(err)
// 			)
// 			.catch((err) => next(err)); //handle errors
// 	})
// 	.post((req, res, next) => {
// 		Dishes.create(req.body)
// 			.then(
// 				(dish) => {
// 					console.log('Dish Created ', dish);
// 					res.statusCode = 200;
// 					res.setHeader('Content-Type', 'application/json');
// 					res.json(dish);
// 				},
// 				(err) => next(err)
// 			)
// 			.catch((err) => next(err));
// 		// res.end('will add the dish: ' + req.body.name + ' with details: ' + req.body.description); //because we use bodyParser,we can use req.body
// 	})
// 	.put((req, res, next) => {
// 		res.statusCode = 403; // Operation not supported
// 		res.end('PUT operation not supported on /dishes');
// 	})
// 	.delete((req, res, next) => {
// 		Dishes.remove({})
// 			.then(
// 				(resp) => {
// 					res.statusCode = 200;
// 					res.setHeader('Content-Type', 'application/json');
// 					res.json(resp);
// 				},
// 				(err) => next(err)
// 			)
// 			.catch((err) => next(err));
// 		// res.end('Deleting all dishes');
// 	});

// //#2 : '/:dishId'
// dishRouter
// 	.route('/:dishId')
// 	// .all((req, res, next) => {
// 	// 	res.statusCode = 200;
// 	// 	res.setHeader('Content-Type', 'text/plain');
// 	// 	next();
// 	// })
// 	.get((req, res, next) => {
// 		Dishes.findById(req.params.dishId)
// 			.then(
// 				(dish) => {
// 					res.statusCode = 200;
// 					res.setHeader('Content-Type', 'application/json');
// 					res.json(dish);
// 				},
// 				(err) => next(err)
// 			)
// 			.catch((err) => next(err)); //findById is supported by MongoDB driver

// 		// console.log(req.params);
// 		// res.end('Will send details of the dish: ' + req.params.dishId + ' to you!');
// 	})
// 	.post((req, res, next) => {
// 		//operation not supported
// 		res.statusCode = 403;
// 		res.end('POST operation not supported on /dishes/' + req.params.dishId);
// 	})
// 	.put((req, res, next) => {
// 		Dishes.findByIdAndUpdate(
// 			req.params.dishId,
// 			{
// 				$set: req.body
// 			},
// 			{ new: true }
// 		)
// 			.then(
// 				(dish) => {
// 					res.statusCode = 200;
// 					res.setHeader('Content-Type', 'application/json');
// 					res.json(dish);
// 				},
// 				(err) => next(err)
// 			)
// 			.catch((err) => next(err));
// 		// res.write('Updating the dish: ' + req.params.dishId + '\n');
// 		// res.end('Will update the dish: ' + req.body.name + ' with details: ' + req.body.description);
// 	})
// 	.delete((req, res, next) => {
// 		Dishes.findByIdAndRemove(req.params.dishId)
// 			.then(
// 				(resp) => {
// 					res.statusCode = 200;
// 					res.setHeader('Content-Type', 'application/json');
// 					res.json(resp);
// 				},
// 				(err) => next(err)
// 			)
// 			.catch((err) => next(err));
// 		// res.end('Deleting dish: ' + req.params.dishId);
// 	});

// module.exports = dishRouter;
