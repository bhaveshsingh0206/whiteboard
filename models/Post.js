const mongoose = require('mongoose');

const Post = new mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	email: {
		type: String
	},
	question: {
		type: String
	},
	code: {
		type: String
	},
	input: {
		type: String
	},
	output: {
		type: String
	},
	date: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Post', Post);