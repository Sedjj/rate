require('../utils/dbProvider');
const log = require('../utils/logger');
const statisticModel = require('../models/statistic');

function newField(param) {
	const statistic = new statisticModel(param);
	statistic.save()
		.catch(error => {
			log.info('error newField ', error);
		});
}

module.exports = {
	newField
};