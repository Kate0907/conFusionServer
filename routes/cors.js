const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = [ 'http://localhost:3000', 'http://localhost:3443' ];
var corsOptionsDelegate = (req, callback) => {
	var corsOptions;
	console.log(req.header('Origin'));
	if (whitelist.indexOf(req.header('Origin')) !== -1) {
		//if incoming request origin is in the whitelist
		corsOptions = { origin: true };
	} else {
		corsOptions = { origin: false };
	}
	callback(null, corsOptions);
};

exports.cors = cors(); //standard cors
exports.corsWithOptions = cors(corsOptionsDelegate); // cors with specific options to a particular route
