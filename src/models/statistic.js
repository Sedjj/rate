const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StatisticSchema = new Schema({
	matchId: {
		type: Number,
		required: true,
		default: 0
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
		},
		women: {
			type: Number,
			required: true,
			default: 0
		},
		youth: {
			type: Number,
			required: true,
			default: 0
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
	snapshot: {
		start: {
			time: {
				type: Number,
				required: true,
				default: 0
			},
			p1: {
				type: Number,
				required: true,
				default: 0
			},
			x: {
				type: Number,
				required: true,
				default: 0
			},
			p2: {
				type: Number,
				required: true,
				default: 0
			},
			mod: {
				type: Number,
				required: true,
				default: 0
			}
		},
		end: {
			time: {
				type: Number,
				required: true,
				default: 0
			},
			p1: {
				type: Number,
				required: true,
				default: 0
			},
			x: {
				type: Number,
				required: true,
				default: 0
			},
			p2: {
				type: Number,
				required: true,
				default: 0
			},
			mod: {
				type: Number,
				required: true,
				default: 0
			}
		}
	},
	cards: {
		one: {
			red: {
				type: Number,
				required: true,
				default: 0
			},
			attacks: {
				type: Number,
				required: true,
				default: 0
			},
			danAttacks: {
				type: Number,
				required: true,
				default: 0
			}
		},
		two: {
			red: {
				type: Number,
				required: true,
				default: 0
			},
			attacks: {
				type: Number,
				required: true,
				default: 0
			},
			danAttacks: {
				type: Number,
				required: true,
				default: 0
			}
		}
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