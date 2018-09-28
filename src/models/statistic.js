const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StatisticSchema = new Schema({
	id: {
		type: String,
		required: true,
		default: ''
	},
	name: {
		type: String,
		required: true,
		default: ''
	},
	scoringBefore: {
		type: String,
		required: true,
		default: ''
	},
	scoringafter: {
		type: String,
		required: true,
		default: ''
	},
	one: {
		type: String,
		required: true,
		default: ''
	},
	X: {
		type: String,
		required: true,
		default: ''
	},
	two: {
		type: String,
		required: true,
		default: ''
	},
	OneX: {
		type: String,
		required: true,
		default: ''
	},
	OneTwo: {
		type: String,
		required: true,
		default: ''
	},
	TwoX: {
		type: String,
		required: true,
		default: ''
	},
	TotalTwo: {
		type: String,
		required: true,
		default: ''
	},
	TotalTwoHalf: {
		type: String,
		required: true,
		default: ''
	},
	legUpOne: {
		type: String,
		required: true,
		default: ''
	},
	legUpTwo: {
		type: String,
		required: true,
		default: ''
	},
	created: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Statistic', StatisticSchema);
