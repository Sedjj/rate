process.env.NTBA_FIX_319 = 1;
const {CronJob, CronTime} = require('cron');
require('./utils/dbProvider');
require('./telegram/bot');
const rc = require('./utils/random-cron');
const config = require('config');
const {log} = require('./utils/logger');
const football = require('./storage/football');
const tableTennis = require('./storage/tableTennis');
const tennis = require('./storage/tennis');
const {bot: {performEmulation}} = require('./selenium/bot');
const {searchFootball, searchTableTennis, searchTennis} = require('./searchMatch');
const {checkingResults} = require('./checkingResults');

const numericalDesignationFootball = config.choice.live.football.numericalDesignation;
const numericalDesignationTableTennis = config.choice.live.tableTennis.numericalDesignation;
const numericalDesignationTennis = config.choice.live.tennis.numericalDesignation;

/*performEmulation('201788563', 9, `Total Over ${1.5}`);*/

const schedulerSearchFootball = {
	title: 'в секундах',
	before: 150,
	after: 250
};
const schedulerSearchTableTennis = {
	title: 'в секундах',
	before: 20,
	after: 60
};
const schedulerSearchTennis = {
	title: 'в секундах',
	before: 20,
	after: 60
};

const rendomSchedulerSearchFootball = process.env.NODE_ENV === 'development'
	? rc.some('seconds').between(20, 60).generate()
	: rc.some('seconds').between(
		schedulerSearchFootball.before,
		schedulerSearchFootball.after
	).generate();

const rendomSchedulerSearchTableTennis = process.env.NODE_ENV === 'development'
	? rc.some('seconds').between(10, 20).generate()
	: rc.some('seconds').between(
		schedulerSearchTableTennis.before,
		schedulerSearchTableTennis.after
	).generate();

const rendomSchedulerSearchTennis = process.env.NODE_ENV === 'development'
	? rc.some('seconds').between(10, 20).generate()
	: rc.some('seconds').between(
		schedulerSearchTennis.before,
		schedulerSearchTennis.after
	).generate();

const rendomSchedulerCheckingResults = process.env.NODE_ENV === 'development'
	? '*/45 * * * * *'
	: '00 05 10 * * 0-7';

/**
 * Планировшик поиска матчей по футболу.
 */
if (rendomSchedulerSearchFootball) {
	log.info('****start scheduler search****');
	let schedulerSearchJob = new CronJob(rendomSchedulerSearchFootball, () => {
		try {
			schedulerSearchJob.setTime(new CronTime(
				rc.some('seconds').between(
					schedulerSearchFootball.before,
					schedulerSearchFootball.after
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
 * Планировшик поиска матчей по настольному тенису.
 */
if (rendomSchedulerSearchTableTennis) {
	log.info('****start scheduler search****');
	let schedulerSearchJob = new CronJob(rendomSchedulerSearchTableTennis, () => {
		try {
			schedulerSearchJob.setTime(new CronTime(
				rc.some('seconds').between(
					schedulerSearchTableTennis.before,
					schedulerSearchTableTennis.after
				).generate()
			));
			//searchTableTennis();
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
if (rendomSchedulerSearchTennis) {
	log.info('****start scheduler search****');
	let schedulerSearchJob = new CronJob(rendomSchedulerSearchTennis, () => {
		try {
			schedulerSearchJob.setTime(new CronTime(
				rc.some('seconds').between(
					schedulerSearchTableTennis.before,
					schedulerSearchTableTennis.after
				).generate()
			));
			// searchTennis();
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
if (rendomSchedulerCheckingResults) {
	log.info('****start scheduler checking results****');
	let schedulerCheckingResultsJob = new CronJob(rendomSchedulerCheckingResults, () => {
		try {
			if (process.env.NODE_ENV !== 'development') {
				checkingResults(football.getStatistic, football.setStatistic, numericalDesignationFootball);
				/*checkingResults(tableTennis.getStatistic, tableTennis.setStatistic, numericalDesignationTableTennis);
				checkingResults(tennis.getStatistic, tennis.setStatistic, numericalDesignationTennis);*/
			}
		} catch (error) {
			schedulerCheckingResultsJob.stop();
			log.error(`cron pattern not valid: ${error}`);
		}
	}, null, true);
}

console.log('NODE_ENV', process.env.NODE_ENV);