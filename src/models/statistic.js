const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StatisticSchema = new Schema({
	matchId: {
		type: String,
		required: true,
		default: ''
	},
	score: {
		sc1: {
			type: String,
			required: true,
			default: ''
		},
		sc2: {
			type: String,
			required: true,
			default: ''
		}
	},
	command: {
		ru: {
			one: {
				type: String,
				required: true,
				default: ''
			},
			two: {
				type: String,
				required: true,
				default: ''
			}
		},
		en: {
			one: {
				type: String,
				required: true,
				default: ''
			},
			two: {
				type: String,
				required: true,
				default: ''
			}
		}
	},
	group: {
		ru: {
			type: String,
			required: true,
			default: ''
		},
		en: {
			type: String,
			required: true,
			default: ''
		}
	},
	strategy: {
		type: Number,
		required: true,
		default: ''
	},
	index: {
		type: Number,
		required: true,
		default: 0
	},
	total: {
		type: Number,
		required: true,
		default: 0
	},
	createdBy: {
		type: Date,
		default: new Date()
	},
	modifiedBy: {
		type: Date,
		default: new Date()
	}
});

module.exports = mongoose.model('Statistic', StatisticSchema);