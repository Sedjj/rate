const {CronJob, CronTime} = require('cron');
const {log} = require('../utils/logger');
const config = require('config');
const rc = require('../utils/random-cron');
const {setStatistic, deleteStatistic} = require('../storage/football');
const {getExpandedMatch} = require('../fetch');
const {equalsScore} = require('../utils/searchHelper');
const {matchRate} = require('../matchRate');
const {searchHelper} = require('../modifiableFile');
const {counterWaiting} = require('../store/counterWaiting');

const active = config.parser.active;
const waitingInterval = {
	title: 'в секундах',
	before: 20,
	after: 60
};
const urlFootballExpandedRate = config.parser[`${active[0]}`].live['football']['expandedRate'];
const time = config.choice.live.football.time;
const totalStrategy = config.choice.live.football.total;
const typeRate = config.choice.live.football.typeRate;
const rendomWaitingInterval = process.env.NODE_ENV === 'development'
	? rc.some('seconds').between(10, 20).generate()
	: rc.some('seconds').between(
		waitingInterval.before,
		waitingInterval.after
	).generate();

/**
 * Метод для мониторинга Total.
 *
 * @param {Object} param объект с параметрами матча
 * @param {Number} strategy стратегия
 */
function waiting(param, strategy) {
	let reboot = false;
	/**
	 * Проверка что запрос на сервер выпонился, для избежания дублирование действий.
	 *
	 * @type {boolean}
	 */
	let waiting = true;
	counterWaiting.increment();
	let waitingIntervalJob = new CronJob(rendomWaitingInterval, async () => {
		try {
			if (waiting) {
				waiting = false;
				const indexMatch = await searchIndex(param.matchId, strategy, param.score);
				waiting = true;
				if (indexMatch !== null) {
					reboot = false;
					log.debug(`Матч ${param.matchId}: total= ${indexMatch}`);
					counterWaiting.decrement();
					waitingIntervalJob.stop();
				} else {
					reboot = true;
					waitingIntervalJob.setTime(new CronTime(
						rc.some('seconds').between(
							waitingInterval.before,
							waitingInterval.after
						).generate()
					));
				}
			}
		} catch (error) {
			reboot = false;
			counterWaiting.decrement();
			log.error(`waiting id:${JSON.stringify(param)}, strategy:${strategy}, oldScore:${JSON.stringify(param.score)}, error -> ${error}`);
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
		// log.debug(`${matchId} param.time -> ${param.time}; time[strategy].after -> ${time[strategy].after}`);
		// log.debug(`${matchId} oldScore -> ${JSON.stringify(oldScore)}; param.score -> ${JSON.stringify(param.score)}`);
		if (equalsScore(oldScore, param.score) && (param.time <= time[strategy].after)) { //не изменился ли счет и не вышло ли за ределы время
			const total = param.score.sc1 + param.score.sc2 + typeRate[strategy];
			// log.debug(`${matchId} total -> ${total}; totalStrategy -> ${totalStrategy[strategy]} sc1:sc2 -> ${param.score.sc1}:${param.score.sc2}`);
			index = await searchHelper['searchTotal'](item, total, totalStrategy[strategy]);
			// log.debug(`${matchId} index -> ${index}`);
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
		log.error(`Search index id: ${matchId}, error -> ${error}`);
		deleteStatistic({
			matchId: matchId,
			strategy: strategy
		}).then(() => {
			log.debug(`Матч ${matchId} - статегия ${strategy} -> удален`);
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
	// log.debug(`${param.matchId} index -> ${index}; param -> ${JSON.stringify(param)}`);
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
			await matchRate(statistic, 'футбол');
		}
	}).catch((error) => {
		log.error(`Set total rate: ${error.message}`);
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