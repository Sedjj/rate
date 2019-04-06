const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FootballSchema = new Schema({
	matchId: {
		type: Number,
		required: true,
		default: 0
	},
	score: {
		sc1: {
			type: Number,
			required: true,
			default: 0
		},
		sc2: {
			type: Number,
			required: true,
			default: 0
		},
		resulting: {
			type: String,
			default: ''
		},
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
		default: 0
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
		before: {
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
				},
				shotsOn: {
					type: Number,
					required: true,
					default: 0
				},
				shotsOff: {
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
				},
				shotsOn: {
					type: Number,
					required: true,
					default: 0
				},
				shotsOff: {
					type: Number,
					required: true,
					default: 0
				}
			}
		},
		after: {
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
				},
				shotsOn: {
					type: Number,
					required: true,
					default: 0
				},
				shotsOff: {
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
				},
				shotsOn: {
					type: Number,
					required: true,
					default: 0
				},
				shotsOff: {
					type: Number,
					required: true,
					default: 0
				}
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

module.exports = {
	FootballModel: mongoose.model('Football', FootballSchema)
};