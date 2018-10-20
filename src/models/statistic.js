const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StatisticSchema = new Schema({
	matchId: {
		type: String,
		required: true,
		default: ''
	},
	score: {
		type: String,
		required: true,
		default: ''
	},
	commandOne: {
		type: String,
		required: true,
		default: ''
	},
	commandTwo: {
		type: String,
		required: true,
		default: ''
	},
	strategy: {
		/* 1 - гол лузера; 2 - гол после ничьи*/
		type: String,
		required: true,
		default: ''
	},
	index: {
		type: Number,
		required: true,
		default: 0
	},
	created: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('Statistic', StatisticSchema);