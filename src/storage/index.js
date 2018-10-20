require('../utils/dbProvider');
const log = require('../utils/logger');
const StatisticModel = require('../models/statistic');
const {mapProps} = require('../utils/statisticHelpers');

/**
 * Получить записи из таблицы.
 *
 * @param {Object} param для таблицы.
 * @returns {Promise<any>}
 */
function getFields(param = {}) {
	return StatisticModel.find(param)
		.exec()
		.then(statistics => {
			if (!statistics) {
				log.error('StatisticNotFound', 'Statistic with  not found');
			}
			return statistics.map(statistic => {
				let props = mapProps(statistic);
				props['rate'] = 500;
				props['total'] = 750;
				props['bank'] = 10000;
				props['percent'] = 5;
				return props;
			});
		})
		.catch(error => {
			log.error('error newField ', error);
		});
}

/**
 * Метод для проверки, есть ли данное поле в таблице.
 *
 * @param {Object} param для таблицы
 * @returns {Promise<boolean | never>}
 */
function isFields(param = {}) {
	return StatisticModel.find(param)
		.exec()
		.then(statistics => {
			if (statistics.length) {
				return Promise.resolve(false);
			}
			return Promise.resolve(true);
		})
		.catch(error => {
			log.error('error isFields ', error);
		});
}

/**
 * Создание новой записи в таблице.
 *
 * @param {Object} param для таблицы
 * @returns {Promise<any>}
 */
function newField(param) {
	return StatisticModel.find({matchId: param.matchId})
		.exec()
		.then(statistics => {
			if (statistics.length) {
				return Promise.resolve(null);
			}
			const statistic = new StatisticModel(param);
			return statistic.save();
		})
		.catch(error => {
			log.error('error newField ', error);
		});
	
}

/**
 * Создание новой записи в таблице.
 *
 * @param {Object} param для таблицы
 * @returns {Promise<any>}
 */
function setField(param) {
	return StatisticModel.findOne({matchId: param.matchId})
		.exec()
		.then(statistic => {
			if (param.index) {
				statistic.index = param.index;
			}
			return statistic.save();
		})
		.catch(error => {
			log.error('error newField ', error);
		});
}

module.exports = {
	getFields,
	isFields,
	newField,
	setField
};