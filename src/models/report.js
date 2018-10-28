const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReportSchema = new Schema({
	allMatch: {
		type: Number,
		required: true,
		default: 0
	},
	strategyOne: {
		type: Number,
		required: true,
		default: 0
	},
	strategyTwo_zero: {
		type: Number,
		required: true,
		default: 0
	},
	strategyTwo_one: {
		type: Number,
		required: true,
		default: 0
	},
	strategyTwo_two: {
		type: Number,
		required: true,
		default: 0
	},
	allMatch_withoutLeagues: {
		type: Number,
		required: true,
		default: 0
	},
	strategyOne_withoutLeagues: {
		type: Number,
		required: true,
		default: 0
	},
	strategyTwo_zero_withoutLeagues: {
		type: Number,
		required: true,
		default: 0
	},
	strategyTwo_one_withoutLeagues: {
		type: Number,
		required: true,
		default: 0
	},
	strategyTwo_two_withoutLeagues: {
		type: Number,
		required: true,
		default: 0
	},
	createdBy: {
		type: Date,
		default: new Date()
	}
});

module.exports = mongoose.model('Report', ReportSchema);