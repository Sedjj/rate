const path = require('path');
const config = require('config');
const log = require('../utils/logger');
const {readFile, saveBufferToFile, readFileToStream} = require('../utils/fsHelpers');
const {getStatistic} = require('../storage/statistic');
const {getReport, newReport} = require('../storage/report');
const XlsxTemplate = require('xlsx-template');
const {decorateMessageEveryReport} = require('../utils/formateMessage');
const {getFormattedDate} = require('../utils/dateFormat');
const {sendFile, sendMessage} = require('../telegramApi');

const storagePath = config.get('path.storagePath') || process.cwd();
const exportTemplatesDirectory = config.get('path.directory.exportTemplates') || 'exportTemplates';
const uploadDirectory = config.get('path.directory.upload') || 'upload';

const reportsInput = config.get('path.storage.fileName.reports.input') || 'Reports-list-default.xlsx';
const reportsOutput = config.get('path.storage.fileName.reports.output') || 'Reports.xlsx';

const reportsPathInput = path.join(storagePath, exportTemplatesDirectory, reportsInput);
const reportsPathOutput = path.join(storagePath, uploadDirectory, reportsOutput);

/**
 * Метод для отправки бэкапа таблицы статистики
 *
 * @returns {Promise<void>}
 */
async function exportBackupStatistic() {
	try {
		const file = await returnStatisticListTemplate();
		const filePath = await saveBufferToFile(reportsPathOutput, file);
		const stream = await readFileToStream(filePath);
		await sendFile(stream);
		log.debug('Файл отправлен');
	} catch (error) {
		log.error(`Send error: ${error.message}`);
	}
}

/**
 * Метод для отправки ежедневного отчета о ставках
 *
 * @returns {Promise<void>}
 */
async function exportEveryDayReport() {
	try {
		const param = await returnParamForReport();
		const report = await newReport(param);
		await sendMessage(decorateMessageEveryReport(report));
		log.debug('Отчет отправлен');
	} catch (error) {
		log.error(`Send every day error: ${error.message}`);
	}
}

/**
 * Метод для отправки отчета недельной работы бота
 *
 * @returns {Promise<void>}
 */
async function exportEveryWeekReport() {
	try {
		const file = await returnReportListTemplate();
		const filePath = await saveBufferToFile(reportsPathOutput, file);
		const stream = await readFileToStream(filePath);
		await sendFile(stream);
		log.debug('Файл отправлен');
	} catch (error) {
		log.error(`Send  every week error: ${error.message}`);
	}
}

/**
 * Возвращает заполненый шаблон списка статистики.
 *
 * @returns {Promise<{statistic: Array, currentDate: Date} | never>}
 */
async function returnParamForReport() {
	log.debug('Начало сбора параметров для отчета');
	return {
		allMatch: getAllProfit(await getStatistic()),
		strategyOne: getAllProfit(await getStatistic({strategy: 1})),
		strategyTwo_zero: getAllProfit(await getStatistic({score: '0:0'})),
		strategyTwo_one: getAllProfit(await getStatistic({score: '1:1'})),
		strategyTwo_two: getAllProfit(await getStatistic({score: '2:2'})),
		allMatch_withoutLeagues: getAllProfit(await getStatistic({}, ['(', ')'])),
		strategyOne_withoutLeagues: getAllProfit(await getStatistic({strategy: 1}, ['(', ')'])),
		strategyTwo_zero_withoutLeagues: getAllProfit(await getStatistic({score: '0:0'}, ['(', ')'])),
		strategyTwo_one_withoutLeagues: getAllProfit(await getStatistic({score: '1:1'}, ['(', ')'])),
		strategyTwo_two_withoutLeagues: getAllProfit(await getStatistic({score: '2:2'}, ['(', ')'])),
	};
}

/**
 * Метод для суммирования прибыли.
 *
 * @param {Array} items массив записей
 * @returns {*}
 */
function getAllProfit(items) {
	return items && items.reduce((current, item) => {
		return current + item.profit;
	}, 0);
}

/**
 * Возвращает заполненый шаблон списка статистики.
 *
 * @returns {Promise<{statistic: Array, currentDate: Date} | never>}
 */
function returnStatisticListTemplate() {
	log.debug('Начало экспорта Statistics');
	let props = {
		statistics: [],
		objectName: 'statistics',
		currentDate: getFormattedDate(new Date()),
		profit: 0
	};
	return getStatistic()
		.then((items) => {
			props.statistics = items;
			props.profit = items && items.reduce((current, item) => {
				return current + item.profit;
			}, 0);
			log.debug('Данные подготовлены');
			return props;
		})
		.then((props) => {
			try {
				return readFile(reportsPathInput)
					.then(file => {
						const template = new XlsxTemplate(file);
						// Replacements take place on first sheet
						const sheetNumber = 1;
						template.substitute(sheetNumber, props);
						log.debug('Генерация файла');
						return template.generate({type: 'nodebuffer'});
					});
			} catch (error) {
				log.error(`ExportError statisticList: ${error.message}`);
			}
		});
}

/**
 * Возвращает заполненый шаблон списка отчетов.
 *
 * @returns {Promise<{statistic: Array, currentDate: Date} | never>}
 */
function returnReportListTemplate() {
	log.debug('Начало экспорта Report');
	const beforeDate = new Date();
	beforeDate.setDate(beforeDate.getDate() - 7);
	let props = {
		reports: [],
		objectName: 'reports',
		beforeDate: getFormattedDate(beforeDate),
		afterDate: getFormattedDate(new Date())
	};
	let query = {};
	query['$and'] = [];
	query['$and'].push({createdBy: {$gte: beforeDate.toISOString()}});
	query['$and'].push({createdBy: {$lte: (new Date()).toISOString()}});
	return getReport(query)
		.then((items) => {
			props.reports = items;
			log.debug('Данные подготовлены');
			return props;
		})
		.then((props) => {
			try {
				return readFile(reportsPathInput)
					.then(file => {
						const template = new XlsxTemplate(file);
						// Replacements take place on first sheet
						const sheetNumber = 2;
						template.substitute(sheetNumber, props);
						log.debug('Генерация файла');
						return template.generate({type: 'nodebuffer'});
					});
			} catch (error) {
				log.error(`ExportError reportList: ${error.message}`);
			}
		});
}

module.exports = {
	exportBackupStatistic,
	exportEveryDayReport,
	exportEveryWeekReport,
};