const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const User = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		min: 1,
		max: 255
	},
	email: {
		type: String,
		required: true,
		min: 6,
		max: 255
	},
	designation: {
		type: String,
		required: true
	},
	password: {
		type: String
	},
	date: {
		type: Date,
		default: Date.now
	}
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);