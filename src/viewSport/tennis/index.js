const {log} = require('../../utils/logger');
const {newStatistic, deleteStatistic, setStatistic} = require('../../storage/tennis');
const {getExpandedMatch} = require('../../fetch');
const config = require('config');
const {matchRate} = require('../../matchRate');
const {getScoreToSet} = require('../../utils/searchHelper');
const {searchHelper} = require('../../modifiableFile');

const active = config['parser'].active;
const urlFootballExpandedRate = config.parser[`${active[0]}`].live['tennis']['expandedRate'];
const typeRate = config['choice'].live.tennis.typeRate;

/**
 * Общая стратегия для Live большого тениса
 *
 * @param {Object} param объект с параметрами матча
 */
function tennisLiveStrategy(param) {
	if (param.currentSet === 2) {
		const setOne = param.set.get(1);
		const setTwo = param.set.get(2);
		if ((setOne.sc1 + setOne.sc2) === 13) {
			if ((setTwo.sc1 + setTwo.sc2) > 3) {
				if (Math.abs(setTwo.sc1 - setTwo.sc2) < 2) {
					tennisLiveStrategyOne(param);
				}
			}
		}
	}
}

/**
 * Стратегия 1
 *
 * @param {Object} param объект с параметрами матча
 */
function tennisLiveStrategyOne(param) {
	const strategy = 1;
	if(!param.command.en.one.includes('/')){
		saveRate(param, strategy)// пропускает дальше если запись ушла в БД
			.then(async (statistic) => {
				if (statistic !== null) {
					log.debug(`Найден ${param.matchId}: Тенис - стратегия ${strategy}`);
					// await setSnapshot(param.matchId, strategy);
					matchRate({...param, strategy}, 'tennis');
				}
			})
			.catch((error) => {
				log.error(`tennisLiveStrategyOne: ${error.message}`);
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
	try {
		let item = await getExpandedMatch(urlFootballExpandedRate.replace('${id}', matchId));
		const param = searchHelper['getParams'](item, true);
		const key = typeRate[strategy];
		const desiredTotal = total || param.total.under.reduce((acc, current) => {
			if (current.key === key) {
				acc = current.value;
			}
			return acc;
		}, undefined);
		const desiredIndex = index || param.total.under.reduce((acc, current) => {
			if (current.key === key) {
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
			rate: param.rate,
			modifiedBy: new Date().toISOString()
		});
	} catch (error) {
		log.error(`Set snapshot: ${error}`);
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
 * Метод для создании записи в бд.
 *
 * @param {Object} param объект с параметрами матча
 * @param {Number} strategy стратегия ставок
 * @returns {Promise<any | never>}
 */
function saveRate(param, strategy) {
	return newStatistic({
		matchId: param.matchId, // id матча
		score: getScoreToSet(param.set, 2), // счет матча во 2 сете
		command: param.command,
		group: param.group,
		strategy: strategy, // стратегия
		snapshot: {
			start: {
				p1: param.p1,
				p2: param.p2,
				mod: Math.abs(param.p2 - param.p1),
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
	tennisLiveStrategy
};