process.env.NTBA_FIX_319 = 1;
const {CronJob, CronTime} = require('cron');
require('./utils/dbProvider');
if (process.env.NODE_ENV !== 'development') {
	require('./telegram/bot');
}
const rc = require('./utils/random-cron');
const config = require('config');
const {log} = require('./utils/logger');
const football = require('./storage/football');
const tennis = require('./storage/tennis');
const {sendMessageSupport} = require('./telegram/api');
const {bot: {performEmulation}} = require('./selenium/bot');
const {searchFootball, searchTennis} = require('./searchMatch');
const {checkingResults} = require('./checkingResults');

const numericalDesignationFootball = config.choice.live.football.numericalDesignation;
const numericalDesignationTennis = config.choice.live.tennis.numericalDesignation;

/*performEmulation('205711926', 9, `Total Over ${2.5}`);*/

const schedulerSearchFootball = {
	title: 'в секундах',
	before: 150,
	after: 250
};

const schedulerSearchTennis = {
	title: 'в секундах',
	before: 25,
	after: 45
};

const rendomSchedulerSearchFootball = process.env.NODE_ENV === 'development'
	? rc.some('seconds').between(20, 60).generate()
	: rc.some('seconds').between(
		schedulerSearchFootball.before,
		schedulerSearchFootball.after
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
	log.info('****start scheduler search football****');
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
 * Планировшик поиска матчей по тенису.
 */
if (rendomSchedulerSearchTennis) {
	log.info('****start scheduler search tennis****');
	let schedulerSearchJob = new CronJob(rendomSchedulerSearchTennis, () => {
		try {
			schedulerSearchJob.setTime(new CronTime(
				rc.some('seconds').between(
					schedulerSearchTennis.before,
					schedulerSearchTennis.after
				).generate()
			));
			searchTennis();
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
				checkingResults(tennis.getStatistic, tennis.setStatistic, numericalDesignationTennis);
			}
		} catch (error) {
			schedulerCheckingResultsJob.stop();
			log.error(`cron pattern not valid: ${error}`);
		}
	}, null, true);
}

console.log('NODE_ENV', process.env.NODE_ENV);
sendMessageSupport('Start the rate bet');