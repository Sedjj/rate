const {CronJob, CronTime} = require('cron');
const {log} = require('../utils/logger');
const config = require('config');
const rc = require('../utils/random-cron');
const {setStatistic, deleteStatistic} = require('../storage/statistic');
const {getExpandedMatch} = require('../fetch');
const {equalsScore} = require('../utils/searchHelper');
const {matchRate} = require('../matchRate');
const {searchHelper} = require('../modifiableFile');

const active = config.get('parser.active');
const urlFootballExpandedRate = config.get(`parser.${active[0]}.live.football.expandedRate`);
const largerAfter = config.get('choice.live.football.time.larger.after');
const lessAfter = config.get('choice.live.football.time.less.after');
const totalStrategy = config.get('choice.live.football.total');
const typeRate = config.get('choice.live.football.typeRate');
const waitingInterval = process.env.NODE_ENV === 'development'
	? rc.some('seconds').between(10, 20).generate()
	: rc.some('seconds').between(
		config.get('cron.waitingInterval.before'),
		config.get('cron.waitingInterval.after')
	).generate();

let waitingEndCount = 0;

/**
 * Метод для мониторинга Total.
 *
 * @param {Object} param объект с параметрами матча
 * @param {Number} strategy стратегия
 */
function waiting(param, strategy) {
	let reboot = false;
	waitingEndCount++;
	log.debug(`Всего в очереди на окончание матча: ${waitingEndCount}`);
	let waitingIntervalJob = new CronJob(waitingInterval, async () => {
		try {
			const indexMatch = await searchIndex(param.matchId, strategy, param.score);
			if (indexMatch !== null) {
				reboot = false;
				log.debug(`Матч ${param.matchId}: total= ${indexMatch}`);
				waitingEndCount--;
				log.debug(`Всего в очереди на окончание матча осталось: ${waitingEndCount}`);
				waitingIntervalJob.stop();
			} else {
				reboot = true;
				waitingIntervalJob.setTime(new CronTime(
					rc.some('seconds').between(
						config.get('cron.waitingInterval.before'),
						config.get('cron.waitingInterval.after')
					).generate()
				));
			}
		} catch (error) {
			reboot = false;
			waitingEndCount--;
			log.error(`waiting id:${JSON.stringify(param)}, strategy:${strategy}, oldScore:${JSON.stringify(param.score)}`);
			log.debug(`Всего в очереди на окончание матча осталось: ${waitingEndCount}`);
			waitingIntervalJob.stop();
		}
	}, () => {
		if (reboot) {
			waitingIntervalJob.start();
		}
	}, true);
}

/**
 * сохраняем матч и проверяем ставки
 *
 * находим ставку с определенным Total = (sc1+sc1+1)
 * если нет Total -> крон на ожидание 2 мин
 *
 * если есть Total - то сравниваем с 1,3 для первой и 1,5 для второй иначе снова ждем
 *
 * если счет изменился то выходим и в бд пишем 1 и не отслеживаем конец матча
 *
 * @param {Number} matchId матча
 * @param {Number} strategy стратегия
 * @param {Object} oldScore старый счет матча
 * @returns {Promise<Number | null>}
 */
async function searchIndex(matchId, strategy, oldScore) {
	try {
		const item = await getExpandedMatch(urlFootballExpandedRate.replace('${id}', matchId));
		let index = null;
		const param = searchHelper['getParams'](item, true);
		if (equalsScore(oldScore, param.score) && (param.time <= largerAfter)) { //не изменился ли счет и не вышло ли за ределы время
			const total = param.score.sc1 + param.score.sc2 + typeRate[strategy];
			index = await searchHelper['searchTotal'](item, total, totalStrategy[strategy]);
			if (index !== null) {
				await setTotalRate(index, param, strategy);
				setIndexRate(index, param, strategy);
			}
		} else {
			setTotalRate(-1, param, strategy);
			index = -1;
		}
		return index;
	} catch (error) {
		log.error(`searchIndex id: ${matchId}`);
		deleteStatistic({
			matchId: matchId,
			strategy: strategy
		}).then(() => {
			log.debug(`Матч ${matchId} удален`);
		}).catch((errors) => {
			log.error(`deleteStatistic: ${errors.message}`);
		});
		throw new Error(error);
	}
}

/**
 * Метод для изменения ставки.
 *
 * @param {Number} index результат ставки
 * @param {Object} param объект с параметрами матча
 * @param {Number} strategy стратегия ставок
 */
function setIndexRate(index = 1, param, strategy) {
	return setStatistic({
		matchId: param.matchId,
		strategy: strategy,
		index: index, // тип ставки.
		cards: {
			after: param.cards
		},
		modifiedBy: new Date().toISOString()
	}).then(async (statistic) => {
		if (statistic !== null) {
			await matchRate(statistic);
		}
	}).catch((error) => {
		log.error(`setTotalRate: ${error.message}`);
		throw new Error(error);
	});
}

/**
 * Метод для изменения ставки.
 *
 * @param {Number} total коэфф ставки
 * @param {Object} param объект с параметрами матча
 * @param {Number} strategy стратегия ставок
 */
function setTotalRate(total = -2, param, strategy) {
	return setStatistic({
		matchId: param.matchId,
		strategy: strategy,
		total: total,
		snapshot: {
			end: {
				time: param.time,
				p1: param.p1,
				x: param.x,
				p2: param.p2,
				mod: Math.abs(param.p1 - param.p2),
			}
		},
		modifiedBy: new Date().toISOString()
	});
}

module.exports = {
	waiting
};