require('../utils/dbProvider');
const log = require('../utils/logger');
const ReportModel = require('../models/report');
const {mapProps} = require('../utils/reportHelpers');

/**
 * Получить записи из таблицы отчеты.
 *
 * @param {Object} param для таблицы.
 * @returns {Promise<any>}
 */
function getReport(param = {}) {
	return ReportModel.find(param)
		.read('secondary')
		.exec()
		.then(reports => {
			if (!reports) {
				log.error('ReportNotFound', 'Report with  not found');
				return [];
			}
			return reports.map((report, index) => {
				return mapProps(report, index);
			});
		})
		.catch(error => {
			log.error(`Error getReport param=${param}: ${error.message}`);
		});
}

/**
 * Создание новой записи в таблице.
 *
 * @param {Object} param для таблицы
 * @returns {Promise<any>}
 */
function newReport(param = {}) {
	const report = new ReportModel(param);
	return report.save()
		.catch(error => {
			log.error(`Error newReport param=${param}: ${error.message}`);
		});
}

module.exports = {
	getReport,
	newReport
};