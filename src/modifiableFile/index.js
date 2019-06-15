const config = require('config');
const active = config.parser.active;

let searchHelper;

const importComponent = (name) => {
	switch (name) {
		case '1xstavka': {
			return require('./xstavkaHelpers');
		}
		case '1xbet': {
			return require('./xbetHelper');
		}
		case 'fonbet': {
			return require('./fonbetHelper');
		}
		case 'lds': {
			return require('./ldsHelper');
		}
		case 'marathonbet': {
			return require('./marathonbetHelper');
		}
	}
};

searchHelper = importComponent(active[0]);

module.exports = {
	searchHelper
};