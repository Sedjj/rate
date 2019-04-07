const {CronJob, CronTime} = require('cron');
const rc = require('./utils/random-cron');
const config = require('config');
const {log} = require('./utils/logger');
/*const {performAuth} = require('./src/auth');*/
const football = require('./storage/football');
const tableTennis = require('./storage/tableTennis');
const {searchFootball, searchTableTennis} = require('./searchMatch');
const {checkingResults} = require('./checkingResults');
require('./telegram/bot');

const schedulerSearchFootball = process.env.NODE_ENV === 'development'
	? rc.some('seconds').between(50, 150).generate()
	: rc.some('seconds').between(
		config.cron.schedulerSearchFootball.before,
		config.cron.schedulerSearchFootball.after
	).generate();

const schedulerSearchTableTennis = process.env.NODE_ENV === 'development'
	? rc.some('seconds').between(10, 20).generate()
	: rc.some('seconds').between(
		config.cron.schedulerSearchTableTennis.before,
		config.cron.schedulerSearchTableTennis.after
	).generate();

const schedulerCheckingResults = process.env.NODE_ENV === 'development'
	? '*/45 * * * * *'
	: config.cron.schedulerCheckingResults;

const numericalDesignationFootball = config.choice.live.football.numericalDesignation;
const numericalDesignationTableTennis = config.choice.live.tableTennis.numericalDesignation;

/**
 * Планировшик поиска матчей по футболу.
 */
if (schedulerSearchFootball) {
	log.info('****start scheduler search****');
	let schedulerSearchJob = new CronJob(schedulerSearchFootball, () => {
		try {
			schedulerSearchJob.setTime(new CronTime(
				rc.some('seconds').between(
					config.cron.schedulerSearchFootball.before,
					config.cron.schedulerSearchFootball.after
				).generate()
			));
			searchFootball();
		} catch (error) {
			schedulerSearchJob.stop();
			log.error(`cron pattern not valid: ${error}`);
		}
	}, () => {
		schedulerSearchJob.start();
	}, true);
}

/**
 * Планировшик поиска матчей по тенису.
 */
if (schedulerSearchTableTennis) {
	log.info('****start scheduler search****');
	let schedulerSearchJob = new CronJob(schedulerSearchTableTennis, () => {
		try {
			schedulerSearchJob.setTime(new CronTime(
				rc.some('seconds').between(
					config.cron.schedulerSearchTableTennis.before,
					config.cron.schedulerSearchTableTennis.after
				).generate()
			));
			searchTableTennis();
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
			checkingResults(football.getStatistic, tableTennis.setStatistic, numericalDesignationFootball);
			checkingResults(tableTennis.getStatistic, tableTennis.setStatistic, numericalDesignationTableTennis);
		} catch (error) {
			schedulerCheckingResultsJob.stop();
			log.error(`cron pattern not valid: ${error}`);
		}
	}, null, true);
}