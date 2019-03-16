const {log} = require('../../utils/logger');
const {newStatistic, setStatistic} = require('../../storage/tableTennis');
const {getExpandedMatch} = require('../../fetch');
const config = require('config');
const {matchRate} = require('../../matchRate');
const {searchHelper} = require('../../modifiableFile');

const active = config.parser.active;
const urlFootballExpandedRate = config.get(`parser.${active[0]}.live.tableTennis.expandedRate`);

const before = config.choice.live.tableTennis.time.before;
const after = config.choice.live.tableTennis.time.after;

const rateStrategyOne = config.choice.live.tableTennis.strategyOne.rate;
const typeRate = config.choice.live.tableTennis.typeRate;

/**
 * Общая стратегия для Live футбола
 *
 * @param {Object} param объект с параметрами матча
 */
function tableTennisLiveStrategy(param) {
	if ((param.p1 !== '') && (param.p2 !== '')) {
		if (param.set === 1) {
			// фора больше
			if ((param.score.sc1 + param.score.sc2) === 0) {
				footballLiveStrategyOne(param);
			}
		}
	}
}

/**
 * Стратегия гол лузера
 *
 * @param {Object} param объект с параметрами матча
 */
function footballLiveStrategyOne(param) {
	const strategy = 1;
	if ((Math.abs(param.p1 - param.p2) <= rateStrategyOne)) {
		saveRate(param, strategy)// пропускает дальше если запись ушла в БД
			.then(async (statistic) => {
				if (statistic !== null) {
					await setSnapshot(param.matchId, strategy, -2, 1);
					log.debug(`Найден ${param.matchId}: Настольный тенис - стратегия ${strategy}`);
					matchRate({...param, strategy: strategy});
				}
			})
			.catch((error) => {
				log.error(`footballLiveStrategyOne: ${error.message}`);
			});
	}
}

/**
 * Метод для изменения начальных параметров карточек.
 *
 * @param {number} matchId матча
 * @param {Number} strategy стратегия ставок
 * @param {Number} total коэффициент ставоки
 * @param {Number} index значение ставоки
 * @returns {Promise<Promise<any>|*>}
 */
async function setSnapshot(matchId, strategy, total = undefined, index = undefined) {
	const item = await getExpandedMatch(urlFootballExpandedRate.replace('${id}', matchId));
	const param = searchHelper['getParams'](item, true);
	const desiredTotal = total || param.underTotal.reduce((acc, current) => {
		if (current.key === typeRate[strategy]) {
			acc = current.value;
		}
		return acc;
	}, undefined);
	const desiredIndex = index || param.underTotal.reduce((acc, current) => {
		if (current.key === typeRate[strategy]) {
			acc = current.value;
		}
		return acc;
	}, undefined);
	return setStatistic({
		matchId: param.matchId,
		strategy: strategy,
		total: desiredTotal,
		index: desiredIndex, // результат ставки.
		cards: {
			before: param.cards
		},
		modifiedBy: new Date().toISOString()
	});
}

/**
 * Метод для создании записи в бд.
 *
 * @param {Object} param объект с параметрами матча
 * @param {Number} strategy стратегия ставок
 * @returns {Promise<any | never>}
 */
function saveRate(param, strategy) {
	return newStatistic({
		matchId: param.matchId, // id матча
		score: param.score, // счет матча
		command: param.command,
		group: param.group,
		strategy: strategy, // стратегия
		snapshot: {
			start: {
				time: param.time,
				p1: param.p1,
				x: param.x,
				p2: param.p2,
				mod: Math.abs(param.p1 - param.p2),
			}
		},
		createdBy: new Date().toISOString(),
		modifiedBy: new Date().toISOString()
	}).catch((error) => {
		log.error(`saveRate: ${error.message}`);
		throw new Error(error);
	});
}

module.exports = {
	tableTennisLiveStrategy
};