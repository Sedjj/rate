const {CronJob} = require('cron');
const config = require('config');
const log = require('./src/utils/logger');
const {search} = require('./src/searchMatch');
const {checkingResults} = require('./src/checkingResults');
const {exportBackupStatistic} = require('./src/export');
const {throttle} = require('./src/utils/throttle');

const exportBackupStatisticDebounce = throttle(exportBackupStatistic, 20000);

const schedulerSearch = process.env.NODE_ENV === 'development'
	? '*/10 * * * * *'
	: config.get('cron.schedulerSearch');

const schedulerBackupExport = process.env.NODE_ENV === 'development'
	? '*/40 * * * * *'
	: config.get('cron.schedulerBackupExport');

/**
 * Планировшик поиска матчей.
 */
if (schedulerSearch) {
	log.info('****start scheduler search****');
	let schedulerSearchJob;
	schedulerSearchJob = new CronJob(schedulerSearch, () => {
		try {
			search();
		} catch (ex) {
			schedulerSearchJob.stop();
			log.error('cron pattern not valid');
		}
	}, null, true);
}

/**
 * Планировщик бэкапа статистики.
 */
if (schedulerBackupExport) {
	log.info('****start scheduler backup export****');
	let schedulerBackupExportJob;
	schedulerBackupExportJob = new CronJob(schedulerBackupExport, () => {
		try {
			checkingResults()
				.then(() => {
					exportBackupStatisticDebounce();
				});
		} catch (ex) {
			schedulerBackupExportJob.stop();
			log.error('cron pattern not valid');
		}
	}, null, true);
}