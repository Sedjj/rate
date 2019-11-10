const path = require('path');
const config = require('config');
const {log} = require('../../utils/logger');
const {readFile} = require('../../utils/fsHelpers');
const {getStatistic} = require('../../storage/basketball');
const XlsxTemplate = require('xlsx-template');

const storagePath = config.path.storagePath || process.cwd();
const exportTemplatesDirectory = config.path.directory.exportTemplates || 'exportTemplates';
const inputBasketball = config.path.storage.basketball.inputName || 'Reports-basketball-default.xlsx';
const pathInputBasketball = path.join(storagePath, exportTemplatesDirectory, inputBasketball);

/**
 * Возвращает заполненый шаблон списка статистики.
 *
 * @param {Number} days количество дней для экспорта
 * @returns {Promise<{statistics: Array} | never>}
 */
function getStatisticsBasketball(days = 2) {
	const beforeDate = new Date(new Date().setUTCHours(0, 0, 0, 1));
	const currentDate = new Date(new Date().setUTCHours(23, 59, 59, 59));
	beforeDate.setUTCDate(beforeDate.getUTCDate() - days);
	let props = {
		statistics: [],
	};
	let query = {};
	query['$and'] = [];
	query['$and'].push({modifiedBy: {$gte: beforeDate.toISOString()}});
	query['$and'].push({modifiedBy: {$lte: currentDate.toISOString()}});
	log.debug(`Начало экспорта Statistics с ${beforeDate.toISOString()} по ${currentDate.toISOString()}`);
	return getStatistic(query)
		.then((items) => {
			props.statistics = items;
			log.debug(`Подготовлено данных ${items.length}`);
			return props;
		})
		.then((props) => {
			try {
				return readFile(pathInputBasketball)
					.then(file => {
						const template = new XlsxTemplate(file);
						// Replacements take place on first sheet
						template.substitute(1, {
							statistics: props.statistics.filter((item) => item.strategy === 1)
						});
						log.debug('Генерация файла');
						return template.generate({type: 'nodebuffer'});
					});
			} catch (error) {
				log.error(`ExportError statisticList: ${error.message}`);
			}
		});
}

module.exports = {
	getStatisticsBasketball
};