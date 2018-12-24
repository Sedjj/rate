require('../utils/dbProvider');
const log = require('../utils/logger');
const StatisticModel = require('../models/statistic');
const {mapProps} = require('../utils/statisticHelpers');
const config = require('config');

const rate = config.get('output.rate') || 2000;

/**
 * Получить записи из таблицы статистика.
 *
 * @param {Object} param для таблицы.
 * @returns {Promise<any>}
 */
function getStatistic(param = {}) {
	return StatisticModel.find(param)
		.read('secondary')
		.exec()
		.then(statistics => {
			if (!statistics) {
				log.error('StatisticNotFound', 'Statistic with  not found');
				return [];
			}
			return statistics
				.map((statistic, index) => {
					let props = mapProps(statistic, index + 1);
					props['score'] = statistic.score.sc1 + ':' + statistic.score.sc2;
					props['typeMatch'] = (statistic.command.women + statistic.command.youth) > 0 ? 1 : 0;
					props['profit'] = props.index * rate - rate;
					return props;
				});
		})
		.catch(error => {
			log.error(`getStatistic param=${JSON.stringify(JSON.stringify(param))}: ${error.message}`);
			throw new Error(error);
		});
}

/**
 * Метод для удаления записи в таблице.
 *
 * @param {Object} param для таблицы
 * @returns {Promise<boolean | never>}
 */
function deleteStatistic(param) {
	return StatisticModel.findOneAndRemove({matchId: param.matchId})
		.exec()
		.catch(error => {
			log.error(`deleteStatistic param=${JSON.stringify(param)}: ${error.message}`);
			throw new Error(error);
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
			log.error(`newStatistic param=${JSON.stringify(param)}: ${error.message}`);
			throw new Error(error);
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
			if (param.index !== undefined) {
				statistic.index = param.index;
			}
			if (param.total !== undefined) {
				statistic.total = param.total;
			}
			if (param.snapshot && (param.snapshot.start !== undefined)) {
				statistic.snapshot.start = param.snapshot.start;
			}
			if (param.snapshot && (param.snapshot.end !== undefined)) {
				statistic.snapshot.end = param.snapshot.end;
			}
			if (param.cards && (param.cards.before !== undefined)) {
				statistic.cards.before = param.cards.before;
			}
			if (param.cards && (param.cards.after !== undefined)) {
				statistic.cards.after = param.cards.after;
			}
			if (param.modifiedBy !== undefined) {
				statistic.modifiedBy = param.modifiedBy;
			}
			return statistic.save();
		})
		.catch(error => {
			log.error(`Error setStatistic param=${JSON.stringify(param)}: ${error.message}`);
			throw new Error(error);
		});
}

module.exports = {
	getStatistic,
	deleteStatistic,
	newStatistic,
	setStatistic
};