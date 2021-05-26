var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
	admin: {
		type: Boolean,
		default: false
	}
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User); //create model: ,model( name: string, schema: xxx)

//a model can monipulate data, a schema is only a skeleton, can't manipulate date
//documant: a line( a key value pair)
//collection: composed of many doumant, like a table
