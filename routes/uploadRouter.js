//support uploading the files
const express = require('express');
const authenticate = require('../authenticate');
const multer = require('multer');

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		//3 parameter: receive a req, a file and a callback function(cb)
		cb(null, 'public/images'); //2 parameter: error: 'null', destination folder:'public/images'
	},

	filename: (req, file, cb) => {
		cb(null, file.originalname); // given the same name as file uploaded
	}
});

//file filter function
const imageFileFilter = (req, file, cb) => {
	if (!file.originalname.match(/\.(jpg|jpeg|png|git)$/)) {
		return cb(new Error('You can upload only image files'), false); // 1st parameter of cb is an error
	} //regular expression
	cb(null, true);
};

// configure the multer module
const upload = multer({ storage: storage, fileFilter: imageFileFilter });

const uploadRouter = express.Router();

// the middleware body parser is deprecated,use express.json()
uploadRouter.use(express.json());
uploadRouter.use(express.urlencoded({ extended: true })); // can get the form data

//only 'POST' allowed
uploadRouter
	.route('/')
	.get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
		res.statusCode = 403;
		res.end('GET operation not supported on /imageUpload');
	})
	.post(authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
		//'imageFile' will be the 'key' in form-data; upload.single: only upload a signle file; no need for 'next'
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		res.json(req.file); //pass back req.file object from the server back to the client.req.file contains a lot of information about the file that has just been uploaded
	})
	.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
		res.statusCode = 403;
		res.end('PUT operation not supported on /imageUpload');
	})
	.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
		res.statusCode = 403;
		res.end('DELETE operation not supported on /imageUpload');
	});

module.exports = uploadRouter;
