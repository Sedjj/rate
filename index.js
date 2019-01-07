const {CronJob, CronTime} = require('cron');
const rc = require('./src/utils/random-cron');
const config = require('config');
const log = require('./src/utils/logger');
const {search} = require('./src/searchMatch');
const {checkingResults} = require('./src/checkingResults');
const {exportBackupStatistic} = require('./src/export');
const {throttle} = require('./src/utils/throttle');

const exportBackupStatisticDebounce = throttle(exportBackupStatistic, 20000);

const schedulerSearch = process.env.NODE_ENV === 'development'
	? rc.some('seconds').between(10, 20).generate()
	: rc.some('seconds').between(
		config.get('cron.schedulerSearch.before'),
		config.get('cron.schedulerSearch.after')
	).generate();

const schedulerBackupExport = process.env.NODE_ENV === 'development'
	? '*/50 * * * * *'
	: config.get('cron.schedulerBackupExport');

/**
 * Планировшик поиска матчей.
 */
if (schedulerSearch) {
	log.info('****start scheduler search****');
	let schedulerSearchJob = new CronJob(schedulerSearch, () => {
		try {
			schedulerSearchJob.setTime(new CronTime(
				rc.some('seconds').between(
					config.get('cron.schedulerSearch.before'),
					config.get('cron.schedulerSearch.after')
				).generate()
			));
			search();
		} catch (ex) {
			schedulerSearchJob.stop();
			log.error('cron pattern not valid');
		}
	}, () => {
		schedulerSearchJob.start();
	}, true);
}

/**
 * Планировщик бэкапа статистики.
 */
if (schedulerBackupExport) {
	log.info('****start scheduler backup export****');
	let schedulerBackupExportJob = new CronJob(schedulerBackupExport, () => {
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