const config = require('config');
const active = config.get('parser.active');

let searchHelper;
switch (active[0]) {
	case '1xstavka': {
		searchHelper = require('./xstavkaHelpers');
		break;
	}
	case '1xbet': {
		searchHelper = require('./xbetHelper');
		break;
	}
	case 'fonbet': {
		searchHelper = require('./fonbetHelper');
		break;
	}
	case 'lds': {
		searchHelper = require('./ldsHelper');
		break;
	}
	case 'marathonbet': {
		searchHelper = require('./marathonbetHelper');
		break;
	}
}

module.exports = {
	searchHelper
};