const {CronJob} = require('cron');
const config = require('config');
const log = require('./src/utils/logger');
const {search} = require('./src/searchMatch');
const {exportStatistic} = require('./src/export');

const schedulerSearch = process.env.NODE_ENV === 'development'
	? '*/20 * * * * *'
	: config.get('cron.schedulerSearch');

const schedulerExport = process.env.NODE_ENV === 'development'
	? '*/02 * * * * *'
	: config.get('cron.schedulerExport');

/**
 * Планировшик поиска матчей
 */
if (schedulerSearch) {
	log.info('****start scheduler search****');
	let schedulerSearchJob;
	try {
		schedulerSearchJob = new CronJob(schedulerSearch, () => {
			// search();
		}, null, true);
	} catch (ex) {
		schedulerSearchJob.stop();
		log.error('cron pattern not valid');
	}
}

/**
 * Планировщик бэкапа статистики
 */
exportStatistic();
/*if (schedulerExport) {
	log.info('****start scheduler export****');
	let schedulerExportJob;
	try {
		schedulerExportJob = new CronJob(schedulerExport, () => {
			 exportStatistic();
			 schedulerExportJob.stop();
		}, null, true);
	} catch (ex) {
		schedulerExportJob.stop();
		log.error('cron pattern not valid');
	}
}*/
