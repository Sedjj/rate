require('../utils/dbProvider');
const log = require('../utils/logger');
const StatisticModel = require('../models/statistic');
const {mapProps} = require('../utils/statisticHelpers');

/**
 * Получить записи из таблицы.
 *
 * @param {Object} param для таблицы
 */
function getField(param) {
	StatisticModel.find({})
		.exec()
		.then(statistics => {
			if (!statistics) {
				log.info('StatisticNotFound', 'Statistic with  not found');
			}
			return statistics.map(statistic => {
					let props = mapProps(statistic);
					props['rate'] = 500;
					props['total'] = 750;
					props['bank'] = 10000;
					props['percent'] = 5;
					return props
				}
			);
		})
		.catch(error => {
			log.info('error newField ', error);
		});
}

/**
 * Создание новой записи в таблице.
 *
 * @param {Object} param для таблицы
 */
function newField(param) {
	StatisticModel.find({})
		.exec()
		.then(statistics => {
			param.id = statistics.length + 1;
			const statistic = new StatisticModel(param);
			return statistic.save();
		})
		.catch(error => {
			log.info('error newField ', error);
		});
}

/**
 * Создание новой записи в таблице.
 *
 * @param {Object} param для таблицы
 */
function setField(param) {
	StatisticModel.findOne({matchId: param.matchId})
		.exec()
		.then(statistic => {
			if (param.index) {
				statistic.index = param.ndex;
			}
			return statistic.save();
		})
		.catch(error => {
			log.info('error newField ', error);
		});
}

module.exports = {
	getField,
	newField,
	setField
};