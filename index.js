const {CronJob, CronTime} = require('cron');
const rc = require('./src/utils/random-cron');
const config = require('config');
const {log} = require('./src/utils/logger');
/*const {performAuth} = require('./src/auth');*/
const {search} = require('./src/searchMatch');
const {checkingResults} = require('./src/checkingResults');
require('./src/telegram/bot');

const schedulerSearch = process.env.NODE_ENV === 'development'
	? rc.some('seconds').between(10, 20).generate()
	: rc.some('seconds').between(
		config.cron.schedulerSearch.before,
		config.cron.schedulerSearch.after
	).generate();

const schedulerCheckingResults = process.env.NODE_ENV === 'development'
	? '*/45 * * * * *'
	: config.cron.schedulerCheckingResults;

/**
 * Планировшик поиска матчей.
 */
if (schedulerSearch) {
	log.info('****start scheduler search****');
	let schedulerSearchJob = new CronJob(schedulerSearch, () => {
		try {
			schedulerSearchJob.setTime(new CronTime(
				rc.some('seconds').between(
					config.cron.schedulerSearch.before,
					config.cron.schedulerSearch.after
				).generate()
			));
			search();
		} catch (error) {
			schedulerSearchJob.stop();
			log.error(`cron pattern not valid: ${error}`);
		}
	}, () => {
		schedulerSearchJob.start();
	}, true);
}

/**
 * Планировщик получения результатов матчей.
 */
if (schedulerCheckingResults) {
	log.info('****start scheduler checking results****');
	let schedulerCheckingResultsJob = new CronJob(schedulerCheckingResults, () => {
		try {
			checkingResults();
		} catch (error) {
			schedulerCheckingResultsJob.stop();
			log.error(`cron pattern not valid: ${error}`);
		}
	}, null, true);
}