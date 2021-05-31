const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency; //add a new type called currency, for price

const commentSchema = new Schema(
	{
		rating: {
			type: Number,
			min: 1,
			max: 5,
			required: true
		},
		comment: {
			type: String,
			required: true
		},
		// author field has connection to User model.We can use mongoose populate to populate this information into our dishes document
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User' //author will store a reference to the ID of the user document
		}
	},
	{
		timestamps: true
	}
);

const disheSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true
		},
		description: {
			type: String,
			required: true
		},
		image: {
			type: String,
			required: true
		},
		category: {
			type: String,
			required: true
		},
		label: {
			type: String,
			default: ''
		},
		price: {
			type: Currency,
			required: true,
			min: 0
		},
		featured: {
			type: Boolean,
			default: false
		},
		comments: [ commentSchema ]
	},
	{
		timestamps: true
	}
);

var Dishes = mongoose.model('Dish', disheSchema);

module.exports = Dishes;
