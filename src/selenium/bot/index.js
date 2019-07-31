const config = require('config');
const active = config['parser'].active;

let searchHelper;

const importComponent = (name) => {
	switch (name) {
		case '1xstavka': {
			return require('./xstavka');
		}
		case '1xbet': {
			return require('./xbet');
		}
		case 'mirror1xbet': {
			return require('./mirrorXbet');
		}
	}
};

searchHelper = importComponent(active[0]);

module.exports = {
	searchHelper
};