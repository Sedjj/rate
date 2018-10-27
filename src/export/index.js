const path = require('path');
const config = require('config');
const log = require('../utils/logger');
const {readFile, saveBufferToFile, readFileToStream} = require('../utils/fsHelpers');
const {getFields} = require('../storage');
const XlsxTemplate = require('xlsx-template');
const {getFormattedDate} = require('../utils/dateFormat');
const {sendFile, sendMessage} = require('../telegramApi');

const storagePath = config.get('path.storagePath') || process.cwd();
const exportTemplatesDirectory = config.get('path.directory.exportTemplates') || 'exportTemplates';
const uploadDirectory = config.get('path.directory.upload') || 'upload';
const fileNameInput = config.get('path.storage.fileName.input') || 'reports-list-default.xlsx';
const fileNameOutput = config.get('path.storage.fileName.output') || 'statistics-report.xlsx';

const filePathInput = path.join(storagePath, exportTemplatesDirectory, fileNameInput);
const filePathOutput = path.join(storagePath, uploadDirectory, fileNameOutput);

/**
 * Метод для отправки отчета
 *
 * @returns {Promise<void>}
 */
async function exportStatistic() {
	const file = await returnStatisticListTemplate();
	saveBufferToFile(filePathOutput, file)
		.then((filePath) => {
			return readFileToStream(filePath);
		})
		.then((stream) => {
			return sendFile(stream);
		})
		.then(() => {
			log.debug('Файл отправлен');
		})
		.catch((error) => {
			log.error(`Send error: ${error.message}`);
		});
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
		currentDate: new Date()
	};
	return getFields()
		.then((items) => {
			const profit = items && items.reduce((current, item) => {
				return current + (item.index * 500 - 500);
			}, 0);
			props.currentDate = getFormattedDate(new Date());
			props.objectName = 'statistics';
			props.statistics = items;
			props.profit = profit;
			sendMessage(profit);
			log.debug('Данные подготовлены');
			return props;
		})
		.then((props) => {
			try {
				return readFile(filePathInput)
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

module.exports = {
	exportStatistic,
	returnStatisticListTemplate
};