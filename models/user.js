var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	admin: {
		type: Boolean,
		default: false
	}
});

module.exports = mongoose.model('User', User); //create model: ,model( name: string, schema: xxx)

//a model can monipulate data, a schema is only a skeleton, can't manipulate date
//documant: a line( a key value pair)
//collection: composed of many doumant, like a table
