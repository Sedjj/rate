require('../utils/dbProvider');
const log = require('../utils/logger');
const StatisticModel = require('../models/statistic');
const {mapProps} = require('../utils/statisticHelpers');
const {filterGame} = require('../utils/searchHelper');
const config = require('config');

const rate = config.get('outpit.rate') || 500;

/**
 * Получить записи из таблицы статистика.
 *
 * @param {Object} param для таблицы.
 * @param {Array} excludeName масив элементов которые нужно исключить из названий команд.
 * @returns {Promise<any>}
 */
function getStatistic(param = {}, excludeName = []) {
	return StatisticModel.find(param)
		.read('secondary')
		.exec()
		.then(statistics => {
			if (!statistics) {
				log.error('StatisticNotFound', 'Statistic with  not found');
				return [];
			}
			return statistics
				.filter((statistic) => filterGame(statistic, excludeName))
				.map((statistic, index) => {
					let props = mapProps(statistic, index + 1);
					props['rate'] = rate;
					props['profit'] = props.index * rate - rate;
					return props;
				});
		})
		.catch(error => {
			log.error(`Error getStatistic param=${param}: ${error.message}`);
		});
}

/**
 * Метод для проверки, есть ли данное поле в таблице.
 *
 * @param {Object} param для таблицы
 * @returns {Promise<boolean | never>}
 */
function isStatistic(param = {}) {
	return StatisticModel.find(param)
		.exec()
		.then(statistics => {
			if (statistics.length) {
				return Promise.resolve(true);
			}
			return Promise.resolve(false);
		})
		.catch(error => {
			log.error(`Error isStatistic param=${param}: ${error.message}`);
		});
}

/**
 * Создание новой записи в таблице.
 *
 * @param {Object} param для таблицы
 * @returns {Promise<any>}
 */
function newStatistic(param) {
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
			log.error(`Error newStatistic param=${param}: ${error.message}`);
		});

}

/**
 * Редактирование записи в таблице.
 *
 * @param {Object} param для таблицы
 * @returns {Promise<any>}
 */
function setStatistic(param) {
	return StatisticModel.findOne({matchId: param.matchId})
		.read('secondary')
		.exec()
		.then(statistic => {
			statistic.index = param.index;
			statistic.modifiedBy = param.modifiedBy;
			return statistic.save();
		})
		.catch(error => {
			log.error(`Error setStatistic param=${param}: ${error.message}`);
		});
}

module.exports = {
	getStatistic,
	isStatistic,
	newStatistic,
	setStatistic
};