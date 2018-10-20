const path = require('path');
const config = require('config');
const log = require('../utils/logger');
const {readFile} = require('../utils/fsHelpers');
const {getFields} = require('../storage');
const XlsxTemplate = require('../vendor/xlsx-template');

const storagePath = config.get('filesStorage.storagePath') || process.cwd();
const exportTemplatesDirectory = config.get('filesStorage.exportTemplatesDirectory') || 'exportTemplates';
const fileName = config.get('filesStorage.fileName') || 'reports-list-default.xlsx';

const filePath = path.join(storagePath, exportTemplatesDirectory, fileName);

/**
 * Метод
 *
 * @returns {Promise<void>}
 */
async function exportStatistic() {
	const file = await returnStatisticListTemplate();
	console.log(file);
}

/**
 * Возвращает заполненый шаблон списка статистики.
 *
 * @returns {Promise<{statistic: Array, currentDate: Date} | never>}
 */
function returnStatisticListTemplate() {
	let props = {
		statistic: [],
		currentDate: new Date()
	};
	
	return getFields()
		.then((items) => {
			props.currentDate = new Date();
			props.objectName = 'statistics';
			props.statistics = items;
			return props;
		})
		.then((props) => {
			try {
				return readFile(filePath)
					.then(file => {
						const template = new XlsxTemplate(file);
						// Replacements take place on first sheet
						const sheetNumber = 1;
						template.substitute(sheetNumber, props);
						
						return template.generate({type: 'nodebuffer'});
					});
			} catch (error) {
				log.error('ExportError ', error.message);
			}
		});
}

module.exports = {
	exportStatistic
};