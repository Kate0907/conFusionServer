const express = require('express');
const app = express(); //use express node module
const leaderRouter = express.Router();

// the middleware body parser is deprecated,use express.json()
leaderRouter.use(express.json());
leaderRouter.use(express.urlencoded({ extended: true })); // can get the form data

leaderRouter
	.route('/')
	.all((req, res, next) => {
		// .all: for all the methods(get,post,put,delete),this code will be execute first by default. 1: endpoint 2: callback function
		res.statusCode = 200;
		res.setHeader('Content-Type', 'text/plain');
		next(); // So this will be done for all the requests: get,put,post and delete on the '/dishes', and it'll continue on to look for additional specifications down below here which will match this '/dishes' endpoint. after this is finished, the req and res will pass on to the next call of '/dishes'
	})
	.get((req, res, next) => {
		res.end('Will show all the leaders to you!'); //Don't need next(), GET is finished
	})
	.post((req, res, next) => {
		res.end('will add the leader: ' + req.body.name + ' with details: ' + req.body.description); //because we use bodyParser,we can use req.body
	})
	.put((req, res, next) => {
		res.statusCode = 403; // Operation not supported
		res.end('PUT operation not supported on /leaders');
	})
	.delete((req, res, next) => {
		res.end('Deleting all leaders');
	});

leaderRouter
	.route('/:leaderId')
	.all((req, res, next) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'text/plain');
		next();
	})
	.get((req, res, next) => {
		console.log(req.params);
		res.end('Will show details of the leader: ' + req.params.leaderId + ' to you!');
	})
	.post((req, res, next) => {
		res.statusCode = 403;
		res.end('POST operation not supported on /leaders/' + req.params.leaderId);
	})
	.put((req, res, next) => {
		res.write('Updating the leader: ' + req.params.leaderId + '\n');
		res.end('Will update the leader: ' + req.body.name + ' with details: ' + req.body.description);
	})
	.delete((req, res, next) => {
		res.end('Deleting leader: ' + req.params.leaderId);
	});

module.exports = leaderRouter;
